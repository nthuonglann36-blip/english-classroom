/* Controls scoped to this lesson; the uploaded games and shared deck stay unchanged. */
(() => {
 'use strict';
 const deck=document.querySelector('.u4-language-final .deck');if(!deck)return;
 const slides=[...deck.querySelectorAll(':scope > .slide')],select=document.getElementById('language-chapters');
 const mapDialog=document.getElementById('mindmap-dialog'),audioDialog=document.getElementById('language-audio');
 const maps=JSON.parse(document.getElementById('language-mindmaps').textContent),audio=[document.getElementById('track29'),document.getElementById('track30')];
 function syncChapter(){const n=slides.findIndex(s=>s.classList.contains('is-current'))+1;let value='1';for(const option of select.options)if(Number(option.value)<=n)value=option.value;select.value=value;}
 select.addEventListener('change',()=>{const target=Number(select.value)-1,current=slides.findIndex(s=>s.classList.contains('is-current'));const button=document.querySelectorAll('.deck-nav button')[target>current?1:0];if(button)for(let n=0;n<Math.abs(target-current);n++)button.click();syncChapter();});
 const observer=new MutationObserver(syncChapter);slides.forEach(s=>observer.observe(s,{attributes:true,attributeFilter:['class']}));syncChapter();
 function openBranch(map,branch){
  const data=maps[map]?.branches[branch];if(!data)return;
  document.getElementById('mindmap-title').textContent=data.title;const copy=document.getElementById('mindmap-copy');copy.replaceChildren();
  const definition=document.createElement('p');definition.className='map-dialog-definition';definition.textContent=data.definition;copy.appendChild(definition);
  const lines=document.createElement('div');lines.className='map-dialog-lines';data.lines.forEach(text=>{const p=document.createElement('p');p.textContent=text;lines.appendChild(p);});copy.appendChild(lines);mapDialog.showModal();
 }
 document.addEventListener('click',event=>{
  const node=event.target.closest?.('[data-map]');if(node){openBranch(Number(node.dataset.map),Number(node.dataset.branch));return;}
  if(event.target.closest?.('[data-close-map]'))mapDialog.close();
  if(event.target.closest?.('[data-close-audio]'))audioDialog.close();
  const trigger=event.target.closest?.('[data-open-audio],[data-play-audio]');
  if(trigger){if(!audioDialog.open)audioDialog.showModal();const id=trigger.dataset.playAudio;if(id){const track=document.getElementById(id);if(track){audio.forEach(other=>{if(other!==track)other.pause();});track.play().catch(()=>{});}}}
 });
 audio.forEach(track=>track.addEventListener('play',()=>audio.forEach(other=>{if(other!==track)other.pause();})));
 function pauseAudio(){audio.forEach(track=>track.pause());}
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseAudio();});window.addEventListener('pagehide',pauseAudio);
 document.addEventListener('keydown',event=>{
  if(mapDialog.open||audioDialog.open){
   if(event.key==='Escape'){event.preventDefault();(mapDialog.open?mapDialog:audioDialog).close();}
   event.stopImmediatePropagation();return;
  }
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(target.closest('select')||([' ','Enter'].includes(event.key)&&target.closest('button,a')))event.stopImmediatePropagation();
 },true);
})();
