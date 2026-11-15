import * as THREE from 'three';

// Original procedural art: a distant, fictional interstellar panorama.
export function makeStarfield() {
  const canvas = document.createElement('canvas');
  canvas.width = 2048; canvas.height = 1024;
  const ctx = canvas.getContext('2d'), w = canvas.width, h = canvas.height;
  const background = ctx.createLinearGradient(0, 0, w, h);
  background.addColorStop(0, '#020918'); background.addColorStop(.5, '#0b1531'); background.addColorStop(1, '#030717');
  ctx.fillStyle = background; ctx.fillRect(0, 0, w, h);
  function cloud(x, y, radius, color) {
    const gradient = ctx.createRadialGradient(x,y,0,x,y,radius);
    gradient.addColorStop(0,color); gradient.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=gradient;ctx.fillRect(x-radius,y-radius,radius*2,radius*2);
  }
  for(const [x,y,r,c] of [[1250,390,620,'rgba(79,69,139,.30)'],[1530,510,520,'rgba(34,112,148,.28)'],[900,600,510,'rgba(109,68,117,.19)'],[1700,310,340,'rgba(127,110,181,.12)'],[350,520,390,'rgba(35,93,130,.16)']]) cloud(x,y,r,c);
  let seed=28031983;
  const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
  for(let i=0;i<1150;i++){
    const x=random()*w,y=random()*h,r=random()<.035?1.7:.35+random()*.8;
    const alpha=.22+random()*.7;
    ctx.fillStyle=`rgba(${random()>.76?'255,222,191':'201,226,255'},${alpha})`;
    ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  for(const [x,y,r] of [[430,270,3],[1370,250,4],[1650,660,3]]){
    cloud(x,y,38,'rgba(173,220,255,.22)');
    ctx.strokeStyle='rgba(206,231,255,.55)';ctx.lineWidth=1;
    ctx.beginPath();ctx.moveTo(x-r*5,y);ctx.lineTo(x+r*5,y);ctx.moveTo(x,y-r*5);ctx.lineTo(x,y+r*5);ctx.stroke();
    ctx.fillStyle='#f2f8ff';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  texture.anisotropy=2;
  return texture;
}
