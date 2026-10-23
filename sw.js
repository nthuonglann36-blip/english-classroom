'use strict';
importScripts('offline-manifest.js');
const MANIFEST=self.EC_OFFLINE_MANIFEST;
const ROOT=self.registration.scope;
const PREFIX='ec-offline:'+encodeURIComponent(new URL(ROOT).pathname)+':';
const SHELL=PREFIX+'shell:'+MANIFEST.version;
const PACK_PREFIX=PREFIX+'pack:';
const RUNTIME=PREFIX+'recent:v1';
const MARKER=new URL('__offline__/complete.json',ROOT).href;
const KNOWN=new Set([...Object.keys(MANIFEST.files),...MANIFEST.core]);
let savedMemo=null, saveJob=null, coreJob=null;

function url(path){return new URL(path,ROOT).href;}
function canonical(request){const u=new URL(typeof request==='string'?request:request.url);u.search='';u.hash='';if(u.pathname.endsWith('/'))u.pathname+='index.html';return u.href;}
function failure(code){const e=new Error(code);e.code=code;return e;}
async function parallel(items,fn,limit=4,onError){
  let index=0,firstError;
  await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{
    while(!firstError&&index<items.length){const item=items[index++];try{await fn(item);}catch(error){if(!firstError){firstError=error;onError?.();}}}
  }));
  if(firstError)throw firstError;
}
async function checkedFetch(path,cache,signal){
  const controller=new AbortController();
  const abort=()=>controller.abort();
  if(signal?.aborted)throw failure('cancelled');
  signal?.addEventListener('abort',abort,{once:true});
  const timer=setTimeout(abort,(MANIFEST.files[path]?.bytes||0)>5*1024*1024?180000:45000);
  try{
    const response=await fetch(url(path),{cache:'reload',credentials:'same-origin',signal:controller.signal});
    if(response.status!==200 || response.type==='opaque')throw failure('network');
    const expected=MANIFEST.files[path]?.sha256;
    if(expected){
      const body=await response.clone().arrayBuffer();
      const digest=await crypto.subtle.digest('SHA-256',body);
      const actual=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
      if(actual!==expected)throw failure('changed');
    }
    if(signal?.aborted)throw failure('cancelled');
    await cache.put(url(path),response);
  }catch(error){
    if(signal?.aborted)throw failure('cancelled');
    if(error.name==='QuotaExceededError')throw failure('quota');
    throw error.code?error:failure('network');
  }finally{clearTimeout(timer);signal?.removeEventListener('abort',abort);}
}
async function coreReady(){
  const cache=await caches.open(SHELL);const keys=new Set((await cache.keys()).map(r=>r.url));
  return MANIFEST.core.every(p=>keys.has(url(p)));
}
async function ensureCore(){
  if(await coreReady())return;
  if(!coreJob)coreJob=(async()=>{
    await caches.delete(SHELL);const cache=await caches.open(SHELL);
    try{await parallel(MANIFEST.core,path=>checkedFetch(path,cache));}
    catch(error){await caches.delete(SHELL);throw error;}
  })().finally(()=>{coreJob=null;});
  await coreJob;
}
self.addEventListener('install',event=>event.waitUntil((async()=>{await ensureCore();await self.skipWaiting();})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const names=await caches.keys();
  await Promise.all(names.filter(n=>n.startsWith(PREFIX+'shell:')&&n!==SHELL).map(n=>caches.delete(n)));
  await self.clients.claim();
})()));

async function savedCaches(refresh=false){
  if(savedMemo&&!refresh)return savedMemo;
  const result=[];
  for(const name of await caches.keys()){
    if(!name.startsWith(PACK_PREFIX))continue;
    const cache=await caches.open(name);const marker=await cache.match(MARKER);
    if(!marker)continue;
    try{
      const meta=await marker.json();const keys=new Set((await cache.keys()).map(r=>r.url));
      if(Array.isArray(meta.files)&&meta.files.every(p=>keys.has(url(p))))result.push({name,meta});
    }catch{}
  }
  result.sort((a,b)=>b.meta.savedAt-a.meta.savedAt);savedMemo=result;return result;
}
async function status(){
  const packs={};
  for(const entry of await savedCaches(true))if(!packs[entry.meta.id])packs[entry.meta.id]=entry.meta;
  return {version:MANIFEST.version,coreReady:await coreReady(),packs,busy:saveJob?.id||null};
}
async function savePack(pack,port){
  if(saveJob)throw failure('busy');
  const job={id:pack.id,controller:new AbortController()};saveJob=job;
  const name=PACK_PREFIX+pack.id+':'+pack.revision;
  try{
    await ensureCore();
    const existing=(await savedCaches(true)).find(e=>e.name===name);
    if(existing)return existing.meta;
    await caches.delete(name);const cache=await caches.open(name);
    let done=0,bytes=0;
    try{
      await parallel(pack.files,async path=>{
        await checkedFetch(path,cache,job.controller.signal);done++;bytes+=MANIFEST.files[path]?.bytes||0;
        port.postMessage({type:'progress',done,total:pack.files.length,bytes,totalBytes:pack.bytes});
      },3,()=>job.controller.abort());
      const meta={id:pack.id,revision:pack.revision,savedAt:Date.now(),files:pack.files,bytes:pack.bytes};
      await cache.put(MARKER,new Response(JSON.stringify(meta),{headers:{'Content-Type':'application/json'}}));
      savedMemo=null;
      await Promise.all((await caches.keys()).filter(n=>n.startsWith(PACK_PREFIX+pack.id+':')&&n!==name).map(n=>caches.delete(n)));
      return meta;
    }catch(error){
      job.controller.abort();await caches.delete(name);savedMemo=null;throw error;
    }
  }finally{saveJob=null;}
}
self.addEventListener('message',event=>{
  const port=event.ports[0];if(!port || !event.source?.url?.startsWith(ROOT))return;
  event.waitUntil((async()=>{
    try{
      const {action,id}=event.data||{};const pack=MANIFEST.packs.find(p=>p.id===id);let value;
      if(action==='STATUS')value=await status();
      else if(action==='PREPARE'){await ensureCore();value=await status();}
      else if(action==='SAVE'&&pack)value=await savePack(pack,port);
      else if(action==='CANCEL'){if(saveJob&&saveJob.id===id)saveJob.controller.abort();value=true;}
      else if(action==='REMOVE'&&pack){
        if(saveJob)throw failure('busy');
        await Promise.all((await caches.keys()).filter(n=>n.startsWith(PACK_PREFIX+id+':')).map(n=>caches.delete(n)));savedMemo=null;value=true;
      }else throw failure('unavailable');
      port.postMessage({type:'done',value});
    }catch(error){port.postMessage({type:'error',code:error.code||'network'});}
    finally{port.close();}
  })());
});

