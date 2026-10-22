/* =========================================================================
   _board.js — luật chơi chung cho các trò của Global Success 10.
   Tệp trò chỉ khai báo window.GAME rồi nạp _game.js + _board.js:

   GAME = {
     title, sub,                 tên trò + dòng phụ (Unit · Lesson)
     theme: 'music' | 'community' | 'invent',
     mode:  'board' | 'ladder' | 'cards',
     teams: ['Team 1', …]        bỏ trống = 4 đội; [] = không chấm điểm
     step: 10,                   mỗi lần bấm + / − cộng trừ bao nhiêu
     rules: ['…'],               luật đọc to ở màn mở đầu
     cols: 4,                    số cột của bảng ô
     cats: ['…'],                (tuỳ chọn) bảng kiểu Jeopardy: mỗi cột một chủ đề
     items: [{ label, cat, pts, q, opts, a, why, hint, clues, cluePts, backup, img }],
     boxes: [20, -10, 'x2', …],  (tuỳ chọn) mở hộp bí ẩn sau mỗi câu đúng
     ladder: ['100', …], safe: [4, 9]   (mode 'ladder')
     cards: [{ word, ban: [...], note }], time: 60   (mode 'cards')
     credit: '…'                 ghi nguồn nếu ý tưởng lấy từ nơi khác
   }

   a = số thứ tự phương án đúng (0 = A) khi có opts; = chữ đáp án khi không có.
   Không log, không localStorage, không gọi mạng — F5 là chơi lại từ đầu.
   ========================================================================= */
