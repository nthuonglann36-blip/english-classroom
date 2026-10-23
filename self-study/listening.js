(() => {
  'use strict';
  const params = new URLSearchParams(location.search);
  const grades = {'10': window.GRADE10_LISTENING, '11': window.LISTENING_CONTENT};
  const requestedGrade = params.get('grade') || '11';
  const content = Object.hasOwn(grades, requestedGrade) ? grades[requestedGrade] : null;
  if (!content) {
    document.title = 'Listening activity unavailable — English Classroom';
    document.getElementById('page-title').textContent = 'Listening activity unavailable';
    document.getElementById('activities').innerHTML = '<p>Choose an available listening activity from <a href="index.html">Self-study</a>.</p>';
    return;
  }
  const requestedUnit = params.get('unit');
  const unit = content.units.find(item => String(item.number) === requestedUnit) || content.units[0];
  const lessons = content.lessons.filter(lesson => lesson.unit === unit.number);
  const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[char]));
  const normalize = value => String(value).normalize('NFKC').trim().toLowerCase().replace(/[.!?,;:]+$/g, '').trim();
  const labels = {true_false:'True / False', multiple_choice:'Multiple choice', gap_fill:'Fill in the gaps'};
  const instructions = {
    true_false:'Listen and decide whether each statement is True or False.',
    multiple_choice:'Listen and choose the correct answer A, B, C or D.',
    gap_fill:'Listen and complete each sentence with ONE word you hear.'
  };
  document.title = `Grade ${content.grade} · Unit ${unit.number} · Listening — English Classroom`;
  document.getElementById('selfstudy-nav')?.setAttribute('href', `index.html#grade${content.grade}`);
  document.getElementById('back-link')?.setAttribute('href', `index.html#grade${content.grade}`);
  const lessonLink = document.getElementById('lessons-link');
  if (lessonLink) {lessonLink.href = `../grade${content.grade}/index.html`;lessonLink.textContent = `Grade ${content.grade} lessons`;}
  const summary = {'page-eyebrow': `Self-study · Grade ${content.grade}`, 'grade-summary': `Grade ${content.grade} · Units 1–3`, 'activity-summary': `${content.lessons.length} activities · ${content.lessons.reduce((count,lesson) => count+lesson.questions.length,0)} questions`};
  Object.entries(summary).forEach(([id,text]) => {const node=document.getElementById(id);if(node)node.textContent=text;});
  document.getElementById('unit-switch').innerHTML = content.units.map(item => `<a href="?grade=${content.grade}&amp;unit=${item.number}" ${item.number === unit.number ? 'aria-current="page"' : ''}>Unit ${item.number} · ${escape(item.title)}</a>`).join('');
  document.getElementById('unit-label').textContent = `Grade ${content.grade} · Unit ${unit.number}`;
  document.getElementById('skill-tabs').innerHTML = `<a href="grammar.html?grade=${content.grade}&amp;unit=${unit.number}">Grammar</a><a href="?grade=${content.grade}&amp;unit=${unit.number}" aria-current="page">Listening</a><a href="skills.html?grade=${content.grade}&amp;unit=${unit.number}&amp;skill=writing">Writing</a><a href="${content.grade === 10 && unit.number < 3 ? `practice.html?unit=${unit.number}&amp;skill=pronunciation` : `skills.html?grade=${content.grade}&amp;unit=${unit.number}&amp;skill=pronunciation`}">Pronunciation</a>`;
  document.getElementById('unit-title').textContent = unit.title;
  document.getElementById('unit-description').textContent = `${lessons.length} ${lessons.length === 1 ? 'activity' : 'activities'} · ${lessons.reduce((count,lesson) => count + lesson.questions.length, 0)} questions. You can pause and listen again whenever you need.`;
  document.getElementById('activity-nav').innerHTML = lessons.map((lesson,index) => `<a href="#${lesson.id}">Activity ${index+1} · ${escape(labels[lesson.format])}</a>`).join('');

  function questionMarkup(lesson, question, index) {
    const name = `${lesson.id}-q${index}`;
    let fields;
    if (question.type === 'gap_fill') {
      fields = `<label class="gap-label lesson-gap" for="${name}">One word<input id="${name}" name="${name}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" aria-describedby="${name}-feedback"></label>`;
    } else {
      const options = question.type === 'true_false' ? [['true','True'],['false','False']] : Object.entries(question.options);
      fields = `<div class="options">${options.map(([value,label],optionIndex) => `<label class="option" for="${name}-${optionIndex}"><input id="${name}-${optionIndex}" name="${name}" type="radio" value="${escape(value)}" aria-describedby="${name}-feedback"><span>${question.type === 'multiple_choice' ? `${escape(value)}. ` : ''}${escape(label)}</span></label>`).join('')}</div>`;
    }
    return `<fieldset class="question"><legend><span class="question-number">${index+1}.</span>${escape(question.prompt)}</legend>${fields}<p class="answer-feedback" id="${name}-feedback" hidden></p></fieldset>`;
  }
  const root = document.getElementById('activities');
  root.innerHTML = lessons.map((lesson,index) => {
    const instruction = lesson.instructions || instructions[lesson.format];
    return `<section class="practice-panel" id="${lesson.id}" aria-labelledby="${lesson.id}-title">
      <p class="step-label">Activity ${index+1} · ${escape(labels[lesson.format])}</p>
      <h2 id="${lesson.id}-title">${escape(lesson.title)}</h2>
      <div class="source-meta"><span>${escape(lesson.publisher)}</span><span>Listen: ${escape(lesson.listening_range)}</span><span>${lesson.questions.length} questions</span></div>
      <div class="video-area" id="${lesson.id}-video"><div class="video-placeholder"><p>Play the selected video extract, then answer the questions below.</p><button class="primary-button" type="button" data-load-video="${lesson.id}">Load video player</button></div></div>
      <div class="source-actions"><a class="source-link" href="${escape(lesson.source_url)}&t=${lesson.start_seconds}s" target="_blank" rel="noopener noreferrer" aria-label="Watch ${escape(lesson.title)} on YouTube in a new tab">Watch on YouTube</a><button class="secondary-button" type="button" data-restart-video="${lesson.id}" hidden>Restart video</button></div>
      <p class="source-help">${lesson.end_seconds === null ? 'Watch the whole video.' : `Use the section ${escape(lesson.listening_range)}.`} If the player is unavailable, open the YouTube link. You can pause, replay or choose a slower speed in the player.</p>
      ${lesson.word_bank.length ? `<aside class="word-bank" aria-labelledby="${lesson.id}-bank-title"><h3 id="${lesson.id}-bank-title">Word bank · Use each word once</h3><div class="bank-words">${lesson.word_bank.map(word => `<span class="bank-word">${escape(word)}</span>`).join('')}</div></aside>` : ''}
      <p class="exercise-instruction">${escape(instruction)}</p>
      <form class="quiz" data-lesson="${lesson.id}" novalidate>${lesson.questions.map((question,index) => questionMarkup(lesson,question,index)).join('')}<div class="quiz-actions"><button class="primary-button" type="submit">Check answers</button><button class="secondary-button" type="reset">Try again</button><p class="score" role="status" aria-live="polite"></p></div></form>
      <a class="back-to-activities" href="#activity-nav">Back to activities ↑</a>
    </section>`;
  }).join('');

  function displayAnswer(question) {
    if (question.type === 'true_false') return question.answer ? 'True' : 'False';
    if (question.type === 'multiple_choice') return `${question.answer}. ${question.options[question.answer]}`;
    return question.answer;
  }
  lessons.forEach(lesson => {
    const form = root.querySelector(`form[data-lesson="${lesson.id}"]`);
    form.addEventListener('submit', event => {
      event.preventDefault();
      const answers = new FormData(form);
      let score = 0;
      lesson.questions.forEach((question,index) => {
        const name = `${lesson.id}-q${index}`;
        const value = String(answers.get(name) || '');
        const correct = (question.accepted || [question.answer]).some(answer => normalize(answer) === normalize(value));
        if (correct) score++;
        const feedback = document.getElementById(`${name}-feedback`);
        feedback.className = `answer-feedback ${correct ? 'good' : 'improve'}`;
        feedback.hidden = false;
        feedback.textContent = `${correct ? 'Correct.' : value.trim() ? 'Review this answer.' : 'No answer yet.'} ${correct ? '' : `Answer: ${displayAnswer(question)}. `}${question.explanation} Listen again at ${question.evidence_time}.`;
        form.querySelectorAll(`[name="${name}"]`).forEach(input => input.setAttribute('aria-invalid', String(!correct)));
      });
      form.querySelector('.score').textContent = `${score} / ${lesson.questions.length} correct. ${score === lesson.questions.length ? 'Well done!' : 'Read the explanations, listen again and try once more.'}`;
    });
    form.addEventListener('input', () => {
      if (!form.querySelector('.score').textContent) return;
      form.querySelector('.score').textContent = 'Answers changed. Check again for an updated score.';
      form.querySelectorAll('.answer-feedback').forEach(feedback => feedback.hidden = true);
      form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
    });
    form.addEventListener('reset', () => {
      form.querySelectorAll('.answer-feedback').forEach(feedback => {feedback.hidden = true; feedback.textContent = '';});
      form.querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute('aria-invalid'));
      form.querySelector('.score').textContent = '';
    });
  });

  function loadVideo(id) {
    const lesson = lessons.find(item => item.id === id);
    if (!lesson) return;
    // Loading is initiated by the learner. Keep only one embedded player open.
    root.querySelectorAll('iframe').forEach(frame => {
      const previous = lessons.find(item => `${item.id}-player` === frame.id);
      if (previous && previous.id !== lesson.id) {
        document.getElementById(`${previous.id}-video`).innerHTML = `<div class="video-placeholder"><button class="primary-button" type="button" data-load-video="${previous.id}">Load video player</button></div>`;
        root.querySelector(`[data-restart-video="${previous.id}"]`).hidden = true;
      }
    });
    const frame = document.createElement('iframe');
    frame.id = `${lesson.id}-player`;
    frame.title = `${lesson.title} · ${lesson.listening_range}`;
    const query = new URLSearchParams({start: String(lesson.start_seconds), rel: '0', playsinline: '1'});
    if (lesson.end_seconds !== null) query.set('end', String(lesson.end_seconds));
    frame.src = `https://www.youtube-nocookie.com/embed/${lesson.video_id}?${query}`;
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allow = 'encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    document.getElementById(`${lesson.id}-video`).replaceChildren(frame);
    root.querySelector(`[data-restart-video="${lesson.id}"]`).hidden = false;
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-load-video], [data-restart-video]');
    if (button) loadVideo(button.dataset.loadVideo || button.dataset.restartVideo);
  });
})();
