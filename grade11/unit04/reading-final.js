/* Click-driven FINAL lesson: launch embedded games and check headline categories. */
(() => {
 'use strict';
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('[data-next-game]');
  if(link&&link.closest('.slide')?.classList.contains('is-current')){event.preventDefault();document.querySelector('.deck-nav button:nth-child(2)')?.click();return;}
  const option=event.target.closest?.('[data-category-answer]');if(!option)return;
  if(option.dataset.categoryAnswer==='true'){
   option.classList.add('is-correct');const slide=option.closest('.slide');
   slide.querySelectorAll('.answer').forEach(el=>el.classList.add('is-open'));
   slide.querySelectorAll('.reveal').forEach(el=>el.setAttribute('aria-expanded','true'));
  }else option.disabled=true;
 });
 document.addEventListener('keydown',event=>{
  if(event.ctrlKey||event.altKey||event.metaKey)return;
  const target=event.target instanceof Element?event.target:null;
  if(target&&[' ','Enter'].includes(event.key)&&target.closest('button'))event.stopPropagation();
  if(target&&event.key===' '&&target.closest('.final-play')){event.preventDefault();event.stopImmediatePropagation();target.closest('.final-play').click();}
 },true);
})();
