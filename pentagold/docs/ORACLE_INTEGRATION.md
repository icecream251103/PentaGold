# Hướng Dẫn Tích Hợp Oracle

## Tổng Quan

Hệ thống oracle của TetraGold tổng hợp dữ liệu giá vàng từ nhiều nguồn uy tín để đảm bảo nguồn giá chính xác, tin cậy và chống thao túng. Tài liệu này trình bày kiến trúc oracle, quy trình tích hợp và hướng dẫn vận hành.

## Kiến Trúc

### Tổng Hợp Đa Nguồn

Hệ thống oracle kết hợp dữ liệu từ nhiều nguồn để tạo nguồn giá mạnh, chống giả mạo:

```
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Chainlink  │    │ Band Protocol│    │ Custom Oracle│
│  Gold/USD   │    │  Gold/USD   │    │   Gold/USD  │
└───────┬──────┘    └───────┬──────┘    └───────┬──────┘
        │                  │                  │
        │                  │                  │
        └────────────┬────────────┬────────────┘
                     │
           ┌─────────▼─────────┐
           │ Oracle Aggregator│
           │ Weighted Average │
           │ Deviation Checks │
           │ Staleness Valid. │
           └─────────┬─────────┘
                     │
           ┌─────────▼─────────┐
           │ Circuit Breaker   │
           │ Price Limits      │
           │ Time Window       │
           └─────────┬─────────┘
                     │
           ┌─────────▼─────────┐
           │   PGAUx Token     │
           │ Mint/Redeem Logic │
           └───────────────────┘
```

### Cấu Hình Oracle

Mỗi nguồn oracle cấu hình các tham số riêng:

```solidity
struct OracleConfig {
    address oracle;        // Địa chỉ hợp đồng oracle
    uint256 weight;        // Trọng số trong tổng hợp (basis point)
    uint256 maxStaleness;  // Tuổi dữ liệu tối đa (giây)
    bool isActive;         // Bật/tắt nguồn này
}
```

## Nguồn Oracle Hỗ Trợ

### 1. Chainlink Price Feeds

**Nguồn chính**: Mạng oracle phi tập trung Chainlink cung cấp giá chất lượng cao.

#### Chi Tiết Tích Hợp
- **Địa chỉ feed**: `0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6` (Gold/USD Ethereum)
- **Tần suất cập nhật**: Mỗi khi lệch 1% hoặc 24h
- **Decimals**: 8
- **Heartbeat**: 86400 giây (24h)

#### Triển Khai
```solidity
interface IChainlinkOracle {
    function latestRoundData() external view returns (
        uint80 roundId,
        int256 price,
        uint256 startedAt,
        uint256 updatedAt,
        uint80 answeredInRound
    );
}
```

### 2. Band Protocol

**Nguồn phụ**: Band Protocol cung cấp xác thực giá bổ sung.

#### Chi Tiết Tích Hợp
- **Symbol**: `XAU/USD`
- **Tần suất cập nhật**: Lệch 0.5% hoặc 12h
- **Decimals**: 18
- **Nguồn dữ liệu**: Nhiều nhà cung cấp tài chính truyền thống

#### Triển Khai
```solidity
interface IBandOracle {
    function getReferenceData(string memory base, string memory quote)
        external view returns (ReferenceData memory);
}
```

### 3. Oracle Tùy Chỉnh

**Nguồn bổ sung**: Đảm bảo dự phòng, tăng độ tin cậy.

#### Nhà cung cấp hỗ trợ
- **API3**: dAPI giá vàng
- **DIA**: Dữ liệu cộng đồng
- **Tellor**: Oracle phi tập trung
- **Umbrella Network**: Oracle cộng đồng

## Logic Tổng Hợp Giá

### Tính Trung Bình Trọng Số

Aggregator tính trung bình trọng số các giá hợp lệ:

```solidity
function calculateWeightedAverage(PriceData[] memory prices) 
    internal view returns (uint256 weightedPrice, uint256 totalConfidence) {
    
    uint256 totalWeightedPrice = 0;
    uint256 totalWeight = 0;
    uint256 confidenceSum = 0;

    for (uint256 i = 0; i < prices.length; i++) {
        address oracleAddr = prices[i].source;
        uint256 weight = oracles[oracleAddr].weight;
        
        totalWeightedPrice += prices[i].price * weight;
        totalWeight += weight;
        confidenceSum += prices[i].confidence;
    }

    weightedPrice = totalWeightedPrice / totalWeight;
    totalConfidence = confidenceSum / prices.length;
}
```

### Quy Tắc Xác Thực

#### Kiểm Tra Dữ Liệu Cũ
```solidity
function isStale(uint256 timestamp, uint256 maxStaleness) 
    internal view returns (bool) {
    return block.timestamp - timestamp > maxStaleness;
}
```

