#!/usr/bin/env python3
"""
shoot-slides.py — chụp từng slide của một tiết ở khổ máy chiếu 1366×768 bằng
Chrome chạy ngầm, rồi ghép thành ảnh soi 6 slide một tấm.

Vì sao có tệp này: kiểm "có tràn không" bằng số (scrollHeight) là chưa đủ —
chữ đè hình nền, số thứ tự trùng, ảnh méo chỉ thấy bằng mắt.

Cách chạy (cần một server tĩnh đang phục vụ thư mục Global_Success_11, vì
trang mở bằng file:// thì Chrome chạy ngầm không nạp được audio/iframe):
    python3 -m http.server 8811 --directory Global_Success_11   (cửa sổ khác)
    python3 tools/shoot-slides.py http://localhost:8811/unit01/lesson2.html 41 /tmp/shots

Chrome ngầm chụp xong KHÔNG tự thoát — mỗi ảnh chờ tối đa 9 giây rồi tắt hẳn.
Mỗi ảnh dùng một hồ sơ Chrome tạm riêng, không đụng Chrome của người dùng.

Chỉ dùng lúc dựng bài. KHÔNG phải một phần của trang chạy.
"""
import os, shutil, subprocess, sys, tempfile
from PIL import Image, ImageDraw, ImageFont

CH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'


def shoot(url, n, out, only=None):
    os.makedirs(out, exist_ok=True)
    for i in (only or range(1, n + 1)):
        prof = tempfile.mkdtemp(prefix='gs-chrome-')
        dst = os.path.join(out, f's{i:02d}.png')
        p = subprocess.Popen([CH, '--headless=new', '--disable-gpu', '--no-first-run',
                              '--no-default-browser-check', '--mute-audio',
                              f'--user-data-dir={prof}', '--window-size=1366,768',
                              '--hide-scrollbars', '--virtual-time-budget=2500',
                              '--force-prefers-reduced-motion',   # tắt hiệu ứng vào slide: ảnh chụp không bị trắng
                              f'--screenshot={dst}', f'{url}#s{i}'],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        try:
            p.wait(timeout=9)
        except subprocess.TimeoutExpired:
            p.kill(); p.wait()
        shutil.rmtree(prof, ignore_errors=True)
        print(i, 'ok' if os.path.exists(dst) else 'FAIL', flush=True)


def sheets(out):
    f = ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf', 22)
    files = sorted(x for x in os.listdir(out) if x.startswith('s') and x.endswith('.png'))
    tw, th = 683, 384
    for k in range(0, len(files), 6):
        sheet = Image.new('RGB', (tw * 2 + 30, (th + 34) * 3 + 10), 'white')
        d = ImageDraw.Draw(sheet)
        for j, name in enumerate(files[k:k + 6]):
            x, y = 10 + (j % 2) * (tw + 10), 5 + (j // 2) * (th + 34)
            d.text((x, y), name, fill='black', font=f)
            sheet.paste(Image.open(os.path.join(out, name)).convert('RGB').resize((tw, th)), (x, y + 28))
        sheet.save(os.path.join(out, f'sheet_{k // 6 + 1}.jpg'), quality=80)
    print('sheets:', (len(files) + 5) // 6)


if __name__ == '__main__':
    url, n, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
    only = [int(x) for x in sys.argv[4].split(',')] if len(sys.argv) > 4 else None
    shoot(url, n, out, only)
    sheets(out)
