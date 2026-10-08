/* ==========================================================================
   gs10.js — bộ khung dùng chung cho bài giảng Global Success 10
   --------------------------------------------------------------------------
   Ba việc, tệp nào nạp cũng chỉ chạy phần liên quan:
     1. initOverlay()  — bản đồ: bấm ghim mở popup, KHÔNG reload trang
     2. initDeck()     — trang bài: chuyển slide, lật đáp án
     3. initEmbedded() — khi trang đang nằm trong popup: Esc báo cha đóng lại

   KHÔNG phải module ES: trình duyệt chặn `import` trên file:// (CORS), nên
   tệp này nạp bằng <script src="gs10.js"> thường. Đừng thêm type="module".

   KHÔNG fetch · KHÔNG localStorage · KHÔNG gọi core/ · KHÔNG ghi log.
   Trạng thái chỉ nằm trong bộ nhớ (SITE-SPEC §0.4 — ngoài phạm vi đo lường).

   Vì sao popup dùng <iframe> chứ không fetch + innerHTML: fetch bị chặn trên
   file://, mà yêu cầu là chạy được khi mất mạng. iframe chạy cả file:// lẫn
   web, và giữ được điều quan trọng nhất — mỗi bài vẫn là một trang HTML độc
   lập, mở thẳng vẫn đúng, sửa riêng không đụng bài khác.
   ========================================================================== */

