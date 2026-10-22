# Nguồn PPT cho từng tiết — Global Success 10

Chuyển tiết nào sang HTML thì ghi đúng file nguồn ở đây (cách làm giống `grade11/_source/NGUON-BAI-GIANG.md`).

## Luật chung (từ 22/10/2026)

1. Nguồn chính: bài PPT gộp **`ppt game/BAI-DAY-HOAN-CHINH/Lop10-UnitN/G10-UN-LM-*.pptx`** (mỗi file = 1 tiết; xem
   `HUONG-DAN-BAI-GOP.txt` trong thư mục đó để biết file gộp từ những bản nào).
2. Chữ bài đọc, hội thoại, câu hỏi lấy **nguyên văn SGK** `1 - SGK Tiếng anh 10 - Global Success.pdf` (bản scan: chỉ số trang PDF =
   số trang in − 1). Đáp án theo giáo án `LOP 10/4. Giáo án minh hoạ/TA10-Unit N.docx`. Chỗ PPT khác giáo án ghi ⚠ để cô nghe lại.
3. Audio lớp 10: **Track N của sách = tệp `LOP 10/1. Audio/NNN.wav`** (không lệch số như lớp 11). Máy không có bộ mã MP3 nên đổi
   sang `uNN-trackNN.m4a` (AAC 64 kbps, `afconvert`) — trình duyệt nào cũng phát được.
4. **Trò chơi**: dựng lại bằng khung chung `assets/games/_board.js` + `_board.css` (bảng ô số · hộp bí ẩn · thang câu hỏi ·
   thẻ nói kiểu Taboo/Charades). Trò làm từ **mẫu Pinny Teaching** (phi thương mại, có nhân vật bản quyền) **chỉ lấy câu hỏi** —
   không chép hình, nhân vật hay giao diện mẫu lên web. Trò ChatGPT làm (UNIT3_GAMEPLAY, bộ 7 game Unit 4…) dựng lại cùng khung.
5. Từ vựng: PPT gộp thường dạy 12–15 từ/tiết → giữ 4–6 từ theo giáo án, các từ còn lại ôn qua trò chơi.
6. Mã dựng trang (không đưa lên web): `cuoc thi sp AI/Ho-so-du-thi/_tools/web10/` — `kit10.py` + mỗi tiết một tệp `uNlM.py`.

## Unit 3 · Music (tpl-music)

| Tiết | Nguồn | Ghi chú |
|---|---|---|
| **L1 Getting started** | Cô cập nhật 20/10 (slide MUSICVERSE dạng ảnh + Guess the Song) | Giữ nguyên bản của cô. Bài gộp G10-U3-L1 thêm Task 3 + trò Music Night (mẫu Pinny) — chưa đưa vào |
| **L2 Language** | `G10-U3-L2-Language.pptx` (MUSICVERSE_Unit3_Lesson2_REBUILT + 6 slide ngữ pháp u3 lang + Mystery Box) | Track 19/20. Trò **Beat Drop Battle** (8 câu từ vựng) + **Music Mystery Box** (15 câu, câu hỏi của trò mẫu Pinny, khung vẽ lại; câu 15 trùng câu 6 → đổi câu khác). Trò Secret Music Vault của PPT = 8 câu ngữ pháp SGK → làm slide lật đáp án |
| **L3 Reading** | `G10-U3-L3-Reading.pptx` (Lesson3_Reading_DOWNLOAD + Millionaire) + trò HTML của cô `Music_Mystery_Box_Unit3_Reading.html` (22/10) | Task 3 dùng 3 phương án A–C của SGK (PPT thêm D). 12 từ PPT → 6 từ giáo án + trò **The Masked Mic** (8 từ, 2 gợi ý). Trò của cô = `u03-l3-music-mystery-box.html` (cô tải lên GitHub trưa 22/10, kèm trang lesson3 chỉ có trò) → nay là slide 21 của bài đầy đủ; thêm khối CSS `@media (max-height:700px)` cho vừa khung slide, thay slide câu hỏi thêm. Bản trang-chỉ-có-trò vẫn xem được qua git (commit 1f28465). Millionaire (mẫu Pinny) trùng Task 2–3 → không dựng. Ảnh Task 1 cắt SGK tr. 31 |
| **L4 Speaking** | `G10-U3-L4-Speaking.pptx` (u3 spk + 6 từ SGK_Expanded + Don’t Say The Word) | Task 1 theo giáo án. Trò **Don’t Say It!** (10 thẻ Taboo, 45 giây) |
| **L5 Listening** | `G10-U3-L5-Listening.pptx` (u3 lis + trò điền poster lễ hội của cô) | Track 21/22. ⚠ **Task 2**: giáo án A, D — PPT ghi A, C, D. ⚠ **Task 3 câu 5**: giáo án T — PPT ghi F. Đang dùng đáp án giáo án, cô nghe lại để xác nhận. Trò thưởng Festival Info Desk (audio riêng) chưa đưa lên. Ảnh Task 1 cắt SGK tr. 33 |
| **L6 Writing** | `G10-U3-L6-Writing.pptx` (u3 wrt + 6 từ SGK_Expanded + Blog Builder Relay) | Blog của Ann nguyên văn sách. Blog Builder vòng 1–2 (xếp câu, sửa 5 lỗi) → slide lật đáp án; vòng 3 → câu mẫu Task 3 |
| **L7 Communication & Culture** | `G10-U3-L7-Communication-Culture.pptx` (u3 comm + Don’t say the word chầu văn) | Track 23. Bài đọc *chau van* nguyên văn sách tr. 35. Trò **Don’t Say the Word!** (10 từ chầu văn, chỉ lấy từ của trò mẫu Pinny). Trò thưởng Chau Van Stand/Sit chưa đưa lên |
| **L8 Looking back & Project** | `G10-U3-L8-Looking-back-Project.pptx` (L8 SGK_Expanded + Brain Brawl kiểu Jeopardy) | Track 24. Trò **Brain Brawl: Music Champions** (5 chủ đề × 4 mức điểm). Ảnh Project (hát Xoan) cắt SGK tr. 37 |
