import test from 'node:test';
import assert from 'node:assert/strict';
import {findNearbyLearningObject} from '../../src/core/object-proximity.js';
import {LEARNING_ROOMS} from '../../src/core/learning-catalog.js';

test('nearby information follows the nearest reachable object',()=>{
  const items=[{id:'far',position:[3,2,0]},{id:'near',position:[1,2,0]},{id:'above',position:[0,9,0]}];
  assert.equal(findNearbyLearningObject(items,{x:0,y:1.7,z:0}).id,'near');
  assert.equal(findNearbyLearningObject(items,{x:10,y:1.7,z:0}),null);
  assert.equal(findNearbyLearningObject([{id:'tall',position:[1,5,0]}],{x:0,y:1.7,z:0}).id,'tall');
});

test('all educational objects include additional context and a source',()=>{
  const items=LEARNING_ROOMS.flatMap(room=>room.objects);
  assert.equal(items.length,19);
  for(const item of items){assert.ok(item.details.length>70,item.id);assert.match(item.source,/^https:\/\//);}
});
