import * as THREE from 'three';
import { RoundedBoxGeometry } from '../../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';

// Reusable suit components keep the two training mannequins lightweight.
export function makePreparationSuits(scene, textures, obstacles) {
  const fabric=new THREE.MeshStandardMaterial({color:0xe3e7e1,map:textures.fabric,roughness:.84});
  const seam=new THREE.MeshStandardMaterial({color:0x778c90,roughness:.75,metalness:.16});
  const metal=new THREE.MeshStandardMaterial({color:0x83999c,roughness:.38,metalness:.72});
  const visor=new THREE.MeshStandardMaterial({color:0x263d49,roughness:.2,metalness:.72});
  const dark=new THREE.MeshStandardMaterial({color:0x34494d,roughness:.88});
  const amber=new THREE.MeshStandardMaterial({color:0xe9ad5a,roughness:.55});
  const body=new RoundedBoxGeometry(.7,.92,.43,4,.12);
  const pack=new RoundedBoxGeometry(.62,.8,.3,3,.08);
  const panel=new RoundedBoxGeometry(.43,.32,.09,3,.04);
  const limb=new THREE.CapsuleGeometry(.115,.42,4,12);
  const leg=new THREE.CapsuleGeometry(.135,.4,4,12);
  const joint=new THREE.SphereGeometry(.145,12,10);
  const glove=new THREE.SphereGeometry(.13,12,10);
  const head=new THREE.SphereGeometry(.31,24,16);
  const face=new THREE.SphereGeometry(.265,24,16);
  const cuff=new THREE.TorusGeometry(.13,.018,8,16);
  const boot=new RoundedBoxGeometry(.27,.2,.43,3,.07);
  const trim=new RoundedBoxGeometry(.27,.06,.42,2,.02);
  const base=new RoundedBoxGeometry(1.3,.12,.8,3,.06);
  const indicator=new THREE.SphereGeometry(.025,8,6);
  function add(group,geometry,material,x,y,z,sx=1,sy=1,sz=1){
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);group.add(mesh);return mesh;
  }
  return (x,z)=>{
    const suit=new THREE.Group();suit.name='preparation-suit';suit.position.set(x,0,z);scene.add(suit);
    add(suit,base,dark,0,.18,0);add(suit,base,metal,0,.25,0,.92,.3,.9);
    add(suit,pack,seam,0,1.52,-.32);add(suit,body,fabric,0,1.48,0);
    add(suit,panel,seam,0,1.58,.24);add(suit,panel,dark,0,1.59,.292,.82,.68,.3);
    for(const side of [-1,1]){
      const arm=add(suit,limb,fabric,side*.47,1.4,0);arm.rotation.z=side*.12;
      add(suit,joint,fabric,side*.4,1.85,0);
      add(suit,glove,seam,side*.51,1.03,.02,.8,.9,1);
      const ring=add(suit,cuff,metal,side*.5,1.13,0,.88,.88,.88);ring.rotation.x=Math.PI/2;
      add(suit,leg,fabric,side*.2,.69,0);
      add(suit,boot,seam,side*.2,.27,.07);add(suit,trim,dark,side*.2,.18,.07);
      add(suit,indicator,side<0?amber:metal,side*.13,1.61,.33);
    }
    const neck=add(suit,cuff,metal,0,2.01,0,1.65,1.65,1.65);neck.rotation.x=Math.PI/2;
    add(suit,head,fabric,0,2.31,0,1,1.07,1);
    add(suit,face,visor,0,2.32,.17,.86,.72,.62);
    // Slim off-axis highlight makes the visor read as curved glass.
    add(suit,indicator,metal,-.13,2.39,.31,.65,1.8,.35);
    obstacles.push({x,z,w:1.4,d:1});
  };
}
