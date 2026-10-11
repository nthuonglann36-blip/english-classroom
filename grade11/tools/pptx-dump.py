#!/usr/bin/env python3
"""
pptx-dump.py — đọc chữ và media từng slide của tệp PPTX, để so các bản PPT và
chép nội dung sang bài giảng HTML. Không cần cài gì thêm (chỉ dùng zipfile).

Cách chạy:
    python3 tools/pptx-dump.py a.pptx b.pptx          tóm tắt mỗi slide một dòng
    python3 tools/pptx-dump.py --full a.pptx [3,5,7]  toàn văn (tuỳ chọn: chỉ vài slide)
    python3 tools/pptx-dump.py --media a.pptx outdir  rút ảnh/audio ra thư mục

Thứ tự slide lấy theo presentation.xml (thứ tự trình chiếu thật), không theo tên
tệp slideN.xml. Slide ẩn đánh dấu [ẨN].

Chỉ dùng lúc dựng bài. KHÔNG phải một phần của trang chạy.
"""
import datetime, html, os, re, sys, zipfile


def slides(z):
    pres = z.read('ppt/presentation.xml').decode('utf8', 'ignore')
    rels = z.read('ppt/_rels/presentation.xml.rels').decode('utf8', 'ignore')
    rid = {}
    for m in re.finditer(r'<Relationship [^>]*>', rels):
        t = m.group(0)
        i = re.search(r'Id="([^"]+)"', t); g = re.search(r'Target="([^"]+)"', t)
        if i and g and 'slides/slide' in g.group(1):
            rid[i.group(1)] = 'ppt/' + g.group(1).lstrip('/').replace('ppt/', '')
    return [rid[r] for r in re.findall(r'<p:sldId [^>]*r:id="([^"]+)"', pres) if r in rid]


def media_of(z, path):
    rel = 'ppt/slides/_rels/' + path.split('/')[-1] + '.rels'
    r = z.read(rel).decode('utf8', 'ignore') if rel in z.namelist() else ''
    return re.findall(r'Target="\.\./media/([^"]+)"', r), re.findall(r'Target="(https?://[^"]+|file://[^"]+)"', r)


def paras(x):
    out = []
    for p in re.findall(r'<a:p>.*?</a:p>', x, re.S):
        s = html.unescape(''.join(re.findall(r'<a:t>([^<]*)</a:t>', p))).strip()
        if s:
            out.append(s)
    return out


def summary(path):
    z = zipfile.ZipFile(path)
    order = slides(z)
    st = os.stat(path)
    print(f'##### {os.path.basename(path)} | {len(order)} slide | sửa lần cuối '
          f'{datetime.datetime.fromtimestamp(st.st_mtime):%Y-%m-%d} | {st.st_size/1e6:.1f} MB')
    for n, t in enumerate(order, 1):
        x = z.read(t).decode('utf8', 'ignore')
        med, links = media_of(z, t)
        aud = sum(bool(re.search(r'\.(mp3|m4a|wav|wma)$', m, re.I)) for m in med)
        vid = sum(bool(re.search(r'\.(mp4|mov|wmv|m4v)$', m, re.I)) for m in med)
        img = sum(bool(re.search(r'\.(png|jpe?g|gif|webp)$', m, re.I)) for m in med)
        tag = ('[ẨN] ' if 'show="0"' in x[:400] else '') + (f'🖼{img} ' if img else '') + \
              (f'🔊{aud} ' if aud else '') + (f'🎬{vid} ' if vid else '') + ('🔗 ' if links else '')
        print(f'{n:2d}. {tag}{" ".join(paras(x))[:230]}')
    print()


def full(path, want=None):
    z = zipfile.ZipFile(path)
    for n, t in enumerate(slides(z), 1):
        if want and n not in want:
            continue
        x = z.read(t).decode('utf8', 'ignore')
        med, links = media_of(z, t)
        print(f'=== slide {n} ({t.split("/")[-1]}) media={med}' + (f' links={links}' if links else ''))
        print(' | '.join(paras(x)))


def dump_media(path, out):
    z = zipfile.ZipFile(path)
    os.makedirs(out, exist_ok=True)
    for n in z.namelist():
        if n.startswith('ppt/media/'):
            open(os.path.join(out, n.split('/')[-1]), 'wb').write(z.read(n))
    print('→', out)


if __name__ == '__main__':
    a = sys.argv[1:]
    if a and a[0] == '--full':
        full(a[1], {int(i) for i in a[2].split(',')} if len(a) > 2 else None)
    elif a and a[0] == '--media':
        dump_media(a[1], a[2])
    else:
        for p in a:
            summary(p)
