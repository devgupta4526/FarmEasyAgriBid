import { Router, Response } from 'express';
import { body } from 'express-validator';
import { query, queryOne, withTransaction } from '../db/pool';
import { authenticate, requireRole, AuthRequest } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { logger } from '../utils/logger';
import { getIO } from '../socket/socket';

const router = Router();

// GET /auctions — list live/scheduled auctions
router.get('/', async (req, res) => {
  try {
    const { status = 'live', page = '1', limit = '20' } = req.query as Record<string, string>;
    const pageNum = Math.max(1, parseInt(String(page), 10));
    const limitNum = Math.min(50, parseInt(String(limit), 10));
    const offset = (pageNum - 1) * limitNum;

    const validStatuses = ['scheduled', 'live', 'ended', 'cancelled', 'sold'];
    const safeStatus = validStatuses.includes(status) ? status : 'live';

    const auctions = await query(
      `SELECT a.*,
              p.title, p.images, p.thumbnail_url, p.quantity_available, p.quantity_unit,
              p.quality_grade, p.is_organic, p.location_text, p.state,
              u.full_name AS farmer_name, u.avatar_url AS farmer_avatar,
              fp.avg_rating AS farmer_rating, fp.is_verified AS farmer_verified,
              c.name AS category_name
       FROM auctions a
       JOIN products p ON p.id = a.product_id
       JOIN users u ON u.id = a.farmer_id
       LEFT JOIN farmer_profiles fp ON fp.user_id = a.farmer_id
       JOIN categories c ON c.id = p.category_id
       WHERE a.status = $1
       ORDER BY a.ends_at ASC
       LIMIT $2 OFFSET $3`,
      [safeStatus, limitNum, offset]
    );

    return res.json({ auctions, pagination: { page: pageNum, limit: limitNum } });
  } catch (err) {
    logger.error('List auctions error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch auctions' });
  }
});

// GET /auctions/:id — with bid history
router.get('/:id', async (req, res) => {
  try {
    const auction = await queryOne(
      `SELECT a.*,
              p.title, p.description, p.images, p.thumbnail_url,
              p.quantity_available, p.quantity_unit, p.quality_grade,
              p.is_organic, p.location_text, p.state, p.harvest_date,
              u.full_name AS farmer_name, u.avatar_url AS farmer_avatar,
              fp.avg_rating AS farmer_rating, fp.farm_name
       FROM auctions a
       JOIN products p ON p.id = a.product_id
       JOIN users u ON u.id = a.farmer_id
       LEFT JOIN farmer_profiles fp ON fp.user_id = a.farmer_id
       WHERE a.id = $1`,
      [req.params.id]
    );

    if (!auction) return res.status(404).json({ error: 'Auction not found' });

    // Get recent bids
    const bids = await query(
      `SELECT b.id, b.amount, b.created_at, b.is_auto_bid,
              u.full_name AS bidder_name, u.avatar_url AS bidder_avatar
       FROM bids b
       JOIN users u ON u.id = b.bidder_id
       WHERE b.auction_id = $1 AND b.status != 'cancelled'
       ORDER BY b.created_at DESC
       LIMIT 50`,
      [req.params.id]
    );

    return res.json({ auction, bids });
  } catch (err) {
    logger.error('Get auction error', { error: (err as Error).message });
    return res.status(500).json({ error: 'Failed to fetch auction' });
  }
});

