# Báo cáo rà soát HUYỀN MOBILE v2.55.0

**Phạm vi:** mã nguồn Mobile v2.54.1 làm nền, đối chiếu với cầu nối HUYỀN SALES đang có trong IDECO_SUITE v1.0.12. Chỉ sửa Mobile; không thay đổi chứng từ hoặc chương trình khuyến mại ERP.

## Những phần đã sửa

| Hạng mục | Trước | v2.55.0 |
|---|---|---|
| Đăng nhập | Hỏi mật khẩu mỗi lần mở | Lưu phiên bằng CryptoKey không xuất được trên thiết bị, tự khôi phục phiên khi còn dữ liệu website |
| Trò chuyện độc lập | Một số câu có từ khóa ERP bị chặn ngay | ERP tắt vẫn chuyển chatbot AI trả lời nhưng không bịa dữ liệu ERP |
| Tốc độ nối PC | Chủ yếu đợi realtime/trạm 9 giây | Đọc trạng thái ngay một lượt và tiếp tục realtime, giảm chờ ban đầu xuống 6 giây |
| Trạng thái ERP | PC online có thể bị hiểu nhầm là ERP đã sẵn sàng | Phân biệt PC offline / chưa kết nối ERP / ERP sẵn sàng, kèm nút làm mới |
| An toàn lệnh ERP | Có thể gửi lệnh khi PC chưa sẵn sàng | Chỉ gửi khi trạm online và báo ERP đã nối, giữ nguyên đơn nháp nếu lỗi |
| Thử gửi lại | Có nút gửi lại ngay cả lệnh ERP lỗi | Không hiện nút gửi lại tự động với lệnh ERP cần xác minh chứng từ |
| Chuẩn hóa đơn | Có thể lấy nhầm “nhà thuốc”, “lấy”, “đặt” làm tên thuốc | Bổ sung xử lý câu nói tự nhiên, nhận một dòng hàng đúng trong các ví dụ kiểm thử |
| Đổi chế độ ERP | Nạp lại lịch sử nhiều lần | Giữ nguyên tin nhắn đang xử lý, giảm đọc lại IndexedDB |
| Trò chuyện AI | Ngữ cảnh gửi dài hơn | Giảm lịch sử gửi theo lượt để giảm payload; có timeout minh bạch |
| PWA | v2.54.1 | v2.55.0, giữ `id`, `start_url`, `scope` và logo |

## Điều kiện nghiệm thu còn bắt buộc

1. API thực (Kie): xác minh khóa, phản hồi model, ảnh/file và quota bằng mạng điện thoại công ty.
2. Firebase: xác minh tự đồng bộ và tự mở lại trên ít nhất hai thiết bị thật (Android/iOS nếu có), đặc biệt khi kết nối 4G thay Wi-Fi.
3. ERP: xác minh máy trạm và ERP thực sự đã kết nối trước khi cho lệnh, kết quả phản hồi đúng yêu cầu.
4. Đơn hàng: kiểm tra ít nhất một đơn có khuyến mại/chiết khấu và một đơn từ số lượng lớn, đối chiếu chính sách ERP trước khi lưu chính thức.
5. Lỗi mạng: ngắt PC, mất mạng giữa lệnh, khởi động lại PC, thử hai điện thoại đồng thời. Đối soát nhật ký/chứng từ ERP để tránh trùng hoặc sót.
6. An toàn: thiết lập Firebase Rules có xác thực và hạn chế truy cập khóa API; lưu khóa AES ở trình duyệt không tương đương xác thực máy chủ.

**Kết luận:** bản Mobile đã được vá và kiểm tra tĩnh, nhưng **chưa đủ cơ sở tuyên bố hệ thống Mobile–PC–ERP sẵn sàng chạy chính thức** nếu chưa vượt qua các bài kiểm tra trực tiếp. Một rủi ro cần xử lý về dài hạn là bảo đảm giao dịch lệnh ERP đầu-cuối khi PC dừng sau khi nhận quyền xử lý.
