import { Router } from 'express';
import { query, queryOne } from '../db/pool';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// GET /logistics/deliveries — driver's deliveries
router.get('/deliveries', authenticate, requireRole('logistics'), async (req: AuthRequest, res) => {
  try {
    const { status } = req.query as Record<string, string>;
    const deliveries = await query(
      `SELECT d.*,
              o.order_number, o.total_amount, o.buyer_id,
              p.title AS product_title,
              buyer.full_name AS buyer_name, buyer.phone AS buyer_phone
       FROM deliveries d
       JOIN orders o ON o.id = d.order_id
       JOIN products p ON p.id = o.product_id
       JOIN users buyer ON buyer.id = o.buyer_id
       WHERE d.driver_id = $1 ${status ? 'AND d.status = $2' : ''}
       ORDER BY d.created_at DESC`,
      status ? [req.user!.id, status] : [req.user!.id]
    );
    return res.json({ deliveries });
  } catch (err) {
    logger.error('Get deliveries error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch deliveries' });
  }
});

// PATCH /logistics/deliveries/:id/location — driver updates location
router.patch(
  '/deliveries/:id/location',
  authenticate,
  requireRole('logistics'),
  async (req: AuthRequest, res) => {
    const { latitude, longitude } = req.body;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(422).json({ error: 'latitude and longitude required' });
    }

    try {
      const delivery = await queryOne<{ driver_id: string; order_id: string }>(
        'SELECT driver_id, order_id FROM deliveries WHERE id = $1', [req.params.id]
      );
      if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
      if (delivery.driver_id !== req.user!.id) return res.status(403).json({ error: 'Not your delivery' });

      await query(
        `UPDATE deliveries SET driver_latitude = $1, driver_longitude = $2, last_location_update = NOW()
         WHERE id = $3`,
        [latitude, longitude, req.params.id]
      );

      // Emit to order tracking room
      const { getIO } = await import('../socket/socket');
      const io = getIO();
      if (io) {
        io.to(`order:${delivery.order_id}`).emit('driver_location_update', {
          lat: latitude, lng: longitude, timestamp: new Date()
        });
      }

      return res.json({ message: 'Location updated' });
    } catch (err) {
      logger.error('Update driver location error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to update location' });
    }
  }
);

// PATCH /logistics/deliveries/:id/status
router.patch(
  '/deliveries/:id/status',
  authenticate,
  requireRole('logistics', 'admin'),
  async (req: AuthRequest, res) => {
    const { status, notes } = req.body;
    const validStatuses = ['accepted', 'picked_up', 'in_transit', 'delivered', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(422).json({ error: 'Invalid status' });
    }

    try {
      const updates: Record<string, string> = {
        status,
        driver_notes: notes || null,
      };

      if (status === 'picked_up') updates.actual_pickup_at = 'NOW()';
      if (status === 'delivered') updates.actual_delivery_at = 'NOW()';

      await query(
        `UPDATE deliveries SET status = $1, driver_notes = $2,
         actual_pickup_at = CASE WHEN $1 = 'picked_up' THEN NOW() ELSE actual_pickup_at END,
         actual_delivery_at = CASE WHEN $1 = 'delivered' THEN NOW() ELSE actual_delivery_at END
         WHERE id = $3`,
        [status, notes || null, req.params.id]
      );

      return res.json({ message: 'Delivery status updated' });
    } catch (err) {
      logger.error('Update delivery status error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to update delivery status' });
    }
  }
);

export default router;
