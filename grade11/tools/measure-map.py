#!/usr/bin/env python3
"""
measure-map.py — đo toạ độ vùng bấm trên bản đồ unit của Global Success 11.

Vì sao có tệp này: vùng bấm phải trùng khít thẻ tên vẽ sẵn trong ảnh. Ước lượng
bằng mắt đã sai một lần (vùng bấm rộng gần gấp đôi thẻ tên), nên mọi toạ độ
trong module đều phải đo bằng máy. Xem README.md

Cách chạy:
    python tools/measure-map.py assets/unit02-map.webp
    python tools/measure-map.py assets/unit02-map.webp --check check.png

In ra 8 dòng `--x/--y/--w/--h` dán thẳng vào `unitNN/index.html`.
`--check` xuất thêm một ảnh có vẽ khung hồng để soi bằng mắt trước khi dán.

Cách đo:
  1. Dò huy hiệu số — hình TRÒN đậm màu ở góc trên–trái mỗi thẻ. Lọc theo tỉ lệ
     ~1:1 và độ đặc để loại cây cối, áo nhân vật cùng màu.
  2. Từ mỗi huy hiệu, lan vùng sáng của thân thẻ, chặn trong một cửa sổ quanh
     huy hiệu để không rò sang lối đi / sàn nhà cùng tông.
  3. Hợp hai hộp lại, nới 5–6px cho khỏi hụt mép.

Mặt nạ không khoá theo màu — Unit 4 dùng huy hiệu nhiều màu trong cùng một
trang. Script tự thử có/không cắt đuôi chỉ dẫn và giữ cách nào ra đủ 8 thẻ.

Thẻ nào bị nhân vật che thì bước 2 có thể rò hoặc cụt. Luôn xuất --check và
nhìn trước khi dán; thẻ nào lệch thì sửa tay riêng thẻ đó.

Chỉ dùng lúc dựng bài. KHÔNG phải một phần của trang chạy — trang là HTML/CSS/JS
tĩnh, không có bước build.
"""

import sys
from collections import deque

try:
    import numpy as np
    from PIL import Image, ImageDraw
except ImportError:
    sys.exit('Cần: pip install pillow numpy')


# Một mặt nạ dùng chung cho mọi unit — KHÔNG khoá theo màu.
#
# Bản đầu dò huy hiệu theo màu (xanh lục cho Unit 1–2, tím cho Unit 3). Hỏng ở
# Unit 4: bản đồ đó dùng huy hiệu nhiều màu trong cùng một trang — 06 đỏ, 01 xanh
# lam, còn lại xanh lục. Khoá theo màu là mỗi unit một luật, không bền.
#
# Cách hiện tại: huy hiệu = HÌNH TRÒN ĐẬM bất kỳ màu gì; thân thẻ = MẢNG SÁNG ít
# bão hoà. Mặt nạ lỏng nên bắt thừa, nhưng phép thử "có thân thẻ kề bên" lọc sạch:
# vật tròn đậm nào không có thẻ đi kèm thì bị bỏ.

def badge_mask(R, G, B):
    """Hình tròn đậm, màu gì cũng được."""
    mx = np.maximum(np.maximum(R, G), B)
    mn = np.minimum(np.minimum(R, G), B)
    return (mx < 205) & (((mx - mn) > 38) | (mx < 115))


def plate_mask(R, G, B):
    """Thân thẻ: sáng và ít bão hoà — kem hay trắng đều lọt."""
    mx = np.maximum(np.maximum(R, G), B)
    mn = np.minimum(np.minimum(R, G), B)
    return (mn >= 170) & ((mx - mn) <= 95)


def components(mask, H, W, minpix):
    seen = np.zeros((H, W), bool)
    out = []
    ys, xs = np.nonzero(mask)
    for y0, x0 in zip(ys, xs):
        if seen[y0, x0]:
            continue
        q = deque([(y0, x0)])
        seen[y0, x0] = True
        mnx = mxx = x0
        mny = mxy = y0
        n = 0
        while q:
            y, x = q.popleft()
            n += 1
            mnx = min(mnx, x); mxx = max(mxx, x)
            mny = min(mny, y); mxy = max(mxy, y)
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if 0 <= ny < H and 0 <= nx < W and not seen[ny, nx] and mask[ny, nx]:
                    seen[ny, nx] = True
                    q.append((ny, nx))
        if n >= minpix:
            out.append((mnx, mny, mxx, mxy, n))
    return out


