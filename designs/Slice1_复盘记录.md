# OmniPM v2.6.0 — 复盘记录: Slice1 瑜伽馆约课核心闭环

> **DAG**: 瑜伽馆数字AI化运营系统-Slice1 | **日期**: 2026-07-23
> **节点**: 11/11 (100%) | **状态**: ✅ 交付完成

---

## 一、执行概览

```
节点链:
  PRD → SPEC → 审计 → 详细设计 → 设计评审 → GATE确认
    → [排队∥签到∥Web Admin]（并行3节点）
    → 代码评审 → 交付验收

实际耗时: 1 会话（~3h）
偏离计划: run_experts 不可用 → 2个REVIEW节点手动执行
```

## 二、关键决策记录

| # | 决策 | 理由 |
|---|------|------|
| D1 | 垂直切片策略 — Slice1=约课核心闭环 | 先交付可用的最小闭环，而非全量开发 |
| D2 | Waitlist 独立表而非复用 Booking 表 | 排队状态机(6状态)与预约状态机(4状态)语义不同 |
| D3 | CheckinService 从异步积分改同步 | 异步 goroutine 积分丢失不可观测；AwardPoints 有幂等保护 |
| D4 | MAX(position)+1 替代 COUNT(*) | READ COMMITTED 下 COUNT 可能并发读到相同值 |
| D5 | Web Admin 降级为纯 antd（弃 pro-components） | 版本不兼容，避免阻塞交付 |

## 三、引擎偏差盘点

| ID | 等级 | 发现 | 影响 |
|----|:----:|------|------|
| PROCESS-P0 | P0 | OmniPM 协议缺少 PRD/SPEC 阶段 | META-GATE→DESIGN 之间信息密度不足 |
| DEV-10 | P1 | run_experts `modelConfig is not defined` | 2 次 REVIEW 节点无法调度专家 |
| CDL-P2 | P2 | CDL 搜索结果未结构化出现在 GATE | 候选能力未正式纳入决策 |
| DEP-P2 | P2 | @ant-design/pro-components 版本不存在 | 前端搭建受阻 30min |

## 四、本轮学到什么

```
1. PRD 和 SPEC 是通用需求，不是项目特定
   → 应固化到 OMNIPM_SYSTEM_PROMPT.md 作为强制阶段

2. 竞品分析（瑜小九/StudioYoga）在 PRD 阶段价值巨大
   → 直接塑造了"AI 运营合伙人"而非"另一个约课工具"的定位

3. 代码审计（node_1）发现了 P0 逻辑错误（IsValid判定）
   → 验证了"先审计再设计"的必要性

4. 多门店 tenant_id 架构在 CDL 阶段就已找到最佳实践
   → CDL 应该在 GATE-DESIGN 中结构化展示以影响决策

5. 前端依赖版本预检应纳入脚手架生成流程
   → npm view <pkg> versions 预检避免 install 失败
```

## 五、交付清单验证

| 类别 | 计划 | 实际 | 偏差 |
|------|:----:|:----:|:----:|
| 后端新增文件 | 6 | 8 | +2（role中间件拆分） |
| 后端修改文件 | 4 | 5 | +1（handler重构） |
| 前端文件 | 10+ | 14 | 额外API层+store拆分 |
| API 端点 | ~12 | 13 | — |
| 数据库变更 | 3 | 3 | — |
| 设计文档 | 4 | 6 | +PRD+SPEC |

---

> **复盘完成。下一会话：修复 PROCESS-P0 + DEV-10 → Slice 2 积分引擎。**
