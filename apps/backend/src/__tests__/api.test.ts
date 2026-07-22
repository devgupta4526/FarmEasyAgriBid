import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import request from 'supertest';
import { createApp } from '../app';

jest.mock('../db/pool', () => ({
  pool: { connect: jest.fn(), end: jest.fn(), on: jest.fn() },
  query: jest.fn().mockResolvedValue([]),
  queryOne: jest.fn().mockResolvedValue(null),
  withTransaction: jest.fn().mockImplementation(async (fn: (c: unknown) => Promise<unknown>) => {
    const mockClient = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };
    return fn(mockClient);
  }),
}));

jest.mock('../src/utils/logger', () => ({
  logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() },
}));

const app = createApp();

describe('Health Check', () => {
  it('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });
});

describe('Auth Routes', () => {
  const { query, queryOne } = require('../src/db/pool');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/v1/auth/register — should fail without email or phone', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ full_name: 'Test User', password: 'Test@1234', role: 'buyer' });

    expect(res.status).toBe(422);
  });

  it('POST /api/v1/auth/register — should validate role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', password: 'Test@1234', full_name: 'Test', role: 'invalid_role' });

    expect(res.status).toBe(422);
  });

  it('POST /api/v1/auth/login — should fail with missing credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({});

    expect(res.status).toBe(422);
  });

  it('POST /api/v1/auth/login — should return 401 for invalid credentials', async () => {
    (queryOne as jest.Mock).mockResolvedValueOnce(null);

    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
  });

  it('GET /api/v1/auth/me — should return 401 without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });

  it('GET /api/v1/auth/me — should return 401 with invalid token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer invalid-token');
    expect(res.status).toBe(401);
  });
});

describe('Products Routes', () => {
  const { query } = require('../src/db/pool');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/v1/products — should return products list', async () => {
    (query as jest.Mock).mockResolvedValue([{ count: '0' }]);
    const res = await request(app).get('/api/v1/products');
    expect(res.status).toBe(200);
  });

  it('POST /api/v1/products — should require authentication', async () => {
    const res = await request(app).post('/api/v1/products').send({ title: 'Test' });
    expect(res.status).toBe(401);
  });
});

describe('Category Routes', () => {
  const { query } = require('../src/db/pool');

  it('GET /api/v1/categories — should return categories', async () => {
    (query as jest.Mock).mockResolvedValue([
      { id: '1', name: 'Vegetables', slug: 'vegetables' }
    ]);
    const res = await request(app).get('/api/v1/categories');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('categories');
  });
});

describe('AI Routes', () => {
  it('POST /api/v1/ai/price-advisor — should require authentication', async () => {
    const res = await request(app).post('/api/v1/ai/price-advisor').send({ crop: 'tomato' });
    expect(res.status).toBe(401);
  });

  it('POST /api/v1/ai/chat — should require authentication', async () => {
    const res = await request(app).post('/api/v1/ai/chat').send({ message: 'hello' });
    expect(res.status).toBe(401);
  });
});

describe('Rate Limiting', () => {
  it('should include rate limit headers', async () => {
    const res = await request(app).get('/api/v1/categories');
    expect(res.headers).toHaveProperty('ratelimit-limit');
  });
});
