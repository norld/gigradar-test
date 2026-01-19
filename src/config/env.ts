/**
 * Environment configuration module
 *
 * Handles loading and validation of environment variables.
 * Fails fast on missing required variables with clear error messages.
 * Configuration is frozen after validation to prevent runtime mutations.
 *
 * @module config/env
 */

import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
import type { EnvironmentConfig } from '../types/env';

// Load environment variables from .env file (if present)
loadEnv();

/**
 * Zod schema for environment variable validation
 *
 * Validates format and presence of required environment variables.
 * Provides clear error messages when validation fails.
 * In test mode, variables can be mocked or optional.
 */
const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z
    .string()
    .min(1, 'TELEGRAM_BOT_TOKEN cannot be empty')
    .regex(/^\d+:[A-Za-z0-9_-]+$/, 'TELEGRAM_BOT_TOKEN format is invalid')
    .optional(),
  OPEN_AI_TOKEN: z
    .string()
    .min(1, 'OPEN_AI_TOKEN cannot be empty')
    .startsWith('sk-', 'OPEN_AI_TOKEN must start with "sk-"')
    .optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
  PORT: z.coerce.number().int().positive().max(65535).optional(),
});

/**
 * Get a test value or throw for required vars
 */
function getRequiredOrTest(value: string | undefined, key: string): string {
  const isTest = process.env.NODE_ENV === 'test';
  if (value === undefined && !isTest) {
    throw new Error(`${key} is required in non-test environment`);
  }
  return value ?? `test_${key.toLowerCase()}_placeholder`;
}

/**
 * Validated environment configuration
 *
 * Contains all environment variables validated against the schema.
 * This object is frozen to prevent runtime modifications.
 *
 * @throws {z.ZodError} When environment variables are missing or invalid
 *
 * @example
 * ```ts
 * import { config } from '../config/env';
 *
 * console.log(config.TELEGRAM_BOT_TOKEN);
 * console.log(config.LOG_LEVEL ?? 'info');
 * ```
 */
export const config = Object.freeze(
  (() => {
    const validated = envSchema.parse(process.env);

    return {
      TELEGRAM_BOT_TOKEN: getRequiredOrTest(validated.TELEGRAM_BOT_TOKEN, 'TELEGRAM_BOT_TOKEN'),
      OPEN_AI_TOKEN: getRequiredOrTest(validated.OPEN_AI_TOKEN, 'OPEN_AI_TOKEN'),
      LOG_LEVEL: validated.LOG_LEVEL ?? 'info',
      NODE_ENV: validated.NODE_ENV ?? 'development',
      PORT: validated.PORT ?? 3000,
    } as const satisfies EnvironmentConfig;
  })()
);

/**
 * Get the current log level
 *
 * Returns the configured log level, defaulting to 'info' if not set.
 *
 * @returns Log level
 */
export function getLogLevel(): 'debug' | 'info' | 'warn' | 'error' {
  return config.LOG_LEVEL ?? 'info';
}

/**
 * Check if running in development mode
 *
 * @returns True if NODE_ENV is 'development'
 */
export function isDevelopment(): boolean {
  return config.NODE_ENV === 'development';
}

/**
 * Check if running in production mode
 *
 * @returns True if NODE_ENV is 'production'
 */
export function isProduction(): boolean {
  return config.NODE_ENV === 'production';
}

/**
 * Check if running in test mode
 *
 * @returns True if NODE_ENV is 'test'
 */
export function isTest(): boolean {
  return config.NODE_ENV === 'test';
}
