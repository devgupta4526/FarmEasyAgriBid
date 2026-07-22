import { Router } from 'express';
import { body } from 'express-validator';
import { query, queryOne, withTransaction } from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { logger } from '../utils/logger';
import { getIO } from '../socket/socket';

const router = Router();

// GET /chat/rooms
router.get('/rooms', authenticate, async (req: AuthRequest, res) => {
  try {
    const rooms = await query(
      `SELECT cr.id, cr.last_message_at, cr.product_id, cr.order_id,
              u1.id AS p1_id, u1.full_name AS p1_name, u1.avatar_url AS p1_avatar,
              u2.id AS p2_id, u2.full_name AS p2_name, u2.avatar_url AS p2_avatar,
              (SELECT cm.content FROM chat_messages cm WHERE cm.room_id = cr.id AND cm.deleted_at IS NULL ORDER BY cm.created_at DESC LIMIT 1) AS last_message,
              (SELECT COUNT(*) FROM chat_messages cm WHERE cm.room_id = cr.id AND cm.is_read = false AND cm.sender_id != $1) AS unread_count
       FROM chat_rooms cr
       JOIN users u1 ON u1.id = cr.participant_1
       JOIN users u2 ON u2.id = cr.participant_2
       WHERE cr.participant_1 = $1 OR cr.participant_2 = $1
       ORDER BY cr.last_message_at DESC NULLS LAST`,
      [req.user!.id]
    );
    return res.json({ rooms });
  } catch (err) {
    logger.error('Get chat rooms error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// POST /chat/rooms — start or get chat
router.post(
  '/rooms',
  authenticate,
  [body('recipient_id').isUUID()],
  validateRequest,
  async (req: AuthRequest, res) => {
    const { recipient_id, product_id, order_id } = req.body;
    const myId = req.user!.id;

    if (recipient_id === myId) {
      return res.status(400).json({ error: 'Cannot chat with yourself' });
    }

    try {
      // Check if room exists
      const existing = await queryOne<{ id: string }>(
        `SELECT id FROM chat_rooms
         WHERE (participant_1 = $1 AND participant_2 = $2)
            OR (participant_1 = $2 AND participant_2 = $1)`,
        [myId, recipient_id]
      );

      if (existing) return res.json({ room: existing });

      const rooms = await query(
        `INSERT INTO chat_rooms (participant_1, participant_2, product_id, order_id)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [myId, recipient_id, product_id || null, order_id || null]
      );
      return res.status(201).json({ room: rooms[0] });
    } catch (err) {
      logger.error('Create chat room error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to create room' });
    }
  }
);

// GET /chat/rooms/:id/messages
router.get('/rooms/:id/messages', authenticate, async (req: AuthRequest, res) => {
  try {
    // Verify participant
    const room = await queryOne<{ participant_1: string; participant_2: string }>(
      'SELECT participant_1, participant_2 FROM chat_rooms WHERE id = $1', [req.params.id]
    );
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.participant_1 !== req.user!.id && room.participant_2 !== req.user!.id) {
      return res.status(403).json({ error: 'Not a participant' });
    }

    const { before, limit = 50 } = req.query as Record<string, string>;
    const limitNum = Math.min(100, parseInt(limit, 10));

    const messages = await query(
      `SELECT cm.id, cm.content, cm.media_url, cm.media_type, cm.is_read, cm.created_at,
              u.id AS sender_id, u.full_name AS sender_name, u.avatar_url AS sender_avatar
       FROM chat_messages cm
       JOIN users u ON u.id = cm.sender_id
       WHERE cm.room_id = $1 AND cm.deleted_at IS NULL
         ${before ? `AND cm.created_at < $3` : ''}
       ORDER BY cm.created_at DESC
       LIMIT $2`,
      before ? [req.params.id, limitNum, before] : [req.params.id, limitNum]
    );

    // Mark as read
    await query(
      `UPDATE chat_messages SET is_read = true, read_at = NOW()
       WHERE room_id = $1 AND sender_id != $2 AND is_read = false`,
      [req.params.id, req.user!.id]
    );

    return res.json({ messages: messages.reverse() });
  } catch (err) {
    logger.error('Get messages error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// POST /chat/rooms/:id/messages
router.post(
  '/rooms/:id/messages',
  authenticate,
  [body('content').optional().trim().isLength({ max: 2000 })],
  validateRequest,
  async (req: AuthRequest, res) => {
    const { content, media_url, media_type } = req.body;

    if (!content && !media_url) {
      return res.status(422).json({ error: 'Message content or media required' });
    }

    try {
      const room = await queryOne<{ participant_1: string; participant_2: string }>(
        'SELECT participant_1, participant_2 FROM chat_rooms WHERE id = $1', [req.params.id]
      );
      if (!room) return res.status(404).json({ error: 'Room not found' });
      if (room.participant_1 !== req.user!.id && room.participant_2 !== req.user!.id) {
        return res.status(403).json({ error: 'Not a participant' });
      }

      const messages = await query(
        `INSERT INTO chat_messages (room_id, sender_id, content, media_url, media_type)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [req.params.id, req.user!.id, content || null, media_url || null, media_type || null]
      );

      await query(
        'UPDATE chat_rooms SET last_message_at = NOW() WHERE id = $1', [req.params.id]
      );

      const message = messages[0];

      // Emit real-time
      const io = getIO();
      if (io) {
        io.to(`chat:${req.params.id}`).emit('new_message', {
          ...message,
          sender_id: req.user!.id,
        });
      }

      return res.status(201).json({ message });
    } catch (err) {
      logger.error('Send message error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to send message' });
    }
  }
);

export default router;
