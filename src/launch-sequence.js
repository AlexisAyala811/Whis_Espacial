// A silent, skippable animated launch sequence; this is fictional game footage.
export function playLaunchSequence({container, canvas, phase, skip, reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches}) {
  return new Promise(resolve => {
    const ctx=canvas.getContext('2d');
    if (!ctx) { resolve(); return; }
    const duration=reducedMotion ? 1800 : 14000;
    const w=canvas.width,h=canvas.height;
    let frameId=0,ended=false,start=null,lastPhase='';
    const finish=()=>{
      if(ended)return;ended=true;cancelAnimationFrame(frameId);skip.removeEventListener('click',finish);
      container.hidden=true;resolve();
    };
    skip.addEventListener('click',finish);container.hidden=false;skip.focus();
    function gradient(y0,y1,colors){const g=ctx.createLinearGradient(0,y0,0,y1);for(const [stop,color] of colors)g.addColorStop(stop,color);return g;}
    function rocket(x,y,scale,fire){
      ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
      if(fire>0){
        const flare=ctx.createRadialGradient(0,92,5,0,170,140);
        flare.addColorStop(0,'rgba(255,247,196,.95)');flare.addColorStop(.3,'rgba(255,170,67,.7)');flare.addColorStop(1,'rgba(255,130,40,0)');
        ctx.fillStyle=flare;ctx.fillRect(-160,70,320,280);
        ctx.fillStyle='#ffe7a0';ctx.beginPath();ctx.moveTo(-22,78);ctx.lineTo(0,190+fire*60);ctx.lineTo(22,78);ctx.fill();
      }
      ctx.fillStyle='#c77831';ctx.fillRect(-24,-130,48,210);
      ctx.fillStyle='#e7eced';ctx.fillRect(-22,-133,44,25);ctx.fillRect(-22,67,44,12);
      ctx.beginPath();ctx.moveTo(-23,-133);ctx.lineTo(0,-178);ctx.lineTo(23,-133);ctx.fill();
      for(const side of [-1,1]){
        ctx.fillStyle='#d9e1e5';ctx.fillRect(side*35-9,-79,18,151);
        ctx.beginPath();ctx.moveTo(side*35-9,-79);ctx.lineTo(side*35,-108);ctx.lineTo(side*35+9,-79);ctx.fill();
        ctx.fillStyle='#98aab2';ctx.fillRect(side*35-8,62,16,10);
      }
      ctx.strokeStyle='rgba(255,255,255,.25)';ctx.lineWidth=2;ctx.strokeRect(-24,-130,48,210);
      ctx.restore();
    }
    function draw(now){
      if(start===null)start=now;
      const t=Math.min((now-start)/duration,1);
      const launch=t>.32,orbit=t>.74;
      ctx.clearRect(0,0,w,h);
      if(!orbit){
        ctx.fillStyle=gradient(0,h,[[0,'#0a1e36'],[.65,'#47627a'],[1,'#c38761']]);ctx.fillRect(0,0,w,h);
        const glow=ctx.createRadialGradient(w*.76,h*.53,0,w*.76,h*.53,250);glow.addColorStop(0,'rgba(255,211,159,.5)');glow.addColorStop(1,'rgba(255,180,100,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
        ctx.fillStyle='#1b2c37';ctx.fillRect(0,h*.84,w,h*.16);
        ctx.fillStyle='#32434b';ctx.fillRect(w*.32,h*.22,13,h*.63);
        ctx.fillRect(w*.28,h*.35,w*.16,8);ctx.fillRect(w*.28,h*.5,w*.16,8);ctx.fillRect(w*.28,h*.65,w*.16,8);
        for(let i=0;i<6;i++){ctx.fillStyle='#c8a66e';ctx.fillRect(w*.32,h*(.28+i*.085),w*.1,4);}
        const progress=Math.max(0,(t-.32)/.42);
        if(launch){
          const smoke=ctx.createRadialGradient(w*.49,h*.85,10,w*.49,h*.85,230+progress*100);
          smoke.addColorStop(0,'rgba(255,241,215,.86)');smoke.addColorStop(.5,'rgba(211,210,211,.55)');smoke.addColorStop(1,'rgba(175,190,194,0)');ctx.fillStyle=smoke;ctx.fillRect(0,h*.52,w,h*.48);
        }
        rocket(w*.48,h*.69-progress*h*.82,1.75,launch?1:0);
      }else{
        ctx.fillStyle=gradient(0,h,[[0,'#020714'],[1,'#102b47']]);ctx.fillRect(0,0,w,h);
        for(let i=0;i<120;i++){const x=(i*173+71)%w,y=(i*109+23)%(h*.72);ctx.fillStyle=i%7?'#91b7d1':'#fff';ctx.fillRect(x,y,i%7?1:2,i%7?1:2);}
        ctx.beginPath();ctx.ellipse(w*.54,h*1.16,w*.86,h*.55,0,0,Math.PI*2);
        ctx.fillStyle=gradient(h*.62,h,[[0,'#79c7ea'],[.18,'#236e9d'],[1,'#082540']]);ctx.fill();
        ctx.strokeStyle='#a7e4ff';ctx.lineWidth=4;ctx.stroke();
        rocket(w*.52,h*.42,.78,0);
      }
      const label=t<.22?'VERIFICACIÓN DE SISTEMAS':t<.32?'CUENTA REGRESIVA':t<.74?'DESPEGUE SIMULADO':'ASCENSO · VISTA ORBITAL';
      if(label!==lastPhase){phase.textContent=label;lastPhase=label;}
      if(t>=1){finish();return;}
      frameId=requestAnimationFrame(draw);
    }
    frameId=requestAnimationFrame(draw);
  });
}
