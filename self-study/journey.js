(() => {
  'use strict';
  const journey = window.ECJourney, content = window.EC_JOURNEY_CONTENT;
  const root = document.getElementById('print-studio');
  if (!root || !journey || !content) return;
  const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const saved = (key, fallback) => { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } };
  const savedUnit = g => /^[123]$/.test(saved(`ec:self-study:unit:${g}`,'')) ? saved(`ec:self-study:unit:${g}`,'1') : '1';
  let grade = saved('ec:self-study:grade','10') === '11' ? '11' : '10';
  let unit = savedUnit(grade), vocabularyOpen = false;
  const groups = {
    '10': {'1':['getting-started','reading','review'], '2':['unit2-getting-started','unit2-language','unit2-reading','unit2-listening','unit2-looking-back','unit2-review'], '3':[]},
    '11': {'1':['grade11-unit1-wordwall'], '2':['grade11-unit2-wordwall'], '3':['grade11-unit3-wordwall']}
  };
  // Keep old shared links working as well as the selected unit's new links.
  function routeFromHash() {
    const hash = location.hash;
    const match = hash.match(/^#(?:studio-)?grade(10|11)(?:-unit([123]))?/);
    if (match) return {grade:match[1], unit:match[2] || savedUnit(match[1]), vocabulary:hash.endsWith('-wordwall')};
    for (const [n, ids] of Object.entries(groups['10'])) {
      if (ids.includes(hash.slice(1))) return {grade:'10',unit:n,vocabulary:true};
    }
    if (hash === '#activities' || hash === '#unit1-skills') return {grade:'10',unit:'1',vocabulary:false};
    const legacy = hash.match(/^#unit([23])(?:-skills)?$/);
    return legacy ? {grade:'10',unit:legacy[1],vocabulary:false} : null;
  }
  const initial = routeFromHash();
  if (initial) { grade=initial.grade; unit=initial.unit; vocabularyOpen=initial.vocabulary; }
  function skillUrl(g, n, skill) {
    if (skill === 'vocabulary') return `#grade${g}-unit${n}-wordwall`;
    if (skill === 'grammar' || skill === 'listening') return `${skill}.html?grade=${g}&unit=${n}`;
    if (skill === 'pronunciation' && g === '10' && n !== '3') return `practice.html?unit=${n}&skill=pronunciation`;
    return `skills.html?grade=${g}&unit=${n}&skill=${skill}`;
  }
  function art(g, n) {
    return `<div class="tranh journey-art" data-print-grade="${g}" data-print-unit="${n}">${content.prints[content.units[g][n].print]}</div>`;
  }
  root.innerHTML = `<section class="journey-picker" aria-label="Choose your grade and unit">
    <div class="journey-grade-row"><h2 id="journey-grade-title">1 <span>Choose grade</span></h2><div class="journey-grades" role="group" aria-labelledby="journey-grade-title"><button type="button" data-journey-grade="10">Grade 10</button><button type="button" data-journey-grade="11">Grade 11</button></div></div>
    <h2 class="journey-step" id="journey-unit-title">2 <span>Choose unit</span></h2>
    <div class="journey-unit-tabs" id="journey-unit-tabs" role="group" aria-labelledby="journey-unit-title"></div>
    <details class="journey-future"><summary>Units 4–10 · Not open yet</summary><div class="journey-future-grid" id="journey-future"></div></details>
  </section>
  <div id="journey-prints"></div>
  <section class="journey-vocabulary" id="journey-vocabulary" aria-labelledby="journey-vocabulary-title" hidden>
    <div class="journey-vocabulary-heading"><div><p class="eyebrow" id="journey-vocabulary-context"></p><h2 id="journey-vocabulary-title">Vocabulary · Wordwall</h2></div><button type="button" class="journey-close-vocabulary">Back to skills ↑</button></div>
    <p class="journey-description">Play an activity, return here and confirm when you finish. Wordwall opens in a new tab and needs Internet.</p>
    <div id="journey-vocabulary-groups"></div>
  </section>
  <details class="journey-progress"><summary>Your progress <span><b id="journey-streak">0</b> day streak · <b id="journey-minutes">0</b> min this week</span></summary>
    <div class="journey-progress-body"><p>A study day counts after at least 5 minutes of practice. Your week starts on Monday.</p><ol class="journey-week" id="journey-week" aria-label="Your week, Monday to Sunday"></ol><p class="journey-local-note" id="journey-storage-note"></p></div>
  </details>
  <details class="journey-help"><summary>How to earn colours</summary><p>Finish a skill to print its colour. Writing adds the black ink after the other four skills. All five layers earn a red seal.</p><ul><li>For Grammar and Listening, answer every question and check every activity in the unit. Read the feedback; you can always try again.</li><li>For Pronunciation, check the quiz and confirm that you have listened and practised aloud.</li><li>For Writing, revise your draft, stay within the word limit and review the checklist. You can finish Writing early; its ink waits for the other skills.</li><li>Wordwall completion is self-confirmed after you return. Opening a link does not earn a colour. Wordwall does not send a score to this website.</li><li>Study time counts on a visible, focused practice page here. This menu, hidden tabs, Wordwall and ChatGPT tabs do not add minutes.</li></ul></details>`;

  // Reuse the original activity groups: no duplicated links, cards or progress.
  const vocabularyGroups = document.getElementById('journey-vocabulary-groups');
  Object.values(groups).forEach(units => Object.values(units).flat().forEach(id => {
    const group = document.getElementById(id);
    if (group) { group.hidden=true; vocabularyGroups.append(group); }
  }));
  document.getElementById('activity-catalog').hidden = true;
  document.body.classList.add('journey-focused');
  const weekdays = ['Mon · T2','Tue · T3','Wed · T4','Thu · T5','Fri · T6','Sat · T7','Sun · CN'];
  function renderTime() {
    const time = journey.timeSummary();
    document.getElementById('journey-streak').textContent = time.streak;
    document.getElementById('journey-minutes').textContent = time.minutes;
    document.getElementById('journey-week').innerHTML = time.days.map((day,i) => `<li class="${day.qualified?'qualified ':''}${day.today?'today ':''}${day.future?'future':''}" ${day.today?'aria-current="date"':''} aria-label="${weekdays[i]}, ${day.key}: ${day.future?'upcoming':day.minutes+' minutes'+(day.qualified?', study day complete':'')}"><span>${weekdays[i]}</span><b aria-hidden="true">${day.qualified?'✓':day.date}</b><small>${day.future?'—':day.minutes+' min'}</small></li>`).join('');
    document.getElementById('journey-storage-note').textContent = journey.storageAvailable
      ? 'Progress is saved in this browser on this device. Use the same browser to continue your print.'
      : 'Browser storage is unavailable. Progress is kept for this visit only and may be lost when you leave.';
  }
  function updatePrints() {
    root.querySelectorAll('[data-print-grade]').forEach(frame => {
      const g = frame.dataset.printGrade, n = frame.dataset.printUnit, stats = journey.unitStats(g,n);
      const svg = frame.querySelector('svg');
      stats.skills.slice(0,4).forEach(skill => svg.style.setProperty(`--o${skill.index}`, skill.done ? '1' : '0'));
      frame.classList.toggle('is-ink', stats.ink);
      frame.classList.toggle('is-complete', stats.finished);
      svg.setAttribute('aria-label', `${content.units[g][n].printName} · Grade ${g} Unit ${n} · ${stats.printed} of 5 layers printed`);
      const seal = svg.querySelector('.seal text'), title = svg.querySelector('.ttl');
      if (seal) seal.textContent = '★';
      if (title) title.textContent = `Unit ${n}`;
      window.ECPrintArt?.prepare(frame);
    });
    const stats = journey.unitStats(grade,unit), card = root.querySelector('[data-journey-unit]');
    if (card) {
      const unavailable = stats.skills.filter(skill => !skill.total);
      card.querySelector('.journey-print-status').textContent = stats.finished ? 'Dấu son · Print complete!' : `${stats.printed} / 5 layers printed${unavailable.length ? ' · Vocabulary is not open yet.' : stats.skills[4].done?' · Writing ready; ink prints last.':''}`;
      card.querySelector('progress').value = stats.printed;
      card.querySelectorAll('[data-layer]').forEach(link => {
        const skill = stats.skills.find(s => s.id === link.dataset.layer);
        const pending = skill.id === 'writing' && skill.done && !stats.finished;
        link.classList.toggle('is-done', skill.done && !pending);
        link.classList.toggle('is-pending', pending);
        link.querySelector('small').textContent = !skill.total ? 'Chưa có bài · Not open yet' : pending ? 'Ready · prints last' : skill.done ? '✓ Complete' : `${skill.count} / ${skill.total} activities`;
      });
    }
    renderTime();
  }
  function showVocabulary() {
    const visibleIds = vocabularyOpen ? groups[grade][unit] : [];
    document.getElementById('journey-vocabulary').hidden = !visibleIds.length;
    vocabularyGroups.querySelectorAll('.activity-group').forEach(group => { group.hidden = !visibleIds.includes(group.id); });
    document.getElementById('journey-vocabulary-context').textContent = `Grade ${grade} · Unit ${unit} · ${content.units[grade][unit].title}`;
    const link = root.querySelector('[data-layer="vocabulary"]');
    if (link?.tagName === 'A') link.setAttribute('aria-expanded',String(vocabularyOpen));
  }
  function renderUnit() {
    const focusedUnit = document.activeElement?.dataset.journeySelectUnit;
    const lessons = document.getElementById('study-lessons-link');
    lessons.href = `../grade${grade}/index.html`; lessons.textContent = `Grade ${grade} lessons`;
    try { localStorage.setItem('ec:self-study:grade',grade); localStorage.setItem(`ec:self-study:unit:${grade}`,unit); } catch { /* Remember for this visit. */ }
    root.querySelectorAll('[data-journey-grade]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.journeyGrade === grade)));
    document.getElementById('journey-unit-tabs').innerHTML = Object.entries(content.units[grade]).filter(([,u]) => u.print).map(([n,u]) => `<button type="button" data-journey-select-unit="${n}" aria-pressed="${n === unit}"><strong>Unit ${n}</strong><span>${escape(u.title)}</span></button>`).join('');
    if (focusedUnit) root.querySelector(`[data-journey-select-unit="${focusedUnit}"]`)?.focus({preventScroll:true});
    document.getElementById('journey-future').innerHTML = Object.entries(content.units[grade]).filter(([,u]) => !u.print).map(([n,u]) => `<article class="journey-coming" aria-disabled="true"><div class="journey-empty-frame" aria-hidden="true"><span>${String(n).padStart(2,'0')}</span></div><h3>Unit ${n}</h3><p>${escape(u.title)}</p><span>Chưa mở · Not open yet</span></article>`).join('');
    const u = content.units[grade][unit], preview = content.printFiles?.[u.print];
    const hints = {vocabulary:'Wordwall games',pronunciation:'Listen & repeat',grammar:'Review & practise',listening:'Listen & answer',writing:'Write & revise'};
    const skills = content.skills.map(s => {
      const available = (u.activities[s.id] || []).length > 0;
      const tag = available ? 'a' : 'span';
      const destination = available ? `href="${skillUrl(grade,unit,s.id)}"${s.id === 'vocabulary'?' aria-controls="journey-vocabulary" aria-expanded="false"':''}` : 'aria-disabled="true"';
      return `<li><${tag} data-layer="${s.id}" ${destination}><i style="--swatch:var(--l${s.index})" aria-hidden="true"></i><span>${s.label}<em>${hints[s.id]}</em></span><small></small><b class="journey-skill-arrow" aria-hidden="true">${available?'→':'—'}</b></${tag}></li>`;
    }).join('');
    document.getElementById('journey-prints').innerHTML = `<article class="journey-print-card" id="grade${grade}-unit${unit}-print" data-journey-unit="${unit}" aria-labelledby="journey-current-title"><div class="journey-picture">${art(grade,unit)}<p class="journey-art-name">${escape(u.printName)}</p>${preview?`<a class="journey-art-preview" href="${escape(preview)}" target="_blank" rel="noopener noreferrer" aria-label="View finished artwork for Grade ${grade} Unit ${unit} (opens in a new tab)">View finished artwork</a>`:''}</div><div class="journey-print-info"><p class="eyebrow">Grade ${grade} · Unit ${unit}</p><h2 id="journey-current-title">${escape(u.title)}</h2><p class="journey-print-status" role="status"></p><progress max="5" value="0" aria-label="Unit ${unit}: printing layers completed"></progress></div><div class="journey-skill-picker"><h3 class="journey-step">3 <span>Choose a skill</span></h3><ul class="journey-skills">${skills}</ul><p class="journey-ink-hint">Each skill adds a colour. Writing prints the black ink last.</p></div></article>`;
    showVocabulary();
    updatePrints();
  }
  function navigate(g, n, vocabulary = false, scroll = true) {
    const hash = `#grade${g}-unit${n}-${vocabulary?'wordwall':'print'}`;
    if (location.hash !== hash) history.pushState({...history.state,ecSelfStudy:{grade:g,unit:n,vocabulary}},'',hash);
    grade=g; unit=n; vocabularyOpen=vocabulary; renderUnit();
    if (scroll) scrollToSelection();
  }
  function scrollToSelection() {
    const target = vocabularyOpen && groups[grade][unit].length ? document.getElementById('journey-vocabulary') : root.querySelector('[data-journey-unit]');
    target?.scrollIntoView({block:'start'});
  }
  root.addEventListener('click', event => {
    const gradeButton = event.target.closest('[data-journey-grade]');
    const unitButton = event.target.closest('[data-journey-select-unit]');
    if (gradeButton && gradeButton.dataset.journeyGrade !== grade) navigate(gradeButton.dataset.journeyGrade,savedUnit(gradeButton.dataset.journeyGrade),false,false);
    else if (unitButton) navigate(grade,unitButton.dataset.journeySelectUnit,false,false);
    else if (event.target.closest('.journey-close-vocabulary')) navigate(grade,unit);
  });
  window.addEventListener('hashchange', () => {
    const next = routeFromHash();
    if (!next) { rememberView(); return; }
    const changed = next.grade !== grade || next.unit !== unit;
    grade=next.grade; unit=next.unit; vocabularyOpen=next.vocabulary;
    if (changed) renderUnit(); else showVocabulary();
    rememberView();
    scrollToSelection();
  });
  function rememberView() {
    history.replaceState({...history.state,ecSelfStudy:{grade,unit,vocabulary:vocabularyOpen}},'',location.href);
  }
  window.addEventListener('popstate', event => {
    const view = event.state?.ecSelfStudy;
    if (routeFromHash() || !view) return;
    grade=view.grade; unit=view.unit; vocabularyOpen=view.vocabulary;
    renderUnit();
  });

  // Cross-origin Wordwall links cannot report results; confirmation is explicit.
  const wordwalls = new Map(), opened = new Set();
  Object.entries(content.units).forEach(([g,units]) => Object.entries(units).forEach(([n,u]) => (u.activities.vocabulary || []).forEach(id => wordwalls.set(id,{grade:g,unit:n}))));
  const confirmations = [];
  document.querySelectorAll('a.play-link[href*="wordwall.net/resource/"]').forEach(link => {
    const id = link.href.match(/\/resource\/(\d+)/)?.[1], context = wordwalls.get(id);
    if (!context) return;
    const key = `ec:wordwall:opened:${id}`;
    try { if (sessionStorage.getItem(key)) opened.add(id); } catch { /* In-memory confirmation still works. */ }
    const box = document.createElement('div');
    box.className = 'journey-wordwall-confirm';
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'journey-confirm-button'; button.dataset.wordwallComplete = id;
    const note = document.createElement('p');
    note.textContent = 'Finish on Wordwall, return here, then confirm. This is your own confirmation.';
    box.append(button,note); link.after(box);
    const update = () => {
      const done = journey.isComplete(context.grade,context.unit,'vocabulary',id);
      button.disabled = done || !opened.has(id);
      button.textContent = done ? '✓ Activity completed' : 'I have finished this activity';
    };
    confirmations.push(update);
    link.addEventListener('click', () => {
      opened.add(id);
      try { sessionStorage.setItem(key,'1'); } catch { /* Keep the current button available. */ }
      update();
    });
    button.addEventListener('click', () => {
      if (opened.has(id)) journey.complete(context.grade,context.unit,'vocabulary',id);
    });
    update();
  });
  const refresh = () => { updatePrints(); confirmations.forEach(update => update()); };
  journey.onChange(refresh);
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
  window.setInterval(renderTime, 60000);
  renderUnit();
  rememberView();
  // Explicit shared links open their unit; a normal visit starts at the selectors.
  if (initial) requestAnimationFrame(scrollToSelection);
})();
