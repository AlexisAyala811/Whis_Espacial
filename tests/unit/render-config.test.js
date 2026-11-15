import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer as createTcpServer } from 'node:net';
import { once } from 'node:events';

// Exercise the actual entry point with Render's environment, without contacting external APIs.
test('Render binds to all interfaces on its assigned port and accepts its public origin', async () => {
  const probe = createTcpServer();
  await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve));
  const port = probe.address().port;
  await new Promise(resolve => probe.close(resolve));
  const child = spawn(process.execPath, ['server/index.js'], {
    cwd: process.cwd(),
    env: { ...process.env, RENDER: 'true', PORT: String(port), RENDER_EXTERNAL_URL: 'https://ares-test.onrender.com', ALLOWED_ORIGIN: '', GEMINI_API_KEY: '' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  try {
    const [chunk] = await Promise.race([
      once(child.stdout, 'data'),
      once(child, 'exit').then(([code]) => { throw new Error(`Server exited early (${code})`); }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Server startup timed out')), 10000).unref()),
    ]);
    assert.match(String(chunk), new RegExp(`0\\.0\\.0\\.0:${port}`));
    const base = `http://127.0.0.1:${port}`;
    assert.equal((await fetch(base + '/')).status, 200);
    const sameOrigin = await fetch(base + '/api/live-token', { headers: { Origin: 'https://ares-test.onrender.com' } });
    assert.equal(sameOrigin.status, 503); // Allowed; no Gemini key configured.
    const foreignOrigin = await fetch(base + '/api/live-token', { headers: { Origin: 'https://example.org' } });
    assert.equal(foreignOrigin.status, 403);
  } finally {
    child.kill();
    if (child.exitCode === null && child.signalCode === null) await once(child, 'exit');
  }
});
