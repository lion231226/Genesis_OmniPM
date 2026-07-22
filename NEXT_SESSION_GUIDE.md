# OmniPM 新对话引导词 v2.3.1

> **用途**：将此文件内容粘贴为新对话的第一条消息。
> **当前版本**：v2.3.1
> **当前进度**：任务3/7 ✅ + D-1 ✅ + D-2 ✅ + agent-reach ✅ | 下一任务 → 任务#4
> **下一任务**：Web管理后台会员管理CRUD（GATE硬阻断 + 专家评审质量验证）
> **agent-reach**：v1.5.0 已安装，11/15渠道可用（Exa搜索/GitHub/Twitter/Reddit/B站/小红书等）

---

## 一、项目概要

**OmniPM v2.3.1** — Context Engineering 多 Agent 编排引擎。

- **Meta-Orion**（Context Compiler）：分析项目 → 生成 DAG
- **Execution-Orion**（Context Runtime）：按 DAG 执行 → 调度专家 → 闭环修正
- **Extension**：`run_experts`（单/并行/链式）+ `omni_dag`（DAG 状态管理）
- **13 位专家 Agent v2.3.0**：每位含审查清单 + 质量标准(P0/P1/P2) + 协作提示
- **跨平台运行时**：ARI 抽象层 + Pi Adapter + Mock Runtime + 平台配置表
- **84 个单元测试**：mock(23) + dag-utils(41) + chain-executor(17) + source-integrity(3)
- **GitHub**：`lion231226/Genesis_OmniPM` + `lion231226/omnipm-orion` + `lion231226/yoga-studio`

## 二、版本能力总览

| 能力 | v2.0.0 | v2.3.1 |
|------|--------|--------|
| 自编排 DAG | ✅ | ✅ |
| 13 专家子代理 | ✅ | ✅ 增强版（审查清单+质量标准） |
| outputs 验证 | ❌ | ✅ (P0-1) |
| GATE 硬阻断 | ❌ | ✅ (P0-3) |
| 空输出检测 | ❌ | ✅ (v2.2.1) |
| 输出截断检测 | ❌ | ✅ 🆕 (v2.3.1 D-2) |
| stopReason 暴露 | ❌ | ✅ 🆕 (v2.3.1 D-2) |
| 跨平台 ARI | ❌ | ✅ (P2-2) |
| Mock Runtime | ❌ | ✅ |
| 单元测试 | ❌ | ✅ **84 tests** 🆕 |
| CI/CD | ❌ | ✅ GitHub Actions |
| CDL 能力搜索 | ❌ | ✅ agent-reach v1.5.0（11/15渠道）🆕 |
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
| Web 管理后台会员管理页面 | 2-4 |
| 小程序消息推送功能 | 3-5 |
| 后端单元测试补充 | 2-3 |
| 积分兑换商城逻辑 | 3-6 |

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
│  4. 记录偏差 → ★ 双轨路由（§4.4）→ 分类 → 修复        │
│  5. 更新对应项目的 PROJECT_MEMORY.md                    │
└─────────────────────────────────────────────────────┘
```

### 4.3 验证记录模板

每个原子任务完成后，Orion **必须判断偏差归属**（§4.4），然后写入对应文件：

**OmniPM 引擎偏差 → `PROJECT_MEMORY.md`（引擎项目根目录）：**

```yaml
validation_log:
  - task: "任务描述"
    date: "日期"
    dag_nodes: N
    checks:
      meta_orion_analysis: "✅/⚠️/❌"
      dag_structure: "✅/⚠️/❌"
      expert_quality: "✅/⚠️/❌"
      outputs_verification: "✅/⚠️/❌"
      gate_mechanism: "✅/⚠️/❌"
      correction_loop: "✅/⚠️/❌"
      dev_selfcheck: "✅/⚠️/❌"
    deviations:
      - {check: "xxx", expected: "设计预期", actual: "实际表现", severity: "P0|P1|P2", target: "omnipm"}
    fixes_applied:
      - "修复描述"
    engine_deviations_open:
      - {id: "D-N", severity: "...", desc: "...", status: "待修复|已关闭"}
    verdict: "PASS|PASS_WITH_FIXES|FAIL"
```

**测试项目业务发现 → `project/PROJECT_MEMORY.md`（测试项目目录）：**

```yaml
validation_log:
  - task: "任务描述"
    date: "日期"
    executed_by: "OmniPM v2.3.x Orion"
    findings:
      - {level: "P0|P1|P2", desc: "...", source: "专家评审|Orion审查|手动分析"}
    fixes_applied:
      - "修复描述"
