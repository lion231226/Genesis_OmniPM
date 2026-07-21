# OmniPM v2.1.0 优化路线图

> 基于 GitHub 高星项目调研 + Pi 官方仓库深度分析 | 2026-07-21 | Orion 综合决议

---

## 调研背景

### 阶段一：GitHub 高星项目调研

| 项目 | ⭐ | 参考价值 |
|------|-----|----------|
| addyosmani/agent-skills | 79.6k | Agent Skills 标准生态 |
| dair-ai/Prompt-Engineering-Guide | 76.8k | 提示词工程最佳实践 |
| langgenius/dify | 149.6k | 可视化工作流标杆 |
| conductor-oss/conductor | 32.0k | 生产级工作流引擎 |
| openai/openai-agents-python | 28.1k | 多 Agent 框架 |
| OthmanAdi/planning-with-files | 25.5k | 持久化规划 + 多Agent共享 |
| jasontang-ai/Context-Engineering | 9.1k | Context 设计理论 |
| microsoft/agent-framework | 12.3k | Agent 编排框架 |

### 阶段二：Pi 官方仓库深度分析（★新增）

> 2026-07-21 深入分析 `earendil-works/pi`（74.4k ⭐）monorepo 架构，
> 识别 OmniPM 可直接复用的原生能力。

#### Pi Monorepo 架构

```
earendil-works/pi
├── packages/ai          → @earendil-works/pi-ai         多Provider统一LLM API
├── packages/agent       → @earendil-works/pi-agent-core  Agent循环+工具调用+状态管理
├── packages/coding-agent→ @earendil-works/pi-coding-agent CLI+Extension系统+SDK
├── packages/tui         → @earendil-works/pi-tui         终端UI库
├── packages/storage     → 持久化存储
└── packages/server      → RPC服务端
```

#### 关键发现：Pi 已提供 OmniPM 80% 基础设施

| Pi 能力 | 对应 OmniPM 功能 | 复用状态 |
|---------|-----------------|---------|
| `examples/extensions/subagent/` | `run_experts` 工具 | ✅ **原型即 Pi 官方示例** |
| `pi.registerTool()` | 自定义工具注册 | ✅ 复用 |
| `pi.on()` 事件钩子（40+ 事件） | DAG 生命周期管理 | ✅ 可深度利用 |
| `pi.appendEntry()` | DAG 状态持久化 | ✅ 复用 |
| `pi.events` 事件总线 | `omni_dag` ↔ `run_experts` 通信 | ⚠️ 未利用 |
| `pi.exec()` / `spawn('pi', ...)` | 子代理进程 fork | ✅ 复用 |
| `before_agent_start` 钩子 | DAG_CONTEXT 自动注入 | ⚠️ 未利用 |
| Agent Markdown 定义格式 | 13 位专家定义标准化 | ⚠️ 未利用 |
| `plan-mode` 扩展示例 | Meta-Orion 规划阶段 | ✅ 可作为参考 |
| `handoff` 扩展示例 | 跨会话上下文交接 | ✅ 可作为参考 |
| `git-checkpoint` 扩展示例 | DAG 检查点机制 | ✅ 可作为参考 |

#### 核心洞察

1. **OmniPM 不是从零构建**：`run_experts` 基于 Pi `subagent` 扩展模式，`omni_dag` 基于 `pi.appendEntry()` 持久化
2. **Pi 提供底层，OmniPM 提供上层**：进程隔离、Agent 定义、事件系统、TUI 渲染 → Pi；动态 DAG、Meta-Orion 分析、闭环修正、质量门控 → OmniPM
3. **最大机会：当前有 3 个 Pi 原生能力未被利用**（事件总线、Agent 定义标准化、before_agent_start 自动注入）

---

## 核心执行原则（新对话必须遵守）

**Orion = 编排者 + 验收者，不是执行者。**

```
❌ 旧模式：Orion 自己读文件、写代码、做分析
✅ 新模式：
   1. Orion 设计 DAG → omni_dag init
   2. Orion 为每个节点 dispatch 子代理 → run_experts
   3. Orion 审查子代理输出 → 通过/驳回/修正
   4. Orion 更新 DAG 状态 → omni_dag complete/fail
   5. Orion 对最终交付负责
```

---

## 优化清单

### P0 — ✅ 已完成（2026-07-21）

| # | 优化项 | 状态 | 交付物 |
|---|--------|------|--------|
| **P0-1** | run_experts 调试与回归测试 | ✅ | 单专家+并行测试通过，零串扰 |
| **P0-2** | DAG 状态持久化增强 | ✅ | v2.1.0 Schema + DAG_CONTEXT 协议 + [DAG_PROPOSAL] |
| **P0-3** | Orion 行为硬规则 | ✅ | OMNIPM_SYSTEM_PROMPT.md §13.2+§13.3 |

### P1 — 本轮推进（Pi 原生能力利用 + 工作流增强）

| # | 优化项 | 来源 | 具体行动 |
|---|--------|------|----------|
| **P1-1** | 工作流 DAG 模板库 | conductor/dify | 预置 10+ 常见项目 DAG 模板，减少 Meta-Orion 生成成本 |
| **P1-2** | 专家定义标准化 | **Pi agents/** | 将 `modules/roles.md` 拆分为 `.pi/agents/*.md`（13个文件），对接 Pi 原生 Agent 发现机制 |
| **P1-3** | run_experts 链式调用 | **Pi subagent chain** | 增加 `chain` 模式，支持 `{previous}` 上下文传递 |
| **P1-4** | DAG_CONTEXT 自动注入 | **Pi before_agent_start** | 利用 `before_agent_start` 钩子实现 Extension 层自动注入（替代纯提示词约束） |
| **P1-5** | 专家输出结构化 Schema | prompt-eng-guide | 统一专家输出为 JSON Schema，便于 Orion 自动聚合 |
| **P1-6** | 跨工具事件通信 | **Pi pi.events** | `omni_dag` 和 `run_experts` 通过事件总线通信（替代 Orion 手动协调） |
| **P1-7** | Context Engineering 定位 | Context-Engineering | 更新 README/AGENTS.md 品牌叙事 |

### P2 — 远期

| # | 优化项 | 来源 | 具体行动 |
|---|--------|------|----------|
| **P2-1** | Agent Skills Registry 发布 | agent-skills(79.6k) | 将 OmniPM 13 位专家发布为可发现 Agent Skills |
| **P2-2** | 可编程条件分支 | openai-agents | Extension 增加 `condition_branch` 工具 |
| **P2-3** | 跨平台兼容层（精简版） | 多Agent生态 | 适配更多 AI Agent 平台 |
| **P2-4** | 项目复盘自动学习 | Context-Engineering | 基于历史 DAG 执行数据优化模板 |

---

## 新对话启动指令

在新对话中发送以下消息作为第一条输入：

```
@OMNIPM_SYSTEM_PROMPT.md

你是 Orion。新会话启动。请先读取 PROJECT_MEMORY.md 了解项目状态。

核心原则（不可违反）：
1. 每一项有专业判断需求的任务，必须通过 run_experts 调度子代理执行
2. 使用 omni_dag 管理所有工作流的状态
3. Orion 的职责是编排 + 验收，不是亲自执行

当前待办（按优先级）：
P0-1: 测试并修复 run_experts 工具（单专家/并行/链式调用）
P0-2: 增强 DAG 状态跨 Agent 共享
P0-3: 在系统提示词中写入 Orion 行为硬规则

请先读取 PROJECT_MEMORY.md，然后使用 omni_dag init 创建优化任务的 DAG，
再按 DAG 节点逐个执行。
```
