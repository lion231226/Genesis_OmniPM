# PI Agent 特有能力与限制速查

> 版本：1.0 | 替代 MODEL_PROFILES.md（v0.3.0）| 专用于 PI 运行环境

---

## 一、PI Agent 基本信息

| 属性 | 值 |
|------|-----|
| **仓库** | earendil-works/pi |
| **Stars** | 74.2k+ |
| **Releases** | 247+ |
| **最新版本** | v0.80.10 |
| **技术栈** | TypeScript 93.3% + JavaScript 6.0% |
| **License** | MIT |
| **核心包** | `pi-coding-agent` / `pi-agent-core` / `pi-ai` / `pi-tui` |

### 核心包职责速查

| 包名 | 职责 | 对 OmniPM 的影响 |
|------|------|------------------|
| `pi-coding-agent` | 编码 Agent 主入口，CLI 集成 | OmniPM 的运行宿主 |
| `pi-agent-core` | 内部事件循环、hook 系统、状态机 | **不可触及**（见第四章） |
| `pi-ai` | 模型抽象层，提供商无关接口 | 简化 OmniPM 模型适配——仅需 Anthropic 路径 |
| `pi-tui` | 差分终端 UI 渲染引擎 | 输出格式需适配差分渲染机制 |

---

## 二、PI 关键特征与 OmniPM 适配分析

| # | PI 特征 | 特征描述 | 对 OmniPM 的影响 | 适配策略 |
|---|---------|----------|------------------|----------|
| 1 | **AGENTS.md 原生支持** | PI 启动时自动扫描项目根目录 `AGENTS.md` 并加载为系统指令 | OmniPM 可实现**零配置自动加载**——将提示词写入 `AGENTS.md` 即可自动生效，无需用户手动激活 | 确保 `CLAUDE.md` 或 `AGENTS.md` 中正确引用 `@OMNIPM_SYSTEM_PROMPT.md` |
| 2 | **无内置权限系统** | PI 本身不提供文件读写权限控制、命令执行沙箱等安全机制 | OmniPM 安全层（第二章）成为 **核心防线**，所有输入净化、记忆文件门禁、代码生成安全门禁均依赖 OmniPM 自身执行 | 强化 OmniPM 安全协议执行力度；`security_scan_depth: DEEP` |
| 3 | **ReAct 事件循环** | Think → Act → Observe 循环，每轮包含思考-行动-观察三阶段 | 与 OmniPM 状态机（§〇）**天然匹配**：每个状态转换对应一次 Act，状态心跳对应 Observe | 状态追踪频率设为 `HIGH`，确保循环中不丢失状态上下文 |
| 4 | **提供商无关（pi-ai）** | 通过 `pi-ai` 抽象层屏蔽不同模型 API 差异 | OmniPM 模型适配大幅简化——当前环境仅需维护 **Anthropic 路径**，无需多提供商兼容 | 移除原 MODEL_PROFILES.md 中 GPT-4o/Gemini/DeepSeek 的适配参数 |
| 5 | **自扩展能力** | Agent 在运行时可修改自身配置文件（如 `settings.json`、`CLAUDE.md`） | OmniPM 需防范 Agent 意外修改安全相关配置 | 记忆文件门禁（§2.2）覆盖 `CLAUDE.md`；关键配置加 `# @lock` 注释 |
| 6 | **差分 TUI 渲染** | `pi-tui` 采用增量渲染——仅重绘变化的终端区域，非全量刷新 | OmniPM 输出格式需适配：避免依赖全屏重绘的输出模式；进度条和心跳更新使用**单行更新**而非多行块 | `output_format_verbosity: FULL（TUI 适配）`；心跳单行 ≤120 字符 |

### 2.1 AGENTS.md 加载机制详解

