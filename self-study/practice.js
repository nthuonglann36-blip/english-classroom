(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const unitNumber = Object.hasOwn(window.STUDY_CONTENT, params.get('unit')) ? params.get('unit') : '1';
  const skillNames = {listening:'Listening', writing:'Writing', pronunciation:'Pronunciation'};
  const skill = 'pronunciation';
  const unit = window.STUDY_CONTENT[unitNumber];
  const root = document.getElementById('practice');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url = (number, name) => name === 'listening' ? `listening.html?grade=10&unit=${number}` : name === 'writing' || String(number)==='3' ? `skills.html?grade=10&unit=${number}&skill=${name}` : `practice.html?unit=${number}&skill=${name}`;
  if (params.get('unit')==='3') {location.replace(url('3', params.get('skill') || 'pronunciation'));return;}
  const normalize = value => String(value).normalize('NFKC').trim().toLowerCase().replace(/[.!?,;:]+$/g, '').trim();
  const descriptions = {
    pronunciation:'Listen closely, identify the starting sounds and practise short sentences aloud.',
  };
  document.title = `Unit ${unitNumber} · ${skillNames[skill]} — English Classroom`;
  document.getElementById('unit-label').textContent = `Grade 10 · Unit ${unitNumber} · ${unit.title}`;
  document.getElementById('page-title').textContent = `${skillNames[skill]} practice`;
  document.getElementById('page-description').textContent = descriptions[skill];
  document.getElementById('back-link').href = `index.html#${unitNumber === '1' ? 'activities' : 'unit2'}`;
  document.getElementById('unit-switch').innerHTML = ['1','2','3'].map(n => `<a href="${url(n,skill)}" ${n===unitNumber?'aria-current="page"':''}>Unit ${n}</a>`).join('');
  document.getElementById('skill-tabs').innerHTML = Object.entries(skillNames).map(([key,name])=>`<a href="${url(unitNumber,key)}" ${key===skill?'aria-current="page"':''}>${name}</a>`).join('');

  if (['writing','listening'].includes(params.get('skill'))) {
    location.replace(url(unitNumber,params.get('skill')));return;
  }

  const quizzes = new Map();
  function quizMarkup(id, questions) {
    quizzes.set(id, questions);
    return `<form class="quiz" id="${id}" novalidate>${questions.map((q,index)=>{
      const name = `${id}-q${index}`;
      const content = q.kind==='gap'
        ? `<label class="gap-label" for="${name}">Write one word (a number is also accepted for quantities).<input id="${name}" name="${name}" type="text" autocomplete="off" spellcheck="false" aria-describedby="${name}-feedback"></label>`
        : `${q.audio?`<div class="sound-question"><button type="button" class="listen-button" data-audio="${escape(q.audio)}" aria-label="Play word ${index+1}">▶ Play word ${index+1}</button></div>`:''}<div class="options">${q.options.map((option,i)=>`<label class="option" for="${name}-${i}"><input id="${name}-${i}" type="radio" name="${name}" value="${escape(option)}" aria-describedby="${name}-feedback"><span>${escape(option)}</span></label>`).join('')}</div>`;
      return `<fieldset class="question"><legend><span class="question-number">${index+1}.</span>${escape(q.prompt)}</legend>${content}<p id="${name}-feedback" class="answer-feedback hidden"></p></fieldset>`;
    }).join('')}<div class="quiz-actions"><button class="primary-button" type="submit">Check answers</button><button class="secondary-button" type="reset">Try again</button><p class="score" role="status" aria-live="polite"></p></div></form>`;
  }
  function bindQuizzes() {
    quizzes.forEach((questions,id)=>{
      const form=document.getElementById(id);
      form.addEventListener('submit',event=>{
        event.preventDefault();
        const data=new FormData(form);
        let score=0;
        questions.forEach((q,index)=>{
          const name=`${id}-q${index}`;
          const value=String(data.get(name)||'');
          const correct=(q.accepted||[q.answer]).some(a=>normalize(a)===normalize(value));
          if(correct) score++;
          const feedback=document.getElementById(`${name}-feedback`);
          feedback.className=`answer-feedback ${correct?'good':'improve'}`;
          feedback.textContent=`${correct?'Correct.':value?'Review this one.':'No answer yet.'} ${correct?'':`Answer: ${q.answer}. `}${q.explanation}`;
          form.querySelectorAll(`[name="${name}"]`).forEach(input=>input.setAttribute('aria-invalid',String(!correct)));
        });
        form.querySelector('.score').textContent=`${score} / ${questions.length} correct. ${score===questions.length?'Well done!':'Read the explanations, then try again.'}`;
      });
      form.addEventListener('reset',()=>{
        form.querySelectorAll('.answer-feedback').forEach(node=>{node.className='answer-feedback hidden';node.textContent='';});
        form.querySelectorAll('[aria-invalid]').forEach(node=>node.removeAttribute('aria-invalid'));
        form.querySelector('.score').textContent='';
      });
      form.addEventListener('input',()=>{
        if(form.querySelector('.score').textContent) {
          form.querySelector('.score').textContent='Answers changed. Check again for an updated score.';
          form.querySelectorAll('.answer-feedback').forEach(node=>node.className='answer-feedback hidden');
          form.querySelectorAll('[aria-invalid]').forEach(node=>node.removeAttribute('aria-invalid'));
        }
      });
    });
  }

  let clip;
  function stopClip(){if(clip){clip.pause();clip=null;}}
  document.addEventListener('play',event=>{
    if(event.target instanceof HTMLMediaElement){
      if(clip && clip!==event.target) stopClip();
      document.querySelectorAll('audio').forEach(audio=>{if(audio!==event.target)audio.pause();});
    }
  },true);
  root.addEventListener('click',async event=>{
    const button=event.target.closest('[data-audio]');
    if(!button)return;
    stopClip();
    clip=new Audio(button.dataset.audio);
    try{await clip.play();document.querySelectorAll('.audio-status').forEach(node=>node.textContent='');}
    catch{document.querySelectorAll('.audio-status').forEach(node=>node.textContent='Audio could not play. Check your connection and try again.');}
  });
  window.addEventListener('pagehide',stopClip);

    const options=unit.sounds.map(group=>group.blend);
    const questions=unit.sounds.flatMap(group=>group.items.map(item=>({kind:'choice',prompt:'Listen. Which sound group starts the word?',audio:item.audio,options,answer:group.blend,explanation:`You heard “${item.word}”. Its beginning sound is ${group.blend}.`})))
      .map((q,index,array)=>array[(index*5)%array.length]);
    root.innerHTML=`<section class="practice-panel"><p class="step-label">1 · Sound guide</p><h2>Keep the sounds together</h2><p class="panel-intro">Listen to the example words. Say each beginning as one smooth blend, without adding an extra vowel between the consonants.</p><div class="sound-guides">${unit.sounds.map(group=>`<div class="sound-guide"><h3>${escape(group.blend)}</h3><p>${escape(group.tip)}</p><div class="word-list">${group.items.map(item=>`<button type="button" class="listen-button" data-audio="${escape(item.audio)}" aria-label="Listen to ${escape(item.word)}">▶ ${escape(item.word)}</button>`).join('')}</div></div>`).join('')}</div></section><section class="practice-panel"><p class="step-label">2 · Listen and identify</p><h2>Which beginning do you hear?</h2><p class="panel-intro">Play each word, then choose its starting sound.</p>${quizMarkup('sound-check',questions)}</section><section class="practice-panel"><p class="step-label">3 · Listen and repeat</p><h2>Bring the sounds into sentences</h2><p class="panel-intro">Listen once, pause and repeat. Then read the sentence without the recording. Focus on the consonant blends.</p>${unit.reading.map((item,index)=>`<div class="sentence-row"><p>${index+1}. ${escape(item.text)}</p><button class="listen-button" type="button" data-audio="${escape(item.audio)}">▶ Listen to sentence ${index+1}</button></div>`).join('')}</section><p class="audio-status" role="status"></p><p class="audio-note">Computer-generated practice audio · American English</p>`;
  bindQuizzes();
})();
