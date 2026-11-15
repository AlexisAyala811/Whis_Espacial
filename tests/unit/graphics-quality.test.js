import test from 'node:test';
import assert from 'node:assert/strict';
import {QUALITY_PRESETS,qualityName} from '../../src/core/graphics-quality.js';
test('quality presets are ordered and invalid saved values fall back safely',()=>{
 assert.deepEqual(Object.keys(QUALITY_PRESETS),['low','medium','high','ultra']);
 assert.equal(qualityName('invalid'),'medium');assert.equal(qualityName('high'),'high');
 assert.ok(QUALITY_PRESETS.low.pixelRatio<QUALITY_PRESETS.high.pixelRatio);
 assert.equal(QUALITY_PRESETS.medium.shadows,false);assert.equal(QUALITY_PRESETS.high.shadows,true);
 assert.ok(QUALITY_PRESETS.ultra.shadowSize>QUALITY_PRESETS.high.shadowSize);
});
