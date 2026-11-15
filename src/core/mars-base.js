export const SYSTEMS=Object.freeze(['life','crop','shield','comms']);
export const POWER_PER_SOL=10;
const clamp=value=>Math.max(0,Math.min(100,value));

// A historical observation sets up an exercise; it is not a radiation forecast.
export function solarScenario(data){
  const event=data?.latest;
  if(event&&typeof event.classType==='string'&&/^[ABCMX]\d+(?:\.\d+)?$/i.test(event.classType)&&typeof event.beginTime==='string'&&Number.isFinite(Date.parse(event.beginTime))){
    const classType=event.classType.toUpperCase();
    const shieldNeeded=classType.startsWith('X')?3:classType.startsWith('M')?2:1;
    return {kind:'historical',classType,date:new Date(event.beginTime).toISOString().slice(0,10),shieldNeeded,source:'https://ccmc.gsfc.nasa.gov/tools/DONKI/'};
  }
  return {kind:'fictional',classType:null,date:null,shieldNeeded:2,source:'https://ccmc.gsfc.nasa.gov/tools/DONKI/'};
}

export class MarsBase {
  constructor(solar={kind:'fictional'}){
    this.sol=1;this.resources={air:75,water:75,food:65,health:100};this.growth=0;this.message=null;this.history=[];this.solar=solarScenario(solar?.latest?solar:null);this.finished=false;this.failed=false;
  }
  preview(allocation){
    const copy=Object.assign(Object.create(MarsBase.prototype),this,{resources:{...this.resources},message:this.message?{...this.message}:null,history:[]});
    return copy.advance(allocation);
  }
  advance(allocation){
    if(this.finished||!allocation||!SYSTEMS.every(key=>Number.isInteger(allocation[key])&&allocation[key]>=0&&allocation[key]<=POWER_PER_SOL))return null;
    const used=SYSTEMS.reduce((sum,key)=>sum+allocation[key],0);
    if(used>POWER_PER_SOL)return null;
    const before={...this.resources},notes=[],sol=this.sol;
    this.resources.air=clamp(this.resources.air+allocation.life*4-16);
    this.resources.water=clamp(this.resources.water-6-allocation.crop);
    this.resources.food=clamp(this.resources.food-9);
    if(allocation.crop){this.growth+=allocation.crop;notes.push(`El cultivo recibió ${allocation.crop} unidades de energía.`);}
    if(this.growth>=6){this.resources.food=clamp(this.resources.food+18);this.growth-=6;notes.push('Cosecha: +18 alimentos simulados.');}
    if(sol===2){
      if(allocation.shield>=this.solar.shieldNeeded)notes.push('Ejercicio solar: el refugio protegido mantuvo segura a la tripulación.');
      else{this.resources.health=clamp(this.resources.health-18);notes.push('Ejercicio solar: faltó energía para proteger el refugio; la salud bajó 18.');}
    } else if(allocation.shield)notes.push('El refugio recibió energía de protección.');
    if(this.message&&this.message.due<=sol){notes.push('Llegó la respuesta de la Tierra: revisa aire, agua y alimentos antes del próximo turno.');this.message=null;}
    if(allocation.comms&&!this.message&&sol<4){this.message={sent:sol,due:sol+2};notes.push('Mensaje enviado: la respuesta llegará en dos soles simulados.');}
    if(this.resources.air<25||this.resources.water<20||this.resources.food<20){this.resources.health=clamp(this.resources.health-15);notes.push('Una reserva está baja: la salud bajó 15.');}
    this.failed=Object.values(this.resources).some(v=>v===0);
    this.finished=this.failed||sol===5;
    const changes=Object.fromEntries(Object.keys(before).map(key=>[key,this.resources[key]-before[key]]));
    const report={sol,allocation:{...allocation},used,before,after:{...this.resources},changes,notes,failed:this.failed};
    this.history.push(report);if(!this.finished)this.sol++;
    return report;
  }
}
