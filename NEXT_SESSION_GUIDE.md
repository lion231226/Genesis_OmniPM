# OmniPM 新对话引导词 v2.3.0

> **用途**：将此文件内容粘贴为新对话的第一条消息。
> **当前版本**：v2.3.0
> **下一任务**：使用瑜伽馆项目对 OmniPM 进行测试验证

---

## 一、项目概要

**OmniPM v2.3.0** — Context Engineering 多 Agent 编排引擎。

- **Meta-Orion**（Context Compiler）：分析项目 → 生成 DAG
- **Execution-Orion**（Context Runtime）：按 DAG 执行 → 调度专家 → 闭环修正
- **Extension**：`run_experts`（单/并行/链式）+ `omni_dag`（DAG 状态管理）
- **13 位专家 Agent v2.3.0**：每位含审查清单 + 质量标准(P0/P1/P2) + 协作提示
- **跨平台运行时**：ARI 抽象层 + Pi Adapter + Mock Runtime + 平台配置表
- **71 个单元测试**：mock(23) + dag-utils(31) + chain-executor(17)
- **GitHub**：`lion231226/Genesis_OmniPM` + `lion231226/omnipm-orion` + `lion231226/yoga-studio`

## 二、版本能力总览

| 能力 | v2.0.0 | v2.3.0 |
|------|--------|--------|
| 自编排 DAG | ✅ | ✅ |
| 13 专家子代理 | ✅ | ✅ 增强版（审查清单+质量标准） |
| outputs 验证 | ❌ | ✅ (P0-1) |
| GATE 硬阻断 | ❌ | ✅ (P0-3) |
| 空输出检测 | ❌ | ✅ (v2.2.1) |
| 跨平台 ARI | ❌ | ✅ (P2-2) |
| Mock Runtime | ❌ | ✅ |
| 单元测试 | ❌ | ✅ **71 tests** |
| CI/CD | ❌ | ✅ GitHub Actions |
| Web 模板 | ❌ | ✅ (P2-1) |
| Claude 适配器 | ❌ | 📋 设计完成 |

## 三、测试验证项目：瑜伽馆数字 AI 化运营系统

```
yoga-studio/
├── backend/        Go + Gin + MySQL + Redis + JWT（30文件，14张表）
├── miniprogram/    微信小程序（48文件，7页面+2分包）
└── web-admin/      React + Ant Design 5 + Vite 6（13文件脚手架）
```

**测试目标**：用 OmniPM 的完整流程逐步推进瑜伽馆项目，验证引擎各项能力是否按设计运行。

## 四、测试验证协议（★ 核心新增）

### 4.1 原子任务原则

**每次对话只执行一个原子任务。**

| 原子任务示例 | 预计节点数 |
|-------------|-----------|
| 完善后端支付模块 | 3-6 |
| Web 管理后台会员管理页面 | 2-4 |
| 小程序消息推送功能 | 3-5 |
| 后端单元测试补充 | 2-3 |

### 4.2 每任务验证流程

```
┌─────────────────────────────────────────────────────┐
│  1. Meta-Orion 分析 → 生成 DAG                        │
│  2. 执行 DAG（按节点逐步推进）                          │
│  3. 每节点完成后立即对照验证：                           │
│     ├── 该节点的 success_criteria 是否真正满足？        │
│     ├── outputs 验证是否通过？                         │
│     ├── GATE 是否按要求暂停？                          │
│     ├── 闭环修正是否正确触发？                          │
│     └── 专家评审输出是否符合 v2.3.0 质量标准？           │
│  4. 记录偏差 → 分类 → 修复                             │
│  5. 更新 PROJECT_MEMORY.md 验证记录                     │
└─────────────────────────────────────────────────────┘
```

### 4.3 验证记录模板

每个原子任务完成后，在 `PROJECT_MEMORY.md` 追加：

