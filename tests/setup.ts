import { beforeAll } from 'vitest';
import { config } from '../server/config/environment';

beforeAll(() => {
  // Ensure we're using test environment
  process.env.NODE_ENV = 'test';
  
  // Verify test database is configured
  if (!config.DATABASE_URL.includes('test') && !config.DATABASE_URL.includes('local')) {
    console.warn('Warning: Not using a test database. Tests should use a separate database.');
  }
  
  console.log('Test environment initialized');
});