```
PI 启动时的文件发现优先级：
  1. ./AGENTS.md          ← 项目级，最高优先级
  2. ./CLAUDE.md          ← 兼容性回退
  3. ~/.claude/CLAUDE.md  ← 用户全局
  4. ~/.claude/AGENTS.md  ← 用户全局（PI 原生）
```

> **OmniPM 利用方式**：在项目根目录 `CLAUDE.md` 中使用 `@OMNIPM_SYSTEM_PROMPT.md` 语法，PI 会自动解析 `@` 引用并加载目标文件。OmniPM 模块加载协议（§九）可映射为 `@modules/xxx.md` 语法。

### 2.2 ReAct 循环与 OmniPM 状态机对照

| ReAct 阶段 | OmniPM 对应 | 触发机制 |
|-----------|-------------|----------|
| **Think** | 状态评估 + 决策块输出 | 每个状态入口触发 |
| **Act** | 状态机转换执行（Step A→E） | 状态迁移后置动作 |
| **Observe** | `[STEP_X_COMPLETE]` 确认块 + 进度心跳 | 每个步骤出口触发 |

---

## 三、PI 可访问机制（OmniPM 可利用）

以下 PI 公开接口/机制可被 OmniPM 直接利用，无需穿透 `pi-agent-core` 内部。

| 机制 | 类型 | 说明 | OmniPM 利用方式 |
|------|------|------|-----------------|
| **steering 消息** | 运行时指令 | 向正在运行的 Agent 发送控制指令，改变其行为方向 | **GATE 确认块**利用此机制暂停自动推进——在 GATE 节点输出 `[GATE]` 标记块并等待用户 steering 输入 |
| **terminate 信号** | 生命周期信号 | Agent 完成当前任务后的终止通知 | **Step 完成信号**：每个 `[STEP_X_COMPLETE]` 块可附带 terminate 语义，通知上层步骤已完成 |
| **sessionId** | 会话标识 | 每个 PI 会话的唯一标识符，在整个会话生命周期内不变 | **SESSION_CONTEXT 追踪**：将 `sessionId` 写入 SESSION_CONTEXT 记录的来源标记中，实现会话级审计 |
| **AGENTS.md @filename 语法** | 文件引用 | `@path/to/file.md` 语法指示 PI 加载外部文件为上下文 | **模块加载**：映射 OmniPM 模块加载协议（§九），如 `@modules/router_logic.md` 等效于 `@LOAD:router_logic` |
| **slash commands** | 内置命令 | `/help`、`/clear`、`/config` 等内置斜杠命令 | 可提示用户在特定场景使用对应命令（如 `/config` 调整设置） |
| **hook 系统（用户侧）** | 可配置事件钩子 | 用户在 `settings.json` 中配置的 hooks（如 `PostToolUse`、`Notification`） | 可在交付阶段（Step E）生成推荐的 hook 配置，增强 CI/CD 集成 |

### 3.1 steering 消息协议

```
OmniPM → PI steering 通道：
  [GATE] GATE-REQUIREMENT — 需求确认
  等待用户输入 → 用户输入作为 steering 消息传递给 Agent
  Agent 解析确认信号（§1.4）→ 执行状态迁移
```

### 3.2 sessionId 集成

```yaml
# SESSION_CONTEXT 记录格式扩展
- [14:30:00] [来源: Agent决策 | sessionId: abc123-def456] 完成 Step A 顶层设计
- [14:32:00] [来源: 用户输入 | sessionId: abc123-def456] GATE-DESIGN 确认通过
```

---

## 四、PI 不可访问机制（OmniPM 无法触及）

以下为 `pi-agent-core` 内部 API，**OmniPM 不可访问**，不得在提示词中尝试调用或依赖。

