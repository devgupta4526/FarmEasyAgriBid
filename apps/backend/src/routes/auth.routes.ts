import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { query, queryOne, withTransaction } from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { logger } from '../utils/logger';
import { Resend } from 'resend';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Strict rate limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many authentication attempts. Try again in 15 minutes.' },
});

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  password_hash: string | null;
  role: string;
  status: string;
  full_name: string;
  email_verified: boolean;
  phone_verified: boolean;
}

function generateTokens(user: User) {
  const secret = process.env.JWT_SECRET!;
  const refreshSecret = process.env.REFRESH_TOKEN_SECRET!;

  const accessToken = jwt.sign(
    { sub: user.id, role: user.role, email: user.email, status: user.status },
    secret,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any }
  );

  const refreshToken = jwt.sign(
    { sub: user.id },
    refreshSecret,
    { expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN || '30d') as any }
  );

  return { accessToken, refreshToken };
}

// POST /auth/register
router.post(
  '/register',
  authLimiter,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone('any'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('full_name').trim().isLength({ min: 2, max: 255 }).withMessage('Full name required'),
    body('role').isIn(['farmer', 'buyer', 'logistics']).withMessage('Invalid role'),
  ],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    const { email, phone, password, full_name, role, referral_code } = req.body;

    if (!email && !phone) {
      return res.status(422).json({ error: 'Email or phone is required' });
    }

    try {
      // Check duplicate
      if (email) {
        const existing = await queryOne<{ id: string }>(
          'SELECT id FROM users WHERE email = $1', [email]
        );
        if (existing) return res.status(409).json({ error: 'Email already registered' });
      }

      if (phone) {
        const existing = await queryOne<{ id: string }>(
          'SELECT id FROM users WHERE phone = $1', [phone]
        );
        if (existing) return res.status(409).json({ error: 'Phone already registered' });
      }

      const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
      const passwordHash = await bcrypt.hash(password, rounds);

      let referrerId: string | null = null;
      if (referral_code) {
        const referrer = await queryOne<{ id: string }>(
          'SELECT id FROM users WHERE referral_code = $1', [referral_code]
        );
        referrerId = referrer?.id ?? null;
      }

      const users = await query<User>(
        `INSERT INTO users (email, phone, password_hash, role, status, full_name, referred_by)
         VALUES ($1, $2, $3, $4, 'pending', $5, $6)
         RETURNING id, email, phone, role, status, full_name, email_verified, phone_verified, password_hash`,
        [email ?? null, phone ?? null, passwordHash, role, full_name, referrerId]
      );

      const user = users[0];

      // Record referral reward
      if (referrerId) {
        await query(
          `INSERT INTO referral_rewards (referrer_id, referred_id, triggered_event)
           VALUES ($1, $2, 'registration')`,
          [referrerId, user.id]
        );
      }

      const { accessToken, refreshToken } = generateTokens(user);

      // Store refresh token hash
      const refreshHash = await bcrypt.hash(refreshToken, 8);
      await query(
        `INSERT INTO user_sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')`,
        [user.id, refreshHash, req.ip, req.headers['user-agent']]
      );

      logger.info('New user registered', { userId: user.id, role });

      return res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          full_name: user.full_name,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (err) {
      logger.error('Registration error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// POST /auth/login
router.post(
  '/login',
  authLimiter,
  [
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isMobilePhone('any'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    const { email, phone, password } = req.body;

    if (!email && !phone) {
      return res.status(422).json({ error: 'Email or phone required' });
    }

    try {
      const users = await query<User>(
        `SELECT id, email, phone, password_hash, role, status, full_name, email_verified, phone_verified
         FROM users WHERE ${email ? 'email = $1' : 'phone = $1'}`,
        [email ?? phone]
      );

      const user = users[0];

      if (!user || !user.password_hash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      if (user.status === 'banned') {
        return res.status(403).json({ error: 'Account has been banned' });
      }
      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'Account is suspended' });
      }

      const { accessToken, refreshToken } = generateTokens(user);
      const refreshHash = await bcrypt.hash(refreshToken, 8);

      await query(
        `INSERT INTO user_sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at)
         VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')`,
        [user.id, refreshHash, req.ip, req.headers['user-agent']]
      );

      await query(
        `UPDATE users SET last_login_at = NOW(), login_count = login_count + 1 WHERE id = $1`,
        [user.id]
      );

      logger.info('User logged in', { userId: user.id, role: user.role });

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
          full_name: user.full_name,
          email_verified: user.email_verified,
          phone_verified: user.phone_verified,
        },
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    } catch (err) {
      logger.error('Login error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Login failed' });
    }
  }
);

// POST /auth/refresh
router.post('/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(401).json({ error: 'Refresh token required' });
  }

  try {
    const payload = jwt.verify(
      refresh_token,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { sub: string };

    // Find active sessions for this user
    const sessions = await query<{ id: string; refresh_token_hash: string }>(
      `SELECT id, refresh_token_hash FROM user_sessions
       WHERE user_id = $1 AND revoked_at IS NULL AND expires_at > NOW()`,
      [payload.sub]
    );

    const validSession = await Promise.all(
      sessions.map(async (s) => {
        const match = await bcrypt.compare(refresh_token, s.refresh_token_hash);
        return match ? s : null;
      })
    ).then((results) => results.find((r) => r !== null));

    if (!validSession) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const users = await query<User>(
      `SELECT id, email, phone, role, status, full_name, email_verified, phone_verified, password_hash
       FROM users WHERE id = $1`,
      [payload.sub]
    );

    if (!users[0]) return res.status(401).json({ error: 'User not found' });

    const user = users[0];
    const { accessToken, refreshToken: newRefresh } = generateTokens(user);
    const newHash = await bcrypt.hash(newRefresh, 8);

    // Revoke old, create new
    await query('UPDATE user_sessions SET revoked_at = NOW() WHERE id = $1', [validSession.id]);
    await query(
      `INSERT INTO user_sessions (user_id, refresh_token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')`,
      [user.id, newHash, req.ip, req.headers['user-agent']]
    );

    return res.json({ access_token: accessToken, refresh_token: newRefresh });
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
});

// POST /auth/logout
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  const { refresh_token } = req.body;
  if (refresh_token && req.user) {
    const sessions = await query<{ id: string; refresh_token_hash: string }>(
      `SELECT id, refresh_token_hash FROM user_sessions
       WHERE user_id = $1 AND revoked_at IS NULL`,
      [req.user.id]
    );

    for (const s of sessions) {
      const match = await bcrypt.compare(refresh_token, s.refresh_token_hash);
      if (match) {
        await query('UPDATE user_sessions SET revoked_at = NOW() WHERE id = $1', [s.id]);
        break;
      }
    }
  }
  return res.json({ message: 'Logged out' });
});

