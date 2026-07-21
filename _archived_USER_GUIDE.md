# OmniPM 用户指南

> 版本：0.2.0-PhaseII | 适用 OmniPM 系统提示词 v0.2.0+

## 一、快速开始

### 1.1 什么是 OmniPM
OmniPM 是一套高度结构化的系统提示词，让大语言模型化身为项目总负责人（Orion），带领由 13 位虚拟专家组成的团队，完成 5 种项目类型的全生命周期交付。你只需要输入一个项目想法，Orion 自动完成需求对齐→顶层设计→多专家评审→分阶段开发→测试交付，全程仅需在关键节点确认。

### 1.2 三步安装（零配置）

将 OmniPM 安装到**任意项目**中，无需配置、无需 API Key、无需 /config：

```
1. 复制以下文件到你的项目根目录：
   - OMNIPM_SYSTEM_PROMPT.md（主提示词）
   - modules/（整个目录）

2. 在项目根目录创建引导文件（见下方平台对应文件）

3. 新开智能体会话 → 输入项目想法 → Orion 自动接管
```

### 1.3 安装后效果

启动新会话后，智能体会自动加载 OmniPM 提示词，化身为 Orion。输入任何项目想法即可触发：
- 智能路由自动识别项目类型（开发/课程/方案/图文/音视频）
- 13 位虚拟专家按需介入评审
- 完整 Step A→E 工作流自动推进

> **普通开发任务不受影响**：Orion 的状态机从 IDLE 开始，只有你提出项目想法时才触发完整流程。日常的"改个 bug""写个测试"等操作照常进行。

---

## 二、各平台安装方式

> **原则**：所有平台优先使用 `AGENTS.md`。仅 Claude Code 和 Gemini CLI 使用平台专属文件（支持 `@` 语法直接注入提示词）。

### 2.1 Claude Code ✅ 已测试

在项目根目录创建 `CLAUDE.md`：

```markdown
@OMNIPM_SYSTEM_PROMPT.md
```

`@` 语法会在会话启动时将 `OMNIPM_SYSTEM_PROMPT.md` 完整内容注入上下文。

### 2.2 Gemini CLI ✅

在项目根目录创建 `GEMINI.md`：

```markdown
@OMNIPM_SYSTEM_PROMPT.md
```

语法同 Claude Code。Gemini 1.5 Pro 的 100 万 token 上下文窗口可轻松容纳全部模块。

### 2.3 OpenAI Codex CLI / Cursor / Windsurf / 及其他

创建 `AGENTS.md`（跨平台标准，已获 10+ 平台原生支持，6 万+开源仓库采用）：

```markdown
你是 Orion，OmniPM 项目总负责人。
读取 OMNIPM_SYSTEM_PROMPT.md 作为系统提示词并严格遵循。
```

> **各平台自动加载文件名速查**：
> | 平台 | 自动加载文件 |
> |------|-------------|
> | Claude Code | `CLAUDE.md` |
> | Gemini CLI | `GEMINI.md` |
> | Codex / Cursor / Windsurf / Roo Code / Zed / Phoenix | `AGENTS.md` |
> | GitHub Copilot | `.github/copilot-instructions.md` |
> | Continue.dev | `.continue/rules/*.md` |
> | Aider | `CONVENTIONS.md`（或 `.aider.conf.yml` 中 `/read AGENTS.md`） |

所有平台文件已在本仓库预置：`CLAUDE.md` · `GEMINI.md` · `AGENTS.md`。

### 2.4 ChatGPT / GPT-4o

在 Custom Instructions 中设置。如超出字符上限（约 1500 字），优先保留以下章节：
- 状态机定义（第〇章）——行为一致性核心
- 安全协议（第二章）——安全基线
- 核心交互协议 3.1-3.3（第三章）——工作流引擎
- 门控协议（第六章）——质量门禁

### 2.6 Gemini 1.5 Pro

使用 System Instruction 字段。Gemini 1.5 Pro 支持 100 万 token 上下文窗口，可完整加载全部模块。推荐在 Google AI Studio 中配置。

### 2.7 DeepSeek-V3

使用 API 的 system 参数。建议在首次使用时用简单项目测试完整工作流闭环。

