# Slice1 代码评审报告

> **评审方式**: Orion 手动评审（run_experts DEV-10）  
> **评审范围**: 后端 8新+5改 / 前端 14新文件

---

## 综合决议：🟢 通过（0 P0，2 P2，2 已知 TODO）

---

## 后端评审

| # | 等级 | 检查项 | 结果 |
|---|:----:|--------|------|
| B1 | 🟢 | WaitlistService.AutoInvite — Redis锁+事务+原子UPDATE | ✅ `SetNX(lockKey,30s)` + `defer Del(lockKey)` |
| B2 | 🟢 | WaitlistService.Join — MAX(position)+1 避免COUNT竞态 | ✅ `COALESCE(MAX(position),0)+1` |
| B3 | 🟢 | CheckinService — 三级判定+StoreSettings | ✅ on_time/late/absent + 提前30分钟窗口校验 |
| B4 | 🟢 | CheckinService — 同步积分发放 | ✅ 事务外调 PointsService.AwardPoints(幂等) |
| B5 | 🟢 | BookingService.CancelBook — 事务+异步邀约 | ✅ `tx.Commit()` 后 `go AutoInvite()` |
| B6 | 🟢 | AdminService.DashboardSummary — 独立查询+索引友好 | ✅ 每列单独COUNT |
| B7 | 🟢 | Router — 4组路由(公开/认证/排队/Admin) | ✅ admin路由 RequireRole+StoreAccess 双重保护 |
| B8 | 🟢 | 签到API — 即时返回points_earned | ✅ 同步发放后赋值 |
| B9 | 🟢 | goroutine通知 — recover 保护 | ✅ `defer recover()` in sendInviteNotification |

| # | 等级 | 发现 | 建议 |
|---|:----:|------|------|
| B10 | P2 | AdminHandler.DashboardSummary 每次请求执行5次独立DB查询 | 可合并为1条UNION ALL或加Redis缓存(30s TTL) |
| B11 | P2 | WaitlistService.Respond 中 accept 路径手动 UPDATE booked_count | 应复用 BookingRepo.IncrementBookedCount |

---

## 安全评审

| # | 等级 | 检查项 | 结果 |
|---|:----:|--------|------|
| S1 | 🟢 | Admin API 角色中间件 | ✅ `RequireRole("admin","manager")` |
| S2 | 🟢 | 门店越权防护 | ✅ `StoreAccess()` 校验 JWT store_id vs X-Store-Id |
| S3 | 🟢 | 签到时间窗口 | ✅ 提前30分钟~课后LateMax分钟 |
| S4 | 🟢 | 等待队列 DoS | ✅ 幂等键 + 同课程只排一次 |
| S5 | 🟢 | 积分防重放 | ✅ PointsService.AwardPoints 幂等检查 |

---

## 前端评审

| # | 等级 | 检查项 | 结果 |
|---|:----:|--------|------|
| F1 | 🟢 | ProLayout 菜单+门店切换器 | ✅ 9菜单项+Select切换 |
| F2 | 🟢 | Dashboard 6卡片+实时+快速操作 | ✅ React Query 30s轮询 |
| F3 | 🟢 | 会员列表 ProTable | ✅ 分页+搜索+筛选+操作列 |
| F4 | 🟢 | API层 axios拦截器 | ✅ JWT+X-Store-Id自动注入 |
| F5 | 🟢 | 状态管理 Zustand | ✅ authStore 持久化token到localStorage |

---

## 已知 TODO（非阻塞）

| 位置 | 内容 | 计划 |
|------|------|------|
| waitlist_service.go:256 | 接入微信订阅消息API | Slice 3（AI触达引擎） |
| admin_handler.go:65 | 会员详情聚合(出勤/积分/消费/跟进) | Slice 2 增补 |

---

## 文件统计

```
后端新增 (8 files):   ~1,200 行
后端修改 (5 files):     ~150 行改动
前端新增 (14 files):    ~820 行
数据库变更:           2 新表 + 1 ALTER
API 端点:            +13 新端点

总计: ~2,170 行新增代码
```

---

> **结论**: 代码质量良好，设计评审中的 3 项 P1 已全部修正。2 项 P2 可在后续迭代优化。可交付。