```

### 4.4 双轨偏差路由规则（★ v2.3.1 新增）

**每条偏差必须标注 `target` 字段，Orion 据此自动写入正确文件。**

| target | 判定标准 | 写入文件 | 示例 |
|--------|----------|----------|------|
| **omnipm** | OmniPM 工具/流程/Extension 未按**自身设计文档**运行 | 引擎 `PROJECT_MEMORY.md` | `run_experts` 空输出、DAG 结构验证失败、GATE 未暂停 |
| **test-project** | OmniPM **正常运行**产出的对测试项目代码/设计的发现 | `project/PROJECT_MEMORY.md` | 密钥硬编码、SQL注入风险、缺少错误处理 |

**路由决策树：**

```
发现偏差
  ├─ 根因是 OmniPM 工具/流程未按设计运行？
  │   → target: omnipm
  │   → 写入引擎 PROJECT_MEMORY.md engine_deviations_open
  ├─ 根因是测试项目代码/设计质量问题？
  │   → target: test-project
  │   → 写入 project/PROJECT_MEMORY.md findings
  └─ 无法判断？
      → target: omnipm（默认，宁可多记不可漏记）
```

### 4.5 偏差严重等级

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
- CDL 搜索不可跳过（铁律 2b）：META-GATE 确认后使用 `agent-reach` 完成双生态搜索
- REVIEW 节点出口必须检查 dag_suggestion（§2.3.1）
- DAG 生成前检查需求覆盖率（§1.6-B）
- **声称"完成"前必须验证文件确实存在**（防止虚假汇报）
- **每任务结束时必须填写验证记录，按双轨路由写入正确文件**
- **一次对话只做一个原子任务**
- **★ 偏差双轨路由（v2.3.1）：引擎偏差 → PROJECT_MEMORY.md，业务发现 → project/PROJECT_MEMORY.md**

## 六、新对话启动指令

### 6.1 原子任务（测试验证）

```
@OMNIPM_SYSTEM_PROMPT.md

你是 Orion v2.3.1。新会话启动。

请读取：
1. PROJECT_MEMORY.md       — 项目状态 + 验证记录（引擎偏差全部已关闭）
2. NEXT_SESSION_GUIDE.md   — 本文件（测试验证协议）
3. OMNIPM_SYSTEM_PROMPT.md — 系统提示词

═══════════════════════════════════════
本次原子任务：[用户指定一个具体任务]
═══════════════════════════════════════

执行流程：
1. Meta-Orion 分析任务 → 输出 META-GATE
2. 用户确认 → CDL双生态搜索（agent-reach）→ 生成 DAG → GATE-DESIGN
3. 按 DAG 逐节点执行，每节点完成后立即对照 §四 验证清单
4. ★ 记录偏差 → 判定归属（引擎 vs 测试项目）→ 双轨写入对应文件
5. 更新 PROJECT_MEMORY.md 验证记录（引擎）+ project/PROJECT_MEMORY.md（测试项目）
6. GATE-ACCEPTANCE
7. ★ 闭包流程（§八）：GATE-ACCEPTANCE 确认后自动执行

关键提醒：
- 一次对话只做这一个任务，不要扩展到其他范围
- 每个节点完成必须带 outputs 验证
- run_experts 输出中关注 stopReason（⏹max_tokens 表示截断 → 自动重试）
- 专家空输出 → 重试（v2.2.1）；截断 → 自动 retry（v2.3.1 D-2）
- agent-reach 已就绪（11/15渠道），CDL 搜索可直接使用
- 发现问题立即记录，按双轨路由写入正确文件
- P0 立即修复（优先修复 OmniPM 引擎偏差）
```

### 6.2 引擎偏差修复（★ v2.3.1 新增）

```
@OMNIPM_SYSTEM_PROMPT.md

你是 Orion v2.3.1。新会话启动。引擎偏差修复模式。

请读取：
1. PROJECT_MEMORY.md       — 定位 engine_deviations_open 中的待修复项
2. NEXT_SESSION_GUIDE.md   — 本文件（§七 队列中的 🔧 引擎修复任务）
3. OMNIPM_SYSTEM_PROMPT.md — 系统提示词

═══════════════════════════════════════
本次引擎修复：[偏差ID + 标题]
═══════════════════════════════════════

