/**
 * Environment loading unit tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { config } from '../../src/config/env';

describe('Environment Configuration', () => {
  beforeEach(() => {
    // Reset environment before each test
    vi.restoreAllMocks();
  });

  it('should load required environment variables', () => {
    // These should be set by test setup or CI/CD
    expect(config.TELEGRAM_BOT_TOKEN).toBeDefined();
    expect(config.OPEN_AI_TOKEN).toBeDefined();
  });

  it('should have default values for optional variables', () => {
    // LOG_LEVEL is set to 'error' in test setup
    expect(config.LOG_LEVEL).toBe('error');
    expect(config.NODE_ENV).toBe('test');
    expect(config.PORT).toBe(3001); // Set in test setup
  });

  it('should freeze the config object', () => {
    expect(Object.isFrozen(config)).toBe(true);
  });
});
