import { Router, Response } from 'express';
import { body } from 'express-validator';
import { query, queryOne } from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { logger } from '../utils/logger';

const router = Router();

// GET /reviews — reviews for a user or product
router.get('/', async (req, res: Response) => {
  try {
    const { user_id, product_id, page = '1', limit = '10' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.min(50, parseInt(String(limit), 10));
    const offset = (pageNum - 1) * limitNum;

    if (!user_id && !product_id) {
      return res.json({ reviews: [], stats: { avg_rating: 0, total: 0 } });
    }

    const condition = user_id ? 'r.reviewee_id = $1' : 'r.product_id = $1';
    const param = user_id || product_id;

    const reviews = await query(
      `SELECT r.id, r.rating, r.title, r.content, r.photos, r.is_verified_purchase, r.created_at,
              u.full_name AS reviewer_name, u.avatar_url AS reviewer_avatar
       FROM reviews r
       JOIN users u ON u.id = r.reviewer_id
       WHERE ${condition} AND r.is_approved = true
       ORDER BY r.created_at DESC
       LIMIT $2 OFFSET $3`,
      [param, limitNum, offset]
    );

    const stats = await queryOne<{ avg_rating: number; total: number }>(
      `SELECT ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS total
       FROM reviews WHERE ${condition} AND is_approved = true`,
      [param]
    );

    return res.json({ reviews, stats });
  } catch (err) {
    logger.error('Get reviews error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /reviews
router.post(
  '/',
  authenticate,
  [
    body('reviewee_id').isUUID(),
    body('rating').isInt({ min: 1, max: 5 }),
    body('content').optional().trim().isLength({ max: 1000 }),
  ],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    const { reviewee_id, order_id, product_id, rating, title, content, photos } = req.body;

    try {
      // Prevent self-review
      if (reviewee_id === req.user!.id) {
        return res.status(400).json({ error: 'Cannot review yourself' });
      }

      // Verify purchase if order_id given
      let isVerified = false;
      if (order_id) {
        const order = await queryOne<{ id: string }>(
          `SELECT id FROM orders WHERE id = $1 AND buyer_id = $2 AND status = 'delivered'`,
          [order_id, req.user!.id]
        );
        isVerified = !!order;
      }

      const reviews = await query(
        `INSERT INTO reviews (reviewer_id, reviewee_id, order_id, product_id, rating, title, content, photos, is_verified_purchase)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
        [req.user!.id, reviewee_id, order_id || null, product_id || null, rating, title, content, photos || [], isVerified]
      );

      // Update farmer/buyer avg rating
      await query(
        `UPDATE farmer_profiles SET avg_rating = (
           SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE reviewee_id = $1 AND is_approved = true
         ), total_reviews = (
           SELECT COUNT(*) FROM reviews WHERE reviewee_id = $1 AND is_approved = true
         ) WHERE user_id = $1`,
        [reviewee_id]
      );

      return res.status(201).json({ review: reviews[0] });
    } catch (err) {
      logger.error('Create review error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to create review' });
    }
  }
);

export default router;
