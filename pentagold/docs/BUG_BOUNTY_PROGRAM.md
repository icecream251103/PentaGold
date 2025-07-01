# Chương Trình Bug Bounty PetraGold

## Tổng Quan Chương Trình

**Ngày khởi động**: Tháng 7/2025  
**Thời gian**: Liên tục (3 tháng đầu tập trung cao độ)  
**Tổng quỹ thưởng**: $100,000 USD  
**Phạm vi**: Hợp đồng thông minh, frontend, hệ thống oracle, hạ tầng

## Phạm Vi Và Mục Tiêu

### Tài Sản Trong Phạm Vi

#### Hợp Đồng Thông Minh (Trọng tâm)
- **Hợp đồng token PGAUx**: `0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5f`
- **Oracle Aggregator**: `0x8A791620dd6260079BF849Dc5567aDC3F2FdC318`
- **Circuit Breaker**: `0x610178dA211FEF7D417bC0e6FeD39F05609AD788`
- **Timelock Controller**: `0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e`
- **Hợp đồng interface**: Tất cả định nghĩa interface

#### Ứng Dụng Frontend
- **Web app**: https://testnet.petragold.io
- **API backend**: Tất cả dịch vụ backend
- **Xác thực**: Kết nối ví và quản lý phiên
- **Xử lý dữ liệu**: Kiểm tra và làm sạch đầu vào

#### Hệ Thống Oracle
- **Tổng hợp giá**: Logic oracle đa nguồn
- **Xác thực dữ liệu**: Kiểm tra dữ liệu cũ và lệch giá
- **Cơ chế dự phòng**: Xử lý lỗi oracle
- **Chống thao túng giá**: Kiểm thử khả năng chống tấn công

#### Hạ Tầng
- **Bảo mật mạng**: RPC endpoint, bảo vệ node
- **Bảo mật cơ sở dữ liệu**: Lưu trữ và kiểm soát truy cập
- **Bảo mật API**: Giới hạn truy cập, xác thực
- **Giám sát**: Cảnh báo và ghi log

### Ngoài Phạm Vi
- **Dịch vụ bên thứ ba**: Chainlink, Band Protocol, Infura
- **Tấn công xã hội**: Phishing, lừa đảo
- **Bảo mật vật lý**: Phần cứng, cơ sở vật chất
- **Tấn công DoS**: Flood mạng
- **Vấn đề đã biết**: Hạn chế đã công bố

## Cơ Cấu Thưởng

### Nghiêm Trọng: $10,000 - $25,000
- **Hợp đồng thông minh**: Mất/quyết quỹ trực tiếp
- **Thao túng oracle**: Làm sai lệch nguồn giá
- **Kiểm soát truy cập**: Leo thang đặc quyền admin
- **Lỗ hổng nâng cấp**: Proxy không an toàn
- **Tấn công kinh tế**: Mint vô hạn, lách phí

### Cao: $5,000 - $15,000
- **Hợp đồng thông minh**: Mất/quyết quỹ gián tiếp
- **Oracle**: Lệch giá lớn
- **Xác thực**: Truy cập trái phép
- **Toàn vẹn dữ liệu**: Sửa đổi hoặc làm sai lệch
- **Circuit Breaker**: Lách hoặc lỗi chức năng

### Trung Bình: $1,000 - $5,000
- **Hợp đồng thông minh**: Tấn công DoS, griefing
- **Frontend**: XSS, CSRF, injection
- **API**: Lách giới hạn truy cập
- **Rò rỉ thông tin**: Lộ dữ liệu nhạy cảm
- **Lỗi logic**: Tính toán sai

### Thấp: $250 - $1,000
- **UI/UX**: Ảnh hưởng bảo mật nhỏ
- **Rò rỉ thông tin**: Dữ liệu không nhạy cảm
- **Cấu hình**: Thiết lập bảo mật chưa tối ưu
- **Tài liệu**: Sai sót liên quan bảo mật
- **Thực hành tốt**: Lệch chuẩn nhỏ

### Thông Tin: $50 - $250
- **Chất lượng mã**: Cải thiện liên quan bảo mật
- **Tài liệu**: Rõ ràng, đầy đủ
- **Kiểm thử**: Thiếu test case
- **Giám sát**: Thiếu cảnh báo
- **Tuân thủ**: Yêu cầu pháp lý

## Hướng Dẫn Báo Cáo

### Yêu Cầu Báo Cáo

#### Chi Tiết Lỗ Hổng
- **Tiêu đề**: Tóm tắt rõ ràng
- **Mức độ nghiêm trọng**: Tự đánh giá
- **Mô tả**: Giải thích chi tiết
- **Tác động**: Hậu quả và người dùng bị ảnh hưởng
- **Tái hiện**: Hướng dẫn từng bước
- **Bằng chứng**: Mã, ảnh, video
- **Khắc phục**: Đề xuất sửa lỗi

