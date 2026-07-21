---
# ================================================================
# PROJECT_MEMORY.md — 轻量级项目状态追踪文件
# Schema 版本: 1.0.0 | 所属系统: OmniPM 记忆层
# 角色: 当前阶段、活动步骤、关键约束、最近检查点
# 互补文件: PROJECT_DECISIONS.md（只追加决策日志）
# 此文件由 Agent（Orion）自动维护；用户可手动编辑但需遵循 Schema
# ================================================================

# --- 必填字段 ---
project_name: ""
# 类型: string | 约束: 非空, ≤100字符
# 示例: "个人记账Web应用"

project_type: "开发型"
# 类型: string | 枚举: "开发型"（MVP 仅支持此类型）
# 示例: "开发型"

stage: "IDLE"
# 类型: string | 枚举: IDLE / REQUIREMENT_ALIGNMENT / PLANNING / DESIGN / REVIEW / DEVELOPMENT / TESTING / DELIVERY / COMPLETED / ABORTED
# 含义: 当前所在工作流阶段
# 示例: "REQUIREMENT_ALIGNMENT"

phase: 1
# 类型: integer | 约束: ≥1
# 含义: 当前阶段编号（大项目可能跨多个 phase 迭代）
# 示例: 1

current_step: ""
# 类型: string | 枚举: A / B / C / D / E
# 含义: 当前执行步骤（对应五步执行循环: A=顶层设计 / B=专家评审 / C=开发实现 / D=测试质量 / E=文档交付）
# 约束: 阶段为 DESIGN/REVIEW/DEVELOPMENT/TESTING/DELIVERY 时必填，否则留空
# 示例: "A"

status: "未开始"
# 类型: string | 枚举: 未开始 / 进行中 / 暂停 / 已完成 / 已中止
# 含义: 项目整体状态
# 示例: "进行中"

last_checkpoint:
  state: ""
  step: ""
  sub_step: ""
  timestamp: ""
  key_files: []
# 类型: 对象 { state: string, step: string, sub_step: string, timestamp: string, key_files: [string] }
# 含义: 最近一次检查点信息，用于会话恢复
# 示例: {"state": "DESIGN", "step": "B", "sub_step": "2/8", "timestamp": "2026-07-21T14:30:00+08:00", "key_files": ["design_report.md"]}

# --- 必填时间戳 ---
created: ""
# 类型: string | 格式: ISO 8601 (YYYY-MM-DDTHH:MM:SS+TZ)
# 含义: 项目记忆文件创建时间
# 示例: "2026-07-21T10:00:00+08:00"

updated: ""
# 类型: string | 格式: ISO 8601
# 含义: 最后更新时间（每次修改 frontmatter 或正文后必须同步更新）
# 示例: "2026-07-21T14:30:00+08:00"

version: "0.1.0"
# 类型: string | 格式: SemVer (MAJOR.MINOR.PATCH)
# 含义: 项目记忆文件的版本号（不是项目本身的版本）
# 示例: "0.1.0"

# --- 必填元信息 ---
user_tech_level: "中级"
# 类型: string | 枚举: 初级 / 中级 / 高级
# 含义: 用户技术水平，决定后续交互的详略程度和术语使用
# 示例: "中级"

# --- 可选字段 ---
estimated_completion: ""
# 类型: string | 格式: ISO 8601 或空字符串
# 含义: 预计项目完成时间
# 示例: "2026-08-04T18:00:00+08:00"

tags: []
# 类型: array of string | 约束: 每个元素 ≤30字符
# 含义: 项目标签（技术栈、领域等）
# 示例: ["Web", "React", "FastAPI", "PostgreSQL"]

resume_point: ""
# 类型: string | 约束: 空或一句话
# 含义: 会话恢复引导文本。新会话启动时若检测到未完成项目，Agent 自动填充
# 示例: "继续 DESIGN 阶段的 A 步骤——顶层设计中的数据库ER图部分"

# --- 白名单约束 ---
# ⚠️ 仅允许以上定义的字段名出现在 YAML frontmatter 中。
# Agent 禁止自由添加任何未在本文档 8.1 节中列出的字段。
# 如有扩展需求，必须先更新本文档 8.1 节，再在 CHANGELOG.md 中记录变更。
---

