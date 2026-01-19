/**
 * Logging middleware module
 *
 * Provides structured JSON logging with Pino including request correlation,
 * sensitive data redaction, and child logger patterns for request-scoped logging.
 *
 * @module middleware/logger
 */

import pino from 'pino';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { getLogLevel } from '../config/env';
import type { LogEntry } from '../types/logger';

/**
 * Create custom serializers for redacting sensitive data
 *
 * Redacts TELEGRAM_BOT_TOKEN and OPEN_AI_TOKEN from logs to prevent
 * accidental exposure of credentials in log output.
 */
const serializers = {
  /** Redact Telegram bot token */
  TELEGRAM_BOT_TOKEN: () => '[REDACTED]',
  /** Redact OpenAI token */
  OPEN_AI_TOKEN: () => '[REDACTED]',
  /** Serialize error objects */
  err: (err: Error) => ({
    type: err.constructor.name,
    message: err.message,
    stack: err.stack,
  }),
};

/**
 * Base Pino logger instance
 *
 * Structured JSON logger with custom serializers for sensitive data.
 * Used as the parent logger for all application logging.
 *
 * @example
 * ```ts
 * import { logger } from '../middleware/logger';
 *
 * logger.info({ userId: 123 }, 'User logged in');
 * logger.error({ err }, 'Database connection failed');
 * ```
 */
export const logger = pino({
  level: getLogLevel(),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  serializers: {
    ...serializers,
    error: serializers.err,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Request logging middleware
 *
 * Logs all incoming HTTP requests with method, path, status code,
 * and unique request ID for correlation. Attaches a child logger
 * to the request object for request-scoped logging.
 *
 * @param req - Fastify request object
 * @param reply - Fastify reply object
 * @param done - Callback to continue middleware chain
 *
 * @example
 * ```ts
 * fastify.addHook('onRequest', logRequest);
 * ```
 */
export function logRequest(req: FastifyRequest, reply: FastifyReply, done: () => void): void {
  // Generate unique request ID for correlation
  const requestId = crypto.randomUUID();

  // Attach child logger to request
  const childLogger = logger.child({ requestId });
  req.log = childLogger as unknown as FastifyRequest['log'];
  (req as unknown as { requestId: string }).requestId = requestId;

  // Log request details
  const logData: Partial<LogEntry> = {
    method: req.method,
    path: req.url,
    requestId,
  };

  req.log.info(logData, 'Incoming request');

  // Log response when complete
  reply.raw.on('finish', () => {
    req.log.info(
      {
        ...logData,
        statusCode: reply.statusCode,
      },
      'Request completed'
    );
  });

  done();
}

/**
 * Create a child logger with additional context
 *
 * Creates a child logger with predefined context for use in
 * specific modules or operations.
 *
 * @param {Record<string, unknown>} context - Context to attach to all log entries
 * @returns Child logger instance
 *
 * @example
 * ```ts
 * const dbLogger = createChildLogger({ module: 'database' });
 * dbLogger.info('Connected to database');
 * ```
 */
export function createChildLogger(context: Record<string, unknown>): pino.Logger {
  return logger.child(context);
}
