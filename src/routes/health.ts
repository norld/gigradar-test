/**
 * Health check route handler
 *
 * Provides health status endpoint for monitoring systems and load balancers.
 * Returns service availability status, uptime, and dependency health checks.
 *
 * @module routes/health
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import type { HealthStatus } from '../types/health';

/**
 * Health check route handler
 *
 * Returns the current health status of the service including uptime,
 * version, and dependency health checks. Used by Vercel health checks
 * and external monitoring systems.
 *
 * @param _req - Fastify request object
 * @param reply - Fastify reply object
 * @returns {Promise<void>}
 *
 * @example
 * ```ts
 * // GET /api/health
 *
 * // Response:
 * // {
 * //   "status": "healthy",
 * //   "timestamp": "2026-01-19T12:34:56.789Z",
 * //   "uptime": 1234.567,
 * //   "version": "1.0.0",
 * //   "checks": {
 * //     "server": true,
 * //     "memory": true
 * //   }
 * // }
 * ```
 */
export async function healthHandler(_req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const memoryThreshold = 1024 * 1024 * 1024; // 1GB

  // Check memory health (boolean)
  const memoryHealthy = memoryUsage.heapUsed < memoryThreshold;

  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime,
    version: '1.0.0',
    checks: {
      server: true,
      memory: memoryHealthy,
    },
  };

  // Determine overall status based on checks
  const checks = health.checks ?? {};
  const allHealthy = Object.values(checks).every((status) => status === true);

  if (!allHealthy) {
    health.status = 'unhealthy';
    await reply.status(503).send(health);
    return;
  }

  await reply.status(200).send(health);
}

/**
 * Register health check routes
 *
 * Registers the health check GET endpoint with Fastify.
 *
 * @param fastify - Fastify server instance
 *
 * @example
 * ```ts
 * import { registerHealthRoutes } from '../routes/health';
 * registerHealthRoutes(fastify);
 * ```
 */
export async function registerHealthRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.get(
    '/api/health',
    {
      schema: {
        description: 'Health check endpoint',
        tags: ['Health'],
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', enum: ['healthy', 'unhealthy'] },
              timestamp: { type: 'string', format: 'date-time' },
              uptime: { type: 'number' },
              version: { type: 'string' },
              checks: {
                type: 'object',
                additionalProperties: { type: 'boolean' },
              },
            },
          },
          503: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              uptime: { type: 'number' },
              checks: { type: 'object' },
            },
          },
        },
      },
    },
    healthHandler
  );
}
