/**
 * Vercel serverless function entry point
 *
 * This file serves as the entry point for Vercel's serverless functions.
 * It imports the Fastify server instance and forwards HTTP requests to it.
 *
 * @module index
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getServer } from '../src/server';

/**
 * Vercel serverless function handler
 *
 * Handles incoming HTTP requests from Vercel and forwards them to the
 * Fastify server instance. The server instance is cached for warm starts.
 *
 * @param {VercelRequest} req - Incoming request from Vercel
 * @param {VercelResponse} res - Response object to send to client
 * @returns {Promise<void>}
 *
 * @example
 * ```ts
 * // GET /api/health
 * {
 *   "status": "healthy",
 *   "timestamp": "2025-01-19T...",
 *   "uptime": 12345
 * }
 *
 * // POST /api/webhook
 * {
 *   "ok": true,
 *   "message": "Webhook received"
 * }
 * ```
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Get or create the Fastify server instance
  const server = getServer();

  // Ensure server is ready
  await server.ready();

  // Forward the request to Fastify
  server.server.emit('request', req, res);
}
