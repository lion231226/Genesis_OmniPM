# Slice1 设计评审报告

> **评审方式**: Orion 手动评审（run_experts 不可用，DEV-10）  
> **评审范围**: WaitlistService / CheckinService(重构) / AdminService / Web Admin 架构  

---

## 综合决议：🟢 通过（4 项 P1 需修正，0 项 P0）

---

## Architect（架构）评审

| # | 等级 | 发现 | 建议 |
|---|:----:|------|------|
| A1 | 🟢 | WaitlistService 独立模块 + BookingService 单点集成 — 耦合度最低方案 | 保留。后续Slice5转介绍也可复用同一AutoInvite模式 |
| A2 | 🟢 | CheckinService 异步→同步积分发放 — 正确修正。goroutine 方案无错误处理，积分丢失不可观测 | 保留。AwardPoints 本身有幂等保护，同步调用安全 |
| A3 | 🟡 P1 | 排队自动邀约Redis锁 `lock:waitlist_invite:{scheduleID}` — 锁超时30s足够，但**缺少Lua脚本原子化**"检查+标记"操作 | 使用 Lua 脚本：`GET waiting → UPDATE invited` 原子执行 |
| A4 | 🟡 P1 | Dashboard 多子查询SQL — 当前设计为5条独立子查询，每次请求5次索引扫描 | 合为1条 UNION ALL 查询或增加 Redis 缓存(TTL=30s) |
| A5 | 🟢 | X-Store-Id Header → Context 注入 — 符合 CDL 搜索到的 Go 多租户最佳实践 | 保留。需在中间件中校验 store_id 有效性 |
| A6 | 🟡 P2 | 会员详情360°视图 — 当前设计需5-7次独立DB查询 | 首次实现可接受。>100并发时加 Redis 缓存 |

---

## Security（安全）评审

| # | 等级 | 发现 | 建议 |
|---|:----:|------|------|
| S1 | 🔴 P1 | **Admin API 缺少角色校验**。当前 router.go 中 `authed` 组仅做 JWT 认证，未区分店长/前台/教练权限。admin_handler 的所有端点可被任意登录用户访问 | 新增 `RequireRole("admin","manager")` 中间件，admin 路由组独立 |
| S2 | 🔴 P1 | **门店越权风险**。X-Store-Id Header 从请求中提取后注入 Context，但未校验该用户是否属于该门店 | 中间件中查 `user_stores` 表校验成员关系 |
| S3 | 🟡 P2 | 签到 API 仅校验 booking_id+member_id，**未校验签到时间窗口**（如提前1小时签到/课程结束后补签） | 增加时间窗口校验：checkin_time 必须在 schedule.StartTime-30分钟 ~ EndTime+LateMaxMinutes 范围内 |
| S4 | 🟢 | 排队 DoS — 现有幂等键 `uq_member_schedule` 已保证同一会员同一课程只能排队一次 | 保留。可额外加每人同时最多排队 3 个课程的限制 |
| S5 | 🟢 | 积分防重放 — 现有 idempotency_key 模式完善 | 保留。AwardPoints 已有幂等检查 |

---

## Backend（后端实现）评审

| # | 等级 | 发现 | 建议 |
|---|:----:|------|------|
| B1 | 🔴 P1 | **Waitlist 排队位置计算** — 设计用 `COUNT(*) WHERE status='waiting'` 计算位置。READ COMMITTED 下两个并发 JOIN 可能得到相同 position | 改为 `SELECT COALESCE(MAX(position), 0) + 1 FROM waitlist_entries WHERE schedule_id=?` + UPDATE 使用行锁 |
| B2 | 🟡 P2 | Checkin 判定边界条件 — `lateMin <= LateGraceMinutes` vs `lateMin <= LateMaxMinutes` 区间闭合正确，但缺少对 `lateMin < 0`（提前签到）的处理 | 补充：`lateMin < -30` → 拒绝（太早），`-30 ≤ lateMin ≤ Grace` → on_time |
| B3 | 🟢 | Dashboard SQL — 需要复合索引 | 创建 `idx_store_date(store_id, DATE(booked_at/checkin_time/join_date))` |
| B4 | 🟢 | attendance ALTER — 新增字段含 DEFAULT，向后兼容 | 安全。建议先加列再部署代码（分两步） |
| B5 | 🟡 P2 | AutoInvite 通知发送 — 设计用 `go sendInviteNotification()` goroutine。如果 goroutine panic，通知静默丢失 | 使用 errgroup 或 channel + recover；或改为消息队列表模式 |

---

## 修正优先级

```
必须修正（阻塞 gate_1）：
  ✅ S1: Admin API 角色中间件
  ✅ S2: X-Store-Id 门店归属校验
  ✅ B1: Waitlist position 计算用 MAX(position)+1

建议修正（gate_1 不阻塞，开发阶段处理）：
  ⬜ A3: Redis Lua 脚本原子化
  ⬜ A4: Dashboard 缓存
  ⬜ B5: 通知 goroutine 加 recover
  ⬜ B2: 提前签到边界处理
  ⬜ S3: 签到时间窗口校验
```

---

> **结论**: 设计方案整体可行。3 项 P1 必须在 gate_1 前修正（已标注），其余可在实现阶段处理。
