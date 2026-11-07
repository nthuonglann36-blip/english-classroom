/* The teacher's Unit 4 Language activities: sequential checks and shared timers. */
(() => {
  'use strict';
  const deck=document.querySelector('.language-refresh .deck');
  if(!deck)return;
  const sortStates=new Map(),timers=new Map();
  let ticker=null;
  for(const activity of deck.querySelectorAll('[data-sort-activity]')){
    sortStates.set(activity,{next:0,words:[...activity.querySelectorAll('[data-sort-bank]')]});
  }
  function renderSort(activity){
    const state=sortStates.get(activity),done=state.next===state.words.length;
    activity.querySelector('.sort-bank').hidden=done;
    activity.querySelector('.sort-status').textContent=`${state.next} / ${state.words.length} checked`;
    activity.querySelector('[data-sort-action="next"]').disabled=done;
    activity.querySelector('[data-sort-action="all"]').disabled=done;
    activity.querySelector('[data-sort-action="reset"]').disabled=state.next===0;
  }
  function checkWord(activity,update=true){
    const state=sortStates.get(activity);if(!state||state.next>=state.words.length)return;
    const word=state.words[state.next++];word.hidden=true;word.closest('.sort-slot').hidden=true;
    activity.querySelector(`[data-sort-answer="${word.dataset.sortBank}"]`).hidden=false;
    if(update)renderSort(activity);
  }
  function checkAll(activity){
    const state=sortStates.get(activity);while(state.next<state.words.length)checkWord(activity,false);
    renderSort(activity);
  }
  function resetSort(activity){
    const state=sortStates.get(activity);state.next=0;state.words.forEach(word=>{word.hidden=false;word.closest('.sort-slot').hidden=false;});
    activity.querySelectorAll('[data-sort-answer]').forEach(answer=>answer.hidden=true);
    renderSort(activity);
  }
  for(const widget of deck.querySelectorAll('[data-class-timer]')){
    const key=widget.dataset.classTimer,duration=Number(widget.dataset.duration);
    if(!timers.has(key))timers.set(key,{duration,remaining:duration,running:false,deadline:null,widgets:[]});
    timers.get(key).widgets.push(widget);
  }
  const format=seconds=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
  function paintTimer(timer){
    for(const widget of timer.widgets){
      widget.querySelector('.timer-display').textContent=format(timer.remaining);
      widget.querySelector('.timer-progress').value=timer.remaining;
      const button=widget.querySelector('[data-timer-action="toggle"]');
      button.textContent=timer.running?'Pause':timer.remaining===timer.duration?'Start':'Resume';
      button.disabled=timer.remaining===0;
      widget.querySelector('.timer-alert').textContent=timer.remaining===0?'Time’s up. Check together.':'';
      widget.classList.toggle('timer-expired',timer.remaining===0);
    }
  }
  function stopTickerIfIdle(){if(ticker!==null&&![...timers.values()].some(timer=>timer.running)){clearInterval(ticker);ticker=null;}}
  function sample(timer){
    if(!timer.running)return;
    timer.remaining=Math.max(0,Math.ceil((timer.deadline-performance.now())/1000));
    if(timer.remaining===0){timer.running=false;timer.deadline=null;}
  }
  function pauseTimer(timer){sample(timer);timer.running=false;timer.deadline=null;paintTimer(timer);stopTickerIfIdle();}
  function startTimer(timer){
    if(timer.running||timer.remaining<=0)return;
    for(const other of timers.values())if(other!==timer&&other.running)pauseTimer(other);
    timer.running=true;timer.deadline=performance.now()+timer.remaining*1000;paintTimer(timer);
    if(ticker===null)ticker=setInterval(()=>{
      for(const current of timers.values())if(current.running){sample(current);paintTimer(current);}
      stopTickerIfIdle();
    },250);
  }
  function resetTimer(timer){timer.running=false;timer.deadline=null;timer.remaining=timer.duration;paintTimer(timer);stopTickerIfIdle();}
  function pauseHiddenTimers(){
    const active=deck.querySelector('.slide.is-current [data-class-timer]')?.dataset.classTimer;
    for(const [key,timer] of timers)if(timer.running&&(document.hidden||key!==active))pauseTimer(timer);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest?.('button');if(!button)return;
    if(button.hasAttribute('data-sort-action')){
      const activity=button.closest('[data-sort-activity]');if(!activity)return;
      if(button.dataset.sortAction==='next')checkWord(activity);
      else if(button.dataset.sortAction==='all')checkAll(activity);
      else if(button.dataset.sortAction==='reset')resetSort(activity);
    }else if(button.hasAttribute('data-timer-action')){
      const widget=button.closest('[data-class-timer]'),timer=timers.get(widget?.dataset.classTimer);
      if(!timer)return;
      if(button.dataset.timerAction==='reset')resetTimer(timer);
      else if(timer.running)pauseTimer(timer);else startTimer(timer);
    }
  });
  // Keep Space/Enter on buttons available for keyboard activation in this lesson.
  document.addEventListener('keydown',event=>{
    const target=event.target instanceof Element?event.target:null;
    if(!target||event.ctrlKey||event.altKey||event.metaKey)return;
    if([' ','Enter'].includes(event.key)&&target.closest('button')){event.stopPropagation();return;}
    if(['a','A'].includes(event.key)&&!target.closest('input,textarea,select,[contenteditable]')){
      const activity=deck.querySelector('.slide.is-current [data-sort-activity]');
      if(activity){event.preventDefault();event.stopImmediatePropagation();checkAll(activity);}
    }
  },true);
  const observer=new MutationObserver(pauseHiddenTimers);
  deck.querySelectorAll(':scope > .slide').forEach(slide=>observer.observe(slide,{attributes:true,attributeFilter:['class']}));
  document.addEventListener('visibilitychange',pauseHiddenTimers);
  window.addEventListener('pagehide',()=>{for(const timer of timers.values())if(timer.running)pauseTimer(timer);});
  sortStates.forEach((_,activity)=>renderSort(activity));timers.forEach(paintTimer);
})();
