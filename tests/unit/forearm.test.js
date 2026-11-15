import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as THREE from 'three';
import {GLTFLoader} from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {createFirstPersonArms} from '../../src/rendering/first-person-arms.js';

test('forearm model is compact and embeds its textures', async () => {
  const data = await readFile(new URL('../../assets/models/ares-forearm/ares-forearm.glb', import.meta.url));
  assert.equal(data.readUInt32LE(0), 0x46546c67);
  assert.equal(data.readUInt32LE(8), data.length);
  const size = data.readUInt32LE(12);
  const gltf = JSON.parse(data.subarray(20, 20 + size).toString('utf8'));
  assert.ok(gltf.accessors[0].count < 15000);
  assert.equal(gltf.images.length, 2);
  assert.ok(gltf.images.every(image => image.bufferView !== undefined && !image.uri));
});

test('forearms and gloves fall back independently if either model fails', () => {
  const originalModelLoad=GLTFLoader.prototype.load, originalTextureLoad=THREE.TextureLoader.prototype.load;
  try {
    THREE.TextureLoader.prototype.load=()=>new THREE.Texture();
    for(const failing of ['ares-forearm','ares-glove']){
      GLTFLoader.prototype.load=(url,onLoad,_progress,onError)=>{
        if(url.includes(failing)){onError(new Error('unavailable'));return;}
        const geometry=new THREE.BufferGeometry();
        geometry.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,.02,.01,-.14,-.02,.01,-.23],3));
        const scene=new THREE.Group();scene.add(new THREE.Mesh(geometry,new THREE.MeshStandardMaterial()));onLoad({scene});
      };
      const camera=new THREE.PerspectiveCamera();
      const controller=createFirstPersonArms(camera,new THREE.Texture(),{matches:false});
      assert.equal(camera.getObjectByName('procedural-forearm').visible, failing==='ares-forearm');
      assert.equal(camera.getObjectByName('procedural-glove').visible, failing==='ares-glove');
      assert.equal(Boolean(camera.getObjectByName('ares-textured-forearm')),failing!=='ares-forearm');
      assert.equal(Boolean(camera.getObjectByName('ares-textured-glove')),failing!=='ares-glove');
      assert.doesNotThrow(()=>{controller.trigger('interact');controller.update(.05)});
    }
  } finally {GLTFLoader.prototype.load=originalModelLoad;THREE.TextureLoader.prototype.load=originalTextureLoad;}
});
