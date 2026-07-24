# 瑜伽馆 Slice2 积分引擎 — 技术规格说明书

> **CDL 状态**：🟢 full — 零新增外部依赖，全部基于 Go 标准库 + GORM + Redis

## 1. 数据库 Schema（新增3表）

### point_rules（积分获取规则）

| 字段 | 类型 | 约束 | 说明 |
|------|------|------|------|
| id | uint | PK | |
| rule_type | varchar(30) | NOT NULL | course_booking/checkin/new_member/referral |
| points_per_unit | int | NOT NULL | 每次/每元获得的积分数 |
| daily_cap | int | DEFAULT 0 | 每日获取上限(0=不限制) |
| monthly_cap | int | DEFAULT 0 | 每月获取上限 |
| is_active | bool | DEFAULT true | 是否启用 |
| description | varchar(200) | | 规则说明 |
| created_at/updated_at | timestamp | | |

### exchange_items（兑换商品）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uint | PK |
| name | varchar(100) | 商品名称 |
| item_type | varchar(30) | course_coupon/discount_coupon/goods |
| points_required | int | 所需积分 |
| value_cents | int | 面值(分) |
| stock | int | 库存(-1=无限) |
| image_url | varchar(500) | 商品图片 |
| valid_days | int | 有效期(天) |
| is_active | bool | |
| sort_order | int | 排序权重 |

### exchange_records（兑换记录）

| 字段 | 类型 | 说明 |
|------|------|------|
| id | uint | PK |
| member_id | uint | INDEX |
| item_id | uint | 兑换商品ID |
| points_spent | int | 消耗积分 |
| coupon_instance_id | uint | 生成的优惠券ID |
| idempotency_key | char(36) | UNIQUE |
| created_at | timestamp | |

## 2. API 契约（新增/修改端点）

### 新增端点

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | `/points/rules` | 获取积分获取规则列表 | JWT |
| GET | `/points/exchange-items` | 获取可兑换商品列表 | JWT |
| POST | `/points/exchange` | 兑换商品（幂等） | JWT |
| GET | `/points/tier` | 获取当前会员等级+权益 | JWT |

### 修改端点

| 方法 | 路径 | 变更 |
|------|------|------|
| POST | `/bookings/:id/book` | 预约成功后自动触发 AwardPoints |
| POST | `/checkin` | 签到成功后自动触发 AwardPoints |
| POST | `/auth/register` | 新会员注册奖励触发 AwardPoints |

### 请求/响应示例

```
POST /points/exchange
Body: { "item_id": 1, "idempotency_key": "..." }
Response: { "code": 0, "data": { "coupon_id": 42, "points_spent": 500, "balance": 3500 } }

GET /points/exchange-items?type=course_coupon
Response: { "code": 0, "data": [ { "id": 1, "name": "团课体验券", "points_required": 500, "stock": 100 } ] }
```

## 3. 核心算法

### 积分自动过期（定时任务）

```
算法: ExpirePointsCron
触发: 每天 03:00 UTC
1. SELECT * FROM point_records WHERE expires_at < NOW() AND is_redeemed = false AND amount > 0
2. 逐条标记: UPDATE SET is_redeemed = true, redeemed_amount = amount
3. 更新 member.available_points -= amount（事务内）
4. 写入过期流水记录（type="expired"）
5. 限制: 单次处理 ≤ 1000条
```

### 会员等级自动升级

```
算法: CheckAndUpgradeTier
触发: 每次 AwardPoints 后
1. 查询 member.total_earned_points
2. 匹配规则:
   < 10000 → silver
   ≥ 10000 → gold
   ≥ 50000 → diamond
3. 如等级变化 → 写入 member_tier_log + 更新 member.tier 字段
```

## 4. 技术栈锁定

| 层 | 选型 | 版本 | 原因 |
|----|------|------|------|
| 后端 | Go + Gin + GORM | 现有 | 项目已使用 |
| 缓存 | Redis | 现有 | 幂等键去重 |
| 数据库 | MySQL | 现有 | 事务保护 |
| 定时任务 | Go ticker + goroutine | 标准库 | 零依赖 |
| 前端 | 微信小程序原生 | 现有 | 项目已使用 |

## 5. 文件变更清单

| 文件 | 操作 | 行数 |
|------|------|------|
| `model/point_rule.go` | 新增 | ~30 |
| `model/exchange_item.go` | 新增 | ~40 |
| `model/exchange_record.go` | 新增 | ~25 |
| `repository/points_repo.go` | 修改 | +80 |
| `service/points_service.go` | 修改 | +120 |
| `service/tier_service.go` | 新增 | ~60 |
| `handler/points_handler.go` | 修改 | +80 |
| `handler/router.go` | 修改 | +5 |
| `cmd/server/main.go` | 修改 | +10 |
| `migrations/002_points_engine.sql` | 新增 | ~50 |
| **后端合计** | | **~500行** |
| `miniprogram/pages/points/` | 新增 | ~200 |
| `miniprogram/pages/exchange/` | 新增 | ~250 |
| **前端合计** | | **~450行** |

## 6. CDL 能力采纳清单

| 来源 | 名称 | 可用性 | Q-Score | 采纳建议 |
|------|------|--------|---------|----------|
| Go stdlib | `time.Ticker` 定时任务 | ✅ 内置 | 95 | ✅ 积分过期 |
| Go stdlib | `database/sql` 事务 | ✅ 内置 | 95 | ✅ 已在使用 |
| GORM | `Clauses(clause.Locking{Strength:"UPDATE"})` | ✅ 已集成 | 90 | ✅ 行级锁 |
| Redis | `SETNX` 幂等键 | ✅ 已集成 | 90 | ✅ 已在使用 |
| 微信小程序 | `wx.navigateTo` 页面路由 | ✅ 原生 | 95 | ✅ 前端导航 |
