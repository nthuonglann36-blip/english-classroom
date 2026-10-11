#!/usr/bin/env python3
"""
make-unit-maps.py — dựng 10 bản đồ unit lớp 11 từ chính bản đồ chính (map.webp).

Vì sao có tệp này: bố cục bản đồ unit cô duyệt (Global_Success_11_preview.jpg)
là bố cục ghép — nền là bản đồ chính làm mờ, 8 thẻ tiết, dải 3 ô cảnh cắt từ khu
của unit đó. Bản xem trước chỉ ~480×320 mỗi unit, chiếu lên là vỡ, nên dựng lại ở
1536×1024 từ map.webp gốc. Toạ độ thẻ lấy đúng Global_Success_11_coordinates.json.

Cách chạy (từ thư mục Global_Success_11):
    python3 tools/make-unit-maps.py
Ghi đè assets/unit01-map.webp … unit10-map.webp và in toạ độ vùng bấm.

Chỉ dùng lúc dựng bài. KHÔNG phải một phần của trang chạy.
"""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, 'assets', 'map.webp')
W, H = 1536, 1024

GREEN = (11, 90, 46)          # đúng tông nhãn ghim trên bản đồ chính
GREEN_DARK = (8, 66, 36)
CREAM = (255, 248, 225)
CREAM_LINE = (232, 217, 168)
INK = (29, 59, 42)

FONT = '/System/Library/Fonts/Avenir Next.ttc'
def font(size, face='bold'):
    return ImageFont.truetype(FONT, size, index={'bold': 0, 'demi': 2, 'heavy': 8}[face])

TITLES = {1: 'A Long and Healthy Life', 2: 'The Generation Gap', 3: 'Cities of the Future',
          4: 'ASEAN and Viet Nam', 5: 'Global Warming', 6: 'Preserving Our Heritage',
          7: 'Education Options for School-leavers', 8: 'Becoming Independent',
          9: 'Social Issues', 10: 'The Ecosystem'}

LESSONS = ['Getting Started', 'Language', 'Reading', 'Speaking', 'Listening', 'Writing',
           'Communication\n& Culture', 'Looking Back\n& Project']

# Thẻ: (x0, y0, x1, y1) của thân thẻ — đúng file toạ độ. Hàng trên 01→04 trái sang
# phải, hàng dưới 05→08 phải sang trái (đường đi vòng chữ U).
COLS = [65, 425, 785, 1145]
CARD_W, CARD_H = 327, 149
TOP_Y, BOT_Y = 231, 794
CARDS = ([(x, TOP_Y) for x in COLS] + [(x, BOT_Y) for x in reversed(COLS)])
CIRCLE_R = 40                 # vòng tròn số: tâm ở giữa thẻ, cao hơn mép thẻ 35px

# Ba ô cảnh (x, y, w) cắt từ map.webp; h = w·300/455. Không cắt ngang nhãn nào.
CROPS = {
    1: [(0, 760, 400), (60, 707, 240), (232, 706, 250)],
    2: [(40, 405, 360), (120, 470, 230), (0, 484, 218)],
    3: [(0, 0, 340), (220, 260, 230), (60, 40, 270)],
    4: [(600, 60, 310), (600, 128, 250), (700, 130, 200)],
    5: [(880, 0, 380), (1080, 166, 200), (1150, 180, 260)],
    6: [(1200, 300, 336), (1240, 434, 220), (1300, 460, 236)],
    7: [(540, 400, 300), (460, 472, 200), (720, 480, 250)],
    8: [(430, 600, 300), (560, 700, 180), (430, 668, 200)],
    9: [(1030, 555, 300), (1040, 618, 220), (1220, 618, 200)],
    10: [(1060, 820, 310), (1180, 860, 230), (1380, 820, 156)],
}
STRIP = (44, 400, 1492, 742)
PANEL_W, PANEL_H, PANEL_Y = 453, 300, 421


def rounded(im, box, r, fill=None, outline=None, width=1):
    ImageDraw.Draw(im).rounded_rectangle(box, r, fill=fill, outline=outline, width=width)


def shadow(base, box, r, offset=6, blur=9, alpha=70):
    sh = Image.new('RGBA', base.size, (0, 0, 0, 0))
    x0, y0, x1, y1 = box
    rounded(sh, (x0, y0 + offset, x1, y1 + offset), r, fill=(10, 40, 20, alpha))
    base.alpha_composite(sh.filter(ImageFilter.GaussianBlur(blur)))


def centered(d, xy, text, f, fill, spacing=4):
    d.multiline_text(xy, text, font=f, fill=fill, anchor='mm', align='center', spacing=spacing)


def dashes(d, pts, color, width=9, dash=24, gap=18):
    import math
    for (xa, ya), (xb, yb) in zip(pts, pts[1:]):
        L = math.hypot(xb - xa, yb - ya); t = 0
        while t < L:
            t1 = min(t + dash, L)
            d.line([(xa + (xb - xa) * t / L, ya + (yb - ya) * t / L),
                    (xa + (xb - xa) * t1 / L, ya + (yb - ya) * t1 / L)], fill=color, width=width)
            t += dash + gap


