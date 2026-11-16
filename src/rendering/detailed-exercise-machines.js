import * as THREE from 'three';
import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { QUALITY_KEY, QUALITY_PRESETS, qualityName } from '../core/graphics-quality.js';

function discard(object) {
  const geometries=new Set(),materials=new Set(),textures=new Set();
  object.traverse(node=>{if(node.geometry)geometries.add(node.geometry);for(const m of Array.isArray(node.material)?node.material:node.material?[node.material]:[])materials.add(m);});
  for(const m of materials){for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();}
  for(const g of geometries)g.dispose();for(const t of textures){t.image?.close?.();t.dispose();}
}

function savedDetail(){let value;try{value=localStorage.getItem(QUALITY_KEY);}catch{}return QUALITY_PRESETS[qualityName(value)].detail;}

// The stock treadmill has colorful plastic. Desaturate its original base-color map
// for the training facility while retaining the normal and roughness maps.
function neutralizeTreadmill(model) {
  model.traverse(node=>{
    if(!node.isMesh||!node.material?.map?.image)return;
    const old=node.material.map,image=old.image;
    const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
    const ctx=canvas.getContext('2d');if(!ctx)return;
    ctx.filter='saturate(28%)';ctx.drawImage(image,0,0);ctx.filter='none';
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.flipY=old.flipY;
    map.wrapS=old.wrapS;map.wrapT=old.wrapT;map.repeat.copy(old.repeat);map.offset.copy(old.offset);
    node.material.map=map;node.material.needsUpdate=true;old.dispose();image.close?.();
  });
}

// Add a local pivot without moving the part in the model, so flywheel and pedals turn.
function makePivot(model, match, reference) {
  const pieces=[];let ref=null;
  model.traverse(node=>{if(node.isMesh&&match(node.name))pieces.push(node);if(node.isMesh&&reference(node.name))ref=node;});
  if(!ref||!pieces.length||!ref.parent||pieces.some(node=>node.parent!==ref.parent))return null;
  model.updateMatrixWorld(true);
  const parent=ref.parent,center=new THREE.Box3().setFromObject(ref).getCenter(new THREE.Vector3());
  const pivot=new THREE.Group();pivot.position.copy(parent.worldToLocal(center));parent.add(pivot);parent.updateMatrixWorld(true);
  for(const piece of pieces)pivot.attach(piece);
  return pivot;
}

export function loadDetailedExerciseMachines(scene, fallback, animatedParts) {
  let active=true;
  const loader=new GLTFLoader();
  const items=[
    {file:'treadmill.glb',x:4,z:-2.4,height:1.55,rotation:-Math.PI/2,fallback:fallback.treadmill,type:'treadmill'},
    {file:'bike.glb',x:4.3,z:3.8,height:1.55,rotation:0,fallback:fallback.cycle,type:'bike'}
  ];
  for(const item of items)loader.load('./assets/models/exercise/'+item.file,({scene:model})=>{
    if(!active){discard(model);return;}
    model.updateMatrixWorld(true);
    const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    if(!Number.isFinite(size.y)||size.y<=0){discard(model);return;}
    if(item.type==='treadmill')neutralizeTreadmill(model);
    if(item.type==='bike'){
      const wheel=makePivot(model,name=>name==='Flywheel_(polished_steel)',name=>name==='Flywheel_(polished_steel)');
      const crank=makePivot(model,name=>/^(Crank_arm|Pedal_body|Pedal_spindle|Pedal_toe_cage)/.test(name),name=>name==='Crank_spindle');
      if(wheel){wheel.name='detailed-bike-wheel-pivot';animatedParts.push({type:'detailed-bike-wheel',mesh:wheel});}
      if(crank){crank.name='detailed-bike-crank-pivot';animatedParts.push({type:'detailed-bike-crank',mesh:crank});}
    }
    const scale=item.height/size.y;model.scale.setScalar(scale);
    model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
    const holder=new THREE.Group();holder.position.set(item.x,.02,item.z);holder.rotation.y=item.rotation;
    holder.name='detailed-'+item.type;holder.userData.graphicsDetail=1;
    holder.visible=savedDetail()>=1;
    model.traverse(node=>{if(node.isMesh){node.castShadow=true;node.receiveShadow=true;node.raycast=()=>{};}});
    holder.add(model);scene.add(holder);
    if(item.type==='treadmill'){
      // Subtle moving belt marks match the deck height; no motion in reduced-motion mode.
      holder.updateMatrixWorld(true);
      const marks=new THREE.MeshBasicMaterial({color:0xb4c1bd,transparent:true,opacity:.16,depthWrite:false});
      const geometry=new THREE.PlaneGeometry(.018,.68);
      for(let i=0;i<5;i++){
        const mark=new THREE.Mesh(geometry,marks);mark.name='detailed-treadmill-belt-mark';
        mark.rotation.x=-Math.PI/2;
        mark.position.copy(holder.worldToLocal(new THREE.Vector3(item.x,.248,item.z-.35+i*.25)));
        mark.raycast=()=>{};holder.add(mark);
        animatedParts.push({type:'detailed-belt',mesh:mark,base:mark.position.x});
      }
    }
    item.fallback.userData.graphicsMaxDetail=0;item.fallback.visible=savedDetail()===0;
  },undefined,()=>{ /* The original machine remains visible if the model fails. */ });
  return ()=>{active=false;};
}
