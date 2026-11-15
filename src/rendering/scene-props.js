import * as THREE from 'three';
import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { RoundedBoxGeometry } from '../../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {QUALITY_KEY,QUALITY_PRESETS,qualityName} from '../core/graphics-quality.js';
export function loadRoomProp(scene,name,placements,fallback=[]){
 let active=true;
 new GLTFLoader().load(placements[0]?.url || `./assets/models/${name}/${name}_1k.gltf`,({scene:model})=>{
  if(!active){const geo=new Set(),mat=new Set(),tex=new Set();model.traverse(o=>{if(o.geometry)geo.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])if(m)mat.add(m)});mat.forEach(m=>{for(const t of Object.values(m))if(t?.isTexture)tex.add(t);m.dispose()});geo.forEach(g=>g.dispose());tex.forEach(t=>{t.image?.close?.();t.dispose()});return;}
  model.updateMatrixWorld(true);const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());if(!size.y)return;
  placements.forEach((p,i)=>{const root=new THREE.Group(),object=model.clone(true),scale=p.width?p.width/Math.max(size.x,size.z):p.height/size.y;object.scale.multiplyScalar(scale);object.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);root.position.set(p.x,p.y,p.z);root.rotation.y=p.rotation||0;root.name=`detail-${name}`;
   if(p.detail){root.userData.graphicsDetail=p.detail;let saved;try{saved=localStorage.getItem(QUALITY_KEY)}catch{}root.visible=QUALITY_PRESETS[qualityName(saved)].detail>=p.detail;}
   object.traverse(o=>{if(o.isMesh){o.castShadow=p.shadows!==false;o.receiveShadow=true;o.raycast=()=>{};}});root.add(object);scene.add(root)});fallback.forEach(o=>{if(placements[0]?.detail){o.userData.graphicsMaxDetail=placements[0].detail-1;let saved;try{saved=localStorage.getItem(QUALITY_KEY)}catch{}o.visible=QUALITY_PRESETS[qualityName(saved)].detail<placements[0].detail;}else o.visible=false;});
 },undefined,()=>{});return ()=>{active=false};
}
export function addOfficeChair(scene,x,z){
 const root=new THREE.Group();root.position.set(x,0,z);root.name='office-chair';scene.add(root);
 const cloth=new THREE.MeshStandardMaterial({color:0x34454b,roughness:.95}),frame=new THREE.MeshStandardMaterial({color:0x26383e,roughness:.5,metalness:.5});
 const add=(g,m,x,y,z)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;root.add(o);return o;};
 add(new RoundedBoxGeometry(.76,.15,.68,3,.07),cloth,0,.62,0);const back=add(new RoundedBoxGeometry(.7,.78,.15,3,.07),cloth,0,1.07,.29);back.rotation.x=-.12;
 add(new THREE.CylinderGeometry(.055,.055,.51,12),frame,0,.34,0);add(new THREE.CylinderGeometry(.12,.12,.06,12),frame,0,.1,0);
 const wheel=new THREE.SphereGeometry(.065,10,8),leg=new THREE.BoxGeometry(.07,.045,.38);for(let i=0;i<5;i++){const a=i*Math.PI*2/5,l=add(leg,frame,Math.sin(a)*.19,.1,Math.cos(a)*.19);l.rotation.y=a;add(wheel,frame,Math.sin(a)*.37,.075,Math.cos(a)*.37);}
 for(const side of [-1,1]){add(new THREE.BoxGeometry(.055,.35,.055),frame,side*.4,.79,.08);add(new RoundedBoxGeometry(.12,.065,.42,2,.025),cloth,side*.4,.98,-.02);}return root;
}
