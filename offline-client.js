(() => {
  'use strict';
  if (window.EC_OFFLINE_READY) return;
  const root = new URL('./', document.currentScript.src);
  const supported = 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1');
  window.EC_OFFLINE_ROOT = root.href;
  window.EC_OFFLINE_READY = supported ? (async()=>{
    const existing=await navigator.serviceWorker.getRegistration(root.href);
    if(existing?.active&&existing.scope===root.href){
      if(navigator.onLine)existing.update().catch(()=>{});
      return existing;
    }
    const registration=await navigator.serviceWorker.register(new URL('sw.js',root),{scope:root.pathname,updateViaCache:'none'});
    await navigator.serviceWorker.ready;return registration;
  })() : Promise.resolve(null);
  // A failed install must not prevent the existing online lessons from opening.
  window.EC_OFFLINE_READY.catch(() => {});
  window.addEventListener('beforeinstallprompt',event => {event.preventDefault();window.EC_INSTALL_PROMPT=event;window.dispatchEvent(new Event('ec-install-ready'));});

  function requiresInternet(event) {
    if (navigator.onLine) return;
    const trigger=event.target.closest('a[href], [data-load-video], .video-play');
    if (!trigger) return;
    const href=trigger.getAttribute('href');
    if (href) {
      const url=new URL(href,document.baseURI);
      if (!/^https?:$/.test(url.protocol) || url.origin===location.origin) return;
    }
    event.preventDefault();event.stopImmediatePropagation();
    let note=document.getElementById('ec-internet-needed');
    if (!note) {
      note=document.createElement('div');note.id='ec-internet-needed';note.setAttribute('role','alert');
      note.style.cssText='position:fixed;bottom:18px;left:50%;transform:translateX(-50%);z-index:2147483647;max-width:calc(100% - 28px);width:470px;padding:16px 19px;border-radius:12px;background:#fbf7ee;color:#14264d;border:1px solid #cbbba0;box-shadow:0 6px 30px #0003;font:14px/1.6 system-ui,sans-serif;';
      const text=document.createElement('p');text.textContent='Phần này cần Internet. Bạn vẫn có thể tiếp tục làm các bài đã lưu trên thiết bị.';
      const close=document.createElement('button');close.type='button';close.textContent='Đã hiểu';close.style.cssText='min-height:44px;margin-top:9px;padding:7px 15px;border:1px solid #b8406a;border-radius:8px;background:white;color:#963452;font:600 14px system-ui,sans-serif;';
      close.addEventListener('click',()=>note.remove());note.append(text,close);document.body.appendChild(note);close.focus();
    }
  }
  document.addEventListener('click',requiresInternet,true);
})();
