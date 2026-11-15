import * as THREE from 'three';
import { RoundedBoxGeometry } from '../../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { GLTFLoader } from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import { HDRLoader } from '../../node_modules/three/examples/jsm/loaders/HDRLoader.js';
import { makeStarfield } from './starfield.js';

const ASSETS = './assets/cabin/';

function discardTree(root) {
  const geometries=new Set(),materials=new Set(),maps=new Set(),images=new Set();
  root.traverse(object=>{
    if(object.geometry)geometries.add(object.geometry);
    const values=Array.isArray(object.material)?object.material:object.material?[object.material]:[];
    for(const value of values)materials.add(value);
  });
  for(const material of materials)for(const value of Object.values(material))if(value?.isTexture)maps.add(value);
  for(const geometry of geometries)geometry.dispose();
  for(const material of materials)material.dispose();
  for(const map of maps){if(map.image?.close)images.add(map.image);map.dispose();}
  for(const image of images)image.close();
}

// Procedural fallback remains visible if a reference image cannot be decoded.
function panoramicTexture(path, alive) {
  const map=makeStarfield();
  const image=new Image();
  image.onload=()=>{
    if(!alive())return;
    const canvas=document.createElement('canvas');canvas.width=2048;canvas.height=1152;
    const ctx=canvas.getContext('2d');ctx.fillStyle='#020815';ctx.fillRect(0,0,canvas.width,canvas.height);
    const earth=path.includes('earth-moon');
    const ratio=Math.max(canvas.width/image.naturalWidth,canvas.height/image.naturalHeight)*(earth?1.25:1);
    const width=image.naturalWidth*ratio,height=image.naturalHeight*ratio;
    ctx.drawImage(image,(canvas.width-width)/2+(earth?canvas.width*.1:0),(canvas.height-height)/2,width,height);
    map.image=canvas;map.needsUpdate=true;
  };
  image.src=path;
  return map;
}

function curvedWindow(map, side) {
  const geometry=new THREE.PlaneGeometry(7.8,2.5,28,1);
  const points=geometry.attributes.position;
  for(let i=0;i<points.count;i++){
    const x=points.getX(i);
    points.setZ(i,.13*(1-(x*x)/(3.9*3.9)));
  }
  geometry.computeVertexNormals();
  const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map}));
  mesh.position.set(side*7.68,3.15,1);mesh.rotation.y=-side*Math.PI/2;
  return mesh;
}

