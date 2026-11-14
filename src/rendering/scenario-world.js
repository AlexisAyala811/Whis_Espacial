import * as THREE from 'three';
import { SCENARIOS, canEnterScenario } from '../core/scenario-route.js';

export const STATIONS = [
  { id: 'suit', name: '01 / TRAJE', scene: 0, x: -3.7, z: -1.4, color: 0x91d9c2 },
  { id: 'ared', name: '02 / ARED', scene: 1, x: -3.7, z: -1.4, color: 0xe8bb79 },
  { id: 'mental', name: '03 / ECLSS', scene: 2, x: -3.7, z: -1.4, color: 0x8bbdd5 },
];

const arrivalZ = 7.7;
const exitZ = -9.35;

export function createScenarioWorld(container) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  container.append(renderer.domElement);
  const camera = new THREE.PerspectiveCamera(72, 1, .08, 100);
  camera.rotation.order = 'YXZ';
  camera.position.set(0, 1.7, arrivalZ);
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'Escenario 3D. WASD para caminar, ratón o flechas para mirar. Cruza la puerta iluminada para avanzar.');
  const keys = new Set();
  const velocity = new THREE.Vector2();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let dragging = false, controlsActive = false, stride = 0, sceneIndex = 0;

  const suitWhite = new THREE.MeshStandardMaterial({ color: 0xdce3df, roughness: .68 });
  const suitGray = new THREE.MeshStandardMaterial({ color: 0x829698, roughness: .7 });
  const arms = [];
  for (const side of [-1, 1]) {
    const arm = new THREE.Group();
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(.09, .14, .38, 10), suitWhite);
    sleeve.rotation.z = side * .55; sleeve.position.set(side * .64, -.74, -.94); arm.add(sleeve);
    const wrist = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .09, 10), suitGray);
    wrist.rotation.z = side * .55; wrist.position.set(side * .57, -.56, -1); arm.add(wrist);
    const hand = new THREE.Mesh(new THREE.BoxGeometry(.17, .11, .15), suitWhite);
    hand.position.set(side * .54, -.49, -1.04); arm.add(hand);
    camera.add(arm); arms.push(arm);
  }

  function makeRoom(index) {
    const scene = new THREE.Scene();
    const colors = [0x626e70, 0x666b68, 0x575f5e];
    scene.background = new THREE.Color(colors[index]);
    scene.fog = new THREE.FogExp2(colors[index], .008);
    scene.add(new THREE.HemisphereLight(0xf2f4ec, 0x6d7774, 1.55));
    const light = new THREE.DirectionalLight(0xf5f2e8, 1.25);
    light.position.set(-4, 8, 6); scene.add(light);
    const obstacles = [], materials = new Map();
    function material(color, glow = false) {
      const key = `${color}-${glow}`;
      if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: glow ? .4 : .78, metalness: glow ? .05 : .25, emissive: glow ? color : 0, emissiveIntensity: glow ? 1.1 : 0 }));
      return materials.get(key);
    }
    function box(x, y, z, w, h, d, color, glow = false) {
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color, glow));
      mesh.position.set(x, y, z); scene.add(mesh); return mesh;
    }
    function cylinder(x, y, z, top, bottom, height, color) {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(top, bottom, height, 16), material(color));
      mesh.position.set(x, y, z); scene.add(mesh); return mesh;
    }
    function textPanel(text, x, y, z, width, foreground = '#d7e4db') {
      const surface = document.createElement('canvas'); surface.width = 768; surface.height = 128;
      const context = surface.getContext('2d');
      context.fillStyle = '#17252a'; context.fillRect(0, 0, 768, 128);
      context.fillStyle = foreground;
      context.font = `bold ${Math.min(46, Math.floor(710 / (text.length * .62)))}px monospace`;
      context.textAlign = 'center'; context.fillText(text, 384, 79);
      const texture = new THREE.CanvasTexture(surface); texture.colorSpace = THREE.SRGBColorSpace;
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 6), new THREE.MeshBasicMaterial({ map: texture }));
      plane.position.set(x, y, z); scene.add(plane);
    }
    function telemetryTexture(seed, controls = false) {
      const surface = document.createElement('canvas'); surface.width = 512; surface.height = 256;
      const context = surface.getContext('2d');
      context.fillStyle = controls ? '#82877e' : '#101f24'; context.fillRect(0, 0, 512, 256);
      let value = seed * 8191 + 29;
      const random = () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
      if (controls) {
        for (let row = 0; row < 7; row++) for (let col = 0; col < 19; col++) {
          const x = 14 + col * 26, y = 10 + row * 34;
          context.fillStyle = random() > .87 ? '#d4b67f' : random() > .48 ? '#d5d8c9' : '#465254';
          context.fillRect(x, y, 15, 12);
          context.fillStyle = '#303a3a'; context.fillRect(x, y + 17, 20, 2);
        }
      } else {
        context.fillStyle = '#c9d8ca'; context.font = 'bold 21px monospace';
        context.fillText(['SUIT / BIOPLOT', 'ARED / LOAD', 'ECLSS / AIR', 'FLIGHT DYNAMICS'][seed % 4], 19, 33);
        context.strokeStyle = '#345357'; context.lineWidth = 1;
        for (let x = 20; x < 505; x += 32) { context.beginPath(); context.moveTo(x, 45); context.lineTo(x, 229); context.stroke(); }
        for (let y = 48; y < 235; y += 24) { context.beginPath(); context.moveTo(17, y); context.lineTo(497, y); context.stroke(); }
        context.strokeStyle = '#9cdbc3'; context.lineWidth = 3; context.beginPath();
        for (let x = 20; x < 492; x += 6) {
          const y = 135 + Math.sin(x * .03 + seed) * 25 + Math.sin(x * .14) * 7;
          x === 20 ? context.moveTo(x, y) : context.lineTo(x, y);
        }
        context.stroke();
        context.fillStyle = '#bed2c4'; context.font = '16px monospace'; context.fillText('SYS NOMINAL  /  MET T+00:00', 20, 243);
      }
      const texture = new THREE.CanvasTexture(surface); texture.colorSpace = THREE.SRGBColorSpace;
      return texture;
    }
    function display(x, y, z, width, height, seed) {
      box(x, y, z - .08, width + .15, height + .16, .17, 0x34434a);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: telemetryTexture(seed) }));
      mesh.position.set(x, y, z + .02); scene.add(mesh);
    }
    function consoleUnit(x, z, seed, width = 2.45) {
      box(x, .57, z, width, 1.1, 1.4, 0x858e87);
      box(x, 1.15, z + .55, width + .05, .1, .45, 0xb3bab0);
      display(x, 1.78, z - .22, width - .35, .78, seed);
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(width - .2, .85), new THREE.MeshStandardMaterial({ map: telemetryTexture(seed, true), roughness: .8, side: THREE.DoubleSide }));
      panel.rotation.x = -.55; panel.position.set(x, 1.28, z + .4); scene.add(panel);
      for (const side of [-1, 1]) box(x + side * (width / 2 - .04), 1.47, z + .19, .07, .7, 1.03, 0xb4b9ae);
      obstacles.push({ x, z: z + .2, w: width, d: 1.75 });
    }
    function stationUnit(station, seed) {
      consoleUnit(station.x, station.z, seed, 2.65);
      textPanel(station.name, station.x, 2.8, station.z + .03, 3.1);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.84, .023, 8, 48), material(station.color, true));
      ring.rotation.x = -Math.PI / 2; ring.position.set(station.x, .055, station.z); scene.add(ring);
      return ring;
    }
    function mannequin(x, z) {
      box(x, 1.45, z, .72, 1.15, .44, 0xe5e8df);
      const helmet = new THREE.Mesh(new THREE.SphereGeometry(.32, 18, 14), material(0xcbd9d6));
      helmet.position.set(x, 2.38, z); scene.add(helmet);
      box(x, 2.36, z + .31, .44, .19, .035, 0x3b5960);
      for (const side of [-1, 1]) {
        box(x + side * .48, 1.42, z, .2, 1.08, .26, 0xdfe5df);
        box(x + side * .22, .55, z, .26, .75, .33, 0xdfe5df);
      }
      box(x, .17, z, 1.65, .15, .9, 0x697d80);
      obstacles.push({ x, z, w: 1.4, d: 1 });
    }

    // Each scenario owns its own room, geometry and textures; the next one is built on demand.
    box(0, -.16, 0, 20, .32, 20, 0x454d4c);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: [0x8b8d87, 0x777e7b, 0x85877e][index], metalness: .08, roughness: .95 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = .005; scene.add(floor);
    for (let x = -9; x <= 9; x += 2) box(x, .02, 0, .025, .016, 19.5, 0x646e6a);
    for (let z = -9; z <= 9; z += 2) box(0, .02, z, 19.5, .016, .025, 0x646e6a);
    box(-10, 3, 0, .35, 6, 20, 0x98a5a2); box(10, 3, 0, .35, 6, 20, 0x98a5a2);
    for (const side of [-1, 1]) {
      box(side * 5.6, 3, -9.9, 8.8, 6, .3, 0x9aa6a2);
      box(side * 5.6, 3, 9.9, 8.8, 6, .3, 0x82928f);
    }
    box(0, 6, 0, 20, .2, 20, 0xc5cac2);
    for (let x = -9; x < 10; x += 2) for (let z = -9; z < 10; z += 2) {
      box(x, 5.87, z, 1.94, .024, 1.94, 0xd0d3ca);
      if (((x + z) / 2) % 3 === 0) box(x, 5.83, z, 1.3, .02, .42, 0xf4f3e8, true);
    }
    for (let z = -7; z <= 7; z += 3.5) for (const side of [-1, 1]) {
      box(side * 9.78, 3, z, .08, 5.4, 3.2, 0xb3bfba);
      box(side * 9.65, .4, z, .13, .5, 3.2, 0x4c6769);
      box(side * 9.65, 5.25, z, .12, .18, 3.2, 0x546d72);
    }
    for (const x of [-7.5, -5, -2.7, 2.7, 5, 7.5]) {
      box(x, 3.1, -9.7, 2.2, 5.25, .08, 0xb7c1b9);
      box(x, 3.1, 9.7, 2.2, 5.25, .08, 0x9cacaa);
    }
    // Door frames sit in front of the wall; the room switch happens at their threshold.
    for (const z of [-9.55, 9.55]) {
      box(-1.35, 2.25, z, .24, 4.5, .3, 0x4e5d5d);
      box(1.35, 2.25, z, .24, 4.5, .3, 0x4e5d5d);
      box(0, 4.52, z, 2.95, .22, .34, 0x495e5e);
      box(0, .08, z, 2.95, .12, .5, 0x4e6261);
    }
    for (const direction of [-1, 1]) {
      if (direction === 1 && index === 0) continue;
      box(0, 2.2, direction * 11.75, 2.4, 4.4, .15, 0x1b3035);
      box(0, .09, direction * 10.65, 2.4, .15, 2.25, 0x667775);
      box(0, 4.35, direction * 10.65, 2.4, .13, 2.25, 0x2f4b4f);
      for (const side of [-1, 1]) box(side * 1.2, 2.2, direction * 10.65, .14, 4.4, 2.25, 0x3a5759);
      box(0, 4.25, direction * 10.65, 1.55, .04, 1.2, 0xb3ded2, true);
      box(0, .19, direction * 10.25, 2.1, .025, .06, 0xd7c382);
    }
    const forwardLeaves = [box(-.64, 2.25, -9.48, 1.25, 4.2, .16, 0x899896), box(.64, 2.25, -9.48, 1.25, 4.2, .16, 0x899896)];
    const backLeaves = [box(index ? -1.68 : -.64, 2.25, 9.48, 1.25, 4.2, .16, 0x899896), box(index ? 1.68 : .64, 2.25, 9.48, 1.25, 4.2, .16, 0x899896)];
    const doorLamp = box(0, 4.62, -9.31, 1.2, .07, .08, 0xbe6458, true);
    if (index < SCENARIOS.length - 1) textPanel(`PUERTA / ${SCENARIOS[index + 1].title.toUpperCase()}`, 0, 4.98, -9.28, 4.4);
    else textPanel('CONTROL DE MISION / FIN DE RUTA', 0, 4.98, -9.28, 4.4);
    textPanel(SCENARIOS[index].title.toUpperCase(), 0, 3.9, -9.28, 5.2);
    for (const x of [-7.5, 7.5]) for (const z of [-6, 1, 7]) {
      box(x, 1.05, z, 1.15, 2.1, .65, 0x8b9b99);
      box(x, 1.04, z + .34, .96, 1.8, .025, 0xb2bdb8);
      obstacles.push({ x, z, w: 1.2, d: .8 });
    }
    box(0, .035, 0, .09, .025, 16, 0xd1c69c);
    const station = STATIONS[index];
    const beacon = stationUnit(station, index);
    if (index === 0) {
      mannequin(3.4, -2.8); mannequin(6.1, -2.8);
      for (const x of [3.2, 6]) display(x, 3.1, -9.4, 2.3, 1.15, 0);
      textPanel('ASCAN / SUIT INSPECTION', 3.7, 4.4, -9.28, 5.4);
    } else if (index === 1) {
      for (const x of [-5.2, -2.2]) box(x, 1.85, -3.4, .16, 3.7, .2, 0xaebbb7);
      box(-3.7, 3.5, -3.4, 3.1, .15, .2, 0xcbd2c9);
      box(-3.7, .19, -3.8, 3.2, .15, 2.4, 0x424f4c);
      box(4, .22, -2.4, 2, .26, 3.15, 0x313e40);
      box(4, .38, -2.4, 1.6, .06, 2.7, 0x1c2b30);
      for (const x of [3.05, 4.95]) box(x, 1.1, -3.3, .09, 1.7, .12, 0xb5c7c3);
      display(4, 2.12, -3.5, 1, .55, 1);
      textPanel('T2 / CARDIO', 4, 3.1, -3.7, 2.3);
      obstacles.push({ x: 4, z: -2.4, w: 2, d: 3.2 });
      for (const x of [3.5, 5.7]) cylinder(x, .3, 2.2, .28, .28, .18, 0x718787);
    } else {
      for (const z of [-4, .6, 5.2]) {
        consoleUnit(4.6, z, 3, 2.7);
        box(4.6, .57, z + 1.7, .8, .12, .65, 0x515d58);
        box(4.6, 1.2, z + 2, .8, .85, .09, 0x626e68);
        obstacles.push({ x: 4.6, z: z + 1.75, w: .9, d: .8 });
      }
      for (const x of [-4.8, -1.8, 1.2, 4.2, 7.2]) display(x, 3.35, -9.4, 2.3, 1.2, 3);
      textPanel('MISSION CONTROL / ECLSS', 1.7, 4.65, -9.28, 7);
    }
    scene.add(camera);
    return { scene, obstacles, beacon, forwardLeaves, backLeaves, doorLamp };
  }

  let room = makeRoom(0);
  const clear = () => { keys.clear(); velocity.set(0, 0); dragging = false; };
  const down = event => {
    if (event.target.closest('input,textarea,button,select')) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) event.preventDefault();
    keys.add(event.code);
  };
  const up = event => keys.delete(event.code);
  const look = event => {
    if (!controlsActive || !(document.pointerLockElement === canvas || dragging)) return;
    camera.rotation.y -= event.movementX * .002;
    camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x - event.movementY * .002, -1.3, 1.3);
  };
  window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', clear);
  document.addEventListener('mousemove', look);
  canvas.addEventListener('pointerdown', () => { dragging = true; canvas.focus(); });
  window.addEventListener('pointerup', () => { dragging = false; });
  const resize = () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); };
  window.addEventListener('resize', resize); resize();

  function disposeRoom(oldRoom) {
    oldRoom.scene.remove(camera);
    const geometries = new Set(), materials = new Set();
    oldRoom.scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      const items = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      items.forEach(item => materials.add(item));
    });
    geometries.forEach(item => item.dispose());
    materials.forEach(item => { item.map?.dispose(); item.dispose(); });
  }
  function blocked(x, z, stage) {
    if (Math.abs(x) > 9.25) return true;
    if (Math.abs(x) > 1.08 && (z < -9.2 || z > 9.2)) return true;
    if (z < (canEnterScenario(sceneIndex + 1, stage) ? -10 : -9.12)) return true;
    if (z > (sceneIndex > 0 ? 10 : 9.12)) return true;
    return room.obstacles.some(object => Math.abs(x - object.x) < object.w / 2 + .3 && Math.abs(z - object.z) < object.d / 2 + .3);
  }
  return {
    camera,
    get currentIndex() { return sceneIndex; },
    focus() { canvas.focus(); },
    async capture() { try { await canvas.requestPointerLock(); } catch { /* Drag and arrows remain available. */ } },
    release() { if (document.pointerLockElement === canvas) document.exitPointerLock(); clear(); },
    reset() { disposeRoom(room); sceneIndex = 0; room = makeRoom(0); camera.position.set(0, 1.7, arrivalZ); camera.rotation.set(0, 0, 0); stride = 0; clear(); },
    async load(index) {
      if (index === sceneIndex || index < 0 || index >= SCENARIOS.length) return;
      const backwards = index < sceneIndex;
      const start = performance.now();
      await new Promise(resolve => requestAnimationFrame(resolve));
      const nextRoom = makeRoom(index);
      await new Promise(resolve => setTimeout(resolve, Math.max(0, 650 - (performance.now() - start))));
      disposeRoom(room); room = nextRoom; sceneIndex = index;
      camera.position.set(0, 1.7, backwards ? -arrivalZ : arrivalZ);
      camera.rotation.set(0, backwards ? Math.PI : 0, 0); stride = 0; clear();
    },
    update(dt, active, target, stage) {
      controlsActive = active;
      const open = canEnterScenario(sceneIndex + 1, stage);
      room.forwardLeaves.forEach((leaf, i) => { leaf.position.x = THREE.MathUtils.lerp(leaf.position.x, (i ? 1 : -1) * (open ? 1.68 : .64), Math.min(1, dt * 5)); });
      room.doorLamp.material.color.setHex(open ? 0x9ad7b2 : 0xbe6458);
      room.doorLamp.material.emissive.setHex(open ? 0x9ad7b2 : 0xbe6458);
      room.beacon.visible = target === STATIONS[sceneIndex].id;
      if (active) {
        camera.rotation.y += ((keys.has('ArrowLeft') ? 1 : 0) - (keys.has('ArrowRight') ? 1 : 0)) * dt * 1.5;
        camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x + ((keys.has('ArrowUp') ? 1 : 0) - (keys.has('ArrowDown') ? 1 : 0)) * dt, -1.3, 1.3);
        const forward = Number(keys.has('KeyW')) - Number(keys.has('KeyS'));
        const right = Number(keys.has('KeyD')) - Number(keys.has('KeyA'));
        const length = Math.hypot(forward, right) || 1;
        const pace = keys.has('ShiftLeft') ? 2.85 : 1.75;
        const desiredX = (right * Math.cos(camera.rotation.y) - forward * Math.sin(camera.rotation.y)) * pace / length;
        const desiredZ = (-forward * Math.cos(camera.rotation.y) - right * Math.sin(camera.rotation.y)) * pace / length;
        const blend = 1 - Math.exp(-(forward || right ? 9 : 12) * dt);
        velocity.x = THREE.MathUtils.lerp(velocity.x, desiredX, blend);
        velocity.y = THREE.MathUtils.lerp(velocity.y, desiredZ, blend);
        const x = camera.position.x + velocity.x * dt, z = camera.position.z + velocity.y * dt;
        if (!blocked(x, camera.position.z, stage)) camera.position.x = x; else velocity.x = 0;
        if (!blocked(camera.position.x, z, stage)) camera.position.z = z; else velocity.y = 0;
        const motion = velocity.length() / 2.85;
        if (motion > .02) stride += dt * (keys.has('ShiftLeft') ? 11 : 8);
        const bob = reducedMotion.matches ? 0 : Math.sin(stride) * .018 * motion;
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.7 + bob, Math.min(1, dt * 12));
        arms.forEach((arm, i) => { arm.position.y = reducedMotion.matches ? 0 : Math.sin(stride + (i ? Math.PI : 0)) * .012 * motion; });
        if (z < exitZ && Math.abs(x) < 1.08 && open) return sceneIndex + 1;
        if (z > -exitZ && Math.abs(x) < 1.08 && sceneIndex > 0) return sceneIndex - 1;
      } else {
        velocity.set(0, 0);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.7, Math.min(1, dt * 12));
        arms.forEach(arm => { arm.position.y = THREE.MathUtils.lerp(arm.position.y, 0, Math.min(1, dt * 12)); });
      }
      renderer.render(room.scene, camera);
      return null;
    },
    near() {
      const station = STATIONS[sceneIndex];
      return Math.hypot(camera.position.x - station.x, camera.position.z - station.z) < 3.1 ? station : null;
    },
    door(stage) {
      if (Math.abs(camera.position.x) > 1.7) return null;
      if (sceneIndex < SCENARIOS.length - 1 && camera.position.z < -6.9)
        return { target: sceneIndex + 1, locked: !canEnterScenario(sceneIndex + 1, stage), name: SCENARIOS[sceneIndex + 1].title };
      if (sceneIndex > 0 && camera.position.z > 8.6)
        return { target: sceneIndex - 1, locked: false, name: SCENARIOS[sceneIndex - 1].title };
      return null;
    },
    distance(id) {
      const station = STATIONS.find(item => item.id === id);
      if (!station) return 0;
      const destination = station.scene === sceneIndex ? station : { x: 0, z: exitZ };
      return Math.hypot(camera.position.x - destination.x, camera.position.z - destination.z);
    },
  };
}
