import * as THREE from 'three';
import { SCENARIOS, canEnterScenario } from '../core/scenario-route.js';
import { LEARNING_ROOMS } from '../core/learning-catalog.js';
import { decorateRoom } from './room-identity.js';
import { makeSurfaceTextures, drawTelemetry } from './surface-detail.js';
import { buildCabinDetails } from './cabin-details.js';

export const STATIONS = [
  { id: 'suit', name: '01 / TRAJE', scene: 0, x: -3.7, z: -1.4, color: 0x91d9c2 },
  { id: 'ared', name: '02 / ARED', scene: 1, x: -3.7, z: -1.4, color: 0xe8bb79 },
  { id: 'mental', name: '03 / ECLSS', scene: 2, x: -3.7, z: -1.4, color: 0x8bbdd5 },
  { id: 'eva', name: '04 / EVA', scene: 3, x: -3.7, z: -1.4, color: 0x7bd7e4 },
  { id: 'habitat', name: '05 / HÁBITAT', scene: 4, x: -3.7, z: -1.4, color: 0xb3d98b },
  { id: 'vab', name: '06 / VAB', scene: 5, x: -3.7, z: -1.4, color: 0xf0c37d },
  { id: 'ship', name: '07 / CABINA', scene: 6, x: -3.7, z: -1.4, color: 0x9bbbe5 },
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
  canvas.setAttribute('aria-label', 'Escenario 3D. WASD para caminar; Ctrl más W o Shift para correr. Ratón o flechas para mirar. Cruza la puerta iluminada para avanzar.');
  const keys = new Set();
  const velocity = new THREE.Vector2();
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let dragging = false, controlsActive = false, stride = 0, sceneIndex = 0, hoverY = 1.7;

  const playerTextures = makeSurfaceTextures(0);
  for (const kind of ['metal','floor','wall','rubber']) playerTextures[kind].dispose();
  const suitWhite = new THREE.MeshStandardMaterial({ color: 0xdce3df, map: playerTextures.fabric, roughness: .9 });
  const suitGray = new THREE.MeshStandardMaterial({ color: 0x829698, map: playerTextures.fabric, roughness: .88 });
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
    const halfWidth = [7,9,10,10,7,10,8][index];
    const colors = [0x626e70, 0x666b68, 0x575f5e, 0x164e65, 0x747c79, 0x4c5658, 0x36444d];
    scene.background = new THREE.Color(colors[index]);
    scene.fog = new THREE.FogExp2(colors[index], index === 3 ? .035 : .008);
    scene.add(new THREE.HemisphereLight(index === 3 ? 0xa8e8f5 : 0xf2f4ec, index === 3 ? 0x24516b : 0x6d7774, index === 3 ? 2 : index === 6 ? .95 : 1.55));
    const light = new THREE.DirectionalLight(0xf5f2e8, index === 6 ? .8 : 1.25);
    light.position.set(-4, 8, 6); scene.add(light);
    // Gentle accent lighting separates training spaces while keeping signs readable.
    const accents = [0xb6dce6,0xe4c891,0x75bdde,0x59c7e7,0xe8c998,0xf0b46d,0x83b7ed];
    const accent = new THREE.PointLight(accents[index], index === 5 ? 22 : 12, 16, 2);
    accent.position.set(3, index === 5 ? 8 : 4, -2); scene.add(accent);
    const obstacles = [], materials = new Map(), textures = makeSurfaceTextures(index);
    const animatedScreens = [], screenMaps = new Map(), bubbles = [], animatedParts = [];
    let ambientTime = 0, screenTime = 0, disposeCabin = null;
    function material(color, glow = false, kind = 'metal') {
      const key = `${color}-${glow}-${kind}`;
      if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, map: glow ? null : textures[kind], roughness: glow ? .4 : kind==='metal' ? .68 : .92, metalness: glow ? .05 : kind==='metal' ? .32 : .03, emissive: glow ? color : 0, emissiveIntensity: glow ? 1.1 : 0 }));
      return materials.get(key);
    }
    function box(x, y, z, w, h, d, color, glow = false, surface = null) {
      const fabrics = [0xe5e8df,0xdfe5df,0x3e6474,0x9daaa9,0xd8dad2];
      const rubbers = [0x1c2b30,0x243e48,0x26383f,0x313e40,0x34434c];
      const kind = surface ?? (color === 0x394b55 ? 'floor' : fabrics.includes(color) ? 'fabric' : rubbers.includes(color) ? 'rubber' : 'metal');
      const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material(color, glow, kind));
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
        context.fillText(['SUIT / BIOPLOT', 'ARED / LOAD', 'ECLSS / AIR', 'EVA / UMBILICAL', 'HERA / RESOURCES', 'VAB / POWER', 'OUTPOST / SOL 01'][seed % 7], 19, 33);
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
      if (!screenMaps.has(seed)) {
        const surface = document.createElement('canvas'); surface.width = 512; surface.height = 256;
        drawTelemetry(surface, seed);
        const map = new THREE.CanvasTexture(surface); map.colorSpace = THREE.SRGBColorSpace;
        screenMaps.set(seed, map); animatedScreens.push({ surface, map, seed });
      }
      const map = screenMaps.get(seed);
      const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map }));
      mesh.position.set(x, y, z + .02); scene.add(mesh);
    }
    function consoleUnit(x, z, seed, width = 2.45) {
      box(x, .57, z, width, 1.1, 1.4, index===6 ? 0x536870 : 0x858e87);
      box(x, 1.15, z + .55, width + .05, .1, .45, index===6 ? 0x809ca0 : 0xb3bab0);
      display(x, 1.78, z - .22, width - .35, .78, seed);
      const panel = new THREE.Mesh(new THREE.PlaneGeometry(width - .2, .85), new THREE.MeshStandardMaterial({ map: telemetryTexture(seed, true), roughness: .8, side: THREE.DoubleSide }));
      panel.rotation.x = -.55; panel.position.set(x, 1.28, z + .4); scene.add(panel);
      for (const side of [-1, 1]) box(x + side * (width / 2 - .04), 1.47, z + .19, .07, .7, 1.03, 0xb4b9ae);
      // Separate colored indicators make controls legible from the aisle.
      for (let i=0; i<5; i++) {
        const led = new THREE.Mesh(new THREE.SphereGeometry(.035,8,6), material([0x81d8b5,0x80c7e7,0xe5c179][i%3],true));
        led.position.set(x-width*.32+i*width*.16,1.43,z+.61); scene.add(led);
      }
      for (const side of [-1,1]) for(const y of [.25,.9]){
        const bolt=new THREE.Mesh(new THREE.SphereGeometry(.035,8,6),material(0x425b61));
        bolt.position.set(x+side*(width/2-.12),y,z+.71);scene.add(bolt);
      }
      obstacles.push({ x, z: z + .2, w: width, d: 1.75 });
    }
    function stationUnit(station, seed) {
      if (![1,3,4].includes(seed)) consoleUnit(station.x, station.z, seed, 2.65);
      if(seed===3){
        box(station.x,1.25,station.z,1.8,2.5,.45,0x75929d);
        for(const [i,color] of [0x8cd6e0,0xd6b579,0x9ccea5].entries()){
          cylinder(station.x-.55+i*.55,1.65,station.z+.32,.12,.12,.35,color).rotation.x=Math.PI/2;
          textPanel(['O2','DATA','POWER'][i],station.x-.55+i*.55,2.2,station.z+.25,.48);
        }
        obstacles.push({x:station.x,z:station.z,w:1.9,d:.6});
      }
      if(seed===4){
        box(station.x,1.2,station.z,1.7,2.4,.7,0x899c92);
        display(station.x,1.75,station.z+.4,1.3,.6,4);
        obstacles.push({x:station.x,z:station.z,w:1.9,d:.9});
      }
      textPanel(station.name, station.x, 2.8, station.z + .03, 3.1);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.84, .023, 8, 48), material(station.color, true));
      ring.rotation.x = -Math.PI / 2; ring.position.set(station.x, .055, station.z); scene.add(ring);
      return ring;
    }
    function mannequin(x, z) {
      box(x, 1.45, z, .72, 1.15, .44, 0xe5e8df);
      box(x,1.48,z-.3,.68,.9,.24,0xa8bab9);
      box(x,1.48,z+.24,.58,.42,.08,0x9db1b0);
      box(x,1.6,z+.3,.36,.08,.04,0x426475);
      for(const side of [-1,1]){
        box(x+side*.3,1.95,z+.18,.14,.11,.08,0xd59556);
        box(x+side*.48,.87,z+.02,.22,.12,.29,0x738e93);
        box(x+side*.22,.16,z+.11,.27,.18,.52,0x617d81);
      }
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
    box(0, -.16, 0, halfWidth*2, .32, 20, 0x454d4c);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(halfWidth*2, 20), new THREE.MeshStandardMaterial({ color: [0xa7b4b1, 0x849997, 0x758c91, 0x599da6, 0xc9c6ad, 0x899b99, 0x536b72][index], map: textures.floor, metalness: index===6 ? .38 : .15, roughness: index===6 ? .48 : .82 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = .005; scene.add(floor);
    for (let x = -halfWidth+1; x < halfWidth; x += 2) box(x, .02, 0, .025, .016, 19.5, 0x646e6a);
    for (let z = -9; z <= 9; z += 2) box(0, .02, z, halfWidth*2-.5, .016, .025, 0x646e6a);
    const roomHeight = [5.4,5.8,6,7,4.9,17,6][index];
    const wallColor = [0xc1d1ce,0xa4b8b2,0x77949b,0x397f93,0xd8d4bd,0x8fa3a4,0x617881][index];
    box(-halfWidth, roomHeight / 2, 0, .35, roomHeight, 20, wallColor, false, 'wall'); box(halfWidth, roomHeight / 2, 0, .35, roomHeight, 20, wallColor, false, 'wall');
    for (const side of [-1, 1]) {
      box(side * (halfWidth+1.2)/2, roomHeight / 2, -9.9, halfWidth-1.2, roomHeight, .3, wallColor, false, 'wall');
      box(side * (halfWidth+1.2)/2, roomHeight / 2, 9.9, halfWidth-1.2, roomHeight, .3, wallColor, false, 'wall');
    }
    box(0, roomHeight, 0, halfWidth*2, .2, 20, index === 5 ? 0x66716e : index === 6 ? 0x536a72 : 0xc5cac2, false, 'wall');
    if ([0,2].includes(index)) for (let x = -halfWidth+1; x < halfWidth; x += 2) for (let z = -9; z < 10; z += 2) {
      box(x, roomHeight-.13, z, 1.94, .024, 1.94, index === 3 ? 0x427888 : 0xd0d3ca);
      if (((x + z) / 2) % 3 === 0) box(x, roomHeight-.17, z, 1.3, .02, .42, index === 3 ? 0x8cd7ec : 0xf4f3e8, true);
    }
    if(index===0) for (let z = -7; z <= 7; z += 3.5) for (const side of [-1, 1]) {
      box(side * (halfWidth-.22), 3, z, .08, 5.4, 3.2, 0xb3bfba);
      box(side * (halfWidth-.35), .4, z, .13, .5, 3.2, 0x4c6769);
      box(side * (halfWidth-.35), 5.25, z, .12, .18, 3.2, 0x546d72);
    }
    if(index===0) for (const x of [-5, -2.7, 2.7, 5]) {
      box(x, 3.1, -9.7, 2.2, 5.25, .08, index === 3 ? 0x669aac : 0xb7c1b9);
      box(x, 3.1, 9.7, 2.2, 5.25, .08, index === 3 ? 0x467f91 : 0x9cacaa);
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
    if(index===5) for (const x of [-7.5, 7.5]) for (const z of [-6, 1, 7]) {
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
    } else if (index === 1) {
      for (const x of [-5.2, -2.2]) box(x, 1.85, -3.4, .16, 3.7, .2, 0xaebbb7);
      box(-3.7, 3.5, -3.4, 3.1, .15, .2, 0xcbd2c9);
      box(-3.7, .19, -3.8, 3.2, .15, 2.4, 0x424f4c);
      box(4, .22, -2.4, 2, .26, 3.15, 0x313e40);
      box(4, .38, -2.4, 1.6, .06, 2.7, 0x1c2b30);
      for(let i=0;i<5;i++){
        const stripe=box(4,.42,-3.45+i*.54,1.5,.018,.035,0x859b9c);
        animatedParts.push({type:'belt',mesh:stripe,base:stripe.position.z});
      }
      for (const x of [3.05, 4.95]) box(x, 1.1, -3.3, .09, 1.7, .12, 0xb5c7c3);
      display(4, 2.12, -3.5, 1, .55, 1);
      textPanel('T2 / CARDIO', 4, 3.1, -3.7, 2.3);
      obstacles.push({ x: 4, z: -2.4, w: 2, d: 3.2 });
      for (const x of [3.5, 5.7]) cylinder(x, .3, 2.2, .28, .28, .18, 0x718787);
    } else if (index === 2) {
      for (const z of [-4, .6, 5.2]) {
        consoleUnit(4.6, z, 2, 2.7);
        box(4.6, .57, z + 1.7, .8, .12, .65, 0x515d58);
        box(4.6, 1.2, z + 2, .8, .85, .09, 0x626e68);
        obstacles.push({ x: 4.6, z: z + 1.75, w: .9, d: .8 });
      }
      for (const x of [-6.8, -3.6, 3.6, 6.8]) display(x, 3.35, -9.35, 2.3, 1.2, 2);
    } else if (index === 3) {
      const module = cylinder(4.2, 2.35, -2.4, 1.55, 1.55, 4.2, 0xc2d4d7);
      module.rotation.x = Math.PI / 2;
      for (const z of [-4, -2.4, -.8]) {
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.58, .08, 10, 40), material(0x597e8b));
        ring.position.set(4.2, 2.35, z); scene.add(ring);
      }
      const hatch = new THREE.Mesh(new THREE.TorusGeometry(.88, .14, 12, 40), material(0x344f5e));
      hatch.position.set(4.2, 2.35, -.23); scene.add(hatch);
      box(4.2, .38, -2.4, 4.2, .5, 5.1, 0x3b626d);
      for (const x of [2.3, 6.1]) for (const z of [-5, .2]) box(x, 1.4, z, .1, 2.8, .12, 0xb0bdba);
      for (let i = 0; i < 26; i++) {
        const bubble = new THREE.Mesh(new THREE.SphereGeometry(.025 + (i % 3) * .018, 8, 6), new THREE.MeshBasicMaterial({ color: 0xbdebf3, transparent: true, opacity: .35 }));
        bubble.position.set((i % 7) * 2.25 - 7.1, .65 + (i % 5) * .72, -6 + Math.floor(i / 7) * 3.3); scene.add(bubble); bubbles.push({mesh:bubble,base:bubble.position.y,phase:i*.47});
      }
      obstacles.push({ x: 4.2, z: -2.4, w: 4.4, d: 5.3 });
    } else if (index === 4) {
      for (const y of [.55, 2.15]) {
        box(4.8, y, -3.9, 3.8, .22, 1.9, 0x9ba59b);
        box(4.8, y + .15, -3.9, 3.5, .14, 1.65, 0x3e6474);
        box(4.8, y + .17, -4.65, .9, .14, .5, 0xd8dad2);
      }
      for (const z of [1.1, 2.8, 4.5]) {
        box(6.2, .92, z, 1.25, 1.65, .9, 0x8d9d92);
        box(6.2, 1.75, z, 1.25, .08, .9, 0xc4c9bb);
        for (const x of [5.9, 6.2, 6.5]) {
          cylinder(x, 2, z, .05, .04, .5, 0x789865);
          const leaf = new THREE.Mesh(new THREE.SphereGeometry(.13, 8, 6), material(0x78ad67));
          leaf.position.set(x, 2.26, z); scene.add(leaf);
        }
      }
      obstacles.push({ x: 4.8, z: -3.9, w: 4, d: 2.2 }, { x: 6.2, z: 2.8, w: 1.5, d: 4.5 });
    } else if (index === 5) {
      // A broad assembly bay, with the rocket and access platforms kept clear of the route.
      for (const x of [-7.8, 7.8]) for (const z of [-7.5, -3, 1.5, 6]) {
        box(x, 8.3, z, .23, 16.2, .24, 0x728080);
        for (const y of [4.2, 8.5, 12.6]) box(x, y, z, .45, .15, 2.4, 0xd5a94d);
      }
      for (const x of [-7.8, 7.8]) for (const y of [4.2, 8.5, 12.6]) {
        box(x, y, -1, 1.45, .18, 15, 0x9b752e);
        for (const z of [-8,-4,0,4,8]) box(x + (x<0?.65:-.65), y+.55, z, .08, 1.1, .08, 0xd4b15d);
      }
      box(0, 16.55, 0, 18, .32, .55, 0x87918c);
      box(0, 15.8, 0, 10, .24, .48, 0xe0ad4c);
      for(const x of [-5,0,5]) box(x, 15.4, 0, .25, .8, .3, 0xd5a852);
      for(const x of [-5.8,-2.9,0,2.9,5.8]) for(const z of [-6,1,7]) box(x, 16.75, z, 1.35, .06, .55, 0xf0f1df, true);
      for(const x of [-8,8]) for(const z of [-6,0,6]) box(x, 2.4, z, .09, 4.4, .09, 0xf0bd56);
      box(0, .04, -2.8, 17, .02, .12, 0xe4b04d);
      for (const x of [-8.5, 8.5]) for (const y of [6, 11, 16]) box(x, y, -1, .35, .26, 17, 0xe2b266);
      for (const z of [-7, -2, 3, 8]) for (const x of [-8.5, 8.5]) box(x, 8.5, z, .22, 17, .22, 0x657576);
      for (const y of [4.5, 8.5, 12.5]) {
        box(4.1, y, -2.8, 6.3, .18, .48, 0xdfad58);
        box(4.1, y, -2.8, .48, .18, 6.3, 0xdfad58);
      }
      cylinder(4.1, 6, -2.8, 1.25, 1.25, 11, 0xc47b3c);
      for (const y of [2.2,4.4,7.4,10.2]) cylinder(4.1, y, -2.8, 1.27, 1.27, .045, 0x9e683c);
      for (const y of [2.4, 6.8, 10.8]) cylinder(4.1, y, -2.8, 1.27, 1.27, .16, 0xe2e5da);
      const nose = new THREE.Mesh(new THREE.ConeGeometry(1.25, 2.5, 24), material(0xe5e9df));
      nose.position.set(4.1, 12.75, -2.8); scene.add(nose);
      for (const x of [2.3, 5.9]) {
        cylinder(x, 3.2, -2.8, .44, .44, 6.2, 0xe3e7df);
        const cap = new THREE.Mesh(new THREE.ConeGeometry(.44,.9,16),material(0xe3e7df));cap.position.set(x,6.65,-2.8);scene.add(cap);
      }
      for(const y of [3.5,7,10.5]) {
        box(4.1,y,-5.6,5.1,.18,.6,0xb68c3e);
        for(const x of [1.6,6.6]) box(x,y+.52,-5.6,.08,1.04,.08,0xe2bc66);
      }
      textPanel('VAB / LAUNCH INTEGRATION', 2.8, 4.55, -9.28, 6);
      obstacles.push({ x: 4.1, z: -2.8, w: 4.6, d: 4.2 });
    } else {
      // Spacecraft cabin: instrument bays, restrained seats and a framed Earth view.
      for(const x of [-8.4,8.4]){
        box(x,3,0,.55,5.6,16,0x66767b);
        for(const z of [-6,-2,2,6]){
          box(x+(x<0?.32:-.32),3,z,.08,4.7,.13,0xb7c4c3);
          box(x+(x<0?.33:-.33),4.6,z, .1,.08,3.5,0xb7c4c3);
        }
      }
      for(const z of [-5,0,5]){
        for(const x of [-6,-2,2,6]) box(x,5.45,z,3.5,.1,.08,0x78909a);
        box(0,5.35,z,1.4,.08,.45,0xd8e7e5,true);
      }
      for(const x of [2.5,5.7]) obstacles.push({x,z:-2.1,w:1.5,d:2});
      box(4.1,1.03,-5.8,5.8,1.6,1.1,0x586a71);
      box(4.1,1.82,-5.23,5.75,.12,.52,0x9caeaa);
      for(const x of [2.5,4.1,5.7]) display(x,2.45,-6.31,1.35,.64,6);
      obstacles.push({x:4.1,z:-5.8,w:6,d:1.4});
      // The forward display shows telemetry; side windows show the exterior.
      display(4.15,3.65,-9.3,5.9,3.1,6);
      for(const x of [1.15,7.15]) box(x,3.65,-9.08,.18,3.35,.2,0x48636d);
      for(const y of [2.02,5.28]) box(4.15,y,-9.08,6.2,.16,.2,0x48636d);
      for(const x of [3.15,5.15]) box(x,3.65,-9.05,.06,3.1,.12,0x6a8791);
      box(4.15,1.99,-8.98,6.2,.09,.13,0x82c6d5,true);
      const starlight=new THREE.PointLight(0x80b9e6,14,12,2);
      starlight.position.set(4.1,4.1,-7.9);scene.add(starlight);

      disposeCabin=buildCabinDetails({scene,box,display,obstacles});

      // An original three-dimensional spacecraft model on an illuminated display plinth.
      box(4.8,.62,4.15,1.6,1.24,1.4,0x3d5967);
      box(4.8,1.25,4.15,1.7,.06,1.5,0x80bdc8,true);
      const model=new THREE.Group();model.position.set(4.8,2.05,4.15);scene.add(model);
      const hull=new THREE.Mesh(new THREE.CylinderGeometry(.2,.34,1.3,16),material(0xd7e5e3));
      hull.rotation.z=Math.PI/2;model.add(hull);
      const nose=new THREE.Mesh(new THREE.ConeGeometry(.2,.42,16),material(0xe7eee9));
      nose.rotation.z=-Math.PI/2;nose.position.x=.84;model.add(nose);
      const service=new THREE.Mesh(new THREE.CylinderGeometry(.3,.3,.4,16),material(0x809ba5));
      service.rotation.z=Math.PI/2;service.position.x=-.68;model.add(service);
      for(const side of [-1,1]){
        const panel=new THREE.Mesh(new THREE.BoxGeometry(.75,.035,1.25),material(0x315b83));
        panel.position.set(-.15,0,side*.85);model.add(panel);
        for(const stripe of [-.25,0,.25]){
          const rail=new THREE.Mesh(new THREE.BoxGeometry(.025,.04,1.22),material(0x8ac0d2,true));
          rail.position.set(stripe-.15,.03,side*.85);model.add(rail);
        }
      }
      textPanel('MODELO / NAVE DE MISION',4.8,2.9,3.35,2.8);
      obstacles.push({x:4.8,z:4.15,w:1.7,d:1.5});
      animatedParts.push({type:'ship-model',mesh:model});
    }
    decorateRoom(index,{box,cylinder,display,textPanel,obstacles});
    scene.add(camera);
    function animate(dt, active) {
      if(!active || reducedMotion.matches)return;
      ambientTime += dt; screenTime += dt;
      if(screenTime >= .2){
        screenTime=0;
        for(const screen of animatedScreens){drawTelemetry(screen.surface,screen.seed,ambientTime);screen.map.needsUpdate=true;}
      }
      for(const bubble of bubbles){bubble.mesh.position.y=.2+((bubble.base+ambientTime*.24+bubble.phase)%4.5);bubble.mesh.position.x+=Math.sin(ambientTime+bubble.phase)*dt*.015;}
      for(const part of animatedParts){
        if(part.type==='belt')part.mesh.position.z=-3.45+(((part.base+3.45+ambientTime*.25)%2.7)+2.7)%2.7;
        if(part.type==='earth')part.mesh.rotation.y=ambientTime*.08;
        if(part.type==='ship-model')part.mesh.rotation.y=ambientTime*.3;
      }
    }
    return { scene, obstacles, beacon, forwardLeaves, backLeaves, doorLamp, halfWidth, animate, textures, disposeCabin };
  }

  let room = makeRoom(0);
  const clear = () => { keys.clear(); velocity.set(0, 0); dragging = false; };
  const down = event => {
    if (event.target.closest('input,textarea,button,select')) return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code) || (controlsActive && event.code === 'KeyW' && event.ctrlKey)) event.preventDefault();
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
    oldRoom.disposeCabin?.();
    oldRoom.scene.remove(camera);
    const geometries = new Set(), materials = new Set();
    oldRoom.scene.traverse(object => {
      if (object.geometry) geometries.add(object.geometry);
      const items = Array.isArray(object.material) ? object.material : object.material ? [object.material] : [];
      items.forEach(item => materials.add(item));
    });
    geometries.forEach(item => item.dispose());
    const maps = new Set(Object.values(oldRoom.textures));
    materials.forEach(item => { for(const value of Object.values(item)) if(value?.isTexture) maps.add(value); item.dispose(); });
    const bitmaps = new Set();
    maps.forEach(texture => { if(texture.image?.close)bitmaps.add(texture.image); texture.dispose(); });
    bitmaps.forEach(bitmap => bitmap.close());
  }
  function blocked(x, z, stage) {
    if (Math.abs(x) > room.halfWidth-.5) return true;
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
    reset() { disposeRoom(room); sceneIndex = 0; room = makeRoom(0); camera.position.set(0, 1.7, arrivalZ); camera.rotation.set(0, 0, 0); hoverY = 1.7; stride = 0; clear(); },
    async load(index) {
      if (index === sceneIndex || index < 0 || index >= SCENARIOS.length) return;
      const backwards = index < sceneIndex;
      const start = performance.now();
      await new Promise(resolve => requestAnimationFrame(resolve));
      const nextRoom = makeRoom(index);
      await new Promise(resolve => setTimeout(resolve, Math.max(0, 650 - (performance.now() - start))));
      disposeRoom(room); room = nextRoom; sceneIndex = index;
      camera.position.set(0, 1.7, backwards ? -arrivalZ : arrivalZ);
      camera.rotation.set(0, backwards ? Math.PI : 0, 0); hoverY = 1.7; stride = 0; clear();
    },
    update(dt, active, target, stage) {
      controlsActive = active;
      room.animate(dt,active);
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
        const control = keys.has('ControlLeft') || keys.has('ControlRight');
        const sprint = keys.has('ShiftLeft') || keys.has('ShiftRight') || (control && forward > 0);
        const pace = sceneIndex === 3 ? (sprint ? 2.4 : 1.7) : sprint ? 4.1 : 2.7;
        const desiredX = (right * Math.cos(camera.rotation.y) - forward * Math.sin(camera.rotation.y)) * pace / length;
        const desiredZ = (-forward * Math.cos(camera.rotation.y) - right * Math.sin(camera.rotation.y)) * pace / length;
        const blend = 1 - Math.exp(-(forward || right ? 9 : 12) * dt);
        velocity.x = THREE.MathUtils.lerp(velocity.x, desiredX, blend);
        velocity.y = THREE.MathUtils.lerp(velocity.y, desiredZ, blend);
        const x = camera.position.x + velocity.x * dt, z = camera.position.z + velocity.y * dt;
        if (!blocked(x, camera.position.z, stage)) camera.position.x = x; else velocity.x = 0;
        if (!blocked(camera.position.x, z, stage)) camera.position.z = z; else velocity.y = 0;
        const motion = Math.min(1, velocity.length() / 4.1);
        if (motion > .02) stride += dt * (sprint ? 11 : 8);
        const bob = reducedMotion.matches ? 0 : Math.sin(stride) * .018 * motion;
        if (sceneIndex === 3) hoverY = THREE.MathUtils.clamp(hoverY + (Number(keys.has('Space')) - Number(control && forward <= 0)) * dt * .8, 1.4, 3.25);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, hoverY + bob, Math.min(1, dt * (sceneIndex === 3 ? 5 : 12)));
        arms.forEach((arm, i) => { arm.position.y = reducedMotion.matches ? 0 : Math.sin(stride + (i ? Math.PI : 0)) * .012 * motion; });
        if (z < exitZ && Math.abs(x) < 1.08 && open) return sceneIndex + 1;
        if (z > -exitZ && Math.abs(x) < 1.08 && sceneIndex > 0) return sceneIndex - 1;
      } else {
        velocity.set(0, 0);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, hoverY, Math.min(1, dt * 12));
        arms.forEach(arm => { arm.position.y = THREE.MathUtils.lerp(arm.position.y, 0, Math.min(1, dt * 12)); });
      }
      renderer.render(room.scene, camera);
      return null;
    },
    learningPoints() {
      camera.updateMatrixWorld();
      const ray = new THREE.Raycaster(), result=[];
      for(const item of LEARNING_ROOMS[sceneIndex].objects){
        const position=new THREE.Vector3(...item.position), distance=position.distanceTo(camera.position);
        if(distance>9)continue;
        const screen=position.clone().project(camera);
        if(screen.z < -1 || screen.z > 1 || Math.abs(screen.x)>.92 || Math.abs(screen.y)>.84)continue;
        ray.set(camera.position,position.clone().sub(camera.position).normalize());
        const hit=ray.intersectObjects(room.scene.children,false)[0];
        if(hit && hit.distance < distance-1.7)continue;
        result.push({...item,x:(screen.x+1)*window.innerWidth/2,y:(1-screen.y)*window.innerHeight/2,distance,aim:Math.hypot(screen.x,screen.y)});
      }
      return result;
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
