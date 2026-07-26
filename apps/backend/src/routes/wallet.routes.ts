import { Router, Response } from 'express';
import { query, queryOne } from '../db/pool';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// GET /wallet — my wallet
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const wallet = await queryOne(
      'SELECT id, balance, escrow_balance, reward_balance, total_credited, total_debited FROM wallets WHERE user_id = $1',
      [req.user!.id]
    );
    if (!wallet) return res.status(404).json({ error: 'Wallet not found' });
    return res.json({ wallet });
  } catch (err) {
    logger.error('Get wallet error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch wallet' });
  }
});

// GET /wallet/transactions
router.get('/transactions', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.min(50, parseInt(String(limit), 10));
    const offset = (pageNum - 1) * limitNum;

    const transactions = await query(
      `SELECT wt.id, wt.type, wt.amount, wt.balance_before, wt.balance_after,
              wt.description, wt.reference_type, wt.created_at
       FROM wallet_transactions wt
       WHERE wt.user_id = $1
       ORDER BY wt.created_at DESC
       LIMIT $2 OFFSET $3`,
      [req.user!.id, limitNum, offset]
    );

    return res.json({ transactions });
  } catch (err) {
    logger.error('Get transactions error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

export default router;