| 机制 | 所属模块 | 说明 | 替代方案 |
|------|----------|------|----------|
| **beforeToolCall hook** | `pi-agent-core` 内部 | 工具调用前拦截钩子，用于修改参数或阻断调用 | 使用 OmniPM 自身的安全门禁（§2.3）在代码生成阶段做等效检查 |
| **afterToolCall hook** | `pi-agent-core` 内部 | 工具调用后拦截钩子，用于结果转换或日志记录 | 使用 OmniPM 的 CHECKPOINT 写入机制记录关键操作后状态 |
| **transformContext** | `pi-agent-core` 内部 | 上下文转换函数，在每轮 ReAct 循环前修改上下文窗口内容 | 通过 OmniPM 的状态心跳和进度块（§4.2）显式管理上下文，不依赖隐式转换 |
| **agent-core 内部状态管理** | `pi-agent-core` 内部 | Agent 生命周期状态、工具注册表、权限解析器 | 使用 OmniPM 自身的状态机（§〇）追踪项目状态，不依赖 PI 内部状态 |
| **权限解析器** | `pi-agent-core` 内部 | 工具权限的 grant/deny 决策逻辑 | 依赖 OmniPM 安全协议（§二）的自有权限控制 |
| **MCP 连接管理** | `pi-agent-core` 内部 | MCP 服务器的生命周期管理（启动/停止/健康检查） | 无替代——MCP 服务器状态由 PI 自行管理 |

### 4.1 边界红线

```
┌──────────────────────────────────────────────┐
│  OmniPM 可触及区域                            │
│  · AGENTS.md / CLAUDE.md 文件系统              │
│  · steering 消息                              │
│  · terminate 信号                             │
│  · sessionId（只读）                           │
│  · hook 系统（settings.json，用户侧）           │
│  · 工作区文件系统                              │
├──────────────────────────────────────────────┤
│  === 边界红线：以下不可触及 ===                 │
├──────────────────────────────────────────────┤
│  pi-agent-core 内部                           │
│  · beforeToolCall / afterToolCall             │
│  · transformContext                           │
│  · 内部状态管理                                │
│  · 权限解析器                                  │
│  · MCP 连接管理                                │
└──────────────────────────────────────────────┘
```

---

## 五、PI 容器化方案

| 方案 | 类型 | 隔离级别 | 适用场景 | 对 OmniPM 的影响 |
|------|------|----------|----------|------------------|
| **Gondolin** | 微 VM（MicroVM） | 强隔离，独立内核 | 生产部署、不可信代码执行 | 最高安全级别；OmniPM 安全门禁可适当放宽——依赖 Gondolin 的 OS 级隔离 |
| **Plain Docker** | 容器 | 中等隔离，共享内核 | 标准开发/测试环境 | OmniPM 安全门禁正常执行；容器内文件系统映射需在 Step E 部署手册中说明 |
| **OpenShell** | 原生 Shell | 无额外隔离 | 本地开发、快速迭代 | OmniPM 安全门禁必须严格 (`security_scan_depth: DEEP`)；命令执行确认协议（§2.3-d）不可跳过 |

### 5.1 容器化方案选择决策树

```
用户项目需要什么运行环境？
├── 需要执行不可信第三方代码 → Gondolin（微VM）
├── 标准 Web 应用/服务部署 → Plain Docker
└── 本地原型开发/CLI 工具 → OpenShell
```

---

## 六、PI 供应链安全策略

PI 自身采用以下供应链安全措施，OmniPM 在 Step C 依赖审查（§2.3-c）中应**对齐同等标准**。

| 策略 | 说明 | OmniPM 对齐要求 |
|------|------|----------------|
| **exact pinning** | 所有依赖锁定精确版本号（`"1.2.3"` 而非 `"^1.2.3"`） | Step C 生成 `package.json` 时使用精确版本号 |
| **--ignore-scripts** | npm install 时禁用生命周期脚本执行，防止安装阶段代码执行攻击 | Step E 部署手册中 `npm ci` 命令使用 `--ignore-scripts` 参数 |
| **npm-shrinkwrap** | 生成 `npm-shrinkwrap.json` 锁定整个依赖树（含子依赖） | Step E 交付物包含 `npm-shrinkwrap.json` 或等效锁定文件 |
| **CI audit** | CI 流水线中运行 `npm audit` / `pip audit`，阻断已知漏洞依赖 | Step D 测试阶段执行依赖安全审计（§3.3 Step D-6） |

