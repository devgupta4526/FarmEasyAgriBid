import { Router } from 'express';
import { body, query as qv, param } from 'express-validator';
import { query, queryOne } from '../db/pool';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { logger } from '../utils/logger';

const router = Router();

// GET /products — list with filters
router.get('/', async (req: AuthRequest, res) => {
  try {
    const {
      category, search, minPrice, maxPrice, isOrganic, listingType,
      state, district, sortBy = 'created_at', page = 1, limit = 20,
      lat, lng, radiusKm = 50
    } = req.query as Record<string, string>;

    const params: unknown[] = [];
    const conditions: string[] = ["p.status = 'active'"];
    let idx = 1;

    if (category) {
      conditions.push(`c.slug = $${idx++}`);
      params.push(category);
    }
    if (search) {
      conditions.push(`p.title ILIKE $${idx++}`);
      params.push(`%${search}%`);
    }
    if (minPrice) {
      conditions.push(`COALESCE(p.buy_now_price, p.base_price) >= $${idx++}`);
      params.push(parseFloat(minPrice));
    }
    if (maxPrice) {
      conditions.push(`COALESCE(p.buy_now_price, p.base_price) <= $${idx++}`);
      params.push(parseFloat(maxPrice));
    }
    if (isOrganic === 'true') {
      conditions.push('p.is_organic = true');
    }
    if (listingType) {
      conditions.push(`p.listing_type = $${idx++}`);
      params.push(listingType);
    }
    if (state) {
      conditions.push(`p.state ILIKE $${idx++}`);
      params.push(`%${state}%`);
    }
    if (district) {
      conditions.push(`p.district ILIKE $${idx++}`);
      params.push(`%${district}%`);
    }

    const allowedSorts: Record<string, string> = {
      'created_at': 'p.created_at DESC',
      'price_asc': 'COALESCE(p.buy_now_price, p.base_price) ASC',
      'price_desc': 'COALESCE(p.buy_now_price, p.base_price) DESC',
      'views': 'p.views_count DESC',
      'likes': 'p.likes_count DESC',
    };
    const orderBy = allowedSorts[sortBy] || 'p.created_at DESC';

    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));
    const offset = (pageNum - 1) * limitNum;

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countRows = await query<{ count: string }>(
      `SELECT COUNT(*) FROM products p
       JOIN categories c ON c.id = p.category_id
       ${whereClause}`,
      params
    );
    const total = parseInt(countRows[0]?.count || '0', 10);

    params.push(limitNum, offset);
    const products = await query(
      `SELECT p.id, p.title, p.slug, p.thumbnail_url, p.images,
              p.listing_type, p.base_price, p.buy_now_price,
              p.quantity_available, p.quantity_unit, p.quality_grade,
              p.is_organic, p.harvest_date, p.shelf_life_days,
              p.location_text, p.state, p.district,
              p.views_count, p.likes_count, p.created_at,
              c.name AS category_name, c.slug AS category_slug,
              u.full_name AS farmer_name, u.avatar_url AS farmer_avatar,
              fp.avg_rating AS farmer_rating, fp.is_verified AS farmer_verified,
              a.id AS auction_id, a.status AS auction_status,
              a.current_bid, a.ends_at AS auction_ends_at
       FROM products p
       JOIN categories c ON c.id = p.category_id
       JOIN users u ON u.id = p.farmer_id
       LEFT JOIN farmer_profiles fp ON fp.user_id = p.farmer_id
       LEFT JOIN auctions a ON a.product_id = p.id
       ${whereClause}
       ORDER BY ${orderBy}
       LIMIT $${idx++} OFFSET $${idx}`,
      params
    );

    return res.json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    logger.error('List products error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /products/:id
router.get('/:id', async (req, res) => {
  try {
    const product = await queryOne(
      `SELECT p.*,
              c.name AS category_name, c.slug AS category_slug,
              u.full_name AS farmer_name, u.avatar_url AS farmer_avatar,
              u.id AS farmer_id,
              fp.farm_name, fp.avg_rating AS farmer_rating,
              fp.is_verified AS farmer_verified, fp.total_sales AS farmer_total_sales,
              a.id AS auction_id, a.status AS auction_status,
              a.start_price, a.current_bid, a.current_winner_id,
              a.ends_at AS auction_ends_at, a.starts_at AS auction_starts_at,
              a.total_bids, a.buy_now_price AS auction_buy_now,
              a.bid_increment, a.reserve_price
       FROM products p
       JOIN categories c ON c.id = p.category_id
       JOIN users u ON u.id = p.farmer_id
       LEFT JOIN farmer_profiles fp ON fp.user_id = p.farmer_id
       LEFT JOIN auctions a ON a.product_id = p.id
       WHERE p.id = $1`,
      [req.params.id]
    );

    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Increment view count (fire-and-forget)
    query('UPDATE products SET views_count = views_count + 1 WHERE id = $1', [req.params.id]).catch(() => {});

    return res.json({ product });
  } catch (err) {
    logger.error('Get product error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// POST /products — farmer only
router.post(
  '/',
  authenticate,
  requireRole('farmer'),
  [
    body('title').trim().isLength({ min: 5, max: 255 }),
    body('category_id').isUUID(),
    body('listing_type').isIn(['auction', 'instant_buy', 'both']),
    body('quantity_available').isFloat({ min: 0.1 }),
    body('quantity_unit').isIn(['kg', 'ton', 'quintal', 'piece', 'dozen', 'litre', 'bundle']),
  ],
  validateRequest,
  async (req: AuthRequest, res) => {
    const {
      title, description, category_id, listing_type, base_price, buy_now_price,
      quantity_available, quantity_unit, quality_grade, is_organic, harvest_date,
      shelf_life_days, location_text, latitude, longitude, state, district, pincode,
      delivery_type, images, tags, is_bulk, is_wholesale, is_export_quality, is_seasonal,
      packaging_info, moisture_content
    } = req.body;

    try {
      const products = await query(
        `INSERT INTO products (
          farmer_id, category_id, title, description, listing_type, status,
          base_price, buy_now_price, quantity_available, quantity_unit,
          quality_grade, is_organic, harvest_date, shelf_life_days,
          location_text, latitude, longitude, state, district, pincode,
          delivery_type, images, tags, is_bulk, is_wholesale,
          is_export_quality, is_seasonal, packaging_info, moisture_content
        ) VALUES (
          $1,$2,$3,$4,$5,'draft',$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28
        ) RETURNING *`,
        [
          req.user!.id, category_id, title, description, listing_type,
          base_price, buy_now_price, quantity_available, quantity_unit,
          quality_grade, is_organic || false, harvest_date, shelf_life_days,
          location_text, latitude, longitude, state, district, pincode,
          delivery_type || 'both', images || [], tags || [],
          is_bulk || false, is_wholesale || false, is_export_quality || false,
          is_seasonal || false, packaging_info, moisture_content
        ]
      );

      logger.info('Product created', { productId: products[0].id, farmerId: req.user!.id });
      return res.status(201).json({ product: products[0] });
    } catch (err) {
      logger.error('Create product error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to create product' });
    }
  }
);

// PATCH /products/:id
router.patch(
  '/:id',
  authenticate,
  requireRole('farmer', 'admin'),
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    try {
      const existing = await queryOne<{ farmer_id: string }>(
        'SELECT farmer_id FROM products WHERE id = $1', [id]
      );
      if (!existing) return res.status(404).json({ error: 'Product not found' });
      if (req.user!.role !== 'admin' && existing.farmer_id !== req.user!.id) {
        return res.status(403).json({ error: 'Not your product' });
      }

      const allowed = [
        'title','description','base_price','buy_now_price','quantity_available',
        'status','images','tags','delivery_type','packaging_info','thumbnail_url',
        'is_organic','quality_grade','shelf_life_days','harvest_date'
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

      if (!updates.length) return res.status(422).json({ error: 'No valid fields to update' });
      params.push(id);
      const products = await query(
        `UPDATE products SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
        params
      );
      return res.json({ product: products[0] });
    } catch (err) {
      logger.error('Update product error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

// DELETE /products/:id
router.delete('/:id', authenticate, requireRole('farmer', 'admin'), async (req: AuthRequest, res) => {
  try {
    const existing = await queryOne<{ farmer_id: string; status: string }>(
      'SELECT farmer_id, status FROM products WHERE id = $1', [req.params.id]
    );
    if (!existing) return res.status(404).json({ error: 'Product not found' });
    if (req.user!.role !== 'admin' && existing.farmer_id !== req.user!.id) {
      return res.status(403).json({ error: 'Not your product' });
    }

    await query("UPDATE products SET status = 'archived' WHERE id = $1", [req.params.id]);
    return res.json({ message: 'Product archived' });
  } catch (err) {
    logger.error('Delete product error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to delete product' });
  }
});

// POST /products/:id/like
router.post('/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const existing = await queryOne(
      'SELECT 1 FROM product_likes WHERE user_id = $1 AND product_id = $2',
      [req.user!.id, req.params.id]
    );
    if (existing) {
      await query('DELETE FROM product_likes WHERE user_id = $1 AND product_id = $2',
        [req.user!.id, req.params.id]);
      return res.json({ liked: false });
    } else {
      await query('INSERT INTO product_likes (user_id, product_id) VALUES ($1, $2)',
        [req.user!.id, req.params.id]);
      return res.json({ liked: true });
    }
  } catch (err) {
    logger.error('Like product error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to toggle like' });
  }
});

export default router;
