import * as THREE from 'three';

const $=id=>document.getElementById(id), reduced=matchMedia('(prefers-reduced-motion: reduce)'),fromBase=new URLSearchParams(location.search).get('regreso')==='base';
let active=fromBase,loading=false,landed=fromBase,dragging=false,yaw=0,pitch=0;
const keys=new Set(),canvasHost=$('mars-world');let renderer,scene,camera,last=performance.now();
const door={x:0,z:-7.35},minZ=-7.35;
function finishLanding(){
  if(landed)return;landed=true;$('landing-title').textContent='Aterrizaje completado';
  $('landing-message').textContent='La nave está en la superficie. Baja por la rampa y sigue las luces hasta la base.';
  $('skip-landing').hidden=true;$('leave-ship').hidden=false;$('leave-ship').focus();
}
$('skip-landing').addEventListener('click',finishLanding);
if(fromBase){$('landing').hidden=true;$('message').textContent='Has vuelto a la superficie. Tu progreso en la base está guardado en esta pestaña.';}
else setTimeout(finishLanding,reduced.matches?0:4000);
$('leave-ship').addEventListener('click',()=>{$('landing').hidden=true;active=true;$('message').textContent='Bienvenido a Marte. Baja por la rampa y camina hacia el hábitat.';renderer?.domElement.focus();});
function enterBase(){
  if(!active||loading||Math.hypot(camera.position.x-door.x,camera.position.z-door.z)>2.4)return;
  active=false;loading=true;$('loading').hidden=false;
  setTimeout(()=>{window.location.href='./outpost.html?origen=marte';},reduced.matches?0:900);
}
$('enter-base').addEventListener('click',enterBase);
try{
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.25));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
  canvasHost.append(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','Superficie marciana 3D. Camina por la rampa y pulsa E cerca de la puerta del hábitat.');
  scene=new THREE.Scene();scene.background=new THREE.Color(0xb07962);scene.fog=new THREE.Fog(0xb07962,32,92);
  camera=new THREE.PerspectiveCamera(70,1,.08,140);camera.rotation.order='YXZ';camera.position.set(0,fromBase?1.7:2.75,fromBase?-4.4:7.7);scene.add(camera);
  scene.add(new THREE.HemisphereLight(0xffd8b6,0x76503c,1.7));const sun=new THREE.DirectionalLight(0xffdcbd,2);sun.position.set(-14,30,12);scene.add(sun);
  const metal=new THREE.MeshStandardMaterial({color:0xc5c5b8,roughness:.64,metalness:.35}),dark=new THREE.MeshStandardMaterial({color:0x293e42,roughness:.72,metalness:.35});
  const orange=new THREE.MeshStandardMaterial({color:0xb8663d,roughness:.9}),glow=new THREE.MeshBasicMaterial({color:0xb9e8b2});
  const box=(x,y,z,w,h,d,material)=>{const obj=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);obj.position.set(x,y,z);scene.add(obj);return obj;};
  const cylinder=(x,y,z,r1,r2,h,material)=>{const obj=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,24),material);obj.position.set(x,y,z);scene.add(obj);return obj;};
  const surface=document.createElement('canvas');surface.width=surface.height=512;const ctx=surface.getContext('2d');ctx.fillStyle='#b4785b';ctx.fillRect(0,0,512,512);let seed=941;
  const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  for(let i=0;i<6000;i++){const light=random()>.5;ctx.fillStyle=light?'rgba(255,215,171,.09)':'rgba(56,31,27,.10)';ctx.fillRect(random()*512,random()*512,1+random()*5,1+random()*3);}
  const groundMap=new THREE.CanvasTexture(surface);groundMap.colorSpace=THREE.SRGBColorSpace;groundMap.wrapS=groundMap.wrapT=THREE.RepeatWrapping;groundMap.repeat.set(24,24);
  const terrain=new THREE.Mesh(new THREE.PlaneGeometry(120,120),new THREE.MeshStandardMaterial({map:groundMap,color:0xd09a79,roughness:1}));terrain.rotation.x=-Math.PI/2;scene.add(terrain);
  // Landing vehicle and descending ramp, behind the initial player position.
  cylinder(0,2.55,10,1.8,2.25,4.2,metal);const roof=new THREE.Mesh(new THREE.ConeGeometry(1.8,1.6,24),metal);roof.position.set(0,5.4,10);scene.add(roof);
  box(0,2.3,7.8,1.65,2.35,.12,dark);box(0,3.45,7.7,1.8,.12,.16,glow);
  for(const side of [-1,1]){box(side*1.8,.75,10,.25,1.5,.3,dark);box(side*2,.12,10,1.3,.2,1.3,metal);}
  const ramp=box(0,.68,6.65,2.45,.16,3.4,metal);ramp.rotation.x=-.36;
  for(let i=0;i<8;i++){const step=box(0,.12+i*.13,5.1+i*.42,2.25,.04,.045,dark);step.rotation.x=-.36;}
  // Habitat: separate 3D door, framing and exterior service details.
  box(0,2.2,-12,8.4,4.4,7,metal);box(0,2.05,-8.42,2.35,3.75,.2,dark);
  for(const side of [-1,1]){box(side*1.25,2,-8.3,.22,4.1,.24,orange);box(side*.52,1.93,-8.25,.95,3.45,.1,metal);}
  box(0,4.1,-8.27,2.75,.17,.25,orange);box(0,3.75,-8.12,1.7,.09,.06,glow);
  for(const x of [-3.2,3.2]){box(x,2.3,-8.42,1.5,1,.1,dark);box(x,2.3,-8.34,1.25,.73,.06,new THREE.MeshStandardMaterial({color:0x547f8b,metalness:.5,roughness:.24}));}
  for(const z of [-14,-11,-8.5])box(0,4.48,z,8.6,.13,.18,dark);
  for(const side of [-1,1]){box(side*4.25,.3,-12,.25,.6,7.2,dark);box(side*4.2,2.2,-12,.15,4.4,.18,dark);}
  // Visual guidance remains in the walkable central corridor.
  for(const z of [3,0,-3,-6]){box(-2.1,.08,z,.13,.16,.3,glow);box(2.1,.08,z,.13,.16,.3,glow);}
  const stones=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),new THREE.MeshStandardMaterial({color:0x80503f,roughness:1}),90),matrix=new THREE.Matrix4(),rotation=new THREE.Quaternion();let count=0;
  while(count<90){const x=(random()-.5)*70,z=(random()-.5)*70;if(Math.abs(x)<5&&z>-18&&z<17)continue;const scale=.16+random()*.9;matrix.compose(new THREE.Vector3(x,scale*.35,z),rotation,new THREE.Vector3(scale,scale*.55,scale));stones.setMatrixAt(count++,matrix);}stones.instanceMatrix.needsUpdate=true;scene.add(stones);
  const ridgeMat=new THREE.MeshStandardMaterial({color:0x98634e,roughness:1});
  for(let i=0;i<10;i++){const peak=new THREE.Mesh(new THREE.ConeGeometry(7+random()*8,5+random()*7,5),ridgeMat);peak.position.set(-48+i*11,2,-42-random()*12);scene.add(peak);}
  const glove=new THREE.MeshStandardMaterial({color:0xd4d9d2,roughness:.9});
  for(const side of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.075,.3,3,8),glove);arm.rotation.z=side*.45;arm.position.set(side*.58,-.61,-1);camera.add(arm);}
  const resize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);};window.addEventListener('resize',resize);resize();
  const canvas=renderer.domElement;if(fromBase)canvas.focus();canvas.addEventListener('pointerdown',()=>{if(active){dragging=true;canvas.focus();}});window.addEventListener('pointerup',()=>dragging=false);
  document.addEventListener('mousemove',event=>{if(!active||!dragging)return;yaw-=event.movementX*.003;pitch=THREE.MathUtils.clamp(pitch-event.movementY*.003,-1,1);});
  window.addEventListener('keydown',event=>{if(event.target.closest('button,a,input'))return;if(['KeyW','KeyS','KeyA','KeyD','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','ControlLeft','ControlRight','ShiftLeft','ShiftRight'].includes(event.code))event.preventDefault();keys.add(event.code);if(event.code==='KeyE'&&!event.repeat)enterBase();});
  window.addEventListener('keyup',event=>keys.delete(event.code));window.addEventListener('blur',()=>{keys.clear();dragging=false;});
  function frame(now){const dt=Math.min((now-last)/1000,.05);last=now;
    if(active){yaw+=((keys.has('ArrowLeft')?1:0)-(keys.has('ArrowRight')?1:0))*dt*1.5;pitch=THREE.MathUtils.clamp(pitch+((keys.has('ArrowUp')?1:0)-(keys.has('ArrowDown')?1:0))*dt,-1,1);
      const forward=Number(keys.has('KeyW'))-Number(keys.has('KeyS')),right=Number(keys.has('KeyD'))-Number(keys.has('KeyA')),len=Math.hypot(forward,right)||1;
      const speed=(keys.has('ShiftLeft')||keys.has('ShiftRight')||((keys.has('ControlLeft')||keys.has('ControlRight'))&&forward>0))?4.2:2.8;
      camera.position.x=THREE.MathUtils.clamp(camera.position.x+(right*Math.cos(yaw)-forward*Math.sin(yaw))*speed*dt/len,-16,16);
      camera.position.z=THREE.MathUtils.clamp(camera.position.z+(-forward*Math.cos(yaw)-right*Math.sin(yaw))*speed*dt/len,minZ,8);
      const rampHeight=Math.abs(camera.position.x)<1.15?THREE.MathUtils.clamp((camera.position.z-5)*.39,0,1.15):0;camera.position.y=1.7+rampHeight;
      camera.rotation.set(pitch,yaw,0);const distance=Math.hypot(camera.position.x-door.x,camera.position.z-door.z);$('distance').textContent=`HÁBITAT · ${distance.toFixed(1)} m`;$('enter-base').hidden=distance>2.4;
    }
    renderer.render(scene,camera);requestAnimationFrame(frame);
  }requestAnimationFrame(frame);
}catch(error){$('landing').hidden=true;$('fatal').hidden=false;console.error('No se pudo iniciar la superficie marciana:',error);}
