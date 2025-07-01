# DCA (Dollar-Cost Averaging) Automation Feature

## Tổng quan

Tính năng DCA Automation cho phép người dùng thiết lập lệnh tự động mua PGAUx tokens theo chiến lược Dollar-Cost Averaging. Điều này giúp giảm thiểu rủi ro biến động giá và xây dựng danh mục đầu tư một cách có hệ thống.

## Tính năng chính

### 🎯 Tự động hóa hoàn toàn
- Thiết lập một lần, chạy tự động
- Không cần can thiệp thủ công
- Thực thi đúng thời gian đã lên lịch

### 📊 Tần suất linh hoạt
- **Hàng ngày**: Mua mỗi ngày
- **Hàng tuần**: Mua mỗi tuần  
- **Hàng tháng**: Mua mỗi tháng

### 💰 Số tiền đầu tư
- Tối thiểu: $0.01
- Tối đa: $10,000
- Phí thực thi: 0.1% mỗi lần

### 🔄 Quản lý linh hoạt
- Tạm dừng/khôi phục kế hoạch
- Chỉnh sửa số tiền và tần suất
- Hủy bỏ kế hoạch bất cứ lúc nào

## Cách sử dụng

### 1. Tạo kế hoạch DCA

1. Đăng nhập vào dashboard
2. Chuyển sang tab "DCA Automation"
3. Nhấn "New Plan"
4. Nhập số tiền đầu tư (USD)
5. Chọn tần suất (Daily/Weekly/Monthly)
6. Nhấn "Create Plan"

### 2. Quản lý kế hoạch

#### Xem thống kê
- Tổng số tiền đã đầu tư
- Số lượng tokens đã nhận
- Số lần thực thi
- Thời gian thực thi tiếp theo

#### Điều chỉnh kế hoạch
- **Pause**: Tạm dừng tạm thời
- **Resume**: Khôi phục kế hoạch
- **Edit**: Thay đổi số tiền/tần suất
- **Cancel**: Hủy bỏ hoàn toàn

### 3. Theo dõi hiệu suất

Dashboard hiển thị:
- Trạng thái kế hoạch (Active/Paused/Overdue)
- Lịch sử thực thi
- Hiệu suất đầu tư
- Thông báo khi có vấn đề

## Kiến trúc kỹ thuật

### Smart Contracts

#### DCAAutomation.sol
```solidity
// Chức năng chính
- createDCAPlan(amount, frequency)
- updateDCAPlan(planId, amount, frequency)
- pauseDCAPlan(planId)
- resumeDCAPlan(planId)
- cancelDCAPlan(planId)
- executeDCA(user, planId)
```

#### Cấu trúc DCAPlan
```solidity
struct DCAPlan {
    address user;
    uint256 amount;           // Số tiền USD (wei)
    uint256 frequency;        // Tần suất (giây)
    uint256 lastExecution;    // Lần thực thi cuối
    uint256 nextExecution;    // Lần thực thi tiếp theo
    bool isActive;           // Trạng thái hoạt động
    uint256 totalInvested;   // Tổng đã đầu tư
    uint256 totalTokensReceived; // Tổng tokens nhận
    uint256 executionsCount; // Số lần thực thi
}
```

### Frontend Components

#### DCAPanel.tsx
- Giao diện chính cho DCA
- Form tạo/chỉnh sửa kế hoạch
- Danh sách kế hoạch
- Thống kê và biểu đồ

#### useDCA.ts Hook
- Quản lý state DCA
- Tương tác với smart contract
- Xử lý lỗi và loading states

### Bot Execution

#### dca-executor.js
```bash
# Thực thi DCA
npx hardhat run scripts/dca-executor.js --network mainnet execute

# Xem thống kê
npx hardhat run scripts/dca-executor.js --network mainnet stats

# Tạo kế hoạch mẫu
npx hardhat run scripts/dca-executor.js --network mainnet create-sample
```

