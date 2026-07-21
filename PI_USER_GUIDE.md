# OmniPM PI Agent 用户指南

> 版本：v1.0.0-PI | 适用 PI Agent（Claude Code）运行时

---

## 一、快速开始

### 1.1 什么是 OmniPM

OmniPM 是一套高度结构化的系统提示词，驱动 PI Agent 化身项目总负责人 **Orion**，带领 13 位虚拟专家团队完成 5 种项目类型的全生命周期交付。你只需输入一个项目想法，Orion 自动完成需求对齐 → 顶层设计 → 多专家评审 → 分阶段开发 → 测试交付，全程仅需在关键节点确认。

**v1.0.0-PI 核心能力**：
- 5 种项目类型智能路由（开发型 / 课程教学型 / 方案策划型 / 图文内容型 / 音视频型）
- 13 位虚拟专家按需评审
- CDL 能力自发现层 — 自动搜索推荐最优工具链（Skill/MCP/Subagent/CLI）
- PI Agent 原生 Subagent 并行执行
- 绿地/棕地双入口模式

### 1.2 三步安装

将 OmniPM 安装到**任意新项目或现有项目**中：

```
1. 复制以下文件到你的项目根目录：
   - OMNIPM_SYSTEM_PROMPT.md（主提示词，16 章）
   - modules/（整个目录，含 14 个模块文件 + workflows/ + weaving/）
   - AGENTS.md（PI Agent 引导文件）

2. 重新打开项目或启动新会话 → PI Agent 自动加载 OmniPM

3. 输入项目想法 → Orion 自动接管
```

### 1.3 安装后效果

启动新会话后，PI Agent 自动读取 `AGENTS.md` → `@OMNIPM_SYSTEM_PROMPT.md`，化身 Orion。输入任何项目想法即触发：

- 智能路由自动识别项目类型
- 需求对齐 5 轮澄清循环
- 13 位虚拟专家按需评审
- 完整 Step A→E 工作流自动推进
- CDL 自动搜索推荐外部能力

> **日常开发不受影响**：Orion 的状态机从 IDLE 开始，只有你提出项目想法时才触发完整流程。日常的"改个 bug""写个测试"等操作照常进行。

---

## 二、绿地模式 vs 棕地模式

### 2.1 绿地模式（全新项目）

适用于从零开始的新项目。Orion 走完整流程：

```
IDLE → 需求对齐 → 阶段规划 → Step A 设计 → Step B 评审 → Step C 开发 → Step D 测试 → Step E 交付
```

**首次启动**：
```
你好，我是 Orion，您的项目总负责人兼系统架构师。
请描述您想要开发的项目。
```

### 2.2 棕地模式（现有项目增强）

适用于已有代码库但需要系统化重构/增强的项目。Orion 检测到 `PROJECT_MEMORY.md` 后进入棕地模式：

1. **盘点阶段**：扫描现有代码结构、识别技术栈、生成项目全景图
2. **缺口分析**：对比 OmniPM 设计维度找出薄弱环节
3. **增强规划**：仅对缺口维度执行补充设计和评审

**触发方式**：在已有项目中启动 OmniPM 会话，Orion 自动检测并询问：
> "检测到现有项目，代码规模约 X 文件 / Y 行。是否进入棕地增强模式？"

---

## 三、CDL 能力自发现

### 3.1 什么是 CDL

CDL（Capability Discovery Layer）是 v1.0.0-PI 新增的能力自发现机制。在 GATE-REQUIREMENT 确认后自动触发，搜索 PI + GitHub 双生态，推荐匹配的 Skill/MCP/Subagent/CLI 工具。

### 3.2 工作流程

```
GATE-REQUIREMENT 确认
    → PROJECT_PANORAMA.md 生成
    → CDL 搜索（PI 生态 + GitHub 生态）
    → Q-Score 评分 + 一票否决
    → 推荐清单 → 你确认 → 自动安装
```

### 3.3 推荐类型

| 能力类型 | 说明 | 示例 |
|----------|------|------|
| Skill | PI Agent 专业技能包 | supabase/agent-skills, frontend-design |
| MCP | Model Context Protocol 服务 | supabase, playwright, tokensave |
| Subagent | 可独立运行的子代理 | code-review, Plan |
| CLI 工具 | 命令行开发辅助 | supabase CLI, vercel CLI |
| GitHub Actions | CI/CD 工作流模板 | deploy, test, build |
| Dev Containers | 预配置开发环境 | `.devcontainer/` |

### 3.4 安全机制

- **Q-Score 三级裁决**：≥75 自动通过 / 50-74 人工确认 / <50 自动拒绝
- **8 项一票否决**：已知 CVE、不兼容 License、12 个月无更新等
- **安装安全**：npm 默认 `--ignore-scripts`，生命周期脚本需二次确认

### 3.5 裸奔模式

跳过 CDL 搜索，仅使用已加载工具链：
- 用户声明"不搜索能力"
- 或 Agent 检测到网络不可用
- 设置 `CDL_MODE=baremetal`

---

## 四、交互协议速查

### 4.1 GATE 节点

Orion 在 3 个关键节点暂停等待你确认：

| GATE | 触发时机 | 确认后进入 |
|------|----------|-----------|
| GATE-REQUIREMENT | 需求对齐完成 | 阶段规划 |
| GATE-DESIGN | 设计 + 评审完成 | 开发实现 |
| GATE-ACCEPTANCE | 交付物就绪 | 项目完成 |

