(() => {
  'use strict';
  const journey = window.ECJourney, content = window.EC_JOURNEY_CONTENT;
  const root = document.getElementById('print-studio');
  if (!root) return;
  const escape = text => String(text).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const gradeFromHash = () => location.hash.match(/(?:studio-)?grade(10|11)/)?.[1] || (/^#(?:activities|unit[123]|getting-started|reading|review)/.test(location.hash) ? '10' : null);
  let grade = gradeFromHash() || '10';
  if (!gradeFromHash()) {
    try { grade = localStorage.getItem('ec:self-study:grade') === '11' ? '11' : '10'; } catch { /* Default Grade 10. */ }
  }
  function skillUrl(g, n, skill) {
    if (skill === 'vocabulary') return g === '11' ? `#grade11-unit${n}-wordwall` : n === '1' ? '#getting-started' : '#unit2-getting-started';
    if (skill === 'grammar' || skill === 'listening') return `${skill}.html?grade=${g}&unit=${n}`;
    if (skill === 'pronunciation' && g === '10' && n !== '3') return `practice.html?unit=${n}&skill=pronunciation`;
    return `skills.html?grade=${g}&unit=${n}&skill=${skill}`;
  }
  function art(g, n) {
    const unit = content.units[g][n];
    return `<div class="tranh journey-art" data-print-grade="${g}" data-print-unit="${n}">${content.prints[unit.print]}</div>`;
  }
  root.innerHTML = `<span class="journey-anchor" id="studio-grade10" aria-hidden="true"></span><span class="journey-anchor" id="studio-grade11" aria-hidden="true"></span><section class="journey-time" aria-labelledby="journey-time-title">
    <div><p class="eyebrow">A little practice, every day</p><h2 id="journey-time-title">Your learning rhythm</h2><p>Chuỗi ngày học · A day counts after at least 5 minutes of practice.</p></div>
    <div class="journey-metrics"><div><strong id="journey-streak">0</strong><span>day streak · chuỗi ngày</span></div><div><strong id="journey-minutes">0</strong><span>minutes this week · phút tuần này</span></div></div>
    <ol class="journey-week" id="journey-week" aria-label="Your week, Monday to Sunday"></ol>
  </section>
  <section class="journey-gallery" aria-labelledby="journey-gallery-title">
    <div class="journey-gallery-heading"><div><p class="eyebrow">Your Dong Ho collection</p><h2 id="journey-gallery-title">One unit. Five printing layers.</h2></div><div class="journey-grades" role="group" aria-label="Choose your print collection"><button type="button" data-journey-grade="10">Grade 10</button><button type="button" data-journey-grade="11">Grade 11</button></div></div>
    <p class="journey-description">Finish a skill to print its colour. Writing adds the black ink last. All five layers earn a red seal.</p>
    <ul class="journey-legend">${content.skills.map(s => `<li><i style="--swatch:var(--l${s.index})" aria-hidden="true"></i>${s.label}<span>${s.colour}</span></li>`).join('')}</ul>
    <div class="journey-print-grid" id="journey-prints"></div>
    <details class="journey-future"><summary>More units</summary><div class="journey-future-grid" id="journey-future"></div></details>
  </section>
  <details class="journey-help"><summary>How colours and study time work</summary><ul><li>For Grammar and Listening, answer every question and check every activity in the unit. Read the feedback; you can always try again.</li><li>For Pronunciation, check the quiz and confirm that you have listened and practised aloud.</li><li>For Writing, revise your draft, stay within the word limit and review the checklist. Writing can be finished early; its ink waits until the other four skills are complete.</li><li>Wordwall completion is self-confirmed after you return. Opening a link does not earn a colour. Wordwall does not send a score to this website.</li><li>Time counts only on a visible, focused practice page here. The gallery, hidden tabs, Wordwall and ChatGPT tabs do not add study minutes. The week begins on Monday, using your device’s date.</li></ul></details>
  <p class="journey-local-note" id="journey-storage-note">Your progress stays in this browser on this device. It does not sync to other devices.</p>`;
  const weekdays = ['Mon · T2','Tue · T3','Wed · T4','Thu · T5','Fri · T6','Sat · T7','Sun · CN'];
  function renderTime() {
    const time = journey.timeSummary();
    document.getElementById('journey-streak').textContent = time.streak;
    document.getElementById('journey-minutes').textContent = time.minutes;
    document.getElementById('journey-week').innerHTML = time.days.map((day,i) => `<li class="${day.qualified?'qualified ':''}${day.today?'today ':''}${day.future?'future':''}" ${day.today?'aria-current="date"':''} aria-label="${weekdays[i]}, ${day.key}: ${day.future?'upcoming':day.minutes+' minutes'+(day.qualified?', study day complete':'')}"><span>${weekdays[i]}</span><b aria-hidden="true">${day.qualified?'✓':day.date}</b><small>${day.future?'—':day.minutes+' min'}</small></li>`).join('');
    document.getElementById('journey-storage-note').textContent = journey.storageAvailable
      ? 'Your progress stays in this browser on this device. It does not sync to other devices.'
      : 'Browser storage is unavailable. Progress is kept for this visit only and may be lost when you leave.';
  }
  function updatePrints() {
    document.querySelectorAll('[data-print-grade]').forEach(frame => {
      const g = frame.dataset.printGrade, n = frame.dataset.printUnit, stats = journey.unitStats(g,n);
      const svg = frame.querySelector('svg');
      stats.skills.slice(0,4).forEach(skill => svg.style.setProperty(`--o${skill.index}`, skill.done ? '1' : '0'));
      frame.classList.toggle('is-ink', stats.ink);
      frame.classList.toggle('is-complete', stats.finished);
      svg.setAttribute('aria-label', `${content.units[g][n].printName} · Grade ${g} Unit ${n} · ${stats.printed} of 5 layers printed`);
      const seal = svg.querySelector('.seal text'), title = svg.querySelector('.ttl');
      if (seal) seal.textContent = '★';
      if (title) title.textContent = `Unit ${n}`;
    });
    document.querySelectorAll('[data-journey-unit]').forEach(card => {
      const n = card.dataset.journeyUnit, stats = journey.unitStats(grade,n);
      const status = card.querySelector('.journey-print-status');
      status.textContent = stats.finished ? 'Dấu son · Print complete!' : `${stats.printed} / 5 layers printed${stats.skills[4].done?' · Writing ready; ink prints last.':''}`;
      card.querySelector('progress').value = stats.printed;
      card.querySelectorAll('[data-layer]').forEach(link => {
        const skill = stats.skills.find(s => s.id === link.dataset.layer);
        const pending = skill.id === 'writing' && skill.done && !stats.finished;
        link.classList.toggle('is-done', skill.done && !pending);
        link.classList.toggle('is-pending', pending);
        link.querySelector('small').textContent = pending ? 'Ready · prints last' : skill.done ? '✓ Complete' : `${skill.count} / ${skill.total} activities`;
      });
      const next = stats.skills.find(s => s.total && !s.done) || stats.skills[2];
      card.querySelector('.journey-continue').href = skillUrl(grade,n,next.id);
      card.querySelector('.journey-continue').textContent = stats.finished ? 'Practise again →' : 'Continue this print →';
    });
    renderTime();
  }
  function renderGallery() {
    try { localStorage.setItem('ec:self-study:grade',grade); } catch { /* Remember for this visit. */ }
    root.querySelectorAll('[data-journey-grade]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.journeyGrade === grade)));
    document.getElementById('journey-prints').innerHTML = Object.entries(content.units[grade]).filter(([,u]) => u.print).map(([n,u]) => `<article class="journey-print-card" data-journey-unit="${n}" aria-labelledby="journey-g${grade}-u${n}"><div class="journey-picture">${art(grade,n)}<p class="journey-art-name">${escape(u.printName)}</p></div><div class="journey-print-info"><p class="eyebrow">Grade ${grade} · Unit ${n}</p><h3 id="journey-g${grade}-u${n}">${escape(u.title)}</h3><p class="journey-print-status"></p><progress max="5" value="0" aria-label="Unit ${n}: printing layers completed"></progress><ul class="journey-skills">${content.skills.map(s => `<li><a data-layer="${s.id}" href="${skillUrl(grade,n,s.id)}"><i style="--swatch:var(--l${s.index})" aria-hidden="true"></i><span>${s.label}</span><small></small></a></li>`).join('')}</ul><a class="button journey-continue" href="grammar.html?grade=${grade}&unit=${n}">Continue this print →</a></div></article>`).join('');
    document.getElementById('journey-future').innerHTML = Object.entries(content.units[grade]).filter(([,u]) => !u.print).map(([n,u]) => {
      const ready = Object.keys(u.activities).length > 0;
      const href = grade === '11' ? '#grade11' : '#unit3';
      return `<article class="journey-coming ${ready?'has-activities':''}" ${ready?'':'aria-disabled="true"'}><div class="journey-empty-frame" aria-hidden="true"><span>${String(n).padStart(2,'0')}</span></div><h3>Unit ${n}</h3><p>${escape(u.title)}</p><span>${ready?'Tranh đang chuẩn bị':'Chưa mở · Not open yet'}</span>${ready?`<a href="${href}">Activities are available →</a>`:''}</article>`;
    }).join('');
    const featured = document.getElementById('journey-featured-print');
    if (featured) featured.innerHTML = art(grade,'1') + `<p class="journey-featured-caption">Grade ${grade} · Unit 1</p>`;
    updatePrints();
  }
  root.addEventListener('click', event => {
    const button = event.target.closest('[data-journey-grade]');
    if (!button || button.dataset.journeyGrade === grade) return;
    grade = button.dataset.journeyGrade;
    renderGallery();
  });
  window.addEventListener('hashchange', () => {
    const next = gradeFromHash();
    if (next && next !== grade) { grade=next; renderGallery(); }
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
  renderGallery();
})();
