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
| **L3 Reading** | `G10-U3-L3-Reading.pptx` (Lesson3_Reading_DOWNLOAD + Millionaire) + trò HTML của cô `Music_Mystery_Box_Unit3_Reading.html` (22/10) | Task 3 dùng 3 phương án A–C của SGK (PPT thêm D). 12 từ PPT → 6 từ giáo án + trò **The Masked Mic** (8 từ, 2 gợi ý). Trò của cô = `u03-l3-music-mystery-box.html` (cô tải lên GitHub trưa 22/10, kèm trang lesson3 chỉ có trò) → nay là slide 21 của bài đầy đủ (thay slide câu hỏi thêm). Tệp trò giữ nguyên như cô tải lên (theo AGENTS.md); trong khung slide trò cao hơn khung nên có thanh cuộn — bấm **Fullscreen** trong trò khi chơi. Bản trang-chỉ-có-trò vẫn xem được qua git (commit 1f28465). Millionaire (mẫu Pinny) trùng Task 2–3 → không dựng. Ảnh Task 1 cắt SGK tr. 31 |
| **L4 Speaking** | `G10-U3-L4-Speaking.pptx` (u3 spk + 6 từ SGK_Expanded + Don’t Say The Word) | Task 1 theo giáo án. Trò **Don’t Say It!** (10 thẻ Taboo, 45 giây) |
| **L5 Listening** | `G10-U3-L5-Listening.pptx` (u3 lis + trò điền poster lễ hội của cô) | Track 21/22. ⚠ **Task 2**: giáo án A, D — PPT ghi A, C, D. ⚠ **Task 3 câu 5**: giáo án T — PPT ghi F. Đang dùng đáp án giáo án, cô nghe lại để xác nhận. Trò thưởng Festival Info Desk (audio riêng) chưa đưa lên. Ảnh Task 1 cắt SGK tr. 33 |
| **L6 Writing** | `G10-U3-L6-Writing.pptx` (u3 wrt + 6 từ SGK_Expanded + Blog Builder Relay) | Blog của Ann nguyên văn sách. Blog Builder vòng 1–2 (xếp câu, sửa 5 lỗi) → slide lật đáp án; vòng 3 → câu mẫu Task 3 |
| **L7 Communication & Culture** | `G10-U3-L7-Communication-Culture.pptx` (u3 comm + Don’t say the word chầu văn) | Track 23. Bài đọc *chau van* nguyên văn sách tr. 35. Trò **Don’t Say the Word!** (10 từ chầu văn, chỉ lấy từ của trò mẫu Pinny). Trò thưởng Chau Van Stand/Sit chưa đưa lên |
| **L8 Looking back & Project** | `G10-U3-L8-Looking-back-Project.pptx` (L8 SGK_Expanded + Brain Brawl kiểu Jeopardy) | Track 24. Trò **Brain Brawl: Music Champions** (5 chủ đề × 4 mức điểm). Ảnh Project (hát Xoan) cắt SGK tr. 37 |

## Unit 4 · For a better community (tpl-community — giao diện mới 22/10: mòng két + cam, ảnh bìa = tranh slide 1 bài G10-U4-L1)

| Tiết | Nguồn | Ghi chú |
|---|---|---|
| **L1 Getting started** | `G10-U4-L1-Getting-started.pptx` (unit 4 get + Volunteer Charades từ mẫu We Bare Bears) | Track 28. Hội thoại nguyên văn sách tr. 42. Tranh khởi động + tranh từ vựng của PPT. 15 từ → 6. Trò **Volunteer Charades** (21 hoạt động, chỉ lấy chữ) |
| **L2 Language** | `G10-U4-L2-Language.pptx` (u4 lang + Powerpuff Puzzle – Word Heroes) | Track 29/30. Trò **Word Heroes** (10 câu đồng/trái nghĩa, kiểu thang câu hỏi, có 50:50; không dùng tên/nhân vật Powerpuff) |
| **L3 Reading** | `G10-U4-L3-Reading.pptx` (u4 read + Predict & Check + A Magical Journey) | Bài đọc nguyên văn tr. 45. ⚠ **Task 4**: giáo án in "4. T · 5. F (deliver free meals)" — lời giải thích thuộc câu 4; theo bài đọc và PPT: **1F 2T 3F 4F 5T** (đang dùng). Trò **Reading Quest** (câu hỏi của Magical Journey + 1 câu). Ảnh Task 1 cắt SGK tr. 45 |
| **L4 Speaking** | `G10-U4-L4-Speaking.pptx` (u4 spk + 5 từ + Volunteering to the rescue! của cô) | Task 2 giáo án để trống → đáp án ghi "e.g.". Trò **Volunteering to the Rescue!** (10 tình huống) |
| **L5 Listening** | `G10-U4-L5-Listening.pptx` (u4 lis + Volunteer Jobs từ mẫu Dream Jobs) | Track 31/32. Đáp án giáo án = PPT. Trò **Volunteer Jobs** (9 câu gợi ý emoji). Ảnh quảng cáo cắt SGK tr. 47 |
| **L6 Writing** | `G10-U4-L6-Writing.pptx` (u4 wrt, giữ nguyên) | Thư mẫu + quảng cáo nguyên văn tr. 48; bài mẫu Task 3 theo giáo án. Không có trò |
| **L7 Communication & Culture** | `G10-U4-L7-Communication-Culture.pptx` (unit 4 com, giữ nguyên) | Track 33. Bài đọc *Save the Children* nguyên văn tr. 49. Trò **Pass the Globe** (luật của PPT, 10 câu nghĩa từ) |
| **L8 Looking back & Project** | `G10-U4-L8-Looking-back-Game.pptx` (chỉ có trò Help Grandma) + SGK tr. 50–51 + giáo án | Track 34. Trò **Help Grandma Get Home** (8 câu chính + 8 câu dự phòng, dữ liệu lấy từ `G10_U4_Community_Quest_7_Games.html`). Ảnh Project cắt SGK tr. 51 |