export function buildCabinDetails({scene,box,display,obstacles}) {
  let active=true,env=null;const isActive=()=>active;
  const left=panoramicTexture(ASSETS+'earth-moon-pexels-30596285.jpg',isActive);
  const right=panoramicTexture(ASSETS+'milky-way-pexels-12940327.jpg',isActive);
  const leftWindow=curvedWindow(left,-1),rightWindow=curvedWindow(right,1);
  leftWindow.name='cabin-left-panorama';rightWindow.name='cabin-right-panorama';
  scene.add(leftWindow,rightWindow);

  // Separate, subtle foreground glass catches light without blocking the learning ray.
  for(const side of [-1,1]){
    const glass=new THREE.Mesh(new THREE.PlaneGeometry(7.75,2.45),new THREE.MeshBasicMaterial({color:0xa4ddf2,transparent:true,opacity:.035,depthWrite:false}));
    glass.position.set(side*7.47,3.15,1);glass.rotation.y=-side*Math.PI/2;glass.raycast=()=>{};scene.add(glass);
    for(const z of [-3,1,5])box(side*7.4,3.15,z,.18,2.85,.12,0x405d6b);
    for(const y of [1.8,4.5])box(side*7.4,y,1,.18,.16,8.1,0x3a5764);
    box(side*7.32,1.78,1,.1,.04,8.1,0x72bed4,true);
    for(const z of [-2.4,0,2.4,4.8]){
      box(side*7.5,.85,z,.14,1.55,2.15,0x364f5d);
      box(side*7.4,.85,z,.04,1.3,1.95,0x536b74);
      box(side*7.34,.44,z,.03,.03,1.75,0x9dc6ce);
    }
  }

  const shell=new THREE.MeshStandardMaterial({color:0x465d68,metalness:.58,roughness:.36});
  const cushion=new THREE.MeshStandardMaterial({color:0x354553,metalness:.04,roughness:.84});
  const trim=new THREE.MeshStandardMaterial({color:0x8fa9ae,metalness:.72,roughness:.3});
  const mesh=(geometry,material,x,y,z)=>{const item=new THREE.Mesh(geometry,material);item.position.set(x,y,z);scene.add(item);return item;};
  // Reuse bevelled shapes across the two chairs. Collision boxes remain unchanged.
  const base=new RoundedBoxGeometry(1.35,.52,1.55,3,.1), seat=new RoundedBoxGeometry(1.2,.23,1.1,3,.12);
  const back=new RoundedBoxGeometry(1.18,1.5,.34,3,.14), arm=new RoundedBoxGeometry(.18,.2,.9,3,.07);
  for(const x of [2.5,5.7]){
    mesh(base,shell,x,.4,-2.1);mesh(seat,cushion,x,.78,-1.95);
    const backrest=mesh(back,cushion,x,1.5,-2.65);backrest.rotation.x=-.08;
    for(const side of [-1,1]){mesh(arm,trim,x+side*.68,1.02,-1.95);box(x+side*.68,.78,-2.15,.1,.5,.1,0x526a73);}
    box(x,.12,-2.1,1.2,.1,1.3,0xd5a86f,true);
  }
  // Recessed bulkhead details and distinct warm/cool practical lights.
  for(const z of [-7,-3,1,5]){
    for(const side of [-1,1]){
      box(side*6.5,3.65,z,.14,2.3,.17,0x7b939a);
      box(side*6.42,1.25,z,.12,.08,.7,0xd2a676,true);
    }
    box(0,5.35,z,4.4,.08,.35,0xe5f1ef,true);
  }
  for(const side of [-1,1]){
    box(side*1.4,2.3,-9.27,.19,4.5,.18,0x71909b);
    box(side*1.54,1.4,-9.12,.08,.5,.06,0xb1e7df,true);
  }
  for(const z of [-7,-5,-3,-1,1,3,5,7]){
    for(const x of [-5,-2.5,0,2.5,5])box(x,5.58,z,2.3,.06,1.8,0x3a4e59);
  }
  box(0,4.55,-9.2,3,.15,.2,0x718f97);
  for(const x of [-5.7,-4.5,-3.3,3,4.2,5.4])box(x,.12,-7.9,.65,.04,.1,0xe8bc85,true);
  const blue=new THREE.PointLight(0x89c8f2,8,11,2);blue.position.set(-4,3.7,0);scene.add(blue);
  const warm=new THREE.PointLight(0xffc99a,5,9,2);warm.position.set(4,3.5,-5);scene.add(warm);

  // Locally hosted, CC0 glTF instrument; the plinth remains usable if loading fails.
  box(-5.5,.55,2.4,1.55,1.1,1.3,0x465b63);
  box(-5.5,1.12,2.4,1.6,.05,1.35,0x7fb0b8);
  obstacles.push({x:-5.5,z:2.4,w:1.6,d:1.4});
  new GLTFLoader().load(ASSETS+'instrument/vintage_spacecraft_instrument_1k.gltf',gltf=>{
    if(!active){discardTree(gltf.scene);return;}
    const model=gltf.scene;
    const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
    const span=Math.max(size.x,size.y,size.z);
    if(!Number.isFinite(span)||span<=0){discardTree(model);return;}
    const scale=1.05/span;
    model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);model.scale.setScalar(scale);
    const holder=new THREE.Group();holder.name='cabin-instrument';holder.position.set(-5.5,1.16,2.4);holder.rotation.y=Math.PI*.17;holder.add(model);scene.add(holder);
  },undefined,()=>{});

  // HDR environment affects PBR reflections only; the exterior is not replaced.
  new HDRLoader().load(ASSETS+'studio_small_09_1k.hdr',texture=>{
    if(!active){texture.dispose();return;}
    texture.mapping=THREE.EquirectangularReflectionMapping;env=texture;scene.environment=texture;
    scene.environmentIntensity=.28;
  },undefined,()=>{});
  return () => {active=false;scene.environment=null;env?.dispose();};
}
