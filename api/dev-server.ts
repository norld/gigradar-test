/**
 * Development server script
 * Run directly with: tsx dev-server.ts
 */

import { startServer } from './src/server';

const port = Number.parseInt(process.env.PORT ?? '3000', 10);

console.log(`Starting development server on port ${port}...`);

startServer(port)
  .then(() => {
    console.log('✅ Development server started successfully');
  })
  .catch((error) => {
    console.error('❌ Failed to start development server:', error);
    process.exit(1);
  });