### 6.1 依赖审查扩展清单

```
OmniPM 依赖审查（§2.3-c）+ PI 供应链对齐：
  - 包名: <name>
  - 版本: <exact version（精确锁定）>
  - 用途: <one-line description>
  - 许可证: <license（检查是否与 MIT 兼容）>
  - 已知漏洞: <npm audit / pip audit 结果>
  - 安装脚本风险: <是否包含 preinstall/postinstall 脚本>
  请确认是否安装？[确认/拒绝]
```

---

## 七、OmniPM 适配参数（仅 PI 环境）

以下参数专为 PI 运行环境配置。相比原 MODEL_PROFILES.md 的多模型适配表，PI 环境仅需维护单一配置。

```yaml
# OmniPM 适配参数 —— PI 运行环境专用
pi_profile:
  # === 门控协议 ===
  gate_confirm_insist: STRICT
  # 说明：PI 无内置权限系统，GATE 确认是唯一的人机交互安全阀。
  # 严格执行统一确认信号字典（§1.4），不得将非"确认"开头的输入误判为确认。

  # === 状态追踪 ===
  state_tracking_frequency: HIGH
  # 说明：ReAct 循环中每轮 Think-Act-Observe 约消耗 2-5 秒，
  # 状态心跳需在每个子步骤后更新，防止循环上下文漂移。
  # 心跳格式：单行 ≤120 字符（适配 pi-tui 差分渲染）。

  # === 输出格式 ===
  output_format_verbosity: FULL
  # 说明：保持完整输出，但需适配 pi-tui 差分渲染——
  # · 进度条和心跳使用单行更新，避免多行块重复渲染
  # · 大段文本（设计报告、评审意见）使用可折叠的 DOC_BLOCK 格式
  # · 代码块使用标准的 ```language:path 格式，pi-tui 原生支持语法高亮

  # === 安全检查 ===
  security_scan_depth: DEEP
  # 说明：PI 无内置沙箱（除 Gondolin 场景外），OmniPM 安全门禁必须执行全部 4 项：
  # 1. 禁止函数清单扫描
  # 2. SQL 注入防护检查
  # 3. 依赖审查确认流
  # 4. 命令执行前确认

  # === 已知适配项 ===
  known_pi_specifics:
    - "AGENTS.md 零配置加载：提示词 @ 引用由 PI 自动解析"
    - "pi-tui 差分渲染：避免依赖全屏重绘的输出模式"
    - "无内置权限系统：OmniPM 安全层是唯一防线"
    - "Gondolin 微VM：最强隔离模式下可适当精简安全门禁"
    - "ReAct 循环匹配：状态心跳在 Observe 阶段输出，确保不被 Think 覆盖"