// POST /auth/forgot-password
router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email } = req.body;
    try {
      const user = await queryOne<{ id: string; full_name: string }>(
        'SELECT id, full_name FROM users WHERE email = $1', [email]
      );

      // Always respond OK (don't leak if email exists)
      if (user && resend) {
        const resetToken = uuidv4();
        const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        const tokenHash = await bcrypt.hash(resetToken, 8);

        await query(
          `INSERT INTO user_sessions (user_id, refresh_token_hash, expires_at, device_info)
           VALUES ($1, $2, $3, $4)`,
          [user.id, tokenHash, resetExpiry.toISOString(), JSON.stringify({ type: 'password_reset' })]
        );

        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}&uid=${user.id}`;

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@agribid.com',
          to: email,
          subject: 'Reset your AgriBid password',
          html: `<p>Hi ${user.full_name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`,
        });
      }

      return res.json({ message: 'If that email exists, a reset link was sent.' });
    } catch (err) {
      logger.error('Forgot password error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to process request' });
    }
  }
);

// GET /auth/me
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const user = await queryOne<{
      id: string; email: string; phone: string; role: string; status: string;
      full_name: string; display_name: string; avatar_url: string;
      email_verified: boolean; phone_verified: boolean; preferred_language: string;
      dark_mode: boolean; xp_points: number; level: number; referral_code: string;
    }>(
      `SELECT id, email, phone, role, status, full_name, display_name, avatar_url,
              email_verified, phone_verified, preferred_language, dark_mode,
              xp_points, level, referral_code
       FROM users WHERE id = $1`,
      [req.user!.id]
    );

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    logger.error('Get me error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to get user' });
  }
});

// PATCH /auth/password
router.patch(
  '/password',
  authenticate,
  [
    body('current_password').notEmpty().withMessage('Current password required'),
    body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    const { current_password, new_password } = req.body;
    try {
      const user = await queryOne<{ password_hash: string }>(
        'SELECT password_hash FROM users WHERE id = $1',
        [req.user!.id]
      );
      if (!user || !user.password_hash) {
        return res.status(404).json({ error: 'User not found' });
      }

      const valid = await bcrypt.compare(current_password, user.password_hash);
      if (!valid) {
        return res.status(400).json({ error: 'Incorrect current password' });
      }

      const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
      const newHash = await bcrypt.hash(new_password, rounds);

      await query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.user!.id]);

      return res.json({ message: 'Password updated successfully' });
    } catch (err) {
      logger.error('Update password error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to update password' });
    }
  }
);

export default router;
