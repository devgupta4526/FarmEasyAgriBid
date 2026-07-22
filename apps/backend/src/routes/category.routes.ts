import { Router } from 'express';
import { query } from '../db/pool';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const categories = await query(
      `SELECT id, name, slug, description, icon_url, parent_id, sort_order
       FROM categories WHERE is_active = true ORDER BY sort_order, name`
    );
    return res.json({ categories });
  } catch (err) {
    logger.error('Get categories error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
