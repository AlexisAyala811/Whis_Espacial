import test from 'node:test';
import assert from 'node:assert/strict';
import {nextPowerMove,waliHint,WALI_FACTS} from '../../src/core/wali-policy.js';

test('Wali offers a valid next step for every non-complete electrical configuration',()=>{
  for(let state=0;state<7;state++){
    let buses=[0,1,2].map(i=>!!(state&(1<<i)));const seen=new Set();
    for(let step=0;step<8&&!buses.every(Boolean);step++){
      const key=buses.join(',');assert.ok(!seen.has(key),'Wali repeated a state');seen.add(key);
      const move=nextPowerMove(buses);assert.ok(Number.isInteger(move)&&move>=0&&move<=2);
      for(let i=Math.max(0,move-1);i<=Math.min(2,move+1);i++)buses[i]=!buses[i];
    }
    assert.ok(buses.every(Boolean),'La pista no resuelve la configuración');
  }
  assert.equal(nextPowerMove([true,true,true]),null);
});
test('Wali adapts hints to mission progress and solar exercise',()=>{
  assert.match(waliHint({scene:'suit',checks:2}),/2 de 3/);
  assert.match(waliHint({scene:'ared',reps:4}),/4 de 6/);
  assert.match(waliHint({scene:'eva'}),/oxígeno/i);
  assert.match(waliHint({scene:'mars-base',sol:2,shield:1,shieldNeeded:3}),/3 unidades/);
  assert.match(waliHint({scene:'mars-habitat',near:'console'}),/Pulsa E/);
  assert.match(waliHint({scene:'suit',stage:2,sceneIndex:0}),/puerta abierta/);
  assert.match(waliHint({scene:'ship',completed:true,stage:7,sceneIndex:6}),/Descender a Marte/);
});
test('every scenario has a short educational fact',()=>{
  for(const id of ['suit','ared','mental','eva','habitat','vab','ship','mars-surface','mars-habitat','mars-base'])assert.ok(WALI_FACTS[id]?.length>20,id);
});
