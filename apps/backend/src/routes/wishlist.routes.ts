import { Router } from 'express';
import { query, queryOne } from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// GET /wishlist
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const items = await query(
      `SELECT w.id, w.product_id, w.price_alert_threshold, w.created_at,
              p.title, p.thumbnail_url, p.buy_now_price, p.base_price,
              p.quantity_available, p.quantity_unit, p.status,
              a.ends_at AS auction_ends_at, a.current_bid, a.status AS auction_status
       FROM wishlists w
       JOIN products p ON p.id = w.product_id
       LEFT JOIN auctions a ON a.product_id = p.id
       WHERE w.user_id = $1
       ORDER BY w.created_at DESC`,
      [req.user!.id]
    );
    return res.json({ items });
  } catch (err) {
    logger.error('Get wishlist error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

// POST /wishlist
router.post('/', authenticate, async (req: AuthRequest, res) => {
  const { product_id, price_alert_threshold } = req.body;
  if (!product_id) return res.status(422).json({ error: 'product_id required' });

  try {
    const existing = await queryOne(
      'SELECT id FROM wishlists WHERE user_id = $1 AND product_id = $2',
      [req.user!.id, product_id]
    );
    if (existing) return res.status(409).json({ error: 'Already in wishlist' });

    await query(
      'INSERT INTO wishlists (user_id, product_id, price_alert_threshold) VALUES ($1,$2,$3)',
      [req.user!.id, product_id, price_alert_threshold || null]
    );
    return res.status(201).json({ message: 'Added to wishlist' });
  } catch (err) {
    logger.error('Add to wishlist error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

// DELETE /wishlist/:productId
router.delete('/:productId', authenticate, async (req: AuthRequest, res) => {
  try {
    await query(
      'DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2',
      [req.user!.id, req.params.productId]
    );
    return res.json({ message: 'Removed from wishlist' });
  } catch (err) {
    logger.error('Remove wishlist error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

export default router;