执行流程：
1. 读取 PROJECT_MEMORY.md 偏差记录的 root_cause → 理解问题
2. 调查 omnipm-orion/extensions/omnipm/ 源码定位根本原因
3. 设计修复方案 → 用户确认
4. 实施修复 + 验证（运行 npm test 确保无回归，当前84个测试全部通过）
5. 更新 PROJECT_MEMORY.md：偏差 status → 已关闭，记录 fix + prevention
6. 如有新预防措施，更新对应测试
7. 闭包流程（§八）
```

## 七、推荐原子任务队列

按优先级排列，每次选一个在新对话中执行：

| # | 任务 | 验证重点 |
|---|------|---------|
| 1 | ~~后端登录/注册模块完善~~ ✅ | outputs验证 + GATE门控 + 专家协作 → PASS_WITH_FIXES |
| 2 | ~~修复OmniPM引擎偏差D-1~~ ✅ | ~~Extension源码腐败 → \\n转义修复 → 三级预防固化~~ → 已关闭 |
| 3 | ~~小程序首页课表展示~~ ✅ | ~~前后端协作 + DEVELOP自检~~ → PASS_WITH_FIXES |
| 🔧 | ~~修复引擎偏差D-2~~ ✅ | ~~run_experts输出截断 → 3层修复+10新测试~~ → 已关闭 |
| 🔧 | ~~安装agent-reach CLI~~ ✅ | ~~v1.5.0 + Exa搜索配置 → 11/15渠道可用~~ → 已安装 |
| **4 🔥** | **Web 管理后台会员管理 CRUD** | **GATE硬阻断 + DEVELOP自检 + run_experts评审质量（D-2修复后首次验证）** |
| 5 | 后端单元测试补充 | 代码生成质量 + 测试策略 |
| 6 | 消息推送模板+定时任务 | 工作流复杂度 + 闭环修正 |
| 7 | 积分兑换商城逻辑 | 并发安全 + 安全专家评审 |

> **引擎偏差全部已关闭**：
> - D-1 ✅ `\n` 转义腐败 → Extension 加载失败 → 子进程空输出
> - D-2 ✅ `run_experts` 输出截断 → getFinalOutput多轮拼接 + stopReason暴露 + 截断检测 → 84测试通过
>
> **agent-reach**：v1.5.0 已安装（pip install GitHub main.zip）。运行 `agent-reach doctor --json` 可查看全部15个渠道状态（当前11/15可用）。

> **下一会话任务：任务#4 — Web管理后台会员管理CRUD。** 这是 D-2 修复后首次使用 run_experts，重点关注：
> - `stopReason` 字段是否正确出现在评审输出中（⏹end_turn / ⏹max_tokens）
> - `getFinalOutput` 拼接后的多轮分析是否完整
> - 如有截断，`DAG_SUGGESTION` 是否自动触发 `retry(P1)`

---

## 八、闭包流程（★ v2.3.0 新增 — 任务完成后自动执行）

> **每次 GATE-ACCEPTANCE 确认后，Orion 必须自动执行闭包，不得跳过。**

### 8.1 执行时机

```
GATE-ACCEPTANCE 用户确认 → 立即触发闭包
```

### 8.2 闭包步骤

```
┌─────────────────────────────────────────────────────┐
│  1. 收集变更文件 → git status 确认                      │
│  2. git add -A（仅当前项目相关文件）                     │
│  3. git commit -m "task(#N): 任务描述 [verdict]"       │
│     格式: task(#任务编号): 简短描述 [PASS|PASS_WITH_FIXES|FAIL]
│  4. git push origin main                              │
│  5. 更新 NEXT_SESSION_GUIDE.md：                        │
│     ├── 头部"当前进度"更新                               │
│     ├── 头部"下一任务"更新                               │
│     ├── §七 已完成任务标记 ~~删除线~~ + ✅                   │
│     └── §七 下一任务高亮（🔥）                            │
│  6. git add NEXT_SESSION_GUIDE.md PROJECT_MEMORY.md     │
│  7. git commit -m "guide: 任务#N完成 → 指向任务#N+1"    │
│  8. git push origin main                               │
│  9. 输出闭包摘要（commit hash + 下一任务提示）            │
└─────────────────────────────────────────────────────┘
```

### 8.3 Commit 规范

| Commit 类型 | 格式 | 示例 |
|------------|------|------|
| 任务提交 | `task(#N): 描述 [VERDICT]` | `task(#1): 后端登录/注册 [PASS_WITH_FIXES]` |
| 引导词更新 | `guide: 任务#N完成 → 指向任务#N+1` | `guide: 任务#1完成 → 指向任务#2` |
| 偏差修复 | `fix(D-N): 修复描述` | `fix(D-2): run_experts输出截断修复` |

### 8.4 闭包验证清单

```
☐ git push 成功（无 rejected 错误）
☐ NEXT_SESSION_GUIDE.md 头部指向正确下一任务
☐ §七 任务队列已完成项有 ~~删除线~~ + ✅
☐ 下一任务有 🔥 标记
☐ PROJECT_MEMORY.md 含完整 validation_log
```

---

> **一句话**：OmniPM v2.3.1 引擎就绪，84测试通过，agent-reach 搜索可用，两个引擎偏差已关闭。下一站：任务#4 Web管理后台会员管理CRUD — 验证 D-2 修复效果。
