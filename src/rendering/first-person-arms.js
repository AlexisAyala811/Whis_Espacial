import * as THREE from 'three';
import {GLTFLoader} from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {createGloveCurl} from './glove-morph.js';

// Textured suit forearms and gloves share the same first-person motion rig.
// Procedural components remain available when a model cannot be loaded.
export function createFirstPersonArms(camera,fabric,reducedMotion){
 if(!fabric){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#e4e7e1';ctx.fillRect(0,0,128,128);ctx.strokeStyle='rgba(80,100,105,.12)';for(let i=0;i<128;i+=4){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,128);ctx.moveTo(0,i);ctx.lineTo(128,i);ctx.stroke();}fabric=new THREE.CanvasTexture(c);fabric.colorSpace=THREE.SRGBColorSpace;}
 const textileLoader=new THREE.TextureLoader(),textileMaps={};
 for(const [key,file] of [['normal','NormalGL'],['roughness','Roughness']]){
   const map=textileLoader.load(`./assets/interiors/pbr/Fabric034/${file}.jpg`,undefined,undefined,()=>{white[key==='normal'?'normalMap':'roughnessMap']=null;white.needsUpdate=true;});
   map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(2,2);textileMaps[key]=map;
 }
 const white=new THREE.MeshStandardMaterial({color:0xd6dfdc,map:fabric,normalMap:textileMaps.normal,normalScale:new THREE.Vector2(.38,.38),roughnessMap:textileMaps.roughness,roughness:.9});
 const seam=new THREE.MeshStandardMaterial({color:0x71878b,roughness:.72,metalness:.22});
 // Soft, layered pressure gloves: rounded palms, shaped digits and wrist seals.
 // Geometries and materials are shared between both hands.
 const shell=new THREE.MeshStandardMaterial({color:0xe2e2d8,map:fabric,normalMap:textileMaps.normal,normalScale:new THREE.Vector2(.28,.28),roughnessMap:textileMaps.roughness,roughness:.96});
 const reinforcement=new THREE.MeshStandardMaterial({color:0x9ea8a4,roughness:.9});
 const stitching=new THREE.MeshStandardMaterial({color:0xa9b6b3,roughness:1});
 const sphere=new THREE.SphereGeometry(1,24,16);
 const fingerSegment=new THREE.CapsuleGeometry(.022,.048,8,16);
 const fineSeam=new THREE.TorusGeometry(.022,.0018,5,20);
 const cuffGeo=new THREE.TorusGeometry(.073,.0028,8,32);
 const cuffBandGeo=new THREE.CylinderGeometry(.070,.074,.105,32,1,true);
 const cuffBand=new THREE.MeshStandardMaterial({color:0x8d9998,metalness:.42,roughness:.6});
 const foldGeo=new THREE.TorusGeometry(.019,.0015,5,16,Math.PI*.82);
 const panelSeamGeo=new THREE.CapsuleGeometry(.0018,.12,3,6);
 const sleeveGeo=new THREE.CylinderGeometry(.101,.14,.42,24,1);
 const stitchGeo=new THREE.BoxGeometry(.002,.002,.012);
 const arms=[];let time=0,gesture='',gestureTime=0;
 function part(parent,geometry,mat,x,y,z,sx=1,sy=1,sz=1){const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);parent.add(mesh);return mesh;}
 for(const side of [-1,1]){
  const rig=new THREE.Group();rig.name=side<0?'left-suit-arm':'right-suit-arm';rig.position.set(side*.55,-.5,-1.03);camera.add(rig);
  const armFallback=new THREE.Group();armFallback.name='procedural-forearm';rig.add(armFallback);
  const sleeve=part(armFallback,sleeveGeo,white,side*.10,-.28,.09);sleeve.rotation.z=side*.5;
  const wrist=part(armFallback,sphere,white,0,-.08,.08,.095,.085,.105);
  // A solid elliptical coupling bridges the glove and sleeve; fine seams
  // hug the coupling surface instead of appearing as suspended hoops.
  const coupling=part(armFallback,cuffBandGeo,cuffBand,0,0,.077,1,1,.82);
  coupling.name='wrist-coupling';coupling.rotation.x=Math.PI/2;
  for(const z of [.032,.12]){
   const joint=part(armFallback,cuffGeo,seam,0,0,z,1,.82,1);
   joint.name='wrist-seam';
  }
  const gloveFallback=new THREE.Group();gloveFallback.name='procedural-glove';rig.add(gloveFallback);
  // The tapered palm is an ellipsoid, with a padded fabric layer over the back.
  part(gloveFallback,sphere,shell,0,0,-.012,.102,.052,.14);
  const back=part(gloveFallback,sphere,white,0,.034,-.015,.088,.025,.112);back.rotation.x=-.06;
  part(gloveFallback,sphere,reinforcement,0,.052,-.081,.074,.009,.032);
  for(const sideEdge of [-1,1]){
   const seamLine=part(gloveFallback,panelSeamGeo,stitching,sideEdge*.075,.04,-.012);seamLine.rotation.x=Math.PI/2;
   for(let i=0;i<6;i++)part(gloveFallback,stitchGeo,seam,sideEdge*.069,.047,-.062+i*.022);
  }
  const fingers=[];
  for(let i=0;i<4;i++){
    const pivot=new THREE.Group();pivot.position.set((i-1.5)*.043,0,-.116);pivot.rotation.y=(i-1.5)*.045;pivot.rotation.x=.06+i*.012;pivot.scale.z=[.85,1,.96,.78][i];gloveFallback.add(pivot);
    const proximal=part(pivot,fingerSegment,shell,0,0,-.035);proximal.rotation.x=Math.PI/2;
    const pad=part(pivot,sphere,white,0,.014,-.041,.020,.012,.043);
    const seamRing=part(pivot,fineSeam,stitching,0,0,-.065);seamRing.scale.set(1,.82,1);
    for(const z of [-.024,-.036,-.048]){const fold=part(pivot,foldGeo,reinforcement,0,.016,z,.8,.36,1);fold.rotation.z=.28;}
    const distal=new THREE.Group();distal.position.z=-.07;distal.rotation.x=.08;pivot.add(distal);
    const tip=part(distal,fingerSegment,shell,0,-.001,-.035,.92,.85,.92);tip.rotation.x=Math.PI/2;
    part(distal,sphere,reinforcement,0,-.012,-.062,.018,.011,.025);
    const tipSeam=part(distal,fineSeam,stitching,0,0,-.044,.91,.75,1);
    fingers.push({pivot,distal});
  }
  // The thumb emerges from the side of the palm and bends toward the fingers.
  const thumb=new THREE.Group();thumb.position.set(side*.085,-.008,-.016);thumb.rotation.y=side*.58;thumb.rotation.z=side*.12;gloveFallback.add(thumb);
  const thumbBase=part(thumb,fingerSegment,shell,0,0,-.033,1.12,.9,1);thumbBase.rotation.x=Math.PI/2;
  const thumbTip=part(thumb,sphere,shell,0,0,-.074,.022,.019,.031);
  part(thumb,sphere,reinforcement,0,-.012,-.086,.018,.009,.02);
  arms.push({side,rig,fingers,thumb,gloveFallback,armFallback});
 }
 // Reuse a textured, lightweight forearm from the same suit as the glove.
 // Its fallback stays visible if loading fails.
 new GLTFLoader().load('./assets/models/ares-forearm/ares-forearm.glb',({scene:model})=>{
   for(const arm of arms){
     const forearm=model.clone(true);forearm.name='ares-textured-forearm';
     if(arm.side<0)forearm.scale.x=-1;
     forearm.traverse(mesh=>{if(mesh.isMesh){mesh.castShadow=false;mesh.receiveShadow=true;mesh.raycast=()=>{};}});
     arm.rig.add(forearm);arm.armFallback.visible=false;
   }
 },undefined,()=>{});
 // Load a locally optimized, textured hand from the project's CC0 suit.
 // Keep the articulated procedural glove if the model cannot be loaded.
 new GLTFLoader().load('./assets/models/ares-glove/ares-glove.glb',({scene:model})=>{
   // One shared morph target bends the fingertips for interaction gestures.
   // The optimized source mesh has no skeleton; the procedural rig is retained
   // as a fallback if the model cannot load.
   model.traverse(mesh=>{
     if(!mesh.isMesh)return;
     const geometry=mesh.geometry,position=geometry.attributes.position;
     const curled=createGloveCurl(position);
     geometry.morphAttributes.position=[new THREE.Float32BufferAttribute(curled,3)];
     mesh.updateMorphTargets();
   });
   for(const arm of arms){
     const glove=model.clone(true);glove.name='ares-textured-glove';
     if(arm.side<0)glove.scale.x=-1;
     arm.texturedMeshes=[];
     glove.traverse(mesh=>{if(mesh.isMesh){mesh.castShadow=false;mesh.receiveShadow=true;mesh.raycast=()=>{};mesh.updateMorphTargets();arm.texturedMeshes.push(mesh);}});
     arm.rig.add(glove);arm.gloveFallback.visible=false;
   }
 },undefined,()=>{});
 function trigger(name){if(['interact','inspect','grab','sit'].includes(name)){gesture=name;gestureTime=.65;}}
 function update(dt,{active=true,moving=0,sprint=false,float=false}={}){
  dt=Math.min(.05,Math.max(0,dt));if(active&&!reducedMotion.matches)time+=dt;
  if(gestureTime>0)gestureTime=Math.max(0,gestureTime-dt);else gesture='';
  const motion=reducedMotion.matches?0:Math.min(1,moving),wave=Math.sin(time*(sprint?10:7));
  const reach=gestureTime>0&&!reducedMotion.matches?Math.sin((1-gestureTime/.65)*Math.PI):0;
  for(const {side,rig,fingers,thumb,texturedMeshes=[]} of arms){
   const blend=1-Math.exp(-9*dt);
   const x=side*.55+side*(float?.025*Math.sin(time*1.5):.012*wave*motion);
   const breath=active && !reducedMotion.matches ? .006*Math.sin(time*1.8) : 0;
   const y=-.5+breath+(float?.018*Math.sin(time*1.4+side):.014*wave*motion)+reach*.055;
   rig.position.x=THREE.MathUtils.lerp(rig.position.x,x,blend);rig.position.y=THREE.MathUtils.lerp(rig.position.y,y,blend);
   rig.position.z=THREE.MathUtils.lerp(rig.position.z,-1.03-reach*.12,blend);
   rig.rotation.x=THREE.MathUtils.lerp(rig.rotation.x,-reach*.2,blend);rig.rotation.z=side*.12+side*wave*motion*.025;
   const curl=gesture==='grab'?reach*.5:gesture==='interact'?reach*.2:0;
   fingers.forEach(({pivot,distal},i)=>{const rest=.06+i*.012;pivot.rotation.x=THREE.MathUtils.lerp(pivot.rotation.x,rest+curl*(i===1?.4:1),blend);distal.rotation.x=THREE.MathUtils.lerp(distal.rotation.x,.08+curl*.8,blend)});
   thumb.rotation.x=curl*.3;
   for(const mesh of texturedMeshes)if(mesh.morphTargetInfluences)mesh.morphTargetInfluences[0]=Math.min(1,curl*2);
  }
 }
 return {update,trigger,arms};
}
