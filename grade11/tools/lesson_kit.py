"""lesson_kit.py — dựng nhanh trang bài giảng theo đúng các mẫu slide của Global_Success_11.

Dùng lúc dựng bài (KHÔNG phải một phần của trang chạy):

    import sys; sys.path.insert(0, 'Global_Success_11/tools')
    from lesson_kit import *
    S = [cover('Unit 6 · Preserving Our Heritage', 'Heritage sites in Viet Nam', 'Lesson 1 — Getting started', '6'),
         phase(1, 'Warm-up', 'Name the places', 5),
         qlist('Task 2 · …', 'Heading', [('Question …', 'answer'), …], badge='5 min'), …]
    write('unit06/lesson1.html', page(6, 'tpl-heritage', 'Unit 6 · Lesson 1: Getting started',
          'Lesson 1 · Getting started', '← Unit 6', COMMENT, S))

Mọi chuỗi đưa vào đều là HTML (tự thoát ký tự & < > nếu cần). Hàm trả về chuỗi <section>…</section>.
Sau khi ghi tệp: python3 tools/unlock-lesson.py unitNN N, đồng bộ preview, chạy qa-all.js.
"""

R = '<button class="reveal" type="button" aria-expanded="false">{}</button>'


def rv(label='?'):
    return R.format(label)


def ans(text, note=False):
    return f'<span class="answer{" note" if note else ""}">{text}</span>'


def _kick(kicker, badge=None, audio=None):
    s = f'  <span class="kicker">{kicker}</span>'
    if badge:
        s += f' <span class="badge time">{badge}</span>'
    if audio:
        s += f'\n  <span class="badge soft">🎧 {audio[0]}</span>'
    return s


def _audio(audio):
    if not audio:
        return ''
    f = audio[1]
    return (f'\n  <audio class="tight" controls preload="metadata" src="../assets/audio/{f}">\n'
            f'    Your browser cannot play this audio — open assets/audio/{f} directly.\n  </audio>')


def section(body, cls='denser'):
    return f'<section class="slide{(" " + cls) if cls else ""}">\n{body}\n</section>\n'


def cover(kicker, h1, sub, unitno):
    return section(f'  <span class="kicker">{kicker}</span>\n  <h1>{h1}</h1>\n'
                   f'  <p class="sub">{sub}</p>\n  <span class="unit-no">{unitno}</span>', 'cover')


def phase(n, h1, sub, minutes):
    return section(f'  <span class="step">{n}</span>\n  <h1>{h1}</h1>\n  <p class="sub">{sub}</p>\n'
                   f'  <span class="badge time">{minutes} minutes</span>', 'phase')


def cards(kicker, h2, items, cls='dense', badge=None, after=''):
    """items: (ico, h3, p, badge?) — ico/h3/p có thể rỗng."""
    lis = []
    for k, it in enumerate(items):
        ico, h3, p = it[0], it[1], it[2]
        b = it[3] if len(it) > 3 else None
        alt = ' alt' if k % 2 else ''
        inner = (f'<span class="ico">{ico}</span>' if ico else '') + (f'<h3>{h3}</h3>' if h3 else '') + \
                (f'<p>{p}</p>' if p else '') + (f'\n      <span class="badge time">{b}</span>' if b else '')
        lis.append(f'    <li class="card{alt}">{inner}</li>')
    return section(_kick(kicker, badge) + f'\n  <h2>{h2}</h2>\n  <ul class="cards">\n' + '\n'.join(lis) +
                   '\n  </ul>' + (f'\n{after}' if after else ''), cls)


def lesson_map(stops, h2=None):
    """stops: (ico, h3, p, minutes)."""
    return cards('Our lesson today', h2 or f'{["","One","Two","Three","Four","Five","Six"][len(stops)]} stops in 45 minutes',
                 [(i, h, p, f'{m} min') for i, h, p, m in stops])


def qlist(kicker, h2, items, badge=None, audio=None, before='', after='', cls='denser'):
    """items: (question_html, answer_html[, options_line]) — đáp án ẩn sau nút ?"""
    rows = []
    for it in items:
        q, a = it[0], it[1]
        rows.append(f'  <p class="q">{q}\n    {rv()} {ans(a)}</p>')
        if len(it) > 2 and it[2]:
            rows.append(f'  <p class="eg">{it[2]}</p>')
    return section(_kick(kicker, badge, audio) + f'\n  <h2>{h2}</h2>' + _audio(audio) +
                   (f'\n{before}' if before else '') + '\n' + '\n'.join(rows) + (f'\n{after}' if after else ''), cls)


