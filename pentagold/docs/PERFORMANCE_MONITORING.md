# Thiết Lập Giám Sát Hiệu Năng

## Tổng Quan

Hệ thống giám sát hiệu năng toàn diện cho triển khai testnet TetraGold, bao gồm thu thập chỉ số thời gian thực, ngưỡng cảnh báo và dashboard trực quan.

## Kiến Trúc Giám Sát

### Thu Thập Chỉ Số Cốt Lõi
- **Blockchain**: Thời gian block, giá gas, thông lượng giao dịch
- **Ứng dụng**: Thời gian phản hồi, tỷ lệ lỗi, tương tác người dùng
- **Oracle**: Độ trễ nguồn giá, cảnh báo lệch, điểm tin cậy
- **Bảo mật**: Kích hoạt circuit breaker, sự kiện khẩn cấp, vi phạm truy cập

### Công Nghệ Sử Dụng
- **Thu thập chỉ số**: Prometheus + collector tùy chỉnh
- **Trực quan hóa**: Dashboard Grafana
- **Cảnh báo**: PagerDuty + Slack
- **Tổng hợp log**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **APM**: Sentry theo dõi lỗi, hiệu năng

## Chỉ Số Thời Gian Thực

### Hiệu Năng Blockchain
```yaml
# Giám sát thời gian block
block_time_seconds:
  description: "Thời gian block trung bình trên Sepolia"
  target: 12-15 giây
  alert_threshold: >20 giây
  collection_interval: 30s

# Theo dõi giá gas
gas_price_gwei:
  description: "Giá gas hiện tại (gwei)"
  target: 10-30 gwei
  alert_threshold: >100 gwei
  collection_interval: 60s

# Thông lượng giao dịch
transactions_per_second:
  description: "Tốc độ giao dịch mạng"
  target: 10-15 TPS
  alert_threshold: <5 TPS
  collection_interval: 60s
```

### Hiệu Năng Ứng Dụng
```yaml
# Thời gian phản hồi API
api_response_time_ms:
  description: "Thời gian phản hồi endpoint API"
  targets:
    price_feed: <500ms
    trade_execution: <2000ms
    balance_query: <300ms
  alert_thresholds:
    price_feed: >1000ms
    trade_execution: >5000ms
    balance_query: >1000ms

# Theo dõi tỷ lệ lỗi
error_rate_percentage:
  description: "Tỷ lệ lỗi ứng dụng"
  target: <1%
  alert_threshold: >5%
  collection_interval: 60s

# Chỉ số trải nghiệm người dùng
page_load_time_ms:
  description: "Thời gian tải trang frontend"
  target: <2000ms
  alert_threshold: >5000ms
  collection_interval: 30s
```

### Chỉ Số Oracle
```yaml
# Độ trễ cập nhật giá
oracle_update_latency_seconds:
  description: "Thời gian giữa các lần cập nhật oracle"
  target: 300s (5 phút)
  alert_threshold: >600s (10 phút)
  collection_interval: 60s

# Theo dõi lệch giá
price_deviation_percentage:
  description: "Lệch giá giữa các nguồn oracle"
  target: <1%
  alert_threshold: >3%
  collection_interval: 30s

# Tình trạng oracle
oracle_availability_percentage:
  description: "Tỷ lệ uptime oracle"
  target: >99%
  alert_threshold: <95%
  collection_interval: 60s
```

### Chỉ Số Bảo Mật
```yaml
# Sự kiện circuit breaker
circuit_breaker_triggers:
  description: "Số lần kích hoạt circuit breaker"
  target: 0/ngày
  alert_threshold: >2/ngày
  collection_interval: 300s

# Sự kiện khẩn cấp
emergency_pause_events:
  description: "Số lần dừng khẩn cấp"
  target: 0
  alert_threshold: >0
  collection_interval: ngay lập tức

# Vi phạm truy cập
unauthorized_access_attempts:
  description: "Số lần truy cập trái phép"
  target: <10/giờ
  alert_threshold: >50/giờ
  collection_interval: 300s
```

## Cấu Hình Cảnh Báo

### Cảnh Báo Nghiêm Trọng (Xử lý ngay)
- **Hệ thống ngừng hoạt động**: Ứng dụng không truy cập được
- **Bảo mật bị xâm phạm**: Phát hiện truy cập trái phép
- **Circuit breaker**: Kích hoạt bảo vệ giá
- **Oracle lỗi**: Mọi nguồn giá đều ngừng
- **Dừng khẩn cấp**: Kích hoạt hệ thống khẩn

### Cảnh Báo Cao (Xử lý 15 phút)
- **Giảm hiệu năng lớn**: Chậm >50%
- **Tỷ lệ lỗi cao**: >5% giao dịch lỗi
- **Giá gas tăng mạnh**: >100 gwei kéo dài
- **Lệch giá oracle**: >5%
- **Nghẽn mạng**: <5 TPS kéo dài

