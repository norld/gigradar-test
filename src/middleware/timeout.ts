/**
 * Execution timeout tracking middleware
 *
 * Tracks request execution time and logs warnings at 80% of the
 * Vercel Hobby limit (8 seconds). Helps identify slow requests
 * that may approach the 10-second timeout threshold.
 *
 * @module middleware/timeout
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

/** Warning threshold at 80% of Vercel Hobby limit (10 seconds) */
const TIMEOUT_WARNING_THRESHOLD = 8000;

/**
 * Track request execution time
 *
 * Middleware that tracks how long requests take and logs warnings
 * when execution time exceeds 80% of the Vercel Hobby limit.
 *
 * @param {FastifyRequest} req - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 *
 * @example
 * ```ts
 * fastify.addHook('onRequest', trackRequestTimeout);
 * ```
 */
export function trackRequestTimeout(req: FastifyRequest, reply: FastifyReply): void {
  const startTime = Date.now();

  // Log warning when response time exceeds threshold
  reply.raw.on('finish', () => {
    const duration = Date.now() - startTime;

    if (duration > TIMEOUT_WARNING_THRESHOLD) {
      req.log.warn(
        {
          method: req.method,
          path: req.url,
          duration,
          threshold: TIMEOUT_WARNING_THRESHOLD,
        },
        'Request execution time approaching timeout limit'
      );
    }
  });
}

/**
 * Get the timeout warning threshold
 *
 * Returns the threshold in milliseconds for logging slow requests.
 *
 * @returns Timeout warning threshold in milliseconds
 */
export function getTimeoutThreshold(): number {
  return TIMEOUT_WARNING_THRESHOLD;
}
