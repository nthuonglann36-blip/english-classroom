#!/usr/bin/env python3
"""
unlock-lesson.py — mở khoá thẻ tiết trên bản đồ unit (hoặc trang Review) sau khi
dựng xong tệp lessonN.html, và cập nhật dòng ghi chú dưới bản đồ.

Cách chạy (từ thư mục Global_Success_11):
    python3 tools/unlock-lesson.py unit01 3        mở thẻ Lesson 3 của Unit 1
    python3 tools/unlock-lesson.py review1 2       mở thẻ tiết 2 của Review 1

Chỉ đổi <span … aria-disabled="true"> thành <a href="lessonN.html">, GIỮ NGUYÊN
toạ độ --x/--y/--w/--h. Tệp lessonN.html phải có sẵn, không thì dừng.

Chỉ dùng lúc dựng bài. KHÔNG phải một phần của trang chạy.
"""
import os, re, sys

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
folder, n = sys.argv[1], int(sys.argv[2])
page = os.path.join(HERE, folder, 'index.html')
if not os.path.exists(os.path.join(HERE, folder, f'lesson{n}.html')):
    sys.exit(f'Chưa có {folder}/lesson{n}.html — dựng bài trước rồi mới mở khoá.')
s = open(page, encoding='utf-8').read()

if folder.startswith('review'):
    blocks = re.findall(r'<li><div class="lesson" aria-disabled="true">.*?</div></li>', s, re.S)
    # thẻ còn khoá thứ k không nhất thiết là tiết n — tìm theo số trong <span class="no">
    for b in blocks:
        if f'<span class="no">{n}</span>' in b:
            new = (b.replace('<div class="lesson" aria-disabled="true">',
                             f'<a class="lesson" data-popup href="lesson{n}.html">')
                    .replace('</div></li>', '</a></li>')
                    .replace('Coming soon', 'Open'))
            s = s.replace(b, new)
            break
    else:
        sys.exit('Thẻ này đã mở.')
else:
    pat = re.compile(r'<span class="pin rect" aria-disabled="true"\s*\n?\s*style="([^"]*)">'
                     rf'(Lesson {n} · [^<]*?)(?: — chưa có bài giảng)?</span>')
    m = pat.search(s)
    if not m:
        sys.exit('Thẻ này đã mở hoặc không tìm thấy.')
    s = s[:m.start()] + (f'<a class="pin rect" href="lesson{n}.html"\n     style="{m.group(1)}">'
                         f'{m.group(2)}</a>') + s[m.end():]
    done = sorted(int(x) for x in re.findall(r'href="lesson(\d+)\.html"', s))
    left = 8 - len(done)
    note = (f'<b>Đã dựng: Lesson {", ".join(map(str, done))}.</b> '
            + (f'{left} thẻ còn lại đang khoá.' if left else 'Đủ cả 8 tiết.'))
    s = re.sub(r'(<p class="map-note">\s*)<b>.*?</b>[^\n]*', r'\g<1>' + note, s, count=1)

open(page, 'w', encoding='utf-8').write(s)
print('mở', folder, 'lesson', n)
