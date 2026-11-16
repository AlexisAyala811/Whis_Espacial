import * as THREE from 'three';

const REFERENCES = [
  ['suit.jpg', 'SPACESUIT SYSTEMS / REFERENCE'],
  ['exercise.jpg', 'EXERCISE IN SPACE / REFERENCE'],
  ['control.jpg', 'HOUSTON CONTROL / ARCHIVE'],
  ['eva.jpg', 'NEUTRAL BUOYANCY / REFERENCE'],
  ['habitat.jpg', 'HERA ANALOG / REFERENCE'],
  ['../rocket/artemis-i-vab.jpg', 'ARTEMIS I / REFERENCE'],
  ['cabin.jpg', 'ORION CREW MODULE / REFERENCE'],
  ['habitat.jpg', 'HABITAT ANALOG / REFERENCE']
];

// Non-interactive layers stay at the room edges so doors and tasks remain reachable.
export function addSceneBackground(scene, index, halfWidth, roomHeight, backZ = -9.32) {
  const group = new THREE.Group();
  group.name = 'environment-background-detail';
  scene.add(group);
  const shell = new THREE.MeshStandardMaterial({color:index===3?0x557782:0x778987,roughness:.73,metalness:.3});
  const shadow = new THREE.MeshStandardMaterial({color:0x263a3d,roughness:.82,metalness:.2});
  const strip = new THREE.MeshStandardMaterial({color:index===5?0xc99d52:0x98b7b4,roughness:.55,metalness:.35});
  const block = new THREE.BoxGeometry(1,1,1);
  const layers = [];
  function add(x,y,z,w,h,d,material) { const mesh=new THREE.Mesh(block,material); mesh.position.set(x,y,z);mesh.scale.set(w,h,d);group.add(mesh);layers.push(mesh); }
  // Layered service conduits at the upper wall and ceiling provide visible depth.
  const roof=Math.min(roomHeight-.35,index===5?15.8:roomHeight-.35);
  if(index!==6){
    for(const side of [-1,1]){
      const x=side*(halfWidth-.24);
      add(x,roof-.1,0,.14,.18,19,shadow);
      add(x-side*.12,roof-.3,0,.12,.1,19,strip);
      for(const z of [-7,-3,1,5,8]){
        add(x-side*.08,roof-.25,z,.28,.5,.12,shell);
        add(x-side*.14,roof-.49,z,.05,.08,.42,strip);
      }
    }
  } else {
    // Keep both panoramic windows open in the spacecraft.
    for(const x of [-6,-3,0,3,6]) add(x,roof-.1,0,.07,.08,17,shadow);
  }
  for(const side of [-1,1]) for(const z of [-7,-3,1,5,8]) {
    const x=side*(halfWidth-.22);
    add(x,.36,z,.07,.26,2.25,shadow);
    add(x-side*.04,.5,z,.03,.035,2.05,strip);
  }
  // Instance the repeated background construction to limit draw calls.
  for(const material of [shell,shadow,strip]) {
    const matches=layers.filter(item=>item.material===material);
    if(!matches.length)continue;
    const batch=new THREE.InstancedMesh(block,material,matches.length);
    const transform=new THREE.Matrix4();
    matches.forEach((item,i)=>{item.updateMatrix();transform.copy(item.matrix);batch.setMatrixAt(i,transform);group.remove(item);});
    batch.instanceMatrix.needsUpdate=true;group.add(batch);
  }

  // The assembly bay already has its own credited Artemis photograph.
  if(index===5)return group;

  const [file,label]=REFERENCES[index];
  const panel=document.createElement('canvas');panel.width=1024;panel.height=576;
  const ctx=panel.getContext('2d');ctx.fillStyle='#18292e';ctx.fillRect(0,0,1024,576);
  ctx.fillStyle='#b8d5cf';ctx.font='bold 28px sans-serif';ctx.fillText(label,32,72);
  const map=new THREE.CanvasTexture(panel);map.colorSpace=THREE.SRGBColorSpace;
  const img=new Image();let alive=true;
  map.addEventListener('dispose',()=>{alive=false;img.onload=null;img.onerror=null;});
  img.onload=()=>{
    if(!alive)return;
    const ratio=1024/500,iw=img.naturalWidth,ih=img.naturalHeight;
    const sw=Math.min(iw,ih*ratio),sh=sw/ratio;
    ctx.drawImage(img,(iw-sw)/2,(ih-sh)/2,sw,sh,0,0,1024,500);
    ctx.fillStyle='#142429';ctx.fillRect(0,500,1024,76);
    ctx.fillStyle='#cce1db';ctx.font='bold 26px sans-serif';ctx.fillText(label,25,548);
    ctx.font='20px sans-serif';ctx.textAlign='right';ctx.fillText('NASA / ARCHIVE',998,548);ctx.textAlign='left';
    map.needsUpdate=true;
  };
  img.src=file.startsWith('../')?'./assets/'+file.slice(3):'./assets/environments/'+file;
  const panelWidth=index===5?3.0:2.8,panelHeight=panelWidth*576/1024;
  const screen=new THREE.Mesh(new THREE.PlaneGeometry(panelWidth,panelHeight),new THREE.MeshBasicMaterial({map}));
  screen.position.set(-Math.min(halfWidth-2.2,4.4),Math.min(roomHeight-1.12,index===5?6.4:4.05),backZ);
  screen.name='nasa-background-reference';group.add(screen);
  return group;
}