def find_badges(mask, H, W):
    found = []
    for x0, y0, x1, y1, n in components(mask, H, W, 600):
        w, h = x1 - x0 + 1, y1 - y0 + 1
        if not (40 <= w <= 85 and 40 <= h <= 85):
            continue
        if not (0.80 <= w / h <= 1.30):
            continue
        if n / (w * h) < 0.52:
            continue
        found.append((x0, y0, x1, y1))
    return found


def trim_tail(local, anchor_y):
    """Cắt bỏ đuôi chỉ dẫn.

    Ở một số unit (Unit 3) mỗi thẻ có một nét cong trắng nối xuống nhân vật.
    Nét đó cùng màu thân thẻ nên vùng lan chạy theo nó và hộp cao gấp ba lần
    thẻ thật. Thân thẻ thì RỘNG, đuôi thì MẢNH — nên chỉ giữ những hàng rộng
    ít nhất 45% hàng rộng nhất, và phải liền mạch từ hàng ngang huy hiệu.
    """
    per_row = {}
    for y, x in local:
        a, b = per_row.get(y, (x, x))
        per_row[y] = (min(a, x), max(b, x))
    widths = {y: b - a + 1 for y, (a, b) in per_row.items()}
    if not widths:
        return None
    thresh = max(widths.values()) * 0.45

    ys = sorted(widths)
    start = min(ys, key=lambda y: abs(y - anchor_y) if widths[y] >= thresh else 10 ** 6)
    if widths[start] < thresh:
        return None
    top = bot = start
    while top - 1 in widths and widths[top - 1] >= thresh:
        top -= 1
    while bot + 1 in widths and widths[bot + 1] >= thresh:
        bot += 1

    xs0 = min(per_row[y][0] for y in range(top, bot + 1) if y in per_row)
    xs1 = max(per_row[y][1] for y in range(top, bot + 1) if y in per_row)
    n = sum(widths[y] for y in range(top, bot + 1) if y in widths)
    return (xs0, top, xs1, bot, n)