# 项目记忆 — [待填写:项目名称]

> **文件角色**：这是 OmniPM 记忆层的**轻量级状态追踪文件**。它记录项目的"现在"——当前阶段、进行中的步骤、关键约束和最近的检查点。它不负责记录冗长的讨论过程或完整的决策论证。
>
> **互补文件**：完整的架构决策、技术选型理由、专家评审意见、选项对比分析均写入 [`PROJECT_DECISIONS.md`](./PROJECT_DECISIONS.md)（只追加决策日志）。
>
> **写入铁律（Agent 必读）**：
> - 每次修改后必须执行 §8.2 自检清单
> - 禁止在 YAML frontmatter 中添加白名单之外的字段
> - 禁止在本文中写入 API 密钥、Token、密码、私钥、连接串等敏感信息
> - 所有日志追加到 §七，不得修改或删除历史条目
> - 如项目使用 Git，确保本文件和 PROJECT_DECISIONS.md 已加入 `.gitignore`

---

## 一、项目目标

### 1.1 用户原始需求
<!-- Agent 首次创建项目时填充——用 1-3 句话原样概括用户最初描述的需求意图 -->
*（待填充）*

### 1.2 需求对齐后的确认摘要
<!-- Agent 在 GATE-REQUIREMENT 确认后填充——结构化概括经澄清后的完整需求 -->
*（待填充）*

### 1.3 成功标准
<!-- 用户和 Agent 共同确认的验收标准，使用可验证的表述 -->
*（待填充）*

---

## 二、当前进度

### 2.1 阶段总览

<!-- Agent 在每个阶段开始时更新对应行的状态标记。
     [ ] = 未开始, [~] = 进行中, [✓] = 已完成, [✗] = 已跳过, [!] = 阻塞 -->

| 阶段 | 状态 | 步骤 | 完成时间 | 备注 |
|------|------|------|----------|------|
| 需求对齐 | [ ] | — | — | |
| 阶段规划 | [ ] | — | — | |
| Step A · 顶层设计 | [ ] | A | — | |
| Step B · 专家评审 | [ ] | B | — | |
| Step C · 开发实现 | [ ] | C | — | |
| Step D · 测试质量 | [ ] | D | — | |
| Step E · 文档交付 | [ ] | E | — | |

### 2.2 当前步骤详情

<!-- Agent 在每个步骤开始和结束时更新以下字段。
     确保与 YAML frontmatter 中的 current_step 保持一致 -->

- **当前步骤**：`*（与 YAML current_step 同步）*`
- **步骤状态**：`*（未开始 / 进行中 / 已完成 / 阻塞）*`
- **开始时间**：`*（ISO 8601）*`
- **预计完成**：`*（ISO 8601 或 —）*`
- **关键产出**：
  - *（产出文件或成果 1）*
- **当前阻塞项**：
  - *（无 / 描述阻塞原因）*

### 2.3 最近检查点

<!-- Agent 在每个阶段/步骤完成后自动追加一条检查点记录。
     格式: `序号. 时间戳 | 阶段 | 步骤 | 产出: 关键交付物列表` -->

1. *（待填充——首次创建项目时写入第一条）*

---

## 三、架构决策记录 (ADR)

> **说明**：本节仅保留决策的**索引摘要**。完整的决策讨论、选项对比、评审意见、最终理由均写入 [`PROJECT_DECISIONS.md`](./PROJECT_DECISIONS.md)。
> 每条记录格式：ADR-ID + 日期 + 标题 + 结论(一句话) + 详情链接。

### 3.1 已批准决策

| ADR-ID | 日期 | 标题 | 结论 | 详情 |
|--------|------|------|------|------|
| | | | | |

### 3.2 待决事项

| 议题ID | 提出日期 | 标题 | 阻塞对象 | 期望决议日期 |
|--------|----------|------|----------|-------------|
| | | | | |

---

## 四、关键约束

### 4.1 技术约束
<!-- 如：运行环境限制、语言/框架版本要求、数据库选型限制、平台兼容性要求 -->
- *（待填充）*

