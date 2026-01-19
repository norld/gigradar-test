/**
 * Vitest setup file
 *
 * Configures the test environment and global test utilities.
 */

import { beforeEach, vi } from 'vitest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error'; // Reduce noise in test output
process.env.PORT = '3001';

// Reset modules before each test
beforeEach(() => {
  vi.clearAllMocks();
});
