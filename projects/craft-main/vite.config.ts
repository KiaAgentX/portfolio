import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'gemini-api-dev-server',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/')) {
              res.setHeader('Content-Type', 'application/json');
              try {
                // Read request body
                const bodyStr = await new Promise<string>((resolve, reject) => {
                  let data = '';
                  req.on('data', chunk => data += chunk);
                  req.on('end', () => resolve(data));
                  req.on('error', reject);
                });
                
                const body = bodyStr ? JSON.parse(bodyStr) : {};
                
                if (req.url === '/api/generate') {
                  const { handleGenerate } = await import('./src/api-handlers.ts');
                  const result = await handleGenerate(body);
                  res.statusCode = 200;
                  res.end(JSON.stringify(result));
                } else if (req.url === '/api/generate-json') {
                  const { handleGenerateJson } = await import('./src/api-handlers.ts');
                  const result = await handleGenerateJson(body);
                  res.statusCode = 200;
                  res.end(JSON.stringify(result));
                } else {
                  res.statusCode = 404;
                  res.end(JSON.stringify({ error: 'Endpoint not found' }));
                }
              } catch (err: any) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
