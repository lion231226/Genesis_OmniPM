# 瑜伽馆管理后台 Web 端

> OmniPM v2.2.0 P2-1 | React + Ant Design | 瑜伽馆数字AI化系统配套管理端

## 技术栈

- React 18 + TypeScript
- Ant Design 5 (UI 组件)
- React Router 6 (路由)
- Day.js (时间处理)
- Axios (HTTP 请求)
- ECharts (数据图表)

## 功能模块

| 模块 | 路径 | 说明 |
|------|------|------|
| 仪表盘 | `/dashboard` | 今日概览：约课数/签到率/收入/新增会员 |
| 会员管理 | `/members` | 会员列表/详情/等级/积分/消费记录 |
| 课程管理 | `/courses` | 课程CRUD/排课/教师分配 |
| 约课管理 | `/bookings` | 预约列表/取消/排队/候补 |
| 签到管理 | `/checkins` | 签到记录/迟到/缺席统计 |
| 积分管理 | `/points` | 积分流水/兑换记录/规则配置 |
| 消息推送 | `/messages` | 模板管理/批量推送/推送记录 |
| 数据报表 | `/reports` | 营收报表/会员增长/课程热度 |
| 系统设置 | `/settings` | 门店设置/账号管理/角色权限 |

## 项目结构（规划）

```
web-admin/
├── public/
├── src/
│   ├── layouts/          # MainLayout / AuthLayout
│   ├── pages/
│   │   ├── Dashboard/
│   │   ├── Members/
│   │   ├── Courses/
│   │   ├── Bookings/
│   │   ├── Checkins/
│   │   ├── Points/
│   │   ├── Messages/
│   │   ├── Reports/
│   │   └── Settings/
│   ├── components/       # 共享组件
│   ├── services/         # API 调用层
│   ├── hooks/            # 自定义 Hooks
│   ├── stores/           # 状态管理
│   ├── utils/            # 工具函数
│   ├── types/            # TypeScript 类型
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts
```
