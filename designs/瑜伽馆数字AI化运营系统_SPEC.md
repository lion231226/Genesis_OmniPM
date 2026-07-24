# 瑜伽馆数字AI化运营系统 — 技术规格说明书 (SPEC)

> **版本**: v1.0 | **日期**: 2026-07-23 | **对应 PRD**: designs/瑜伽馆数字AI化运营系统_PRD.md
> **范围**: Slice 1 — 约课核心闭环（排队 + 签到增强 + Web Dashboard）

---

## 目录

1. [数据库变更](#一数据库变更)
2. [API 契约](#二api-契约)
3. [状态机](#三状态机)
4. [关键算法](#四关键算法)
5. [Web 管理后台组件树](#五web-管理后台组件树)
6. [文件变更清单](#六文件变更清单)

---

## 一、数据库变更

### 1.1 新增表

#### waitlist_entries（排队记录表）

```sql
CREATE TABLE waitlist_entries (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    member_id       BIGINT UNSIGNED NOT NULL,
    course_schedule_id BIGINT UNSIGNED NOT NULL,
    position        INT UNSIGNED DEFAULT 1,           -- 排队位置
    status          ENUM('waiting','invited','accepted','declined','expired','cancelled') DEFAULT 'waiting',
    invited_at      DATETIME NULL,                     -- 被邀约时间
    invited_by      VARCHAR(50) NULL,                  -- 邀约触发来源: 'auto_cancel'|'auto_low_capacity'|'manual'
    responded_at    DATETIME NULL,                     -- 响应时间
    booking_id      BIGINT UNSIGNED NULL,              -- 接受后生成的 booking ID
    idempotency_key CHAR(36) NOT NULL,
    store_id        BIGINT UNSIGNED NOT NULL,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at      DATETIME NULL,

    INDEX idx_member (member_id),
    INDEX idx_schedule (course_schedule_id),
    INDEX idx_status (status),
    INDEX idx_store (store_id),
    UNIQUE INDEX uq_idempotency (idempotency_key),
    UNIQUE INDEX uq_member_schedule (member_id, course_schedule_id, status)  -- 同一人同一课程只能排队一次
);
```

### 1.2 变更表

#### bookings 表 — 无结构变更

当前 `bookings` 表已有 `queue_position` 字段和 `status` 枚举 (`booked`,`checked_in`,`cancelled`,`no_show`)。无需 DDL 变更，仅增强业务逻辑：

- 新增 booking source: `'queue'` — 从排队转预约
- cancelled 时触发 waitlist 自动邀约

#### attendances 表 — 增强签到判定

```sql
ALTER TABLE attendances
    ADD COLUMN checkin_method ENUM('qr_scan','staff_manual','auto') DEFAULT 'qr_scan' AFTER checkin_time,
    ADD COLUMN late_minutes INT DEFAULT 0 AFTER status,
    ADD COLUMN is_absent BOOLEAN DEFAULT FALSE AFTER is_valid,
    MODIFY status ENUM('on_time','late','absent','early_leave') NOT NULL;
```

### 1.3 新增 store_settings（门店配置表）

```sql
CREATE TABLE store_settings (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    store_id        BIGINT UNSIGNED NOT NULL UNIQUE,
    -- 签到规则
    late_grace_minutes   INT DEFAULT 5,    -- 迟到宽限分钟数（≤N分钟算准时）
    late_max_minutes     INT DEFAULT 15,   -- 超过此分钟数算缺席
    -- 排队规则
    auto_invite_enabled  BOOLEAN DEFAULT TRUE,  -- 是否启用自动邀约
    auto_invite_hours    INT DEFAULT 3,         -- 提前N小时人数不足时邀约
    -- 积分规则（总部设定，门店只读）
    points_rate          INT DEFAULT 10,   -- 积分汇率：10积分=1元
    max_monthly_deduct   INT DEFAULT 20000, -- 月抵扣上限（分）
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 1.4 完整 ER 关系（Slice 1 范围）

```
┌──────────┐     ┌────────────────┐     ┌──────────────┐
│  Member  │────→│    Booking     │────→│  Attendance  │
│          │     │  (已有，增强)   │     │  (已有，增强)  │
└──────────┘     └───────┬────────┘     └──────────────┘
                         │
                         │ cancelled → 触发邀约
                         ▼
                  ┌──────────────┐
                  │WaitlistEntry │  ← 新增
                  │  (新增)       │
                  └──────────────┘
                         │
                         │ accepted → 生成 Booking
                         ▼
                  ┌──────────────┐
                  │   Booking    │
                  │ source=queue │
                  └──────────────┘

┌──────────┐     ┌──────────────┐
│  Store   │────→│StoreSettings │  ← 新增
└──────────┘     └──────────────┘

┌──────────┐     ┌──────────────┐
│ Member   │────→│ PointRecord  │  ← 已有
└──────────┘     └──────────────┘
```

---

## 二、API 契约

### 2.1 排队相关（新增 4 端点）

#### POST /api/v1/waitlist/join — 加入排队

```
Request:
  POST /api/v1/waitlist/join
  Authorization: Bearer <token>
  Body: {
    "course_schedule_id": 123,
    "idempotency_key": "uuid-v4"
  }

Response 201:
  {
    "id": 456,
    "position": 3,
    "status": "waiting",
    "course_schedule_id": 123,
    "estimated_wait": "前面有2人排队"
  }

Errors:
  400 - 课程未满员（不需要排队，直接约课）
  409 - 已在排队中（idempotency_key 重复）
  404 - 课程不存在
```

#### DELETE /api/v1/waitlist/:id — 取消排队

```
Request:
  DELETE /api/v1/waitlist/456
  Authorization: Bearer <token>

Response 200:
  { "message": "已取消排队", "id": 456 }

Errors:
  403 - 不是自己的排队记录
  404 - 排队记录不存在
```

#### GET /api/v1/waitlist/my — 我的排队

```
Response 200:
  {
    "items": [
      {
        "id": 456,
        "course_name": "哈他瑜伽",
        "teacher_name": "王老师",
        "start_time": "2026-07-24T10:00:00+08:00",
        "position": 3,
        "status": "waiting",
        "created_at": "2026-07-23T14:30:00+08:00"
      }
    ]
  }
```

#### POST /api/v1/waitlist/:id/respond — 响应邀约（内部+会员端）

```
Request:
  POST /api/v1/waitlist/456/respond
  Authorization: Bearer <token>
  Body: {
    "action": "accept" | "decline"
  }

Response 200 (accept):
  {
    "status": "accepted",
    "booking_id": 789,
    "message": "预约成功！已为您预留位置"
  }

Response 200 (decline):
  {
    "status": "declined",
    "message": "已取消，系统将邀约下一位"
  }

Errors:
  400 - 当前状态不是 'invited'
  408 - 邀约已过期（超时未响应）
```

### 2.2 签到增强（修改 1 端点）

#### POST /api/v1/checkin — 增强签到判定

```
Request: (不变)
  POST /api/v1/checkin
  Authorization: Bearer <token>
  Body: {
    "booking_id": 789,
    "method": "qr_scan" | "staff_manual",
    "idempotency_key": "uuid-v4"
  }

Response 200:
  {
    "attendance_id": 1001,
    "status": "on_time" | "late" | "absent",
    "late_minutes": 0,
    "points_earned": 10,
    "is_valid": true,
    "message": "签到成功！获得10积分"
  }

判定逻辑（见 §4.1）:
  - 课前15分钟～课后 grace 分钟 → on_time, is_valid=true, 全额积分
  - 课后 grace+1分钟～课后 max 分钟 → late, is_valid=true, 50%积分
  - 超过 max 分钟或未签到 → absent, is_valid=false, 不计分
  - 课程结束2小时后未签到 → 自动标记 no_show

Errors:
  400 - booking 不存在或状态不是 'booked'
  409 - 已签到（idempotency_key）
```

### 2.3 Web 管理后台 Dashboard（新增 5 端点）

#### GET /api/v1/admin/dashboard/summary — 看板概览

```
Response 200:
  {
    "today": {
      "bookings": 28,
      "checkins": 22,
      "new_members": 3,
      "waiting": 5,
      "expiring_cards": 8
    },
    "monthly_attendance_rate": 0.73,
    "pending_tasks": {
      "reviews": 3,
      "exchange_orders": 2,
      "at_risk_members": 5,
      "refunds": 1
    }
  }
```

#### GET /api/v1/admin/dashboard/realtime — 实时课程状态

```
Response 200:
  {
    "current_sessions": [
      {
        "schedule_id": 100,
        "course_name": "哈他瑜伽",
        "teacher_name": "王老师",
        "start_time": "09:00",
        "end_time": "10:00",
        "capacity": 20,
        "booked": 18,
        "checked_in": 16,
        "status": "in_progress",
        "status_label": "🟢 正在上课"
      },
      {
        "schedule_id": 101,
        "course_name": "普拉提",
        "teacher_name": "李老师",
        "start_time": "10:30",
        "end_time": "11:30",
        "capacity": 15,
        "booked": 12,
        "status": "scheduled",
        "status_label": "🟡 即将开始",
        "low_capacity_alert": false
      },
      {
        "schedule_id": 102,
        "course_name": "流瑜伽",
        "teacher_name": "陈老师",
        "start_time": "14:00",
        "end_time": "15:00",
        "capacity": 20,
        "booked": 8,
        "status": "scheduled",
        "status_label": "🔴 人数不足",
        "low_capacity_alert": true,
        "auto_invite_sent": 12
      }
    ]
  }
```

#### GET /api/v1/admin/members — 会员列表

```
Query params:
  ?page=1&page_size=20
  &keyword=张（模糊搜索姓名/手机）
  &tier=gold
  &status=active
  &risk=at_risk  （at_risk=7天未到店,lost=14天+,no_show=连续3次）

Response 200:
  {
    "total": 286,
    "page": 1,
    "page_size": 20,
    "items": [
      {
        "id": 1,
        "name": "张*花",
        "phone_hash": "a1b2...",
        "tier": "gold",
        "tier_label": "金卡",
        "status": "active",
        "recent_attendance": 8,
        "total_points": 1250,
        "last_visit": "2026-07-22",
        "risk": "healthy",
        "card_type": "年卡",
        "card_expire": "2027-03-12"
      }
    ]
  }
```

#### GET /api/v1/admin/members/:id — 会员详情

```
Response 200:
  {
    "basic": { ... },
    "cards": [ ... ],
    "recent_bookings": [ ... ],
    "points": {
      "total": 1250,
      "available": 1250,
      "equivalent_yuan": 125.00
    },
    "points_history": [ ... ],
    "attendance_heatmap": {
      "days": [{"date":"2026-07-01","count":1},...],
      "recent_30d_count": 8,
      "recent_30d_target": 8,
      "target_met": true
    },
    "follow_ups": [ ... ],
    "risk": "healthy"
  }
```

#### GET /api/v1/admin/schedule — 排课管理（已有月/日视图，补充分页）

```
Query params:
  ?date=2026-07-23&view=day|week
  &teacher_id=5

Response 200:
  {
    "date": "2026-07-23",
    "view": "day",
    "schedules": [
      {
        "id": 100,
        "course_name": "哈他瑜伽",
        "teacher_name": "王老师",
        "start_time": "09:00",
        "end_time": "10:00",
        "capacity": 20,
        "booked": 18,
        "waiting": 3,
        "status": "in_progress"
      }
    ]
  }
```

---

## 三、状态机

### 3.1 排队状态机

```
                    ┌─────────┐
                    │ waiting │ ← 加入排队
                    └────┬────┘
                         │
              ┌──────────┼──────────┐
              │ 有人取消   │ 人数不足   │ 手动邀约
              ▼          ▼          ▼
         ┌─────────┐ ┌─────────┐
         │ invited │ │ invited │
         └────┬────┘ └────┬────┘
              │           │
       ┌──────┼──────┐    │
       ▼      ▼      ▼    ▼
  ┌──────┐ ┌──────┐ ┌──────┐
  │accept│ │decline│ │expire│
  └──┬───┘ └──┬───┘ └──┬───┘
     │        │        │
     ▼        ▼        ▼
  生成     邀约下     释放
  Booking  一位      位置

任意状态 → cancelled（用户主动取消）
```

**触发条件**：
| 事件 | 触发 | 结果 |
|------|------|------|
| 有人取消预约 | booking.cancelled → 查询 waitlist（status=waiting, position=1） | 发送邀请给第一位排队者 |
| 开课前N小时人数不足 | 定时任务检查 booked < capacity×0.5 | 按偏好匹配 + 发送邀请 |
| 邀请过期 | invited_at + 2小时无响应 | 自动 expired → 邀约下一位 |
| 用户拒绝邀请 | declined | 邀约下一位 |

**并发安全**：排队邀约使用 Redis 分布式锁 `lock:waitlist_invite:{schedule_id}`，确保同一课程同时只处理一个邀约。

### 3.2 签到判定状态

```
                    课程开始
                       │
        ┌──────────────┼──────────────┐
        │课前15分钟     │ 课后0~grace   │ 课后grace+1~max
        ▼              ▼              ▼
   ┌─────────┐   ┌─────────┐    ┌─────────┐
   │ on_time │   │ on_time │    │  late   │
   │ 全额积分 │   │ 全额积分 │    │ 50%积分  │
   └─────────┘   └─────────┘    └─────────┘
                                        │
                              超过 max 分钟未签到
                                        │
                                        ▼
                                  ┌─────────┐
                                  │ absent  │
                                  │ 不计分   │
                                  └─────────┘
                                  
               课程结束后 2 小时未签到 → no_show（Booking 状态）
```

---

## 四、关键算法

### 4.1 签到时间判定

```go
func DetermineAttendanceStatus(scheduleStart time.Time, checkinTime time.Time, settings StoreSettings) (status string, lateMinutes int, isValid bool, pointsMultiplier float64) {
    diff := checkinTime.Sub(scheduleStart)
    lateMin := int(diff.Minutes())
    
    switch {
    case lateMin <= settings.LateGraceMinutes:
        // 提前15分钟到课后5分钟：准时
        return "on_time", max(0, lateMin), true, 1.0
    case lateMin <= settings.LateMaxMinutes:
        // 迟到但还在可接受范围
        return "late", lateMin, true, 0.5
    default:
        // 超过最大迟到时间
        return "absent", lateMin, false, 0.0
    }
}
```

### 4.2 积分自动发放（签到联动）

```go
func AwardCheckinPoints(attendance Attendance, course CourseSchedule) (int, error) {
    if !attendance.IsValid {
        return 0, nil
    }
    
    // 查询课程基础积分
    course := getCourse(courseSchedule.CourseID)
    points := course.BasePoints
    
    // 私教/小班翻倍
    if course.Category == "private" || course.Category == "small_class" {
        points *= 2
    }
    
    // 迟到减半
    if attendance.Status == "late" {
        points /= 2
    }
    
    // 发放积分 + 检查周/月/梯度奖励
    awardPoints(attendance.MemberID, points, "course_checkin", attendance.ID)
    checkWeeklyReward(attendance.MemberID)
    checkMonthlyReward(attendance.MemberID)
    checkMilestoneReward(attendance.MemberID)
    
    return points, nil
}
```

### 4.3 排队自动邀约

```go
func AutoInviteFromWaitlist(scheduleID uint, trigger string) error {
    lockKey := fmt.Sprintf("lock:waitlist_invite:%d", scheduleID)
    if !redis.AcquireLock(lockKey, 30*time.Second) {
        return ErrLockFailed
    }
    defer redis.ReleaseLock(lockKey)
    
    // 找到第一个 waiting 状态的排队记录
    entry := findFirstWaiting(scheduleID)
    if entry == nil {
        return nil
    }
    
    // 更新为 invited，设置2小时超时
    updateStatus(entry.ID, "invited", trigger)
    
    // 异步发送微信通知
    go sendInviteNotification(entry.MemberID, entry.CourseScheduleID)
    
    return nil
}
```

---

## 五、Web 管理后台组件树

### 5.1 路由结构

```
src/
├── layouts/
│   └── AdminLayout.tsx          ← ProLayout 外壳 + 门店切换器 + 角色菜单过滤
│
├── pages/
│   ├── Login/
│   │   └── index.tsx
│   │
│   ├── Dashboard/
│   │   ├── index.tsx             ← 看板首页（容器）
│   │   ├── components/
│   │   │   ├── StatCards.tsx     ← 今日概览6卡片
│   │   │   ├── RealtimeSessions.tsx  ← 实时课程状态列表
│   │   │   ├── PendingTasks.tsx  ← 待处理事项列表
│   │   │   └── QuickActions.tsx  ← 快速操作按钮组
│   │   └── hooks/
│   │       └── useDashboard.ts   ← 数据聚合 hook（轮询5s）
│   │
│   ├── Members/
│   │   ├── List.tsx              ← 会员列表（ProTable）
│   │   ├── Detail.tsx            ← 会员详情（360°视图）
│   │   ├── components/
│   │   │   ├── MemberBasicInfo.tsx
│   │   │   ├── MemberCards.tsx
│   │   │   ├── AttendanceHeatmap.tsx  ← 出勤热力图（@ant-design/charts）
│   │   │   ├── PointsHistory.tsx
│   │   │   └── FollowUpTimeline.tsx
│   │   └── hooks/
│   │       └── useMembers.ts
│   │
│   ├── Schedule/
│   │   └── Calendar.tsx           ← 排课日历（周视图/日视图）
│   │
│   └── Settings/
│       └── StoreSettings.tsx
│
├── components/                    ← 共享组件
│   ├── StoreSwitcher.tsx          ← 顶部门店切换器
│   ├── MemberRiskTag.tsx          ← 会员风险标签
│   └── ...
│
├── stores/
│   ├── authStore.ts               ← Zustand: 用户+角色+门店
│   └── appStore.ts                ← 全局状态
│
├── services/
│   ├── api.ts                     ← axios 实例 + 拦截器
│   ├── dashboardApi.ts
│   ├── memberApi.ts
│   └── scheduleApi.ts
│
└── utils/
    ├── permissions.ts             ← 权限守卫
    └── constants.ts
```

### 5.2 组件依赖图（关键页面）

```
Dashboard/index.tsx
  ├── StatCards           ← GET /admin/dashboard/summary
  ├── RealtimeSessions    ← GET /admin/dashboard/realtime (轮询5s)
  ├── PendingTasks        ← 内嵌于 summary 响应
  └── QuickActions        ← 纯前端路由跳转

Members/List.tsx
  └── ProTable (Ant Design)
       ├── search: keyword + tier + status + risk
       ├── columns: name, phone, tier, status, last_visit, points
       └── actions: [查看详情] [发消息] [办卡]

Members/Detail.tsx
  ├── MemberBasicInfo     ← GET /admin/members/:id
  ├── MemberCards
  ├── AttendanceHeatmap   ← @ant-design/charts
  ├── PointsHistory       ← 积分流水列表
  └── FollowUpTimeline    ← 跟进记录时间轴
```

---

## 六、文件变更清单

### 6.1 后端 (Go)

| 操作 | 文件 | 说明 |
|:----:|------|------|
| **新增** | `internal/model/waitlist.go` | WaitlistEntry 模型 |
| **新增** | `internal/model/store_settings.go` | StoreSettings 模型 |
| **新增** | `internal/repository/waitlist_repo.go` | 排队 CRUD + 位置重排 |
| **新增** | `internal/service/waitlist_service.go` | 排队业务逻辑 + 自动邀约 |
| **新增** | `internal/handler/waitlist_handler.go` | 排队 API handlers |
| **修改** | `internal/handler/router.go` | +8 个新路由 |
| **修改** | `internal/service/checkin_service.go` | 增强签到判定逻辑 |
| **修改** | `internal/service/booking_service.go` | 取消预约 → 触发排队邀约 |
| **修改** | `internal/service/points_service.go` | 签到联动积分发放 |
| **新增** | `internal/handler/admin_handler.go` | 管理后台 API handlers |
| **新增** | `internal/service/admin_service.go` | Dashboard 数据聚合 |
| **新增** | `internal/model/attendance.go` | （修改）增加 checkin_method/late_minutes/is_absent |

### 6.2 前端 (React)

| 操作 | 文件 | 说明 |
|:----:|------|------|
| **新增** | `src/layouts/AdminLayout.tsx` | ProLayout 外壳 |
| **新增** | `src/pages/Dashboard/*` | 看板首页（4组件+1hook） |
| **新增** | `src/pages/Members/List.tsx` | 会员列表页 |
| **新增** | `src/pages/Members/Detail.tsx` | 会员详情页 |
| **新增** | `src/pages/Members/components/*` | 5个详情子组件 |
| **新增** | `src/services/*.ts` | API 服务层 |
| **新增** | `src/stores/*.ts` | 状态管理 |
| **新增** | `src/components/StoreSwitcher.tsx` | 门店切换器 |
| **修改** | `src/App.tsx` | 路由注册 |

### 6.3 数据库

| 操作 | 说明 |
|:----:|------|
| CREATE TABLE | `waitlist_entries` |
| CREATE TABLE | `store_settings` |
| ALTER TABLE | `attendances` (+3列) |

---

> **下一步**: node_1 现有代码审计 → node_2 详细设计 → node_3 设计评审
