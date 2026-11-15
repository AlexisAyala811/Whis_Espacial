import * as THREE from 'three';

const ROOM_DETAILS = [
  ['01 / SUIT PREPARATION',"SUIT  /  PRESSURE  /  TELEMETRY",'#9ed9db'],
  ['02 / CONDITIONING','STRENGTH  /  PACE  /  RECOVERY','#dfc286'],
  ['03 / CONTROL','ENVIRONMENT  /  ALERTS  /  CREW','#83c9e2'],
  ['04 / BUOYANCY','EVA TRAINING  /  SIMULATED SETTING','#83d6df'],
  ['05 / HABITAT',"WATER  /  AIR  /  POWER",'#d9c99b'],
  ['06 / ASSEMBLY',"TECHNICAL ACCESS  /  SAFETY",'#e7bb63'],
  ['07 / CABIN',"NAVIGATION  /  MISSION  /  RESOURCES",'#8ec9d8']
];

// Room-specific wall panels add visual depth without placing objects in the route.
export function addRoomFidelity(index, scene, box, halfWidth) {
  const [title, subtitle, accent] = ROOM_DETAILS[index];
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;
  const c=canvas.getContext('2d');
  c.fillStyle='#182d35';c.fillRect(0,0,1024,256);
  const g=c.createLinearGradient(0,0,1024,256);g.addColorStop(0,'#294953');g.addColorStop(1,'#101d24');c.fillStyle=g;c.fillRect(5,5,1014,246);
  c.strokeStyle='#78979b';c.lineWidth=3;c.strokeRect(8,8,1008,240);
  c.fillStyle=accent;c.fillRect(26,27,8,200);c.font='bold 44px sans-serif';c.fillText(title,58,88);
  c.fillStyle='#b5cecd';c.font='23px monospace';c.fillText(subtitle,58,130);
  c.fillStyle='#819da0';c.font='19px monospace';c.fillText("LUNAR COMMAND  /  SIMULATED TRAINING",58,205);
  c.strokeStyle=accent;c.lineWidth=3;c.beginPath();
  for(let i=0;i<14;i++){const x=755+i*17,y=116+Math.sin(i*.9+index)*25; i?c.lineTo(x,y):c.moveTo(x,y)}c.stroke();
  for(let i=0;i<5;i++){c.fillStyle=i===3?'#edbe72':accent;c.fillRect(756+i*44,167,30,7);}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const material=new THREE.MeshBasicMaterial({map:texture});
  const geometry=new THREE.PlaneGeometry(2.8,.7);
  for(const side of [-1,1])for(const z of [-5.2,3.8]){
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(side*(halfWidth-.36),3.75,z);mesh.rotation.y=-side*Math.PI/2;scene.add(mesh);
    box(side*(halfWidth-.29),3.75,z,.08,.82,2.95,0x233f48);
    for(const dz of [-1.35,1.35])box(side*(halfWidth-.35),3.75,z+dz,.025,.58,.025,0xa6b9b6);
  }
  // Spatial details inspired by real training facilities, kept outside the central route.
  if(index===0){
    for(const side of [-1,1])for(const z of [-6,-3,0,3,6]){
      const x=side*(halfWidth-.85);
      for(const y of [.72,.79,.86])box(x, y, z,.035,.025,.86,0x536d72);
      box(x,2.47,z,.04,.08,.92,0xd7e4df,true);
    }
  } else if(index===1){
    for(const z of [-6,-2,2,6])for(const side of [-1,1]){
      box(side*8.65,4.55,z,.12,.12,2.8,0x90a19e);
      box(side*8.55,4.35,z,.06,.06,1.4,0xead9aa,true);
    }
  } else if(index===2){
    // Monitor surrounds and indicator rows echo an operations control room.
    for(const x of [-6.8,-3.6,3.6,6.8]){
      box(x,4.15,-9.19,2.5,.08,.14,0x8fb5bf);
      for(let i=0;i<7;i++)box(x-.9+i*.3,2.59,-9.11,.12,.04,.04,i===4?0xe8bd79:0x75c9cb,true);
    }
    for(const z of [-6,-2,2,6])for(const side of [-1,1]){
      box(side*9.65,2.25,z,.08,3.4,.08,0x75929c);
      box(side*9.58,4.85,z,.06,.05,2.4,0x9fd8dc,true);
    }
  } else if(index===3){
    // Handrails and recessed underwater work lights frame the training module.
    for(const side of [-1,1])for(const z of [-7,-4,-1,2,5]){
      box(side*9.2,4.25,z,.07,1.2,.07,0xd3b26d);
      box(side*9.2,4.8,z,.07,.07,3,0xd3b26d);
      box(side*9.63,1.1,z,.04,.28,.8,0x76cde0,true);
    }
    for(const z of [-4.2,-3.4,-2.6,-1.8,-1]){
      box(2.7,2.35,z,.1,.1,.7,0x7da6ae);
      box(5.7,2.35,z,.1,.1,.7,0x7da6ae);
    }
  } else if(index===4){
    for(const z of [1.1,2.8,4.5]){
      for(const x of [5.9,6.2,6.5])for(const side of [-1,1]){
        const leaf=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),new THREE.MeshStandardMaterial({color:0x73a966,roughness:.9}));
        leaf.position.set(x+side*.12,2.15,z);leaf.scale.set(1.4,.45,.7);leaf.rotation.z=side*.4;scene.add(leaf);
      }
      box(6.2,2.75,z,1.15,.07,.18,0xe7f4df,true);
    }
  } else if(index===5){
    // Fine cross-bracing and rails enrich the high-bay silhouette.
    for(const side of [-1,1])for(const z of [-7,-3,1,5])for(const y of [3,7,11]){
      const diagonal=box(side*8.42,y,z,.09,3.7,.09,0x86928c);diagonal.rotation.z=side*.45;
      box(side*8.5,y+1.8,z,.12,.12,3.3,0xcda75a);
    }
    for(const side of [-1,1])for(const y of [4.75,9.05,13.15])box(side*7.15,y,-1,.07,.07,14.5,0xe6bd64);
  } else if(index===6){
    for(const x of [2.5,4.1,5.7]){
      box(x,1.91,-5.02,1.2,.035,.05,0x8dcfcf,true);
      for(const dx of [-.45,-.27,-.09,.09,.27,.45])box(x+dx,1.88,-4.95,.06,.025,.06,0xc9d9d1);
    }
  }
  // Low-profile wall lighting and base trim keep the centre aisle clear.
  for(const side of [-1,1])for(const z of [-7,-2,3,7]){
    box(side*(halfWidth-.21),.2,z,.08,.08,1.5,0x68888b);
    box(side*(halfWidth-.24),3.15,z,.06,.04,.65,index===5?0xe2bf78:0xa5d9d6,true);
  }
}

