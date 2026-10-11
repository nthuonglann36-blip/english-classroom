// tools/qa-all.js — chép vào gốc thư mục đang phục vụ rồi chạy trong trình duyệt:
//   (await import("/qa-all.js")).default(["/unit01/lesson1.html", …])
// Chỉ dùng lúc dựng bài. KHÔNG phải một phần của trang chạy.
// Kiểm hàng loạt: mỗi tiết mở trong iframe 1366×768, ép nạp lại CSS, đo tràn khung
// (đóng / mở hết đáp án), chữ < 24pt (33.5px) và ảnh hỏng.
export default async function qaAll(paths){
  const res={};
  const skip=el=>el.closest('.kicker,.badge,.reveal,.reveal-all,.who,.pos,.step,iframe,.unit-no,th,.video .s,.video-play');
  for (const p of paths){
    const f=document.createElement('iframe');
    f.style.cssText='position:fixed;left:0;top:0;width:1366px;height:768px;border:0;visibility:hidden';
    f.src=p+'?qa='+Date.now(); document.body.appendChild(f);
    await new Promise(r=>f.onload=r);
    const d=f.contentDocument, w=f.contentWindow;
    const l=d.querySelector('link[rel=stylesheet]'); l.href=l.href.split('?')[0]+'?t='+Date.now();
    await new Promise(r=>l.onload=r); await new Promise(r=>setTimeout(r,400));
    const slides=[...d.querySelectorAll('.slide')]; const out=[]; const small=[];
    for (const [i,s] of slides.entries()){
      slides.forEach(x=>x.classList.remove('is-current')); s.classList.add('is-current'); await new Promise(r=>setTimeout(r,30));
      const c=s.scrollHeight-s.clientHeight; s.querySelectorAll('.answer').forEach(a=>a.classList.add('is-open')); await new Promise(r=>setTimeout(r,15));
      const o=s.scrollHeight-s.clientHeight;
      const tw=d.createTreeWalker(s, NodeFilter.SHOW_TEXT); let n;
      while((n=tw.nextNode())){ if(!n.textContent.trim()) continue; const el=n.parentElement; if(skip(el)||!el.getClientRects().length) continue;
        const fs=parseFloat(w.getComputedStyle(el).fontSize); if(fs<33.5){ small.push(`${i+1}:${el.tagName}.${el.className} ${fs.toFixed(0)}`); break; } }
      s.querySelectorAll('.answer').forEach(a=>a.classList.remove('is-open'));
      if(c>2||o>2) out.push(`${i+1}: ${c}/${o}`);
    }
    const broken=[...d.images].filter(im=>!im.complete||im.naturalWidth===0).map(im=>im.src.split('/').pop());
    res[p]={n:slides.length, overflow: out.length?out:'ok', ...(small.length?{small}:{}), ...(broken.length?{broken}:{})};
    f.remove();
  }
  return res;
}
