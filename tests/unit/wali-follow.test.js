import test from 'node:test';
import assert from 'node:assert/strict';
import { waliTarget } from '../../src/core/wali-follow.js';

test('Wali se coloca delante y fuera del centro al cambiar de dirección', () => {
  assert.deepEqual(waliTarget({x:0,z:0},0),{x:.65,z:-1.8});
  const point=waliTarget({x:2,z:3},Math.PI/2);
  assert.ok(point.x<2 && point.z<3);
});
test('Wali busca otro sitio cuando hay un obstáculo', () => {
  const point=waliTarget({x:0,z:0},0,(x)=>x>0);
  assert.ok(point && point.x<0 && point.z<0);
  assert.equal(waliTarget({x:0,z:0},0,()=>true),null);
});

test('Wali puede variar su posición mientras el jugador está quieto', () => {
  const start=waliTarget({x:0,z:0},0,()=>false,0);
  const later=waliTarget({x:0,z:0},0,()=>false,3);
  assert.notDeepEqual(start,later);
  assert.ok(later.z<0);
});