### 4.2 业务约束
<!-- 如：交付截止日期、合规要求(GDPR等)、仅支持特定语言/地区、预算上限 -->
- *（待填充）*

### 4.3 安全约束
<!-- 如：认证方式要求、数据加密标准、API密钥管理策略、敏感数据处理规则 -->
- *（待填充）*

### 4.4 资源约束
<!-- 如：Token 预算上限、单文件代码行数限制、依赖数量上限 -->
- *（待填充）*

---

## 五、API / Schema 摘要

> **说明**：记录本项目自身的数据模型和 API 设计摘要。详细定义见对应的设计文档。

### 5.1 核心数据模型

<!-- Agent 在 Step A 完成后填充——列出项目涉及的核心实体及其关键字段 -->
| 实体 | 关键字段 | 存储方式 | 说明 |
|------|----------|----------|------|
| | | | |

### 5.2 API 端点清单

<!-- Agent 在 Step A 完成后填充——列出项目暴露的主要 API 端点 -->
| 方法 | 路径 | 用途 | 认证要求 | 说明 |
|------|------|------|----------|------|
| | | | | |

### 5.3 外部依赖服务

<!-- 项目使用的外部 API、SaaS 服务、第三方 SDK 及其用途 -->
| 服务/SDK | 版本 | 用途 | 关键程度 |
|----------|------|------|----------|
| | | | |

---

## 六、工作流状态机参考

> **说明**：以下为 OMNIPM_SYSTEM_PROMPT.md 定义的状态机的本文档本地副本。
> 当主提示词中的状态定义与本文档不一致时，以主提示词为准。
> Agent 在填充 `stage` 和 `current_step` 字段时应参照此表。

### 6.1 状态枚举

| 状态标识 | 中文名称 | 所在阶段 | current_step | 说明 |
|----------|----------|----------|-------------|------|
| IDLE | 空闲 | — | — | 项目已创建但尚未开始 |
| REQUIREMENT_ALIGNMENT | 需求对齐 | 阶段1 | — | 正在与用户澄清需求 |
| PLANNING | 阶段规划 | 阶段1 | — | 正在评估复杂度并拆分阶段 |
| DESIGN | 顶层设计 | 阶段2 | A | 正在执行 Step A 顶层设计 |
| REVIEW | 专家评审 | 阶段2 | B | 正在执行 Step B 多专家虚拟评审 |
| DEVELOPMENT | 开发实现 | 阶段3 | C | 正在执行 Step C 编码实现 |
| TESTING | 测试质量 | 阶段4 | D | 正在执行 Step D 测试与质量门禁 |
| DELIVERY | 文档交付 | 阶段5 | E | 正在执行 Step E 文档与交付 |
| COMPLETED | 已完成 | — | — | 项目已交付（终止状态） |
| ABORTED | 已中止 | — | — | 项目已中止（终止状态） |

### 6.2 不可跳过规则

以下路径锁在整个工作流中强制执行，Agent 在任何情况下都不得跳过：

1. **GATE-REQUIREMENT**：从 REQUIREMENT_ALIGNMENT 进入 PLANNING 前，必须获得用户"确认"信号
2. **GATE-DESIGN**：从 DESIGN 进入 REVIEW 前，必须获得用户"确认"信号
3. **GATE-ACCEPTANCE**：从 DELIVERY 进入 COMPLETED 前，必须获得用户"确认"信号
4. **SECURITY_GATE**：Step C 开发实现中必须执行安全门禁检查（禁止函数扫描 + 敏感信息检测）
5. **STEP_SEQUENCE**：A → B → C → D → E 顺序不得跳过（允许回退，不允许跳跃）

---

## 七、操作日志 (Memlog)

> **模式**：BMAD memlog —— 追加式记录，每条带时间戳。仅追加，不修改、不删除历史条目。
>
> **写入时机**（Agent 在以下事件发生时自动追加日志）：
> - 状态变更（阶段进入/退出、步骤开始/完成）
> - 门控节点触发（GATE-REQUIREMENT / GATE-DESIGN / GATE-ACCEPTANCE 通过或未通过）
> - 异常事件（回退、中断、阻塞、恢复）
> - 关键决策做出（技术选型、架构变更）
> - 检查点写入
> - 项目创建 / 项目完成 / 项目中止
>
> **操作类型枚举**：
> `[项目创建]` `[状态变更]` `[门控通过]` `[门控未通过]` `[回退]` `[恢复]` `[决策]` `[异常]` `[检查点]` `[交付]` `[安全门禁]`

