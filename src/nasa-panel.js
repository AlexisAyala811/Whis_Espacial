function line(tag, text) { const el=document.createElement(tag);el.textContent=text;return el; }
function link(url, label) { const a=line('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a; }
function formatUTC(value) {
  const date=new Date(value);
  return Number.isNaN(date.getTime())?'Fecha no disponible':new Intl.DateTimeFormat('es', {dateStyle:'medium',timeStyle:'short',timeZone:'UTC'}).format(date)+' UTC';
}
async function read(path) {
  const response=await fetch(path,{signal:AbortSignal.timeout(21000)});
  if(!response.ok)throw new Error('unavailable');
  return response.json();
}
let solarRequest,apodRequest;
export function solarData() { return solarRequest ??= read('/api/nasa/solar').catch(error=>{solarRequest=null;throw error;}); }
export function apodData() { return apodRequest ??= read('/api/nasa/apod').catch(error=>{apodRequest=null;throw error;}); }
export function showSolar(container) {
  container.replaceChildren(line('strong','NASA DONKI · actividad solar observada'),line('p','Consultando los últimos 30 días…'));
  solarData().then(data=>{
    const detail=data.latest
      ? `Última erupción registrada: clase ${data.latest.classType ?? 'no indicada'}; inicio ${formatUTC(data.latest.beginTime)}${data.latest.peakTime?'; máximo '+formatUTC(data.latest.peakTime):''}.`
      : 'Sin erupciones registradas en el período consultado.';
    container.replaceChildren(line('strong','NASA DONKI · actividad solar observada'),
      line('p',`${detail} ${data.count} registros entre ${data.startDate} y ${data.endDate} (UTC). Consulta: ${formatUTC(data.retrievedAt)}.`),
      line('p','La alerta del ejercicio y los recursos del juego son simulados. Una erupción observada no confirma por sí sola un peligro para la tripulación.'),
      link(data.sourceUrl,'Consultar la fuente NASA ↗'));
    if(Array.isArray(data.daily) && data.daily.length){
      const chart=document.createElement('div');chart.className='solar-chart';
      chart.setAttribute('role','img');chart.setAttribute('aria-label','Erupciones solares por día, de NASA DONKI. '+data.daily.map(item=>`${item.day}: ${item.count}`).join('; '));
      const max=Math.max(...data.daily.map(item=>item.count),1);
      for(const item of data.daily){
        const bar=document.createElement('span');bar.style.height=Math.max(8,item.count/max*100)+'%';
        bar.title=`${item.day}: ${item.count} erupciones`;chart.append(bar);
      }
      container.append(line('p','Actividad por día con registros (UTC)'),chart);
    }
  }).catch(()=>container.replaceChildren(line('strong','NASA DONKI · datos no disponibles'),line('p','No se pudo consultar NASA en este momento. La actividad de entrenamiento continúa con su escenario simulado.'),link('https://ccmc.gsfc.nasa.gov/tools/DONKI/','Consultar NASA ↗')));
}
export function showApod(container) {
  container.replaceChildren(line('strong','NASA APOD · imagen astronómica del día'),line('p','Consultando NASA…'));
  apodData().then(data=>{
    container.replaceChildren(line('strong','NASA APOD · imagen astronómica del día'),line('p',`${data.date} · ${data.title}. Consulta: ${formatUTC(data.retrievedAt)}.`));
    if(data.imageUrl){
      const image=document.createElement('img');image.src=data.imageUrl;image.alt=`Imagen astronómica: ${data.title}`;image.className='nasa-apod-image';image.loading='lazy';image.referrerPolicy='no-referrer';
      image.addEventListener('error',()=>{image.remove();container.append(line('p','La imagen no se pudo cargar. Puedes verla en NASA.'));});container.append(image);
    }
    container.append(line('p',data.credit ? `Créditos: ${data.credit}` : 'Créditos y condiciones de uso: consulta la página de NASA.'),link(data.sourceUrl,'Ver contenido y créditos en NASA ↗'));
  })
    .catch(()=>container.replaceChildren(line('strong','NASA APOD · datos no disponibles'),line('p','No se pudo consultar NASA en este momento.'),link('https://apod.nasa.gov/apod/','Abrir NASA APOD ↗')));
}
