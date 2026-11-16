import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('all player-facing pages request English without automatic translation', async () => {
  for (const page of ['index.html', 'game.html', 'mars.html', 'habitat.html', 'outpost.html', 'resources.html']) {
    const html = await readFile(new URL(`../../${page}`, import.meta.url), 'utf8');
    assert.match(html, /<html\b[^>]*lang="en"[^>]*translate="no"[^>]*class="notranslate"/i, page);
    assert.match(html, /<meta name="google" content="notranslate">/i, page);
  }
  const game = await readFile(new URL('../../game.html', import.meta.url), 'utf8');
  assert.match(game, /Exploration paused/);
  assert.match(game, /SCENE TRANSITION/);
  assert.match(game, /Restart training/);
});