#### Kiểm Tra Lệch Giá
```solidity
function checkDeviation(uint256 newPrice, uint256 lastPrice) 
    internal view returns (bool exceeded, uint256 deviation) {
    
    uint256 priceDiff = newPrice > lastPrice 
        ? newPrice - lastPrice 
        : lastPrice - newPrice;
    
    deviation = (priceDiff * 10000) / lastPrice;
    exceeded = deviation > deviationThreshold;
}
```

#### Ngưỡng Tin Cậy
```solidity
function hasMinimumConfidence(uint256 confidence) 
    internal pure returns (bool) {
    return confidence >= MIN_CONFIDENCE; // 80%
}
```

## Tích Hợp Circuit Breaker

### Giới Hạn Biến Động Giá

Circuit breaker giám sát biến động giá và kích hoạt bảo vệ:

```solidity
struct CircuitBreakerConfig {
    uint256 priceDeviationThreshold; // Lệch tối đa 5%
    uint256 timeWindow;              // Cửa sổ 5 phút
    uint256 cooldownPeriod;          // Hồi phục 1h
    bool isActive;                   // Bật/tắt
}
```

### Điều Kiện Kích Hoạt

1. **Nhảy giá lớn**: >5% trong 1 lần cập nhật
2. **Biến động nhanh**: >5% cộng dồn trong 5 phút
3. **Oracle lỗi**: <2 nguồn còn hoạt động
4. **Tin cậy thấp**: <80% điểm tin cậy trung bình

### Quy Trình Phục Hồi

1. **Tự động reset**: Sau thời gian hồi phục
2. **Reset thủ công**: Vai trò khẩn cấp có thể reset
3. **Khôi phục dần**: Giới hạn giảm trong giai đoạn phục hồi
4. **Bình thường**: Trở lại giới hạn chuẩn sau ổn định

## Quản Lý Oracle

### Thêm Oracle Mới

```solidity
function addOracle(
    address oracle,
    uint256 weight,
    uint256 maxStaleness
) external onlyRole(ORACLE_MANAGER_ROLE) {
    require(oracleList.length < MAX_ORACLES, "Quá nhiều oracle");
    require(weight > 0 && weight <= TOTAL_WEIGHT, "Trọng số không hợp lệ");
    
    oracles[oracle] = OracleConfig({
        oracle: oracle,
        weight: weight,
        maxStaleness: maxStaleness,
        isActive: true
    });
    
    oracleList.push(oracle);
    emit OracleAdded(oracle, weight);
}
```

### Cập Nhật Trọng Số Oracle

```solidity
function updateOracleWeight(address oracle, uint256 newWeight) 
    external onlyRole(ORACLE_MANAGER_ROLE) {
    
    require(oracles[oracle].oracle != address(0), "Không tìm thấy oracle");
    require(newWeight > 0 && newWeight <= TOTAL_WEIGHT, "Trọng số không hợp lệ");
    
    uint256 oldWeight = oracles[oracle].weight;
    uint256 totalWeight = calculateTotalWeight() - oldWeight + newWeight;
    require(totalWeight <= TOTAL_WEIGHT, "Tổng trọng số vượt giới hạn");
    
    oracles[oracle].weight = newWeight;
    emit OracleWeightUpdated(oracle, newWeight);
}
```

### Xóa Oracle

```solidity
function removeOracle(address oracle) 
    external onlyRole(ORACLE_MANAGER_ROLE) {
    
    require(oracles[oracle].oracle != address(0), "Không tìm thấy oracle");
    require(oracleList.length > MIN_ORACLES, "Không đủ oracle");
    
    // Xóa khỏi mảng
    for (uint256 i = 0; i < oracleList.length; i++) {
        if (oracleList[i] == oracle) {
            oracleList[i] = oracleList[oracleList.length - 1];
            oracleList.pop();
            break;
        }
    }
    
    delete oracles[oracle];
    emit OracleRemoved(oracle);
}
```

## Giám Sát & Cảnh Báo

### Kiểm Tra Sức Khỏe

#### Tình Trạng Oracle
```javascript
async function checkOracleHealth() {
    const oracles = await oracleAggregator.getAllPrices();
    const activeCount = oracles.filter(o => o.timestamp > Date.now() - 3600000).length;
    
    if (activeCount < MIN_ORACLES) {
        alert('NGHIÊM TRỌNG: Không đủ oracle hoạt động');
    }
}
```

#### Theo Dõi Lệch Giá
```javascript
async function monitorPriceDeviation() {
    const [currentPrice] = await oracleAggregator.getLatestPrice();
    const marketPrice = await getExternalMarketPrice();
    
    const deviation = Math.abs(currentPrice - marketPrice) / marketPrice;
    
    if (deviation > 0.02) { // Ngưỡng 2%
        alert('CẢNH BÁO: Lệch giá lớn');
    }
}
```