// POST /auctions — farmer creates auction
router.post(
  '/',
  authenticate,
  requireRole('farmer'),
  [
    body('product_id').isUUID(),
    body('start_price').isFloat({ min: 0.01 }),
    body('starts_at').isISO8601(),
    body('ends_at').isISO8601(),
    body('bid_increment').optional().isFloat({ min: 1 }),
  ],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    const {
      product_id, start_price, reserve_price, buy_now_price,
      bid_increment, starts_at, ends_at,
      anti_snipe_enabled, auto_bid_enabled
    } = req.body;

    try {
      // Verify product belongs to farmer
      const product = await queryOne<{ farmer_id: string; status: string }>(
        'SELECT farmer_id, status FROM products WHERE id = $1', [product_id]
      );
      if (!product) return res.status(404).json({ error: 'Product not found' });
      if (product.farmer_id !== req.user!.id) return res.status(403).json({ error: 'Not your product' });
      if (product.status === 'sold') return res.status(400).json({ error: 'Product already sold' });

      // Check no existing active auction
      const existing = await queryOne(
        `SELECT id FROM auctions WHERE product_id = $1 AND status IN ('scheduled','live')`,
        [product_id]
      );
      if (existing) return res.status(409).json({ error: 'Active auction already exists for this product' });

      const auctions = await query(
        `INSERT INTO auctions (
          product_id, farmer_id, start_price, reserve_price, buy_now_price,
          bid_increment, starts_at, ends_at, status,
          anti_snipe_enabled, auto_bid_enabled,
          anti_snipe_threshold_minutes, anti_snipe_extension_minutes
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'scheduled',$9,$10,$11,$12) RETURNING *`,
        [
          product_id, req.user!.id, start_price, reserve_price || null, buy_now_price || null,
          bid_increment || 10, starts_at, ends_at,
          anti_snipe_enabled !== false,
          auto_bid_enabled !== false,
          parseInt(process.env.AUCTION_ANTI_SNIPE_THRESHOLD_MINUTES || '1', 10),
          parseInt(process.env.AUCTION_ANTI_SNIPE_EXTENSION_MINUTES || '2', 10),
        ]
      );

      // Update product listing type
      await query("UPDATE products SET listing_type = 'auction', status = 'active' WHERE id = $1", [product_id]);

      return res.status(201).json({ auction: auctions[0] });
    } catch (err) {
      logger.error('Create auction error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to create auction' });
    }
  }
);

// POST /auctions/:id/bid
router.post(
  '/:id/bid',
  authenticate,
  requireRole('buyer'),
  [body('amount').isFloat({ min: 0.01 })],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { amount } = req.body;

    try {
      return await withTransaction(async (client) => {
        // Lock auction row
        const auctionRows = await client.query(
          `SELECT * FROM auctions WHERE id = $1 FOR UPDATE`,
          [id]
        );
        const auction = auctionRows.rows[0];

        if (!auction) return res.status(404).json({ error: 'Auction not found' });
        if (auction.status !== 'live') return res.status(400).json({ error: 'Auction is not live' });
        if (new Date() > new Date(auction.ends_at)) {
          return res.status(400).json({ error: 'Auction has ended' });
        }
        if (auction.farmer_id === req.user!.id) {
          return res.status(400).json({ error: 'Farmers cannot bid on their own auctions' });
        }

        const minBid = (parseFloat(auction.current_bid || auction.start_price)) + parseFloat(auction.bid_increment);
        if (parseFloat(amount) < minBid) {
          return res.status(400).json({ error: `Minimum bid is ₹${minBid}` });
        }

        // Mark previous bids as outbid
        await client.query(
          `UPDATE bids SET status = 'outbid' WHERE auction_id = $1 AND status = 'active' AND bidder_id != $2`,
          [id, req.user!.id]
        );

        // Insert new bid
        const bidRows = await client.query(
          `INSERT INTO bids (auction_id, bidder_id, amount, status, ip_address)
           VALUES ($1, $2, $3, 'active', $4) RETURNING *`,
          [id, req.user!.id, amount, req.ip]
        );
        const bid = bidRows.rows[0];

        // Anti-sniping: extend auction if bid placed in final minute
        let newEndsAt = auction.ends_at;
        if (auction.anti_snipe_enabled) {
          const now = new Date();
          const endsAt = new Date(auction.ends_at);
          const minutesLeft = (endsAt.getTime() - now.getTime()) / 60000;

          if (minutesLeft <= auction.anti_snipe_threshold_minutes) {
            newEndsAt = new Date(now.getTime() + auction.anti_snipe_extension_minutes * 60000).toISOString();
          }
        }

        // Update auction
        await client.query(
          `UPDATE auctions SET current_bid = $1, current_winner_id = $2,
                              total_bids = total_bids + 1, ends_at = $3
           WHERE id = $4`,
          [amount, req.user!.id, newEndsAt, id]
        );

        // Emit real-time event
        const io = getIO();
        if (io) {
          io.to(`auction:${id}`).emit('new_bid', {
            auctionId: id,
            bid: {
              id: bid.id,
              amount: parseFloat(amount),
              bidder_id: req.user!.id,
              created_at: bid.created_at,
            },
            current_bid: parseFloat(amount),
            total_bids: auction.total_bids + 1,
            ends_at: newEndsAt,
          });
        }

        return res.status(201).json({
          bid,
          current_bid: parseFloat(amount),
          ends_at: newEndsAt,
        });
      });
    } catch (err) {
      logger.error('Place bid error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to place bid' });
    }
  }
);

