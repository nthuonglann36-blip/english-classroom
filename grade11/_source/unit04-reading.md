# Unit 4 · Lesson 3 Reading — bản PPT giáo viên gửi ngày 04/11/2026

Nguồn: **G11-U4-L3-Reading_Dong-bo-theme.pptx**, 73 slide, 30.022.078 byte.
SHA-256: `9d2271ad7c7305266015a66a159c95bc7d58c70ec47bd4e6de8f6db3ba545135`.
Theo yêu cầu ngày 04/11/2026, PPT nguồn được giữ ngoài repository phát hành; website và Offline không có tệp hoặc nút tải PPT gốc.

Bài web có **55 slide**. Các hình minh hoạ và bảng màu navy `#073765`, coral `#E54A3B`, nền kem `#FFF8EA` lấy từ PPT. Giao diện riêng ở `unit04/reading.css`, không đổi các bài khác.

## Nội dung được cập nhật

- Giữ cả sáu tiêu đề khởi động của slide 2 và sáu câu phân loại tin của slide 5–10. Các tiêu đề nằm trong ảnh chụp được chép lại thành chữ để dễ đọc khi chiếu; giữ lựa chọn Sport/Law/Food/Economy… của từng câu.
- Đủ 17 từ theo thứ tự PPT: raise awareness, discuss, discussion, strengthen, relation, look for, participant, participate, participation, support, opportunity, issue, eye-opening, gender equality, disability, live-streamed, represent. Định nghĩa tiếng Anh, ví dụ và cách dùng lấy từ PPT. Hình minh hoạ và nghĩa tiếng Việt đã có được giữ lại.
- Đủ Vocabulary Check, Word Detective, Headline Hunt, ba bản tin, đáp án và bằng chứng, Task 4, Task 5, phần ASEAN Reporter, bình chọn, wrap-up và bài tập về nhà.
- PPT mới chỉ minh hoạ các bản tin, vì vậy giữ nguyên bốn đoạn văn sách trong bài web trước đó, gồm bản tin số 2 đã tách làm hai trang. Không cắt nội dung bài đọc.

## Đáp án Task 2 và các bản game

Theo slide 34 của **PPT mới**: **1D · 2B · 3C**. Bản tin 2 dùng **B. Travelling to ASEAN countries**, với bằng chứng *Ship • journey • travel to five ASEAN countries*.

Bản web trước và `assets/games/u04-l3-explore-asean.html` dùng 2A theo giáo án trước đó. Tệp game cũ giữ nguyên. Bản `assets/games/u04-l3-explore-asean-reading2026.html` đã đồng bộ 2B theo PPT. Trong lần gửi tiếp theo ngày 04/11/2026, giáo viên gửi lại cùng PPT và bổ sung game HTML mới; bài Reading hiện nhúng **Asia Flags Reading Quest** dưới đây, cũng dùng 2B. Các tệp game trước đó không thay đổi.

## Asia Flags Reading Quest — game HTML giáo viên cung cấp

Nguồn: **reading_asean_flags_game.html**, 46.297 byte. SHA-256: `00f346dcde31fe7045b5e0bdeec2cc9262b14520462532c16764deb293a11a55`.

Lưu nguyên từng byte ở `assets/games/u04-l3-reading-asean-flags.html`, nhúng tại **slide web 45**, thay game Explore ASEAN của bản cập nhật trước. Hướng dẫn ở slide 44 được đồng bộ theo game mới:

- 16 ô cờ châu Á; 2–4 đội, có thể đặt tên đội.
- 12 câu: 3 câu tiêu đề (Task 2), 4 câu nghĩa từ (Task 3), 5 câu đọc chi tiết (Task 4).
- 4 ô bất ngờ: hai Lucky Flags +25 điểm, Double Points cho lần trả lời đúng tiếp theo +30, Lose a Turn chuyển lượt.
- Câu thường đúng +15, sai +0; mỗi câu có đồng hồ 30 giây, lời giải và bằng chứng. Có nút chỉnh ±5 và Undo.
- View news hiển thị đủ ba bản tin, tạm dừng đồng hồ khi mở và tiếp tục khi quay lại. Văn bản khớp với các đoạn trong bài web.
- SVG cờ và âm thanh tạo bằng Web Audio được đóng gói trong file, không gọi nguồn bên ngoài.

`unit04/flags-embed.js` chỉ điều chỉnh kích thước khung nhúng trên màn hình hẹp để giữ đủ tiêu đề và các nút; không sửa mã hoặc nội dung của game giáo viên gửi. Game Mystery Box ở slide 53 giữ nguyên. PPT gửi lại có cùng SHA-256 với nguồn đã dùng để dựng bài web.

## Mystery Box

`assets/games/u04-l3-reading-mystery-box.html` chuyển phần PPT 39–72 thành một trò chơi tương tác:

- Đủ 15 câu hỏi, lựa chọn và cặp từ gợi ý, từ các slide 42, 44, …, 70.
- Chọn 2–4 đội; trả lời sai chuyển lượt; trả lời đúng được giữ hoặc tặng hộp cho đội khác trước khi biết điểm.
- Bản web dùng các mức điểm ngẫu nhiên `-100, -50, 50, 100, 150, 200`, được bốc sau khi chọn đội nhận hộp. Đây là quy tắc điểm triển khai cho trò chơi web; các trang hộp trong PPT không có bảng điểm bằng chữ.
- Các câu đặt câu hoặc nêu ý kiến có **Suggested answer**, giáo viên chấp nhận câu trả lời phù hợp. Câu hỏi dữ kiện và lựa chọn có đáp án theo bài đọc.
- Điểm chỉ cộng/trừ một lần cho mỗi hộp; hộp đang chờ chọn người nhận không thể bị đóng để bỏ mất lượt thưởng. Sau 15 câu có kết quả, hỗ trợ hoà điểm và chơi lại.

## Ánh xạ PPT → web

| PPT | Slide web |
| --- | --- |
| 1 | 1 |
| 2 | 2–3 |
| 3–4 | 4 |
| 5–29 | 5–29 |
| 30 | 30–31 |
| 31 | 32 |
| 32 | 33–34 |
| 33, kèm văn bản sách | 35–40 |
| 34 | 41–43 |
| 35, bổ sung game HTML giáo viên gửi | 44–45; Asia Flags Reading Quest ở 45 |
| 36 | 46–48 |
| 37 | 49–50 |
| 38 | 51–52 |
| 39–72 | 53; game Mystery Box 15 câu |
| 73 | 54–55 |

Ảnh và hai game được lưu trong gói Offline Unit 4. PPT nguồn không phát hành; các tệp game giáo viên đã tải lên trước đó không thay đổi.
