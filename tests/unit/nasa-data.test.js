import test from 'node:test';
import assert from 'node:assert/strict';
import { createNasaClient } from '../../server/nasa-data.js';

test('DONKI requests a UTC date range, selects the most recent valid observation and caches it', async () => {
  let calls = 0, url;
  const client = createNasaClient({now:()=>new Date('2026-11-15T12:00:00Z'),fetchImpl:async value=>{
    calls++;url=new URL(value);return {ok:true,json:async()=>[
      {beginTime:'2026-11-02T12:00Z',peakTime:'2026-11-02T12:10Z',classType:'C1.2'},
      {beginTime:'2026-11-10T08:00Z',peakTime:'2026-11-10T08:10Z',classType:'M1.1'},
      {beginTime:'invalid',classType:'X1.0'},
    ]};
  }});
  const [a,b]=await Promise.all([client.solar(),client.solar()]);
  assert.equal(calls,1);assert.deepEqual(a,b);
  assert.equal(url.hostname,'ccmc.gsfc.nasa.gov');assert.equal(url.pathname,'/DONKI-API/get/FLR');
  assert.equal(url.searchParams.get('startDate'),'2026-10-16');assert.equal(url.searchParams.get('endDate'),'2026-11-15');
  assert.equal(a.count,2);assert.equal(a.latest.classType,'M1.1');assert.equal(a.latest.beginTime,'2026-11-10T08:00Z');
  assert.deepEqual(a.daily,[{day:'2026-11-02',count:1},{day:'2026-11-10',count:1}]);
});

test('empty DONKI and upstream errors are distinct, and errors do not poison the cache', async () => {
  let calls=0;
  const client=createNasaClient({fetchImpl:async()=>{calls++;return calls===1?{ok:false}:{ok:true,json:async()=>[]};}});
  await assert.rejects(client.solar());
  const data=await client.solar();assert.equal(data.count,0);assert.equal(data.latest,null);assert.equal(calls,2);
});

test('APOD uses a server key but never returns it to the client', async () => {
  let url;
  const client=createNasaClient({apiKey:()=> 'private-test-key',fetchImpl:async value=>{
    url=new URL(value);return {ok:true,json:async()=>({date:'2026-11-15',title:'NASA Science',media_type:'image',url:'https://apod.nasa.gov/apod/image/example.jpg',copyright:'Example'})};
  }});
  const data=await client.apod();
  assert.equal(url.searchParams.get('api_key'),'private-test-key');
  assert.equal(JSON.stringify(data).includes('private-test-key'),false);
  assert.equal(data.title,'NASA Science');
  assert.equal(data.imageUrl,'https://apod.nasa.gov/apod/image/example.jpg');assert.equal(data.credit,'Example');
});

test('APOD retries transient NASA server errors', async () => {
  let calls=0;
  const client=createNasaClient({fetchImpl:async()=>{
    calls++;
    return calls<3 ? {ok:false,status:500} : {ok:true,json:async()=>({date:'2026-11-15',title:'Recovered',media_type:'other'})};
  }});
  assert.equal((await client.apod()).title,'Recovered');
  assert.equal(calls,3);
});