### Cảnh Báo Trung Bình (Xử lý 1h)
- **Hiệu năng trung bình**: Chậm 20-50%
- **Tỷ lệ lỗi vừa**: 2-5%
- **Oracle chậm**: >10 phút không cập nhật
- **Gas cao**: Tiêu thụ bất thường
- **Trải nghiệm người dùng**: Tải trang >5s

### Cảnh Báo Thấp (Xem hàng ngày)
- **Hiệu năng nhẹ**: Chậm <20%
- **Tỷ lệ lỗi thấp**: 1-2%
- **Nhắc bảo trì**: Nhiệm vụ định kỳ
- **Kế hoạch mở rộng**: Theo dõi tài nguyên
- **Phản hồi người dùng**: Vấn đề không nghiêm trọng

## Cấu Hình Dashboard

### Dashboard Điều Hành
- **Sức khỏe hệ thống**: Tổng quan trạng thái
- **Chỉ số chính**: Giá, volume, user, giao dịch
- **Tóm tắt cảnh báo**: Vấn đề hiện tại
- **Hiệu năng tổng thể**: Thời gian phản hồi, uptime
- **Bảo mật**: Trạng thái circuit breaker, khẩn cấp

### Dashboard Kỹ Thuật
- **Blockchain**: Thời gian block, giá gas, trạng thái mạng
- **Hiệu năng ứng dụng**: Thời gian phản hồi, lỗi, throughput
- **Sức khỏe oracle**: Nguồn giá, lệch, điểm tin cậy
- **Hạ tầng**: Tài nguyên server, DB
- **Sự kiện bảo mật**: Log truy cập, bất thường

### Dashboard Kinh Doanh
- **Volume giao dịch**: Theo ngày/tuần/tháng
- **Hoạt động user**: User active, đăng ký mới, giữ chân
- **Doanh thu**: Phí thu, giá trị giao dịch
- **Dữ liệu thị trường**: Giá, biến động, so sánh
- **Chỉ số tăng trưởng**: Tỷ lệ dùng, tính năng

## Script Giám Sát Tự Động

### Script Kiểm Tra Sức Khỏe
```javascript
// health-check.js
const { ethers } = require('ethers');
const { TESTNET_CONFIG } = require('./config/testnet');

class HealthChecker {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(TESTNET_CONFIG.RPC_URL);
    this.metrics = {};
  }

  async checkBlockchainHealth() {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const block = await this.provider.getBlock(blockNumber);
      const gasPrice = await this.provider.getGasPrice();

      this.metrics.blockchain = {
        blockNumber,
        blockTime: block.timestamp,
        gasPrice: ethers.utils.formatUnits(gasPrice, 'gwei'),
        status: 'healthy'
      };
    } catch (error) {
      this.metrics.blockchain = {
        status: 'error',
        error: error.message
      };
    }
  }

  async checkContractHealth() {
    try {
      const tgaux = new ethers.Contract(
        TESTNET_CONFIG.CONTRACTS.TGAUX,
        ['function version() view returns (string)'],
        this.provider
      );

      const version = await tgaux.version();
      
      this.metrics.contracts = {
        tgaux: { status: 'healthy', version },
        status: 'healthy'
      };
    } catch (error) {
      this.metrics.contracts = {
        status: 'error',
        error: error.message
      };
    }
  }

  async checkOracleHealth() {
    try {
      const oracle = new ethers.Contract(
        TESTNET_CONFIG.CONTRACTS.ORACLE_AGGREGATOR,
        ['function getLatestPrice() view returns (uint256, uint256)'],
        this.provider
      );

      const [price, timestamp] = await oracle.getLatestPrice();
      const age = Date.now() / 1000 - timestamp.toNumber();

      this.metrics.oracle = {
        price: ethers.utils.formatEther(price),
        timestamp: timestamp.toNumber(),
        age,
        status: age < 600 ? 'healthy' : 'stale'
      };
    } catch (error) {
      this.metrics.oracle = {
        status: 'error',
        error: error.message
      };
    }
  }

  async runHealthCheck() {
    await Promise.all([
      this.checkBlockchainHealth(),
      this.checkContractHealth(),
      this.checkOracleHealth()
    ]);

    const overallStatus = Object.values(this.metrics)
      .every(metric => metric.status === 'healthy') ? 'healthy' : 'degraded';

    return {
      timestamp: new Date().toISOString(),
      status: overallStatus,
      metrics: this.metrics
    };
  }
}

module.exports = HealthChecker;
```

