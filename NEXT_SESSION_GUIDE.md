# OmniPM 新对话引导词 v2.7.0

> **用途**：将此文件内容粘贴为新对话的第一条消息。
> **当前版本**：v2.7.0
> **当前进度**：v2.7.0 引擎加固(27/27) ✅ | Slice2 积分引擎(10/10) ✅ | 已推送 GitHub
> **下一任务**：v2.8.0 引擎修复 → 引擎整体流程讨论

---

## 一、项目概要

**OmniPM v2.7.0** — Context Engineering 多 Agent 编排引擎。

- **Meta-Orion**（Context Compiler）：分析项目 → PRD → SPEC → DAG
- **Execution-Orion**（Context Runtime）：按 DAG 执行 → 调度专家 → 闭环修正
- **4 工具**：`run_experts` / `omni_dag` / `condition_branch` / `cdl_search`
- **13 位专家**：增强审查清单 + 质量标准 + 上下文感知
- **97 测试**：全部通过（94回归 + 3跨平台）
- **GitHub**：`lion231226/Genesis_OmniPM` + `lion231226/omnipm-orion`

## 二、v2.8.0 待修复引擎偏差

### 🔴 P1: PROCES-P1 — DAG完成后未主动执行闭包流程

**两层缺陷**：

| 层 | 问题 | 症状 |
|----|------|------|
| **协议层** | OMNIPM_SYSTEM_PROMPT.md 缺少"DAG完成闭包协议" | GATE-ACCEPTANCE 仅等用户确认，不验证 PROJECT_MEMORY / NEXT_SESSION_GUIDE / PROJECT_DECISIONS 是否已更新 |
| **Extension层** | NSG Auto-Maintenance 哨兵匹配失败 | `replaceBetween()` 未找到哨兵时清空文件为 0 字节（本会话实际发生） |

**修复方向**：
- 协议层：§二.4 新增"闭包强制检查"——gate_accept complete 前必须验证 3 个文件已更新
- Extension层：`replaceBetween()` 未找到哨兵时追加而非清空；启动时检测空文件→从模板重建

### 🟡 P2: run_experts 专家输出不稳定

**症状**：本会话 4 次 run_experts 调用中 2 次空输出（security/architect），Orion 被迫手动评审。D-2 修复（输出截断检测）部分生效，但模型仍会在某些场景下选择零输出。

**定位方向**：
- 检查子代理 `--no-session` 模式下系统提示词是否正确注入
- 考虑在 runExpert 中增加"空输出自动重试（max 2次）"机制

### 🟡 P2: v2.7.0 遗留增强项（7项）

| ID | 功能 | 说明 |
|----|------|------|
| F5 深度 | 代码级输入净化 | 当前仅基础注入检测，需扩展到完整 OWASP 模式 |
| F7 完整 | spawn 超时 | 已支持可配置超时，需补充超时后清理+重试逻辑 |
| F20 | lockfile 校验 CI 集成 | 脚本已有，需集成到 CI 流水线 |
| F25 | 性能基准测试 | vitest bench 对 atomicWriteJSON/spawn/mapConcurrency |
| F27 | SHA256 完整性校验 | checksum.js 已有，需在 Extension 启动时自动验证 |
| F14 | PROJECT_MEMORY YAML 自动同步 | omni_dag complete/fail 时写入 dag_state 到 YAML frontmatter |
| F17 | API 文档一致性 | Schema 参数与 description 自动校验脚本 |

## 三、引擎整体流程讨论议题

以下为建议讨论方向，由用户设定优先级：

1. **生命周期完整性**：当前流程 META-GATE → PRD → CDL → SPEC → DAG → 执行 → GATE-ACCEPTANCE，各环节是否有遗漏或冗余？
2. **Meta-Orion vs Execution-Orion 边界**：两层分工是否清晰？Meta 重新介入条件是否合理？
3. **专家调度有效性**：13 位专家的激活逻辑、强度匹配、run_experts 工具可靠性
4. **偏差闭环效率**：双轨路由（引擎偏差 vs 测试项目发现）是否真正有效？闭环修正次数是否合理？
5. **跨会话连续性**：checkpoint/restore + NEXT_SESSION_GUIDE 机制的实际体验
6. **v3.0 方向**：是否需要架构级重构？还是继续渐进式加固？

## 四、核心执行原则（不变）

```
Orion = 编排者 + 验收者，不是亲手执行者。

1. 设计 DAG → omni_dag init
2. PRD / SPEC 为强制节点
3. 为每个 REVIEW 节点 dispatch 子代理 → run_experts
4. 检查 dag_suggestion → 非 complete → omni_dag fail → 闭环修正
5. omni_dag complete（必须带 outputs 参数）
6. 熔断保护 → 3 次失败请求用户介入
7. ★ 闭包协议（v2.8.0 新增）：GATE-ACCEPTANCE 前强制验证 3 个记忆文件已更新
```

## 五、新对话启动指令

```
@OMNIPM_SYSTEM_PROMPT.md

你是 Orion v2.7.0。新会话启动。

请读取：
1. PROJECT_MEMORY.md       — 项目状态 + 偏差清单
2. NEXT_SESSION_GUIDE.md   — 本文件
3. OMNIPM_SYSTEM_PROMPT.md — 系统提示词

═══════════════════════════════════════
🎯 本对话目标：
  Step 1: v2.8.0 引擎修复（PROCES-P1 + NSG哨兵修复）
  Step 2: 引擎整体流程讨论（生命周期/专家调度/偏差闭环/v3.0方向）
═══════════════════════════════════════

📊 已就绪资产:
  - v2.7.0 引擎加固 27/27 已交付 (GitHub: fb0e08d)
  - 瑜伽馆 Slice1 ✅ Slice2 ✅ (GitHub: 58c2b65)
  - 97/97 测试通过
  - 引擎偏差: PROCES-P1(打开) + run_experts不稳定(待修复)
```

## 六、版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v2.7.0 | 2026-07-24 | v2.7.0 引擎加固(27/27) + Slice2积分引擎(10/10)；3仓库推送；PROCES-P1偏差记录 |
| v2.6.0 | 2026-07-23 | Slice1 交付 + DEV-10修复 + PRD/SPEC阶段固化 |
| v2.5.0 | 2026-07-22 | DEV-9 跨平台适配器 + DEV-7 NSG Auto-Maintenance |
