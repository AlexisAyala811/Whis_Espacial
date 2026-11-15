const DONKI_URL = 'https://ccmc.gsfc.nasa.gov/DONKI-API/get/FLR';
const APOD_URL = 'https://api.nasa.gov/planetary/apod';
const SOURCE = 'https://ccmc.gsfc.nasa.gov/tools/DONKI/';

// Only public, reduced records leave this server. Cache successful responses.
export function createNasaClient({ fetchImpl = fetch, now = () => new Date(), apiKey = () => process.env.NASA_API_KEY || 'DEMO_KEY' } = {}) {
  const cache = new Map(), inflight = new Map();
  async function cached(name, lifetime, load) {
    const time = now().getTime(), entry = cache.get(name);
    if (entry && time - entry.time < lifetime) return entry.value;
    if (inflight.has(name)) return inflight.get(name);
    const pending = (async () => {
      const value = await load(); cache.set(name, { time: now().getTime(), value }); return value;
    })();
    inflight.set(name, pending);
    try { return await pending; } finally { inflight.delete(name); }
  }
  async function request(url, retries = 0) {
    for (let attempt = 0; ; attempt++) {
      try {
        const response = await fetchImpl(url, { signal: AbortSignal.timeout(6000), headers: { Accept: 'application/json' } });
        if (response.ok) return response.json();
        if (response.status < 500 || attempt >= retries) throw new Error('NASA request failed');
      } catch (error) {
        if (error.message === 'NASA request failed' || attempt >= retries) throw error;
      }
    }
  }
  return {
    solar: () => cached('solar', 15 * 60 * 1000, async () => {
      const end = now(), start = new Date(end.getTime() - 30 * 86400000);
      const date = value => value.toISOString().slice(0, 10);
      const url = new URL(DONKI_URL);
      url.searchParams.set('startDate', date(start)); url.searchParams.set('endDate', date(end));
      const result = await request(url);
      if (!Array.isArray(result)) throw new Error('Invalid NASA response');
      const events = result.filter(event => event && typeof event.beginTime === 'string' && Number.isFinite(Date.parse(event.beginTime)))
        .map(event => ({ beginTime: event.beginTime, peakTime: typeof event.peakTime === 'string' && Number.isFinite(Date.parse(event.peakTime)) ? event.peakTime : null,
          classType: typeof event.classType === 'string' && /^[ABCMX]\d+(?:\.\d+)?$/i.test(event.classType) ? event.classType : null }))
        .sort((a,b) => Date.parse(b.beginTime) - Date.parse(a.beginTime));
      const daily = new Map();
      for (const event of events) {
        const day = new Date(event.beginTime).toISOString().slice(0,10);
        daily.set(day, (daily.get(day) ?? 0) + 1);
      }
      return { source:'NASA CCMC / DONKI', sourceUrl:SOURCE, retrievedAt:now().toISOString(), startDate:date(start), endDate:date(end), count:events.length, latest:events[0] ?? null,
        daily: [...daily].sort(([a],[b])=>a.localeCompare(b)).map(([day,count])=>({day,count})) };
    }),
    apod: () => cached('apod', 60 * 60 * 1000, async () => {
      const url = new URL(APOD_URL); url.searchParams.set('api_key', apiKey());
      const result = await request(url, 2);
      if (!result || typeof result.title !== 'string' || typeof result.date !== 'string') throw new Error('Invalid NASA response');
      let imageUrl = null;
      if(result.media_type === 'image' && typeof result.url === 'string'){
        try { const image = new URL(result.url);if(image.protocol==='https:' && (image.hostname==='nasa.gov' || image.hostname.endsWith('.nasa.gov')))imageUrl=image.href; } catch { /* Keep the official link instead. */ }
      }
      return { source:'NASA / APOD', sourceUrl:'https://apod.nasa.gov/apod/', retrievedAt:now().toISOString(), date:result.date, title:result.title,
        mediaType:result.media_type === 'image' ? 'image' : 'other', imageUrl,
        credit:typeof result.copyright === 'string' ? result.copyright.trim().slice(0,300) : null };
    }),
  };
}
