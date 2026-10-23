#!/usr/bin/env python3
"""Refresh entry-page hooks and deterministic offline packages before publishing."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urljoin,urlsplit,unquote
import hashlib,json,posixpath,re

ROOT=Path(__file__).resolve().parents[1]
GENERATED='offline-manifest.js'
EXTENSIONS={'.html','.css','.js','.webp','.png','.jpg','.jpeg','.gif','.svg','.mp3','.m4a','.mp4','.webm','.ogg','.woff2','.webmanifest'}

def read(path):return (ROOT/path).read_bytes().decode('utf-8')
def local(source,reference):
    if not reference or reference.startswith(('#','data:','blob:','javascript:','about:')):return None
    u=urlsplit(urljoin('https://offline.invalid/'+source,reference))
    if u.netloc!='offline.invalid':return None
    path=unquote(u.path.lstrip('/'))
    if path.endswith('/'):path+='index.html'
    return path if Path(path).suffix.lower() in EXTENSIONS else None

class References(HTMLParser):
    def __init__(self,text):
        super().__init__();self.refs=[];self.feed(text)
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs)
        for key in ['src','poster','data-src','data-game','data-url']:
            if attrs.get(key):self.refs.append(attrs[key])
        href=attrs.get('href','')
        if tag=='link' or '/assets/' in href:self.refs.append(href)

hooks=0
for path in sorted(ROOT.rglob('*.html')):
    relative=path.relative_to(ROOT)
    if any(part in relative.parts for part in ['.git','assets','_source','tools']):continue
    text=path.read_bytes().decode('utf-8');newline='\r\n' if '\r\n' in text else '\n'
    prefix=posixpath.relpath('.',str(relative.parent))
    prefix='' if prefix=='.' else prefix+'/'
    tags=[]
    if not re.search(r'<link\b[^>]*rel=[\'"]manifest',text,re.I):tags.append(f'<link rel="manifest" href="{prefix}manifest.webmanifest">')
    if not re.search(r'<script\b[^>]*src=[\'"][^\'"]*offline-client\.js',text,re.I):tags.append(f'<script src="{prefix}offline-client.js" defer></script>')
    if tags:
        text=text.replace('</head>',newline.join(tags)+newline+'</head>',1);path.write_bytes(text.encode('utf-8'));hooks+=1

missing=set()
def dependencies(starts):
    found=set();queue=list(starts)
    while queue:
        source=queue.pop()
        if source in found:continue
        if source==GENERATED:found.add(source);continue
        path=ROOT/source
        if not path.is_file():missing.add(source);continue
        found.add(source)
        if path.suffix not in ['.html','.css','.js','.webmanifest']:continue
        text=re.sub(r'<!--.*?-->','',read(source),flags=re.S)
        text=re.sub(r'/\*.*?\*/','',text,flags=re.S)
        text=re.sub(r'^\s*//.*$','',text,flags=re.M);refs=[]
        if path.suffix=='.html':refs+=References(text).refs
        if path.suffix=='.css':
            text=re.sub(r'/\*.*?\*/','',text,flags=re.S)
            refs+=re.findall(r'url\(\s*[\'"]?([^\)\'"\s]+)',text)
        # Includes slide-data image/animation URLs and media paths held in quiz data.
        refs+=re.findall(r'''["']([^"'\n\r<>]+\.(?:mp3|m4a|mp4|webm|ogg|webp|png|jpe?g|gif|svg|woff2))(?:\?[^"']*)?["']''',text,re.I)
        for ref in refs:
            if ref.startswith('-') or '${' in ref:continue
            target=local(source,ref)
            if target and target not in found:queue.append(target)
    return found

core=dependencies(['index.html','offline.html','offline.css','offline.js','offline-client.js','sw.js',GENERATED,'manifest.webmanifest','assets/app-icon-192.png','assets/app-icon-512.png','grade10/index.html','grade11/index.html','self-study/index.html'])
packs=[]
def add_pack(id,title,group,description,start,starts):
    files=dependencies(starts)-core
    packs.append(dict(id=id,title=title,group=group,description=description,start=start,files=sorted(files)))

selfstudy=[str(p.relative_to(ROOT)) for p in (ROOT/'self-study').rglob('*') if p.is_file() and p.suffix in EXTENSIONS]
add_pack('self-study','Self-study · Unit 1–3','self-study','Lớp 10 và 11: Grammar, Writing, Pronunciation và câu hỏi Listening. Video YouTube, Wordwall và ChatGPT cần Internet.','self-study/index.html',selfstudy)
for grade in [10,11]:
    for number in range(1,11):
        folder=f'grade{grade}/unit{number:02}'
        lessons=sorted(str(p.relative_to(ROOT)) for p in (ROOT/folder).glob('lesson*.html'))
        if not lessons:continue
        title=re.search(r'<title>Unit\s*\d+\s*:\s*(.*?)\s*[—–]\s*Global',read(folder+'/index.html'),re.I)
        theme=title.group(1) if title else f'Unit {number}'
        # Some games assemble flag/image filenames from a country code at runtime.
        asset_root=ROOT/f'grade{grade}/assets'
        extras=[str(p.relative_to(ROOT)) for p in asset_root.rglob('*') if p.is_file() and p.suffix in EXTENSIONS and any(part.startswith(f'u{number:02}-') for part in p.relative_to(asset_root).parts)]
        add_pack(f'g{grade}-u{number:02}',f'Unit {number} · {theme}',str(grade),f'{len(lessons)} bài hiện có, kèm ảnh, game và audio/video nội bộ. Các liên kết bên ngoài cần Internet.',folder+'/index.html',[folder+'/index.html',*lessons,*extras])
add_pack('g10-review1','Review 1 · Units 1–3','10','3 bài ôn tập Language, Skills 1 và Skills 2, cùng các tệp nghe nội bộ.','grade10/review1/index.html',sorted(str(p.relative_to(ROOT)) for p in (ROOT/'grade10/review1').glob('*.html')))
add_pack('g11-review1','Review 1 · Units 1–3','11','3 bài ôn tập Language, Skills 1 và Skills 2, cùng các tệp nghe nội bộ.','grade11/review1/index.html',sorted(str(p.relative_to(ROOT)) for p in (ROOT/'grade11/review1').glob('*.html')))
if missing:raise SystemExit('Missing offline dependency files: '+', '.join(sorted(missing)))

files={}
for path in sorted(set(core).union(*(set(p['files']) for p in packs))):
    if path==GENERATED:continue
    body=(ROOT/path).read_bytes();files[path]={'bytes':len(body),'sha256':hashlib.sha256(body).hexdigest()}
for pack in packs:
    pack['bytes']=sum(files[path]['bytes'] for path in pack['files'])
    pack['revision']=hashlib.sha256(json.dumps({p:files[p]['sha256'] for p in pack['files']},sort_keys=True).encode()).hexdigest()[:16]
version=hashlib.sha256(json.dumps({'files':files,'packs':packs,'core':sorted(core)},ensure_ascii=False,sort_keys=True).encode()).hexdigest()[:16]
manifest={'version':version,'core':sorted(core),'files':files,'packs':packs}
(ROOT/GENERATED).write_text('self.EC_OFFLINE_MANIFEST = '+json.dumps(manifest,ensure_ascii=False,separators=(',',':'))+';\n')
print(json.dumps({'version':version,'entry_pages_updated':hooks,'core_files':len(core),'core_MB':round(sum(files.get(p,{}).get('bytes',0) for p in core)/1048576,2),'packs':len(packs),'package_MB':{p['id']:round(p['bytes']/1048576,2) for p in packs}},ensure_ascii=False,indent=2))
