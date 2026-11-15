import * as THREE from 'three';
import {GLTFLoader} from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {QUALITY_KEY,QUALITY_PRESETS,qualityName} from '../core/graphics-quality.js';

function discard(root){
 const geometries=new Set(),materials=new Set(),maps=new Set();
 root.traverse(object=>{if(object.geometry)geometries.add(object.geometry);for(const m of (Array.isArray(object.material)?object.material:object.material?[object.material]:[]))materials.add(m)});
 for(const m of materials){for(const value of Object.values(m))if(value?.isTexture)maps.add(value);m.dispose();}
 for(const map of maps)map.dispose();for(const geometry of geometries)geometry.dispose();
}
// A locally hosted CC0 asset; procedural equipment remains present if loading fails.
export function addElectricalEquipment(scene,index){
 if(index!==2&&index!==5)return ()=>{};
 let active=true;
 new GLTFLoader().load('./assets/models/utility-box-02/utility_box_02_1k.gltf',gltf=>{
  if(!active){discard(gltf.scene);return;}
  const model=gltf.scene,bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const span=Math.max(size.x,size.y,size.z);if(!Number.isFinite(span)||span<=0){discard(model);return;}
  const scale=1.4/span;model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
  const holder=new THREE.Group();holder.name='electrical-equipment';holder.userData.graphicsDetail=1;
  holder.position.set(index===2?8.9:-8.9,.03,index===2?-7:2.5);holder.rotation.y=index===2?-Math.PI/2:Math.PI/2;
  let value;try{value=localStorage.getItem(QUALITY_KEY)}catch{}holder.visible=QUALITY_PRESETS[qualityName(value)].detail>=1;
  model.traverse(object=>{if(object.isMesh){object.castShadow=true;object.receiveShadow=true;}});holder.add(model);scene.add(holder);
 },undefined,()=>{});
 return ()=>{active=false;};
}