def build(u, src):
    # nền: bản đồ chính làm mờ + màn kem nhẹ cho thẻ nổi
    im = src.filter(ImageFilter.GaussianBlur(7)).convert('RGBA')
    im.alpha_composite(Image.new('RGBA', (W, H), (255, 250, 232, 70)))
    d = ImageDraw.Draw(im)

    # đường đi chữ U nối 8 thẻ
    dashes(d, [(90, 305), (1490, 305), (1490, 868), (90, 868)], (255, 243, 196, 230))

    # khung tiêu đề
    head = (36, 24, 1500, 156)
    shadow(im, head, 26)
    rounded(im, head, 26, fill=CREAM, outline=GREEN, width=4)
    d = ImageDraw.Draw(im)
    d.polygon([(66, 24), (250, 24), (250, 150), (158, 182), (66, 150)], fill=GREEN)
    centered(d, (158, 80), f'UNIT {u:02d}', font(38), (255, 255, 255))
    for dx in (-14, 14):                                   # hai lá nhỏ dưới chữ, như mẫu
        d.ellipse((158 + dx - 9, 118, 158 + dx + 9, 134), fill=(178, 222, 150))
    title = TITLES[u]
    size = 66
    while font(size).getlength(title) > 1080 and size > 40:
        size -= 2
    d.text((282, 90), title, font=font(size), fill=GREEN_DARK, anchor='lm')
    # ngôi sao trang trí góc phải
    sx, sy = 1452, 72
    d.polygon([(sx, sy - 22), (sx + 6, sy - 6), (sx + 22, sy), (sx + 6, sy + 6),
               (sx, sy + 22), (sx - 6, sy + 6), (sx - 22, sy), (sx - 6, sy - 6)], fill=GREEN)
    for ox, oy, r in ((-34, -18, 3), (-30, 26, 3), (20, 34, 2)):
        d.ellipse((sx + ox - r, sy + oy - r, sx + ox + r, sy + oy + r), fill=GREEN)

    # dải ô cảnh
    shadow(im, STRIP, 28)
    rounded(im, STRIP, 28, fill=CREAM, outline=GREEN, width=5)
    for i, (x, y, w) in enumerate(CROPS[u]):
        h = round(w * 300 / 455)
        tile = src.crop((x, y, x + w, y + h)).resize((PANEL_W, PANEL_H), Image.LANCZOS)
        px = 66 + i * (PANEL_W + 22)
        mask = Image.new('L', tile.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, PANEL_W - 1, PANEL_H - 1), 18, fill=255)
        im.paste(tile, (px, PANEL_Y), mask)
        rounded(im, (px, PANEL_Y, px + PANEL_W - 1, PANEL_Y + PANEL_H - 1), 18,
                outline=(255, 255, 255), width=3)

    # 8 thẻ tiết
    boxes = []
    for i, (x, y) in enumerate(CARDS):
        box = (x, y, x + CARD_W, y + CARD_H)
        shadow(im, box, 22)
        rounded(im, box, 22, fill=CREAM, outline=GREEN, width=5)
        rounded(im, (x + 9, y + 9, x + CARD_W - 9, y + CARD_H - 9), 15, outline=CREAM_LINE, width=2)
        d = ImageDraw.Draw(im)
        cx, cy = x + CARD_W // 2, y + 5
        d.ellipse((cx - CIRCLE_R - 6, cy - CIRCLE_R - 6, cx + CIRCLE_R + 6, cy + CIRCLE_R + 6), fill=CREAM)
        d.ellipse((cx - CIRCLE_R, cy - CIRCLE_R, cx + CIRCLE_R, cy + CIRCLE_R), fill=GREEN)
        centered(d, (cx, cy + 1), f'{i + 1:02d}', font(36), (255, 255, 255))
        label = LESSONS[i]
        two = '\n' in label
        centered(d, (cx, y + CARD_H - (52 if two else 42)), label, font(31 if not two else 29, 'demi'), INK, spacing=2)
        boxes.append((x, cy - CIRCLE_R - 6, x + CARD_W, y + CARD_H))

    # viền ngoài
    rounded(im, (5, 5, W - 6, H - 6), 30, outline=GREEN, width=10)
    rounded(im, (15, 15, W - 16, H - 16), 24, outline=(255, 248, 225, 200), width=2)
    return im.convert('RGB'), boxes


def main():
    src = Image.open(SRC).convert('RGB')
    assert src.size == (W, H), src.size
    for u in TITLES:
        im, boxes = build(u, src)
        out = os.path.join(HERE, 'assets', f'unit{u:02d}-map.webp')
        im.save(out, 'WEBP', quality=88, method=6)
        print(f'unit{u:02d}', os.path.getsize(out) // 1024, 'KB')
    pad = 4
    print('\nVùng bấm (giống nhau cho cả 10 unit):')
    for i, (x0, y0, x1, y1) in enumerate(boxes, 1):
        x0, y0, x1, y1 = x0 - pad, y0 - pad, x1 + pad, y1 + pad
        print(f'  {i:02d}  --x:{x0/W*100:.2f}%; --y:{y0/H*100:.2f}%; '
              f'--w:{(x1-x0)/W*100:.2f}%; --h:{(y1-y0)/H*100:.2f}%')


if __name__ == '__main__':
    main()