### 4.2 确认信号

| 你的回复 | 效果 |
|----------|------|
| "确认" / "确认无误" / "确认进入下一阶段" | ✅ 通过 |
| "可以" / "没问题" / "OK" / "好的" | ⚠️ 二次确认："您的意思是需求已确认完毕？[是/否]" |
| "可以但..." / "看起来不错不过..." | ❌ 未确认，追问澄清 |

### 4.3 变更流程

- **非紧急变更**：在 GATE 节点处提出，登记后统一处理
- **紧急变更（仅安全级）**：Orion 暂停当前任务 → 影响分析 → 你二次确认 → 回退执行

### 4.4 回退

随时可执行：
```
回退到阶段 N
```
Orion 归档当前文件 → 更新检查点 → 输出进度损失估算。

---

## 五、项目类型与专家矩阵

### 5.1 5 种项目类型

| 类型 | 典型场景 | 特色专家 |
|------|----------|----------|
| **开发型** | Web 应用、API、CLI 工具、移动 App | 系统架构师、安全专家 |
| **课程教学型** | 在线课程、培训方案、学习路径 | 教学设计专家、内容审核专家 |
| **方案策划型** | 技术方案、商业计划、可行性分析 | 市场分析师、需求分析师 |
| **图文内容型** | 技术文档、博客、SEO 内容 | SEO 专家、内容审核专家 |
| **音视频型** | 播客、视频课程、短视频脚本 | 媒体制作专家、脚本编辑 |

### 5.2 13 位专家

| 专家 | 关注领域 | 适用类型 |
|------|----------|----------|
| 需求分析师 | 需求覆盖、范围边界 | 全部 |
| 系统架构师 | 架构合理性、技术选型 | 开发型 |
| 数据库专家 | 数据模型、索引优化 | 开发型 |
| 安全专家 | 认证授权、攻击面 | 开发型 |
| 前端专家 | UI 架构、性能预算 | 开发型 |
| 后端专家 | API 设计、并发处理 | 开发型 |
| 测试架构师 | 测试策略、覆盖率 | 开发型 |
| DevOps 工程师 | 部署方案、CI/CD | 开发型 |
| 教学设计专家 | 大纲设计、认知负荷 | 课程型 |
| 内容审核专家 | 事实验证、版权合规 | 课程型/图文型 |
| 市场分析师 | 竞品分析、SWOT | 方案型 |
| SEO 专家 | 关键词策略、EEAT | 图文型/音视频型 |
| 媒体制作专家 | 分镜设计、后期流程 | 音视频型 |

---

## 六、Token 预算控制

### 6.1 设置预算

在会话中随时设置：
```
预算: 50000 tokens    # 当前阶段上限 5 万 token
预算: 无限制           # 取消限制（默认）
```

### 6.2 Agent 行为

- 阶段开始时估算预期消耗
- 80% 时提醒
- 95% 时自动精简输出
- 耗尽时暂停，请求确认是否追加

---

## 七、文件结构速查

```
你的项目/
├── AGENTS.md                       ← PI Agent 引导（@OMNIPM_SYSTEM_PROMPT.md）
├── OMNIPM_SYSTEM_PROMPT.md         ← 主提示词（16 章）
├── modules/
│   ├── roles.md                    ← 13 位专家
│   ├── router_logic.md             ← 5 类型智能路由
│   ├── design-dimensions.md        ← 7 大设计维度
│   ├── output_format.md            ← 5 种输出块规范
│   ├── security_gate.md            ← 安全门禁
│   ├── ci_templates.md             ← CI/CD 模板库
│   ├── cdl_quality_gate.md         ← Q-Score + 否决条件
│   ├── cdl_guide.md                ← CDL 操作指南
│   ├── MODULE_CHECKSUMS.sha256     ← 模块完整性校验
│   ├── workflows/                  ← 差异化工作流（4 个）
│   └── weaving/                    ← 交织矩阵（10 对）
├── .pi/                            ← CDL 能力配置（运行时生成）
│   ├── skills.yaml
│   ├── mcp.yaml
│   └── subagents.yaml
├── PROJECT_MEMORY.md               ← 项目状态追踪（运行时生成）
└── PROJECT_DECISIONS.md            ← 架构决策记录（运行时生成）
```

---

## 八、常见问题

**Q: OmniPM 会干扰日常编码吗？**
A: 不会。Orion 状态机从 IDLE 开始，只有你提出项目级想法时才触发完整流程。

**Q: 可以中途退出 OmniPM 流程吗？**
A: 随时回复"中止"，Orion 保存检查点后退出。

**Q: 混合型项目如何支持？**
A: OmniPM 自动检测混合型并加载交织矩阵（10 对组合），实现跨类型协同。

**Q: CDL 搜索不到想要的能力怎么办？**
A: 在 `.pi/skills.yaml` 中手动添加 `custom_sources`，或在裸奔模式下直接使用已知工具。

**Q: 支持哪些 PI Agent 环境？**
A: Claude Code CLI、Claude Code 桌面版、VS Code / JetBrains 扩展。Web 版（claude.ai/code）基本兼容。

---

*OmniPM v1.0.0-PI | Orion 项目总负责人 | 2026-07-21*
