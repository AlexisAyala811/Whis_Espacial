import test from 'node:test';
import assert from 'node:assert/strict';

test('NASA routes return data, reject cross-origin requests and protect local configuration', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async url => {
    if (String(url).includes('DONKI-API')) return new Response(JSON.stringify([{beginTime:'2026-11-10T00:00Z',classType:'C1.0'}]));
    if (String(url).includes('planetary/apod')) return new Response(JSON.stringify({date:'2026-11-15',title:'Image',media_type:'image',url:'https://apod.nasa.gov/a.jpg'}));
    return originalFetch(url);
  };
  const { server } = await import('../../server/index.js');
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  try {
    const solar=await originalFetch(base+'/api/nasa/solar');assert.equal(solar.status,200);assert.equal((await solar.json()).count,1);
    const apod=await originalFetch(base+'/api/nasa/apod');assert.equal(apod.status,200);assert.equal((await apod.json()).title,'Image');
    assert.equal((await originalFetch(base+'/api/nasa/solar',{headers:{Origin:'https://example.org'}})).status,403);
    assert.equal((await originalFetch(base+'/.env')).status,403);
    assert.equal((await originalFetch(base+'/.env.example')).status,403);
    for (const path of ['/server/index.js','/tests/unit/nasa-server.test.js','/package.json','/work/']) {
      assert.equal((await originalFetch(base+path)).status,403, `private file exposed: ${path}`);
    }
    for (const path of ['/','/src/field.js','/src/glass-ui.css','/node_modules/three/build/three.module.js','/assets/models/ares-glove/ares-glove.glb']) {
      assert.equal((await originalFetch(base+path)).status,200, `public file unavailable: ${path}`);
    }
    const glb = await originalFetch(base+'/assets/models/ares-glove/ares-glove.glb');
    assert.equal(glb.headers.get('content-type'),'model/gltf-binary');
  } finally {await new Promise(resolve=>server.close(resolve));globalThis.fetch=originalFetch;}
});
