import * as THREE from 'three';
import { RoundedBoxGeometry } from '../../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Fictional crew bunks, sized to fit the existing sleeping areas and collisions.
export function addCrewBunks(scene,{x,z,width,depth,levels,textures}) {
  const group=new THREE.Group();group.name='crew-bunks';group.position.set(x,0,z);scene.add(group);
  const frame=new THREE.MeshStandardMaterial({color:0x859794,map:textures.metal,roughness:.65,metalness:.35});
  const dark=new THREE.MeshStandardMaterial({color:0x314d56,roughness:.83,metalness:.14});
  const mattress=new THREE.MeshStandardMaterial({color:0xb9c9c8,map:textures.fabric,roughness:.96});
  const cover=new THREE.MeshStandardMaterial({color:0x435f6b,map:textures.fabric,roughness:.98});
  const pillow=new THREE.MeshStandardMaterial({color:0xe2e6db,map:textures.fabric,roughness:1});
  const strap=new THREE.MeshStandardMaterial({color:0x7c938e,roughness:.88});
  const indicator=new THREE.MeshBasicMaterial({color:0x91cab8});
  function block(x,y,z,w,h,d,mat,r=.025){const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/4,h/4,d/4)),mat);mesh.position.set(x,y,z);group.add(mesh);return mesh;}
  for(const level of levels){
    block(0,level,0,width,.2,depth,frame,.05);
    block(0,level+.16,0,width-.22,.18,depth-.2,mattress,.075);
    block(width*.12,level+.265,0,width*.64,.06,depth-.25,cover,.025);
    block(-width*.33,level+.3,0,width*.22,.14,depth*.65,pillow,.06);
    for(const dz of [-depth*.39,depth*.39])block(width*.1,level+.30,dz,width*.57,.014,.025,strap,.004);
    for(const dx of [-width*.15,width*.14,width*.4])block(dx,level+.302,0,.018,.012,depth*.72,strap,.003);
    for(const side of [-1,1])block(side*(width/2-.1),level+.1,0,.08,.26,depth-.15,dark);
    block(-width*.42,level+.56,-depth*.47,.16,.06,.04,indicator,.008);
  }
  const top=Math.max(...levels)+.43;
  for(const side of [-1,1])for(const dz of [-depth*.46,depth*.46])block(side*(width/2-.05),top/2,dz,.07,top,.07,frame);
  // End ladder remains within the existing furniture footprint.
  const lx=width/2-.1;for(const dz of [-.28,.28])block(lx,top/2,dz,.055,top,.055,frame);
  for(let y=.3;y<top-.1;y+=.35)block(lx,y,0,.06,.045,.58,frame,.008);
  group.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;o.raycast=()=>{};}});
  return group;
}
