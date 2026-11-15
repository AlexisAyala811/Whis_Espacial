import * as THREE from 'three';
import { waliTarget, waliLooksAtPlayer } from '../core/wali-follow.js';

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
  let elapsed=0, needsSnap=true, goalAge=Infinity, goal=null;
  const forward = new THREE.Vector3();
  const target = new THREE.Vector3();
  function update(dt, active, blocked, interacting = false) {
    const step=Math.min(.05,Math.max(0,dt));
    camera.getWorldDirection(forward);
    const fx=-Math.sin(camera.rotation.y), fz=-Math.cos(camera.rotation.y);
    const goalAhead=goal ? (goal.x-camera.position.x)*fx+(goal.z-camera.position.z)*fz : -1;
    const goalDistance=goal ? Math.hypot(goal.x-camera.position.x,goal.z-camera.position.z) : Infinity;
    const needsGoal=!goal || goalAge>=3.5 || goalAhead<.45 || goalDistance>3.7 || blocked(goal.x,goal.z);
    if(needsGoal){
      const point=waliTarget(camera.position,camera.rotation.y,blocked,reducedMotion.matches ? 0 : elapsed);
      if(point){goal=point;goalAge=0;}
    }
    if(goal){
      const bob = reducedMotion.matches ? 0 : Math.sin(elapsed*2.1)*.035;
      target.set(goal.x,Math.max(.08,camera.position.y-.96+forward.y*.75+bob),goal.z);
      if(needsSnap){group.position.copy(target);needsSnap=false;}
      const dx=target.x-group.position.x,dz=target.z-group.position.z,dist=Math.hypot(dx,dz);
      const playerDistance=Math.hypot(group.position.x-camera.position.x,group.position.z-camera.position.z);
      const speed=playerDistance>3 ? 4.8 : .85;
      const move=active && !interacting ? Math.min(dist,speed*step) : 0;
      if(move>0 && dist>0){
        const nx=group.position.x+dx/dist*move,nz=group.position.z+dz/dist*move;
        if(!blocked(nx,nz)){group.position.x=nx;group.position.z=nz;}
        else {goal=null;goalAge=Infinity;}
      }
      group.position.y=THREE.MathUtils.lerp(group.position.y,target.y,1-Math.exp(-5*step));
      const looks=waliLooksAtPlayer(elapsed,interacting);
      let desired=group.rotation.y;
      if(looks) desired=Math.atan2(camera.position.x-group.position.x,camera.position.z-group.position.z);
      else if(dist>.04) desired=Math.atan2(dx,dz);
      const turn=Math.atan2(Math.sin(desired-group.rotation.y),Math.cos(desired-group.rotation.y));
      group.rotation.y+=turn*(1-Math.exp(-3*step));
    }
    arms.forEach((arm,i)=>{arm.rotation.z=(i ? 1 : -1)*(.25+(reducedMotion.matches ? 0 : Math.sin(elapsed*2+i)*.13));});
    if(active && !interacting){goalAge+=step;if(!reducedMotion.matches)elapsed+=step;}
  }
  function anchor(){
    if(!group.visible) return null;
    camera.updateMatrixWorld(); group.updateWorldMatrix(true,false);
    const point=group.localToWorld(new THREE.Vector3(0,1.04,0)).project(camera);
    if(point.z < -1 || point.z > 1) return null;
    return {x:(point.x+1)*innerWidth/2,y:(1-point.y)*innerHeight/2};
  }
  return {group, update, anchor, attach(nextScene){nextScene.add(group);needsSnap=true;goal=null;}, snap(){needsSnap=true;goal=null;}};
}
