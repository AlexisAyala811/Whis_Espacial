import { PREPARATION_SUIT_POSITIONS } from '../core/preparation-layout.js';
import {addOfficeChair} from './scene-props.js';

// Original blockout architecture. Every room has a different spatial identity.
export function decorateRoom(index,{box,cylinder,display,textPanel,obstacles,scene}) {
  if(index===0){
    // Clean preparation room: lockers, workbench, suit bays and an orange airlock.
    for(const x of [-6.5,6.5]) for(const z of [-6,-3,0,3,6]){
      box(x,1.55,z,.7,3,1.55,0xd9ded9);box(x+(x<0?.38:-.38),1.5,z,.05,2.65,1.3,0x92a4ac);
      const face=x+(x<0?.42:-.42),side=x<0?1:-1;
      for(const y of [.5,.58,.66])box(face,y,z,.025,.025,.82,0x546b70);
      for(const dz of [-.55,.55])box(face,1.5,z+dz,.025,2.42,.025,0xb8cbca);
      box(face+side*.03,1.22,z+.43,.05,.48,.09,0x293f46);
      box(face+side*.05,1.24,z+.43,.035,.26,.025,0xadc4c5);
      box(face+side*.03,2.22,z,.035,.22,.85,0x5f7b80);
      for(const dz of [-.25,0,.25])box(face+side*.05,2.22,z+dz,.025,.06,.1,0xc8d8d3);
      obstacles.push({x,z,w:.8,d:1.7});
    }
    for(const x of [-1.8,1.8]) box(x,2.25,-8.7,.22,4.5,.45,0xd49a55);
    box(0,4.4,-8.7,3.8,.25,.45,0xd49a55);
    box(4.8,.48,3.5,2.8,.15,1,0xadb8b5);for(const x of [3.6,6])box(x,.24,3.5,.12,.5,.7,0x647575);
    for(const x of [3.85,4.45,5.05,5.65])box(x,.57,3.5,.53,.045,.8,0x879d9d);
    box(4.8,.11,3.5,2.45,.08,.7,0x566d70);
    obstacles.push({x:4.8,z:3.5,w:2.8,d:1});
    for(const {x,z} of PREPARATION_SUIT_POSITIONS){box(x,.07,z,1.8,.13,1.8,0x687e86);box(x,.14,z,1.5,.04,1.5,0xc9d8d5);}
  }else if(index===1){
    // Gym: continuous rubber floor, lanes, exposed beams and equipment islands.
    for(const x of [-3.8,4]){
      box(x,.035,-1.5,3.5,.035,8.8,0x243e48);
      for(const side of [-1,1]) box(x+side*1.7,.06,-1.5,.07,.02,8.8,0xd2b47a);
    }
    for(const z of [-7,-3,1,5]){box(0,5.2,z,18,.2,.2,0x647375);box(0,5.05,z,8,.05,.15,0xf3e5be,true);}
    box(4.3,.35,3.8,1.4,.15,2.1,0x42535a);
    cylinder(4.3,.72,3.8,.46,.46,.2,0x779299).rotation.z=Math.PI/2;
    box(4.3,1.2,3.3,.12,1.6,.12,0xa4b4b6);box(4.3,1.75,3.3,.8,.12,.14,0x4d6369);
    box(4.3,1.35,4.1,.65,.16,.48,0x26383f);
    obstacles.push({x:4.3,z:3.8,w:1.6,d:2.2});
    textPanel("STRENGTH / ENDURANCE / CONTROL",0,3.9,-9.3,7);
  }else if(index===2){
    // Control room: desks in rows, carpet, a full-width display wall and acoustic ribs.
    box(0,.025,0,19,.025,18.5,0x394b55);
    for(const x of [-5.6,5.6])box(x,3.1,-9.65,8.6,4.2,.2,0x101b26);
    for(const x of [-8.5,8.5]) for(const z of [-7,-5,-3,-1,1,3,5,7]) box(x,2.8,z,.3,5.2,.18,0x263a43);
    for(const z of [-5.6,3.9]){
      box(-4.3,.6,z,4.7,1.2,1.25,0x5d7175);
      for(const x of [-5.5,-3.1])display(x,1.7,z-.15,1.6,.8,2);
      obstacles.push({x:-4.3,z,w:4.9,d:1.5});
      for(const x of [-5.5,-3.1]){addOfficeChair(scene,x,z+1.4);obstacles.push({x,z:z+1.4,w:.9,d:.9});}
    }
    for(const x of [-6,-2,2,6])box(x,5.5,0,.1,.05,15,0x8cb4c5,true);
    textPanel("MISSION CONTROL / TELEMETRY",0,5,-9.05,8.8);
  }else if(index===3){
    // Underwater pool: tiled basin, raised rim, ladders and a suspended training module.
    for(let x=-9;x<=9;x+=1)box(x,.035,0,.025,.025,19.5,0xa0c6c9);
    for(let z=-9;z<=9;z+=1)box(0,.035,z,19.5,.025,.025,0xa0c6c9);
    for(const x of [-7.5,0,7.5])box(x,.07,0,.15,.02,17,0x164158);
    for(const x of [-9,9]){
      box(x,4.9,0,.6,.4,20,0xa8c9c7);
      for(const z of [-6,0,6])box(x,3.9,z,.2,.14,1.6,0x8dd8e7,true);
    }
    for(const x of [-7.7,-6.8])box(x,2.4,5.9,.1,4.8,.1,0xa8bbc1);
    for(let y=.3;y<4.8;y+=.45)box(-7.25,y,5.9,1,.06,.1,0xa8bbc1);
    obstacles.push({x:-7.25,z:5.9,w:1.2,d:.3});
    for(const x of [2.3,6.1])cylinder(x,4.4,-2.8,.035,.035,3,0x72a4b2);
    textPanel("POOL / EXTRAVEHICULAR TRAINING",0,4,-9.25,7.8);
  }else if(index===4){
    // Habitation module: warm lower ceiling, ribbed bulkheads, dining and food storage.
    for(const z of [-7,-3,1,5]){
      box(-6.65,2.4,z,.18,4.8,.25,0xc3bca9);box(6.65,2.4,z,.18,4.8,.25,0xc3bca9);
      box(0,4.75,z,13.4,.2,.25,0xc3bca9);box(0,4.58,z,3,.06,.25,0xf4ddb0,true);
    }
    box(-4.3,.8,4.5,3.3,.15,1.8,0xbca884);
    for(const z of [3.2,5.8]){box(-4.3,.45,z,3.3,.16,.55,0x8b8d79);obstacles.push({x:-4.3,z,w:3.5,d:.6});}
    obstacles.push({x:-4.3,z:4.5,w:3.4,d:1.9});
    box(-5.9,1.5,-5.8,1.3,2.9,1.8,0xb8b3a1);obstacles.push({x:-5.9,z:-5.8,w:1.4,d:1.9});
    for(const z of [-6.4,-5.8,-5.2])box(-5.2,1.4,z,.05,.6,.4,0x696e62);
    textPanel("REST / CROPS / TEAM LIFE",0,3.5,-9.25,6.7);
  }else if(index===6){
    for(const z of [-7,-3,1,5]){
      for(const side of [-1,1]){
        const rib=box(side*6.9,3.8,z,.2,3.9,.18,0xb5c5c6);rib.rotation.z=side*.4;
      }
      box(0,5.5,z,12,.2,.18,0xb5c5c6);
    }
  }
}
