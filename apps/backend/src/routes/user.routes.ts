import { Router } from 'express';
import { query } from '../db/pool';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../utils/logger';

const router = Router();

// GET /users/profile/:id — public profile
router.get('/profile/:id', async (req, res) => {
  try {
    const user = await query(
      `SELECT u.id, u.full_name, u.display_name, u.avatar_url, u.role, u.created_at,
              fp.farm_name, fp.farm_location_text, fp.avg_rating AS rating,
              fp.total_reviews, fp.total_sales, fp.is_verified, fp.organic_certified,
              fp.crops_grown, fp.years_of_experience
       FROM users u
       LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
       WHERE u.id = $1 AND u.status = 'active'`,
      [req.params.id]
    );
    if (!user[0]) return res.status(404).json({ error: 'User not found' });
    return res.json({ profile: user[0] });
  } catch (err) {
    logger.error('Get profile error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PATCH /users/me — update my profile
router.patch('/me', authenticate, async (req: AuthRequest, res) => {
  const allowed = ['full_name', 'display_name', 'avatar_url', 'preferred_language', 'dark_mode', 'bio', 'fcm_token'];
  const updates: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (key in req.body) {
      updates.push(`${key} = $${idx++}`);
      params.push(req.body[key]);
    }
  }

  if (!updates.length) return res.status(422).json({ error: 'No valid fields' });
  params.push(req.user!.id);

  try {
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`, params);
    return res.json({ message: 'Profile updated' });
  } catch (err) {
    logger.error('Update user error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// PATCH /users/me/farmer-profile
router.patch('/me/farmer-profile', authenticate, async (req: AuthRequest, res) => {
  const allowed = [
    'farm_name', 'farm_location_text', 'farm_state', 'farm_district', 'farm_pincode',
    'farm_latitude', 'farm_longitude', 'farm_size_acres', 'crops_grown',
    'years_of_experience', 'organic_certified', 'fpo_member', 'fpo_name',
    'bank_account_number', 'bank_ifsc', 'bank_name', 'bank_account_holder', 'upi_id'
  ];
  const updates: string[] = [];
  const params: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if (key in req.body) {
      updates.push(`${key} = $${idx++}`);
      params.push(req.body[key]);
    }
  }

  if (!updates.length) return res.status(422).json({ error: 'No valid fields' });
  params.push(req.user!.id);

  try {
    const existing = await query(
      'SELECT id FROM farmer_profiles WHERE user_id = $1', [req.user!.id]
    );
    if (!existing.length) {
      await query('INSERT INTO farmer_profiles (user_id) VALUES ($1)', [req.user!.id]);
    }
    await query(`UPDATE farmer_profiles SET ${updates.join(', ')} WHERE user_id = $${idx}`, params);
    return res.json({ message: 'Farmer profile updated' });
  } catch (err) {
    logger.error('Update farmer profile error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to update farmer profile' });
  }
});

export default router;
