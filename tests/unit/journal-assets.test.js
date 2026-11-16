import test from 'node:test';
import assert from 'node:assert/strict';
import { server } from '../../server/index.js';

test('journal landing, playable game, and video seeking are served', async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const landing = await fetch(base + '/');
    assert.equal(landing.status, 200);
    assert.match(await landing.text(), /assets\/journal\/index-/);
    const game = await fetch(base + '/game.html');
    assert.equal(game.status, 200);
    assert.match(await game.text(), /id="deploy"/);
    const video = base + '/assets/journal/media/00-intro.mp4';
    const partial = await fetch(video, { headers: { Range: 'bytes=0-15' } });
    assert.equal(partial.status, 206);
    assert.equal(partial.headers.get('content-type'), 'video/mp4');
    assert.match(partial.headers.get('content-range'), /^bytes 0-15\/\d+$/);
    assert.equal((await partial.arrayBuffer()).byteLength, 16);
    const suffix = await fetch(video, { headers: { Range: 'bytes=-10' } });
    assert.equal(suffix.status, 206);
    assert.equal((await suffix.arrayBuffer()).byteLength, 10);
    const invalid = await fetch(video, { headers: { Range: 'bytes=999999999-' } });
    assert.equal(invalid.status, 416);
    assert.match(invalid.headers.get('content-range'), /^bytes \*\/\d+$/);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
