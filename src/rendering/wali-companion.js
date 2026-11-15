import * as THREE from 'three';
import { waliTarget } from '../core/wali-follow.js';

// One small, fully three-dimensional companion. It has no collider or raycast,
// so it cannot block a door, a station, or an object the player is inspecting.
export function createWaliCompanion(scene, camera, reducedMotion) {
  const group = new THREE.Group();
  group.name = 'wali-companion';
  const shell = new THREE.MeshStandardMaterial({ color: 0xe8f1ef, roughness: .3, metalness: .12 });
  const trim = new THREE.MeshStandardMaterial({ color: 0x778e96, roughness: .38, metalness: .55 });
  const face = new THREE.MeshStandardMaterial({ color: 0x07131c, roughness: .22, metalness: .3 });
  const eye = new THREE.MeshBasicMaterial({ color: 0x36ddff });
  const sphere = new THREE.SphereGeometry(1, 24, 16);
  const add = (material, x, y, z, sx, sy, sz, parent = group) => {
    const mesh = new THREE.Mesh(sphere, material);
    mesh.position.set(x,y,z); mesh.scale.set(sx,sy,sz);
    mesh.raycast = () => {}; parent.add(mesh); return mesh;
  };
  add(shell, 0,.31,0, .19,.27,.15);
  add(trim, 0,.53,0, .17,.055,.14);
  add(shell, 0,.72,0, .27,.25,.22);
  add(face, 0,.72,.178, .205,.127,.075);
  const arms=[];
  for (const side of [-1,1]) {
    add(eye, side*.09,.73,.245, .047,.021,.012);
    const arm=add(shell,side*.23,.36,0,.075,.19,.075);
    arm.rotation.z=side*.25; arms.push(arm);
  }
  add(eye,0,.32,.148,.025,.025,.009);
  scene.add(group);
  let elapsed=0, needsSnap=true;
  const target = new THREE.Vector3();
  const forward = new THREE.Vector3();
  function update(dt, active, blocked, interacting = false) {
    const point=waliTarget(camera.position,camera.rotation.y,blocked,reducedMotion.matches ? 0 : elapsed);
    camera.getWorldDirection(forward);
    if(point){
      const bob = reducedMotion.matches ? 0 : Math.sin(elapsed*2.1)*.035;
      target.set(point.x,Math.max(.08,camera.position.y-.96+forward.y*.75+bob),point.z);
      if(needsSnap || group.position.distanceToSquared(target)>9) group.position.copy(target);
      else group.position.lerp(target,1-Math.exp(-10*Math.max(0,dt)));
      needsSnap=false;
    }
    group.lookAt(camera.position.x,group.position.y+.5,camera.position.z);
    arms.forEach((arm,i)=>{arm.rotation.z=(i ? 1 : -1)*(.25+(reducedMotion.matches ? 0 : Math.sin(elapsed*2+i)*.13));});
    if(active && !interacting && !reducedMotion.matches) elapsed+=Math.min(.05,Math.max(0,dt));
  }
  function anchor(){
    if(!group.visible) return null;
    camera.updateMatrixWorld(); group.updateWorldMatrix(true,false);
    const point=group.localToWorld(new THREE.Vector3(0,1.04,0)).project(camera);
    if(point.z < -1 || point.z > 1) return null;
    return {x:(point.x+1)*innerWidth/2,y:(1-point.y)*innerHeight/2};
  }
  return {group, update, anchor, attach(nextScene){nextScene.add(group);needsSnap=true;}, snap(){needsSnap=true;}};
}
