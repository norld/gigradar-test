/**
 * Fastify server instance
 *
 * Main server configuration with middleware registration, route handlers,
 * and error handling. Provides a cached server instance for warm starts
 * in Vercel's serverless environment.
 *
 * @module server
 */

import fastify from 'fastify';
import { validatePayloadSize } from './middleware/validation';
import { trackRequestTimeout } from './middleware/timeout';
import { logRequest, logger } from './middleware/logger';
import { registerWebhookRoutes } from './routes/webhook';
import { registerHealthRoutes } from './routes/health';

/**
 * Cached server instance
 *
 * The server instance is created once and reused across warm invocations
 * to improve cold start performance in Vercel's serverless environment.
 */
let serverInstance: ReturnType<typeof fastify> | null = null;

/**
 * Get or create the Fastify server instance
 *
 * Creates a new Fastify server on first call and caches it for subsequent
 * calls. Returns the cached instance for warm starts.
 *
 * @returns {FastifyInstance} Fastify server instance
 *
 * @example
 * ```ts
 * import { getServer } from './src/server';
 *
 * const server = getServer();
 * await server.ready();
 * ```
 */
export function getServer() {
  if (serverInstance) {
    return serverInstance;
  }

  // Create Fastify instance
  const server = fastify({
    logger: false, // Disable built-in logger, using custom Pino logger
    disableRequestLogging: true, // Disable request logging, using custom middleware
    trustProxy: true, // Trust Vercel's proxy headers
  });

  // Register middleware
  server.addHook('onRequest', validatePayloadSize);
  server.addHook('onRequest', trackRequestTimeout);
  server.addHook('onRequest', logRequest);

  // Register error handler
  server.setErrorHandler((error, request, reply) => {
    logger.error(
      {
        err: error,
        method: request.method,
        path: request.url,
        requestId: (request as unknown as { requestId: string }).requestId,
      },
      'Request failed with error'
    );

    // Handle validation errors
    if (error.validation) {
      reply.status(400).send({
        error: 'Validation failed',
        message: error.message,
      });
      return;
    }

    // Handle other errors
    reply.status(500).send({
      error: 'Internal server error',
      message: 'An unexpected error occurred',
    });
  });

  // Register 404 handler
  server.setNotFoundHandler((request, reply) => {
    logger.warn(
      {
        method: request.method,
        path: request.url,
        requestId: (request as unknown as { requestId: string }).requestId,
      },
      'Route not found'
    );

    reply.status(404).send({
      error: 'Not found',
      message: `Route ${request.method} ${request.url} not found`,
    });
  });

  // Register routes
  registerWebhookRoutes(server);
  registerHealthRoutes(server);

  // Cache server instance
  serverInstance = server;

  logger.info('Server instance created and cached');

  return server;
}

/**
 * Start the server (for local development)
 *
 * Starts the Fastify server listening on the configured port.
 * Only used in local development, not in Vercel serverless environment.
 *
 * @param {number} [port] - Port to listen on (defaults to env.PORT or 3000)
 * @returns {Promise<void>}
 *
 * @example
 * ```ts
 * import { startServer } from './src/server';
 * await startServer();
 * ```
 */
export async function startServer(port?: number): Promise<void> {
  const server = getServer();

  const listenPort = port ?? Number.parseInt(process.env.PORT ?? '3000', 10);

  try {
    await server.listen({
      port: listenPort,
      host: '0.0.0.0',
    });
    logger.info(`Server listening on http://0.0.0.0:${listenPort}`);
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    throw error;
  }
}

/**
 * Start server if running directly (not imported)
 */
if (require.main === module) {
  startServer().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
}
