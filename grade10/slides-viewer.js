(function () {
  'use strict';
  var slides = JSON.parse(document.getElementById('slide-data').textContent);
  var image = document.getElementById('slide-image');
  var hotspots = document.getElementById('hotspots');
  var animations = document.getElementById('animations');
  var text = document.getElementById('slide-text');
  var nativeBoard = document.getElementById('live-board');
  var count = document.getElementById('slide-count');
  var chapters = document.getElementById('chapters');
  var previous = document.getElementById('previous');
  var next = document.getElementById('next');
  var gameDialog = document.getElementById('game-dialog');
  var scoreDialog = document.getElementById('score-dialog');
  var audioPanel = document.getElementById('audio-panel');
  var gameFrame = document.getElementById('game-frame');
  var names = ['BEAT BREAKERS', 'RHYTHM REBELS', 'NEON NOTES', 'SOUND CHASERS'];
  var scores = [0, 0, 0, 0], history = [], current = 1;

  function styleBox(element, box) {
    ['left', 'top', 'width', 'height'].forEach(function (name, index) { element.style[name] = box[index] + '%'; });
  }
  function go(number) {
    number = Math.max(1, Math.min(slides.length, number));
    if (!Number.isInteger(number)) return;
    current = number;
    var slide = slides[number - 1];
    nativeBoard.hidden = number !== 66;
    image.hidden = number === 66;
    if (number !== 66) {
      image.src = slide.image;
      image.alt = 'Slide ' + number + ': ' + slide.title;
    }
    text.textContent = slide.text;
    hotspots.replaceChildren();
    animations.replaceChildren();
    if (number !== 66) {
      slide.animations.forEach(function (item) {
        var animation = document.createElement('img');
        animation.className = 'slide-animation';
        animation.src = item.src;
        animation.alt = '';
        styleBox(animation, item.box);
        animations.appendChild(animation);
      });
      slide.links.forEach(function (link) {
        var button = document.createElement('button');
        button.type = 'button';
        button.className = 'hotspot';
        button.setAttribute('aria-label', link.label);
        button.title = link.label;
        button.dataset.target = String(link.target);
        styleBox(button, link.box);
        button.addEventListener('click', function () { go(link.target); });
        hotspots.appendChild(button);
      });
    }
    count.textContent = 'Slide ' + number + ' / ' + slides.length;
    previous.disabled = number === 1;
    next.disabled = number === slides.length;
    var chapter = 1;
    Array.prototype.forEach.call(chapters.options, function (option) { if (Number(option.value) <= number) chapter = Number(option.value); });
    chapters.value = String(chapter);
    document.getElementById('slide-stage').dataset.slide = String(number);
    try { window.history.replaceState(null, '', '#s' + number); } catch (_) {}
    if (number < slides.length && slides[number].image) {
      var preload = new Image();
      preload.src = slides[number].image;
    }
  }

  function renderScores() {
    document.querySelectorAll('[data-team-score]').forEach(function (node) { node.textContent = String(scores[Number(node.dataset.teamScore)]); });
    document.querySelectorAll('[data-team-name]').forEach(function (node) { if (node !== document.activeElement) node.value = names[Number(node.dataset.teamName)]; });
    document.querySelectorAll('[data-score-undo]').forEach(function (button) { button.disabled = !history.length; });
  }
  document.querySelectorAll('[data-score-grid]').forEach(function (grid) {
    names.forEach(function (name, index) {
      var card = document.createElement('article'); card.className = 'score-card';
      var input = document.createElement('input'); input.type = 'text'; input.className = 'team-name'; input.maxLength = 30;
      input.dataset.teamName = String(index); input.value = name; input.setAttribute('aria-label', 'Tên đội ' + (index + 1));
      input.addEventListener('change', function () { names[index] = input.value.trim() || names[index]; renderScores(); });
      var score = document.createElement('output'); score.className = 'team-points'; score.dataset.teamScore = String(index); score.setAttribute('aria-label', 'Điểm đội ' + (index + 1));
      var controls = document.createElement('div'); controls.className = 'score-controls';
      [-10, -5, 5, 10].forEach(function (amount) {
        var button = document.createElement('button'); button.type = 'button'; button.textContent = (amount > 0 ? '+' : '−') + Math.abs(amount);
        button.setAttribute('aria-label', (amount > 0 ? 'Cộng ' : 'Trừ ') + Math.abs(amount) + ' điểm đội ' + (index + 1));
        button.addEventListener('click', function () {
          history.push({team: index, previous: scores[index]}); if (history.length > 100) history.shift();
          scores[index] += amount; renderScores();
        }); controls.appendChild(button);
      });
      card.append(input, score, controls); grid.appendChild(card);
    });
  });
  document.querySelectorAll('[data-score-undo]').forEach(function (button) {
    button.addEventListener('click', function () { if (!history.length) return; var last = history.pop(); scores[last.team] = last.previous; renderScores(); });
  });
  document.querySelectorAll('[data-score-reset]').forEach(function (button) {
    button.addEventListener('click', function () { if (window.confirm('Đưa điểm của bốn đội về 0?')) { scores = [0, 0, 0, 0]; history = []; renderScores(); } });
  });
  document.querySelectorAll('[data-go]').forEach(function (button) { button.addEventListener('click', function () { go(Number(button.dataset.go)); }); });
  previous.addEventListener('click', function () { go(current - 1); });
  next.addEventListener('click', function () { go(current + 1); });
  chapters.addEventListener('change', function () { go(Number(chapters.value)); });
  document.getElementById('open-game').addEventListener('click', function () {
    if (!gameFrame.getAttribute('src')) gameFrame.src = gameFrame.dataset.src;
    gameDialog.showModal();
  });
  gameFrame.addEventListener('load', function () {
    try { gameFrame.contentDocument.addEventListener('keydown', function (event) { if (event.key === 'Escape') { event.preventDefault(); gameDialog.close(); document.getElementById('open-game').focus(); } }); } catch (_) {}
  });
  document.getElementById('open-scores').addEventListener('click', function () { scoreDialog.showModal(); });
  document.querySelectorAll('[data-close-dialog]').forEach(function (button) { button.addEventListener('click', function () { button.closest('dialog').close(); }); });
  document.getElementById('open-audio').addEventListener('click', function (event) {
    audioPanel.hidden = !audioPanel.hidden;
    event.currentTarget.setAttribute('aria-expanded', String(!audioPanel.hidden));
    if (!audioPanel.hidden) audioPanel.scrollIntoView({block: 'nearest'});
  });
  function fullscreen() {
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else if (document.documentElement.requestFullscreen) { document.documentElement.requestFullscreen().catch(function () {}); }
  }
  document.getElementById('fullscreen').addEventListener('click', fullscreen);
  function leave() {
    if (window.self !== window.top) window.parent.postMessage({gs10: 'close'}, window.location.origin);
    else window.location.href = 'index.html';
  }
  document.addEventListener('keydown', function (event) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || gameDialog.open || scoreDialog.open) return;
    if (event.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(event.target.tagName)) return;
    if (event.key === 'ArrowRight' || event.key === 'PageDown') { event.preventDefault(); go(current + 1); }
    else if (event.key === 'ArrowLeft' || event.key === 'PageUp') { event.preventDefault(); go(current - 1); }
    else if (event.key === 'Home') { event.preventDefault(); go(1); }
    else if (event.key === 'End') { event.preventDefault(); go(slides.length); }
    else if (event.key.toLowerCase() === 'f') { event.preventDefault(); fullscreen(); }
    else if (event.key === 'Escape') {
      if (!audioPanel.hidden) { audioPanel.hidden = true; document.getElementById('open-audio').setAttribute('aria-expanded', 'false'); }
      else if (document.fullscreenElement) document.exitFullscreen();
      else leave();
    }
  });
  window.addEventListener('hashchange', function () { var match = /^#s(\d+)$/.exec(location.hash); if (match) go(Number(match[1])); });
  renderScores();
  var match = /^#s(\d+)$/.exec(location.hash);
  go(match ? Number(match[1]) : 1);
})();