## Bảo mật

### Kiểm soát truy cập
- **DEFAULT_ADMIN_ROLE**: Quản lý phí và cấu hình
- **OPERATOR_ROLE**: Thực thi DCA
- **UPGRADER_ROLE**: Nâng cấp contract

### Bảo vệ người dùng
- Giới hạn số tiền tối thiểu/tối đa
- Kiểm tra tần suất hợp lệ
- Chỉ chủ sở hữu mới được chỉnh sửa kế hoạch
- Circuit breaker tích hợp

### Emergency Controls
- Pause toàn bộ hệ thống
- Cập nhật phí thực thi
- Thay đổi địa chỉ nhận phí

## Triển khai

### 1. Deploy Contracts
```bash
# Deploy tất cả contracts
npx hardhat run scripts/deploy.js --network mainnet
```

### 2. Setup Bot
```bash
# Cài đặt cron job cho bot
# Ví dụ: Chạy mỗi giờ
0 * * * * /usr/bin/node /path/to/dca-executor.js execute
```

### 3. Monitoring
- Theo dõi gas fees
- Kiểm tra thực thi thành công
- Alert khi có lỗi
- Backup dữ liệu

## Lợi ích của DCA

### 📈 Giảm rủi ro biến động
- Mua ở nhiều mức giá khác nhau
- Trung bình hóa chi phí
- Không cần timing thị trường

### 🧠 Tâm lý tốt hơn
- Loại bỏ cảm xúc
- Kỷ luật đầu tư
- Tập trung vào dài hạn

### ⚡ Tự động hóa
- Tiết kiệm thời gian
- Không bỏ lỡ cơ hội
- Thực thi chính xác

### 📊 Hiệu quả chi phí
- Phí thấp (0.1%)
- Không phí quản lý
- Minh bạch hoàn toàn

## Ví dụ sử dụng

### Kịch bản 1: Đầu tư $100/tuần
```
Số tiền: $100
Tần suất: Weekly
Thời gian: 52 tuần
Tổng đầu tư: $5,200
Phí thực thi: $5.20 (0.1%)
```

### Kịch bản 2: Đầu tư $50/ngày
```
Số tiền: $50
Tần suất: Daily
Thời gian: 365 ngày
Tổng đầu tư: $18,250
Phí thực thi: $18.25 (0.1%)
```

## Troubleshooting

### Kế hoạch không thực thi
1. Kiểm tra trạng thái (Active/Paused)
2. Xem thời gian thực thi tiếp theo
3. Kiểm tra gas fees
4. Liên hệ support nếu cần

### Lỗi giao dịch
1. Kiểm tra số dư USD
2. Xem slippage tolerance
3. Thử lại sau vài phút
4. Giảm số tiền nếu cần

### Vấn đề kỹ thuật
1. Kiểm tra kết nối wallet
2. Refresh trang
3. Clear cache
4. Liên hệ technical support

## Roadmap

### Phase 1 (Hiện tại)
- ✅ DCA cơ bản
- ✅ Giao diện quản lý
- ✅ Bot thực thi

### Phase 2 (Tương lai)
- 📊 Biểu đồ hiệu suất
- 🎯 Chiến lược nâng cao
- 📱 Mobile app
- 🔔 Notifications

### Phase 3 (Dài hạn)
- 🤖 AI optimization
- 📈 Portfolio rebalancing
- 🌍 Multi-chain support
- 🏛️ Institutional features

## Hỗ trợ

- 📧 Email: support@pentagold.com
- 💬 Discord: discord.gg/pentagold
- 📖 Docs: docs.pentagold.com
- 🐛 Bug Report: github.com/pentagold/issues

---

*Tính năng DCA Automation được thiết kế để giúp bạn đầu tư một cách thông minh và có hệ thống. Hãy bắt đầu với số tiền nhỏ và tăng dần khi bạn cảm thấy thoải mái.* 