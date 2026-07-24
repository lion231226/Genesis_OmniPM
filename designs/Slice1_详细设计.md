# Slice 1 详细设计 — 排队 + 签到增强 + Web 管理后台

> 基于 [SPEC](./瑜伽馆数字AI化运营系统_SPEC.md) + [审计报告](./代码审计报告_Slice1.md)

---

## 1. 服务集成架构

```
                     ┌──────────────────┐
                     │   Router (Gin)    │
                     └────────┬─────────┘
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ Waitlist   │  │ Checkin    │  │ Admin      │
     │ Handler    │  │ Handler    │  │ Handler    │
     │ (新增4端点) │  │ (修改)      │  │ (新增5端点) │
     └─────┬──────┘  └─────┬──────┘  └─────┬──────┘
           ▼               ▼               ▼
     ┌────────────┐  ┌────────────┐  ┌────────────┐
     │ Waitlist   │  │ Checkin    │  │ Admin      │
     │ Service    │  │ Service    │  │ Service    │
     │ (新增)      │  │ (重构)      │  │ (新增)      │
     └──┬──┬──┬──┘  └──┬────┬────┘  └──────┬─────┘
        │  │  │        │    │              │
        │  │  │   ┌────┘    └────┐         │
        ▼  ▼  ▼   ▼            ▼         ▼
     ┌──────────┐ ┌──────────┐ ┌──────────────┐
     │ Waitlist │ │ Points   │ │ Booking/Member│
     │ Repo     │ │ Service  │ │ Repo          │
     │ (新增)    │ │ (借用)    │ │ (复用)        │
     └──────────┘ └──────────┘ └──────────────┘
              │
              ▼
     ┌──────────────────┐
     │  Booking Service  │ ← CancelBooking 触发邀约
     │  (修改1行)         │
     └──────────────────┘
```

**关键集成点**：
- **BookingService → WaitlistService**：`CancelBooking()` 最后调用 `WaitlistService.AutoInvite(scheduleID, "auto_cancel")`
- **CheckinService → PointsService**：直接调用 `PointsService.AwardPoints()` 替代现有 `awardBasePoints`
- **CheckinService → StoreSettings**：读取 `LateGraceMinutes` / `LateMaxMinutes`

---

## 2. WaitlistService 设计

```go
type WaitlistService struct {
    repo        *repository.WaitlistRepo
    bookingRepo *repository.BookingRepo
    scheduleRepo *repository.ScheduleRepo  // 查询排期信息
    redis       *redis.Client
}

// Join 加入排队
// 1. 检查排期是否存在且满员
// 2. 幂等检查（同一会员同一排期只能排队一次）
// 3. 计算位置 = 当前 waiting 数量 + 1
// 4. INSERT waitlist_entries
func (s *WaitlistService) Join(memberID, scheduleID uint, idempotencyKey string) (*model.WaitlistEntry, error)

// Cancel 用户主动取消排队
func (s *WaitlistService) Cancel(entryID, memberID uint) error

// AutoInvite 自动邀约（booking取消/人数不足触发）
// 1. Redis分布式锁 lock:waitlist_invite:{scheduleID}
// 2. 查第一个 status=waiting 的记录
// 3. UPDATE status='invited', invited_at=now, invited_by=trigger
// 4. 异步推送微信通知
// 5. 设置2小时过期定时器
func (s *WaitlistService) AutoInvite(scheduleID uint, trigger string) error

// Respond 用户响应邀约
// accept → 调用 BookingService.BookCourse() 生成正式预约
// decline → 标记 declined → AutoInvite 下一位
func (s *WaitlistService) Respond(entryID, memberID uint, action string) (*model.Booking, error)
```

---

## 3. CheckinService 重构

### 改动前 vs 改动后

| 方面 | 改动前 | 改动后 |
|------|--------|--------|
| 迟到判定 | 硬编码10分钟 | 读 StoreSettings.LateGraceMinutes |
| 缺席判定 | 无 | > LateMaxMinutes → absent |
| 积分发放 | 异步 goroutine | **同步**调 PointsService.AwardPoints |
| 有效课时 | late=无效 | late=有效(50%积分), absent=无效 |
| 积分字段 | PointsEarned=0(异步) | PointsEarned=即时返回 |
| 新字段 | 无 | checkin_method, late_minutes, is_absent |

### 核心算法（伪代码）

