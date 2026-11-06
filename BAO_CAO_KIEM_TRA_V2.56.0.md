# Báo cáo sửa lỗi HUYỀN MOBILE v2.56.0

## Phạm vi và nguyên nhân
- **Nút ERP biến mất/khó thấy:** đưa nút **🔗 ERP TẮT/BẬT** thẳng lên tiêu đề, giữ công tắc phụ ngay dưới tiêu đề; chỉ hiện trong màn hình chat.
- **Chat AI báo TẮT mặc dù đã lưu Kie:** chính sách cũ `schema:2` có thể lưu `enabled:false` từ mặc định lỗi. Nâng lên `schema:3`, tự bật lại khi di trú cấu hình cũ; cho phép quản trị chủ động tắt trong cấu hình mới. Giữ cấu hình `deepseek-v4-1-flash` / `https://api.kie.ai/openai/v1/responses`.
- **Danh sách Excel mất sau khi mở lại:** nhận bản đệm IndexedDB đã xác minh từ cả nguồn đang chọn lẫn node kho Firebase dùng chung, sau đó đồng bộ hai danh sách *có kiểm đếm* trước khi đổi nguồn. Nếu tải mới lỗi, không xóa dữ liệu trước đó. Bổ sung thông tin số dòng và nút ⟳ ngoài phần Cài đặt.
- **PWA còn chạy mã cũ:** tăng version giao diện và tên cache service worker lên `v2.56.0`, giữ định danh/đường dẫn PWA đã chạy được, giữ các logo gốc.

## Kết quả kiểm tra có thể xác nhận
- `node --check`: JS nhúng, `catalog_normalizer.js` và `sw.js` không có lỗi cú pháp.
- Kiểm thử Node.js: di trú trạng thái tắt AI schema 2 thành bật; tắt có chủ đích schema 3 được giữ nguyên.
- Kiểm thử Node.js: chuẩn hóa danh sách 220 khách hàng, 883 sản phẩm; câu đơn 12 hộp Wamlox được tách thành một dòng.
- Kiểm thử Node.js: hai khóa phát sinh từ cùng mật khẩu mở được cấu hình AI mã hóa AES-GCM; bản mã không chứa API Key dạng rõ; dữ liệu danh sách qua JSON được đọc lại đúng số dòng.
- Kiểm tra đường dẫn Kie từ tài liệu API chính thức (DeepSeek V4.1 Flash).

## Giới hạn kiểm thử
- Chromium trong môi trường kiểm thử chặn điều hướng trang chạy thử, kể cả HTTPS giả lập và `file://`; **chưa thể chạy E2E giao diện** tại đây.
- Chưa gọi API Key thật, chưa kiểm tra quyền Firebase thực tế, chưa thử lên đơn trên ERP thật.
- Bản này **không** thay mã IDECO_SUITE trên PC. Chất lượng điều khiển ERP phụ thuộc cả extension PC và kiểm soát nghiệp vụ tại ERP.

## Kiểm thử chấp nhận trên máy công ty
1. Upload ZIP lên GitHub Pages đúng thư mục và xem tiêu đề `v2.56.0`.
2. Khởi động lại PWA, xác nhận ERP TẮT và chatbot Kie trả lời được.
3. Đồng bộ danh sách, đóng/mở lại app và so sánh số dòng KH/SP, sau đó thử thêm máy khác.
4. Bật ERP, ghép đúng PC, kiểm tra trạng thái ERP sẵn sàng.
5. Chạy đơn thử trên ERP, đối chiếu giá/CK/chính sách/đơn hàng; xử lý an toàn khi mất mạng, không gửi trùng.
