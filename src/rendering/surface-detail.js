import * as THREE from 'three';

// Small, deterministic textures are shared within a room and released with it.
export function makeSurfaceTextures(room) {
  function texture(kind) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 256, 256);
    let state = 1843 + room * 1009 + kind.length * 73;
    const rnd = () => ((state = (state * 1664525 + 1013904223) >>> 0) / 4294967296);
    for (let i = 0; i < (kind === 'metal' ? 1700 : 900); i++) {
      const shade = Math.floor(195 + rnd() * 60);
      ctx.fillStyle = `rgba(${shade},${shade},${shade},${.05 + rnd() * .16})`;
      const x = rnd() * 256, y = rnd() * 256;
      ctx.fillRect(x, y, kind === 'metal' ? 3 + rnd() * 24 : 1 + rnd() * 2, .5 + rnd());
    }
    if (kind === 'floor') {
      ctx.strokeStyle = 'rgba(80,95,100,.24)'; ctx.lineWidth = 1;
      for (let i = 0; i <= 256; i += 64) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 256); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(256, i); ctx.stroke();
      }
      for (let x = 6; x < 256; x += 64) for (let y = 6; y < 256; y += 64) {
        ctx.fillStyle = 'rgba(65,75,80,.38)';ctx.beginPath();ctx.arc(x,y,1.5,0,Math.PI*2);ctx.fill();
      }
    }
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    if (kind === 'floor') map.repeat.set(4, 5);
    map.anisotropy = 2;
    return map;
  }
  return { metal: texture('metal'), floor: texture('floor') };
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
