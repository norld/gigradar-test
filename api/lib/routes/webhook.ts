/**
 * Webhook route handler
 *
 * Handles incoming Telegram webhook POST requests.
 * Validates payload, processes messages with AI, and sends responses.
 *
 * @module routes/webhook
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import type { WebhookRequest } from '../types/webhook';
import { processMessage } from '../services/messageProcessor';

/**
 * Webhook request body schema
 *
 * Validates the structure of incoming Telegram webhook requests.
 * Requires at least update_id and one of message, callback_query, etc.
 */
const webhookBodySchema = z.object({
  update_id: z.number().int().positive(),
  message: z.object({
    message_id: z.number().int().positive(),
    from: z.object({
      id: z.number().int().positive(),
      is_bot: z.boolean(),
      first_name: z.string(),
    }),
    chat: z.object({
      id: z.number().int().positive(),
      type: z.enum(['private', 'group', 'supergroup', 'channel']),
    }),
    date: z.number().int().nonnegative(),
  }).optional(),
});

/**
 * Webhook route handler
 *
 * Accepts POST requests from Telegram Bot API, validates the payload,
 * processes messages with AI, and sends responses back to users.
 *
 * @param req - Fastify request object
 * @param reply - Fastify reply object
 * @returns {Promise<void>}
 *
 * @example
 * ```ts
 * // POST /api/webhook
 * // Request body:
 * // {
 * //   "update_id": 123456789,
 * //   "message": {
 * //     "message_id": 1,
 * //     "from": { "id": 987654321, "is_bot": false, "first_name": "John" },
 * //     "chat": { "id": 987654321, "type": "private" },
 * //     "date": 1705702400,
 * //     "text": "Hello, bot!"
 * //   }
 * // }
 *
 * // Response (immediate acknowledgement):
 * // {
 * //   "ok": true,
 * //   "message": "Processing"
 * // }
 * //
 * // // AI response sent asynchronously via Telegram API
 * ```
 */
export async function webhookHandler(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    // Validate request body against schema
    const body = webhookBodySchema.parse(req.body) as WebhookRequest;

    // Log webhook receipt
    req.log.info(
      {
        updateId: body.update_id,
        hasMessage: !!body.message,
        hasCallback: !!body.callback_query,
      },
      'Webhook received'
    );

    // Send immediate acknowledgement (Telegram requires 200 OK within 30s)
    await reply.status(200).send({
      ok: true,
      message: 'Processing',
    });

    // Process message asynchronously (don't block response)
    if (body.message) {
      // Process in background without blocking the response
      setImmediate(async () => {
        try {
          await processMessage(body.message!);
        } catch (error) {
          req.log.error({ err: error, updateId: body.update_id }, 'Message processing failed');
        }
      });
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      req.log.warn({ error: error.errors }, 'Webhook validation failed');
      await reply.status(400).send({
        error: 'Validation failed',
        message: error.errors[0]?.message ?? 'Invalid request payload',
      });
      return;
    }

    req.log.error({ err: error }, 'Webhook processing failed');
    throw error;
  }
}

/**
 * Register webhook routes
 *
 * Registers the webhook POST endpoint with Fastify.
 *
 * @param fastify - Fastify server instance
 *
 * @example
 * ```ts
 * import { registerWebhookRoutes } from '../routes/webhook';
 * registerWebhookRoutes(fastify);
 * ```
 */
export async function registerWebhookRoutes(fastify: FastifyInstance): Promise<void> {
  fastify.post(
    '/webhook',
    {
      schema: {
        description: 'Telegram webhook endpoint',
        tags: ['Webhooks'],
        body: {
          type: 'object',
          properties: {
            update_id: { type: 'number' },
            message: {
              type: 'object',
              properties: {
                message_id: { type: 'number' },
                from: { type: 'object' },
                chat: { type: 'object' },
                date: { type: 'number' },
              },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              ok: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    webhookHandler
  );
}
