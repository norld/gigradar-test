/**
 * Payload validation middleware
 *
 * Provides middleware for validating request payload size.
 * Enforces 3MB payload limit to prevent abuse and ensure
 * compliance with Vercel serverless constraints.
 *
 * @module middleware/validation
 */

import type { FastifyRequest, FastifyReply } from 'fastify';

/** Maximum payload size in bytes (3MB) */
const MAX_PAYLOAD_SIZE = 3 * 1024 * 1024;

/**
 * Validate payload size middleware
 *
 * Checks the content-length header before parsing the request body.
 * Returns 413 Payload Too Large if the payload exceeds 3MB.
 *
 * @param {FastifyRequest} req - Fastify request object
 * @param {FastifyReply} reply - Fastify reply object
 *
 * @example
 * ```ts
 * fastify.addHook('onRequest', validatePayloadSize);
 * ```
 */
export async function validatePayloadSize(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  const contentLength = req.headers['content-length'];

  if (contentLength !== undefined) {
    const size = parseInt(contentLength, 10);

    if (size > MAX_PAYLOAD_SIZE) {
      await reply.status(413).send({
        error: 'Payload too large',
        message: `Request body exceeds ${MAX_PAYLOAD_SIZE / (1024 * 1024)}MB limit`,
      });
      return;
    }
  }
}

/**
 * Get the maximum payload size
 *
 * Returns the configured maximum payload size in bytes.
 *
 * @returns Maximum payload size in bytes
 */
export function getMaxPayloadSize(): number {
  return MAX_PAYLOAD_SIZE;
}
