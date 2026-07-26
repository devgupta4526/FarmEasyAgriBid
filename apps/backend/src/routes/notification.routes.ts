import { Router, Response } from 'express';
import { query, queryOne } from '../db/pool';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// GET /notifications
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { unread_only, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.min(50, parseInt(String(limit), 10));
    const offset = (pageNum - 1) * limitNum;

    const whereClause = unread_only === 'true'
      ? 'WHERE user_id = $1 AND is_read = false'
      : 'WHERE user_id = $1';

    const notifications = await query(
      `SELECT id, type, title, body, data, is_read, read_at, action_url, created_at
       FROM notifications
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.id, limitNum, offset]
    );

    const unreadCount = await queryOne<{ count: string }>(
      'SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false',
      [req.user!.id]
    );

    return res.json({
      notifications,
      unread_count: parseInt(unreadCount?.count || '0', 10),
    });
  } catch (err) {
    logger.error('Get notifications error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /notifications/:id/read
router.patch('/:id/read', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await query(
      'UPDATE notifications SET is_read = true, read_at = NOW() WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.id]
    );
    return res.json({ message: 'Marked as read' });
  } catch (err) {
    logger.error('Mark notification read error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to update notification' });
  }
});

// PATCH /notifications/read-all
router.patch('/read-all', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    await query(
      'UPDATE notifications SET is_read = true, read_at = NOW() WHERE user_id = $1 AND is_read = false',
      [req.user!.id]
    );
    return res.json({ message: 'All notifications marked as read' });
  } catch (err) {
    logger.error('Read all notifications error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to update notifications' });
  }
});

export default router;