### Script Theo Dõi Hiệu Năng
```javascript
// performance-monitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startTime = Date.now();
  }

  startTimer(operation) {
    this.metrics.set(operation, Date.now());
  }

  endTimer(operation) {
    const startTime = this.metrics.get(operation);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.metrics.delete(operation);
      return duration;
    }
    return null;
  }

  async measureOperation(operation, fn) {
    this.startTimer(operation);
    try {
      const result = await fn();
      const duration = this.endTimer(operation);
      
      // Log performance metric
      console.log(`${operation}: ${duration}ms`);
      
      // Send to monitoring system
      this.sendMetric(operation, duration);
      
      return result;
    } catch (error) {
      this.endTimer(operation);
      throw error;
    }
  }

  sendMetric(operation, duration) {
    // Tích hợp với hệ thống giám sát
    const metric = {
      name: `operation_duration_ms`,
      value: duration,
      tags: { operation },
      timestamp: Date.now()
    };
    
    // Gửi về collector
    this.postMetric(metric);
  }

  async postMetric(metric) {
    // Tùy hệ thống giám sát
    try {
      await fetch('/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      });
    } catch (error) {
      console.warn('Gửi chỉ số thất bại:', error);
    }
  }
}

module.exports = PerformanceMonitor;
```

## Điểm Tích Hợp

### Frontend
```typescript
// monitoring.ts
export class FrontendMonitoring {
  private performanceObserver: PerformanceObserver;
  
  constructor() {
    this.setupPerformanceMonitoring();
    this.setupErrorTracking();
    this.setupUserAnalytics();
  }

  setupPerformanceMonitoring() {
    // Theo dõi Web Vitals
    this.performanceObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.sendPerformanceMetric(entry);
      }
    });

    this.performanceObserver.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint'] });
  }

  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.sendErrorMetric({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
  }

  trackUserInteraction(action: string, data?: any) {
    this.sendUserMetric({
      action,
      data,
      timestamp: Date.now(),
      url: window.location.href
    });
  }

  private sendPerformanceMetric(entry: PerformanceEntry) {
    // Gửi về dịch vụ analytics
  }

  private sendErrorMetric(error: any) {
    // Gửi về dịch vụ theo dõi lỗi
  }

  private sendUserMetric(interaction: any) {
    // Gửi về dịch vụ analytics
  }
}
```

### Backend
```javascript
// monitoring-middleware.js
const prometheus = require('prom-client');

// Tạo chỉ số
const httpRequestDuration = new prometheus.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Thời gian xử lý HTTP (giây)',
  labelNames: ['method', 'route', 'status_code']
});

const httpRequestTotal = new prometheus.Counter({
  name: 'http_requests_total',
  help: 'Tổng số HTTP request',
  labelNames: ['method', 'route', 'status_code']
});

function monitoringMiddleware(req, res, next) {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route?.path || req.path;
    
    httpRequestDuration
      .labels(req.method, route, res.statusCode)
      .observe(duration);
    
    httpRequestTotal
      .labels(req.method, route, res.statusCode)
      .inc();
  });
  
  next();
}

module.exports = monitoringMiddleware;
```

## Ứng Phó Sự Cố

### Ma Trận Leo Thang
1. **Cấp 1**: Cảnh báo tự động, tự phục hồi
2. **Cấp 2**: Báo kỹ sư trực ca
3. **Cấp 3**: Trưởng nhóm, bảo mật
4. **Cấp 4**: Ban điều hành, hỗ trợ ngoài

### Quy Trình Xử Lý
- **Ngay lập tức**: Xác nhận cảnh báo trong 5 phút
- **Đánh giá**: Xác định mức độ trong 15 phút
- **Giao tiếp**: Cập nhật stakeholder trong 30 phút
- **Khắc phục**: Sửa lỗi hoặc workaround
- **Hậu kiểm**: Ghi nhận bài học

## Bảo Trì & Cập Nhật

### Hàng Ngày
- [ ] Xem lại cảnh báo, chỉ số qua đêm
- [ ] Kiểm tra dashboard sức khỏe hệ thống
- [ ] Xác thực nguồn giá oracle
- [ ] Theo dõi phản hồi, lỗi user
- [ ] Cập nhật baseline hiệu năng

### Hàng Tuần
- [ ] Phân tích xu hướng hiệu năng
- [ ] Điều chỉnh ngưỡng cảnh báo
- [ ] Cập nhật tài liệu giám sát
- [ ] Đánh giá mở rộng tài nguyên
- [ ] Rà soát chỉ số bảo mật

### Hàng Tháng
- [ ] Rà soát toàn hệ thống
- [ ] Cập nhật hệ thống giám sát
- [ ] Tối ưu hiệu năng
- [ ] Kiểm thử phục hồi thảm họa
- [ ] Báo cáo stakeholder

---

**Trưởng nhóm giám sát**: [Tên]  
**DevOps**: [Tên]  
**Bảo mật**: [Tên]  
**Lịch trực**: [Lịch]

**Cập nhật lần cuối**: Tháng 7/2025  
**Xem lại tiếp theo**: Hàng tuần trong beta