```go
func (s *CheckinService) Checkin(bookingID, memberID uint, checkinTime time.Time, method string) (*model.Attendance, error) {
    // 1. 事务开始
    tx := db.Begin()
    
    // 2. 查 booking + schedule
    booking := findBooking(tx, bookingID, memberID) // status=booked
    schedule := findSchedule(tx, booking.CourseScheduleID)
    
    // 3. 读门店配置
    settings := getStoreSettings(booking.StoreID)
    
    // 4. 判定签到状态
    diff := checkinTime.Sub(schedule.StartTime)
    lateMin := int(diff.Minutes())
    
    switch {
    case lateMin <= settings.LateGraceMinutes:
        status, isValid, multiplier = "on_time", true, 1.0
    case lateMin <= settings.LateMaxMinutes:
        status, isValid, multiplier = "late", true, 0.5
    default:
        status, isValid, multiplier = "absent", false, 0.0
    }
    
    // 5. 创建 attendance
    attendance := createAttendance(...)
    booking.Status = "checked_in"
    
    // 6. 提交事务
    tx.Commit()
    
    // 7. 同步发放积分（事务外，幂等）
    if isValid {
        points := int(float64(course.BasePoints) * multiplier)
        pointsSvc.AwardPoints(memberID, points, "course_checkin", 
            "attendance", attendance.ID, idempotencyKey)
        attendance.PointsEarned = points
    }
    
    return attendance
}
```

---

## 4. AdminService 设计

```go
type AdminService struct {
    memberRepo   *repository.MemberRepo
    bookingRepo  *repository.BookingRepo
    scheduleRepo *repository.ScheduleRepo
    pointsRepo   *repository.PointsRepo
}

// GetDashboardSummary 聚合看板数据
func (s *AdminService) GetDashboardSummary(storeID uint, date time.Time) *DashboardSummary

// GetRealtimeSessions 实时课程状态
func (s *AdminService) GetRealtimeSessions(storeID uint) []RealtimeSession

// ListMembers 会员列表（支持筛选/分页/风险标记）
func (s *AdminService) ListMembers(storeID uint, query MemberQuery) (*MemberListResult, error)

// GetMemberDetail 会员360°视图
func (s *AdminService) GetMemberDetail(memberID, storeID uint) (*MemberDetail, error)
```

### Dashboard 数据聚合 SQL

```sql
-- 今日概览（单次查询）
SELECT
  (SELECT COUNT(*) FROM bookings WHERE store_id=? AND DATE(booked_at)=?) as today_bookings,
  (SELECT COUNT(*) FROM attendances WHERE store_id=? AND DATE(checkin_time)=?) as today_checkins,
  (SELECT COUNT(*) FROM members WHERE store_id=? AND DATE(join_date)=?) as today_new_members,
  (SELECT COUNT(*) FROM waitlist_entries WHERE store_id=? AND status='waiting') as waiting_count,
  (SELECT COUNT(*) FROM member_cards WHERE store_id=? AND end_date BETWEEN ? AND ?) as expiring_cards;
```

---

## 5. Web Admin 组件 → API 映射

```
Dashboard/
├── StatCards          ← GET /admin/dashboard/summary (加载时)
├── RealtimeSessions   ← GET /admin/dashboard/realtime (轮询 5s)
├── PendingTasks       ← 内嵌于 summary.tasks
└── QuickActions       ← 纯前端路由

Members/List.tsx
  ← GET /admin/members?page=&keyword=&tier=&risk=
  → ProTable 自动分页 + 搜索防抖 300ms

Members/Detail.tsx (路由 /members/:id)
  ← GET /admin/members/:id
  → AttendanceHeatmap 用 @ant-design/charts 热力图
  → FollowUpTimeline 用 Ant Design Timeline
```

### 状态管理

```typescript
// stores/authStore.ts (Zustand)
interface AuthStore {
  user: User | null;
  currentStore: Store | null;  // 当前选中门店
  stores: Store[];              // 用户有权限的门店列表
  setCurrentStore: (store: Store) => void;
}

// services/api.ts
const api = axios.create({ baseURL: '/api/v1' });
api.interceptors.request.use(config => {
  const store = useAuthStore.getState().currentStore;
  if (store) config.headers['X-Store-Id'] = store.id;
  return config;
});
```

---

## 6. 文件变更汇总

| 操作 | 文件 | 行数估算 |
|:----:|------|:------:|
| + | `model/waitlist.go` | ~40 |
| + | `model/store_settings.go` | ~30 |
| + | `repo/waitlist_repo.go` | ~100 |
| + | `service/waitlist_service.go` | ~180 |
| + | `handler/waitlist_handler.go` | ~100 |
| + | `service/admin_service.go` | ~150 |
| + | `handler/admin_handler.go` | ~120 |
| Δ | `service/checkin_service.go` | ~50行改动 |
| Δ | `service/booking_service.go` | ~5行改动 |
| Δ | `handler/router.go` | +15行路由 |
| Δ | `model/attendance.go` | +3字段 |
| + | `src/pages/Dashboard/*` | ~250 |
| + | `src/pages/Members/*` | ~350 |
| + | `src/services/*` | ~80 |
| + | `src/stores/*` | ~60 |
| + | `src/layouts/*` | ~80 |
| **总计** | **后端 ~900行 + 前端 ~820行** | |