(function () {
  'use strict';

  var EMBEDDED = (function () {
    try { return window.self !== window.top; } catch (e) { return true; }
  })();

  /* =======================================================================
     1. BẢN ĐỒ — mở bài trong popup
     ======================================================================= */

  function initOverlay() {
    // Trang đang nằm TRONG popup thì link chỉ được đi tiếp bên trong iframe.
    // Không có luật này thì bấm một tiết ở mục lục unit sẽ mở popup lồng popup.
    if (EMBEDDED) return;

    var links = document.querySelectorAll('a.pin, a[data-popup]');
    if (!links.length) return;

    var overlay, frame, lastFocus;

    function build() {
      overlay = document.createElement('div');
      overlay.className = 'overlay';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.hidden = false;

      var wrap = document.createElement('div');
      wrap.className = 'frame-wrap';

      frame = document.createElement('iframe');
      frame.setAttribute('title', 'Bài giảng');
      frame.setAttribute('allow', 'fullscreen');

      var close = document.createElement('button');
      close.type = 'button';
      close.className = 'close';
      close.setAttribute('aria-label', 'Đóng bài giảng');
      close.innerHTML = '&times;';
      close.addEventListener('click', hide);

      wrap.appendChild(frame);
      wrap.appendChild(close);
      overlay.appendChild(wrap);

      // Bấm ra vùng tối bên ngoài cũng đóng
      overlay.addEventListener('click', function (ev) {
        if (ev.target === overlay) hide();
      });

      document.body.appendChild(overlay);
    }

    function show(url, label) {
      if (!overlay) build();
      lastFocus = document.activeElement;
      frame.src = url;
      frame.setAttribute('title', label || 'Bài giảng');
      overlay.classList.add('is-open');
      document.body.classList.add('is-locked');
      // Đợi iframe dựng xong rồi mới chuyển tiêu điểm, để phím mũi tên
      // đi thẳng vào bài chứ không ở lại bản đồ.
      frame.addEventListener('load', function once() {
        frame.removeEventListener('load', once);
        try { frame.contentWindow.focus(); } catch (e) { frame.focus(); }
      });
    }

    function hide() {
      if (!overlay || !overlay.classList.contains('is-open')) return;
      overlay.classList.remove('is-open');
      document.body.classList.remove('is-locked');
      frame.src = 'about:blank';           // dừng audio/video đang phát
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    Array.prototype.forEach.call(links, function (a) {
      a.addEventListener('click', function (ev) {
        // Ctrl/Cmd/giữa chuột: để trình duyệt mở tab mới như bình thường
        if (ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.button !== 0) return;
        ev.preventDefault();
        show(a.getAttribute('href'), a.textContent.trim());
      });
    });

    // Trang con nằm trong popup gửi tin nhắn xin đóng
    window.addEventListener('message', function (ev) {
      if (ev.data && ev.data.gs10 === 'close') hide();
    });

    // Esc khi tiêu điểm còn ở bản đồ
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') hide();
    });
  }

  /* =======================================================================
     2. TRANG BÀI — slide và đáp án
     ======================================================================= */

  function initDeck() {
    var deck = document.querySelector('.deck');
    if (!deck) return;

    var slides = Array.prototype.slice.call(deck.querySelectorAll('.slide'));
    if (!slides.length) return;

    var i = 0;
    var elPrev, elNext, elCount, elDots;

    function buildNav() {
      var nav = document.createElement('nav');
      nav.className = 'deck-nav';
      nav.setAttribute('aria-label', 'Điều hướng slide');

      elPrev = document.createElement('button');
      elPrev.type = 'button';
      elPrev.textContent = '← Trước';
      elPrev.addEventListener('click', function () { go(i - 1); });

      elNext = document.createElement('button');
      elNext.type = 'button';
      elNext.textContent = 'Sau →';
      elNext.addEventListener('click', function () { go(i + 1); });

      elCount = document.createElement('span');
      elCount.className = 'count';

      elDots = document.createElement('span');
      elDots.className = 'dots';
      slides.forEach(function (s, n) {
        var d = document.createElement('i');
        d.title = 'Slide ' + (n + 1);
        elDots.appendChild(d);
      });

      var sp = document.createElement('span');
      sp.className = 'spacer';

      var hint = document.createElement('span');
      hint.className = 'count';
      hint.textContent = '← → chuyển slide · F toàn màn hình · A hiện đáp án · Esc '
                       + (EMBEDDED ? 'đóng' : 'quay lại');

      nav.appendChild(elPrev);
      nav.appendChild(elNext);
      nav.appendChild(elCount);
      nav.appendChild(elDots);
      nav.appendChild(sp);
      nav.appendChild(hint);
      document.body.appendChild(nav);
    }

    function go(n) {
      if (n < 0 || n >= slides.length) return;
      slides[i].classList.remove('is-current');
      i = n;
      var cur = slides[i];
      cur.classList.add('is-current');
      cur.scrollTop = 0;

      elPrev.disabled = (i === 0);
      elNext.disabled = (i === slides.length - 1);
      elCount.textContent = (i + 1) + ' / ' + slides.length;
      Array.prototype.forEach.call(elDots.children, function (d, n2) {
        d.className = (n2 === i) ? 'on' : '';
      });

      // Nhớ slide đang mở để F5 không mất chỗ. Trên file:// trình duyệt có thể
      // từ chối — bọc try/catch, hỏng chỗ này không được làm hỏng bài giảng.
      try { history.replaceState(null, '', '#s' + (i + 1)); } catch (e) {}
    }

    function openAnswersIn(scope) {
      Array.prototype.forEach.call(scope.querySelectorAll('.answer'), function (a) {
        a.classList.add('is-open');
      });
      Array.prototype.forEach.call(scope.querySelectorAll('.reveal'), function (b) {
        b.setAttribute('aria-expanded', 'true');
      });
    }

    function wireReveals() {
      document.addEventListener('click', function (ev) {
        var btn = ev.target.closest ? ev.target.closest('.reveal, .reveal-all') : null;
        if (!btn) return;
        ev.preventDefault();
        if (btn.classList.contains('reveal-all')) {
          openAnswersIn(btn.closest('.slide') || document);
        } else {
          openAnswersIn(btn.closest('.q') || btn.parentNode);
        }
      });

      slides.forEach(function (s) {
        if (!s.querySelector('.answer')) return;
        if (s.querySelector('.reveal-all')) return;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'reveal-all';
        b.textContent = 'Hiện hết đáp án';
        s.appendChild(b);
        // Chỉ slide NÀO có nút này mới cần đệm dưới dày. Slide không có đáp án
        // được dùng thêm ~24px chiều cao — đủ cứu một dòng chữ 24 pt.
        s.classList.add('has-reveal-all');
      });
    }

    function toggleFullscreen() {
      if (document.fullscreenElement) { document.exitFullscreen(); }
      else if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(function () {});
      }
    }

    function wireKeys() {
      document.addEventListener('keydown', function (ev) {
        if (ev.ctrlKey || ev.altKey || ev.metaKey) return;
        var t = ev.target.tagName;
        if (t === 'INPUT' || t === 'TEXTAREA') return;

        switch (ev.key) {
          case 'ArrowRight': case 'PageDown': case ' ':
            ev.preventDefault(); go(i + 1); break;
          case 'ArrowLeft': case 'PageUp':
            ev.preventDefault(); go(i - 1); break;
          case 'Home':
            ev.preventDefault(); go(0); break;
          case 'End':
            ev.preventDefault(); go(slides.length - 1); break;
          case 'f': case 'F':
            ev.preventDefault(); toggleFullscreen(); break;
          case 'a': case 'A':
            ev.preventDefault(); openAnswersIn(slides[i]); break;
          case 'Escape':
            if (document.fullscreenElement) { document.exitFullscreen(); }
            else { leave(); }
            break;
        }
      });
    }

    buildNav();
    wireReveals();
    wireKeys();

    var start = 0;
    var m = /^#s(\d+)$/.exec(window.location.hash || '');
    if (m) {
      var n = parseInt(m[1], 10) - 1;
      if (n >= 0 && n < slides.length) start = n;
    }
    slides.forEach(function (s) { s.classList.remove('is-current'); });
    i = start;
    slides[start].classList.add('is-current');
    go(start);
  }

  /* =======================================================================
     3. KHI ĐANG NẰM TRONG POPUP
     ======================================================================= */

  /* Rời trang. Trong popup, cấp cuối (data-back="map") thì đóng hẳn popup;
     cấp trong (data-back="unit") thì lùi một bậc ngay bên trong iframe —
     bản đồ phía sau vẫn nguyên, không reload. Mở thẳng thì đi theo link. */
  function close2parent() {
    try { window.parent.postMessage({ gs10: 'close' }, '*'); } catch (e) {}
  }

  function leave() {
    var back = document.querySelector('.bar a[data-back]');
    if (EMBEDDED && (!back || back.getAttribute('data-back') === 'map')) {
      close2parent();
      return;
    }
    if (back) window.location.href = back.href;
  }

  function initEmbedded() {
    if (!EMBEDDED) return;
    document.documentElement.setAttribute('data-embedded', 'true');

    // Link "← Bản đồ" bên trong popup: đóng popup, đừng nạp bản đồ lồng
    // vào chính nó.
    var toMap = document.querySelector('.bar a[data-back="map"]');
    if (toMap) {
      toMap.textContent = '✕ Đóng';
      toMap.addEventListener('click', function (ev) {
        ev.preventDefault();
        close2parent();
      });
    }

    // Trang mục lục không có deck nên chưa bắt phím — bắt ở đây.
    if (!document.querySelector('.deck')) {
      document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape') { ev.preventDefault(); leave(); }
      });
    }
  }


  /* =======================================================================
     4. VIDEO YOUTUBE — nạp chậm
     =======================================================================
     Chỉ tạo <iframe> khi cô bấm nút. Ba lý do, cả ba đều thật:
       1. Chưa bấm thì YouTube không biết có ai mở slide — trong phòng có học sinh.
       2. Slide không phải chờ mạng lúc mở, chuyển slide vẫn mượt khi mạng yếu.
       3. Mất mạng thì báo bằng chữ, không để lại ô đen giữa tiết.

     Dùng youtube-nocookie.com: chưa phát thì không đặt cookie theo dõi.
     rel=0 + modestbranding=1: hết video đỡ nhảy ra clip lạ trước mặt cả lớp.

     ĐÂY LÀ CHỖ DUY NHẤT TRONG MODULE CẦN INTERNET. Xem GLOBAL-SUCCESS-10.md §2.4a.
     ======================================================================= */

  function initVideos() {
    var vids = document.querySelectorAll('.video[data-yt]');
    if (!vids.length) return;

    Array.prototype.forEach.call(vids, function (box) {
      var btn = box.querySelector('.video-play');
      if (!btn) return;

      btn.addEventListener('click', function () {
        if (navigator.onLine === false) {
          box.classList.add('offline');
          var t = box.querySelector('.t'), s = box.querySelector('.s');
          if (t) t.textContent = 'Máy đang không có mạng';
          if (s) s.textContent = 'Video cần Internet — dùng phương án dự phòng ở dưới.';
          return;
        }
        var f = document.createElement('iframe');
        f.src = 'https://www.youtube-nocookie.com/embed/' + box.getAttribute('data-yt')
              + '?autoplay=1&rel=0&modestbranding=1';
        f.title = box.getAttribute('data-title') || 'Video';
        f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        f.referrerPolicy = 'strict-origin-when-cross-origin';
        f.setAttribute('allowfullscreen', '');
        box.innerHTML = '';
        box.appendChild(f);
      });
    });
  }
  /* ---------------------------------------------------------------------- */

  initEmbedded();
  initOverlay();
  initDeck();
  initVideos();
})();
