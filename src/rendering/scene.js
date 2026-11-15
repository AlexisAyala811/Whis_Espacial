import * as THREE from 'three';

export function createScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x07111e);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 3.2, 7.5);
  camera.lookAt(0, 1, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(container.clientWidth || 640, container.clientHeight || 400, false);
  container.append(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xa8ddff, 0x0b1422, 2.4));
  const key = new THREE.DirectionalLight(0x8edcff, 3.2); key.position.set(3, 6, 4); scene.add(key);
  const floor = new THREE.Mesh(new THREE.BoxGeometry(9, 0.15, 6), new THREE.MeshStandardMaterial({ color: 0x19344a, metalness: 0.5, roughness: 0.6 })); floor.position.y = -0.1; scene.add(floor);
  const consoleMaterial = new THREE.MeshStandardMaterial({ color: 0x24536b, metalness: 0.7, roughness: 0.38 });
  for (const x of [-2.6, 0, 2.6]) { const console = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 0.9), consoleMaterial); console.position.set(x, 0.5, -0.5); scene.add(console); }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.08, 12, 64), new THREE.MeshStandardMaterial({ color: 0x6fe7f5, emissive: 0x1b6072, emissiveIntensity: 1.4 })); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.1, 1.3); scene.add(ring);
  const resize = () => { const width = Math.max(1, container.clientWidth); const height = Math.max(1, container.clientHeight); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); };
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(container);
  renderer.domElement.addEventListener('webglcontextlost', (event) => { event.preventDefault(); document.querySelector('#webgl-status').textContent = "Graphics unavailable. Telemetry remains visible."; });
  return { update(snapshot) { ring.rotation.z = snapshot.missionTimeMs / 5000; renderer.render(scene, camera); }, dispose() { resizeObserver.disconnect(); renderer.dispose(); scene.traverse((object) => { object.geometry?.dispose(); if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose()); else object.material?.dispose(); }); } };
}
