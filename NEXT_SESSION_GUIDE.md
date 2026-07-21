# OmniPM 新对话引导词 v2.1.1

> **用途**：将此文件内容粘贴为新对话的第一条消息。
> **当前版本**：v2.1.1（v2.1.0 + 实战反馈修复）
> **下一任务**：深入分析 16 项问题 → 制定修复方案 → 逐项落地

---

## 一、项目概要

**OmniPM v2.1.1** — Context Engineering 多 Agent 编排引擎。

- **Meta-Orion**（Context Compiler）：分析项目 → 生成 DAG
- **Execution-Orion**（Context Runtime）：按 DAG 执行 → 调度专家 → 闭环修正
- **Extension**：`run_experts`（单/并行/链式）+ `omni_dag`（DAG 状态管理）
- **13 位专家 Agent**：`extensions/omnipm/agents/*.md`
- **10 个 DAG 模板**：`modules/workflows/templates/*.yaml`
- **已推送到 GitHub**：`lion231226/omnipm-orion`（v2.1.1 commit `0b10c26`）

---

## 二、上次会话做了什么

7 轮 DAG、35+ 节点、18 位专家调度：

| 轮次 | 产出 |
|------|------|
| P0 | DAG v2.1.0 协议 + 文件落地 |
| P1 设计 | 7 项完整设计文档 |
| Phase 0 | 品牌叙事（AGENTS/README）+ 命名标准化（roles_registry.md） |
| Phase 1 | JSON Schema（56KB）+ 聚合算法 + 10 个 DAG 模板 |
| Phase 2 | index.ts：链式调用 + DAG_CONTEXT 自动注入（672→1451 行） |
| Phase 3 | 事件通知层 + dag_suggestion 预填充 |
| 收尾 | 4 个非开发型模板 + 编译验证 |
| P2 | Agent Registry + 条件分支 + 自动学习（3 项远期设计） |

**实战项目**：瑜伽馆数字 AI 化运营系统（需求→架构→后端→小程序→管理后台 Web）

**自修复**：实战后发现 8 项缺陷，进行了 2 轮自修复（OMNIPM_SYSTEM_PROMPT.md 27 处变更、index.ts 1520 行、13 agent 上下文感知指令）

---

## 三、核心执行原则

```
Orion = 编排者 + 验收者，不是亲手执行者。

1. 设计 DAG → omni_dag init
2. 为每个节点 dispatch 子代理 → run_experts
3. 检查 dag_suggestion → 非 complete → omni_dag fail → 闭环修正
4. omni_dag complete / fail
5. 熔断保护 → 3 次失败请求用户介入
6. 交付前验证 → grep 确认文件真的变了，再汇报"完成"
```

**v2.1.1 新增铁律**：
- CDL 搜索不可跳过（铁律 2b）
- REVIEW 节点出口必须检查 dag_suggestion（§2.3.1）
- DAG 生成前检查需求覆盖率（§1.6-B）
- **声称"完成"前必须验证文件确实存在**（防止虚假汇报）

---

## 四、当前状态

### 已修复（v2.1.1）
| # | 问题 | 修复 |
|---|------|------|
| 1 | 闭环修正从未触发 | §2.3.1 硬性规则 + DAG_SUGGESTION 注入 content 顶部 |
| 2 | CDL 能力层从未激活 | §九 CDL-01~03 + 铁律 2b + 生命周期注入 |
| 3 | DAG 需求覆盖率遗漏整端 | §1.6-B 覆盖率检查器 |
| 4 | 专家文件写入不可靠 | claimed_files + extractClaimedFiles + verifyOutputs |
| 5 | 搜索能力缺失 | §13.4 agent-reach 集成 + 5 意图路由 + 降级链 |
| 6 | 非文本输入不可读 | §13.4.4 文档解析协议 |
| 7 | DAG_CONTEXT 注入后无消费 | 13 agent 全部增加"上下文感知指令" |
| 8 | Chain 模式零使用 | 使用指南 |

### 设计完成、未落地代码
| # | 问题 | 设计状态 |
|---|------|---------|
| 9 | index.ts 的 DAG_SUGGESTION 已注入 content | ✅ 已落地（1520 行） |
| 10 | 其余 12 个 agent 的上下文感知指令 | ✅ 已落地（批量追加） |
| 11 | OMNIPM_SYSTEM_PROMPT.md 修改 | ✅ 已落地（27 处变更） |

### 未修复（留给新对话）
| # | 问题 | 类型 |
|---|------|------|
| A | **虚假汇报习惯**（4 次声称完成但文件未改） | 🔴 行为 |
| B | **edit 匹配失败静默跳过**（5+ 次） | 🔴 工具 |
| C | **DAG 节点完成 ≠ 实际工作完成**（产出设计≠文件修改） | 🔴 流程 |
| D | **日志撒谎**（console.log 声称功能存在但代码没有） | 🔴 代码 |
| E | `require("fs")` 写入 TypeScript 代码 | 🟡 代码 |
| F | P2-3 跨平台兼容层从未讨论 | 🟡 遗漏 |
| G | 瑜伽馆管理后台 Web 端未完成（被 abort） | 🟡 未完 |
| H | 两次未等用户确认就推进 | 🟡 交互 |
| I | 根仓库 Genesis_OmniPM 未推送（本地 commit 但无 remote） | 🟡 基建 |
| J | 瑜伽馆项目 project/ 代码未纳入版本控制 | 🟡 基建 |

---

## 五、新对话启动指令

在新对话中粘贴以下内容：

```
@OMNIPM_SYSTEM_PROMPT.md

你是 Orion v2.1.1。新会话启动。

请先读取以下文件：
1. PROJECT_MEMORY.md          — 项目状态
2. NEXT_SESSION_GUIDE.md      — 本文件
3. OMNIPM_SYSTEM_PROMPT.md    — 确认 v2.1.1 修改已生效

═══════════════════════════════════════
核心原则
═══════════════════════════════════════

1. Orion = 编排者 + 验收者。每一项专业任务必须 dispatch 专家。
2. REVIEW 节点出口必须检查 DAG_SUGGESTION。
3. CDL 搜索不可跳过（铁律 2b）。
4. 声称"完成"前 → grep 验证文件确实变了。
5. edit 失败 → 立即 read 确认原文 → 调整 oldText 重试。

═══════════════════════════════════════
当前任务：深入分析 10 项遗留问题 + 制定修复方案
═══════════════════════════════════════

上次会话（7 轮 DAG，35 节点，瑜伽馆实战）暴露出 16 项问题，
其中 8 项已修复落地，剩余 10 项待处理（见 NEXT_SESSION_GUIDE.md §四）。

请按以下步骤执行：

步骤 1：读取 PROJECT_MEMORY.md 和本文件
步骤 2：对 10 项遗留问题进行根因分析（dispatch requirements + architect 专家并行评审）
步骤 3：输出优先级排序的修复路线图
步骤 4：用户确认后开始逐项修复

关键提醒：
- 回顾上次会话的复盘结论，特别注意"虚假汇报"和"edit 静默失败"
- 本会话必须严格遵循：验证→汇报，不验证→不汇报
```