async function cachedResponse(request){
  const key=canonical(request);
  const shell=await caches.open(SHELL);const basic=await shell.match(key);if(basic)return basic;
  for(const entry of await savedCaches()){
    const cache=await caches.open(entry.name);const response=await cache.match(key);if(response)return response;
  }
  return (await caches.open(RUNTIME)).match(key);
}
async function rangeResponse(request,response){
  const value=request.headers.get('Range');if(!value)return response;
  const data=await response.arrayBuffer(),length=data.byteLength;
  const m=/^bytes=(\d*)-(\d*)$/.exec(value);
  let start,end;
  if(m&&m[1]){start=Number(m[1]);end=m[2]?Math.min(Number(m[2]),length-1):length-1;}
  else if(m&&m[2]){start=Math.max(0,length-Number(m[2]));end=length-1;}
  if(!m || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start>end || start>=length)
    return new Response(null,{status:416,headers:{'Content-Range':`bytes */${length}`}});
  const headers=new Headers(response.headers);headers.delete('Content-Encoding');
  headers.set('Content-Range',`bytes ${start}-${end}/${length}`);headers.set('Content-Length',String(end-start+1));headers.set('Accept-Ranges','bytes');
  return new Response(data.slice(start,end+1),{status:206,statusText:'Partial Content',headers});
}
async function remember(request,response){
  const key=canonical(request),path=decodeURIComponent(new URL(key).pathname.slice(new URL(ROOT).pathname.length));
  if(response.status!==200 || !KNOWN.has(path) || /\.(mp3|mp4|webm|ogg)$/i.test(path) || (MANIFEST.files[path]?.bytes||0)>2000000)return;
  const cache=await caches.open(RUNTIME);await cache.put(key,response);
  const keys=await cache.keys();
  let bytes=keys.reduce((total,r)=>total+(MANIFEST.files[decodeURIComponent(new URL(r.url).pathname.slice(new URL(ROOT).pathname.length))]?.bytes||0),0);
  while(keys.length>120||bytes>20*1024*1024){const stale=keys.shift();bytes-=MANIFEST.files[decodeURIComponent(new URL(stale.url).pathname.slice(new URL(ROOT).pathname.length))]?.bytes||0;await cache.delete(stale);}
}
async function network(request){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),6000);
  try{return await fetch(new Request(request,{signal:controller.signal}));}finally{clearTimeout(timer);}
}
async function respond(event){
  const request=event.request;
  if(request.headers.has('Range')){
    const stored=await cachedResponse(request);
    if(stored?.status===200)return rangeResponse(request,stored);
  }
  try{
    const response=await network(request);
    event.waitUntil(remember(request,response.clone()).catch(()=>{}));return response;
  }catch{
    const stored=await cachedResponse(request);if(stored)return stored;
    if(request.mode==='navigate'){
      const fallback=await (await caches.open(SHELL)).match(url('offline.html'));
      if(fallback){
        const body=(await fallback.text()).replace('<head>',`<head><base href="${ROOT}"><meta name="ec-offline-fallback" content="true">`);
        return new Response(body,{status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}});
      }
    }
    return new Response('This item is not saved for offline use.',{status:503,headers:{'Content-Type':'text/plain; charset=utf-8'}});
  }
}
self.addEventListener('fetch',event=>{
  const request=event.request,u=new URL(request.url);
  if(request.method!=='GET'||u.origin!==location.origin||!u.href.startsWith(ROOT))return;
  event.respondWith(respond(event));
});
