/* =========================================================================
   Việc chung của mọi trò chơi nhúng: chuyển phím điều hướng ra slide.

   Khi con trỏ đang ở trong <iframe>, phím ← → Esc không tới được trang bài
   giảng, cô sẽ tưởng slide bị treo. Đoạn này bắn lại sự kiện sang trang cha.

   Trên file:// Chrome coi mỗi tệp là một origin riêng nên với sang trang cha
   sẽ ném lỗi — nuốt lỗi, vì thanh dưới vẫn có nút "← Trước / Sau →".

   Không log, không localStorage, không gọi mạng (AGENTS.md §2.1, §2.4).
   ========================================================================= */
(function () {
  // Nen trong suot de nen slide hien len khi nhung. Nhung mo thang tep
  // trong Explorer thi trong suot hoa ra nen mac dinh cua trinh duyet —
  // to kem lai cho doc duoc (module luat 4: mo thang van phai dung).
  if (window.self === window.top) {
    document.documentElement.style.background = '#FFFAE8';
  }

  var KEYS = ['ArrowLeft', 'ArrowRight', 'Escape'];
  document.addEventListener('keydown', function (e) {
    if (KEYS.indexOf(e.key) < 0) return;
    try {
      parent.document.dispatchEvent(
        new KeyboardEvent('keydown', { key: e.key, bubbles: true })
      );
    } catch (_) { /* khác origin — bỏ qua, dùng nút ở thanh dưới */ }
  });
})();