### 2.8 通用 Web 聊天界面

将 `OMNIPM_SYSTEM_PROMPT.md` 内容粘贴为第一条消息，前缀标记 `[SYSTEM]`。

## 三、支持的项目类型

| 类型 | 适用场景 | 示例 |
|------|---------|------|
| 开发型 | 软件/Web/App/API/工具开发 | 个人记账应用、团队协作平台 |
| 课程型 | 在线课程/培训/教学设计 | Python 零基础到就业、企业内训体系 |
| 方案型 | 技术方案/商业策划/咨询报告 | 创业公司技术选型、数字化转型方案 |
| 图文型 | 文章/文档/文案/内容创作 | 技术博客系列、产品用户手册 |
| 音视频型 | 视频/播客/直播/多媒体制作 | 编程教程视频、行业访谈播客 |

不确定类型？直接描述你的项目，OmniPM 的智能路由会自动识别。系统采用三级降级链：高置信度自动路由 → 候选类型确认 → 全量手动选择。

## 四、交互约定

### 4.1 GATE 节点确认
三个关键确认节点需要你明确回复「确认」：
- GATE-REQUIREMENT：需求确认（进入设计前）
- GATE-DESIGN：设计确认（进入开发前）
- GATE-ACCEPTANCE：交付确认（项目完结前）

回复「可以」「没问题」等非「确认」开头短语时，Orion 会二次确认，这是设计意图而非 bug。

### 4.2 中途变更
- 当前阶段进行中的变更请求会被登记，在阶段边界（GATE 节点）统一处理
- 安全级紧急变更可即时处理，但 Orion 会明确告知进度损失并要求二次确认

### 4.3 技术水平适配
首次交互时 Orion 会询问你的技术水平（初级/中级/高级），这会影响：
- 初级：术语解释 + 背景知识 + 推荐理由详细说明
- 中级：标准交互深度 + 必要的技术上下文
- 高级：精简解释 + 允许快速确认和默认推断

## 五、最佳实践

### 5.1 项目描述技巧
- 推荐：「做一个支持多币种和预算管理的个人记账 Web 应用」
- 推荐：「为 3-5 年经验的前端开发者设计一套 React 进阶课程」
- 推荐：「为 5 人创业团队输出 B2B SaaS 技术选型方案，要求 2 个月内上线 MVP」
- 不推荐：「帮我做个东西」（太模糊，将触发全量类型选择）

### 5.2 Token 用量参考
- 完整 15 章提示词 + 全部模块：约 15,000-20,000 tokens
- 仅核心（状态机+安全+交互协议）+ 单类型模块：约 5,000-8,000 tokens
- 每轮 Step A 设计报告：约 2,000-5,000 tokens
- 每轮 Step B 专家评审：约 3,000-8,000 tokens

### 5.3 长会话管理
如果单次会话无法完成全部阶段：
1. 利用 PROJECT_MEMORY.md 保存上下文（Orion 自动维护）
2. 在 CHECKPOINT 节点处中断，下次会话可续传
3. 新会话开头提示：「继续 OmniPM 项目 [项目名称]，上次进度：[CHECKPOINT信息]」

## 六、模块目录

```
Genesis_OmniPM/
├── OMNIPM_SYSTEM_PROMPT.md          ← 主提示词（15章）
├── modules/
│   ├── roles.md                     ← 13位专家角色定义
│   ├── router_logic.md              ← 5类型智能路由引擎
│   ├── design-dimensions.md         ← 7大设计维度模板
│   ├── output_format.md             ← 5种输出块规范
│   ├── ci_templates.md              ← CI/CD 模板库
│   ├── security_gate.md             ← 安全门禁
│   └── workflows/
│       ├── course.md                ← 课程型差异化工作流
│       ├── solution.md              ← 方案型差异化工作流
│       ├── graphic.md               ← 图文型差异化工作流
│       └── av.md                    ← 音视频型差异化工作流
├── EXAMPLES.md                      ← 示例对话集
├── USER_GUIDE.md                    ← 本文件
├── PROJECT_MEMORY_TEMPLATE.md       ← 项目记忆模板
└── CHANGELOG.md                     ← 变更日志
```
