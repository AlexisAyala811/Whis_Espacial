import test from 'node:test';
import assert from 'node:assert/strict';
import {LEARNING_ROOMS,LearningProgress} from '../../src/core/learning-catalog.js';

test('every room has inspectable equipment and a sourced learning activity',()=>{
  assert.equal(LEARNING_ROOMS.length,7);
  const items=LEARNING_ROOMS.flatMap(room=>room.objects);
  assert.equal(items.length,19);
  assert.equal(new Set(items.map(item=>item.id)).size,19);
  for(const item of items){
    assert.equal(item.position.length,3);
    assert.ok(item.options[item.answer]);
    assert.equal(new URL(item.source).protocol,'https:');
  }
});
test('inspection feedback teaches after errors and counts each mastered object only once',()=>{
  const progress=new LearningProgress(),item=LEARNING_ROOMS[0].objects[0];
  assert.equal(progress.answer(item.id,1-item.answer).correct,false);
  assert.equal(progress.mastered.size,0);
  assert.equal(progress.visited.size,1);
  assert.equal(progress.answer(item.id,item.answer).explanation,item.explanation);
  progress.answer(item.id,item.answer);
  assert.equal(progress.mastered.size,1);
  assert.equal(progress.answer('missing',0),null);
  assert.equal(progress.answer(item.id,20),null);
});
