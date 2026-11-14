import * as THREE from 'three';

export const STATIONS = [
  { id: 'suit', name: '01 / TRAJE', x: 0, z: -8, color: 0x72e4d2 },
  { id: 'ared', name: '02 / ARED', x: -7, z: -3, color: 0xffbd71 },
  { id: 'mental', name: '03 / ECLSS', x: 7, z: -3, color: 0x72bfff },
];

export function createFieldScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x09131c);
  scene.fog = new THREE.FogExp2(0x09131c, .018);
  const camera = new THREE.PerspectiveCamera(72, 1, .08, 150);
  camera.rotation.order = 'YXZ';
  camera.position.set(0, 1.7, 9);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  container.append(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xc2e6f4, 0x16222b, 2.1));
  const sun = new THREE.DirectionalLight(0xc0e4ff, 2.8);
  sun.position.set(4, 10, 8); scene.add(sun);
  const materials = new Map();
  function material(color, glow = false) {
    const key = `${color}-${glow}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, metalness: glow ? .1 : .55, roughness: .5, emissive: glow ? color : 0, emissiveIntensity: glow ? 2 : 0 }));
    return materials.get(key);
  }
  function box(x,y,z,w,h,d,color,glow=false) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material(color,glow));
    mesh.position.set(x,y,z); scene.add(mesh); return mesh;
  }
  function label(text,x,y,z,color='#9fe9df',width=3) {
    const canvas = document.createElement('canvas'); canvas.width=768; canvas.height=128;
    const ctx = canvas.getContext('2d'); ctx.fillStyle='#0a1922'; ctx.fillRect(0,0,768,128);
    ctx.fillStyle=color; ctx.font='bold 48px monospace'; ctx.textAlign='center'; ctx.fillText(text,384,82);
    const texture = new THREE.CanvasTexture(canvas);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width,width/6), new THREE.MeshBasicMaterial({map:texture}));
    mesh.position.set(x,y,z); scene.add(mesh);
  }
  box(0,-.18,0,24,.35,28,0x263842);
  const grid = new THREE.GridHelper(28,28,0x627a7c,0x354c56); grid.position.y=.006; scene.add(grid);
  box(0,3,-12,24,6,.4,0x263b49);
  box(-12,3,0,.4,6,28,0x233947); box(12,3,0,.4,6,28,0x233947);
  box(0,3,14,24,6,.4,0x20313e);
  box(0,6,0,24,.25,28,0x142530);
  for (const z of [-10,-4,2,8,13]) {
    box(-11.6,3,z,.5,6,.5,0x50616b); box(11.6,3,z,.5,6,.5,0x50616b);
    box(0,5.7,z,23.5,.4,.5,0x435967);
    box(0,5.45,z,12,.06,.16,0xc2f5ff,true);
  }
  // Recessed panels, floor guidance and glazed observation wall.
  for (let x=-10; x<=10; x+=4) {
    box(x,3.2,-11.7,3.7,4.8,.12,0x182b37);
    box(x,.12,-11.3,3.5,.09,.1,0x7dd8db,true);
  }
  for (const x of [-2.1,2.1]) box(x,.02,1,.045,.018,21,0x87aeb0);
  for (let z=-7; z<12; z+=2) box(0,.025,z,.13,.02,.65,0x8bc5bd);
  for (let z=2;z<=10;z+=4) {
    box(-11.7,3,z,.12,2.5,3.7,0x88bfd1,true);
    box(-11.55,3,z,.18,2.7,.1,0x294756);
  }
  label('ASCAN / EARTH OPERATIONS',0,4.5,-11.45,'#c5dfde',9);
  label('TRAINING SECTOR 07',0,3.7,-11.4,'#72bcb7',5);
  label('LUNAR COMMAND',0,4,13.6,'#72bcb7',6);
  const obstacles=[];
  const beacons=[];
  for (const station of STATIONS) {
    const {x,z,color}=station;
    box(x,.6,z,2.6,1.2,1.2,0x405464);
    box(x,1.28,z,2.8,.16,1.4,0x75858a);
    box(x,1.85,z-.25,2,.95,.16,0x0c2029);
    box(x,1.86,z-.15,1.75,.68,.025,color,true);
    for(let i=0;i<5;i++) box(x-.7+i*.35,1.4,z+.45,.16,.05,.12,i===0?color:0x8b9a99,i===0);
    label(station.name,x,2.8,z+.1,'#d2efeb',3.2);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.8,.025,8,64),material(color,true));
    ring.rotation.x=-Math.PI/2; ring.position.set(x,.04,z); scene.add(ring); beacons.push(ring);
    obstacles.push({x,z,w:3,d:1.7});
  }
  // ARED apparatus and suit racks provide recognizable silhouettes.
  for (const x of [-8.6,-5.4]) box(x,1.8,-5,.14,3.6,.2,0x9ba9ad);
  box(-7,3.5,-5,3.4,.15,.2,0x9ba9ad);
  box(-7,2.6,-5,2.2,.12,.12,0xffbd71);
  for(const x of [-3.8,3.8]) {
    box(x,1.5,-9,.8,1.2,.5,0xbcc9c6);
    const helmet=new THREE.Mesh(new THREE.SphereGeometry(.32,20,12),material(0x91c8d0)); helmet.position.set(x,2.45,-9);scene.add(helmet);
    for(const side of [-1,1]) {box(x+side*.5,1.5,-9,.22,1.1,.27,0xaab9b7);box(x+side*.23,.6,-9,.3,.7,.35,0xaab9b7);}
    obstacles.push({x,z:-9,w:1.5,d:1});
  }
  for(const x of [9,10.5]) for(const z of [7,9]) {
    box(x,.6,z,1.3,1.2,1.3,0x3b535b); box(x,1.22,z,1.35,.06,1.35,0x758780);
    obstacles.push({x,z,w:1.5,d:1.5});
  }
  let dragging=false;
  const keys = new Set();
  const canvas=renderer.domElement;
  canvas.tabIndex=0; canvas.setAttribute('aria-label','Base terrestre en primera persona. WASD para caminar; flechas para mirar.');
  const down=e=>{if(e.target.closest('input,textarea,button,select'))return; if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys.add(e.code);};
  const up=e=>keys.delete(e.code);
  const clear=()=>{keys.clear();dragging=false;};
  const look=e=>{if(document.pointerLockElement===canvas||dragging){camera.rotation.y-=e.movementX*.002;camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x-e.movementY*.002,-1.3,1.3);}};
  window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);
  document.addEventListener('mousemove',look);
  canvas.addEventListener('pointerdown',()=>{dragging=true;canvas.focus();});window.addEventListener('pointerup',()=>{dragging=false;});
  const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);};
  window.addEventListener('resize',resize);resize();
  const blocked=(x,z)=>Math.abs(x)>11||z< -10.8||z>12.8||obstacles.some(o=>Math.abs(x-o.x)<o.w/2+.3&&Math.abs(z-o.z)<o.d/2+.3);
  return {
    camera,
    focus(){canvas.focus();},
    async capture(){try{await canvas.requestPointerLock();}catch{ /* Drag and keyboard remain available. */ }},
    release(){if(document.pointerLockElement===canvas)document.exitPointerLock();clear();},
    reset(){camera.position.set(0,1.7,9);camera.rotation.set(0,0,0);clear();},
    update(dt,active,target){
      if(active){
        camera.rotation.y+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt*1.5;
        camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x+((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0))*dt,-1.3,1.3);
        let forward=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0),right=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
        const length=Math.hypot(forward,right)||1,speed=(keys.has('ShiftLeft')?5:3)*dt/length;
        const x=camera.position.x+(right*Math.cos(camera.rotation.y)-forward*Math.sin(camera.rotation.y))*speed;
        const z=camera.position.z+(-forward*Math.cos(camera.rotation.y)-right*Math.sin(camera.rotation.y))*speed;
        if(!blocked(x,camera.position.z))camera.position.x=x;
        if(!blocked(camera.position.x,z))camera.position.z=z;
      }
      beacons.forEach((b,i)=>{b.visible=STATIONS[i].id===target;});
      renderer.render(scene,camera);
    },
    near(){return STATIONS.find(s=>Math.hypot(camera.position.x-s.x,camera.position.z-s.z)<3.1);},
    distance(id){const s=STATIONS.find(s=>s.id===id);return s?Math.hypot(camera.position.x-s.x,camera.position.z-s.z):0;},
  };
}
