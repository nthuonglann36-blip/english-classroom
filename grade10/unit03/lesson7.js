(function () {
 'use strict';
 document.querySelectorAll('.l7-round').forEach(function(round){
  var buttons=Array.from(round.querySelectorAll('[data-choice]')),key=Number(round.dataset.correct),selected=null;
  var feedback=round.querySelector('.l7-feedback'),check=round.querySelector('.l7-check'),retry=round.querySelector('.l7-retry'),selection=round.querySelector('.l7-selection');
  buttons.forEach(function(button,i){button.addEventListener('click',function(){selected=i;buttons.forEach(function(b,j){b.setAttribute('aria-pressed',String(i===j));});selection.textContent='Your choice: '+button.textContent;});});
  check.addEventListener('click',function(){
   buttons.forEach(function(b,i){b.disabled=true;b.classList.toggle('is-correct',i===key);b.classList.toggle('is-wrong',i===selected&&i!==key);});
   feedback.textContent=(selected===null?'Answer: ':selected===key?'Correct! ':'Answer: ')+buttons[key].textContent.trim();feedback.hidden=false;selection.hidden=true;check.hidden=true;retry.hidden=false;
  });
  retry.addEventListener('click',function(){selected=null;buttons.forEach(function(b){b.disabled=false;b.setAttribute('aria-pressed','false');b.classList.remove('is-correct','is-wrong');});feedback.hidden=true;retry.hidden=true;check.hidden=false;selection.hidden=false;selection.textContent='Choose an answer.';});
 });
 var phrases=[['Sounds great.','accept'],['Shall we…?','make'],['I really want to…, but…','refuse'],['Let’s…','make'],['I’m afraid I’m busy then.','refuse'],['Why don’t we…?','make'],['That’s a good idea.','accept'],['I don’t feel like it.','refuse'],['Sure, why not?','accept'],['How about…?','make'],['Sorry, I can’t.','refuse'],['Yes, I’d love to.','accept']];
 var index=0,score=0,sort=document.getElementById('l7-sort'),p=document.getElementById('l7-phrase'),progress=document.getElementById('l7-sort-progress'),fb=document.getElementById('l7-sort-feedback'),next=document.getElementById('l7-sort-next'),reset=document.getElementById('l7-sort-reset'),buttons=Array.from(sort.querySelectorAll('[data-category]'));
 var labels={make:'Make a suggestion',accept:'Accept',refuse:'Refuse'};
 function render(){p.textContent=phrases[index][0];progress.textContent='Phrase '+(index+1)+' / 12';fb.textContent='';next.hidden=true;reset.hidden=true;buttons.forEach(function(b){b.hidden=false;b.disabled=false;b.setAttribute('aria-pressed','false');});}
 buttons.forEach(function(b){b.addEventListener('click',function(){var correct=b.dataset.category===phrases[index][1];if(correct)score++;buttons.forEach(function(x){x.disabled=true;});b.setAttribute('aria-pressed','true');fb.textContent=(correct?'Correct! ':'Answer: ')+labels[phrases[index][1]]+'.';next.hidden=false;next.textContent=index===11?'See result':'Next phrase →';});});
 next.addEventListener('click',function(){if(index<11){index++;render();}else{progress.textContent='All 12 phrases completed';p.textContent=score+' / 12 correct';fb.textContent='Use the next slides to review all three groups.';buttons.forEach(function(b){b.hidden=true;});next.hidden=true;reset.hidden=false;}});
 reset.addEventListener('click',function(){index=0;score=0;render();});render();
 // Native controls keep their keyboard actions; deck arrows still work elsewhere.
 document.addEventListener('keydown',function(ev){if(!ev.ctrlKey&&!ev.altKey&&!ev.metaKey&&(ev.key==='a'||ev.key==='A')){var check=document.querySelector('.slide.is-current .l7-check:not([hidden])');if(check){ev.preventDefault();ev.stopImmediatePropagation();check.click();return;}}if((ev.key===' '||ev.key.startsWith('Arrow'))&&ev.target.closest('button,audio,video,select'))ev.stopImmediatePropagation();},true);
 function pauseHidden(){document.querySelectorAll('.slide:not(.is-current) audio,.slide:not(.is-current) video').forEach(function(m){m.pause();});document.querySelectorAll('.slide:not(.is-current) iframe.game').forEach(function(frame){frame.contentWindow.postMessage({ecLesson7:'pause'},'*');});}
 new MutationObserver(pauseHidden).observe(document.querySelector('.deck'),{subtree:true,attributes:true,attributeFilter:['class']});
 document.addEventListener('play',function(ev){document.querySelectorAll('audio,video').forEach(function(m){if(m!==ev.target)m.pause();});},true);
 document.addEventListener('visibilitychange',function(){if(document.hidden){document.querySelectorAll('audio,video').forEach(function(m){m.pause();});var f=document.querySelector('iframe.game');if(f)f.contentWindow.postMessage({ecLesson7:'pause'},'*');}});
})();