def mc(kicker, h2, items, badge=None, audio=None, after=''):
    """items: (question, [options], answer) — options in một khối <p> xuống dòng."""
    rows = []
    for q, opts, a in items:
        rows.append(f'  <p class="q"><b>{q}</b>\n    {rv()} {ans(a)}</p>\n  <p>' + '<br>\n     '.join(opts) + '</p>')
    return section(_kick(kicker, badge, audio) + f'\n  <h2>{h2}</h2>' + _audio(audio) + '\n' + '\n'.join(rows) +
                   (f'\n{after}' if after else ''))


def tf(kicker, h2, items, start=0, badge=None, audio=None, labels=('TRUE', 'FALSE'), after=''):
    """items: (statement, True/False/'NG'[, note])"""
    lis = []
    for it in items:
        st, v = it[0], it[1]
        note = it[2] if len(it) > 2 else ''
        if v == 'NG':
            verdict = '<span class="answer verdict">NOT GIVEN</span>'
        else:
            verdict = f'<span class="answer verdict {"t" if v else "f"}">{labels[0] if v else labels[1]}</span>'
        lis.append(f'    <li class="q"><span>{st}\n      {rv("T / F")} {verdict}' +
                   (f'\n      <span class="answer note">{note}</span>' if note else '') + '</span></li>')
    style = f' style="counter-reset:tf {start}"' if start else ''
    return section(_kick(kicker, badge, audio) + f'\n  <h2>{h2}</h2>' + _audio(audio) +
                   f'\n  <ul class="tf"{style}>\n' + '\n'.join(lis) + '\n  </ul>' + (f'\n{after}' if after else ''))


def match(kicker, h2, left, right, badge=None, audio=None):
    """left: (label_html, answer); right: (letter, text). Hai cột."""
    l = '\n'.join(f'      <p class="q"><b>{x}</b> {rv()} {ans(a)}</p>' for x, a in left)
    r = '\n'.join(f'      <p><b>{k}.</b> {t}</p>' for k, t in right)
    return section(_kick(kicker, badge, audio) + f'\n  <h2>{h2}</h2>' + _audio(audio) +
                   f'\n  <div class="cols">\n    <div>\n{l}\n    </div>\n    <div>\n{r}\n    </div>\n  </div>')


def plist(kicker, h2, paras, badge=None, audio=None, cls='denser', after=''):
    """Các đoạn <p> thường (đề bài, danh sách phương án…)."""
    return section(_kick(kicker, badge, audio) + f'\n  <h2>{h2}</h2>' + _audio(audio) + '\n' +
                   '\n'.join(f'  <p>{p}</p>' for p in paras) + (f'\n{after}' if after else ''), cls)


def textbox(kicker, h2, paras, badge=None, audio=None, after=''):
    """Bài đọc / bài mẫu trong khung .box."""
    return section(_kick(kicker, badge, audio) + f'\n  <h2>{h2}</h2>' + _audio(audio) + '\n  <div class="box">\n' +
                   '\n'.join(f'    <p>{p}</p>' for p in paras) + '\n  </div>' + (f'\n{after}' if after else ''))


def chat(kicker, h2, lines, badge=None, audio=None, after=''):
    """lines: (who, 'l'|'r', html). Tối đa 2 bóng / slide."""
    b = '\n'.join(f'    <div class="bubble {s}"><span class="who">{w}</span>{t}</div>' for w, s, t in lines)
    return section(_kick(kicker, badge, audio) + f'\n  <h2>{h2}</h2>' + _audio(audio) +
                   f'\n  <div class="chat">\n{b}\n  </div>' + (f'\n{after}' if after else ''))


def compare(kicker, h2, left, right, cls='dense', badge=None, after=''):
    """left/right: (h3, [p…])"""
    def col(c):
        return f'    <div><h3>{c[0]}</h3>' + ''.join(f'<p>{p}</p>' for p in c[1]) + '</div>'
    return section(_kick(kicker, badge) + f'\n  <h2>{h2}</h2>\n  <div class="compare">\n{col(left)}\n{col(right)}\n  </div>' +
                   (f'\n{after}' if after else ''), cls)


def chips(kicker, h2, items, cls='dense', badge=None, after='', grid4=False):
    lis = ''.join(f'<li>{x}</li>' for x in items)
    return section(_kick(kicker, badge) + f'\n  <h2>{h2}</h2>\n  <ul class="chips{" grid4" if grid4 else ""}">{lis}</ul>' +
                   (f'\n{after}' if after else ''), cls)


def brief(kicker, h2, lines, badge=None):
    return section(_kick(kicker, badge) + f'\n  <h2>{h2}</h2>\n  <div class="brief">\n' +
                   '\n'.join(f'    <p>{l}</p>' for l in lines) + '\n  </div>', 'dense')


def homework(lines):
    return brief('Wrap-up', 'Homework', [f'{i}. {l}' for i, l in enumerate(lines, 1)])


