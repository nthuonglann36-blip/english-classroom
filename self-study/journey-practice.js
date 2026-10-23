/* Adds progress to the existing exercises without changing their questions or keys. */
(() => {
  'use strict';
  const journey = window.ECJourney, content = window.EC_JOURNEY_CONTENT;
  const label = document.getElementById('unit-label')?.textContent || '';
  const grade = label.match(/Grade (10|11)\b/)?.[1], unit = label.match(/Unit ([123])\b/)?.[1];
  if (!grade || !unit || !content.units[grade]?.[unit]) return;
  const route = location.pathname.split('/').pop();
  const skill = route === 'grammar.html' ? 'grammar' : route === 'listening.html' ? 'listening'
    : document.getElementById('page-title')?.textContent.includes('Pronunciation') ? 'pronunciation' : 'writing';
  const formRoot = document.getElementById('practice') || document.getElementById('activities');
  if (!formRoot || (skill !== 'writing' && !formRoot.querySelector('form.quiz'))) return;
  const banner = document.createElement('aside');
  banner.className = 'journey-practice-banner'; banner.setAttribute('aria-label','Your unit print');
  const link = document.createElement('a');
  link.href = `index.html#grade${grade}-unit${unit}-print`;
  ['selfstudy-nav','back-link'].forEach(id => document.getElementById(id)?.setAttribute('href',link.href));
  banner.append(link);
  const hint = document.createElement('span');
  banner.append(hint);
  document.getElementById('skill-tabs')?.before(banner);
  function updateBanner() {
    const stats = journey.unitStats(grade,unit), current = stats.skills.find(s => s.id === skill);
    const preparing = !content.units[grade][unit].print;
    link.textContent = preparing ? `Unit ${unit} practice · Picture in preparation →` : `Your Unit ${unit} print · ${stats.printed} / 5 layers →`;
    hint.textContent = !journey.storageAvailable ? 'Progress is kept for this visit only; browser storage is unavailable.'
      : current.done ? preparing ? '✓ This skill is complete. Your progress is saved while the picture is being prepared.' : skill === 'writing' && !stats.finished ? 'Writing recorded. The ink prints after your other four skills.' : '✓ This skill is complete. You can keep practising.'
      : skill === 'grammar' || skill === 'listening' ? 'Answer every question and check each activity to earn this colour.' : 'Finish the steps below to add this printing layer.';
  }
  journey.onChange(updateBanner);
  updateBanner();
  journey.startTracking();
  function answered(form) {
    const fields = [...form.querySelectorAll('fieldset.question')], answers = new FormData(form);
    return fields.length > 0 && fields.every(field => {
      const input = field.querySelector('input[name],textarea[name],select[name]');
      return input && String(answers.get(input.name) || '').trim();
    });
  }
  if (skill === 'grammar' || skill === 'listening') {
    formRoot.querySelectorAll('form.quiz').forEach(form => {
      form.addEventListener('submit', () => {
        if (answered(form)) journey.complete(grade,unit,skill,skill === 'grammar' ? form.id.replace(/-quiz$/,'') : form.dataset.lesson);
      });
    });
    return;
  }
  const finish = document.createElement('section');
  finish.className = 'practice-panel journey-finish';
  if (skill === 'pronunciation') {
    finish.innerHTML = '<h2>Finish your pronunciation practice</h2><p>Check every quiz question above, listen to the examples and repeat the words and sentences aloud.</p><label class="journey-repeat-check"><input type="checkbox"><span>I have listened and practised aloud.</span></label><button type="button" class="primary-button" disabled>Finish pronunciation</button><p class="journey-finish-status" role="status"></p>';
    formRoot.append(finish);
    const button = finish.querySelector('button'), check = finish.querySelector('input'), forms = [...formRoot.querySelectorAll('form.quiz')];
    const checked = new Set();
    function update() {
      const done = journey.isComplete(grade,unit,skill,'pronunciation');
      button.disabled = done || !check.checked || checked.size !== forms.length;
      button.textContent = done ? '✓ Pronunciation completed' : 'Finish pronunciation';
    }
    forms.forEach(form => {
      form.addEventListener('submit', () => { if (answered(form)) checked.add(form); else checked.delete(form); update(); });
      form.addEventListener('input', () => { checked.delete(form); update(); });
      form.addEventListener('reset', () => { checked.delete(form); update(); });
    });
    check.addEventListener('change',update);
    button.addEventListener('click', () => {
      if (!button.disabled) journey.complete(grade,unit,skill,'pronunciation');
    });
    journey.onChange(update); update();
    return;
  }
  const task = (grade === '10' ? window.GRADE10_SKILLS : window.GRADE11_SKILLS)?.units[unit]?.writing;
  if (!task) return;
  finish.innerHTML = `<h2>Ready for the final ink?</h2><p>Write a revised draft of ${task.min_words}–${task.max_words} words, make at least one change to your first draft and check every item in the writing checklist above.</p><button type="button" class="primary-button" disabled>Finish my writing</button><p class="journey-finish-status" role="status"></p>`;
  formRoot.append(finish);
  const button = finish.querySelector('button'), draft = document.getElementById('writing-draft'), revision = document.getElementById('writing-revision');
  const checks = [...document.querySelectorAll('#writing-checklist input[type="checkbox"]')];
  const normalize = value => value.normalize('NFKC').trim().replace(/\s+/g,' ');
  function update() {
    const done = journey.isComplete(grade,unit,'writing','writing');
    const words = (revision.value.match(/[\p{L}\p{N}]+(?:['’\-][\p{L}\p{N}]+)*/gu) || []).length;
    button.disabled = done || !draft.value.trim() || words < task.min_words || words > task.max_words
      || normalize(revision.value) === normalize(draft.value) || !checks.every(check => check.checked);
    button.textContent = done ? '✓ Writing completed' : 'Finish my writing';
    finish.querySelector('.journey-finish-status').textContent = done
      ? !content.units[grade][unit].print ? 'Writing is recorded. This unit’s picture is being prepared.' : journey.unitStats(grade,unit).finished ? 'Your final ink and red seal are ready. Open your unit print to see it.' : 'Writing is recorded. Finish the other four skills to print the ink and earn your red seal.' : '';
  }
  [draft,revision].forEach(field => field.addEventListener('input',update));
  checks.forEach(check => check.addEventListener('change',update));
  button.addEventListener('click', () => { if (!button.disabled) journey.complete(grade,unit,'writing','writing'); });
  journey.onChange(update); update();
})();
