import test from 'node:test';
import assert from 'node:assert/strict';
import { BufferAttribute } from 'three';
import { readFile } from 'node:fs/promises';
import { createGloveCurl } from '../../src/rendering/glove-morph.js';

test('glove curl preserves the wrist and smoothly bends the fingers', () => {
  const positions = new BufferAttribute(new Float32Array([.02, .01, 0, .02, .01, -.14, .02, .01, -.23]), 3);
  const result = createGloveCurl(positions);
  assert.equal(result.length, 9);
  assert.ok(Math.abs(result[0] - .02) < 1e-6);
  assert.ok(Math.abs(result[1] - .01) < 1e-6);
  assert.ok(Math.abs(result[2]) < 1e-6);
  assert.ok(result[4] < result[1]);
  assert.ok(result[7] < result[4]);
  assert.ok([...result].every(Number.isFinite));
});

test('optimized textured glove is a self-contained glTF asset', async () => {
  const data = await readFile(new URL('../../assets/models/ares-glove/ares-glove.glb', import.meta.url));
  assert.equal(data.readUInt32LE(0), 0x46546c67);
  assert.equal(data.readUInt32LE(4), 2);
  assert.equal(data.readUInt32LE(8), data.length);
  const jsonLength = data.readUInt32LE(12);
  assert.equal(data.readUInt32LE(16), 0x4e4f534a);
  const model = JSON.parse(data.subarray(20, 20 + jsonLength).toString('utf8'));
  assert.ok(model.meshes[0].primitives[0].attributes.POSITION >= 0);
  assert.equal(model.images.length, 2);
  assert.ok(model.images.every(image => image.bufferView !== undefined && !image.uri));
  assert.ok(model.accessors[0].count < 10000);
});

import * as THREE from 'three';
import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { createFirstPersonArms } from '../../src/rendering/first-person-arms.js';

test('both textured gloves animate and preserve a fallback and reduced motion', () => {
  const originalModelLoad = GLTFLoader.prototype.load;
  const originalTextureLoad = THREE.TextureLoader.prototype.load;
  try {
    THREE.TextureLoader.prototype.load = () => new THREE.Texture();
    GLTFLoader.prototype.load = (_url, onLoad) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0, .02, .01, -.14, -.02, .01, -.23], 3));
      const scene = new THREE.Group();
      scene.add(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial()));
      onLoad({ scene });
    };
    const camera = new THREE.PerspectiveCamera();
    const controller = createFirstPersonArms(camera, new THREE.Texture(), { matches: false });
    const gloves = [];
    camera.traverse(object => { if (object.name === 'ares-textured-glove') gloves.push(object); });
    assert.equal(gloves.length, 2);
    assert.equal(camera.getObjectByName('procedural-glove').visible, false);
    controller.trigger('interact');
    controller.update(.05);
    for (const glove of gloves) {
      let mesh;
      glove.traverse(object => { if (object.isMesh) mesh = object; });
      assert.ok(mesh.morphTargetInfluences[0] > 0);
    }
    const reducedCamera = new THREE.PerspectiveCamera();
    const reduced = createFirstPersonArms(reducedCamera, new THREE.Texture(), { matches: true });
    reduced.trigger('interact');
    reduced.update(.05);
    let reducedMesh;
    reducedCamera.getObjectByName('ares-textured-glove').traverse(object => { if (object.isMesh) reducedMesh = object; });
    assert.equal(reducedMesh.morphTargetInfluences[0], 0);
    GLTFLoader.prototype.load = (_url, _onLoad, _progress, onError) => onError(new Error('unavailable'));
    const fallbackCamera = new THREE.PerspectiveCamera();
    createFirstPersonArms(fallbackCamera, new THREE.Texture(), { matches: false });
    assert.equal(fallbackCamera.getObjectByName('procedural-glove').visible, true);
    assert.equal(fallbackCamera.getObjectByName('ares-textured-glove'), undefined);
  } finally {
    GLTFLoader.prototype.load = originalModelLoad;
    THREE.TextureLoader.prototype.load = originalTextureLoad;
  }
});
