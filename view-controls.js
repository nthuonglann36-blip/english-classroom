/* Shared page magnification and fullscreen, including embedded lesson pages. */
(() => {
  'use strict';
  function init() {
    if (document.getElementById('ec-view-tools')) return;
    const page = document.documentElement;
    const key = 'ec:view:zoom:v1', levels = [75,100,125,150,175,200];
    let zoom = 100, expanded = false, pending = false, lastExit = 0;
    try { const stored = Number(localStorage.getItem(key)); if (levels.includes(stored)) zoom=stored; } catch { /* Viewing still works without storage. */ }
    const targets = [...document.querySelectorAll('body > main, body > .map-wrap, body > .hub, body > .map-note')];
    targets.forEach(target => target.classList.add('ec-view-content'));
    const deck = document.querySelector('main.deck');
    if (deck) page.classList.add('ec-view-on-deck');
    const deckNav = document.querySelector('.deck-nav');
    if (deckNav) {
      const placeTools = () => page.style.setProperty('--ec-view-nav-height',`${deckNav.getBoundingClientRect().height}px`);
      placeTools();
      if ('ResizeObserver' in window) new ResizeObserver(placeTools).observe(deckNav);
      else window.addEventListener('resize',placeTools);
    }
    const tools = document.createElement('aside');
    tools.lang = 'vi';
    tools.id = 'ec-view-tools'; tools.setAttribute('aria-label','Tùy chỉnh chế độ xem');
    tools.innerHTML = `<button type="button" class="ec-view-toggle" aria-expanded="false" aria-controls="ec-view-panel"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true"><circle cx="10" cy="10" r="6" stroke="currentColor" stroke-width="1.8"/><path d="m15 15 6 6M7 10h6m-3-3v6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg><span>Phóng to</span></button>
      <section id="ec-view-panel" aria-labelledby="ec-view-title" hidden>
        <div class="ec-view-panel-heading"><h2 id="ec-view-title">Chế độ xem</h2><button type="button" class="ec-view-close" aria-label="Đóng tùy chỉnh chế độ xem">×</button></div>
        <div class="ec-view-zoom" role="group" aria-label="Kích thước nội dung"><button type="button" data-view-action="smaller" aria-label="Thu nhỏ nội dung">−</button><button type="button" data-view-action="reset" title="Trở về kích thước gốc" aria-label="Trở về kích thước gốc 100%">100%</button><button type="button" data-view-action="larger" aria-label="Phóng to nội dung">+</button></div>
        <button type="button" class="ec-view-fullscreen" aria-pressed="false">⛶ <span>Toàn màn hình</span></button>
        <p class="ec-view-hint">Bấm tỷ lệ ở giữa để về 100%. Phím F: toàn màn hình · Esc: trở lại.</p>
        <p class="ec-view-status" role="status" aria-live="polite"></p>
      </section>`;
    document.body.append(tools);
    const toggle = tools.querySelector('.ec-view-toggle'), panel = tools.querySelector('#ec-view-panel');
    const smaller = tools.querySelector('[data-view-action="smaller"]'), larger = tools.querySelector('[data-view-action="larger"]');
    const reset = tools.querySelector('[data-view-action="reset"]'), full = tools.querySelector('.ec-view-fullscreen');
    const status = tools.querySelector('.ec-view-status');
    function applyZoom(announce = false) {
      page.style.setProperty('--ec-view-scale',String(zoom/100));
      targets.forEach(target => { target.style.zoom=String(zoom/100); });
      reset.textContent = `${zoom}%`;
      smaller.disabled = zoom === levels[0]; larger.disabled = zoom === levels.at(-1);
      toggle.querySelector('span').textContent = zoom === 100 ? 'Phóng to' : `Phóng to · ${zoom}%`;
      if (announce) status.textContent = `Kích thước nội dung: ${zoom}%.`;
      try { localStorage.setItem(key,String(zoom)); } catch { /* Keep the current view. */ }
    }
    function openPanel(open, restoreFocus = false) {
      panel.hidden = !open; toggle.setAttribute('aria-expanded',String(open));
      if (open) reset.focus({preventScroll:true});
      else if (restoreFocus) toggle.focus({preventScroll:true});
    }
    function updateFullscreen() {
      const active = !!document.fullscreenElement || expanded;
      full.setAttribute('aria-pressed',String(active));
      full.querySelector('span').textContent = active ? 'Thoát toàn màn hình' : 'Toàn màn hình';
      full.disabled = pending;
    }
    function setExpanded(value) {
      expanded=value; page.classList.toggle('ec-view-expanded',expanded); updateFullscreen();
      status.textContent = expanded ? 'Đã mở chế độ xem rộng. Bấm Esc hoặc nút Thoát để trở lại.' : 'Đã trở về chế độ xem thường.';
    }
    async function toggleFullscreen() {
      if (pending) return;
      if (expanded) { setExpanded(false); lastExit=Date.now(); return; }
      pending=true; updateFullscreen();
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (page.requestFullscreen && document.fullscreenEnabled !== false) await page.requestFullscreen();
        else setExpanded(true);
      } catch { setExpanded(true); }
      finally { pending=false; updateFullscreen(); }
    }
    document.addEventListener('fullscreenchange', () => {
      if (!document.fullscreenElement) lastExit=Date.now();
      updateFullscreen();
    });
    toggle.addEventListener('click', () => openPanel(panel.hidden));
    tools.querySelector('.ec-view-close').addEventListener('click', () => openPanel(false,true));
    smaller.addEventListener('click', () => { zoom=levels[Math.max(0,levels.indexOf(zoom)-1)]; applyZoom(true); });
    larger.addEventListener('click', () => { zoom=levels[Math.min(levels.length-1,levels.indexOf(zoom)+1)]; applyZoom(true); });
    reset.addEventListener('click', () => { zoom=100; applyZoom(true); });
    full.addEventListener('click',toggleFullscreen);
    document.addEventListener('click', event => {
      if (!panel.hidden && !tools.contains(event.target)) openPanel(false);
    });
    // Capture first so F/Esc and Space on our buttons cannot also change a slide.
    document.addEventListener('keydown', event => {
      const editable = event.target.isContentEditable || event.target.closest('input,textarea,select,[contenteditable="true"]');
      if (event.key === 'Escape') {
        if (document.fullscreenElement || expanded) {
          event.preventDefault(); event.stopImmediatePropagation(); toggleFullscreen();
        } else if (!panel.hidden) {
          event.preventDefault(); event.stopImmediatePropagation(); openPanel(false,true);
        } else if (Date.now()-lastExit < 350) {
          event.preventDefault(); event.stopImmediatePropagation();
        }
        return;
      }
      if (!editable && !event.ctrlKey && !event.metaKey && !event.altKey && event.key.toLowerCase() === 'f') {
        event.preventDefault(); event.stopImmediatePropagation(); toggleFullscreen(); return;
      }
      if (tools.contains(event.target)) event.stopPropagation();
    },true);
    window.addEventListener('storage', event => {
      if (event.key !== key || !levels.includes(Number(event.newValue))) return;
      zoom=Number(event.newValue); applyZoom();
    });
    applyZoom(); updateFullscreen();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