def words(kicker, h2, items, badge=None):
    """Thẻ từ chữ: (w, pos, ipa, vn). Tối đa 2 từ / slide."""
    lis = '\n'.join(f'    <li class="word q"><span class="w">{w}</span> <span class="pos">{p}</span>\n'
                    f'      <span class="ipa">{i}</span>\n      {rv("Meaning")}\n      {ans(v)}</li>'
                    for w, p, i, v in items)
    return section(_kick(kicker, badge) + f'\n  <h2>{h2}</h2>\n  <ul class="words">\n{lis}\n  </ul>')


def vocab(kicker, img, alt, w, pos, ipa, vn, eg):
    """Một từ / slide, có ảnh minh hoạ."""
    return section(f'  <span class="kicker">{kicker}</span>\n  <div class="vocab">\n'
                   f'    <div class="art"><img src="../assets/images/{img}"\n         alt="{alt}"></div>\n'
                   f'    <div class="info q">\n      <span class="w">{w}</span> <span class="pos">{pos}</span>\n'
                   f'      <span class="ipa">{ipa}</span>\n      {rv("Meaning")}\n      {ans(vn)}\n'
                   f'      <span class="eg">{eg}</span>\n    </div>\n  </div>', '')


def vocab_set(title, items):
    """items: (img, alt, w, pos, ipa, vn, eg) → mỗi từ một slide."""
    return ''.join(vocab(f'{title} · {k} / {len(items)}', *it) for k, it in enumerate(items, 1))


def pic(kicker, h2, img, alt, below='', short=False, badge=None):
    return section(_kick(kicker, badge) + f'\n  <h2>{h2}</h2>\n  <div class="pics wide{" short" if short else ""}">'
                   f'<img src="../assets/images/{img}"\n       alt="{alt}"></div>' + (f'\n{below}' if below else ''))


def pic_side(kicker, h2, img, alt, side_html, badge=None, audio=None):
    return section(_kick(kicker, badge, audio) + f'\n  <h2>{h2}</h2>' + _audio(audio) +
                   f'\n  <div class="cols">\n    <div class="pics wide"><img src="../assets/images/{img}"\n'
                   f'         alt="{alt}"></div>\n    <div>\n{side_html}\n    </div>\n  </div>')


def figs(kicker, h2, items, size='big', badge=None, after=''):
    """Hàng ảnh có nhãn + đáp án lật: items (img, alt, label, answer). size: big | small | ''."""
    f = '\n'.join(f'    <figure class="q"><img src="../assets/images/{i}" alt="{a}">\n'
                  f'      <figcaption><b>{l}</b> {rv()} {ans(x)}</figcaption></figure>' for i, a, l, x in items)
    return section(_kick(kicker, badge) + f'\n  <h2>{h2}</h2>\n  <div class="pics{(" " + size) if size else ""}">\n{f}\n  </div>' +
                   (f'\n{after}' if after else ''))


def video(kicker, h2, yt, title, plan_b):
    return section(f'  <span class="kicker">{kicker}</span>\n  <h2>{h2}</h2>\n'
                   f'  <div class="video" data-yt="{yt}" data-title="{title}">\n'
                   f'    <button class="video-play" type="button" aria-label="Play video: {title}">▶</button>\n'
                   f'    <span class="t">{title}</span>\n    <span class="s">YouTube · click to play · needs internet</span>\n'
                   f'  </div>\n  <p class="q">No internet?\n    {rv("Plan B")}\n    {ans(plan_b, True)}</p>')


def play(src, title, note=''):
    c = f'<!-- {note} -->\n' if note else ''
    return c + f'<section class="slide play">\n  <iframe class="game" src="{src}"\n          title="{title}" allow="fullscreen"></iframe>\n</section>\n'


def raw(html, cls='denser'):
    return section(html, cls)


def comment(text):
    return f'<!-- {text} -->\n'


def page(unit, theme, title, brand, back, header_comment, slides, back_href='index.html', back_kind='unit'):
    body_attr = (f' data-unit="{unit}"' if unit else '') + (f' class="{theme}"' if theme else '')
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} — Global Success 11</title>
<meta name="robots" content="noindex, nofollow">
<link rel="stylesheet" href="../gs11.css">
</head>
<body{body_attr}>

<!-- =========================================================================
{header_comment.rstrip()}
     ========================================================================= -->

<header class="bar">
  <a href="{back_href}" data-back="{back_kind}">{back}</a>
  <span class="brand">{brand}</span>
  <span class="spacer"></span>
</header>

<main class="deck">

{''.join(slides)}
</main>

<script src="../gs11.js"></script>
</body>
</html>
'''


def write(path, html):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(html)
    return path
