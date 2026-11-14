import * as THREE from 'three';

export const STATIONS = [
  { id: 'suit', name: '01 / TRAJE', x: 0, z: -8, color: 0x72e4d2 },
  { id: 'ared', name: '02 / ARED', x: -7, z: -3, color: 0xffbd71 },
  { id: 'mental', name: '03 / ECLSS', x: 7, z: -3, color: 0x72bfff },
];

export function createFieldScene(container) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x4c5354);
  scene.fog = new THREE.FogExp2(0x4c5354, .006);
  const camera = new THREE.PerspectiveCamera(72, 1, .08, 150);
  camera.rotation.order = 'YXZ';
  camera.position.set(0, 1.7, 9);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.append(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xf4f2e9, 0x777d79, 1.45));
  const sun = new THREE.DirectionalLight(0xf6f6ee, 1.35);
  sun.position.set(-3, 9, 8); scene.add(sun);
  const materials = new Map();
  function material(color, glow = false) {
    const key = `${color}-${glow}`;
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, metalness: glow ? .1 : .35, roughness: glow ? .45 : .72, emissive: glow ? color : 0, emissiveIntensity: glow ? 1.7 : 0 }));
    return materials.get(key);
  }
  function box(x,y,z,w,h,d,color,glow=false) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), material(color,glow));
    mesh.position.set(x,y,z); scene.add(mesh); return mesh;
  }
  function cylinder(x,y,z,rTop,rBottom,height,color,segments=16) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop,rBottom,height,segments), material(color));
    mesh.position.set(x,y,z); scene.add(mesh); return mesh;
  }
  function panelTexture(base, line) {
    const canvas=document.createElement('canvas'); canvas.width=512;canvas.height=512;
    const ctx=canvas.getContext('2d');ctx.fillStyle=base;ctx.fillRect(0,0,512,512);
    ctx.strokeStyle=line;ctx.lineWidth=4;
    for(let i=0;i<=512;i+=128){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,512);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke();}
    let seed=2718;
    for(let i=0;i<4500;i++){seed=(seed*1664525+1013904223)>>>0;const x=seed%512;seed=(seed*1664525+1013904223)>>>0;const y=seed%512;ctx.fillStyle=i%3?'#ffffff0b':'#10232b13';ctx.fillRect(x,y,2,2);}
    const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(6,7);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return texture;
  }
  function label(text,x,y,z,color='#9fe9df',width=3) {
    const canvas = document.createElement('canvas'); canvas.width=768; canvas.height=128;
    const ctx = canvas.getContext('2d'); ctx.fillStyle='#0a1922'; ctx.fillRect(0,0,768,128);
    ctx.fillStyle=color; ctx.font=`bold ${Math.min(48,Math.floor(700/(text.length*.62)))}px monospace`; ctx.textAlign='center'; ctx.fillText(text,384,82);
    const texture = new THREE.CanvasTexture(canvas);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width,width/6), new THREE.MeshBasicMaterial({map:texture}));
    mesh.position.set(x,y,z); scene.add(mesh);
  }
  function instrument(x,y,z,title,color) {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#10252e';ctx.fillRect(0,0,512,256);
    ctx.strokeStyle='#3b6770';ctx.lineWidth=1;
    for(let i=32;i<512;i+=32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,256);ctx.stroke();}
    for(let i=32;i<256;i+=32){ctx.beginPath();ctx.moveTo(0,i);ctx.lineTo(512,i);ctx.stroke();}
    ctx.fillStyle='#d9ece7';ctx.font='bold 23px monospace';ctx.fillText(title,24,42);
    ctx.fillStyle='#92afaf';ctx.font='15px monospace';ctx.fillText('SYS  NOMINAL     100 %',24,218);
    ctx.strokeStyle='#9fddc5';ctx.lineWidth=5;ctx.beginPath();
    for(let i=0;i<=38;i++){
      const px=22+i*12,py=136+Math.sin(i*.43)*17+Math.sin(i*.13)*10;
      if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
    }
    ctx.stroke();ctx.fillStyle=color;ctx.fillRect(24,232,175,7);
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1.72,.72),new THREE.MeshBasicMaterial({map:texture}));
    mesh.position.set(x,y,z);scene.add(mesh);
  }
  // Dense, legible control surfaces are drawn into textures to keep the room affordable on the web.
  function controlTexture(seed, screen = false) {
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle=screen?'#101d21':'#777d76';ctx.fillRect(0,0,512,256);
    let state=seed*7919+17;
    const random=()=>{state=(state*1664525+1013904223)>>>0;return state/4294967296;};
    if(screen){
      ctx.fillStyle='#b7cbb6';ctx.font='bold 17px monospace';ctx.fillText(['FLIGHT DYNAMICS','ECLSS / ENVIRONMENT','CREW SYSTEMS'][seed%3],18,27);
      ctx.strokeStyle='#345653';ctx.lineWidth=1;
      for(let x=18;x<500;x+=32){ctx.beginPath();ctx.moveTo(x,36);ctx.lineTo(x,230);ctx.stroke();}
      for(let y=38;y<235;y+=24){ctx.beginPath();ctx.moveTo(16,y);ctx.lineTo(498,y);ctx.stroke();}
      ctx.strokeStyle='#88b6a5';ctx.lineWidth=2;ctx.beginPath();
      for(let x=18;x<492;x+=5){const y=120+Math.sin(x*.025+seed)*31+Math.sin(x*.11+seed)*8;x===18?ctx.moveTo(x,y):ctx.lineTo(x,y);}
      ctx.stroke();
      for(let i=0;i<30;i++){ctx.fillStyle=random()>.7?'#d9b777':'#759c94';ctx.fillRect(22+(i%10)*47,187+Math.floor(i/10)*16,24+random()*12,5);}
    } else {
      for(let row=0;row<7;row++)for(let col=0;col<19;col++){
        const x=13+col*26,y=10+row*34,r=random();
        ctx.fillStyle=r>.89?'#c7a96d':r>.55?'#c6cdc5':'#414b4c';
        if(r>.77){ctx.beginPath();ctx.arc(x+7,y+9,4,0,Math.PI*2);ctx.fill();}
        else ctx.fillRect(x,y,15,13);
        ctx.fillStyle='#303c3c';ctx.fillRect(x,y+17,20,2);
      }
    }
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return texture;
  }
  const floorTexture=panelTexture('#858782','#737974');
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(24,28),new THREE.MeshStandardMaterial({map:floorTexture,metalness:.08,roughness:.94}));
  floor.rotation.x=-Math.PI/2;floor.position.y=.005;scene.add(floor);
  box(0,-.18,0,24,.35,28,0x394b55);
  box(0,3,-12,24,6,.4,0x82939a);
  box(-12,3,0,.4,6,28,0x83939b); box(12,3,0,.4,6,28,0x83939b);
  box(0,3,14,24,6,.4,0x677b86);
  box(0,6,0,24,.25,28,0xc4c7bf);
  // Suspended ceiling and recessed fluorescent panels echo the terrestrial reference.
  for(let z=-11;z<14;z+=2)for(let x=-11;x<12;x+=2){
    box(x,5.865,z,1.94,.025,1.94,0xd5d6cd);
    if((Math.round(x+z)%4)===0)box(x,5.828,z,1.35,.018,.46,0xf1f2e7,true);
  }
  // Layered wall panels, conduits and skirting create architectural scale.
  for(let z=-11;z<14;z+=3){
    for(const side of [-1,1]){
      box(side*11.73,3,z,.12,5.4,2.75,0xaab9bd);
      box(side*11.63,3,z+1.4,.18,5.5,.045,0x536975);
      box(side*11.5,.35,z,.17,.55,2.7,0x3a535e);
      box(side*11.53,5.35,z,.12,.18,2.5,0x405c68);
      for(const y of [1.2,4.8])box(side*11.53,y,z,.05,.04,2.2,0x536a74);
    }
  }
  for(const x of [-10,-6,-2,2,6,10]){
    box(x,3.1,-11.72,3.6,5.3,.09,0xa7b5b8);
    box(x+1.87,3.1,-11.62,.06,5.3,.12,0x526672);
  }
  box(0,.32,-11.58,23,.6,.18,0x3b505c);
  box(0,5.42,-11.6,23,.24,.18,0x3b505c);
  for (const z of [-10,-4,2,8,13]) {
    box(-11.6,3,z,.5,6,.5,0x687b82); box(11.6,3,z,.5,6,.5,0x687b82);
    box(0,5.7,z,23.5,.4,.5,0x657a83);
    for(const x of [-6,0,6]){
      box(x,5.46,z,3.8,.08,.72,0x2b3f49);
      box(x,5.4,z,3.5,.035,.46,0xe4f7ff,true);
    }
  }
  // Long sight lines, safety markings and observation windows.
  for (const x of [-1.85,1.85]) box(x,.03,1,.055,.025,22,0xe1d8a5);
  for (let z=-8; z<12; z+=2) box(0,.032,z,.1,.025,.6,0xced6d5);
  for (let z=-9;z<12;z+=3) {
    box(-11.58,2.9,z,.13,2.9,2.4,0x304f5d);
    box(-11.47,2.9,z,.025,2.5,2.1,0x91b6c1);
    box(-11.43,2.9,z,.04,2.55,.08,0xd8e1df);
    box(-11.43,2.9,z,.04,.08,2.15,0xd8e1df);
    box(11.54,2.85,z,.13,2.7,2.4,0x4b6571);
    box(11.43,2.85,z,.04,2.5,2.1,0x7c9ba7);
  }
  for(let z=-8;z<13;z+=4){
    box(0,5.86,z,1.8,.07,1.1,0x4f636b);
    for(let i=-2;i<=2;i++)box(i*.27,5.81,z,.06,.025,.9,0x314751);
  }
  label('ASCAN  /  EARTH OPERATIONS',0,4.45,-11.35,'#152d37',9);
  label('TRAINING SECTOR 07',0,3.72,-11.34,'#365e66',5);
  label('LUNAR COMMAND',0,4,13.67,'#d6e9e9',6);
  const obstacles=[];
  const beacons=[];
  for (const station of STATIONS) {
    const {x,z,color}=station;
    box(x,.62,z,2.5,1.2,1.2,0x62737a);
    box(x,1.27,z,2.8,.13,1.45,0xc3cccb);
    box(x,1.79,z-.28,1.95,.94,.18,0x314653);
    instrument(x,1.79,z-.13,station.id==='suit'?'SUIT / BIOPLOT':station.id==='ared'?'ARED / LOAD':'ECLSS / AIR',station.id==='ared'?'#d9ab72':'#7fd7c5');
    for(let i=0;i<6;i++) {
      box(x-.65+i*.25,1.81,z-.145,.09,.025,.055,i<3?0x94dec9:0xc7e4ed,true);
      box(x-.65+i*.25,1.38,z+.42,.1,.035,.1,i===0?color:0x7a8c8f,i===0);
    }
    for(const side of [-1,1]){
      box(x+side*1.2,.57,z+.54,.07,.75,.08,0x263e4b);
      cylinder(x+side*1.1,1.38,z+.46,.06,.06,.08,0x304855);
    }
    label(station.name,x,2.85,z+.06,'#e5f3f2',3.2);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(1.85,.018,8,48),material(color,true));
    ring.rotation.x=-Math.PI/2; ring.position.set(x,.04,z); scene.add(ring); beacons.push(ring);
    obstacles.push({x,z,w:3,d:1.7});
  }
  // ARED exercise frame with adjustable resistance columns.
  for (const x of [-8.6,-5.4]) {
    box(x,1.8,-5,.18,3.6,.22,0xadb9bc);
    box(x,1.8,-4.86,.09,2.5,.08,0x415a65);
    cylinder(x,.42,-4.6,.26,.26,.14,0x293f4a);
  }
  box(-7,3.5,-5,3.4,.16,.22,0xd2d9d7);
  box(-7,2.6,-4.95,2.2,.13,.15,0xe1ac64);
  box(-7,.15,-5.05,3.3,.16,2.3,0x384d54);
  box(-7,.25,-5.05,2.8,.035,1.7,0x5d7375);
  for(const x of [-7.9,-6.1]) for(const z of [-5.9,-4.2])cylinder(x,.32,z,.22,.22,.1,0xc2c9c2);
  for(const x of [-3.8,3.8]) {
    box(x,1.5,-9,.72,1.15,.48,0xe3e7e2);
    box(x,1.75,-8.72,.55,.43,.03,0x597883);
    const helmet=new THREE.Mesh(new THREE.SphereGeometry(.32,20,16),material(0xc2d5d8)); helmet.position.set(x,2.45,-9);scene.add(helmet);
    box(x,2.45,-8.67,.43,.19,.03,0x31525d);
    for(const side of [-1,1]) {box(x+side*.49,1.5,-9,.22,1.1,.27,0xdbe1df);box(x+side*.23,.6,-9,.29,.7,.35,0xdbe1df);}
    box(x,2.95,-9.15,1.5,.09,.25,0x6c828b);
    box(x,.22,-9.1,1.9,.15,.9,0x6b858c);
    obstacles.push({x,z:-9,w:1.5,d:1});
  }
  // Mission Control gallery: two staffed rows, with a clear central walking route.
  box(6.5,4.15,1.65,8,.72,.19,0x606b66);
  label('MISSION CONTROL / FLIGHT OPS',6.5,4.15,1.765,'#e4e6d6',7.7);
  for(let row=0;row<2;row++)for(let col=0;col<3;col++){
    const x=4.15+col*2.35,z=3.2+row*5.1,seed=row*3+col;
    box(x,.56,z,2.22,1.05,1.35,0x858c82);
    box(x,1.11,z+.53,2.27,.13,.4,0xadb3a8);
    box(x,1.78,z-.36,2.13,1.12,.18,0x454e4a);
    box(x,1.78,z-.247,1.85,.77,.035,0x141c1e);
    const screen=new THREE.Mesh(new THREE.PlaneGeometry(1.75,.68),new THREE.MeshBasicMaterial({map:controlTexture(seed,true)}));
    screen.position.set(x,1.78,z-.223);scene.add(screen);
    const controls=new THREE.Mesh(new THREE.PlaneGeometry(2.05,.75),new THREE.MeshStandardMaterial({map:controlTexture(seed),metalness:.18,roughness:.78,side:THREE.DoubleSide}));
    controls.rotation.x=-.55;controls.position.set(x,1.28,z+.37);scene.add(controls);
    for(const side of [-1,1])box(x+side*1.03,1.5,z+.19,.07,.85,1.04,0xabb0a6);
    box(x,.75,z+1.45,.86,.13,.72,0x535d58);
    box(x,.46,z+1.45,.12,.57,.12,0x5e6964);
    box(x,.32,z+1.45,.65,.08,.56,0x454f4c);
    box(x,1.25,z+1.77,.82,.8,.09,0x626d67);
    obstacles.push({x,z:z+.55,w:2.22,d:3.1});
  }
  for(const x of [4.15,6.5,8.85]){
    const display=new THREE.Mesh(new THREE.PlaneGeometry(2.1,1.13),new THREE.MeshBasicMaterial({map:controlTexture(Math.round(x*2),true)}));
    display.position.set(x,3.25,-11.542);scene.add(display);
  }
  // T2 treadmill: visible as a physical training station in the same room.
  box(7,.19,-8,2.1,.25,3.1,0x303e47);
  box(7,.36,-8,1.65,.07,2.6,0x192a31);
  for(const x of [6.05,7.95]){
    box(x,1.1,-9,.08,1.7,.1,0xb6c5c5);
    box(x,1.8,-8.63,.08,.08,.85,0xb6c5c5);
    cylinder(x,.22,-6.75,.16,.16,.15,0x202e37);
  }
  box(7,1.84,-8.15,1.9,.08,.09,0xd3dedb);
  box(7,2.18,-9.05,.85,.54,.12,0x344b55);
  box(7,2.19,-8.98,.72,.41,.025,0x8cbdc4,true);
  label('T2 / CARDIO',7,3.03,-9.22,'#d5e7e6',2.2);
  // Equipment cabinets, hazard bands and pipework.
  for(const x of [-9.9,9.9])for(const z of [-1,3]){
    box(x,1.1,z,1.35,2.2,.78,0x8da1a7);
    box(x,1.1,z+.405,1.2,1.95,.025,0xb7c5c6);
    box(x,1.1,z+.43,.05,1.8,.04,0x526b77);
    box(x+.43,1.1,z+.44,.04,.2,.045,0x384e5b);
    box(x,.16,z+.6,1.5,.18,.15,0xe2ba6b);
  }
  for(const z of [-9,-5,-1,3,7,11]){
    cylinder(-10.8,5.52,z,.095,.095,2.5,0x607b84);
    cylinder(10.8,5.52,z,.095,.095,2.5,0x607b84);
  }
  // First-person suit sleeves and gloves stay at eye level without hiding the path.
  const glove=material(0xd7e0dc),cuff=material(0x839aa0);
  const arms=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();
    const sleeve=new THREE.Mesh(new THREE.CylinderGeometry(.09,.14,.38,10),glove);
    sleeve.rotation.z=side*.55;sleeve.position.set(side*.64,-.74,-.94);arm.add(sleeve);
    const wrist=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.09,10),cuff);
    wrist.rotation.z=side*.55;wrist.position.set(side*.57,-.56,-1);arm.add(wrist);
    const hand=new THREE.Mesh(new THREE.BoxGeometry(.17,.11,.15),glove);
    hand.position.set(side*.54,-.49,-1.04);arm.add(hand);
    camera.add(arm);arms.push(arm);
  }
  scene.add(camera);
  let dragging=false;
  const keys = new Set();
  const velocity=new THREE.Vector2();
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  let stride=0,controlsActive=false;
  const canvas=renderer.domElement;
  canvas.tabIndex=0; canvas.setAttribute('aria-label','Base terrestre en primera persona. WASD para caminar; flechas para mirar.');
  const down=e=>{if(e.target.closest('input,textarea,button,select'))return; if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys.add(e.code);};
  const up=e=>keys.delete(e.code);
  const clear=()=>{keys.clear();dragging=false;velocity.set(0,0);};
  const look=e=>{if(controlsActive&&(document.pointerLockElement===canvas||dragging)){camera.rotation.y-=e.movementX*.002;camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x-e.movementY*.002,-1.3,1.3);}};
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
    reset(){camera.position.set(0,1.7,9);camera.rotation.set(0,0,0);stride=0;clear();},
    update(dt,active,target){
      controlsActive=active;
      if(active){
        camera.rotation.y+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt*1.5;
        camera.rotation.x=THREE.MathUtils.clamp(camera.rotation.x+((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0))*dt,-1.3,1.3);
        let forward=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0),right=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
        const length=Math.hypot(forward,right)||1;
        const pace=keys.has('ShiftLeft')?2.85:1.75;
        const desiredX=(right*Math.cos(camera.rotation.y)-forward*Math.sin(camera.rotation.y))*pace/length;
        const desiredZ=(-forward*Math.cos(camera.rotation.y)-right*Math.sin(camera.rotation.y))*pace/length;
        const blend=1-Math.exp(-(forward||right?9:12)*dt);
        velocity.x=THREE.MathUtils.lerp(velocity.x,desiredX,blend);
        velocity.y=THREE.MathUtils.lerp(velocity.y,desiredZ,blend);
        const x=camera.position.x+velocity.x*dt,z=camera.position.z+velocity.y*dt;
        if(!blocked(x,camera.position.z))camera.position.x=x;else velocity.x=0;
        if(!blocked(camera.position.x,z))camera.position.z=z;else velocity.y=0;
        const motion=velocity.length()/2.85;
        if(motion>.02)stride+=dt*(keys.has('ShiftLeft')?11:8);
        const bob=reducedMotion.matches?0:Math.sin(stride)*.018*motion;
        camera.position.y=THREE.MathUtils.lerp(camera.position.y,1.7+bob,Math.min(1,dt*12));
        arms.forEach((arm,i)=>{arm.position.y=reducedMotion.matches?0:Math.sin(stride+(i?Math.PI:0))*.012*motion;});
      }else{
        velocity.set(0,0);
        camera.position.y=THREE.MathUtils.lerp(camera.position.y,1.7,Math.min(1,dt*12));
        arms.forEach(arm=>{arm.position.y=THREE.MathUtils.lerp(arm.position.y,0,Math.min(1,dt*12));});
      }
      beacons.forEach((b,i)=>{b.visible=STATIONS[i].id===target;});
      renderer.render(scene,camera);
    },
    near(){return STATIONS.find(s=>Math.hypot(camera.position.x-s.x,camera.position.z-s.z)<3.1);},
    distance(id){const s=STATIONS.find(s=>s.id===id);return s?Math.hypot(camera.position.x-s.x,camera.position.z-s.z):0;},
  };
}
