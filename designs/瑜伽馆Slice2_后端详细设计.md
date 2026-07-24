# 瑜伽馆 Slice2 积分引擎 — 后端详细设计

## 一、新增模型

### 1.1 PointRule（积分获取规则）

```go
// internal/model/point_rule.go
type PointRule struct {
    BaseModel
    RuleType      string `gorm:"column:rule_type;type:varchar(30);not null;uniqueIndex"`
    PointsPerUnit int    `gorm:"column:points_per_unit;not null;default:1"`
    DailyCap      int    `gorm:"column:daily_cap;default:0"`
    MonthlyCap    int    `gorm:"column:monthly_cap;default:0"`
    IsActive      bool   `gorm:"column:is_active;default:true"`
    Description   string `gorm:"column:description;type:varchar(200)"`
}
func (PointRule) TableName() string { return "point_rules" }
```

### 1.2 ExchangeItem（兑换商品）

```go
// internal/model/exchange_item.go
type ExchangeItem struct {
    BaseModel
    Name           string `gorm:"column:name;type:varchar(100);not null"`
    ItemType       string `gorm:"column:item_type;type:varchar(30);not null"`
    PointsRequired int    `gorm:"column:points_required;not null"`
    ValueCents     int64  `gorm:"column:value_cents;default:0"`
    Stock          int    `gorm:"column:stock;default:-1"`
    ImageURL       string `gorm:"column:image_url;type:varchar(500)"`
    ValidDays      int    `gorm:"column:valid_days;default:30"`
    IsActive       bool   `gorm:"column:is_active;default:true"`
    SortOrder      int    `gorm:"column:sort_order;default:0"`
}
func (ExchangeItem) TableName() string { return "exchange_items" }
```

### 1.3 ExchangeRecord（兑换记录）

```go
// internal/model/exchange_record.go
type ExchangeRecord struct {
    BaseModel
    MemberID         uint   `gorm:"column:member_id;index;not null"`
    ItemID           uint   `gorm:"column:item_id;not null"`
    PointsSpent      int    `gorm:"column:points_spent;not null"`
    CouponInstanceID uint   `gorm:"column:coupon_instance_id"`
    IdempotencyKey   string `gorm:"column:idempotency_key;type:char(36);uniqueIndex"`
}
func (ExchangeRecord) TableName() string { return "exchange_records" }
```

## 二、新增 Repository 方法

在现有 `repository/points_repo.go` 中添加：

| 方法 | 说明 |
|------|------|
| `FindActiveRules() ([]PointRule, error)` | 查询所有启用的积分规则 |
| `FindExchangeItems(itemType string) ([]ExchangeItem, error)` | 按类型查询可兑换商品 |
| `FindExchangeItemByID(id uint) (*ExchangeItem, error)` | 单商品查询 |
| `CreateExchangeRecord(tx, *ExchangeRecord) error` | 创建兑换记录 |
| `DecrementExchangeStock(tx, itemID uint) error` | 减库存 |
| `FindExpiringPoints(limit int) ([]PointRecord, error)` | 查询待过期积分 |
| `GetMonthEarnTotal(memberID uint) (int64, error)` | 月度获取总计 |

## 三、新增 Service 方法

### 3.1 PointsService 扩展

```go
// GetRules 获取积分规则
func (s *PointsService) GetRules() ([]model.PointRule, error)

// GetExchangeItems 获取兑换商品列表
func (s *PointsService) GetExchangeItems(itemType string) ([]model.ExchangeItem, error)

// ExchangeItem 兑换商品（幂等）
func (s *PointsService) ExchangeItem(memberID uint, itemID uint, idempotencyKey string) (*model.CouponInstance, error)
// 流程: 幂等检查 → 查商品 → 扣库存 → 扣积分 → 创建优惠券 → 写兑换记录

// AwardWithRules 基于规则发放积分（自动触发用）
// 规则引擎: 查point_rules → 检查日/月上限 → AwardPoints
func (s *PointsService) AwardWithRules(memberID uint, ruleType string, refID uint) error
```

### 3.2 TierService（新文件）

```go
// internal/service/tier_service.go
type TierService struct { ... }

// CheckAndUpgrade 检查并升级会员等级
func (s *TierService) CheckAndUpgrade(memberID uint) (oldTier, newTier string, changed bool, err error)
// 阈值: silver(默认) → gold(>=10000累计) → platinum(>=50000累计)

// GetTierBenefits 获取等级权益
func (s *TierService) GetTierBenefits(tier string) []string
// silver: 基础权益
// gold: +5%积分加成, 优先约课
// platinum: +10%积分加成, 免费取消, 专属客服
```