```yaml
validation_log:
  - task: "任务描述"
    date: "日期"
    dag_nodes: N
    checks:
      meta_orion_analysis: "✅/⚠️/❌"     # 分析质量
      dag_structure: "✅/⚠️/❌"            # DAG 结构合理性
      expert_quality: "✅/⚠️/❌"           # 专家输出质量
      outputs_verification: "✅/⚠️/❌"     # outputs 验证
      gate_mechanism: "✅/⚠️/❌"            # GATE 门控
      correction_loop: "✅/⚠️/❌"          # 闭环修正
      dev_selfcheck: "✅/⚠️/❌"            # DEVELOP 自检
    deviations:
      - {check: "xxx", expected: "设计预期", actual: "实际表现", severity: "P0|P1|P2"}
    fixes_applied:
      - "修复描述"
    verdict: "PASS|PASS_WITH_FIXES|FAIL"
```

### 4.4 偏差严重等级

| 等级 | 含义 | 处理 |
|------|------|------|
| P0 | 引擎能力与设计严重不符 | 立即修复后再继续 |
| P1 | 有偏差但不阻塞当前任务 | 记录，本对话末修复 |
| P2 | 小偏差或优化建议 | 记录，下一轮统一处理 |

## 五、核心执行原则

```
Orion = 编排者 + 验收者，不是亲手执行者。

1. 设计 DAG → omni_dag init
2. 为每个节点 dispatch 子代理 → run_experts
3. 检查 dag_suggestion → 非 complete → omni_dag fail → 闭环修正
4. omni_dag complete（必须带 outputs 参数）
5. 熔断保护 → 3 次失败请求用户介入
6. ★ 每个节点完成后对照 §四 验证清单逐项检查
7. ★ 交付前验证 → grep 确认文件真的变了，再汇报"完成"
```

**不可违反的铁律**：
- CDL 搜索不可跳过（铁律 2b）
- REVIEW 节点出口必须检查 dag_suggestion（§2.3.1）
- DAG 生成前检查需求覆盖率（§1.6-B）
- **声称"完成"前必须验证文件确实存在**（防止虚假汇报）
- **每任务结束时必须填写验证记录**
- **一次对话只做一个原子任务**

## 六、新对话启动指令

```
@OMNIPM_SYSTEM_PROMPT.md

你是 Orion v2.3.0。新会话启动。

请读取：
1. PROJECT_MEMORY.md       — 项目状态 + 验证记录
2. NEXT_SESSION_GUIDE.md   — 本文件（测试验证协议）
3. OMNIPM_SYSTEM_PROMPT.md — 系统提示词

═══════════════════════════════════════
本次原子任务：[用户指定一个具体任务]
═══════════════════════════════════════

执行流程：
1. Meta-Orion 分析任务 → 输出 META-GATE
2. 用户确认 → 生成 DAG → GATE-DESIGN
3. 按 DAG 逐节点执行，每节点完成后立即对照 §四 验证清单
4. 记录偏差 → 分类 → 修复
5. 更新 PROJECT_MEMORY.md 验证记录
6. GATE-ACCEPTANCE

关键提醒：
- 一次对话只做这一个任务，不要扩展到其他范围
- 每个节点完成必须带 outputs 验证
- 专家空输出 → 重试（v2.2.1）
- 发现问题立即记录，P0 立即修复
```

## 七、推荐原子任务队列

按优先级排列，每次选一个在新对话中执行：

| # | 任务 | 验证重点 |
|---|------|---------|
| 1 | 后端登录/注册模块完善 | outputs验证 + GATE门控 + 专家协作 |
| 2 | 小程序首页课表展示 | 前后端协作 + DEVELOP自检 |
| 3 | Web 管理后台会员管理 CRUD | GATE硬阻断 + 专家评审质量 |
| 4 | 后端单元测试补充 | 代码生成质量 + 测试策略 |
| 5 | 消息推送模板+定时任务 | 工作流复杂度 + 闭环修正 |
| 6 | 积分兑换商城逻辑 | 并发安全 + 安全专家评审 |

---

> **一句话**：OmniPM 已经搭好了引擎，现在是验证它在真实项目中是否按设计运行的时候。每次只做一个任务，每个节点都对照检查，每个偏差都记录修复。