(function () {
  var G = window.GAME || {};
  var L = 'ABCDEFGH';
  var teams = G.teams === undefined ? ['Team 1', 'Team 2', 'Team 3', 'Team 4'] : G.teams;
  var step = G.step || 10;
  var scores = teams.map(function () { return 0; });
  if (G.theme) document.body.classList.add('theme-' + G.theme);
  document.title = G.title || 'Game';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function shuffle(a) {
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  /* ---------- khung: thanh trên + vùng chính ---------- */
  var top = el('header', 'g-top');
  top.appendChild(el('h1', 'g-title', (G.title || '') + (G.sub ? '<small>' + G.sub + '</small>' : '')));
  var teamBox = el('div', 'g-teams');
  var teamEls = teams.map(function (name, i) {
    var t = el('span', 'team', name + ' <button type="button" aria-label="minus"><span>−</span></button>' +
      '<b>0</b><button type="button" aria-label="plus"><span>+</span></button>');
    var bs = t.querySelectorAll('button');
    bs[0].onclick = function () { add(i, -step); };
    bs[1].onclick = function () { add(i, step); };
    teamBox.appendChild(t);
    return t;
  });
  top.appendChild(teamBox);
  var tools = el('div', 'g-tools');
  var homeBtn = el('button', '', '⌂ Home'); homeBtn.type = 'button';
  tools.appendChild(homeBtn);
  top.appendChild(tools);
  document.body.appendChild(top);
  var main = el('main', 'g-main');
  document.body.appendChild(main);
  if (G.credit) main.appendChild(el('span', 'credit', G.credit));

  function add(i, d) {
    if (i < 0 || i >= scores.length) return;
    scores[i] += d;
    teamEls[i].querySelector('b').textContent = scores[i];
    teamEls[i].classList.remove('flash'); void teamEls[i].offsetWidth; teamEls[i].classList.add('flash');
  }

  var screens = {};
  function screen(name) {
    var s = el('section', 'screen ' + name);
    main.appendChild(s); screens[name] = s; return s;
  }
  function show(name) {
    for (var k in screens) screens[k].classList.toggle('on', k === name);
  }

  /* ---------- màn mở đầu ---------- */
  var intro = screen('intro');
  intro.appendChild(el('p', 'big', G.title || ''));
  if (G.tag) intro.appendChild(el('p', 'tag', G.tag));
  if (G.rules && G.rules.length) {
    var ol = el('ol');
    G.rules.forEach(function (r) { ol.appendChild(el('li', '', r)); });
    intro.appendChild(ol);
  }
  var go = el('button', 'go', '▶ Play'); go.type = 'button';
  intro.appendChild(go);
  homeBtn.onclick = function () { show('intro'); };

  /* ---------- màn kết ---------- */
  var end = screen('end');
  function finish(msg) {
    end.innerHTML = '';
    end.appendChild(el('p', 'big', '🏆 ' + (msg || 'Well done!')));
    if (teams.length) {
      var best = Math.max.apply(null, scores);
      var win = teams.filter(function (t, i) { return scores[i] === best; });
      end.appendChild(el('p', '', (win.length === teams.length ? 'It’s a draw!' : 'Winner: <b>' + win.join(' & ') + '</b>') +
        ' — ' + best + ' points'));
    }
    var again = el('button', 'go', '↺ Play again'); again.type = 'button';
    again.onclick = function () { location.reload(); };
    end.appendChild(again);
    show('end');
  }

  /* ---------- câu hỏi dùng chung cho board / ladder ---------- */
  function questionCard(item, opts) {
    // opts: {kick, onDone(correct), fifty, nextLabel}
    var card = el('div', 'card');
    card.appendChild(el('span', 'kick', opts.kick || ''));
    var cur = item;
    var body = el('div', '');
    card.appendChild(body);
    var hint = el('div', 'hint-box'); card.appendChild(hint);
    var rev = el('div', 'reveal-box'); card.appendChild(rev);
    var bar = el('div', 'actions'); card.appendChild(bar);
    var bHint = el('button', '', '💡 Hint'); bHint.type = 'button';
    var bClue = el('button', '', '➕ Next clue'); bClue.type = 'button';
    var bFifty = el('button', 'life', '50 : 50'); bFifty.type = 'button';
    var bAns = el('button', 'main', '✓ Answer'); bAns.type = 'button';
    var bBack = el('button', '', '↺ Backup question'); bBack.type = 'button';
    var bNext = el('button', '', opts.nextLabel || '▦ Back to board'); bNext.type = 'button';
    [bHint, bClue, bFifty, bAns, bBack, bNext].forEach(function (b) { bar.appendChild(b); });
    var answered = false, clueN = 1, optEls = [];

    function render(it) {
      cur = it; answered = false; optEls = [];
      body.innerHTML = ''; hint.classList.remove('on'); rev.classList.remove('on');
      if (it.img) body.appendChild(el('img', '')).src = it.img;
      if (it.clues) {
        clueN = 1;
        if (it.q) body.appendChild(el('p', 'q', it.q));
        var ul = el('ul', 'clues'); body.appendChild(ul);
        it._ul = ul; drawClues(it);
      } else {
        body.appendChild(el('p', 'q', it.q));
      }
      if (it.opts) {
        var list = el('ul', 'opts' + (it.opts.some(function (o) { return o.length > 46; }) ? ' one' : ''));
        it.opts.forEach(function (o, i) {
          var li = el('li');
          var b = el('button', 'opt', '<b>' + L[i] + '.</b><span>' + o + '</span>'); b.type = 'button';
          b.onclick = function () { pick(i); };
          li.appendChild(b); list.appendChild(li); optEls.push(b);
        });
        body.appendChild(list);
      }
      bHint.hidden = !it.hint;
      bClue.hidden = !(it.clues && it.clues.length > 1);
      bFifty.hidden = !(opts.fifty && it.opts && it.opts.length > 2);
      bBack.hidden = !it.backup || it === item.backup;
      bAns.hidden = false;
    }
    function drawClues(it) {
      it._ul.innerHTML = '';
      for (var i = 0; i < clueN; i++) {
        var p = it.cluePts && it.cluePts[i] !== undefined ? '<span class="pts">' + it.cluePts[i] + ' pts</span>' : '';
        it._ul.appendChild(el('li', '', p + it.clues[i]));
      }
      bClue.hidden = clueN >= it.clues.length;
    }
    function answerText(it) {
      if (it.opts && typeof it.a === 'number') return L[it.a] + '. ' + it.opts[it.a];
      return it.a;
    }
    function reveal(correct) {
      if (answered) return;
      answered = true;
      if (cur.opts && typeof cur.a === 'number') optEls[cur.a].classList.add('right');
      rev.innerHTML = '✓ ' + answerText(cur) + (cur.why ? '<span class="why">' + cur.why + '</span>' : '');
      rev.classList.add('on');
      bAns.hidden = true; bClue.hidden = true;
      if (opts.onDone) opts.onDone(correct !== false, cur);
    }
    function pick(i) {
      if (answered) return;
      if (typeof cur.a !== 'number') return;
      if (i === cur.a) { reveal(true); }
      else {
        optEls[i].classList.add('wrong'); optEls[i].disabled = true;
        if (opts.wrongEnds) reveal(false);
      }
    }
    bHint.onclick = function () { hint.innerHTML = '💡 ' + cur.hint; hint.classList.add('on'); };
    bClue.onclick = function () { clueN++; drawClues(cur); };
    bAns.onclick = function () { reveal(); };
    bBack.onclick = function () { render(item.backup); card.querySelector('.kick').textContent = (opts.kick || '') + ' · Backup'; };
    bFifty.onclick = function () {
      bFifty.disabled = true; opts.fiftyUsed && opts.fiftyUsed();
      var wrong = [];
      cur.opts.forEach(function (o, i) { if (i !== cur.a) wrong.push(i); });
      shuffle(wrong).slice(0, cur.opts.length - 2).forEach(function (i) { optEls[i].classList.add('gone'); });
    };
    bNext.onclick = function () { opts.onNext && opts.onNext(); };
    if (opts.fiftyGone) bFifty.disabled = true;
    render(item);
    return card;
  }

  /* ---------- MODE: board ---------- */
  function startBoard() {
    var bScreen = screen('board-s');
    var qScreen = screen('q-s');
    var boxScreen = screen('box-s');
    var items = G.items || [];
    var board = el('div', 'board');
    bScreen.appendChild(board);
    var doneN = 0;
    var tiles = [];

    if (G.cats) {
      board.classList.add('cats');
      board.style.setProperty('--cols', G.cats.length);
      G.cats.forEach(function (c) { board.appendChild(el('div', 'cat-head', c)); });
      var rows = Math.max.apply(null, G.cats.map(function (c, ci) {
        return items.filter(function (it) { return it.cat === ci; }).length;
      }));
      for (var r = 0; r < rows; r++) {
        G.cats.forEach(function (c, ci) {
          var it = items.filter(function (x) { return x.cat === ci; })[r];
          if (it) addTile(it, it.pts || (r + 1) * 100, '');
          else board.appendChild(el('div'));
        });
      }
    } else {
      board.style.setProperty('--cols', G.cols || Math.min(5, Math.ceil(Math.sqrt(items.length * 1.6))));
      items.forEach(function (it, i) { addTile(it, it.label || String(i + 1), it.tileSub || G.tileSub || ''); });
    }
    function addTile(it, label, sub) {
      var t = el('button', 'tile', label + (sub ? '<small>' + sub + '</small>' : '')); t.type = 'button';
      t.onclick = function () { open(it, t, label); };
      board.appendChild(t); tiles.push(t);
    }
    function open(it, tile, label) {
      qScreen.innerHTML = '';
      var lastCorrect = false;
      qScreen.appendChild(questionCard(it, {
        kick: (G.cats ? G.cats[it.cat] + ' · ' : 'Question ') + label,
        onDone: function (ok) {
          lastCorrect = ok;
          if (!tile.classList.contains('done')) { tile.classList.add('done'); doneN++; }
          if (G.boxes && ok) {
            var b = el('button', '', '🎁 Mystery box'); b.type = 'button';
            b.onclick = openBoxes;
            qScreen.querySelector('.actions').insertBefore(b, qScreen.querySelector('.actions').lastChild);
          }
        },
        onNext: back
      }));
      show('q-s');
    }
    function back() {
      if (doneN >= tiles.length && !G.noEnd) finish(G.endMsg); else show('board-s');
    }
    function openBoxes() {
      boxScreen.innerHTML = '';
      boxScreen.appendChild(el('p', 'give', 'Choose one box!'));
      var row = el('div', 'boxes'); boxScreen.appendChild(row);
      var vals = shuffle(G.boxes.slice()).slice(0, 3);
      var give = el('div', 'give');
      vals.forEach(function (v, i) {
        var b = el('button', 'mbox', '🎁<span>' + (i + 1) + '</span>'); b.type = 'button';
        b.onclick = function () {
          if (row.classList.contains('picked')) return;
          row.classList.add('picked');
          Array.prototype.forEach.call(row.children, function (x) { if (x !== b) x.classList.add('dim'); });
          var neg = typeof v === 'number' && v < 0;
          b.classList.add('open'); if (neg) b.classList.add('neg');
          b.innerHTML = typeof v === 'number' ? (v > 0 ? '+' : '') + v : v;
          if (typeof v === 'number' && teams.length) {
            give.innerHTML = 'Keep it or give it away? Tap the team that gets it:<br>';
            teams.forEach(function (t, ti) {
              var tb = el('button', '', t); tb.type = 'button';
              tb.onclick = function () { add(ti, v); back(); };
              give.appendChild(tb);
            });
          } else {
            give.innerHTML = '<b>' + v + '</b> — the teacher applies it to the scores.<br>';
            var ok = el('button', '', 'OK'); ok.type = 'button'; ok.onclick = back; give.appendChild(ok);
          }
        };
        row.appendChild(b);
      });
      boxScreen.appendChild(give);
      show('box-s');
    }
    go.onclick = function () { show('board-s'); };
  }

  /* ---------- MODE: ladder (kiểu "Who wants to be a millionaire") ---------- */
  function startLadder() {
    var s = screen('ladder-s');
    var wrap = el('div', 'ladder-wrap'); s.appendChild(wrap);
    var qBox = el('div', ''); qBox.style.display = 'flex'; qBox.style.minHeight = '0';
    wrap.appendChild(qBox);
    var prizes = G.ladder || G.items.map(function (x, i) { return String((i + 1) * 100); });
    var lad = el('ul', 'ladder'); wrap.appendChild(lad);
    var rungs = prizes.map(function (p, i) {
      var li = el('li', (G.safe || []).indexOf(i) >= 0 ? 'safe' : '', '<span>' + (i + 1) + '</span><span>' + p + '</span>');
      lad.appendChild(li); return li;
    });
    var n = 0, fiftyUsed = false;
    function ask() {
      rungs.forEach(function (r, i) { r.classList.toggle('now', i === n); r.classList.toggle('won', i < n); });
      qBox.innerHTML = '';
      var c = questionCard(G.items[n], {
        kick: 'Question ' + (n + 1) + ' of ' + G.items.length + ' · for ' + prizes[n],
        fifty: true, fiftyGone: fiftyUsed, fiftyUsed: function () { fiftyUsed = true; },
        nextLabel: n + 1 < G.items.length ? '➜ Next question' : '🏁 Finish',
        onNext: function () { n++; if (n < G.items.length) ask(); else finish(G.endMsg || 'You did it!'); }
      });
      c.style.flex = '1 1 auto';
      qBox.appendChild(c);
    }
    go.onclick = function () { ask(); show('ladder-s'); };
  }

  /* ---------- MODE: cards (taboo / charades) ---------- */
  function startCards() {
    var s = screen('cards-s');
    var deck = el('div', 'deck'); s.appendChild(deck);
    var card = el('div', 'wcard'); deck.appendChild(card);
    var side = el('div', 'side'); deck.appendChild(side);
    var timer = el('div', 'timer', '0:00'); side.appendChild(timer);
    function btn(label, cls, fn) { var b = el('button', cls || '', label); b.type = 'button'; b.onclick = fn; side.appendChild(b); return b; }
    var cards = G.shuffle === false ? G.cards.slice() : shuffle(G.cards.slice());
    var i = 0, left = G.time || 60, tick = null;
    function draw() {
      var c = cards[i];
      card.innerHTML = '<span class="count">Card ' + (i + 1) + ' / ' + cards.length + '</span>' +
        '<div class="word">' + c.word + '</div>' +
        (c.note ? '<div class="note">' + c.note + '</div>' : '') +
        (c.ban && c.ban.length ? '<div class="ban">' + (G.banLabel || 'Don’t say:') + '</div><ul>' +
          c.ban.map(function (w) { return '<li>' + w + '</li>'; }).join('') + '</ul>' : '');
    }
    function fmt(t) { return Math.floor(t / 60) + ':' + ('0' + (t % 60)).slice(-2); }
    function reset() { clearInterval(tick); tick = null; left = G.time || 60; timer.textContent = fmt(left); timer.classList.remove('low'); bStart.textContent = '▶ Start timer'; }
    var bStart = btn('▶ Start timer', '', function () {
      if (tick) { clearInterval(tick); tick = null; bStart.textContent = '▶ Start timer'; return; }
      bStart.textContent = '⏸ Pause';
      tick = setInterval(function () {
        left--; timer.textContent = fmt(Math.max(left, 0)); timer.classList.toggle('low', left <= 10);
        if (left <= 0) { clearInterval(tick); tick = null; bStart.textContent = '⏰ Time!'; }
      }, 1000);
    });
    btn('↺ Reset timer', '', reset);
    btn('✓ Next card', 'main', function () { if (i < cards.length - 1) { i++; draw(); } else finish(G.endMsg || 'All cards done!'); });
    btn('← Previous', '', function () { if (i > 0) { i--; draw(); } });
    btn('🙈 Hide / Show', '', function () { card.classList.toggle('hidden'); });
    reset(); draw();
    go.onclick = function () { show('cards-s'); };
  }

  if (G.mode === 'ladder') startLadder();
  else if (G.mode === 'cards') startCards();
  else startBoard();
  show('intro');
})();
