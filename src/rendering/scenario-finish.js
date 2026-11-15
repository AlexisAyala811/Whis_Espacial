// Small, static details keep each training room identifiable without changing routes.
export function finishScenario(index,{box,display}) {
  const widths=[7,9,10,10,7,10,8],width=widths[index];
  const trims=[0x85a5ad,0xd0ad76,0x69a5b8,0x68c1d4,0xc9aa7d,0xd4ac57,0x87b6c5];
  const trim=trims[index];
  for(const side of [-1,1]) for(const z of [-7,-4,0,4,7]){
    // Recessed utility panels sit flush against the existing room walls.
    const x=side*(width-.24);
    box(x,1.05,z,.08,.75,1.35,0x425961);
    box(x-side*.05,1.05,z,.035,.61,1.19,0x718991);
    for(const dz of [-.44,.44])box(x-side*.08,1.05,z+dz,.025,.36,.025,trim);
    box(x-side*.09,1.37,z,.02,.025,.35,trim,true);
  }
  if(index===0){
    // Suit preparation: illuminated locker labels and work surface markings.
    for(const side of [-1,1])for(const z of [-6,-3,0,3,6]){
      box(side*6.08,2.5,z,.03,.08,.65,0xd9eee9,true);
      box(side*6.07,1.35,z+.45,.04,.34,.05,0x3f5960);
    }
  }else if(index===1){
    // Gym: resistance tracks and equipment calibration markers.
    for(const x of [-3.8,4])for(const z of [-4,-2,0,2])box(x,.07,z,2.6,.02,.025,0x9eae9d);
    for(const z of [-6,0,6])box(8.7,3.5,z,.08,.12,1.1,0xe7bd80,true);
  }else if(index===2){
    // Mission control: additional status displays above the consoles.
    for(const x of [-7.3,-5.2,5.2,7.3])display(x,2.3,-9.36,1.55,.7,2);
    for(const z of [-5.6,3.9])for(const x of [-5.5,-3.1])for(const dx of [-.3,0,.3])box(x+dx,1.25,z+.51,.12,.025,.15,0x85b5bb,true);
  }else if(index===3){
    // Neutral buoyancy laboratory: yellow safety bands on the pool rim.
    for(const side of [-1,1])for(const z of [-7,-3,1,5])box(side*8.68,4.68,z,.12,.1,1.6,0xd2b366);
  }else if(index===4){
    // Habitat: warm work lights and storage handles.
    for(const z of [-6,-2,2,6])box(6.7,3.7,z,.06,.12,1.2,0xf1d4a3,true);
    for(const z of [-6.4,-5.8,-5.2])box(-5.13,1.4,z,.05,.04,.22,0xc6d0c3);
  }else if(index===5){
    // Assembly building: safety striping along the existing service platforms.
    for(const side of [-1,1])for(const z of [-7,-5,-3,-1,1,3,5,7])box(side*8.48,4.35,z,.12,.05,.75,0xf1c65e,true);
  }else{
    // Cockpit: illuminated console edges and tactile control markings.
    for(const x of [2.5,4.1,5.7])for(const dx of [-.42,-.21,0,.21,.42])box(x+dx,1.9,-5.05,.12,.025,.1,0x9edbd4,true);
  }
}