def plate_box(plate, badge, H, W, trim=False):
    bx0, by0, bx1, by1 = badge
    # Cửa sổ phải cắt theo mép ảnh: thẻ sát mép phải làm vùng lan chạy quá biên
    # và ném IndexError.
    wx0, wy0 = max(0, bx0 - 45), max(0, by0 - 28)
    wx1, wy1 = min(W - 1, bx0 + 340), min(H - 1, by1 + 200)
    best = None
    seeds = [(by1 + 16, bx1 + 14), (by1 + 26, bx1 + 34), ((by0 + by1) // 2, bx1 + 20),
             (by1 + 10, bx0 + 18), (by1 + 40, bx1 + 60), (by1 + 55, bx0 + 40)]
    for sy, sx in seeds:
        if not (0 <= sy < H and 0 <= sx < W) or not plate[sy, sx]:
            continue
        local = {(sy, sx)}
        q = deque([(sy, sx)])
        while q:
            y, x = q.popleft()
            for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                ny, nx = y + dy, x + dx
                if (wy0 <= ny <= wy1 and wx0 <= nx <= wx1
                        and (ny, nx) not in local and plate[ny, nx]):
                    local.add((ny, nx))
                    q.append((ny, nx))

        if trim:
            got = trim_tail(local, (by0 + by1) // 2)
            if got is None:
                continue
        else:
            xs = [x for _, x in local]; ys = [y for y, _ in local]
            got = (min(xs), min(ys), max(xs), max(ys), len(local))
        mnx, mny, mxx, mxy, n = got
        w, h = mxx - mnx + 1, mxy - mny + 1
        if 85 <= w <= 440 and 42 <= h <= 210:
            if best is None or n > best[4]:
                best = got
    return best



# ---------------------------------------------------------------------------
# CHẾ ĐỘ MỒI — dùng khi dò tự động không ra đủ 8 thẻ
# ---------------------------------------------------------------------------
# Bảy bản đồ Unit 4–10 không cùng một khuôn: có bản huy hiệu đè góc trên–trái,
# có bản là giọt ghim nằm hẳn phía trên thẻ; màu huy hiệu đổi cả trong cùng một
# trang; có bản còn kèm thẻ trang trí ở chân trang trông y hệt thẻ tiết.
# Không có bộ ngưỡng nào phủ hết. Nên: NGƯỜI chỉ chỗ, MÁY đo mép.
#
#   python tools/measure-map.py assets/unit10-map.webp #          --seeds "195,435; 305,590; 668,565; ..." --check chk.png
#
# Mỗi mồi là một điểm nằm trong thân thẻ (chạm vào chữ cũng được — phép quét
# chịu được khoảng đứt tới 8px). Thứ tự mồi là thứ tự in ra.

# Khoảng đứt cho phép khi quét mép thẻ. 9px đủ để băng qua chữ bên trong thẻ.
# Nhưng bản đồ nào xếp 8 thẻ liền một hàng (Unit 7–9) thì khe giữa hai thẻ chỉ
# ~15px — để 9 là các thẻ dính vào nhau thành một hộp dài 569px. Dùng --gap 3
# cho những bản đồ đó.
GAP = 9


def scan(mask, fixed, start, step, limit, axis):
    """Đi từ `start` theo `step` tới khi gặp GAP pixel liên tiếp ngoài mask."""
    H, W = mask.shape
    pos, last, miss = start, start, 0
    while abs(pos - start) < limit:
        if axis == 'x':
            if not (0 <= pos < W):
                break
            ok = mask[fixed, pos]
        else:
            if not (0 <= pos < H):
                break
            ok = mask[pos, fixed]
        if ok:
            last, miss = pos, 0
        else:
            miss += 1
            if miss >= GAP:
                break
        pos += step
    return last


def box_from_seed(plate, badges, dark, sx, sy, H, W):
    if not plate[sy, sx]:
        # trượt ra chữ — dò quanh một chút cho vào nền thẻ
        for dy in range(-14, 15, 2):
            for dx in range(-14, 15, 2):
                if 0 <= sy+dy < H and 0 <= sx+dx < W and plate[sy+dy, sx+dx]:
                    sx, sy = sx+dx, sy+dy
                    break
            else:
                continue
            break
        else:
            return None

    rows = [y for y in range(max(0, sy-26), min(H, sy+27), 4)]
    lefts  = [scan(plate, y, sx, -1, 260, 'x') for y in rows if plate[y, sx]]
    rights = [scan(plate, y, sx, +1, 300, 'x') for y in rows if plate[y, sx]]
    if not lefts:
        return None
    x0, x1 = int(np.median(lefts)), int(np.median(rights))

    cols = [x for x in range(max(0, x0+12), min(W, x1-11), 6)]
    tops = [scan(plate, x, sy, -1, 150, 'y') for x in cols if plate[sy, x]]
    bots = [scan(plate, x, sy, +1, 150, 'y') for x in cols if plate[sy, x]]
    if not tops:
        return None
    y0, y1 = int(np.median(tops)), int(np.median(bots))

    # Huy hiệu: chỉ nhận ĐĨA TRÒN đã qua bộ lọc hình dạng, không nhận "mảng
    # đậm bất kỳ". Bản trước lấy cả mảng đậm phía trên thẻ nên vơ luôn tóc
    # nhân vật và máy móc trong tranh — hộp phình gấp đôi thẻ thật.
    hit = None
    for bx0, by0, bx1, by1 in badges:
        cx, cy = (bx0 + bx1) // 2, (by0 + by1) // 2
        if (x0 - 55) <= cx <= (x1 + 25) and (y0 - 75) <= cy <= (y0 + (y1 - y0) // 2):
            hit = (bx0, by0, bx1, by1)
            break

    if hit is None:
        # Không thấy đĩa tròn: có bản đồ (Unit 10) dùng GIỌT GHIM nằm hẳn phía
        # trên thẻ — hình giọt nước nên trượt bộ lọc tròn. Lấy mảng đậm trong
        # dải hẹp ngay trên thẻ, giới hạn 72px để không vơ tóc / cảnh nền.
        top = max(0, y0 - 72)
        lo, hi = max(0, x0 - 14), min(W, x1 + 15)
        if top < y0 and lo < hi:
            sub = dark[top:y0, lo:hi]
            ys, xs = np.nonzero(sub)
            if len(ys) > 600:
                hit = (lo + int(xs.min()), top + int(ys.min()),
                       lo + int(xs.max()), y0)

    if hit is not None:
        x0 = min(x0, hit[0]); y0 = min(y0, hit[1])
        x1 = max(x1, hit[2]); y1 = max(y1, hit[3])
    return (max(0, x0-5), max(0, y0-5), min(W-1, x1+5), min(H-1, y1+5))


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    path = sys.argv[1]
    check = None
    if '--check' in sys.argv:
        check = sys.argv[sys.argv.index('--check') + 1]

    im = Image.open(path).convert('RGB')
    W, H = im.size
    a = np.asarray(im).astype(np.int16)
    R, G, B = a[:, :, 0], a[:, :, 1], a[:, :, 2]
    print(f'# {path}  {W}x{H}', file=sys.stderr)

    plate = plate_mask(R, G, B)

    if '--gap' in sys.argv:
        globals()['GAP'] = int(sys.argv[sys.argv.index('--gap') + 1])

    if '--seeds' in sys.argv:
        raw = sys.argv[sys.argv.index('--seeds') + 1]
        dark = badge_mask(R, G, B)
        badges = find_badges(dark, H, W)
        print(f'# tìm được {len(badges)} đĩa tròn để ghép vào thẻ', file=sys.stderr)
        pts = [tuple(int(v) for v in q.split(',')) for q in raw.split(';') if q.strip()]
        boxes = []
        for k, (sx, sy) in enumerate(pts, start=1):
            b = box_from_seed(plate, badges, dark, sx, sy, H, W)
            if b is None:
                print(f'# ⚠ mồi #{k} ({sx},{sy}) không rơi vào thân thẻ', file=sys.stderr)
                continue
            boxes.append(b)
        print(f'# chế độ mồi: {len(pts)} mồi → {len(boxes)} thẻ', file=sys.stderr)
        emit(boxes, W, H, im, check)
        return

    badges = find_badges(badge_mask(R, G, B), H, W)

    # Cắt đuôi chỉ dẫn: chỉ vài unit có nét cong nối thẻ xuống nhân vật (Unit 3).
    # Bật nhầm ở unit không có đuôi thì thẻ hai dòng bị loại — nên thử cả hai và
    # giữ cách nào ra đủ 8 thẻ.
    boxes, used = [], None
    for trim in (False, True):
        got = []
        for b in badges:
            pb = plate_box(plate, b, H, W, trim)
            if pb is None:
                continue
            x0 = min(b[0], pb[0]); y0 = min(b[1], pb[1])
            x1 = max(b[2], pb[2]); y1 = max(b[3], pb[3])
            got.append((max(0, x0 - 6), max(0, y0 - 6),
                        min(W - 1, x1 + 6), min(H - 1, y1 + 6)))
        print(f'#   cắt đuôi={trim}: {len(badges)} ứng viên → {len(got)} thẻ',
              file=sys.stderr)
        if len(got) > len(boxes):
            boxes, used = got, trim
        if len(got) == 8:
            break
    print(f'# dùng: cắt đuôi={used}', file=sys.stderr)

    emit(boxes, W, H, im, check, sort=True)


def emit(boxes, W, H, im, check, sort=False):
    if sort:
        # thứ tự đọc: trên→dưới, trái→phải. Số tiết ĐỌC TỪ ẢNH, không suy từ
        # thứ tự này — bố cục mỗi unit mỗi khác.
        boxes = sorted(boxes, key=lambda r: (r[1], r[0]))
    print(f'# đo được {len(boxes)} thẻ tiết' + ('' if len(boxes) == 8
          else '  ⚠ KHÔNG ĐỦ 8 — soi ảnh --check'), file=sys.stderr)

    for x0, y0, x1, y1 in boxes:
        print(f'style="--x:{x0/W*100:.2f}%; --y:{y0/H*100:.2f}%; '
              f'--w:{(x1-x0+1)/W*100:.2f}%; --h:{(y1-y0+1)/H*100:.2f}%"'
              f'   <!-- px {x0},{y0} {x1-x0+1}x{y1-y0+1} -->')

    if check:
        im2 = im.copy()
        d = ImageDraw.Draw(im2)
        for i, (x0, y0, x1, y1) in enumerate(boxes, start=1):
            d.rectangle([x0, y0, x1, y1], outline=(255, 0, 255), width=4)
            d.text((x0 + 8, y0 + 6), str(i), fill=(255, 0, 255))
        im2.save(check)
        print(f'# ảnh soi: {check}', file=sys.stderr)


if __name__ == '__main__':
    main()
