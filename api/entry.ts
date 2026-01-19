import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getServer } from './lib/server';

const handler = async (req: VercelRequest, res: VercelResponse): Promise<void> => {
  try {
    console.log('Handler invoked:', req.url);
    const server = getServer();
    console.log('Server obtained, injecting request');

    const requestUrl = req.url || '/';
    const response = await server.inject({
      method: (req.method as any) || 'GET',
      url: requestUrl,
      headers: req.headers as Record<string, string>,
      body: req.body,
    });

    console.log('Response status:', response.statusCode);
    res.status(response.statusCode);

    if (response.headers) {
      for (const [key, value] of Object.entries(response.headers)) {
        if (typeof value === 'string') {
          res.setHeader(key, value);
        }
      }
    }

    if (response.body) {
      res.send(response.body);
    } else {
      res.end();
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

module.exports = handler;
