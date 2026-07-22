// Test environment setup
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-at-least-32-characters-long-for-tests';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-at-least-32-chars-long';
process.env.BCRYPT_ROUNDS = '4'; // Low rounds for test speed
process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/agribid_test';
process.env.PORT = '4001';
process.env.PLATFORM_FEE_PERCENT = '2.5';
process.env.RATE_LIMIT_MAX = '10000'; // High limit for tests
