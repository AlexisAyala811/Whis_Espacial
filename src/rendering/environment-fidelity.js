import * as THREE from 'three';

const ROOM_DETAILS = [
  ['01 / PREPARACION','TRAJE  /  PRESION  /  TELEMETRIA','#9ed9db'],
  ['02 / ACONDICIONAMIENTO','FUERZA  /  RITMO  /  RECUPERACION','#dfc286'],
  ['03 / CONTROL','AMBIENTE  /  ALERTAS  /  TRIPULACION','#83c9e2'],
  ['04 / FLOTABILIDAD','ENSAYO EVA  /  ENTORNO SIMULADO','#83d6df'],
  ['05 / HABITAT','AGUA  /  AIRE  /  ENERGIA','#d9c99b'],
  ['06 / ENSAMBLAJE','ACCESO TECNICO  /  SEGURIDAD','#e7bb63'],
  ['07 / CABINA','NAVEGACION  /  MISION  /  RECURSOS','#8ec9d8']
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
  c.fillStyle='#819da0';c.font='19px monospace';c.fillText('LUNAR COMMAND  /  ENTRENAMIENTO SIMULADO',58,205);
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
  // Low-profile wall lighting and base trim keep the centre aisle clear.
  for(const side of [-1,1])for(const z of [-7,-2,3,7]){
    box(side*(halfWidth-.21),.2,z,.08,.08,1.5,0x68888b);
    box(side*(halfWidth-.24),3.15,z,.06,.04,.65,index===5?0xe2bf78:0xa5d9d6,true);
  }
}

