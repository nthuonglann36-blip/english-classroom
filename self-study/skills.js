(() => {
  'use strict';
  const content = window.GRADE11_SKILLS;
  const params = new URLSearchParams(location.search);
  const root = document.getElementById('practice');
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  if (params.has('grade') && params.get('grade') !== String(content.grade)) {
    document.title = 'Activity unavailable — English Classroom';
    document.getElementById('page-title').textContent = 'Activity unavailable';
    root.innerHTML = '<p>Choose an available activity from <a href="index.html">Self-study</a>.</p>';
    return;
  }
  const number = Object.hasOwn(content.units, params.get('unit')) ? params.get('unit') : '1';
  const skill = params.get('skill') === 'pronunciation' ? 'pronunciation' : 'writing';
  const unit = content.units[number];
  const names = {listening:'Listening', writing:'Writing', pronunciation:'Pronunciation'};
  const url = (n, name) => name === 'listening'
    ? `listening.html?grade=11&unit=${n}`
    : `skills.html?grade=11&unit=${n}&skill=${name}`;
  document.title = `Grade 11 · Unit ${number} · ${names[skill]} — English Classroom`;
  document.getElementById('unit-label').textContent = `Grade 11 · Unit ${number} · ${unit.title}`;
  document.getElementById('page-title').textContent = `${names[skill]} practice`;
  document.getElementById('page-description').textContent = skill === 'writing'
    ? 'Plan your ideas, write a draft and use guided ChatGPT feedback to help you revise.'
    : 'Listen to the lesson recordings, practise the pattern and read the new examples aloud.';
  document.getElementById('unit-switch').innerHTML = Object.keys(content.units).map(n => `<a href="${escape(url(n,skill))}" ${n === number ? 'aria-current="page"' : ''}>Unit ${n} · ${escape(content.units[n].title)}</a>`).join('');
  document.getElementById('skill-tabs').innerHTML = Object.entries(names).map(([key,name]) => `<a href="${escape(url(number,key))}" ${key === skill ? 'aria-current="page"' : ''}>${name}</a>`).join('');

  if (skill === 'writing') {
    const task = unit.writing;
    root.innerHTML = `<section class="practice-panel"><p class="step-label">1 · Plan your ideas</p><h2>${escape(task.title)}</h2><p class="writing-task" id="writing-task">${escape(task.task)}</p><p class="task-source">${escape(task.source_label)} · ${task.min_words}–${task.max_words} words</p><div class="planning-points">${task.outline.map(item => `<div><h3>${escape(item.label)}</h3><p>${escape(item.text)}</p></div>`).join('')}</div><details><summary>Useful expressions</summary><div class="expression-list">${task.useful_expressions.map(text => `<span>${escape(text)}</span>`).join('')}</div></details><div class="checklist" id="writing-checklist">${task.checklist.map(text => `<label><input type="checkbox"><span>${escape(text)}</span></label>`).join('')}</div></section>
      <section class="practice-panel"><p class="step-label">2 · Write your first draft</p><h2>Your ideas, your words</h2><label class="draft-label" for="writing-draft">First draft</label><textarea id="writing-draft" class="writing-text" aria-describedby="draft-help draft-count" placeholder="Start your draft here…"></textarea><div class="draft-meta"><span id="draft-count" role="status" aria-live="polite"></span><span id="save-status" role="status"></span></div><p class="draft-help" id="draft-help">Write in English. Your work is saved in this browser when saving is available.</p>
      <div class="ai-box"><h3>Get feedback with ChatGPT</h3><p>Copy your draft with the prepared feedback instructions, then open ChatGPT using your own account. Paste the copied text into a new chat and send it. The instructions ask for explanations in Vietnamese, up to five priority corrections and help revising your own ideas.</p><div class="ai-steps"><button class="primary-button" type="button" id="copy-ai" disabled>1 · Copy draft + instructions</button><a class="secondary-button" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">2 · Open ChatGPT ↗</a></div><p class="copy-status" id="copy-status" role="status" aria-live="polite"></p><div id="manual-copy-box" hidden><label class="draft-label" for="manual-copy">Select and copy this text, then paste it into ChatGPT</label><textarea id="manual-copy" class="manual-copy" readonly></textarea></div></div></section>
      <section class="practice-panel"><p class="step-label">3 · Read feedback and revise</p><h2>Make your next draft better</h2><p class="panel-intro">Choose which feedback helps your meaning. Correct the errors you understand, then use the checklist to review your new version.</p><label class="draft-label" for="writing-revision">Revised draft</label><textarea id="writing-revision" class="writing-text" aria-describedby="revision-count" placeholder="Write your improved version here…"></textarea><div class="draft-meta"><span id="revision-count" role="status" aria-live="polite"></span></div></section>`;
    const draft = document.getElementById('writing-draft');
    const revision = document.getElementById('writing-revision');
    const button = document.getElementById('copy-ai');
    const status = document.getElementById('copy-status');
    const fallbackBox = document.getElementById('manual-copy-box');
    const fallback = document.getElementById('manual-copy');
    const saveStatus = document.getElementById('save-status');
    const key = `ec:g11:u${number}:writing:v1`;
    const countWords = text => (text.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length;
    function updateCount(field, target) {
      const count = countWords(field.value);
      const hint = count === 0 ? `Aim for ${task.min_words}–${task.max_words}.`
        : count < task.min_words ? `${task.min_words-count} more to reach ${task.min_words}.`
        : count > task.max_words ? `${count-task.max_words} over the limit.` : 'Within the target range.';
      target.textContent = `${count} words · ${hint}`;
    }
    function update() {
      updateCount(draft, document.getElementById('draft-count'));
      updateCount(revision, document.getElementById('revision-count'));
      button.disabled = !draft.value.trim();
    }
    try {
      const saved = JSON.parse(localStorage.getItem(key) || '{}');
      if (saved && typeof saved.draft === 'string') draft.value = saved.draft;
      if (saved && typeof saved.revision === 'string') revision.value = saved.revision;
      saveStatus.textContent = 'Drafts are saved in this browser.';
    } catch {
      saveStatus.textContent = 'Saving is unavailable. Copy your work before leaving.';
    }
    function save() {
      update();
      status.textContent = '';
      fallbackBox.hidden = true;
      fallback.value = '';
      try {
        localStorage.setItem(key, JSON.stringify({draft:draft.value, revision:revision.value}));
        saveStatus.textContent = 'Drafts saved in this browser.';
      } catch {
        saveStatus.textContent = 'Saving is unavailable. Copy your work before leaving.';
      }
    }
    draft.addEventListener('input', save);
    revision.addEventListener('input', save);
    button.addEventListener('click', async () => {
      if (!draft.value.trim()) return;
      const text = task.feedback_instructions.replace('{{student_draft}}', () => draft.value.trim());
      try {
        await navigator.clipboard.writeText(text);
        status.textContent = 'Copied. Open ChatGPT, paste and send the text, then return here to revise.';
        fallbackBox.hidden = true;
      } catch {
        fallback.value = text;
        fallbackBox.hidden = false;
        fallback.focus();
        fallback.select();
        status.textContent = 'Copy the selected text below, then paste it into ChatGPT.';
      }
    });
    update();
    return;
  }

  const practice = unit.pronunciation;
  function audioMarkup(src, id, label) {
    return `<div class="audio-row"><audio id="${id}" controls preload="none" aria-label="${escape(label)}" src="${escape(src)}">Your browser cannot play this recording.</audio><label class="speed-label" for="${id}-speed">Speed<select id="${id}-speed" data-speed-for="${id}"><option value="0.75">0.75×</option><option value="0.9">0.9×</option><option value="1" selected>1×</option></select></label></div><a class="audio-source-link" href="${escape(src)}" target="_blank" rel="noopener noreferrer">Open recording ↗</a>`;
  }
  root.innerHTML = `<section class="practice-panel"><p class="step-label">1 · Listen to the pattern</p><h2>${escape(practice.focus)}</h2><p class="panel-intro">${escape(practice.intro)}</p>${audioMarkup(practice.model_audio,'model-audio','Unit '+number+' model recording')}<p class="audio-note">Model recording from the Unit ${number} lesson.</p><div class="sound-guides">${practice.guide.map(item => `<div class="sound-guide"><h3>${escape(item.pattern)}</h3><p class="guide-example">${escape(item.example)}</p><p>${escape(item.tip)}</p></div>`).join('')}</div></section>
    <section class="practice-panel"><p class="step-label">2 · Apply the pattern</p><h2>Try eight new examples</h2><p class="panel-intro">${escape(practice.quiz_instruction)}</p><form class="quiz" id="pronunciation-quiz" novalidate>${practice.questions.map((q,i) => `<fieldset class="question"><legend><span class="question-number">${i+1}.</span>${escape(q.prompt)}</legend><div class="options">${q.options.map((option,j) => `<label class="option" for="q${i}-${j}"><input type="radio" id="q${i}-${j}" name="q${i}" value="${escape(option)}" aria-describedby="q${i}-feedback"><span>${escape(option)}</span></label>`).join('')}</div><p class="answer-feedback" id="q${i}-feedback" hidden></p></fieldset>`).join('')}<div class="quiz-actions"><button class="primary-button" type="submit">Check answers</button><button class="secondary-button" type="reset">Try again</button><p class="score" role="status" aria-live="polite"></p></div></form></section>
    <section class="practice-panel"><p class="step-label">3 · Listen and repeat</p><h2>Bring the pattern into speech</h2><p class="panel-intro">${escape(practice.repeat_tip)}</p>${audioMarkup(practice.repeat_audio,'repeat-audio','Unit '+number+' repeat recording')}<p class="audio-note">Practice recording from the Unit ${number} lesson. You can also return to the new quiz examples and read them aloud.</p></section>`;
  root.querySelectorAll('[data-speed-for]').forEach(select => select.addEventListener('change', () => {
    document.getElementById(select.dataset.speedFor).playbackRate = Number(select.value);
  }));
  root.addEventListener('play', event => {
    if (!(event.target instanceof HTMLMediaElement)) return;
    root.querySelectorAll('audio').forEach(audio => { if (audio !== event.target) audio.pause(); });
  }, true);
  window.addEventListener('pagehide', () => root.querySelectorAll('audio').forEach(audio => audio.pause()));
  const form = document.getElementById('pronunciation-quiz');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const answers = new FormData(form);
    let score = 0;
    practice.questions.forEach((q,i) => {
      const value = String(answers.get(`q${i}`) || '');
      const correct = value === q.answer;
      if (correct) score++;
      const feedback = document.getElementById(`q${i}-feedback`);
      feedback.className = `answer-feedback ${correct ? 'good' : 'improve'}`;
      feedback.hidden = false;
      feedback.textContent = `${correct ? 'Correct.' : value ? 'Review this answer.' : 'No answer yet.'} ${correct ? '' : `Answer: ${q.answer}. `}${q.explanation}`;
      form.querySelectorAll(`[name="q${i}"]`).forEach(input => input.setAttribute('aria-invalid',String(!correct)));
    });
    form.querySelector('.score').textContent = `${score} / ${practice.questions.length} correct. ${score === practice.questions.length ? 'Well done!' : 'Read the explanations, then try again.'}`;
  });
  form.addEventListener('input', () => {
    if (!form.querySelector('.score').textContent) return;
    form.querySelector('.score').textContent = 'Answers changed. Check again for an updated score.';
    form.querySelectorAll('.answer-feedback').forEach(node => node.hidden = true);
    form.querySelectorAll('[aria-invalid]').forEach(node => node.removeAttribute('aria-invalid'));
  });
  form.addEventListener('reset', () => {
    form.querySelectorAll('.answer-feedback').forEach(node => {node.hidden=true;node.textContent='';});
    form.querySelectorAll('[aria-invalid]').forEach(node => node.removeAttribute('aria-invalid'));
    form.querySelector('.score').textContent = '';
  });
})();