```

### 7.1 适配参数对比（原多模型 vs PI 环境）

| 参数 | 原多模型配置 | PI 环境配置 | 变更理由 |
|------|-------------|------------|----------|
| `gate_confirm_insist` | STRICT（所有模型） | STRICT | 不变——GATE 确认始终是硬性要求 |
| `state_tracking_frequency` | NORMAL（Claude）/ HIGH（其他） | **HIGH** | PI ReAct 循环需更高频率防止状态丢失 |
| `output_format_verbosity` | FULL（多数）/ COMPACT（Gemini） | **FULL（TUI 适配）** | 保持完整性但适配差分渲染 |
| `security_scan_depth` | DEEP（Claude）/ STANDARD（其他） | **DEEP** | PI 无内置沙箱，OmniPM 安全层是核心防线 |
| `multi_expert_parallel_hint` | null（Claude）/ 显式串行指令（其他） | `null` | PI 环境支持并行生成，无需串行约束 |

---

## 八、TUI 输出适配细则

为适配 `pi-tui` 的差分渲染机制，OmniPM 输出遵循以下细则：

### 8.1 推荐模式

| 输出类型 | 推荐格式 | 理由 |
|----------|----------|------|
| 进度条 | 单行 `━━━...━━━ 80%` | 差分渲染仅更新一行 |
| 心跳更新 | 单行 `[心跳] 正在... 3/8 | ✅ ✅ ⏳` ≤120 字符 | 同上，连续多轮可逐行覆盖 |
| 确认块（GATE） | 固定边框块 ≤30 行 | 静态内容，渲染一次后缓存 |
| 设计报告 | DOC_BLOCK 格式，含摘要段 | 摘要段可快速扫描，详情区按需展开 |
| 代码块 | ` ```language:path ` | pi-tui 原生语法高亮，无需额外适配 |
| 决策块 | 表格（≤6 列） | pi-tui 对 Markdown 表格支持良好 |

### 8.2 避免模式

| 输出类型 | 问题 | 替代方案 |
|----------|------|----------|
| 多行重复进度条 | 每轮重绘相同边框造成视觉抖动 | 使用单行进度指示器，仅在百分比变化时更新 |
| 全屏 ASCII Art | 差分渲染无法优化，每次全量刷新 | 使用简洁的 Unicode 符号替代 |
| 无摘要的超长报告 | 用户需滚动查找关键信息 | 始终前置 3 句以内摘要段 |
| 嵌套过深的代码块 | pi-tui 缩进渲染可能错位 | 代码块置于顶层，避免 >3 层嵌套 |

---

## 九、版本兼容性矩阵

| PI 版本 | OmniPM 版本 | 兼容状态 | 备注 |
|---------|------------|----------|------|
| v0.80.x | v1.0-MVP | ✅ 完全兼容 | 当前组合 |
| v0.70.x - v0.79.x | v1.0-MVP | ⚠️ 部分兼容 | AGENTS.md `@` 语法可能需显式路径 |
| v0.60.x 及更早 | v1.0-MVP | ❌ 不推荐 | 缺少差分 TUI 渲染，输出格式可能异常 |
| v0.80.x | v0.3.0-PhaseII | ⚠️ 降级兼容 | 混合型项目交织矩阵（§3.3.1）可能不稳定 |

> ✅ 完全兼容 | ⚠️ 部分兼容（需降级处理） | ❌ 已知问题

---

## 十、速查卡片

```
┌─ PI Agent 关键参数速查 ─────────────────────┐
│                                                │
│  版本: v0.80.10  ·  Stars: 74.2k+              │
│  仓库: earendil-works/pi  ·  License: MIT      │
│  核心包: pi-coding-agent / pi-agent-core       │
│          pi-ai / pi-tui                        │
│                                                │
│  可访问:                                       │
│    ✅ AGENTS.md @ 引用（模块加载）              │
│    ✅ steering 消息（GATE 确认）                │
│    ✅ terminate 信号（Step 完成）               │
│    ✅ sessionId（SESSION_CONTEXT）              │
│    ✅ hook 系统（settings.json，用户侧）        │
│                                                │
│  不可访问（pi-agent-core 内部）:                │
│    ❌ beforeToolCall / afterToolCall            │
│    ❌ transformContext                          │
│    ❌ 内部状态管理 / 权限解析器                  │
│                                                │
│  容器化: Gondolin微VM / Docker / OpenShell     │
│  供应链: exact pinning / --ignore-scripts      │
│          npm-shrinkwrap / CI audit             │
│                                                │
│  适配参数:                                      │
│    gate_confirm_insist: STRICT                 │
│    state_tracking_frequency: HIGH              │
│    output_format_verbosity: FULL (TUI适配)     │
│    security_scan_depth: DEEP                   │
│                                                │
└────────────────────────────────────────────────┘
```
