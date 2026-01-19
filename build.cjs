const { build } = require('esbuild');
const fs = require('fs');

(async () => {
  try {
    console.log('Starting build...');
    console.log('Current directory:', process.cwd());
    console.log('Files in api directory:', fs.readdirSync('api').filter(f => !f.includes('node_modules')));

    await build({
      entryPoints: ['api/entry.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      outfile: 'api/index.js',
      external: ['@vercel/node', 'fastify', 'pino', 'zod'],
      logLevel: 'verbose',
    });

    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed with error:');
    console.error(error);
    process.exit(1);
  }
})();
