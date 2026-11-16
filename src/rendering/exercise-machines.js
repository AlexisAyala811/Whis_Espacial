import * as THREE from 'three';
import { RoundedBoxGeometry } from '../../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Fictional exercise hardware inspired by real training machines; no medical simulation.
export function addExerciseMachines(scene) {
  const root=new THREE.Group();root.name='conditioning-equipment';scene.add(root);
  const frame=new THREE.MeshStandardMaterial({color:0x8c9996,roughness:.48,metalness:.62});
  const pale=new THREE.MeshStandardMaterial({color:0xc5ceca,roughness:.62,metalness:.3});
  const dark=new THREE.MeshStandardMaterial({color:0x26363b,roughness:.83,metalness:.12});
  const rubber=new THREE.MeshStandardMaterial({color:0x1c2628,roughness:.95});
  const accent=new THREE.MeshStandardMaterial({color:0xceaa68,roughness:.64,metalness:.25});
  function screenMaterial(title) {
    const canvas=document.createElement('canvas');canvas.width=256;canvas.height=128;
    const c=canvas.getContext('2d');c.fillStyle='#102a34';c.fillRect(0,0,256,128);
    c.fillStyle='#c5e9e0';c.font='bold 15px sans-serif';c.fillText(title,12,23);
    c.fillStyle='#5cbcae';c.font='11px monospace';c.fillText('SIMULATED TRAINING',12,42);
    c.fillStyle='#d8f1ed';c.font='bold 20px monospace';c.fillText('00:00',12,77);
    c.fillStyle='#78d7b5';c.fillRect(12,92,160,8);c.fillStyle='#405d61';c.fillRect(172,92,66,8);
    c.fillStyle='#a5c5c2';c.font='10px monospace';c.fillText('READY   /   START',12,117);
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
    return new THREE.MeshBasicMaterial({map});
  }
  const treadmillScreen=screenMaterial('T2 / CARDIO'),bikeScreen=screenMaterial('CYCLE / CARDIO');
  function rounded(x,y,z,w,h,d,mat,r=.04){const o=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/4,h/4,d/4)),mat);o.position.set(x,y,z);root.add(o);return o;}
  function cyl(x,y,z,r1,r2,h,mat,segments=18){const o=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),mat);o.position.set(x,y,z);root.add(o);return o;}
  function tube(a,b,r,mat){const v=new THREE.Vector3(...a),end=new THREE.Vector3(...b),dir=end.clone().sub(v);const o=cyl(0,0,0,r,r,dir.length(),mat,12);o.position.copy(v.add(end).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize());return o;}
  function torus(x,y,z,r,t,mat){const o=new THREE.Mesh(new THREE.TorusGeometry(r,t,10,32),mat);o.position.set(x,y,z);root.add(o);return o;}
  // Resistive machine, located at the existing ARED station.
  rounded(-3.7,.2,-3.4,3.0,.22,2.1,dark);
  for(const x of [-5.0,-2.4]){
    rounded(x,1.85,-3.55,.16,3.3,.18,frame);
    rounded(x,1.7,-3.42,.27,2.1,.28,pale);
    for(const y of [.85,1.25,1.65,2.05,2.45])rounded(x,y,-3.25,.14,.025,.025,dark,.006);
  }
  tube([-5,3.43,-3.55],[-2.4,3.43,-3.55],.07,frame);
  for(const x of [-4.45,-2.95]){
    cyl(x,1.25,-3.55,.2,.2,1.6,dark);cyl(x,2.07,-3.55,.16,.2,.15,frame);
    tube([x,2.15,-3.42],[x,2.85,-2.75],.024,dark);
  }
  tube([-4.6,2.86,-2.75],[-2.8,2.86,-2.75],.035,frame);
  for(const x of [-4.4,-3])rounded(x,2.86,-2.75,.34,.08,.09,rubber);
  rounded(-3.7,.38,-3.25,1.7,.08,1.3,rubber);
  for(const x of [-4.2,-3.2])rounded(x,.43,-3.0,.36,.04,.7,pale);
  // Treadmill with continuous belt, safety rails and mounted controls.
  rounded(4,.27,-2.4,1.9,.36,3.0,frame,.09);
  rounded(4,.48,-2.4,1.52,.055,2.62,rubber,.015);
  for(const x of [3.13,4.87]){
    rounded(x,.52,-2.4,.14,.08,2.85,pale,.02);
    tube([x,.48,-3.36],[x,1.75,-3.48],.055,frame);
    tube([x,1.75,-3.48],[x,1.25,-1.78],.045,frame);
    tube([x,1.25,-1.78],[x,.48,-1.48],.045,frame);
  }
  tube([3.13,1.73,-3.48],[4.87,1.73,-3.48],.05,frame);
  rounded(4,1.84,-3.38,1.02,.5,.14,dark,.035);
  rounded(4,1.85,-3.29,.86,.32,.025,treadmillScreen,.006);
  for(const x of [3.68,3.84,4,4.16,4.32])rounded(x,1.65,-3.28,.08,.035,.022,pale,.006);
  const stripes=[];
  for(let i=0;i<7;i++){const stripe=rounded(4,.515,-3.48+i*.36,1.44,.012,.025,pale,.003);stripes.push({mesh:stripe,base:stripe.position.z});}
  // Cycle ergometer: flywheel, drive, pedals, seat and handlebars.
  rounded(4.3,.14,3.8,1.3,.18,2.1,dark);
  tube([4.3,.28,3.1],[4.3,.92,4.15],.07,frame);
  tube([4.3,.28,4.52],[4.3,.92,4.15],.07,frame);
  tube([4.3,.92,4.15],[4.3,1.5,4.35],.06,frame);
  rounded(4.3,1.55,4.35,.56,.12,.42,rubber,.04);
  tube([4.3,.52,3.28],[4.3,1.48,3.02],.06,frame);
  tube([3.96,1.46,3.02],[4.64,1.46,3.02],.055,rubber);
  rounded(4.3,1.64,3.08,.58,.4,.09,dark);
  rounded(4.3,1.66,3.13,.46,.25,.02,bikeScreen,.005);
  const wheel=new THREE.Group();wheel.position.set(4.3,.57,3.35);root.add(wheel);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(.38,.055,12,36),rubber);rim.rotation.y=Math.PI/2;wheel.add(rim);
  const disc=new THREE.Mesh(new THREE.CylinderGeometry(.31,.31,.12,32),pale);disc.rotation.z=Math.PI/2;wheel.add(disc);
  const crank=new THREE.Group();crank.position.set(4.3,.55,3.9);root.add(crank);
  for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.BoxGeometry(.05,.52,.05),frame);arm.position.set(side*.18,side*.15,0);crank.add(arm);const pedal=new THREE.Mesh(new THREE.BoxGeometry(.24,.06,.12),rubber);pedal.position.set(side*.24,side*.4,0);crank.add(pedal);}
  // Display supports and subtle warning details.
  for(const x of [3.34,4.66])rounded(x,.53,-1.08,.12,.025,.12,accent,.004);
  return { stripes, wheel, crank };
}
