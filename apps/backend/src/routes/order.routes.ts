import { Router, Response } from 'express';
import { body } from 'express-validator';
import { query, queryOne } from '../db/pool';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { logger } from '../utils/logger';

const router = Router();

// GET /orders — list orders for current user
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { status, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.min(50, parseInt(String(limit), 10));
    const offset = (pageNum - 1) * limitNum;

    const isAdmin = req.user!.role === 'admin';
    const isFarmer = req.user!.role === 'farmer';
    const isBuyer = req.user!.role === 'buyer';

    let whereClause = '';
    const params: unknown[] = [];

    if (!isAdmin) {
      if (isFarmer) whereClause = 'WHERE o.farmer_id = $1';
      else whereClause = 'WHERE o.buyer_id = $1';
      params.push(req.user!.id);
    }

    let idx = params.length + 1;
    if (status) {
      whereClause += `${whereClause ? ' AND' : 'WHERE'} o.status = $${idx++}`;
      params.push(status);
    }

    params.push(limitNum, offset);

    const orders = await query(
      `SELECT o.id, o.order_number, o.status, o.payment_status,
              o.quantity, o.quantity_unit, o.unit_price, o.total_amount,
              o.delivery_type, o.created_at,
              p.title AS product_title, p.thumbnail_url AS product_image,
              buyer.full_name AS buyer_name, buyer.avatar_url AS buyer_avatar,
              farmer.full_name AS farmer_name, farmer.avatar_url AS farmer_avatar,
              a.id AS auction_id
       FROM orders o
       JOIN products p ON p.id = o.product_id
       JOIN users buyer ON buyer.id = o.buyer_id
       JOIN users farmer ON farmer.id = o.farmer_id
       LEFT JOIN auctions a ON a.id = o.auction_id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    return res.json({ orders });
  } catch (err) {
    logger.error('List orders error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// GET /orders/:id
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const order = await queryOne(
      `SELECT o.*,
              p.title AS product_title, p.thumbnail_url AS product_image,
              p.images AS product_images,
              buyer.full_name AS buyer_name, buyer.avatar_url AS buyer_avatar,
              buyer.email AS buyer_email, buyer.phone AS buyer_phone,
              farmer.full_name AS farmer_name, farmer.avatar_url AS farmer_avatar,
              farmer.email AS farmer_email,
              fp.farm_name, fp.farm_location_text
       FROM orders o
       JOIN products p ON p.id = o.product_id
       JOIN users buyer ON buyer.id = o.buyer_id
       JOIN users farmer ON farmer.id = o.farmer_id
       LEFT JOIN farmer_profiles fp ON fp.user_id = o.farmer_id
       WHERE o.id = $1`,
      [req.params.id]
    );

    if (!order) return res.status(404).json({ error: 'Order not found' });

    const o = order as { buyer_id: string; farmer_id: string };
    if (
      req.user!.role !== 'admin' &&
      o.buyer_id !== req.user!.id &&
      o.farmer_id !== req.user!.id
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Tracking history
    const tracking = await query(
      `SELECT ot.*, u.full_name AS updated_by_name
       FROM order_tracking ot
       LEFT JOIN users u ON u.id = ot.created_by
       WHERE ot.order_id = $1 ORDER BY ot.created_at ASC`,
      [req.params.id]
    );

    return res.json({ order, tracking });
  } catch (err) {
    logger.error('Get order error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// POST /orders — create instant buy order
router.post(
  '/',
  authenticate,
  requireRole('buyer'),
  [
    body('product_id').isUUID(),
    body('quantity').isFloat({ min: 0.1 }),
    body('delivery_type').isIn(['pickup', 'delivery']),
  ],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    const { product_id, quantity, delivery_type, delivery_address, notes, coupon_code } = req.body;

    try {
      const product = await queryOne<{
        id: string; farmer_id: string; buy_now_price: number; base_price: number;
        quantity_available: number; quantity_unit: string; status: string;
      }>(
        'SELECT id, farmer_id, buy_now_price, base_price, quantity_available, quantity_unit, status FROM products WHERE id = $1',
        [product_id]
      );

      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.status !== 'active') return res.status(400).json({ error: 'Product not available' });
      if (product.farmer_id === req.user!.id) return res.status(400).json({ error: 'Cannot buy your own product' });
      if (quantity > product.quantity_available) {
        return res.status(400).json({ error: `Only ${product.quantity_available} ${product.quantity_unit} available` });
      }

      const unitPrice = product.buy_now_price || product.base_price;
      const subtotal = parseFloat(String(unitPrice)) * parseFloat(String(quantity));
      const platformFee = subtotal * parseFloat(process.env.PLATFORM_FEE_PERCENT || '2.5') / 100;
      const total = subtotal + platformFee;

      const orders = await query(
        `INSERT INTO orders (buyer_id, farmer_id, product_id, quantity, quantity_unit, unit_price, subtotal, platform_fee, total_amount, status, payment_status, delivery_type, delivery_address, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'pending','pending',$10,$11,$12) RETURNING *`,
        [
          req.user!.id, product.farmer_id, product_id, quantity, product.quantity_unit,
          unitPrice, subtotal, platformFee, total, delivery_type,
          delivery_address ? JSON.stringify(delivery_address) : null, notes
        ]
      );

      return res.status(201).json({ order: orders[0] });
    } catch (err) {
      logger.error('Create order error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to create order' });
    }
  }
);

// PATCH /orders/:id/status
router.patch(
  '/:id/status',
  authenticate,
  [body('status').isIn(['confirmed', 'processing', 'picked_up', 'in_transit', 'delivered', 'cancelled'])],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { status, message, location_text } = req.body;

    try {
      const order = await queryOne<{ farmer_id: string; buyer_id: string; status: string }>(
        'SELECT farmer_id, buyer_id, status FROM orders WHERE id = $1', [id]
      );

      if (!order) return res.status(404).json({ error: 'Order not found' });

      // Role-based status transitions
      const isAdmin = req.user!.role === 'admin';
      const isFarmer = order.farmer_id === req.user!.id;
      const isBuyer = order.buyer_id === req.user!.id;

      const farmerAllowed = ['confirmed', 'processing', 'picked_up'];
      const buyerAllowed = ['cancelled'];

      if (!isAdmin) {
        if (isFarmer && !farmerAllowed.includes(status)) {
          return res.status(403).json({ error: 'Farmers cannot set this status' });
        }
        if (isBuyer && !buyerAllowed.includes(status)) {
          return res.status(403).json({ error: 'Buyers cannot set this status' });
        }
        if (!isFarmer && !isBuyer) {
          return res.status(403).json({ error: 'Access denied' });
        }
      }

      await query('UPDATE orders SET status = $1 WHERE id = $2', [status, id]);
      await query(
        `INSERT INTO order_tracking (order_id, status, message, location_text, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [id, status, message, location_text, req.user!.id]
      );

      return res.json({ message: 'Order status updated' });
    } catch (err) {
      logger.error('Update order status error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to update status' });
    }
  }
);

export default router;
