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
  // Educational overlay: recognizable star patterns, drawn as a fictional composition.
  const constellations = [
    {name:'ORIÓN',points:[[1160,170],[1260,205],[1175,300],[1205,325],[1235,350],[1150,445],[1290,455]],edges:[[0,1],[0,2],[1,4],[2,3],[3,4],[2,5],[4,6],[5,6]]},
    {name:'OSA MAYOR',points:[[1460,105],[1520,120],[1580,140],[1640,170],[1680,220],[1595,225],[1550,185]],edges:[[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]]},
  ];
  ctx.lineWidth=2;ctx.strokeStyle='rgba(154,211,239,.46)';
  for(const group of constellations){
    for(const [a,b] of group.edges){ctx.beginPath();ctx.moveTo(...group.points[a]);ctx.lineTo(...group.points[b]);ctx.stroke();}
    for(const [x,y] of group.points){cloud(x,y,12,'rgba(189,225,255,.42)');ctx.fillStyle='#e6f6ff';ctx.beginPath();ctx.arc(x,y,3.4,0,Math.PI*2);ctx.fill();}
    ctx.font='20px monospace';ctx.fillStyle='rgba(200,231,248,.78)';ctx.fillText(group.name,group.points[0][0],group.points[0][1]-23);
  }
  // The sizes and positions are chosen for readability, not astronomical scale.
  const sunX=1800,sunY=310,sunR=82;
  cloud(sunX,sunY,340,'rgba(255,163,73,.24)');
  cloud(sunX,sunY,180,'rgba(255,211,133,.38)');
  const sun=ctx.createRadialGradient(sunX-22,sunY-23,4,sunX,sunY,sunR);
  sun.addColorStop(0,'#fff9d4');sun.addColorStop(.65,'#ffe59b');sun.addColorStop(1,'#f6a947');
  ctx.fillStyle=sun;ctx.beginPath();ctx.arc(sunX,sunY,sunR,0,Math.PI*2);ctx.fill();

  const earthX=590,earthY=590,earthR=255;
  ctx.save();ctx.translate(0,-105);
  cloud(earthX,earthY,310,'rgba(72,163,234,.22)');
  ctx.save();ctx.beginPath();ctx.arc(earthX,earthY,earthR,0,Math.PI*2);ctx.clip();
  const ocean=ctx.createRadialGradient(earthX-100,earthY-125,15,earthX,earthY,earthR*1.1);
  ocean.addColorStop(0,'#77c2ea');ocean.addColorStop(.45,'#2272b6');ocean.addColorStop(1,'#061c47');
  ctx.fillStyle=ocean;ctx.fillRect(earthX-earthR,earthY-earthR,earthR*2,earthR*2);
  ctx.fillStyle='#89aa8c';
  function land(points){ctx.beginPath();ctx.moveTo(...points[0]);for(const [x,y] of points.slice(1))ctx.lineTo(x,y);ctx.closePath();ctx.fill();}
  land([[385,468],[430,420],[506,405],[543,433],[531,470],[569,489],[544,521],[495,523],[475,558],[434,539],[410,507]]);
  land([[486,556],[530,566],[554,607],[547,644],[522,671],[510,721],[486,692],[469,645],[465,598]]);
  land([[601,442],[645,420],[695,435],[710,461],[680,483],[688,512],[659,538],[622,529],[608,500],[581,480]]);
  land([[635,532],[682,532],[719,560],[714,609],[688,659],[660,672],[633,636],[615,578]]);
  land([[704,444],[751,427],[811,449],[827,490],[784,509],[742,489]]);
  ctx.strokeStyle='rgba(245,251,255,.55)';ctx.lineWidth=12;ctx.lineCap='round';
  for(const [x,y] of [[395,477],[488,430],[620,474],[710,500],[500,605],[640,590],[418,555],[726,570]]){
    ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+32,y-12,x+65,y+10,x+98,y-6);ctx.stroke();
  }
  const shade=ctx.createLinearGradient(earthX-earthR,earthY-earthR,earthX+earthR,earthY+earthR);
  shade.addColorStop(0,'rgba(0,0,0,0)');shade.addColorStop(.6,'rgba(0,8,25,.07)');shade.addColorStop(1,'rgba(0,6,20,.8)');
  ctx.fillStyle=shade;ctx.fillRect(earthX-earthR,earthY-earthR,earthR*2,earthR*2);ctx.restore();
  ctx.strokeStyle='rgba(143,213,255,.55)';ctx.lineWidth=5;ctx.beginPath();ctx.arc(earthX,earthY,earthR,0,Math.PI*2);ctx.stroke();ctx.restore();

  const moonX=1030,moonY=525,moonR=82;
  cloud(moonX,moonY,115,'rgba(160,184,220,.12)');
  const moon=ctx.createRadialGradient(moonX-35,moonY-35,4,moonX,moonY,moonR);
  moon.addColorStop(0,'#e4e4dc');moon.addColorStop(.65,'#a7adb4');moon.addColorStop(1,'#4e586b');
  ctx.fillStyle=moon;ctx.beginPath();ctx.arc(moonX,moonY,moonR,0,Math.PI*2);ctx.fill();
  for(const [dx,dy,r] of [[-28,-18,14],[22,-32,12],[-7,24,18],[35,12,10],[-40,29,8],[12,2,7]]){
    ctx.fillStyle='rgba(56,64,76,.23)';ctx.beginPath();ctx.arc(moonX+dx,moonY+dy,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle='rgba(238,239,233,.18)';ctx.lineWidth=2;ctx.stroke();
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