### 7.1 日志条目

| 序号 | 时间戳 (ISO 8601) | 操作类型 | 描述 | 来源 |
|------|-------------------|----------|------|------|
| 1 | *首次填充时写入* | [项目创建] | 项目初始化，创建 PROJECT_MEMORY.md | Agent |
| | | | | |
| | | | | |
| | | | | |
| *(新条目追加到上方空行之前)* | | | | |

### 7.2 日志格式约束
- **时间戳**：严格 ISO 8601 格式，含时区（`YYYY-MM-DDTHH:MM:SS+TZ`）
- **描述**：单行中文，≤120 字符，句式统一为"主语+动作+宾语"（如"完成顶层设计文档v1，含ER图和API设计"）
- **来源**：`Agent`（系统自动写入）或 `User`（用户手动写入）
- **序号**：自增整数，从 1 开始

---

## 八、YAML Frontmatter 完整 Schema 与验证规则

### 8.1 字段定义表（白名单）

| # | 字段名 | 类型 | 必填 | 约束/枚举 | 示例值 |
|---|--------|------|------|-----------|--------|
| 1 | `project_name` | string | **是** | 非空, ≤100字符 | `"个人记账Web应用"` |
| 2 | `project_type` | string | **是** | `"开发型"`（MVP 唯一合法值） | `"开发型"` |
| 3 | `stage` | string | **是** | `IDLE` / `REQUIREMENT_ALIGNMENT` / `PLANNING` / `DESIGN` / `REVIEW` / `DEVELOPMENT` / `TESTING` / `DELIVERY` / `COMPLETED` / `ABORTED` | `"DESIGN"` |
| 4 | `phase` | integer | **是** | ≥1 | `1` |
| 5 | `current_step` | string | **条件必填** | `A` / `B` / `C` / `D` / `E` / `""`。当 stage ∈ {DESIGN, REVIEW, DEVELOPMENT, TESTING, DELIVERY} 时必填，否则留空 | `"A"` |
| 6 | `status` | string | **是** | `未开始` / `进行中` / `暂停` / `已完成` / `已中止` | `"进行中"` |
| 7 | `last_checkpoint` | 对象 | **条件必填** | 首次创建时可空，之后每次阶段/步骤变更必须更新。格式：`ISO8601 \| 阶段:XX \| 步骤:YY \| 产出:ZZ` | `{"state": "DESIGN", "step": "B", "sub_step": "2/8", "timestamp": "2026-07-21T10:30:00Z", "key_files": ["design_report.md"]}` |
| 8 | `created` | string | **是** | ISO 8601 (`YYYY-MM-DDTHH:MM:SS+TZ`) | `"2026-07-21T10:00:00+08:00"` |
| 9 | `updated` | string | **是** | ISO 8601 (`YYYY-MM-DDTHH:MM:SS+TZ`)。每次修改后必须更新 | `"2026-07-21T14:30:00+08:00"` |
| 10 | `version` | string | **是** | SemVer (`MAJOR.MINOR.PATCH`) | `"0.1.0"` |
| 11 | `user_tech_level` | string | **是** | `初级` / `中级` / `高级` | `"中级"` |
| 12 | `estimated_completion` | string | 否 | ISO 8601 或空字符串 | `""` |
| 13 | `tags` | array | 否 | 字符串数组，每元素 ≤30字符 | `["Web", "React", "FastAPI"]` |
| 14 | `resume_point` | string | 否 | 空或一句话描述 | `"继续 DESIGN 阶段的 A 步骤——数据库ER图部分"` |

### 8.2 Agent 自检清单（每次写入后强制执行）

Agent 在每次修改 PROJECT_MEMORY.md 后，必须**依次**完成以下检查步骤。任一检查未通过则不得进入下一步工作流操作。

