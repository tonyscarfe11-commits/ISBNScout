import { beforeAll, afterAll, afterEach } from 'vitest';
import dotenv from 'dotenv';

// Set NODE_ENV first, before any modules are loaded
process.env.NODE_ENV = 'test';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Global test setup
beforeAll(() => {
  console.log('🧪 Test suite starting...');
});

afterAll(() => {
  console.log('✅ Test suite complete');
});

afterEach(() => {
  // Cleanup after each test if needed
});
