(() => {
  'use strict';
  const manifest=window.EC_OFFLINE_MANIFEST;
  const root=new URL('./',document.currentScript.src);
  const list=document.getElementById('pack-list'),message=document.getElementById('offline-message');
  const progress=document.getElementById('download-progress');
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const size=bytes=>`${(bytes/1024/1024).toFixed(bytes<1048576?2:1)} MB`;
  const messages={cancelled:'Đã dừng lưu. Bộ bài chưa lưu xong sẽ không được đánh dấu sẵn sàng.',quota:'Thiết bị không còn đủ dung lượng. Xóa bớt bộ Offline rồi thử lại.',network:'Chưa lưu xong. Kiểm tra kết nối Internet rồi thử lại; bản lưu đầy đủ trước đó vẫn được giữ.',changed:'Website vừa cập nhật. Tải lại trang rồi lưu lại bộ bài.',busy:'Một bộ bài khác đang được lưu. Hãy đợi lưu xong hoặc bấm Dừng lưu.',unavailable:'Bộ bài này chưa có. Tải lại trang để xem danh sách mới.'};
  let registration,state={packs:{}},ready=false,current=null;
  if(document.querySelector('meta[name="ec-offline-fallback"]'))document.getElementById('page-not-saved').hidden=false;
  function say(text,error=false){message.textContent=text;message.classList.toggle('error',error);}
  function rpc(action,id,onProgress){
    return new Promise((resolve,reject)=>{
      const worker=navigator.serviceWorker.controller||registration?.active;
      if(!worker){reject(new Error('unavailable'));return;}
      const channel=new MessageChannel();
      const timer=action==='SAVE'?null:setTimeout(()=>{channel.port1.close();reject(new Error('network'));},20000);
      channel.port1.onmessage=event=>{
        if(event.data.type==='progress'){onProgress?.(event.data);return;}
        if(timer)clearTimeout(timer);channel.port1.close();
        if(event.data.type==='error')reject(new Error(event.data.code));else resolve(event.data.value);
      };
      worker.postMessage({action,id},[channel.port2]);
    });
  }
  function render(){
    let count=0,total=0;
    for(const saved of Object.values(state.packs)){count++;total+=saved.bytes;}
    document.getElementById('saved-summary').textContent=`${count} bộ đã lưu · ${size(total)}`;
    const groups=[['Tự học','self-study'],['Bài giảng lớp 10','10'],['Bài giảng lớp 11','11']];
    list.innerHTML=groups.map(([title,group])=>`<section class="pack-group"><h3>${title}</h3><div class="pack-grid">${manifest.packs.filter(p=>p.group===group).map(pack=>{
      const saved=state.packs[pack.id],update=saved&&saved.revision!==pack.revision;
      const status=saved?(update?'Đã có bản lưu · Có cập nhật mới':'Đã lưu đầy đủ'):'Chưa lưu trên thiết bị này';
      return `<article class="pack-card" data-pack="${pack.id}"><h4>${escape(pack.title)}</h4><p>${escape(pack.description)}</p><span class="pack-size">Khoảng ${size(pack.bytes)}</span><p class="pack-state">${status}</p><div class="pack-actions"><button class="primary-button" data-save="${pack.id}" ${!ready||!navigator.onLine||current||(saved&&!update)?'disabled':''}>${saved?(update?'Cập nhật bản lưu':'Đã lưu'):'Lưu trên thiết bị này'}</button>${saved?`<a href="${escape(new URL(pack.start,root).href)}">Mở bài đã lưu →</a><button class="remove-pack" data-remove="${pack.id}" ${current?'disabled':''}>Xóa bản lưu</button>`:''}</div></article>`;
    }).join('')}</div></section>`).join('');
  }
  function connection(){
    const node=document.getElementById('connection');node.textContent=navigator.onLine?'Thiết bị đang có kết nối mạng':'Đang offline';node.classList.toggle('is-offline',!navigator.onLine);render();
  }
  async function refresh(){
    state=await rpc('STATUS');ready=state.coreReady&&state.version===manifest.version;
    if(state.version!==manifest.version){say('Đang cập nhật chế độ Offline. Đợi một lát rồi tải lại trang.');registration.update().catch(()=>{});}
    render();return state;
  }
  list.addEventListener('click',async event=>{
    const save=event.target.closest('[data-save]'),remove=event.target.closest('[data-remove]');
    if(save&&!current){
      const id=save.dataset.save,pack=manifest.packs.find(p=>p.id===id);current=id;render();progress.hidden=false;
      document.getElementById('download-title').textContent=`Đang lưu · ${pack.title}`;
      document.getElementById('download-detail').textContent='Đang chuẩn bị…';document.getElementById('download-meter').value=0;
      try{
        await rpc('SAVE',id,data=>{document.getElementById('download-detail').textContent=`${data.done} / ${data.total} tệp · ${size(data.bytes)} / ${size(data.totalBytes)}`;document.getElementById('download-meter').value=data.total?100*data.done/data.total:100;});
        say(`Đã lưu đầy đủ: ${pack.title}. Bạn có thể mở bộ bài này khi mất mạng.`);
      }catch(error){say(messages[error.message]||messages.network,true);}
      finally{current=null;progress.hidden=true;await refresh().catch(()=>{});render();}
    }else if(remove&&!current){
      const id=remove.dataset.remove;
      if(!confirm('Xóa bộ bài Offline này khỏi thiết bị? Bản nháp Writing vẫn được giữ.'))return;
      try{await rpc('REMOVE',id);await refresh();say('Đã xóa bản lưu Offline trên thiết bị này.');}
      catch(error){say(messages[error.message]||messages.network,true);}
    }
  });
  document.getElementById('cancel-save').addEventListener('click',()=>{if(current)rpc('CANCEL',current).catch(()=>{});});
  window.addEventListener('online',()=>{connection();refresh().catch(()=>{});});window.addEventListener('offline',connection);
  if('serviceWorker' in navigator)navigator.serviceWorker.addEventListener('controllerchange',()=>{refresh().then(()=>{if(ready&&!current)say('Chế độ Offline đã sẵn sàng. Chọn bộ bài cần lưu hoặc mở một bộ đã lưu đầy đủ.');}).catch(()=>{});});
  const install=document.getElementById('install-app');
  function installReady(){install.hidden=!window.EC_INSTALL_PROMPT;}
  window.addEventListener('ec-install-ready',installReady);installReady();
  install.addEventListener('click',async()=>{const prompt=window.EC_INSTALL_PROMPT;if(!prompt)return;await prompt.prompt();await prompt.userChoice;window.EC_INSTALL_PROMPT=null;installReady();});
  connection();
  (async()=>{
    try{
      registration=await window.EC_OFFLINE_READY;
      if(!registration){say('Trình duyệt này chưa hỗ trợ lưu Offline tại địa chỉ hiện tại. Mở website GitHub Pages bằng Chrome, Edge hoặc Safari mới để lưu bài.',true);return;}
      await refresh();
      if(!state.coreReady&&navigator.onLine){say('Đang chuẩn bị chế độ Offline…');state=await rpc('PREPARE');ready=state.version===manifest.version&&state.coreReady;render();}
      if(ready)say(navigator.onLine?'Chọn các bộ bài cần dùng. Giữ trang mở đến khi báo đã lưu đầy đủ.':'Bạn có thể mở các bộ đã lưu đầy đủ. Kết nối Internet để lưu thêm bộ mới.');
    }catch{say('Chưa chuẩn bị được chế độ Offline. Khi có Internet, tải lại trang và thử lại.',true);}
  })();
})();
