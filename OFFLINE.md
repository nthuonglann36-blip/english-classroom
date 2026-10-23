# Online và Offline

Website tiếp tục chạy trên GitHub Pages. Trang `offline.html` cho phép lưu riêng
từng bộ bài vào trình duyệt, không cần đăng nhập hoặc máy chủ mới.

## Cách sử dụng

1. Khi có Internet, mở website rồi chọn **Study offline** ở trang chủ hoặc
   **Save for offline** trong Self-study.
2. Chọn bộ Self-study, Unit hoặc Review và bấm **Lưu trên thiết bị này**.
3. Chờ báo **Đã lưu đầy đủ**. Sau đó có thể tắt mạng, mở lại website trong cùng
   trình duyệt và thiết bị, vào Offline rồi chọn **Mở bài đã lưu**.
4. Khi bộ bài có bản mới, dùng **Cập nhật bản lưu** lúc có Internet.
5. **Xóa bản lưu** chỉ xóa bộ Offline được chọn, giữ nguyên bản nháp Writing.

Các gói lưu HTML, ảnh, game, audio và video nội bộ. Câu hỏi Listening được lưu,
nhưng YouTube, Wordwall, ChatGPT và các nguồn bên ngoài vẫn cần Internet.
Không tải hoặc sao chép nội dung từ các dịch vụ đó. Bộ bài đã lưu không tự đồng
bộ sang thiết bị khác; dữ liệu có thể mất khi xóa dữ liệu trình duyệt hoặc bị
trình duyệt thu hồi dung lượng.

## Khi bổ sung hoặc sửa nội dung

Chạy từ gốc repository trước khi commit/publish:

```bash
python tools/build-offline-manifest.py
```

Script thêm hai thẻ manifest/bootstrap vào các trang chính nếu còn thiếu, giữ
nguyên kiểu xuống dòng, thu thập các tệp phụ thuộc, tính dung lượng và SHA-256,
rồi cập nhật `offline-manifest.js`. Cần commit tệp sinh ra cùng thay đổi nội dung.
Script bỏ qua `_source`, `tools`, `.git` và không sửa HTML game gốc trong assets.

Service worker chỉ hoạt động qua HTTPS hoặc localhost, trong đúng thư mục web
(bao gồm đường dẫn `/english-classroom/`). Mở bằng `file://` không cài chế độ
Offline; khi phát triển, dùng `python -m http.server 8000`.

Phần giao diện cơ bản được lưu khi service worker cài thành công. Các bộ bài
chỉ tải khi người dùng chọn. Bộ chưa lưu xong không được đánh dấu sẵn sàng;
lỗi mạng, hủy hoặc hết dung lượng sẽ giữ bộ cũ và hủy bộ đang tải. Mỗi bộ có cache
riêng, phiên bản và dấu hoàn tất. Việc cập nhật giao diện không xóa các bộ đã lưu.
Các tệp tải được đối chiếu SHA-256; media hỗ trợ HTTP Range khi dùng bản lưu.
Nội dung gần đây được lưu tối đa 120 tệp / khoảng 20 MB, không tự lưu media lớn.

`.nojekyll` giữ cách phục vụ tệp tĩnh, bao gồm các tài nguyên bắt đầu bằng `_`.
