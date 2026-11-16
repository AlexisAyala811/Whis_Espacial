import * as THREE from 'three';
import { STLLoader } from '../../node_modules/three/examples/jsm/loaders/STLLoader.js';
import { QUALITY_KEY, QUALITY_PRESETS, qualityName } from '../core/graphics-quality.js';

// NASA's printable model is a single untextured mesh; these colors are an artistic adaptation.
export function loadNasaRocket(scene, fallback) {
  let active = true;
  new STLLoader().load('./assets/rocket/nasa-sls.stl', geometry => {
    if (!active) { geometry.dispose(); return; }
    const positions = geometry.getAttribute('position');
    const colors = new Float32Array(positions.count * 3);
    const orange = new THREE.Color('#ba773d');
    const white = new THREE.Color('#dddcd4');
    const dark = new THREE.Color('#424b4c');
    for (let i = 0; i < positions.count; i += 3) {
      const x = (positions.getX(i) + positions.getX(i + 1) + positions.getX(i + 2)) / 3;
      const z = (positions.getZ(i) + positions.getZ(i + 1) + positions.getZ(i + 2)) / 3;
      const color = z < 18 ? dark : Math.abs(x) < 10.7 && z < 151 ? orange : white;
      for (let j = 0; j < 3; j++) {
        colors[(i + j) * 3] = color.r;
        colors[(i + j) * 3 + 1] = color.g;
        colors[(i + j) * 3 + 2] = color.b;
      }
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.rotateX(-Math.PI / 2);
    geometry.scale(14.5 / 198.740875, 14.5 / 198.740875, 14.5 / 198.740875);
    const rocket = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .84, metalness: .1 }));
    rocket.name = 'nasa-sls-training-model';
    rocket.position.set(4.1, 0, -2.8);
    rocket.userData.graphicsDetail = 1;
    rocket.castShadow = true;
    rocket.receiveShadow = true;
    // Keep the scene's collision and learning target on the existing simplified model.
    rocket.raycast = () => {};
    let saved;
    try { saved = localStorage.getItem(QUALITY_KEY); } catch { /* use the default */ }
    const detail = QUALITY_PRESETS[qualityName(saved)].detail;
    rocket.visible = detail >= 1;
    fallback.userData.graphicsMaxDetail = 0;
    fallback.visible = detail === 0;
    scene.add(rocket);
  }, undefined, () => { /* Keep the original vehicle if loading fails. */ });
  return () => { active = false; };
}