#### Trạng Thái Circuit Breaker
```javascript
async function checkCircuitBreaker() {
    const isTriggered = await circuitBreaker.isTriggered();
    const timeUntilReset = await circuitBreaker.getTimeUntilReset();
    
    if (isTriggered) {
        alert(`CẢNH BÁO: Circuit breaker đang hoạt động. Reset sau ${timeUntilReset} giây`);
    }
}
```

### Ngưỡng Cảnh Báo

| Chỉ số | Cảnh báo | Nghiêm trọng |
|--------|----------|--------------|
| Số oracle | <3 | <2 |
| Lệch giá | >2% | >5% |
| Dữ liệu cũ | >30 phút | >60 phút |
| Điểm tin cậy | <85% | <80% |
| Circuit breaker | Đang kích hoạt | >2 lần/ngày |

## Quy Trình Khẩn Cấp

### Xử Lý Oracle Lỗi

1. **Hành động ngay**
   - Vô hiệu hóa oracle lỗi
   - Tăng trọng số oracle còn lại
   - Kích hoạt nguồn dự phòng
   - Báo đội vận hành

2. **Điều tra**
   - Phân tích nguyên nhân
   - Kiểm tra trạng thái nhà cung cấp
   - Xác thực dữ liệu
   - Ghi nhận sự cố

3. **Phục hồi**
   - Khôi phục oracle
   - Tăng dần trọng số
   - Theo dõi ổn định
   - Cập nhật quy trình nếu cần

### Phát Hiện Thao Túng Giá

1. **Dấu hiệu**
   - Biến động giá lớn bất thường
   - Lệch xa giá thị trường
   - Volume giao dịch bất thường
   - Dữ liệu oracle không đồng nhất

2. **Xử lý**
   - Kích hoạt circuit breaker
   - Dừng giao dịch
   - Điều tra nguồn dữ liệu
   - Phối hợp nhà cung cấp oracle

3. **Phục hồi**
   - Xác thực lại giá
   - Reset circuit breaker
   - Khôi phục dần hoạt động
   - Bổ sung biện pháp bảo vệ

## Kiểm Thử & Xác Thực

### Unit Test

```javascript
describe("Oracle Aggregator", function() {
    it("Tổng hợp giá đúng", async function() {
        // Test trung bình trọng số
        // Test phát hiện lệch giá
        // Test kiểm tra dữ liệu cũ
    });
    
    it("Xử lý oracle lỗi", async function() {
        // Test khi oracle lỗi
        // Test yêu cầu số oracle tối thiểu
        // Test cơ chế dự phòng
    });
});
```

### Integration Test

```javascript
describe("Circuit Breaker Integration", function() {
    it("Kích hoạt khi biến động giá lớn", async function() {
        // Test phát hiện biến động
        // Test tự động kích hoạt
        // Test quy trình phục hồi
    });
});
```

### Stress Test

```javascript
describe("Oracle Stress Tests", function() {
    it("Xử lý cập nhật tần suất cao", async function() {
        // Test cập nhật giá liên tục
        // Test tối ưu gas
        // Test ổn định hệ thống
    });
});
```

## Danh Sách Kiểm Tra Triển Khai

### Trước Khi Triển Khai
- [ ] Đã triển khai, xác thực hợp đồng oracle
- [ ] Cấu hình, kiểm thử nguồn giá
- [ ] Đặt tham số circuit breaker
- [ ] Cấu hình phân quyền
- [ ] Sẵn sàng hệ thống giám sát

### Khi Triển Khai
- [ ] Deploy aggregator
- [ ] Cấu hình oracle ban đầu
- [ ] Thiết lập circuit breaker
- [ ] Cấp quyền cần thiết
- [ ] Xác thực kết nối

### Sau Khi Triển Khai
- [ ] Theo dõi nguồn giá
- [ ] Kiểm thử quy trình khẩn cấp
- [ ] Xác thực logic tổng hợp
- [ ] Kiểm tra circuit breaker
- [ ] Ghi nhận cấu hình

## Bảo Trì

### Công Việc Định Kỳ
- **Hàng ngày**: Theo dõi sức khỏe oracle, độ chính xác giá
- **Hàng tuần**: Xem lại cảnh báo lệch giá, log circuit breaker
- **Hàng tháng**: Phân tích hiệu năng, điều chỉnh trọng số
- **Hàng quý**: Rà soát, tối ưu toàn hệ thống

### Cập Nhật
- **Thêm oracle**: Theo quy trình quản trị
- **Điều chỉnh trọng số**: Dựa trên hiệu năng
- **Tối ưu tham số**: Điều chỉnh ngưỡng, timeout
- **Cập nhật khẩn cấp**: Xử lý sự cố nghiêm trọng

---

**Cập nhật lần cuối**: Tháng 7/2025  
**Phiên bản**: 1.0.0  
**Xem lại tiếp theo**: 8/2025