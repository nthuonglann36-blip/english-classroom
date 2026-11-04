/* Fit the teacher's original game on narrow screens without changing its file. */
(() => {
  'use strict';
  const slide = document.querySelector('.flags-game');
  const frame = slide?.querySelector('iframe.game');
  if (!frame) return;
  function fit() {
    const style = getComputedStyle(slide);
    const width = slide.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = slide.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    if (width <= 0 || height <= 0) return;
    const gameWidth = Math.max(400, width);
    const scale = width / gameWidth;
    frame.style.width = `${gameWidth}px`;
    frame.style.height = `${height / scale}px`;
    frame.style.transformOrigin = 'top left';
    frame.style.transform = `scale(${scale})`;
  }
  if ('ResizeObserver' in window) new ResizeObserver(fit).observe(slide);
  window.addEventListener('resize', fit);
  fit();
})();