#### Thông Tin Kỹ Thuật
- **Môi trường**: Mạng, trình duyệt, công cụ
- **Hợp đồng**: Địa chỉ, hàm liên quan
- **Giao dịch**: Hash minh chứng
- **Log**: Thông báo lỗi liên quan
- **Thời gian**: Ngày phát hiện, thời gian test

#### Tài Liệu Hỗ Trợ
- **Đoạn mã**: Mã khai thác, test case
- **Ảnh chụp**: Bằng chứng trực quan
- **Video**: Quay lại quá trình khai thác
- **Tài liệu**: Đặc tả, tiêu chuẩn liên quan
- **Tham khảo**: Lỗ hổng tương tự

### Quy Trình Gửi Báo Cáo

1. **Báo cáo ban đầu**: Gửi về security@tetragold.io
2. **Xác nhận**: Phản hồi trong 24h
3. **Phân loại**: Đánh giá mức độ trong 72h
4. **Điều tra**: Phân tích và xác thực chi tiết
5. **Khắc phục**: Phát triển và kiểm thử bản vá
6. **Xác minh**: Đảm bảo đã xử lý triệt để
7. **Thưởng**: Xử lý thanh toán và ghi nhận

### Quy Tắc Giao Tiếp
- **Bảo mật**: Không công khai trước khi vá
- **Hợp tác**: Làm việc cùng đội để làm rõ
- **Kiên nhẫn**: Chờ thời gian xử lý hợp lý
- **Chuyên nghiệp**: Giao tiếp tôn trọng, xây dựng
- **Cập nhật**: Thông báo tiến độ thường xuyên

## Tiêu Chí Đánh Giá

### Yếu Tố Đánh Giá Mức Độ

#### Điểm Tác Động
- **Bảo mật thông tin**: Lộ dữ liệu, vi phạm riêng tư
- **Toàn vẹn**: Sửa đổi, làm sai lệch dữ liệu
- **Khả dụng**: Gián đoạn dịch vụ
- **Tài chính**: Mất mát trực tiếp/gián tiếp
- **Uy tín**: Ảnh hưởng thương hiệu, niềm tin

#### Yếu Tố Khai Thác
- **Độ phức tạp**: Kỹ năng, tài nguyên cần thiết
- **Điều kiện tiên quyết**: Yêu cầu truy cập đặc biệt
- **Độ tin cậy**: Khả năng khai thác thành công
- **Tự động hóa**: Có thể tự động hóa tấn công không
- **Quy mô**: Số lượng người dùng/tài sản bị ảnh hưởng

#### Bối Cảnh Kinh Doanh
- **Tác động người dùng**: Ảnh hưởng trải nghiệm
- **Pháp lý**: Tuân thủ quy định
- **Cạnh tranh**: Lợi thế đối thủ
- **Vận hành**: Ảnh hưởng hoạt động
- **Chiến lược**: Tác động mục tiêu dài hạn

### Tiêu Chí Chất Lượng
- **Tính mới**: Lỗ hổng chưa từng công bố
- **Rõ ràng**: Dễ hiểu, tái hiện được
- **Đầy đủ**: Phân tích, kiểm thử toàn diện
- **Xây dựng**: Đề xuất sửa lỗi hữu ích
- **Kịp thời**: Báo cáo đúng lúc

## Công Bố Có Trách Nhiệm

### Lộ Trình Công Bố
- **Ngày 0**: Nhận báo cáo lỗ hổng
- **Ngày 1**: Xác nhận và phân loại ban đầu
- **Ngày 3**: Đánh giá mức độ, bắt đầu điều tra
- **Ngày 14**: Phát triển bản vá sơ bộ
- **Ngày 30**: Kiểm thử và xác thực bản vá
- **Ngày 45**: Triển khai và xác minh
- **Ngày 60**: Công bố công khai (nếu phù hợp)

### Quy Tắc Công Bố
- **Không công khai**: Trước khi vá xong
- **Công bố phối hợp**: Nếu muốn, công bố chung
- **Ghi nhận**: Nêu tên trong thông báo bảo mật
- **Thời gian giữ bí mật**: Tối thiểu 30 ngày với lỗi nghiêm trọng
- **Xử lý ngoại lệ**: Quy trình khẩn cấp nếu bị khai thác thực tế

### Trách Nhiệm Nhà Nghiên Cứu
- **Thiện chí**: Nghiên cứu bảo mật hợp pháp
- **Tối thiểu hóa tác động**: Không phá hoại dữ liệu/dịch vụ
- **Tôn trọng riêng tư**: Không truy cập dữ liệu người dùng
- **Tuân thủ pháp luật**: Không vi phạm quy định
- **Bảo mật**: Giữ bí mật đến khi công bố

