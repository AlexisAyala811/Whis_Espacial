import * as THREE from 'three';

// A fictional training vehicle informed by photographs of the Artemis I SLS.
export function addAssemblyRocket(scene) {
  const rocket = new THREE.Group();
  rocket.name = 'assembly-training-rocket';
  rocket.position.set(4.1, 0, -2.8);
  scene.add(rocket);

  const foamCanvas = document.createElement('canvas');
  foamCanvas.width = 256; foamCanvas.height = 512;
  const c = foamCanvas.getContext('2d');
  c.fillStyle = '#c27b3f'; c.fillRect(0, 0, 256, 512);
  // Deterministic mottling gives the insulation a foam-like surface.
  let seed = 34567;
  for (let i = 0; i < 7500; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0; const x = seed % 256;
    seed = (seed * 1664525 + 1013904223) >>> 0; const y = seed % 512;
    c.fillStyle = i % 3 ? 'rgba(95,44,16,.035)' : 'rgba(255,218,160,.07)';
    c.fillRect(x, y, 1 + i % 3, 1 + i % 4);
  }
  const foamMap = new THREE.CanvasTexture(foamCanvas);
  foamMap.colorSpace = THREE.SRGBColorSpace;
  const foam = new THREE.MeshStandardMaterial({ map: foamMap, roughness: .94, metalness: 0 });
  const white = new THREE.MeshStandardMaterial({ color: 0xd9dcd5, roughness: .62, metalness: .2 });
  const pale = new THREE.MeshStandardMaterial({ color: 0xc6b396, roughness: .87, metalness: .08 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x293335, roughness: .7, metalness: .35 });
  const alloy = new THREE.MeshStandardMaterial({ color: 0x818b89, roughness: .52, metalness: .7 });
  const black = new THREE.MeshStandardMaterial({ color: 0x151d20, roughness: .9, side: THREE.DoubleSide });
  function cylinder(x, y, z, top, bottom, height, mat, segments = 40, open = false) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, segments, 1, open), mat);
    mesh.position.set(x, y, z); rocket.add(mesh); return mesh;
  }
  function box(x,y,z,w,h,d,mat) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);
    mesh.position.set(x,y,z); rocket.add(mesh); return mesh;
  }
  function ring(x,y,z,r,tube,mat) {
    const mesh = new THREE.Mesh(new THREE.TorusGeometry(r,tube,6,40),mat);
    mesh.position.set(x,y,z); mesh.rotation.x=Math.PI/2; rocket.add(mesh);
  }
  // Core tank, white upper stage and crew capsule. Dimensions are game-scaled.
  cylinder(0,6,-0,1.25,1.25,10.5,foam);
  cylinder(0,.78,0,1.25,1.14,.55,white);
  for(const y of [1.35,3.25,5.4,7.65,9.75,11.15]) ring(0,y,0,1.255,.025,pale);
  cylinder(0,11.55,0,1.06,1.25,.65,white);
  cylinder(0,12.55,0,.94,1.06,1.36,white);
  for(const y of [12.02,12.93]) ring(0,y,0,.99,.025,alloy);
  cylinder(0,13.45,0,.46,.94,.5,white);
  cylinder(0,13.98,0,.12,.46,.58,white);
  cylinder(0,14.63,0,.035,.035,.72,alloy,12);
  // Long exterior plumbing and structural supports are visible on the orange stage.
  for(const [x,z,r] of [[-.62,1.08,.095],[.36,1.2,.055],[.55,1.14,.035]]){
    cylinder(x,6,z,r,r,9.25,pale,12);
    for(const y of [2,3.8,5.6,7.4,9.2,10.45])box(x,y,z-.03,.24,.08,.14,alloy);
  }
  // Twin segmented boosters, tapered noses, support collars, and nozzles.
  for(const x of [-1.83,1.83]){
    cylinder(x,5.55,0,.48,.48,9.4,white,32);
    cylinder(x,10.46,0,.18,.48,.52,white,32);
    cylinder(x,10.85,0,0,.18,.3,white,32);
    for(const y of [1.3,3.15,5,6.85,8.7,10.15])ring(x,y,0,.482,.035,dark);
    cylinder(x,.48,0,.39,.53,.64,dark,24,true);
    for(const y of [2,8.7])box(x<0?-.99:.99,y,0,.85,.16,.34,alloy);
    for(const z of [-.34,.34])cylinder(x+(x<0?-.15:.15),5.4,z,.025,.025,8.3,alloy,8);
  }
  // Four RS-25-like engine bells suggest the real lower core without claiming exact scale.
  for(const x of [-.48,.48])for(const z of [-.48,.48]){
    cylinder(x,.40,z,.18,.34,.65,alloy,24,true);
    cylinder(x,.08,z,.34,.34,.04,black,24);
    for(const y of [.2,.3,.4,.5,.6])ring(x,y,z,.30-(y-.2)*.25,.012,dark);
  }
  return rocket;
}

// Original NASA photo remains a separate educational display, not a fake 3D model.
export function addRocketReference(scene) {
  const map = new THREE.TextureLoader().load('./assets/rocket/artemis-i-vab.jpg');
  map.colorSpace = THREE.SRGBColorSpace;
  const photo = new THREE.Mesh(new THREE.PlaneGeometry(1.75,3.11), new THREE.MeshBasicMaterial({map}));
  photo.name = 'artemis-reference-photo';
  photo.position.set(-6.5, 3.05, -9.17);
  scene.add(photo);
}
