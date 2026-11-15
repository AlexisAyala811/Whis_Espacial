function line(tag, text) { const el=document.createElement(tag);el.textContent=text;return el; }
function link(url, label) { const a=line('a',label);a.href=url;a.target='_blank';a.rel='noopener noreferrer';return a; }
function formatUTC(value) {
  const date=new Date(value);
  return Number.isNaN(date.getTime())?"Date unavailable":new Intl.DateTimeFormat('en', {dateStyle:'medium',timeStyle:'short',timeZone:'UTC'}).format(date)+' UTC';
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
  container.replaceChildren(line('strong','NASA DONKI · observed solar activity'),line('p',"Checking the last 30 days…"));
  solarData().then(data=>{
    const detail=data.latest
      ? `Latest recorded flare: class ${data.latest.classType ?? "not provided"}; start ${formatUTC(data.latest.beginTime)}${data.latest.peakTime?"; peak "+formatUTC(data.latest.peakTime):''}.`
      : "No flares recorded in the requested period.";
    container.replaceChildren(line('strong','NASA DONKI · observed solar activity'),
      line('p',`${detail} ${data.count} records between ${data.startDate} and ${data.endDate} (UTC). Retrieved: ${formatUTC(data.retrievedAt)}.`),
      line('p',"The exercise alert and game resources are simulated. An observed flare alone does not confirm danger to the crew."),
      link(data.sourceUrl,"View NASA source ↗"));
    if(Array.isArray(data.daily) && data.daily.length){
      const chart=document.createElement('div');chart.className='solar-chart';
      chart.setAttribute('role','img');chart.setAttribute('aria-label',"Solar flares per day, from NASA DONKI. "+data.daily.map(item=>`${item.day}: ${item.count}`).join('; '));
      const max=Math.max(...data.daily.map(item=>item.count),1);
      for(const item of data.daily){
        const bar=document.createElement('span');bar.style.height=Math.max(8,item.count/max*100)+'%';
        bar.title=`${item.day}: ${item.count} flares`;chart.append(bar);
      }
      container.append(line('p',"Activity by day with records (UTC)"),chart);
    }
  }).catch(()=>container.replaceChildren(line('strong',"NASA DONKI · data unavailable"),line('p',"NASA could not be reached. Training continues with the simulated scenario."),link('https://ccmc.gsfc.nasa.gov/tools/DONKI/','View NASA ↗')));
}
export function showApod(container) {
  container.replaceChildren(line('strong',"NASA APOD · astronomy picture of the day"),line('p','Contacting NASA…'));
  apodData().then(data=>{
    container.replaceChildren(line('strong',"NASA APOD · astronomy picture of the day"),line('p',`${data.date} · ${data.title}. Retrieved: ${formatUTC(data.retrievedAt)}.`));
    if(data.imageUrl){
      const image=document.createElement('img');image.src=data.imageUrl;image.alt=`Astronomy image: ${data.title}`;image.className='nasa-apod-image';image.loading='lazy';image.referrerPolicy='no-referrer';
      image.addEventListener('error',()=>{image.remove();container.append(line('p',"The image could not be loaded. You can view it at NASA."));});container.append(image);
    }
    container.append(line('p',data.credit ? `Credits: ${data.credit}` : "For credits and usage terms, see NASA’s page."),link(data.sourceUrl,"View content and credits at NASA ↗"));
  })
    .catch(()=>container.replaceChildren(line('strong',"NASA APOD · data unavailable"),line('p',"NASA could not be reached."),link('https://apod.nasa.gov/apod/',"Open NASA APOD ↗")));
}
