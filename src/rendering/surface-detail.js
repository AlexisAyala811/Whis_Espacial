import * as THREE from 'three';

const FLOOR_PHOTOS=['metal_plate','rubber_tiles','dirty_carpet','floor_tiles_02','painted_plaster_wall','concrete_floor_painted','metal_plate'];

// Room-local procedural textures: deterministic, lightweight and original.
export function makeSurfaceTextures(room, {pbr=false}={}) {
  function texture(kind) {
    const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
    const ctx=canvas.getContext('2d'), size=512;
    let seed=1843+room*1009+kind.length*73;
    const rnd=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
    ctx.fillStyle='#eceeed';ctx.fillRect(0,0,size,size);
    function noise(count,alpha,span=1){
      for(let i=0;i<count;i++){
        const v=Math.floor(120+rnd()*135);ctx.fillStyle=`rgba(${v},${v},${v},${rnd()*alpha})`;
        ctx.fillRect(rnd()*size,rnd()*size,1+rnd()*span,1+rnd()*1.4);
      }
    }
    if(kind==='metal'){
      const g=ctx.createLinearGradient(0,0,0,size);g.addColorStop(0,'#f3f5f4');g.addColorStop(.48,'#d9dedd');g.addColorStop(1,'#f1f3f1');
      ctx.fillStyle=g;ctx.fillRect(0,0,size,size);
      noise(3000,.13,20);
      for(let y=0;y<size;y+=4){ctx.fillStyle=y%8?'rgba(90,102,102,.025)':'rgba(255,255,255,.10)';ctx.fillRect(0,y,size,1);}
      for(let i=0;i<90;i++){ctx.strokeStyle='rgba(89,105,108,.06)';ctx.lineWidth=.5;const x=rnd()*size,y=rnd()*size;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+8+rnd()*35,y+rnd());ctx.stroke();}
    }else if(kind==='wall'){
      ctx.fillStyle=room===3?'#dbe9e9':room===4?'#f1f0e5':'#e2e9e7';ctx.fillRect(0,0,size,size);
      noise(2500,.12,3);
      ctx.strokeStyle='rgba(75,94,98,.19)';ctx.lineWidth=2;ctx.strokeRect(2,2,508,508);
      ctx.strokeStyle='rgba(255,255,255,.34)';ctx.lineWidth=2;ctx.strokeRect(5,5,502,502);
      for(const x of [14,498])for(const y of [14,498]){ctx.fillStyle='rgba(65,78,80,.45)';ctx.beginPath();ctx.arc(x,y,3,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';ctx.fillRect(x-1,y-1,2,2);}
    }else if(kind==='fabric'){
      ctx.fillStyle='#f0f1ed';ctx.fillRect(0,0,size,size);
      for(let i=0;i<size;i+=4){ctx.fillStyle='rgba(65,80,85,.10)';ctx.fillRect(0,i,size,1);ctx.fillRect(i,0,1,size);}
      noise(2000,.12,2);
      ctx.strokeStyle='rgba(95,110,110,.20)';ctx.lineWidth=3;ctx.strokeRect(7,7,498,498);
      ctx.setLineDash([5,6]);ctx.strokeStyle='rgba(120,135,135,.32)';ctx.lineWidth=1;ctx.strokeRect(12,12,488,488);ctx.setLineDash([]);
    }else if(kind==='rubber'){
      ctx.fillStyle='#cdd5d3';ctx.fillRect(0,0,size,size);noise(5500,.26,2);
      for(let y=0;y<size;y+=12){ctx.strokeStyle='rgba(80,92,95,.12)';ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(size,y);ctx.stroke();}
    }else if(kind==='floor'){
      const patterns=['panels','rubber','carpet','tile','vinyl','industrial','panels'];
      const style=patterns[room];
      ctx.fillStyle=style==='carpet'?'#cbd3d2':style==='rubber'?'#d1d9d5':style==='tile'?'#d9eeee':'#e4e9e6';ctx.fillRect(0,0,size,size);
      noise(style==='carpet'?7000:3500,style==='industrial'?.24:.16,style==='industrial'?6:2);
      if(style==='carpet')for(let y=0;y<size;y+=4){ctx.fillStyle='rgba(55,80,82,.05)';ctx.fillRect(0,y,size,1);}
      if(style==='rubber')for(let y=0;y<size;y+=16)for(let x=0;x<size;x+=16){ctx.fillStyle='rgba(90,100,100,.13)';ctx.beginPath();ctx.arc(x+8,y+8,2,0,Math.PI*2);ctx.fill();}
      if(style==='panels'||style==='tile'||style==='vinyl'){
        const step=style==='tile'?64:128;ctx.strokeStyle='rgba(70,91,94,.27)';ctx.lineWidth=style==='tile'?3:2;
        for(let i=0;i<=size;i+=step){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,size);ctx.moveTo(0,i);ctx.lineTo(size,i);ctx.stroke();}
        if(style==='panels')for(let x=8;x<size;x+=128)for(let y=8;y<size;y+=128){ctx.fillStyle='rgba(65,75,80,.36)';ctx.beginPath();ctx.arc(x,y,2.4,0,Math.PI*2);ctx.fill();}
      }
      if(style==='industrial')for(let i=0;i<30;i++){ctx.strokeStyle='rgba(60,68,65,.10)';ctx.beginPath();let x=rnd()*size,y=rnd()*size;ctx.moveTo(x,y);ctx.lineTo(x+20+rnd()*60,y+rnd()*4);ctx.stroke();}
    }
    const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;
    map.wrapS=map.wrapT=THREE.RepeatWrapping;
    if(kind==='floor')map.repeat.set(room===3?2:4,room===3?2:5);
    map.anisotropy=4;
    const photo=kind==='floor'?FLOOR_PHOTOS[room]:kind==='wall'?'painted_plaster_wall':null;
    if(photo){
      // Blend a room-appropriate local photo into the procedural base.
      // If it fails or the room is disposed, the existing fallback remains valid.
      let alive=true;const image=new Image();
      map.addEventListener('dispose',()=>{alive=false;image.onload=null;image.onerror=null;});
      image.onload=()=>{if(!alive)return;ctx.save();ctx.globalAlpha=kind==='wall'?.48:room===1?.5:.45;ctx.drawImage(image,0,0,size,size);ctx.restore();map.userData[kind==='floor'?'floorPhoto':'wallPhoto']=photo;map.needsUpdate=true;};
      image.onerror=()=>{};image.src='./assets/interiors/'+photo+'.jpg';
    }
    return map;
  }
  const result={metal:texture('metal'),floor:texture('floor'),wall:texture('wall'),fabric:texture('fabric'),rubber:texture('rubber')};
  if(pbr)for(const [key,file] of [['metalNormal','NormalGL'],['metalRoughness','Roughness']]){
    let alive=true;const map=new THREE.TextureLoader().load(`./assets/interiors/pbr/Metal032/${file}.jpg`,loaded=>{if(!alive)loaded.dispose();},undefined,()=>{if(!alive)return;const c=document.createElement('canvas');c.width=c.height=1;const x=c.getContext('2d');x.fillStyle=key==='metalNormal'?'#8080ff':'#ffffff';x.fillRect(0,0,1,1);map.image=c;map.needsUpdate=true;});
    map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(2,2);map.addEventListener('dispose',()=>{alive=false});result[key]=map;
  }
  if(pbr && [0,5,6].includes(room))for(const [key,file] of [['floorNormal','NormalGL'],['floorRoughness','Roughness'],['floorMetalness','Metalness']]){
    let alive=true;const map=new THREE.TextureLoader().load('./assets/interiors/pbr/metal-plates-002/'+file+'.jpg',loaded=>{if(!alive)loaded.dispose();},undefined,()=>{if(!alive)return;const fallback=document.createElement('canvas');fallback.width=fallback.height=1;const c=fallback.getContext('2d');c.fillStyle=key==='floorNormal'?'#8080ff':'#ffffff';c.fillRect(0,0,1,1);map.image=fallback;map.needsUpdate=true;});
    map.wrapS=map.wrapT=THREE.RepeatWrapping;map.repeat.set(4,5);map.anisotropy=2;map.addEventListener('dispose',()=>{alive=false;});result[key]=map;
  }
  return result;
}

