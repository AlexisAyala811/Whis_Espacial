import {QUALITY_KEY,QUALITY_PRESETS,qualityName} from '../core/graphics-quality.js';

// All rendering worlds use the same saved preference; no scene reload is required.
export function createGraphicsQuality(renderer,camera,onApply=()=>{}){
  let stored;try{stored=localStorage.getItem(QUALITY_KEY)}catch{}
  let name=qualityName(stored);
  const label=document.createElement('label');label.className='graphics-quality';label.textContent='Graphics ';
  const select=document.createElement('select');select.setAttribute('aria-label','Graphics quality');
  for(const [key,preset] of Object.entries(QUALITY_PRESETS)){const option=document.createElement('option');option.value=key;option.textContent=preset.label;select.append(option);}
  label.append(select);(document.querySelector('header')??document.body).append(label);
  function apply(){
    const preset=QUALITY_PRESETS[name];select.value=name;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,preset.pixelRatio));
    renderer.shadowMap.enabled=preset.shadows;renderer.shadowMap.needsUpdate=true;
    camera.far=preset.far;camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
    onApply(preset);
  }
  function choose(value){name=qualityName(value);try{localStorage.setItem(QUALITY_KEY,name)}catch{}apply();}
  select.addEventListener('change',()=>choose(select.value));
  window.addEventListener('storage',event=>{if(event.key===QUALITY_KEY){name=qualityName(event.newValue);apply();}});
  const notice=document.createElement('div');notice.className='graphics-context-message';notice.setAttribute('role','alert');notice.hidden=true;notice.textContent='Graphics connection lost. Wait for recovery or reload the page.';document.body.append(notice);
  renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();notice.hidden=false;});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{notice.hidden=true;apply();});
  apply();
  return {apply,get preset(){return QUALITY_PRESETS[name]},get name(){return name},choose};
}
export function applySceneQuality(scene,preset,renderer,light){
  const limit=Math.min(preset.anisotropy,renderer.capabilities.getMaxAnisotropy());
  if(light){light.castShadow=preset.shadows;if(preset.shadows){light.shadow.mapSize.set(preset.shadowSize,preset.shadowSize);light.shadow.map?.dispose();light.shadow.map=null;light.shadow.needsUpdate=true;}}
  const textures=new Set();
  scene.traverse(object=>{
    if(object.userData.graphicsDetail) object.visible=preset.detail>=object.userData.graphicsDetail;
    if(object.userData.graphicsMaxDetail!==undefined) object.visible=preset.detail<=object.userData.graphicsMaxDetail;
    if(!object.isMesh)return;
    const materials=Array.isArray(object.material)?object.material:[object.material];
    for(const material of materials)if(material)for(const v of Object.values(material))if(v?.isTexture)textures.add(v);
  });
  for(const texture of textures)if(texture.anisotropy!==limit){texture.anisotropy=limit;texture.needsUpdate=true;}
}