## Khung Pháp Lý

### Cam Kết An Toàn
Nhà nghiên cứu hành động thiện chí sẽ không bị kiện khi:
- **Kiểm thử bảo mật**: Nghiên cứu lỗ hổng được phép
- **Truy cập dữ liệu**: Chỉ đủ để chứng minh
- **Gián đoạn dịch vụ**: Ảnh hưởng nhỏ ngoài ý muốn
- **Công bố**: Theo đúng quy trình công bố có trách nhiệm

### Điều Khoản
- **Đối tượng**: Mở cho mọi nhà nghiên cứu bảo mật
- **Loại trừ**: Nhân viên TetraGold và người thân
- **Thuế**: Người nhận tự chịu trách nhiệm thuế
- **Tranh chấp**: Giải quyết qua trọng tài
- **Thay đổi**: Có thể cập nhật điều khoản

### Hoạt Động Cấm
- **Tấn công xã hội**: Nhắm vào nhân viên/người dùng
- **Tấn công vật lý**: Phần cứng, cơ sở vật chất
- **Tấn công DoS**: Chủ động gây gián đoạn
- **Phá hoại dữ liệu**: Xóa, làm hỏng dữ liệu
- **Spam**: Báo cáo trùng lặp, chất lượng thấp

## Ghi Nhận Và Thưởng

### Bảng Vinh Danh
- **Công khai**: Được nêu tên trên trang bảo mật
- **Cấp độ thành tích**: Theo chất lượng đóng góp
- **Giải thưởng năm**: Vinh danh nhà nghiên cứu xuất sắc
- **Cơ hội trình bày**: Tham gia hội thảo bảo mật
- **Kết nối cộng đồng**: Tham dự sự kiện bảo mật

### Quy Trình Thưởng
- **Phương thức**: Tiền mã hóa hoặc chuyển khoản
- **Thời gian xử lý**: 30 ngày sau khi vá lỗi
- **Giấy tờ thuế**: Mẫu 1099 cho nhà nghiên cứu Mỹ
- **Tiền tệ**: USD quy đổi tại thời điểm trả
- **Ngưỡng tối thiểu**: $50/lần trả

### Thưởng Bổ Sung
- **Phát hiện đầu tiên**: Thưởng thêm 25% cho lỗ hổng mới
- **Chất lượng xuất sắc**: Thưởng thêm đến 50%
- **Nhiều lỗi liên quan**: Cộng dồn thưởng
- **Hợp tác**: Ghi nhận hỗ trợ đội
- **Sáng tạo**: Thưởng cho phương pháp kiểm thử mới

## Quản Lý Chương Trình

### Quy Trình Xem Xét
- **Đội phân loại**: Đánh giá ban đầu
- **Xem xét kỹ thuật**: Phân tích chuyên sâu
- **Đánh giá tác động**: Phân tích rủi ro
- **Đội khắc phục**: Phát triển và kiểm thử bản vá
- **Đảm bảo chất lượng**: Xác minh và triển khai

### Cải Tiến Liên Tục
- **Đánh giá hàng tháng**: Hiệu quả chương trình
- **Phản hồi nhà nghiên cứu**: Khảo sát, góp ý
- **So sánh ngành**: Đối chiếu với chương trình khác
- **Tối ưu quy trình**: Tự động hóa, đơn giản hóa
- **Mở rộng phạm vi**: Bổ sung khi hệ thống phát triển

## Tài Nguyên Và Hỗ Trợ

### Tài Liệu
- **Tài liệu kỹ thuật**: Kiến trúc, hướng dẫn triển khai
- **API**: Đặc tả endpoint, ví dụ
- **Mã hợp đồng**: Đã xác thực trên Etherscan
- **Bộ kiểm thử**: Test case, kịch bản kiểm thử
- **Khung bảo mật**: Tài liệu mô hình bảo mật

### Môi Trường Kiểm Thử
- **Testnet**: Đã triển khai trên Sepolia
- **Token test**: Có faucet cấp token
- **Công cụ giám sát**: Dashboard thời gian thực
- **Thông tin debug**: Log chi tiết cho nhà nghiên cứu
- **Sandbox**: Môi trường kiểm thử biệt lập

### Hỗ Trợ Cộng Đồng
- **Discord**: Kênh #bug-bounty trao đổi
- **Giờ hỗ trợ**: Q&A hàng tuần với đội bảo mật
- **Webinar**: Video hướng dẫn kiến trúc hệ thống
- **Mentor**: Hỗ trợ nhà nghiên cứu mới
- **Hợp tác**: Cơ hội làm việc cùng các nhà nghiên cứu khác

---

**Khởi động chương trình**: Tháng 7/2025  
**Cập nhật**: Đánh giá hàng tháng  
**Pháp lý**: Điều khoản có thể thay đổi với thông báo 30 ngày