(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const grade = params.get('grade') || '10';
  const number = params.get('unit') || '1';
  const root = document.getElementById('practice');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const content = Object.hasOwn(window.GRAMMAR_CONTENT, grade) ? window.GRAMMAR_CONTENT[grade] : null;
  const unit = content && Object.hasOwn(content.units, number) ? content.units[number] : null;
  if (!unit) {
    document.title = 'Grammar activity unavailable — English Classroom';
    document.getElementById('page-title').textContent = 'Grammar activity unavailable';
    document.getElementById('page-description').textContent = 'Choose Grade 10 or 11, Unit 1, 2 or 3 from Self-study.';
    root.innerHTML = '<p><a href="index.html">Return to Self-study</a>.</p>';
    return;
  }
  const grammarUrl = (g,n) => `grammar.html?grade=${g}&unit=${n}`;
  const pronunciationUrl = grade === '10' && number !== '3'
    ? `practice.html?unit=${number}&skill=pronunciation`
    : `skills.html?grade=${grade}&unit=${number}&skill=pronunciation`;
  document.title = `Grade ${grade} · Unit ${number} · Grammar — English Classroom`;
  document.getElementById('unit-label').textContent = `Grade ${grade} · Unit ${number} · ${unit.title}`;
  document.getElementById('page-description').textContent = `${unit.focus} · 18 topic-based questions. Check each activity when you are ready; explanations are in Vietnamese.`;
  document.getElementById('selfstudy-nav').href = `index.html#grade${grade}`;
  document.getElementById('back-link').href = `index.html#grade${grade}`;
  const lessons = document.getElementById('lessons-link');
  lessons.href = `../grade${grade}/index.html`;lessons.textContent = `Grade ${grade} lessons`;
  document.getElementById('grade-switch').innerHTML = ['10','11'].map(g => `<a href="${grammarUrl(g,number)}" ${g===grade?'aria-current="page"':''}>Grade ${g}</a>`).join('');
  document.getElementById('unit-switch').innerHTML = Object.entries(content.units).map(([n,u]) => `<a href="${grammarUrl(grade,n)}" ${n===number?'aria-current="page"':''}>Unit ${n} · ${escape(u.title)}</a>`).join('');
  document.getElementById('skill-tabs').innerHTML = `<a href="${grammarUrl(grade,number)}" aria-current="page">Grammar</a><a href="listening.html?grade=${grade}&amp;unit=${number}">Listening</a><a href="skills.html?grade=${grade}&amp;unit=${number}&amp;skill=writing">Writing</a><a href="${escape(pronunciationUrl)}">Pronunciation</a>`;
  function questionMarkup(q,index) {
    const id=q.id;
    const input = q.kind === 'choice'
      ? `<div class="options">${q.options.map((text,i) => `<label class="option" for="${id}-${i}"><input type="radio" id="${id}-${i}" name="${id}" value="${escape(text)}" aria-describedby="${id}-feedback"><span>${String.fromCharCode(65+i)}. ${escape(text)}</span></label>`).join('')}</div>`
      : `<label class="gap-label grammar-input" for="${id}">${q.kind==='correction'?'Corrected word(s)':'Missing word(s)'}<input type="text" id="${id}" name="${id}" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="${id}-feedback"></label>`;
    return `<fieldset class="question"><legend class="grammar-question"><span class="question-number">${index+1}.</span>${escape(q.prompt)}</legend>${input}<p class="answer-feedback" id="${id}-feedback" lang="vi" hidden></p></fieldset>`;
  }
  root.innerHTML = `<section class="practice-panel" id="grammar-guide" aria-labelledby="grammar-guide-title"><p class="step-label">Quick review</p><h2 id="grammar-guide-title">${escape(unit.focus)}</h2><div class="grammar-rules">${unit.rules.map(r=>`<article class="grammar-rule"><h3>${escape(r.title)}</h3><p class="grammar-form">${escape(r.form)}</p><p lang="vi">${escape(r.explanation)}</p><p class="grammar-example">${escape(r.example)}</p></article>`).join('')}</div><nav class="category-nav grammar-nav" aria-label="Grammar activities">${unit.activities.map((a,i)=>`<a href="#${a.id}">${i+1} · ${escape(a.title)} <span>${a.questions.length}</span></a>`).join('')}</nav><p class="grammar-note" lang="vi">Làm từng phần rồi bấm “Check answers”. Ô trống có thể cần nhiều hơn một từ. Đọc giải thích, bấm “Try again” và thử lại.</p></section>${unit.activities.map((a,i) => `<section class="practice-panel" id="${a.id}" aria-labelledby="${a.id}-title"><p class="step-label">Practice ${i+1} · ${a.questions.length} questions</p><h2 id="${a.id}-title">${escape(a.title)}</h2><p class="grammar-instruction">${escape(a.instruction)}</p><form class="quiz" id="${a.id}-quiz" novalidate>${a.questions.map(questionMarkup).join('')}<div class="quiz-actions"><button type="submit" class="primary-button">Check answers</button><button type="reset" class="secondary-button">Try again</button><p class="score" role="status" aria-live="polite"></p></div></form><a class="back-top" href="#grammar-guide">Back to the grammar guide ↑</a></section>`).join('')}`;

  // Normalise presentation differences only. Negatives, auxiliaries and verb endings remain significant.
  const normalize = text => String(text).normalize('NFKC').replace(/[‘’]/g,"'").toLowerCase().trim().replace(/\s+/g,' ').replace(/[.!?]+$/,'').trim();
  unit.activities.forEach(activity => {
    const form=document.getElementById(`${activity.id}-quiz`);
    const score=form.querySelector('.score');
    let checked=false;
    function clearFeedback() {
      form.querySelectorAll('.answer-feedback').forEach(node=>{node.hidden=true;node.textContent='';node.className='answer-feedback';});
      form.querySelectorAll('[aria-invalid]').forEach(node=>node.removeAttribute('aria-invalid'));
    }
    form.addEventListener('submit', event => {
      event.preventDefault();
      const answers=new FormData(form);
      let correctCount=0, unanswered=0;
      activity.questions.forEach(q => {
        const answer=String(answers.get(q.id)||'');
        const correct=(q.accepted||[q.answer]).some(expected=>normalize(answer)===normalize(expected));
        if(correct) correctCount++;
        if(!answer.trim()) unanswered++;
        const feedback=document.getElementById(`${q.id}-feedback`);
        feedback.hidden=false;
        feedback.className=`answer-feedback ${correct?'good':'improve'}`;
        feedback.textContent=`${correct?'Đúng.':answer.trim()?'Cần xem lại.':'Bạn chưa trả lời.'} Đáp án: ${q.answer}. ${q.explanation}`;
        form.querySelectorAll('input').forEach(input=>{if(input.name===q.id)input.setAttribute('aria-invalid',String(!correct));});
      });
      checked=true;
      score.textContent=`${correctCount} / ${activity.questions.length} correct.${unanswered?` ${unanswered} unanswered.`:''} ${correctCount===activity.questions.length?'Well done!':'Read the explanations, then try again.'}`;
    });
    form.addEventListener('input', () => {
      if(!checked)return;
      checked=false;
      clearFeedback();
      score.textContent='Answers changed. Check again for an updated score.';
    });
    form.addEventListener('reset', () => {
      checked=false;
      clearFeedback();
      score.textContent='';
    });
  });
})();
