import * as THREE from 'three';
import {RoundedBoxGeometry} from '../../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Provisional articulated suit arms. Each finger has independent pivot joints;
// the game can replace this local rig with a licensed skinned GLB later.
export function createFirstPersonArms(camera,fabric,reducedMotion){
 if(!fabric){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e4e7e1';ctx.fillRect(0,0,128,128);ctx.strokeStyle='rgba(80,100,105,.12)';for(let i=0;i<128;i+=4){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}fabric=new THREE.CanvasTexture(c);fabric.colorSpace=THREE.SRGBColorSpace;}
 const textileLoader=new THREE.TextureLoader(),textileMaps={};
 for(const [key,file] of [['normal','NormalGL'],['roughness','Roughness']]){
   const map=textileLoader.load(`./assets/interiors/pbr/Fabric034/${file}.jpg`,undefined,undefined,()=>{white[key==='normal'?'normalMap':'roughnessMap']=null;white.needsUpdate=true;});
   map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(2,2);textileMaps[key]=map;
 }
 const white=new THREE.MeshStandardMaterial({color:0xd6dfdc,map:fabric,normalMap:textileMaps.normal,normalScale:new THREE.Vector2(.38,.38),roughnessMap:textileMaps.roughness,roughness:.9});
 const seam=new THREE.MeshStandardMaterial({color:0x71878b,roughness:.72,metalness:.22});
 const rubber=new THREE.MeshStandardMaterial({color:0x394f55,roughness:.85});
 const palmGeo=new RoundedBoxGeometry(.19,.105,.22,3,.038),segmentGeo=new THREE.CapsuleGeometry(.022,.045,4,10);
 const cuffGeo=new THREE.TorusGeometry(.094,.012,10,32),knuckleGeo=new THREE.SphereGeometry(.024,12,10);
 const padGeo=new RoundedBoxGeometry(.155,.028,.065,3,.014),panelGeo=new RoundedBoxGeometry(.12,.018,.085,3,.008),stitchGeo=new THREE.BoxGeometry(.16,.004,.004),rivetGeo=new THREE.SphereGeometry(.006,8,6);
 const sleeveGeo=new THREE.CylinderGeometry(.105,.145,.42,16,1),jointGeo=new THREE.SphereGeometry(.095,16,12);
 const arms=[];let time=0,gesture='',gestureTime=0;
 for(const side of [-1,1]){
  const rig=new THREE.Group();rig.name=side<0?'left-suit-arm':'right-suit-arm';rig.position.set(side*.55,-.5,-1.03);camera.add(rig);
  const sleeve=new THREE.Mesh(sleeveGeo,white);sleeve.rotation.z=side*.5;sleeve.position.set(side*.1,-.28,.09);rig.add(sleeve);
  const wrist=new THREE.Mesh(jointGeo,seam);wrist.position.set(0,-.1,.08);wrist.scale.set(1,.8,1);rig.add(wrist);
  const cuff=new THREE.Mesh(cuffGeo,rubber);cuff.position.set(0,0,.11);rig.add(cuff);
  const palm=new THREE.Mesh(palmGeo,white);rig.add(palm);
  const pad=new THREE.Mesh(padGeo,seam);pad.position.set(0,.055,-.075);rig.add(pad);const panel=new THREE.Mesh(panelGeo,white);panel.position.set(0,.056,.035);rig.add(panel);
  for(const z of [-.04,.025,.075]){const stitch=new THREE.Mesh(stitchGeo,seam);stitch.position.set(0,.058,z);rig.add(stitch);}
  for(const x of [-.065,.065]){const rivet=new THREE.Mesh(rivetGeo,rubber);rivet.position.set(x,.073,-.075);rig.add(rivet);}
  const innerCuff=new THREE.Mesh(cuffGeo,seam);innerCuff.scale.set(.83,.83,1);innerCuff.position.set(0,0,.13);rig.add(innerCuff);
  for(const offset of [-.025,.025]){const band=new THREE.Mesh(cuffGeo,seam);band.scale.set(.9,.9,.5);band.position.set(0,offset,.14);rig.add(band);}
  for(const x of [-.055,-.02,.02,.055]){const stitch=new THREE.Mesh(new THREE.BoxGeometry(.003,.005,.045),seam);stitch.position.set(x,.07,.03);rig.add(stitch);}
  const fingers=[];
  for(let i=0;i<4;i++){
    const pivot=new THREE.Group();pivot.position.set((i-1.5)*.044,0,-.105);pivot.rotation.y=(i-1.5)*.035;pivot.scale.z=[.87,1,.96,.78][i];rig.add(pivot);
    const proximal=new THREE.Mesh(segmentGeo,white);proximal.rotation.x=Math.PI/2;proximal.position.z=-.042;pivot.add(proximal);
    const joint=new THREE.Mesh(knuckleGeo,seam);joint.scale.set(.8,.35,.5);joint.position.set(0,.015,-.072);pivot.add(joint);
    const distal=new THREE.Group();distal.position.z=-.075;pivot.add(distal);
    const tip=new THREE.Mesh(segmentGeo,white);tip.rotation.x=Math.PI/2;tip.position.z=-.035;distal.add(tip);
    const grip=new THREE.Mesh(knuckleGeo,rubber);grip.position.set(0,-.018,-.06);grip.scale.set(.7,.35,.8);distal.add(grip);
    fingers.push({pivot,distal});
  }
  const thumb=new THREE.Group();thumb.position.set(side*.105,-.005,-.015);thumb.rotation.y=side*.65;rig.add(thumb);const thumbMesh=new THREE.Mesh(segmentGeo,white);thumbMesh.rotation.x=Math.PI/2;thumbMesh.position.z=-.045;thumb.add(thumbMesh);
  arms.push({side,rig,fingers,thumb});
 }
 function trigger(name){if(['interact','inspect','grab','sit'].includes(name)){gesture=name;gestureTime=.65;}}
 function update(dt,{active=true,moving=0,sprint=false,float=false}={}){
  dt=Math.min(.05,Math.max(0,dt));if(active&&!reducedMotion.matches)time+=dt;
  if(gestureTime>0)gestureTime=Math.max(0,gestureTime-dt);else gesture='';
  const motion=reducedMotion.matches?0:Math.min(1,moving),wave=Math.sin(time*(sprint?10:7));
  const reach=gestureTime>0&&!reducedMotion.matches?Math.sin((1-gestureTime/.65)*Math.PI):0;
  for(const {side,rig,fingers,thumb} of arms){
   const blend=1-Math.exp(-9*dt);
   const x=side*.55+side*(float?.025*Math.sin(time*1.5):.012*wave*motion);
   const breath=active && !reducedMotion.matches ? .006*Math.sin(time*1.8) : 0;
   const y=-.5+breath+(float?.018*Math.sin(time*1.4+side):.014*wave*motion)+reach*.055;
   rig.position.x=THREE.MathUtils.lerp(rig.position.x,x,blend);rig.position.y=THREE.MathUtils.lerp(rig.position.y,y,blend);
   rig.position.z=THREE.MathUtils.lerp(rig.position.z,-1.03-reach*.12,blend);
   rig.rotation.x=THREE.MathUtils.lerp(rig.rotation.x,-reach*.2,blend);rig.rotation.z=side*.12+side*wave*motion*.025;
   const curl=gesture==='grab'?reach*.5:gesture==='interact'?reach*.2:0;
   fingers.forEach(({pivot,distal},i)=>{pivot.rotation.x=THREE.MathUtils.lerp(pivot.rotation.x,curl*(i===1?.4:1),blend);distal.rotation.x=THREE.MathUtils.lerp(distal.rotation.x,curl*.8,blend)});
   thumb.rotation.x=curl*.3;
  }
 }
 return {update,trigger,arms};
}