// POST /auctions/:id/auto-bid
router.post(
  '/:id/auto-bid',
  authenticate,
  requireRole('buyer'),
  [body('max_amount').isFloat({ min: 0.01 })],
  validateRequest,
  async (req: AuthRequest, res: Response) => {
    const { max_amount } = req.body;
    try {
      await query(
        `INSERT INTO auto_bids (auction_id, bidder_id, max_amount, is_active)
         VALUES ($1, $2, $3, true)
         ON CONFLICT (auction_id, bidder_id) DO UPDATE SET max_amount = $3, is_active = true`,
        [req.params.id, req.user!.id, max_amount]
      );
      return res.json({ message: 'Auto-bid set', max_amount });
    } catch (err) {
      logger.error('Auto bid error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to set auto-bid' });
    }
  }
);

// POST /auctions/:id/buy-now
router.post(
  '/:id/buy-now',
  authenticate,
  requireRole('buyer'),
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    try {
      return await withTransaction(async (client) => {
        const auctionRows = await client.query(
          `SELECT * FROM auctions WHERE id = $1 FOR UPDATE`, [id]
        );
        const auction = auctionRows.rows[0];

        if (!auction) return res.status(404).json({ error: 'Auction not found' });
        if (!auction.buy_now_price) return res.status(400).json({ error: 'Buy Now not available for this auction' });
        if (auction.status !== 'live' && auction.status !== 'scheduled') {
          return res.status(400).json({ error: 'Auction is not available' });
        }

        // End auction with buy now
        await client.query(
          `UPDATE auctions SET status = 'sold', winner_id = $1, winning_bid = $2, sold_at = NOW() WHERE id = $3`,
          [req.user!.id, auction.buy_now_price, id]
        );

        // Create order
        const productRows = await client.query('SELECT * FROM products WHERE id = $1', [auction.product_id]);
        const product = productRows.rows[0];

        const platformFee = parseFloat(auction.buy_now_price) * parseFloat(process.env.PLATFORM_FEE_PERCENT || '2.5') / 100;
        const orderRows = await client.query(
          `INSERT INTO orders (buyer_id, farmer_id, product_id, auction_id, quantity, quantity_unit, unit_price, subtotal, platform_fee, total_amount, status, payment_status)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'confirmed','pending') RETURNING *`,
          [
            req.user!.id, product.farmer_id, product.id, id,
            product.quantity_available, product.quantity_unit,
            auction.buy_now_price, auction.buy_now_price,
            platformFee, parseFloat(auction.buy_now_price) + platformFee
          ]
        );

        const io = getIO();
        if (io) {
          io.to(`auction:${id}`).emit('auction_ended', {
            auctionId: id, reason: 'buy_now', winner_id: req.user!.id, price: auction.buy_now_price
          });
        }

        return res.json({ order: orderRows.rows[0], message: 'Purchase successful' });
      });
    } catch (err) {
      logger.error('Buy now error', { error: (err as Error).message });
      return res.status(500).json({ error: 'Failed to process buy now' });
    }
  }
);

export default router;
