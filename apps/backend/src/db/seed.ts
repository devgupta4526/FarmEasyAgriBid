import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';



const envPath = path.resolve(__dirname, "../../../../.env");


const result = dotenv.config({
  path: envPath,
});

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// dotenv.config({ path: path.join(__dirname, '../../../.env') });
// console.log("DATABASE_URL =", process.env.DATABASE_URL);
// const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function runMigrations() {
  const client = await pool.connect();
  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir).sort();
    for (const file of files) {
      if (file.endsWith('.sql')) {
        console.log(`Running migration: ${file}`);
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
        await client.query(sql);
        console.log(`✓ ${file}`);
      }
    }
  } finally {
    client.release();
  }
}

async function seedUsers() {
  const client = await pool.connect();
  try {
    const adminHash = await bcrypt.hash('Admin@1234', 12);
    const farmerHash = await bcrypt.hash('Farmer@1234', 12);
    const buyerHash = await bcrypt.hash('Buyer@1234', 12);

    // Admin
    const adminResult = await client.query(`
      INSERT INTO users (email, password_hash, role, status, full_name, email_verified)
      VALUES ('admin@agribid.com', $1, 'admin', 'active', 'Admin User', true)
      ON CONFLICT (email) DO NOTHING RETURNING id
    `, [adminHash]);

    // Demo Farmer
    const farmerResult = await client.query(`
      INSERT INTO users (email, password_hash, role, status, full_name, email_verified)
      VALUES ('farmer@agribid.com', $1, 'farmer', 'active', 'Rajesh Kumar', true)
      ON CONFLICT (email) DO NOTHING RETURNING id
    `, [farmerHash]);

    if (farmerResult.rows[0]) {
      await client.query(`
        INSERT INTO farmer_profiles (user_id, farm_name, farm_location_text, farm_state, farm_district, farm_latitude, farm_longitude, crops_grown, years_of_experience, organic_certified, kyc_status, is_verified)
        VALUES ($1, 'Rajesh Organic Farm', 'Nashik, Maharashtra', 'Maharashtra', 'Nashik', 20.0059, 73.7898, ARRAY['Tomatoes','Onions','Grapes'], 12, true, 'approved', true)
        ON CONFLICT (user_id) DO NOTHING
      `, [farmerResult.rows[0].id]);
    }

    // Demo Buyer
    const buyerResult = await client.query(`
      INSERT INTO users (email, password_hash, role, status, full_name, email_verified)
      VALUES ('buyer@agribid.com', $1, 'buyer', 'active', 'Priya Sharma', true)
      ON CONFLICT (email) DO NOTHING RETURNING id
    `, [buyerHash]);

    if (buyerResult.rows[0]) {
      await client.query(`
        INSERT INTO buyer_profiles (user_id, company_name, city, state, kyc_status)
        VALUES ($1, 'Fresh Mart Pvt Ltd', 'Mumbai', 'Maharashtra', 'approved')
        ON CONFLICT (user_id) DO NOTHING
      `, [buyerResult.rows[0].id]);
    }

    console.log('✓ Seeded users');
  } finally {
    client.release();
  }
}

async function seedProducts() {
  const client = await pool.connect();
  try {
    const farmerRow = await client.query(`SELECT id FROM users WHERE email = 'farmer@agribid.com'`);
    if (!farmerRow.rows[0]) return;

    const farmerId = farmerRow.rows[0].id;

    const catRow = await client.query(`SELECT id FROM categories WHERE slug = 'vegetables' LIMIT 1`);
    if (!catRow.rows[0]) return;
    const catId = catRow.rows[0].id;

    const fruitRow = await client.query(`SELECT id FROM categories WHERE slug = 'fruits' LIMIT 1`);
    const fruitId = fruitRow.rows[0]?.id || catId;

    const products = [
      {
        title: 'Premium Nashik Red Onions',
        description: 'Fresh red onions from Nashik, known for excellent shelf life and flavor. Ideal for wholesale and retail buyers.',
        listing_type: 'both',
        base_price: 18,
        buy_now_price: 22,
        quantity_available: 500,
        quantity_unit: 'kg',
        quality_grade: 'A',
        is_organic: false,
        harvest_date: '2024-12-01',
        shelf_life_days: 60,
        location_text: 'Nashik, Maharashtra',
        latitude: 20.0059,
        longitude: 73.7898,
        state: 'Maharashtra',
        district: 'Nashik',
        category_id: catId,
        tags: ['onion', 'nashik', 'fresh', 'red-onion'],
        is_bulk: true,
        is_wholesale: true,
      },
      {
        title: 'Organic Alphonso Mangoes',
        description: 'Certified organic Alphonso mangoes from Ratnagiri. GI-tagged variety with rich flavor.',
        listing_type: 'auction',
        base_price: 200,
        buy_now_price: 350,
        quantity_available: 100,
        quantity_unit: 'kg',
        quality_grade: 'premium',
        is_organic: true,
        harvest_date: '2024-12-10',
        shelf_life_days: 7,
        location_text: 'Ratnagiri, Maharashtra',
        latitude: 16.9902,
        longitude: 73.3120,
        state: 'Maharashtra',
        district: 'Ratnagiri',
        category_id: fruitId,
        tags: ['mango', 'alphonso', 'organic', 'ratnagiri', 'gi-tagged'],
        is_export_quality: true,
      },
    ];

    for (const p of products) {
      await client.query(`
        INSERT INTO products (farmer_id, category_id, title, description, listing_type, status, base_price, buy_now_price, quantity_available, quantity_unit, quality_grade, is_organic, harvest_date, shelf_life_days, location_text, latitude, longitude, state, district, tags, is_bulk, is_wholesale, is_export_quality)
        VALUES ($1, $2, $3, $4, $5, 'active', $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        ON CONFLICT DO NOTHING
      `, [
        farmerId, p.category_id, p.title, p.description, p.listing_type,
        p.base_price, p.buy_now_price, p.quantity_available, p.quantity_unit,
        p.quality_grade, p.is_organic, p.harvest_date || null, p.shelf_life_days,
        p.location_text, p.latitude, p.longitude, p.state, p.district,
        p.tags, p.is_bulk || false, p.is_wholesale || false, p.is_export_quality || false
      ]);
    }

    console.log('✓ Seeded products');
  } finally {
    client.release();
  }
}

async function main() {
  console.log('🌱 Starting AgriBid seed...');
  try {
    await runMigrations();
    await seedUsers();
    await seedProducts();
    console.log('✅ Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
