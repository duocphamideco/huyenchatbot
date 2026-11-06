# Báo cáo kiểm tra HUYỀN MOBILE v2.57.0

## Vấn đề được xử lý
Sau khi đóng/mở ứng dụng, ô chọn file Excel trống do hạn chế bảo mật của trình duyệt. Bên cạnh đó, bản v2.56.0 khôi phục danh mục theo nguồn đã chọn, có thể bỏ qua bộ đệm cũ nếu URL thay đổi, và việc tự tải lại Firebase phụ thuộc vào luồng tải cấu hình AI.

## Điều chỉnh
- Tải dữ liệu IndexedDB ngay khi mở Mobile; sau đó đồng bộ Firebase độc lập API/ERP.
- Tách trạng thái **đã ghi và kiểm chứng trên Firebase** với **đã lưu về thiết bị**.
- Hiển thị số lượng và thời điểm lưu, cùng tên tệp Excel được lưu tại metadata.
- Khôi phục bộ đệm cũ từ node Mobile ban đầu, nhưng ưu tiên thay bằng dữ liệu hợp lệ mới.
- Chỉ xác nhận dữ liệu trên Firebase sau khi nhận đủ hai danh sách và so khớp số dòng metadata.
- Không xóa bộ đệm nếu mạng lỗi; báo riêng khi IndexedDB bị chặn.
- Bump service worker cache v2.57.0.

## Kết quả kiểm thử
- `node --check` trên các script: ĐẠT.
- Đọc CSV mẫu sản phẩm và khách hàng: ĐẠT.
- Mô phỏng 2 thiết bị đọc từ cùng Firebase: ĐẠT.
- Mô phỏng offline khôi phục IndexedDB: ĐẠT.
- Firebase metadata không khớp số dòng: bị chặn, ĐẠT.
- Kiểm thử Chromium full UI: **CHƯA ĐẠT ĐIỀU KIỆN CHẠY**, browser bị `ERR_BLOCKED_BY_ADMINISTRATOR` kể cả localhost và trang giả lập.
- Firebase thật / tài khoản IDECO: **CHƯA KIỂM THỬ**.
