const NAMES=["left","center","right"];
export const WALI_FACTS={
  suit:"A spacesuit combines protection and life support. Its systems must be checked before use.",
  ared:"Resistance exercise helps train muscles when gravity changes.",
  mental:"Life support controls several aspects of the air, not just oxygen.",
  eva:"In the pool, buoyancy offsets some weight; gravity does not disappear.",
  habitat:"In a habitat, air, water and power depend on connected systems.",
  vab:"Platforms in an assembly building provide access to different parts of the vehicle.",
  ship:"A sol is a day on Mars. Missions need reserves for unexpected events.",
  'mars-surface':"This scene is fictional; the horizon includes a historical image from the Spirit rover.",
  'mars-habitat':"Sleeping and growing areas help organize daily crew life.",
  'mars-base':"Growing food takes resources and time. The figures in this mission are simulated.",
};

export function nextPowerMove(buses){
  if(!Array.isArray(buses)||buses.length!==3||!buses.every(v=>typeof v==='boolean'))return null;
  const queue=[{bits:buses,first:null}],seen=new Set();
  while(queue.length){const item=queue.shift(),key=item.bits.map(Number).join('');if(seen.has(key))continue;seen.add(key);if(item.bits.every(Boolean))return item.first;
    for(let move=0;move<3;move++){const bits=[...item.bits];for(let i=Math.max(0,move-1);i<=Math.min(2,move+1);i++)bits[i]=!bits[i];queue.push({bits,first:item.first??move});}
  }return null;
}

export function waliHint(context={}){
  const scene=context.scene;
  if(context.completed)return "Training complete. Select “Descend to Mars” in the report to continue.";
  if(Number.isInteger(context.stage)&&Number.isInteger(context.sceneIndex)&&context.stage>context.sceneIndex)return "The activity in this room is complete. Find the open door to continue.";
  switch(scene){
    case 'suit':return `Approach the suit console and press E. You have completed ${context.checks??0} of 3 checks.`;
    case 'ared':return `At ARED, wait until the needle is in the green zone and press E once. You have completed ${context.reps??0} of 6 repetitions.`;
    case 'mental':return "If there is a pressure leak and a thermal warning, address the atmosphere loss first.";
    case 'eva':return "Select a line and then its matching port: oxygen to O₂, data to data and power to power.";
    case 'habitat':return "Set oxygen to 80%, water to 60% and energy to 70%. Then confirm the balance.";
    case 'vab':{const move=nextPowerMove(context.buses);return move===null?"Check the three buses; all must be active.":`Try the ${NAMES[move]} switch. Each switch also changes its neighboring buses.`;}
    case 'ship':return "Read the cost of each option. Protect the air and crew without using all your energy.";
    case 'mars-surface':return context.near?"You are near the door: press E to enter the habitat.":"Walk down the ramp and follow the lights to the habitat door. Use WASD to move.";
    case 'mars-habitat':return context.near==='console'?"Press E to open mission control.":context.near==='exit'?"Press E to return to the surface.":"The console is at the far end, following the light line on the floor. Approach it and press E.";
    case 'mars-base':{
      if(context.finished)return "Review the log to learn from your decisions. You can try the mission again.";
      if(context.sol===2&&(context.shield??0)<(context.shieldNeeded??2))return `In the solar exercise, allocate at least ${context.shieldNeeded??2} units to the shelter. This rule is simulated.`;
      if((context.air??100)<40)return "Air is low. Consider allocating more power to life support and check the forecast.";
      return "Allocate up to 10 units. Crops need power and water; protection and communications also compete for power.";
    }
    default:return "I am here to help. Press H or choose Hint whenever you need guidance.";
  }
}
