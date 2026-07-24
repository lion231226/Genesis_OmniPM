# 现有代码审计报告 — Slice 1 集成分析

> **审计日期**: 2026-07-23 | **审计范围**: project/backend (30文件) + project/miniprogram (48文件) + project/web-admin (脚手架)

---

## 一、总体评价：🟢 代码质量良好，结构清晰

| 维度 | 评分 | 说明 |
|------|:----:|------|
| 架构设计 | ⭐⭐⭐⭐ | DDD分层清晰 (model→repo→service→handler) |
| 代码规范 | ⭐⭐⭐⭐ | 标准Go风格，错误处理完善 |
| 并发安全 | ⭐⭐⭐⭐ | Redis锁+MySQL FOR UPDATE双重保护 |
| 数据安全 | ⭐⭐⭐⭐ | AES-256-GCM加密PII，JWT认证完备 |
| 测试覆盖 | ⭐⭐ | 缺少单元测试 |
| Slice1 就绪度 | ⭐⭐⭐ | 约课核心已有，排队/签到需增强 |

---

## 二、逐模块审计

### 2.1 Booking（约课）— 🟡 核心逻辑正确，排队需重构

**现有实现**：
```
BookCourse(): Redis座位锁 → MySQL事务 → FOR UPDATE → 满员入队
CancelBooking(): 软删除 → 释放座位 → stub通知排队者
enqueue(): Redis List排队 → 创建Booking(status=booked, source=queue)
```

**问题**：
| # | 严重度 | 问题 | SPEC对应 |
|---|:------:|------|----------|
| B-1 | P1 | 排队用 Redis List + Booking 表混合方案，无独立 waitlist 表。排队用户 status="booked" 与正式预约混淆 | 新增 waitlist_entries 表 |
| B-2 | P1 | `notifyNextInQueue()` 仅 LPOP 取 ID，无后续通知逻辑 | 完整排队邀约流程 |
| B-3 | P2 | 排队状态机缺失：无 invited/accepted/declined/expired 流转 | waitlist 状态机 |
| B-4 | P2 | `DecrementBookedCount` 在 `CancelBooking` 中调用两次（释放座位+递减计数）可能存在竞态 | 事务原子性 |

**集成方案**：保留 BookCourse 的 Redis 座位锁 + 事务机制，新增 WaitlistService 替代 enqueue()。

---

### 2.2 Checkin（签到）— 🟡 逻辑存在，判定规则需增强

**现有实现**：
```
Checkin(): 验证booking → 判断late(硬编码10分钟) → 创建attendance → 异步发积分
awardBasePoints(): goroutine异步发放 → 迟到不计分
```

**问题**：
| # | 严重度 | 问题 | SPEC对应 |
|---|:------:|------|----------|
| C-1 | P0 | `IsValid = (status != "late")` — 迟到应算有效课时(50%积分)，而非完全无效 | 签到判定算法 §4.1 |
| C-2 | P0 | 迟到阈值硬编码10分钟，应读 StoreSettings | late_grace_minutes/late_max_minutes |
| C-3 | P1 | `awardBasePoints` 异步 goroutine → 事务提交后异步写，失败无感知 | 同步+幂等重试 |
| C-4 | P2 | 缺少 absent/no_show 状态判定（课后未签到→自动标记） | 定时任务 |
| C-5 | P2 | PointsEarned 初始0，异步更新 — API响应中积分不准确 | 同步返回 |
| C-6 | P2 | 缺少 checkin_method/late_minutes/is_absent 字段 | attendances ALTER |

**集成方案**：改造 Checkin() 为同步判定+同步积分发放；新增 StoreSettings 读取。

---

### 2.3 Points（积分）— 🟢 设计优秀，少量扩展

**现有实现**：
```
RedeemPoints(): 幂等→类型校验→30%封顶→月200元封顶→FIFO批次扣减 ✓
AwardPoints(): 幂等→行锁→12个月有效期→创建记录 ✓
```

**问题**：
| # | 严重度 | 问题 |
|---|:------:|------|
| P-1 | P2 | 缺少周满勤/30天满勤/梯度奖励检查（但 SPEC 范围外，可后续） |
| P-2 | P2 | checkin→points 的 `generateIdempotencyKey` 用纳秒时间戳，应改用确定性 Key |

**集成方案**：最小改动——CheckinService 直接调用 `PointsService.AwardPoints()` 替代现有 `awardBasePoints`。

---

### 2.4 Web Admin（管理后台）— 🔴 脚手架，需从零构建

| 现状 | 需要 |
|------|------|
| React + Vite 脚手架 | ✅ 已有 |
| 路由/布局 | ❌ 需实现 ProLayout + 权限守卫 |
| Dashboard 页面 | ❌ 需从零实现 |
| 会员列表/详情 | ❌ 需从零实现 |
| API 对接层 | ❌ 需实现 axios + React Query |
| 后端 Admin API | ❌ 需新增 5 个端点 |

---

### 2.5 小程序 — 🟢 无需 Slice1 改动

现有7页面 (index/booking/booking-detail/checkin/messages/points/profile)。排队相关只需在 booking 页面增加"加入排队"按钮和排队状态展示——属于小程序端轻量增量。

---

## 三、集成风险矩阵

| 风险 | 等级 | 缓解 |
|------|:----:|------|
| booking → waitlist 重构破坏现有约课 | 🔴 | 新增 waitlist_service 独立模块，BookCourse 仅改 enqueue() 调用点 |
| 签到判定同步化影响性能 | 🟡 | 同步执行但限2次DB查询（schedule+member）→ <50ms |
| Web Admin 从零构建量大 | 🟡 | 优先 Dashboard+会员列表两个核心页面 |
| 异步积分改为同步可能阻塞 | 🟢 | 积分发放逻辑简单（INSERT+UPDATE），可控 |

---

## 四、推荐实施顺序

```
Phase 1: 后端基础（1-2h）
  1. 新增 waitlist model + repo + service
  2. 新增 store_settings model
  3. 修改 attendance model (+3列)
  4. 数据库迁移

Phase 2: 业务逻辑（2-3h）
  5. 增强 checkin_service（判定算法+同步积分）
  6. 改造 booking_service（cancel→waitlist联动）
  7. 实现 waitlist 自动邀约
  8. 新增 admin_service（Dashboard聚合）

Phase 3: API 层（1h）
  9. 新增 waitlist_handler (4端点)
  10. 新增 admin_handler (5端点)
  11. 更新 router.go

Phase 4: Web Admin 前端（3-4h）
  12. ProLayout + 路由 + 权限守卫
  13. Dashboard 页面
  14. 会员列表/详情页面
  15. API 对接层
```

---

> **结论**: 现有代码可作为扎实基座。改动集中在 service 层增强和 Web Admin 新建。预计总工作量约 8-10 小时开发。