#### 检查 1：必填字段完整性
```
检查 project_name, project_type, stage, phase, status, created, updated, version, user_tech_level 是否存在且值非空。
若 current_step 的条件必填场景触发（stage 为五步执行循环之一），检查 current_step 是否非空且合法。
```

#### 检查 2：枚举值合法性
```
- project_type == "开发型"
- stage ∈ {IDLE, REQUIREMENT_ALIGNMENT, PLANNING, DESIGN, REVIEW, DEVELOPMENT, TESTING, DELIVERY, COMPLETED, ABORTED}
- current_step ∈ {"A", "B", "C", "D", "E", ""}
- status ∈ {"未开始", "进行中", "暂停", "已完成", "已中止"}
- user_tech_level ∈ {"初级", "中级", "高级"}
```

#### 检查 3：格式合规
```
- created, updated, estimated_completion 符合 ISO 8601 格式 (YYYY-MM-DDTHH:MM:SS+TZ)
- version 符合 SemVer 格式 (MAJOR.MINOR.PATCH)，如 "0.1.0"
- last_checkpoint 若非空，格式符合 "ISO8601 | 阶段:XX | 步骤:YY | 产出:ZZ"
```

#### 检查 4：字段一致性
```
- current_step 与 stage 的对应关系必须符合 §6.1 状态枚举表
- status 与 stage 的一致性：
  - stage == COMPLETED → status == "已完成"
  - stage == ABORTED → status == "已中止"
  - stage == IDLE → status == "未开始"
  - 其他 stage → status 应为 "进行中" 或 "暂停"
- phase 与 stage 的对应关系：
  - stage ∈ {REQUIREMENT_ALIGNMENT, PLANNING} → phase == 1
  - stage ∈ {DESIGN, REVIEW} → phase 为当前大阶段编号（与路线图一致）
```

#### 检查 5：白名单字段检查
```
遍历 YAML frontmatter 中所有键名，逐一比对 §8.1 表第 1 列。
任何未在表中出现的字段名视为违规，必须删除。
```

#### 检查 6：敏感信息扫描
```
对全文（含 frontmatter 和正文）执行以下正则模式匹配，任一命中则阻断写入：

高危模式（命中 → 阻断并告警）：
- /-----BEGIN.*PRIVATE KEY-----/
- /sk-[a-zA-Z0-9]{32,}/
- /ghp_[a-zA-Z0-9]{36}/
- /AKIA[A-Z0-9]{16}/
- /Bearer [A-Za-z0-9\-._~+\/=]{20,}/
- /eyJ[A-Za-z0-9\-_]+?\.[A-Za-z0-9\-_]+?\.[A-Za-z0-9\-_]+/  (JWT 三段式)

中危模式（命中 → 警告并请求用户确认是否继续写入）：
- 键名为 password, secret, token, api_key, connection_string, private_key 的 YAML 键
- 包含 "密码" / "密钥" / "令牌" 后紧跟冒号和具体值的行
```

#### 检查 7：写入-读取往返验证
```
1. 写入完成后，立即重新读取 PROJECT_MEMORY.md
2. 对比以下关键字段是否与写入值完全一致：
   - project_name
   - stage
   - current_step
   - last_checkpoint
3. 任一字段不一致 → 重试写入（最多 3 次）
```

#### 检查 8：校验和更新
```
上述 7 项检查全部通过后：
1. 计算整个文件内容（不含最后一行 `<!-- checksum: ... -->`）的 SHA-256 哈希
2. 将哈希值格式化为 64 位十六进制字符串（小写）
3. 写入文件最末尾行：<!-- checksum: sha256:XXXX... -->
4. 确保此行前有一个空行
```

### 8.3 校验和验证（Agent 读取时执行）

Agent 每次读取 PROJECT_MEMORY.md 时：
1. 提取文件最末尾的 `<!-- checksum: sha256:XXXX... -->` 行
2. 计算除掉该行之外的文件内容的 SHA-256 哈希
3. 比对两个哈希值 —— 不一致则可能存在数据损坏，应：
   - 在 SESSION_CONTEXT 中标记 `memory_integrity_warning = true`
   - 提示用户"项目记忆文件校验失败，可能存在数据损坏，建议检查文件完整性"
   - 尝试从 YAML frontmatter 中提取可解析字段继续工作

