#!/usr/bin/env python3
"""
measure-cards.py — đo 8 thẻ tiết trên bản đồ unit vẽ tay (bộ ảnh ChatGPT lớp 11, 14/10/2026).

Vì sao không dùng measure-map.py: ở bộ ảnh mới, thẻ nằm sát áo trắng, lối đi
màu kem… nên chế độ tự dò bắt thừa, còn chế độ mồi hay dừng ở dòng chữ (cụt đáy).

Cách đo: NGƯỜI chỉ một điểm giữa chữ của mỗi thẻ, theo thứ tự 01→08. MÁY:
  1. tìm hàng "lề dưới" của thẻ — hàng ngay dưới chữ, toàn nền kem, quét ngang
     không vướng chữ → ra mép trái/phải thật của thẻ;
  2. đi xuống tới khi hàng kem co hẹp hẳn → đáy thẻ;
  3. tìm huy hiệu số (đĩa tròn đậm) phía trên → đỉnh thẻ;
  4. nới 4px.

    python3 tools/measure-cards.py ảnh.png "x,y; x,y; …" --check soi.png

Luôn mở ảnh --check soi khung hồng trước khi dán vào unitNN/index.html.
"""
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageDraw


def masks(a):
    R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    mx = np.maximum(np.maximum(R, G), B)
    mn = np.minimum(np.minimum(R, G), B)
    plate = (mn >= 168) & ((mx - mn) <= 95)
    badge = (mx < 200) & (((mx - mn) > 45) | (mx < 110))
    return plate, badge


def run(plate, y, x, W, tol=2):
    """Đoạn kem liền quanh x trên hàng y (cho phép đứt tối đa `tol` px)."""
    if not plate[y, x]:
        return None
    def go(step):
        pos, last, miss = x, x, 0
        while 0 <= pos < W:
            if plate[y, pos]:
                last, miss = pos, 0
            else:
                miss += 1
                if miss > tol:
                    break
            pos += step
        return last
    return go(-1), go(1)


def label_box(plate, sx, sy, W, H):
    best = None
    for y in range(sy + 6, min(H - 1, sy + 48)):
        for dx in (0, -10, 10, -20, 20):
            x = sx + dx
            if 0 <= x < W:
                r = run(plate, y, x, W)
                if r and 70 <= r[1] - r[0] <= 360:
                    if best is None or (r[1] - r[0]) > (best[2] - best[1]) + 3:
                        best = (y, r[0], r[1])
                    break
    if best is None:
        return None
    y, x0, x1 = best
    full = x1 - x0
    cx = (x0 + x1) // 2
    # đáy: đi xuống tới khi hàng kem qua tâm co lại dưới 60%
    yb = y
    while yb + 1 < H:
        r = run(plate, yb + 1, cx, W)
        if not r or (r[1] - r[0]) < 0.6 * full:
            break
        yb += 1
    # đỉnh thân thẻ: đi lên từ hàng lề dưới (qua chữ thì dò ở nhiều cột)
    tops = []
    for fx in (0.15, 0.25, 0.75, 0.85):
        xx = int(x0 + fx * full)
        yy, miss, last = y, 0, y
        while yy > 0 and y - yy < 150:
            if plate[yy, xx]:
                last, miss = yy, 0
            else:
                miss += 1
                if miss > 3:
                    break
            yy -= 1
        tops.append(last)
    yt = int(np.median(tops))
    return x0, yt, x1, yb


def badge_box(badge, box, W, H):
    x0, y0, x1, y1 = box
    wx0, wx1 = max(0, x0 - 30), min(W - 1, x1 + 30)
    wy0, wy1 = max(0, y0 - 85), min(H - 1, y0 + 40)
    sub = badge[wy0:wy1 + 1, wx0:wx1 + 1]
    h, w = sub.shape
    seen = np.zeros_like(sub)
    best = None
    for yy, xx in zip(*np.nonzero(sub)):
        if seen[yy, xx]:
            continue
        q = deque([(yy, xx)]); seen[yy, xx] = True
        ys, xs = [], []
        while q:
            y, x = q.popleft(); ys.append(y); xs.append(x)
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < h and 0 <= nx < w and sub[ny, nx] and not seen[ny, nx]:
                    seen[ny, nx] = True; q.append((ny, nx))
        bw, bh = max(xs) - min(xs) + 1, max(ys) - min(ys) + 1
        if not (36 <= bw <= 95 and 36 <= bh <= 95 and 0.72 <= bw / bh <= 1.38):
            continue
        if len(ys) / (bw * bh) < 0.50:
            continue
        cand = (wx0 + min(xs), wy0 + min(ys), wx0 + max(xs), wy0 + max(ys))
        if best is None or cand[1] < best[1]:
            best = cand
    return best


def main():
    path, seeds = sys.argv[1], sys.argv[2]
    check = sys.argv[sys.argv.index('--check') + 1] if '--check' in sys.argv else None
    im = Image.open(path).convert('RGB')
    W, H = im.size
    a = np.asarray(im).astype(np.int16)
    plate, badge = masks(a)
    pts = [tuple(int(v) for v in s.split(',')) for s in seeds.split(';') if s.strip()]
    boxes = []
    for k, (sx, sy) in enumerate(pts, 1):
        b = label_box(plate, sx, sy, W, H)
        if b is None:
            print(f'# ⚠ thẻ {k}: không tìm được thân thẻ quanh ({sx},{sy})', file=sys.stderr)
            boxes.append((sx - 60, sy - 70, sx + 60, sy + 30)); continue
        bd = badge_box(badge, b, W, H)
        if bd:
            b = (min(b[0], bd[0]), min(b[1], bd[1]), max(b[2], bd[2]), max(b[3], bd[3]))
        else:
            print(f'# ⚠ thẻ {k}: không thấy huy hiệu số', file=sys.stderr)
        boxes.append((max(0, b[0] - 4), max(0, b[1] - 4), min(W - 1, b[2] + 4), min(H - 1, b[3] + 4)))
    for x0, y0, x1, y1 in boxes:
        print(f'style="--x:{x0/W*100:.2f}%; --y:{y0/H*100:.2f}%; '
              f'--w:{(x1-x0+1)/W*100:.2f}%; --h:{(y1-y0+1)/H*100:.2f}%"'
              f'   <!-- px {x0},{y0} {x1-x0+1}x{y1-y0+1} -->')
    if check:
        im2 = im.copy(); d = ImageDraw.Draw(im2)
        for x0, y0, x1, y1 in boxes:
            d.rectangle([x0, y0, x1, y1], outline=(255, 0, 255), width=3)
        im2.save(check)


if __name__ == '__main__':
    main()
