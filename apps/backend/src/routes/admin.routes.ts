import { Router, Response } from 'express';
import { query, queryOne } from '../db/pool';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// GET /admin/dashboard
router.get('/dashboard', authenticate, requireRole('admin', 'super_admin'), async (_req, res) => {
  try {
    const [users, products, orders, revenue, auctions] = await Promise.all([
      queryOne<{ total: string; farmers: string; buyers: string; pending: string }>(
        `SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE role = 'farmer') AS farmers,
                COUNT(*) FILTER (WHERE role = 'buyer') AS buyers,
                COUNT(*) FILTER (WHERE status = 'pending') AS pending
         FROM users`
      ),
      queryOne<{ total: string; active: string; sold: string }>(
        `SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'active') AS active,
                COUNT(*) FILTER (WHERE status = 'sold') AS sold
         FROM products`
      ),
      queryOne<{ total: string; pending: string; delivered: string }>(
        `SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'pending') AS pending,
                COUNT(*) FILTER (WHERE status = 'delivered') AS delivered
         FROM orders`
      ),
      queryOne<{ total_revenue: string; monthly_revenue: string }>(
        `SELECT SUM(total_amount) AS total_revenue,
                SUM(total_amount) FILTER (WHERE created_at > date_trunc('month', NOW())) AS monthly_revenue
         FROM orders WHERE status = 'delivered'`
      ),
      queryOne<{ live: string; scheduled: string }>(
        `SELECT COUNT(*) FILTER (WHERE status = 'live') AS live,
                COUNT(*) FILTER (WHERE status = 'scheduled') AS scheduled
         FROM auctions`
      ),
    ]);

    // Monthly orders trend (last 6 months)
    const monthlyTrend = await query(
      `SELECT to_char(date_trunc('month', created_at), 'Mon YYYY') AS month,
              COUNT(*) AS orders, SUM(total_amount) AS revenue
       FROM orders
       WHERE created_at > NOW() - INTERVAL '6 months'
       GROUP BY date_trunc('month', created_at)
       ORDER BY date_trunc('month', created_at)`,
      []
    );

    return res.json({
      stats: { users, products, orders, revenue, auctions },
      monthly_trend: monthlyTrend,
    });
  } catch (err) {
    logger.error('Admin dashboard error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// GET /admin/users
router.get('/users', authenticate, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const { role, status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.min(100, parseInt(String(limit), 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions: string[] = [];
    const params: unknown[] = [];
    let idx = 1;

    if (role) { conditions.push(`u.role = $${idx++}`); params.push(role); }
    if (status) { conditions.push(`u.status = $${idx++}`); params.push(status); }
    if (search) {
      conditions.push(`(u.full_name ILIKE $${idx} OR u.email ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    params.push(limitNum, offset);

    const users = await query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status,
              u.email_verified, u.created_at, u.last_login_at,
              fp.kyc_status AS farmer_kyc_status,
              bp.kyc_status AS buyer_kyc_status
       FROM users u
       LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
       LEFT JOIN buyer_profiles bp ON bp.user_id = u.id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    const countRows = await query<{ count: string }>(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      params.slice(0, -2)
    );

    return res.json({
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: parseInt(countRows[0]?.count || '0', 10),
      },
    });
  } catch (err) {
    logger.error('Admin list users error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /admin/users/:id/status
router.patch(
  '/users/:id/status',
  authenticate,
  requireRole('admin', 'super_admin'),
  async (req: AuthRequest, res: Response) => {
    const { status, reason } = req.body;
    const validStatuses = ['active', 'suspended', 'banned', 'deactivated'];

    if (!validStatuses.includes(status)) {
      return res.status(422).json({ error: 'Invalid status' });
    }

    try {
      await query('UPDATE users SET status = $1 WHERE id = $2', [status, req.params.id]);

      await query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_data)
         VALUES ($1, 'user_status_change', 'user', $2, $3)`,
        [req.user!.id, req.params.id, JSON.stringify({ status, reason })]
      );

      return res.json({ message: `User status updated to ${status}` });
    } catch (err) {
      logger.error('Admin update user status error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to update user status' });
    }
  }
);

// GET /admin/kyc — pending KYC reviews
router.get('/kyc', authenticate, requireRole('admin', 'super_admin'), async (_req, res) => {
  try {
    const pendingKyc = await query(
      `SELECT u.id, u.full_name, u.email, u.role, u.created_at,
              fp.id AS profile_id, fp.kyc_status, fp.kyc_submitted_at,
              fp.aadhar_doc_url, fp.pan_doc_url, fp.land_doc_url,
              fp.aadhar_number, fp.pan_number
       FROM users u
       JOIN farmer_profiles fp ON fp.user_id = u.id
       WHERE fp.kyc_status = 'pending'
       ORDER BY fp.kyc_submitted_at ASC`
    );

    return res.json({ pending_kyc: pendingKyc });
  } catch (err) {
    logger.error('Admin KYC list error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch KYC list' });
  }
});

// PATCH /admin/kyc/:userId
router.patch(
  '/kyc/:userId',
  authenticate,
  requireRole('admin', 'super_admin'),
  async (req: AuthRequest, res) => {
    const { decision, reason } = req.body;
    if (!['approved', 'rejected'].includes(decision)) {
      return res.status(422).json({ error: 'Decision must be approved or rejected' });
    }

    try {
      await query(
        `UPDATE farmer_profiles SET kyc_status = $1, kyc_reviewed_at = NOW(),
         kyc_reviewed_by = $2, kyc_rejection_reason = $3
         WHERE user_id = $4`,
        [decision, req.user!.id, reason || null, req.params.userId]
      );

      if (decision === 'approved') {
        await query(
          "UPDATE users SET status = 'active' WHERE id = $1 AND status = 'pending'",
          [req.params.userId]
        );
      }

      return res.json({ message: `KYC ${decision}` });
    } catch (err) {
      logger.error('Admin KYC decision error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to process KYC decision' });
    }
  }
);

// GET /admin/audit-logs
router.get('/audit-logs', authenticate, requireRole('admin', 'super_admin'), async (req, res) => {
  try {
    const pageStr = String(req.query.page || '1');
    const limitStr = String(req.query.limit || '50');
    const pageNum = parseInt(pageStr, 10);
    const limitNum = parseInt(limitStr, 10);
    const offset = (pageNum - 1) * limitNum;

    const logs = await query(
      `SELECT al.id, al.action, al.entity_type, al.entity_id, al.ip_address, al.created_at,
              u.full_name AS user_name, u.role AS user_role
       FROM audit_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ORDER BY al.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limitNum, offset]
    );

    return res.json({ logs });
  } catch (err) {
    logger.error('Admin audit logs error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// POST /admin/announcements
router.post(
  '/announcements',
  authenticate,
  requireRole('admin', 'super_admin'),
  async (req: AuthRequest, res) => {
    const { title, content, target_roles, starts_at, ends_at } = req.body;
    if (!title || !content) {
      return res.status(422).json({ error: 'Title and content required' });
    }

    try {
      const announcements = await query(
        `INSERT INTO announcements (title, content, target_roles, starts_at, ends_at, created_by)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [title, content, target_roles || null, starts_at || null, ends_at || null, req.user!.id]
      );
      return res.status(201).json({ announcement: announcements[0] });
    } catch (err) {
      logger.error('Create announcement error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to create announcement' });
    }
  }
);

export default router;
