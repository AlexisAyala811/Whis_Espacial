import * as THREE from 'three';

const FLOOR_PHOTOS=['metal_plate','rubber_tiles','dirty_carpet','floor_tiles_02','painted_plaster_wall','concrete_floor_painted','metal_plate'];

// Room-local procedural textures: deterministic, lightweight and original.
export function makeSurfaceTextures(room) {
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
    map.anisotropy=2;
    const photo=kind==='floor'?FLOOR_PHOTOS[room]:kind==='wall'?'painted_plaster_wall':null;
    if(photo){
      // Blend a room-appropriate local photo into the procedural base.
      // If it fails or the room is disposed, the existing fallback remains valid.
      let alive=true;const image=new Image();
      map.addEventListener('dispose',()=>{alive=false;image.onload=null;image.onerror=null;});
      image.onload=()=>{if(!alive)return;ctx.save();ctx.globalAlpha=kind==='wall'?.1:room===1?.25:.17;ctx.drawImage(image,0,0,size,size);ctx.restore();map.userData[kind==='floor'?'floorPhoto':'wallPhoto']=photo;map.needsUpdate=true;};
      image.onerror=()=>{};image.src='./assets/interiors/'+photo+'.jpg';
    }
    return map;
  }
  return {metal:texture('metal'),floor:texture('floor'),wall:texture('wall'),fabric:texture('fabric'),rubber:texture('rubber')};
}

export function drawTelemetry(canvas, seed, time = 0) {
  const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
  ctx.fillStyle = '#071a27';ctx.fillRect(0,0,w,h);
  ctx.fillStyle = '#12394c';ctx.fillRect(0,0,w,38);
  ctx.fillStyle = '#b7e9ef';ctx.font = 'bold 19px monospace';
  ctx.fillText(['SUIT / BIOPLOT','ARED / LOAD','ECLSS / AIR','EVA / UMBILICAL','HERA / RESOURCES','VAB / POWER','OUTPOST / SOL 01'][seed % 7],16,26);
  ctx.strokeStyle = '#214756';ctx.lineWidth = 1;
  for(let x=16;x<w;x+=32){ctx.beginPath();ctx.moveTo(x,48);ctx.lineTo(x,215);ctx.stroke();}
  for(let y=55;y<220;y+=28){ctx.beginPath();ctx.moveTo(16,y);ctx.lineTo(w-16,y);ctx.stroke();}
  for(let line=0;line<2;line++){
    ctx.strokeStyle=line?'#e3bd70':'#72dfd1';ctx.lineWidth=3;ctx.beginPath();
    for(let x=18;x<370;x+=4){
      const y=105+line*50+Math.sin(x*.035+seed+time*(line?.8:1.2))*18+Math.sin(x*.11-time)*5;
      x===18?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }ctx.stroke();
  }
  for(let i=0;i<3;i++){
    ctx.fillStyle='#1d4151';ctx.fillRect(390,60+i*48,100,27);
    ctx.fillStyle=['#80e6c3','#eac978','#87bde4'][i];ctx.fillRect(395,65+i*48,35+((seed*17+i*19)%55),17);
  }
  ctx.fillStyle='#c1d8dc';ctx.font='14px monospace';ctx.fillText('ENTRENAMIENTO  /  DATOS SIMULADOS',16,242);
}
