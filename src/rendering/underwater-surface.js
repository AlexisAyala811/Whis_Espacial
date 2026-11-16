import * as THREE from 'three';

// A lightweight surface seen from below; it does not change swimming physics.
export function addUnderwaterSurface(scene) {
  const geometry=new THREE.PlaneGeometry(19.2,19.2,28,28);
  const positions=geometry.attributes.position;
  const base=new Float32Array(positions.array);
  // Fine normals catch light between the larger, slowly changing waves.
  const normals=document.createElement('canvas');normals.width=normals.height=128;
  const normalContext=normals.getContext('2d'),pixels=normalContext.createImageData(128,128);
  for(let y=0;y<128;y++)for(let x=0;x<128;x++){
    const i=(y*128+x)*4;
    pixels.data[i]=128+18*Math.sin(x*.19+y*.08)+9*Math.cos(y*.22);
    pixels.data[i+1]=128+18*Math.cos(y*.17-x*.07)+9*Math.sin(x*.2);
    pixels.data[i+2]=248;pixels.data[i+3]=255;
  }
  normalContext.putImageData(pixels,0,0);
  const normalMap=new THREE.CanvasTexture(normals);normalMap.wrapS=normalMap.wrapT=THREE.RepeatWrapping;normalMap.repeat.set(5,5);
  const material=new THREE.MeshStandardMaterial({color:0x60aec2,metalness:.12,roughness:.2,normalMap,normalScale:new THREE.Vector2(.48,.48),transparent:true,opacity:.42,side:THREE.DoubleSide,depthWrite:false});
  const water=new THREE.Mesh(geometry,material);water.name='underwater-water-surface';water.rotation.x=-Math.PI/2;water.position.y=6.55;water.userData.graphicsDetail=1;water.raycast=()=>{};scene.add(water);
  let elapsed=0;
  function update(time,dt){
    elapsed+=dt;if(elapsed<.08)return;elapsed=0;
    for(let i=0;i<positions.count;i++){
      const x=base[i*3],y=base[i*3+1];
      positions.setZ(i,.07*Math.sin(x*.8+time*.7)+.045*Math.cos(y*.65-time*.5));
    }
    positions.needsUpdate=true;geometry.computeVertexNormals();normalMap.offset.set(time*.008,time*.005);
  }
  // Faint beams suggest overhead pool lighting without obstructing interaction rays.
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=256;const c=canvas.getContext('2d');
  const gradient=c.createLinearGradient(0,0,64,0);gradient.addColorStop(0,'rgba(185,239,250,0)');gradient.addColorStop(.5,'rgba(185,239,250,.4)');gradient.addColorStop(1,'rgba(185,239,250,0)');c.fillStyle=gradient;c.fillRect(0,0,64,256);
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
  const beamMaterial=new THREE.MeshBasicMaterial({map,color:0xa8dfe7,transparent:true,opacity:.16,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
  const beamGeometry=new THREE.PlaneGeometry(1.8,5.4);
  for(const [x,z] of [[-7,-5],[-6,3],[7,4]]){const beam=new THREE.Mesh(beamGeometry,beamMaterial);beam.position.set(x,3.4,z);beam.rotation.z=.14;beam.userData.graphicsDetail=1;beam.raycast=()=>{};scene.add(beam);}
  return {water,update};
}