### 3.3 ExpirationService（定时任务）

```go
// internal/service/expiration_service.go
func (s *ExpirationService) RunExpiration() error
// 单次执行: 查询过期积分 → 逐条标记 → 更新会员余额
// 限制: 每次≤1000条

func StartExpirationCron(ctx context.Context, interval time.Duration)
// 在 main.go 中启动: go StartExpirationCron(ctx, 24*time.Hour)
```

## 四、Handler 修改

### 4.1 points_handler.go 扩展

现有3个端点保持，新增4个：

```go
// GET /api/v1/points/rules — 积分规则列表
func (h *PointsHandler) GetRules(c *gin.Context)

// GET /api/v1/points/exchange-items — 兑换商品列表
func (h *PointsHandler) GetExchangeItems(c *gin.Context)

// POST /api/v1/points/exchange — 兑换商品
func (h *PointsHandler) ExchangeItem(c *gin.Context)

// GET /api/v1/points/tier — 会员等级+权益
func (h *PointsHandler) GetTier(c *gin.Context)
```

### 4.2 router.go 新增路由

```go
pointsGroup := authed.Group("/points")
{
    pointsGroup.GET("", pointsH.GetMyPoints)
    pointsGroup.GET("/history", pointsH.GetPointsHistory)
    pointsGroup.POST("/redeem", pointsH.RedeemPoints)        // 已有
    pointsGroup.GET("/rules", pointsH.GetRules)               // NEW
    pointsGroup.GET("/exchange-items", pointsH.GetExchangeItems) // NEW
    pointsGroup.POST("/exchange", pointsH.ExchangeItem)       // NEW
    pointsGroup.GET("/tier", pointsH.GetTier)                 // NEW
}
```

## 五、自动触发集成点

在以下3个 handler 的现有成功分支中，增加一行：

```go
// booking_handler.go: BookCourse 成功后
go pointsSvc.AwardWithRules(memberID, "course_booking", bookingID)

// checkin_handler.go: Checkin 成功后
go pointsSvc.AwardWithRules(memberID, "checkin", 0)

// auth_handler.go: Register 成功后
go pointsSvc.AwardWithRules(member.ID, "new_member", 0)
```

使用 `go` 异步调用，不阻塞主流程。失败写入 Redis 重试队列（`points:retry_queue` LPUSH），定时任务补偿重试。

## 六、main.go 修改

```go
// 启动积分过期定时任务
ctx, cancel := context.WithCancel(context.Background())
defer cancel()
go service.StartExpirationCron(ctx, 24*time.Hour)
```

## 七、迁移 SQL

```sql
-- migrations/002_points_engine.sql
CREATE TABLE point_rules (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rule_type VARCHAR(30) NOT NULL UNIQUE,
    points_per_unit INT NOT NULL DEFAULT 1,
    daily_cap INT DEFAULT 0,
    monthly_cap INT DEFAULT 0,
    is_active TINYINT(1) DEFAULT 1,
    description VARCHAR(200),
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE exchange_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    item_type VARCHAR(30) NOT NULL,
    points_required INT NOT NULL,
    value_cents BIGINT DEFAULT 0,
    stock INT DEFAULT -1,
    image_url VARCHAR(500),
    valid_days INT DEFAULT 30,
    is_active TINYINT(1) DEFAULT 1,
    sort_order INT DEFAULT 0,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    updated_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);

CREATE TABLE exchange_records (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT UNSIGNED NOT NULL,
    item_id BIGINT UNSIGNED NOT NULL,
    points_spent INT NOT NULL,
    coupon_instance_id BIGINT UNSIGNED,
    idempotency_key CHAR(36) UNIQUE,
    created_at DATETIME(3) DEFAULT CURRENT_TIMESTAMP(3),
    INDEX idx_member_id (member_id)
);

-- 种子数据: 默认积分规则
INSERT INTO point_rules (rule_type, points_per_unit, description) VALUES
('course_booking', 10, '每次约课获得10积分'),
('checkin', 5, '每日签到获得5积分'),
('new_member', 100, '新会员注册奖励100积分');

-- 种子数据: 默认兑换商品
INSERT INTO exchange_items (name, item_type, points_required, value_cents, stock) VALUES
('团课体验券', 'course_coupon', 500, 5000, 100),
('私教体验券', 'course_coupon', 1000, 10000, 50),
('5元代金券', 'discount_coupon', 300, 500, -1),
('10元代金券', 'discount_coupon', 500, 1000, -1);
```
