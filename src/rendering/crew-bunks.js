import * as THREE from 'three';
import { RoundedBoxGeometry } from '../../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Two fictional sleeping berths share materials and remain inside the original collision footprint.
export function addCrewBunks(scene,{x,z,width,depth,levels,textures}) {
  const group=new THREE.Group();group.name='crew-bunks';group.position.set(x,0,z);scene.add(group);
  const frame=new THREE.MeshStandardMaterial({color:0x859794,map:textures.metal,roughness:.65,metalness:.35});
  const dark=new THREE.MeshStandardMaterial({color:0x314d56,roughness:.83,metalness:.14});
  const mattress=new THREE.MeshStandardMaterial({color:0xc7d3d0,map:textures.fabric,roughness:.96});
  const cover=new THREE.MeshStandardMaterial({color:0x899fa8,map:textures.fabric,roughness:.96});
  const pillow=new THREE.MeshStandardMaterial({color:0xe7ebe4,map:textures.fabric,roughness:1});
  const strap=new THREE.MeshStandardMaterial({color:0x788e89,roughness:.88});
  const indicator=new THREE.MeshBasicMaterial({color:0xb2d8ca});
  const loader=new THREE.TextureLoader();
  // Textures are local and optional; the existing fabric stays visible if loading fails.
  function loadFabric(kind,file){
    let alive=true;
    const map=loader.load('./assets/models/crew-bunks/'+file,texture=>{
      if(!alive){texture.dispose();return;}
      if(kind==='map')cover.map=texture;else cover[kind]=texture;
      cover.needsUpdate=true;
    },undefined,()=>{if(!alive)return;if(kind==='map')cover.map=textures.fabric;else cover[kind]=null;cover.needsUpdate=true;map.dispose();});
    map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(2,1);
    if(kind==='map')map.colorSpace=THREE.SRGBColorSpace;
    map.addEventListener('dispose',()=>{alive=false;});
    // Retain pending textures in the scene so normal room cleanup also cancels them.
    if(kind==='map')cover.map=map;else cover[kind]=map;
  }
  loadFabric('map','linen-diff.jpg');loadFabric('normalMap','linen-normal.jpg');loadFabric('roughnessMap','linen-roughness.jpg');
  cover.normalScale.set(.32,.32);
  function block(x,y,z,w,h,d,mat,r=.025){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,w/4,h/4,d/4)),mat);mesh.position.set(x,y,z);group.add(mesh);return mesh;}
  function softCover(level){
    const w=width*.64,d=depth-.3,geometry=new THREE.PlaneGeometry(w,d,32,22),position=geometry.attributes.position;
    for(let i=0;i<position.count;i++){
      const px=position.getX(i),py=position.getY(i);
      const edge=Math.pow(Math.abs(py)/(d/2),5);
      const folds=.026*Math.sin(px*6+py*2.3)+.012*Math.sin(px*13-py*5);
      const loft=.035*Math.exp(-Math.pow(px/(w*.28),2))*Math.cos(py*2);
      position.setZ(i,folds+loft-.018*edge);
    }
    geometry.computeVertexNormals();
    const cloth=new THREE.Mesh(geometry,cover);cloth.name='soft-bunk-cover';cloth.rotation.x=-Math.PI/2;cloth.position.set(width*.12,level+.312,0);cloth.userData.graphicsDetail=1;group.add(cloth);
  }
  function softPillow(level){
    const geometry=new THREE.SphereGeometry(1,32,20),p=geometry.attributes.position;
    // A softly squared cushion avoids the box-shaped pillow of the old model.
    for(let i=0;i<p.count;i++){
      const px=p.getX(i),pz=p.getZ(i);
      p.setX(i,Math.sign(px)*Math.pow(Math.abs(px),.68));
      p.setZ(i,Math.sign(pz)*Math.pow(Math.abs(pz),.68));
    }
    geometry.computeVertexNormals();
    const cushion=new THREE.Mesh(geometry,pillow);cushion.name='soft-bunk-pillow';
    cushion.position.set(-width*.33,level+.32,0);cushion.scale.set(width*.11,.105,depth*.31);cushion.rotation.y=.045;cushion.userData.graphicsDetail=1;group.add(cushion);
  }
  for(const level of levels){
    block(0,level,0,width,.2,depth,frame,.06);
    block(0,level+.16,0,width-.22,.18,depth-.2,mattress,.08);
    block(width*.12,level+.265,0,width*.64,.06,depth-.25,cover,.03);
    block(-width*.33,level+.3,0,width*.2,.12,depth*.6,pillow,.055);
    softCover(level);softPillow(level);
    // Narrow straps and a folded edge ground the soft surfaces in the berth.
    for(const dz of [-depth*.39,depth*.39])block(width*.1,level+.304,dz,width*.57,.014,.025,strap,.004);
    block(-width*.2,level+.315,0,.055,.025,depth*.72,pillow,.01);
    for(const side of [-1,1])block(side*(width/2-.1),level+.1,0,.08,.26,depth-.15,dark);
    block(-width*.42,level+.56,-depth*.47,.16,.06,.04,indicator,.008);
  }
  const top=Math.max(...levels)+.43;
  for(const side of [-1,1])for(const dz of [-depth*.46,depth*.46])block(side*(width/2-.05),top/2,dz,.07,top,.07,frame);
  const lx=width/2-.1;for(const dz of [-.28,.28])block(lx,top/2,dz,.055,top,.055,frame);
  for(let y=.3;y<top-.1;y+=.35)block(lx,y,0,.06,.045,.58,frame,.008);
  group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.raycast=()=>{};}});
  return group;
}
