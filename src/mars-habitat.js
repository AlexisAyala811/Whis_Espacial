import * as THREE from 'three';
import { createWaliCompanion } from './rendering/wali-companion.js';
import { RoundedBoxGeometry } from '../../node_modules/three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { makeSurfaceTextures, drawTelemetry } from './rendering/surface-detail.js';
import { createWali } from './wali.js';

const $=id=>document.getElementById(id),reduced=matchMedia('(prefers-reduced-motion: reduce)'),returned=new URLSearchParams(location.search).get('regreso')==='panel';
const keys=new Set(),obstacles=[];let renderer,camera,scene,dragging=false,loading=false,yaw=0,pitch=0,last=performance.now(),screenTime=0,nearAction=null,lastMessage='';
const consolePoint={x:0,z:-5.1},exitPoint={x:0,z:8.6};
function say(message){if(message!==lastMessage){lastMessage=message;$('message').textContent=message;}}
function transition(target){if(loading||!nearAction||nearAction.id!==target)return;loading=true;keys.clear();$('loading-title').textContent=target==='console'?'Abriendo control de misión':'Saliendo a la superficie';$('loading-detail').textContent=target==='console'?'Cargando el panel de recursos…':'Preparando la esclusa…';$('loading').hidden=false;setTimeout(()=>{location.href=target==='console'?'./outpost.html?origen=habitat':'./mars.html?regreso=base';},reduced.matches?0:800);}
$('interact').addEventListener('click',()=>{if(nearAction)transition(nearAction.id);});
try{
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const canvas=renderer.domElement;$('habitat-world').append(canvas);canvas.tabIndex=0;canvas.setAttribute('aria-label','Interior 3D del hábitat marciano. Camina hasta la consola o vuelve a la esclusa.');
  scene=new THREE.Scene();scene.background=new THREE.Color(0x667d82);camera=new THREE.PerspectiveCamera(70,1,.08,80);camera.rotation.order='YXZ';camera.position.set(0,1.7,returned?-2.3:5.9);scene.add(camera);
  const waliCompanion=createWaliCompanion(scene,camera,reduced);
  const wali=createWali({showAvatar:false,getContext:()=>({scene:'mars-habitat',active:!loading,near:nearAction?.id})});
  scene.add(new THREE.HemisphereLight(0xe8f4f0,0x63767b,1.5));const light=new THREE.DirectionalLight(0xf4ede2,1.45);light.position.set(-3,7,5);light.castShadow=true;light.shadow.mapSize.set(1024,1024);light.shadow.camera.left=-12;light.shadow.camera.right=12;light.shadow.camera.top=12;light.shadow.camera.bottom=-12;light.shadow.bias=-.0003;scene.add(light);
  const textures=makeSurfaceTextures(4);
  const wall=new THREE.MeshStandardMaterial({color:0xc1ccca,map:textures.wall,roughness:.85}),floor=new THREE.MeshStandardMaterial({color:0x83999c,map:textures.floor,roughness:.7,metalness:.18}),metal=new THREE.MeshStandardMaterial({color:0x718a90,map:textures.metal,roughness:.58,metalness:.36}),dark=new THREE.MeshStandardMaterial({color:0x233c48,roughness:.72,metalness:.2}),fabric=new THREE.MeshStandardMaterial({color:0x385e70,map:textures.fabric,roughness:.9}),leaf=new THREE.MeshStandardMaterial({color:0x6d9e66,roughness:.9}),glow=new THREE.MeshBasicMaterial({color:0xccebdc});
  const box=(x,y,z,w,h,d,mat)=>{const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);mesh.position.set(x,y,z);mesh.castShadow=mat!==glow;mesh.receiveShadow=true;scene.add(mesh);return mesh;};
  const rounded=(x,y,z,w,h,d,mat,r=.08)=>{const mesh=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,r),mat);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;};
  const sign=(text,x,y,z,w)=>{const c=document.createElement('canvas');c.width=512;c.height=96;const context=c.getContext('2d');context.fillStyle='#142f38';context.fillRect(0,0,512,96);context.fillStyle='#c7e8d5';context.font='bold 30px monospace';context.textAlign='center';context.fillText(text,256,58);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;const mesh=new THREE.Mesh(new THREE.PlaneGeometry(w,w*96/512),new THREE.MeshBasicMaterial({map}));mesh.position.set(x,y,z);scene.add(mesh);};
  // Structural shell with a clear centre aisle.
  box(0,-.14,0,12,.28,19,floor);box(-6,2.7,0,.25,5.4,19,wall);box(6,2.7,0,.25,5.4,19,wall);box(0,2.7,-9.4,12,5.4,.25,wall);box(0,2.7,9.4,12,5.4,.25,wall);box(0,5.45,0,12,.2,19,wall);
  for(const z of [-7,-3,1,5,8]){box(-5.82,2.65,z,.18,5.2,.18,metal);box(5.82,2.65,z,.18,5.2,.18,metal);box(0,5.26,z,11.8,.14,.18,metal);box(0,5.12,z,2.7,.05,.5,glow);}
  for(const x of [-5,-3,-1,1,3,5])box(x,.015,0,.025,.02,18.5,dark);
  for(const z of [-8,-6,-4,-2,0,2,4,6,8])box(0,.018,z,11.6,.02,.025,dark);
  box(0,.025,0,.06,.025,17.7,glow);
  // Airlock and the return door.
  for(const side of [-1,1]){box(side*1.25,2.1,9.18,.22,4.2,.22,metal);box(side*.55,2.05,9.12,1.05,3.9,.12,dark);}box(0,4.28,9.18,2.7,.16,.22,metal);box(0,4.05,9.02,1.8,.08,.08,glow);
  // Recessed rails, utility indicators and wall seams add detail without narrowing the aisle.
  for(const side of [-1,1])for(const z of [-7,-4,0,4,7]){
    box(side*5.80,.38,z,.05,.24,1.55,dark);
    box(side*5.77,3.85,z,.05,.08,1.3,metal);
    for(const dz of [-.55,.55])box(side*5.74,1.1,z+dz,.035,.4,.035,metal);
  }
  for(const z of [-7,-3,1,5]){box(-5.72,4.62,z,.06,.04,1.4,glow);box(5.72,4.62,z,.06,.04,1.4,glow);}
  // Sleeping berths on the left.
  for(const y of [.65,2.15]){rounded(-4.35,y,-1.2,2.8,.25,1.6,metal);rounded(-4.35,y+.18,-1.2,2.55,.18,1.4,fabric);rounded(-5.1,y+.3,-1.2,.65,.12,1.15,wall,.05);}
  for(const x of [-5.7,-3])for(const z of [-1.95,-.45])box(x,1.6,z,.09,3.2,.09,metal);
  obstacles.push({x:-4.35,z:-1.2,w:3,d:1.85});sign('DESCANSO',-4.3,3.45,-2.13,2.7);
  // Plant rack with individual leaves; the model is decorative, not a crop simulator.
  box(4.45,.55,-2.4,2.25,1.1,1.55,metal);box(4.45,1.15,-2.4,2.1,.12,1.4,dark);
  for(const x of [3.75,4.2,4.65,5.1])for(const z of [-2.8,-2.05]){const stem=new THREE.Mesh(new THREE.CylinderGeometry(.025,.035,.44,7),leaf);stem.position.set(x,1.43,z);scene.add(stem);const foliage=new THREE.Mesh(new THREE.SphereGeometry(.17,9,7),leaf);foliage.scale.set(1.25,.7,1);foliage.position.set(x,1.68,z);scene.add(foliage);}
  for(const x of [3.75,4.2,4.65,5.1])for(const z of [-2.8,-2.05])for(const side of [-1,1]){
    const blade=new THREE.Mesh(new THREE.SphereGeometry(.12,10,7),leaf);blade.scale.set(1.5,.32,.65);blade.rotation.z=side*.42;blade.position.set(x+side*.11,1.57,z);scene.add(blade);
  }
  box(4.45,2.25,-2.4,2,.08,.35,glow);for(const x of [3.4,5.5])box(x,1.7,-2.4,.08,2.4,.08,metal);
  obstacles.push({x:4.45,z:-2.4,w:2.5,d:1.8});sign('CULTIVO',4.45,2.8,-3.24,2.4);
  // Environmental rack and storage on right side.
  rounded(4.6,1.2,3.8,2.1,2.4,1.15,metal);box(4.6,1.55,3.18,1.6,.75,.08,dark);for(const x of [4,4.6,5.2])box(x,1.55,3.12,.22,.14,.04,glow);obstacles.push({x:4.6,z:3.8,w:2.3,d:1.4});sign('SOPORTE VITAL',4.6,2.85,3.1,2.5);
  // Mission console, screen and seat; no blockage in the entry aisle.
  rounded(0,.65,-5.1,3.1,1.3,1.15,metal);box(0,1.35,-5.1,3.15,.12,1.2,dark);
  const screenCanvas=document.createElement('canvas');screenCanvas.width=512;screenCanvas.height=256;drawTelemetry(screenCanvas,4,0);const screenMap=new THREE.CanvasTexture(screenCanvas);screenMap.colorSpace=THREE.SRGBColorSpace;
  box(0,2.15,-5.67,2.7,1.2,.14,dark);const screen=new THREE.Mesh(new THREE.PlaneGeometry(2.48,1.02),new THREE.MeshBasicMaterial({map:screenMap}));screen.position.set(0,2.15,-5.58);scene.add(screen);
  for(const x of [-1,-.6,-.2,.2,.6,1])box(x,1.43,-4.8,.22,.025,.17,glow);
  sign('CONTROL DE MISION',0,3.2,-5.63,3.4);obstacles.push({x:0,z:-5.1,w:3.2,d:1.35});
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.7,.025,8,48),glow);ring.rotation.x=-Math.PI/2;ring.position.set(0,.055,-5.1);scene.add(ring);
  // Photographic Mars view is a wall display, not an accurate live window.
  const image=new Image();image.onload=()=>{const tex=new THREE.Texture(image);tex.colorSpace=THREE.SRGBColorSpace;tex.needsUpdate=true;const pane=new THREE.Mesh(new THREE.PlaneGeometry(3.1,1.15),new THREE.MeshBasicMaterial({map:tex}));pane.position.set(-5.84,3.1,4.1);pane.rotation.y=Math.PI/2;scene.add(pane);};image.src='./assets/mars/spirit-panorama.jpg';
  const handMat=new THREE.MeshStandardMaterial({color:0xdce2db,roughness:.9}),handGeom=new RoundedBoxGeometry(.18,.1,.19,3,.03),fingerGeom=new THREE.CapsuleGeometry(.022,.065,3,8);
  for(const side of [-1,1]){const hand=new THREE.Group();hand.position.set(side*.54,-.5,-1.05);hand.rotation.z=side*.12;hand.add(new THREE.Mesh(handGeom,handMat));for(let i=0;i<4;i++){const finger=new THREE.Mesh(fingerGeom,handMat);finger.rotation.x=Math.PI/2;finger.position.set((i-1.5)*.043,0,-.13);hand.add(finger);}camera.add(hand);}
  const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);};window.addEventListener('resize',resize);resize();canvas.focus();
  canvas.addEventListener('pointerdown',()=>{if(!loading){dragging=true;canvas.focus();}});window.addEventListener('pointerup',()=>dragging=false);document.addEventListener('mousemove',event=>{if(!dragging||loading)return;yaw-=event.movementX*.003;pitch=THREE.MathUtils.clamp(pitch-event.movementY*.003,-1,1);});
  window.addEventListener('keydown',event=>{if(event.target.closest('button,a,input'))return;if(['KeyW','KeyS','KeyA','KeyD','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','ControlLeft','ControlRight','ShiftLeft','ShiftRight'].includes(event.code))event.preventDefault();keys.add(event.code);if(event.code==='KeyE'&&!event.repeat&&nearAction)transition(nearAction.id);});
  window.addEventListener('keyup',event=>keys.delete(event.code));window.addEventListener('blur',()=>{keys.clear();dragging=false;});
  function blocked(x,z){return Math.abs(x)>5.55||Math.abs(z)>8.65||obstacles.some(o=>Math.abs(x-o.x)<o.w/2+.32&&Math.abs(z-o.z)<o.d/2+.32);}
  function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;
    if(!loading){yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt*1.5;pitch=THREE.MathUtils.clamp(pitch+((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0))*dt,-1,1);
      const forward=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),right=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),len=Math.hypot(forward,right)||1;
      const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')||((keys.has('ControlLeft')||keys.has('ControlRight'))&&forward>0))?4:2.6;
      const x=camera.position.x+(right*Math.cos(yaw)-forward*Math.sin(yaw))*speed*dt/len,z=camera.position.z+(-forward*Math.cos(yaw)-right*Math.sin(yaw))*speed*dt/len;
      if(!blocked(x,camera.position.z))camera.position.x=x;if(!blocked(camera.position.x,z))camera.position.z=z;camera.rotation.set(pitch,yaw,0);
      const cDist=Math.hypot(camera.position.x-consolePoint.x,camera.position.z-consolePoint.z),eDist=Math.hypot(camera.position.x-exitPoint.x,camera.position.z-exitPoint.z);
      nearAction=cDist<2.5?{id:'console',label:'E · Abrir control de misión →'}:eDist<2.4?{id:'exit',label:'E · Salir a la superficie →'}:null;
      $('interact').hidden=!nearAction;if(nearAction)$('interact').textContent=nearAction.label;$('distance').textContent=`CONSOLA · ${cDist.toFixed(1)} m`;
      if(nearAction?.id==='console')say('Consola de misión cerca. Pulsa E para administrar la base.');else if(nearAction?.id==='exit')say('Esclusa cerca. Pulsa E para volver a la superficie.');else if(Math.hypot(camera.position.x+4.35,camera.position.z+1.2)<2.7)say('Zona de descanso: las literas permiten separar el sueño del trabajo.');else if(Math.hypot(camera.position.x-4.45,camera.position.z+2.4)<2.5)say('Zona de cultivo: la producción necesita agua, energía y tiempo.');else if(Math.hypot(camera.position.x-4.6,camera.position.z-3.8)<2.5)say('Soporte vital: vigila el aire y los recursos de la tripulación.');else say('Explora el hábitat. La consola central controla los recursos de la base.');
      if(!reduced.matches){screenTime+=dt;if(screenTime>=1){screenTime=0;drawTelemetry(screenCanvas,4,now/1000);screenMap.needsUpdate=true;}}
    }waliCompanion.update(dt,!loading,blocked,wali?.isInteracting());wali?.setAnchor(waliCompanion.anchor());renderer.render(scene,camera);requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
}catch(error){$('fatal').hidden=false;console.error('No se pudo iniciar el hábitat:',error);}