export function drawTelemetry(canvas, seed, time = 0) {
  const c=canvas.getContext('2d'),w=canvas.width,h=canvas.height,sx=w/512,sy=h/256;
  c.save();c.scale(sx,sy);
  const bg=c.createLinearGradient(0,0,0,256);bg.addColorStop(0,'#102532');bg.addColorStop(1,'#071117');c.fillStyle=bg;c.fillRect(0,0,512,256);
  c.fillStyle='#1b3a45';c.fillRect(0,0,512,34);
  c.fillStyle='#d9eeec';c.font='bold 15px sans-serif';c.fillText(['SUIT SYSTEMS','EXERCISE MONITOR','ENVIRONMENT CONTROL','EVA CONNECTIONS','HABITAT RESOURCES','LAUNCH SYSTEMS','MISSION OPERATIONS'][seed%7],14,22);
  c.fillStyle='#83c9b8';c.font='bold 10px monospace';c.textAlign='right';c.fillText('SIMULATION  •  ONLINE',498,22);c.textAlign='left';
  c.fillStyle='#0d202a';c.fillRect(12,44,319,152);c.fillRect(339,44,161,152);
  c.strokeStyle='#24424b';c.lineWidth=1;for(let x=20;x<330;x+=31){c.beginPath();c.moveTo(x,65);c.lineTo(x,186);c.stroke()}for(let y=65;y<190;y+=24){c.beginPath();c.moveTo(20,y);c.lineTo(321,y);c.stroke()}
  c.fillStyle='#b4cdca';c.font='bold 10px sans-serif';c.fillText('SYSTEM TREND  /  TRAINING DATA',20,57);
  for(let line=0;line<2;line++){c.strokeStyle=line?'#eac582':'#6dd8c0';c.lineWidth=2.3;c.beginPath();for(let x=21;x<322;x+=3){const y=99+line*45+Math.sin(x*.032+seed+time*(line?.7:1))*12+Math.sin(x*.11-time*.3)*3;x===21?c.moveTo(x,y):c.lineTo(x,y)}c.stroke()}
  c.fillStyle='#a7c5c2';c.font='bold 10px sans-serif';c.fillText('SYSTEM STATUS',350,59);
  const labels=['POWER','SENSORS','LINK'];for(let i=0;i<3;i++){const y=78+i*36;c.fillStyle='#a9c6c1';c.font='10px sans-serif';c.fillText(labels[i],350,y);c.fillStyle='#29434a';c.fillRect(350,y+7,132,7);c.fillStyle=['#70d8b7','#80bfe1','#d9bd80'][i];c.fillRect(350,y+7,80+((seed*17+i*23)%48),7)}
  c.fillStyle='#15323c';c.fillRect(12,207,488,36);c.fillStyle='#c9e0da';c.font='10px monospace';c.fillText('TRAINING ONLY',22,229);c.textAlign='right';c.fillText('TELEMETRY  /  NOT LIVE',490,229);c.restore();
}
