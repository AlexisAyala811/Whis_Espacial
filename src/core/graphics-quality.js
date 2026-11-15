export const QUALITY_KEY='lunar-command-graphics-quality';
export const QUALITY_PRESETS=Object.freeze({
  low:Object.freeze({label:'Low',pixelRatio:.75,shadows:false,shadowSize:0,anisotropy:1,far:75,detail:0,effects:false}),
  medium:Object.freeze({label:'Medium',pixelRatio:1,shadows:false,shadowSize:0,anisotropy:2,far:95,detail:1,effects:true}),
  high:Object.freeze({label:'High',pixelRatio:1.25,shadows:true,shadowSize:1024,anisotropy:4,far:120,detail:2,effects:true}),
  ultra:Object.freeze({label:'Ultra',pixelRatio:1.5,shadows:true,shadowSize:2048,anisotropy:8,far:140,detail:3,effects:true})
});
export function qualityName(value){return Object.hasOwn(QUALITY_PRESETS,value)?value:'medium';}
