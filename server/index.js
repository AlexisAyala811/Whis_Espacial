import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { createNasaClient } from './nasa-data.js';
import { createLiveToken } from './gemini-token.js';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const envFile = join(root, '.env');
if (existsSync(envFile)) loadEnvFile(envFile);
const nasa = createNasaClient();
const port = Number(process.env.PORT ?? 8000);
const allowedOrigin = process.env.ALLOWED_ORIGIN ?? `http://127.0.0.1:${port}`;
const contentTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.md': 'text/plain; charset=utf-8' };

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(body));
}

function isAllowedOrigin(request) {
  const origin = request.headers.origin;
  return !origin || origin === allowedOrigin;
}

async function serveFile(response, requestPath) {
  let decoded;
  try { decoded = decodeURIComponent(requestPath); } catch { response.writeHead(400); response.end('Bad request'); return; }
  if (decoded.split(/[\\/]/).some(part => part.startsWith('.'))) { response.writeHead(403); response.end('Forbidden'); return; }
  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\//, '');
  const absolute = normalize(join(root, relative));
  const rootPath = normalize(root);
  if (absolute !== rootPath && !absolute.startsWith(`${rootPath}${process.platform === 'win32' ? '\\' : '/'}`)) {
    response.writeHead(403); response.end('Forbidden'); return;
  }
  try {
    const body = await readFile(absolute);
    response.writeHead(200, { 'Content-Type': contentTypes[extname(absolute)] ?? 'application/octet-stream' });
    response.end(body);
  } catch {
    response.writeHead(404); response.end('Not found');
  }
}

export const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? 'localhost'}`);
  if (url.pathname === '/api/nasa/solar' || url.pathname === '/api/nasa/apod') {
    if (request.method !== 'GET') return sendJson(response, 405, { error: 'method-not-allowed' });
    if (!isAllowedOrigin(request)) return sendJson(response, 403, { error: 'origin-not-allowed' });
    try { return sendJson(response, 200, await (url.pathname.endsWith('/solar') ? nasa.solar() : nasa.apod())); }
    catch { return sendJson(response, 503, { error: 'nasa-data-unavailable' }); }
  }
  if (url.pathname === '/api/live-token') {
    if (request.method !== 'GET') return sendJson(response, 405, { error: 'method-not-allowed' });
    if (!isAllowedOrigin(request)) return sendJson(response, 403, { error: 'origin-not-allowed' });
    try {
      const result = await createLiveToken({ apiKey: process.env.GEMINI_API_KEY, model: process.env.GEMINI_LIVE_MODEL });
      return sendJson(response, 200, result);
    } catch {
      return sendJson(response, 503, { error: 'voice-service-unavailable' });
    }
  }
  if (request.method !== 'GET') { response.writeHead(405); response.end('Method not allowed'); return; }
  await serveFile(response, url.pathname);
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  server.listen(port, '127.0.0.1', () => console.log(`Lunar Command 3D listening on http://127.0.0.1:${port}`));
}