---

## 九、Agent 操作指南

### 9.1 场景 A：首次创建项目

当用户启动新项目时，Agent 执行以下步骤：

1. **复制模板**：将本模板复制为 `[项目名简称]_PROJECT_MEMORY.md`（如 `LEDGER_PROJECT_MEMORY.md`）
2. **填充必填字段**：
   - `project_name` ← 用户提供的项目名称
   - `created` ← 当前 ISO 8601 时间
   - `updated` ← 同 `created`
   - `stage` ← `"IDLE"`
   - `phase` ← `1`
   - `current_step` ← `""`
   - `status` ← `"未开始"`
   - `last_checkpoint` ← `""`（或写入第一条：`"<当前时间> | 阶段:IDLE | 步骤:— | 产出:PROJECT_MEMORY.md创建"`）
   - `user_tech_level` ← 询问用户后填充
   - `tags` ← 根据项目类型推断填充
3. **填充正文**：
   - §1.1 用户原始需求 ← 用户最初的需求描述
   - §四 关键约束 ← 根据需求初步识别的约束
4. **追加第一条日志**（§七）：`[项目创建] 项目初始化，创建 PROJECT_MEMORY.md`
5. **执行 §8.2 自检清单**（全部 8 项）
6. **计算并写入校验和**

### 9.2 场景 B：状态变更时

每次工作流状态发生变更（阶段切换、步骤切换、门控触发、异常回退）时：

1. **更新 YAML frontmatter**：
   - `stage` ← 新阶段
   - `current_step` ← 新步骤（如适用）
   - `updated` ← 当前时间
   - `last_checkpoint` ← 格式化的检查点信息
   - `status` ← 根据新 stage 推断
2. **更新 §二 当前进度**：
   - §2.1 阶段总览表 ← 更新对应行的状态标记（`[~]` / `[✓]`）
   - §2.2 当前步骤详情 ← 更新所有字段
   - §2.3 最近检查点 ← 追加新条目
3. **追加日志**（§七）：使用对应的操作类型标签
4. **执行 §8.2 自检清单**
5. **计算并写入校验和**

### 9.3 场景 C：会话恢复

新会话启动时，Agent 检测到项目中存在 PROJECT_MEMORY.md：

1. **读取文件**：解析 YAML frontmatter
2. **校验文件**：执行 §8.3 校验和验证
3. **判断状态**：
   - 若 `status` ∈ {`"进行中"`, `"暂停"`} → 提示用户：
     ```
     检测到未完成项目「{project_name}」。
     当前进度：{stage} 阶段 — 步骤 {current_step}
     最近检查点：{last_checkpoint}
     是否继续此项目？[继续 / 新建 / 查看详情]
     ```
   - 若用户选择"继续" → 填充 `resume_point` ← `"继续 {stage} 阶段的 {current_step} 步骤"`
   - 若用户选择"新建" → 保留旧文件，创建新的 PROJECT_MEMORY.md
   - 若 `status` == `"已完成"` → 正常重建上下文，无需特殊提示
4. **恢复工作**：从 `last_checkpoint` 记录的产出位置开始，而非从头开始

### 9.4 场景 D：项目完成

1. **更新 frontmatter**：
   - `stage` ← `"COMPLETED"`
   - `current_step` ← `""`
   - `status` ← `"已完成"`
   - `updated` ← 当前时间
   - `last_checkpoint` ← 最终检查点
2. **更新 §2.1**：所有阶段标记为 `[✓]`
3. **追加最终日志**：`[交付] 项目全部阶段完成，正式交付`
4. **确认**：检查 PROJECT_DECISIONS.md 中所有待决事项是否已闭合
5. **执行 §8.2 自检清单**
6. **写入最终校验和**

### 9.5 场景 E：项目中止

1. **更新 frontmatter**：
   - `stage` ← `"ABORTED"`
   - `current_step` ← `""`
   - `status` ← `"已中止"`
   - `updated` ← 当前时间
2. **追加日志**：`[异常] 项目已中止。最后阶段：{stage}，原因：{简述}`
3. **执行 §8.2 自检清单**
4. **写入校验和**

---

<!-- checksum: sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 -->