## Unit 5 · Inventions (tpl-invent — giao diện mới 23/10: xanh đêm + vàng, vẽ bằng CSS)

PPT gộp Unit 5 **chưa có bài giảng gốc**: chỉ có slide từ vựng của cô + trò chơi → phần nhiệm vụ dựng theo SGK tr. 52–55 + giáo án
TA10-Unit 5.docx. Lesson 4–8 chưa có bài PPT hoàn chỉnh → thẻ trên bản đồ còn khoá.

| Tiết | Nguồn | Ghi chú |
|---|---|---|
| **L1 Getting started** | `G10-U5-L1-Getting-started.pptx` (13 từ + The Lucky Envelope từ mẫu Red Envelope) | Track 35. Hội thoại nguyên văn tr. 52. Lưới tìm từ cắt SGK tr. 53. Trò **Lucky Envelopes** (12 phát minh, có hộp may mắn) |
| **L2 Language** | `G10-U5-L2-Language.pptx` (6 từ + Let’s go shopping! + 2 trò thưởng ChatGPT) | Track 36/37. Đường qua sông: giáo án để ảnh → tự xác định: advantage, invention, computer, tradition. Tranh bài sắp xếp chữ cắt SGK tr. 54. Trò **Gadget Shop** (11 câu). Trò thưởng Hardware or Software? + Draw it! chưa đưa lên |
| **L3 Reading** | `G10-U5-L3-Reading.pptx` (từ mới + Asimo or Sophia? + AI Museum Mystery từ mẫu Museum Robbery) | Bài đọc nguyên văn tr. 55. Ảnh Asimo/Sophia + ảnh Task 3 cắt SGK tr. 55. Trò **AI Museum Mystery** (15 câu) |

## Unit 1–2 và Review 1 trong BAI-DAY-HOAN-CHINH (thêm chiều 22/10)

Là bản chép nguyên các PPT cô đã có (tháng 8–10) — chính là nguồn của các tiết Unit 1–2 đang có trên web → **không thay**.
Review 1 lớp 10 đã dựng thành ba tiết web; xem nguồn chi tiết bên dưới.

## Review 1 (Units 1–3)

Nội dung câu hỏi, bài đọc và đáp án dùng nguyên văn bản cô cung cấp trong yêu cầu dựng Review 1;
nguồn đối chiếu do cô chỉ định là SGK Global Success 10 tr. 38–41 và giáo án `TA10-Review 1.docx`.

| Tiết | Nguồn PPT | Nội dung trên web |
|---|---|---|
| **L1 Language** | `ppt game/BAI-DAY-HOAN-CHINH/Lop10-Review1/G10-R1-L1-Language.pptx` | SGK tr. 38–39; phát âm /br/, /gr/, /kr/, /pr/, /tr/; từ vựng và ngữ pháp Units 1–3. Audio `r01-track25.m4a` (Track 25). |
| **L2 Skills 1** | `ppt game/BAI-DAY-HOAN-CHINH/Lop10-Review1/G10-R1-L2-Skills-1.pptx` | SGK tr. 40; nghe về Elvis Presley và nói về ca sĩ/nhạc sĩ yêu thích. Audio `r01-track26.m4a`, `r01-track27.m4a` (Track 26–27). Lời thoại theo giáo án được tách thành ba slide, sau nút **Audio script**. |
| **L3 Skills 2** | `ppt game/BAI-DAY-HOAN-CHINH/Lop10-Review1/G10-R1-L3-Skills-2.pptx` | SGK tr. 40–41; bài đọc **Collect water to live a green life**, ô chữ `r01-l3-crossword.webp`, đoạn viết **Living green** và trò **Brain Brawl — Review 1**. Bài mẫu viết giữ nguyên lời văn cô cung cấp, tách thành hai slide, sau nút **Sample**. |

Trò `assets/games/r01-brain-brawl.html` lấy 20 câu hỏi (5 chủ đề × 4 mức điểm) từ phần **BONUS** của bài L1.
Ý tưởng mẫu Brain Brawl của Pinny: chỉ lấy chữ; khung trò được vẽ lại bằng `_board.css` + `_board.js`,
không đưa hình, nhân vật hay tên mẫu vào giao diện. Bốn đội: Life Leaders, Eco Explorers, Music Makers, Bright Minds.

Review dùng khung bài giảng lớp 10, không có `tpl-*`. Đáp án được mở từng bước; các phần dài tách slide để
giữ cỡ chữ thân bài từ 24 pt khi chiếu ở 1366×768. Toàn bộ audio, ảnh và trò chơi đều là tài nguyên nội bộ,
được gom trong gói Offline **g10-review1**.
