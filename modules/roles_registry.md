# OmniPM 专家角色注册表（Roles Registry）

> **模块名称**：`roles_registry` —— 跨专家全局规则注册中心
> **版本**：v1.0.0
> **派生自**：`modules/roles.md` v1.1.0 + v2.0.0 新增规则
> **依赖**：无（独立模块，Meta-Orion 启动时优先加载）
> **用途**：集中管理所有跨专家全局规则——命名体系统一映射、角色索引、
>   激活决策表、安全域强制规则、用户覆盖规则、项目类型适配、分类映射。
>
> **关联模块**：
> - 个体角色定义 → [`modules/roles.md`](./roles.md)（13位专家详细定义）
> - 代理执行文件 → `agents/*.md`（13个Agent）
> - 调度工具 → `run_experts`（Pi Extension，使用 `canonical_name` 调用）

---

## 一、命名体系统一映射（★ 权威映射表）

> **这是整个 OmniPM 命名体系的唯一权威映射源。**
> 所有模块必须从此表获取角色标识，禁止硬编码映射关系。

### 1.1 三向映射总表

| role_id | canonical_name | agent_file | 中文名称 |
|---------|---------------|-----------|---------|
| `REQ` | `requirements` | `requirements.md` | 需求分析师 |
| `ARCH` | `architect` | `architect.md` | 系统架构师 |
| `DB` | `database` | `database.md` | 数据库专家 |
| `SEC` | `security` | `security.md` | 安全专家 |
| `FE` | `frontend` | `frontend.md` | 前端专家 |
| `BE` | `backend` | `backend.md` | 后端专家 |
| `QA` | `qa` | `qa.md` | 测试架构师 |
| `OPS` | `devops` | `devops.md` | DevOps工程师 |
| `COURSE_DESIGNER` | `course-designer` | `course-designer.md` | 教学设计专家 |
| `CONTENT_REVIEWER` | `content-reviewer` | `content-reviewer.md` | 内容审核专家 |
| `MARKET_ANALYST` | `market-analyst` | `market-analyst.md` | 市场分析师 |
| `SEO_EXPERT` | `seo-expert` | `seo-expert.md` | SEO专家 |
| `MEDIA_PRODUCER` | `media-producer` | `media-producer.md` | 媒体制作专家 |

### 1.2 命名空间规则

| 命名空间 | 格式规范 | 示例 | 使用场景 |
|---------|---------|------|---------|
| `role_id` | 大写字母 + 下划线 | `SEC`, `COURSE_DESIGNER` | `@LOAD?role=XXX`、DAG 节点 ID、roles.md 内部引用 |
| `canonical_name` | 小写字母 + 连字符 | `security`, `course-designer` | `run_experts({expert:"..."})`、agents `name` 字段、对外 API |
| `agent_file` | canonical_name + `.md` | `security.md` | 文件系统路径 |

### 1.3 语义差异标注

| role_id | canonical_name | 差异类型 | 说明 |
|---------|---------------|---------|------|
| `OPS` | `devops` | ⚠️ **语义跃迁** | `OPS` 暗示传统运维（Operations），`devops` 涵盖 CI/CD+SRE+平台工程 |
| `REQ` | `requirements` | ℹ️ 词形扩展 | `REQ` 缩写自 Requirement（单数），`requirements` 采用复数 |
| `ARCH` | `architect` | ℹ️ 词形扩展 | `ARCH` 缩写自 Architecture，`architect` 指向角色（人） |

---

## 二、角色索引表

| role_id | 图标 | 中文名称 | 分类标签 | 核心关键词 |
|---------|------|---------|---------|-----------|
| `REQ` | 📋 | 需求分析师 | design | 需求挖掘、用户故事、验收标准 |
| `ARCH` | 🏗️ | 系统架构师 | design | 技术选型、架构设计、模块划分 |
| `DB` | 🗄️ | 数据库专家 | design, develop | 数据建模、索引优化、查询性能 |
| `SEC` | 🔒 | 安全专家 | design, test, deploy | 威胁建模、安全审计、合规审查 |
| `FE` | 🎨 | 前端专家 | develop | UI组件、状态管理、性能优化 |
| `BE` | ⚙️ | 后端专家 | develop | API设计、业务逻辑、服务治理 |
| `QA` | 🧪 | 测试架构师 | test | 测试策略、自动化框架、质量门禁 |
| `OPS` | 🚀 | DevOps工程师 | deploy | CI/CD、容器化、监控告警 |
| `COURSE_DESIGNER` | 📖 | 教学设计专家 | course | 教学大纲、Bloom分类法、评估策略 |
| `CONTENT_REVIEWER` | ✅ | 内容审核专家 | course, graphic | 内容准确性、版权合规、可读性 |
| `MARKET_ANALYST` | 📊 | 市场分析师 | solution | 竞品分析、TAM/SAM/SOM、SWOT |
| `SEO_EXPERT` | 🔍 | SEO专家 | graphic, av | 关键词策略、搜索意图、EEAT |
| `MEDIA_PRODUCER` | 🎬 | 媒体制作专家 | av | 分镜脚本、后期制作、多平台分发 |

---

## 三、分类↔专家映射表

> 供 `@LOAD:modules/roles.md?category=XXX` 指令使用。

| 分类标签 | 中文含义 | 激活专家（role_id） | 适用场景 |
|---------|---------|-------------------|---------|
| `design` | 设计阶段 | REQ, ARCH, DB, SEC | 需求分析 + 架构设计 + 数据建模 + 安全设计 |
| `develop` | 开发阶段 | FE, BE, DB | 前后端开发 + 数据层 |
| `test` | 测试阶段 | QA, SEC | 质量保障 + 安全测试 |
| `deploy` | 部署阶段 | OPS, SEC | DevOps + 安全运维 |
| `course` | 教学设计 | COURSE_DESIGNER, CONTENT_REVIEWER | 课程设计 + 内容审核 |
| `solution` | 方案策划 | MARKET_ANALYST, ARCH, REQ | 市场分析 + 架构 + 需求 |
| `graphic` | 图文内容 | CONTENT_REVIEWER, SEO_EXPERT | 内容审核 + SEO |
| `av` | 音视频制作 | MEDIA_PRODUCER, SEO_EXPERT | 媒体制作 + SEO |

---

## 四、项目类型适配表

> v2.0.0 起此表仅为**参考默认值**，实际激活由第五章激活决策表逐条判定。

| 项目类型 | 默认核心角色（role_id） | 可选强化角色 |
|---------|----------------------|------------|
| 软件开发 | REQ, ARCH, DB, SEC, FE, BE, QA, OPS | — |
| 课程/教学设计 | REQ, COURSE_DESIGNER, CONTENT_REVIEWER, QA | FE（互动设计侧重）|
| 方案策划 | REQ, ARCH, SEC, MARKET_ANALYST | — |
| 图文内容 | CONTENT_REVIEWER, SEO_EXPERT, FE, QA | — |
| 音视频制作 | MEDIA_PRODUCER, SEO_EXPERT, QA | — |

---

## 五、v2.0.0 专家动态激活决策表

> ⚠️ **Meta-Orion 核心调度规则。** 优先级：安全域强制激活 > 条件激活 > 项目类型默认值。

### 5.1 条件激活规则

| role_id | 激活条件 | 强度判定 |
|---------|---------|----------|
| `REQ` | **始终激活** | `STANDARD` |
| `ARCH` | domains_involved 含"API设计"或"系统架构" 或 complexity ≥ 中 | weight ≥ 0.7 → `DEEP`，否则 `STANDARD` |
| `DB` | domains_involved 含"数据库" | weight ≥ 0.7 → `DEEP`，否则 `STANDARD` |
| `SEC` | security_risk ≥ 🟡 **或** 安全域强制激活命中 | risk = 🔴 → `DEEP`，risk = 🟡 → `STANDARD`，强制激活 → `LIGHT`（最低）|
| `FE` | domains_involved 含"前端" | `STANDARD`（weight < 0.3 → `LIGHT`）|
| `BE` | domains_involved 含"API设计" | `STANDARD`（weight < 0.3 → `LIGHT`）|
| `QA` | complexity ≥ 中 **或** security_risk ≥ 🟡 | risk = 🔴 → `DEEP`，否则 `STANDARD` |
| `OPS` | domains_involved 含"部署运维" **且** weight ≥ 0.3 | weight ≥ 0.5 → `STANDARD`，否则 `LIGHT` |
| `COURSE_DESIGNER` | project_type = 课程型 | `STANDARD` |
| `CONTENT_REVIEWER` | project_type ∈ {课程型, 图文型} | `STANDARD` |
| `MARKET_ANALYST` | project_type = 方案型 | `STANDARD` |
| `SEO_EXPERT` | project_type ∈ {图文型, 音视频型} | `LIGHT` |
| `MEDIA_PRODUCER` | project_type = 音视频型 | `STANDARD` |

### 5.2 强度等级定义

| 强度 | 含义 | 最少输出 | 典型场景 |
|------|------|---------|---------|
| `LIGHT` | 快速扫描 | 2-3 条核心建议 | 低风险项目、非核心域、强制激活的最低级别 |
| `STANDARD` | 标准评审 | ≥3 条建议 + 严重等级 | 常规项目、中等复杂度 |
| `DEEP` | 深度审查 | ≥5 条建议 + 修正方案 + 替代方案 | 高风险、高复杂度、核心安全域 |
| `PAIR` | 双人结对 | 跨域综合建议 | 架构+安全等跨域协同场景 |

---

## 六、安全域强制激活规则

> 🔴 **最高优先级。Meta-Orion 不可覆盖。用户不可覆盖。**

以下任一条件满足 → `SEC` 专家**至少 `LIGHT`**（如 security_risk = 🔴 则自动升级为 `DEEP`）：

| 编号 | 触发条件 | 风险分类 | 示例场景 |
|------|---------|---------|---------|
| SF-01 | 涉及用户数据（PII） | 隐私合规 | 用户注册/个人资料/身份信息存储 |
| SF-02 | 涉及支付/金融交易 | 金融安全 | 订单支付/退款/账户余额/积分 |
| SF-03 | 涉及用户认证/授权 | 身份安全 | 登录/注册/权限管理/SSO/OAuth |
| SF-04 | API 对外暴露 | 接口安全 | 公开 REST API / GraphQL 端点 / Webhook |
| SF-05 | 涉及第三方集成 | 供应链安全 | 外部 SDK / 第三方登录 / 支付网关 |

### 6.1 判定流程

```
Meta-Orion 分析项目 → 遍历 SF-01 ~ SF-05
  ├── 0条触发 → 正常流程（SEC 可选）
  ├── 1-2条触发 → SEC = LIGHT（至少快速扫描）
  └── ≥3条触发 → SEC ≥ STANDARD（至少标准评审）
```

---

## 七、用户覆盖规则

### 7.1 可覆盖项

| 操作 | 允许 | 语法示例 |
|------|------|---------|
| 新增专家 | ✅ | `+SEC` 或 `add security DEEP` |
| 删除专家 | ✅ | `-FE` 或 `remove frontend` |
| 调整强度 | ✅ | `SEC→LIGHT` 或 `qa intensity=STANDARD` |
| 替换专家 | ✅ | `FE→MEDIA_PRODUCER` |

### 7.2 不可覆盖项

> 🔴 **安全域强制激活（第六章）不可被用户覆盖。**
>
> 即使用户执行 `-SEC` 或 `SEC→OFF`，Meta-Orion **必须拒绝**并提示：
> ```
> ⚠️ 无法移除安全专家：检测到以下安全域触发条件 —
>   · SF-01：涉及用户数据（PII）
>   · SF-03：涉及用户认证/授权
> 安全专家至少保持 LIGHT 强度。
> ```

### 7.3 冲突解决优先级

| 优先级 | 来源 | 说明 |
|--------|------|------|
| 1（最高）| 安全域强制激活 | 不可覆盖，不可降级 |
| 2 | 用户显式指定 | 覆盖 Meta-Orion 条件激活（除安全域外）|
| 3 | Meta-Orion 条件激活 | 第五章决策表 |
| 4（最低）| 项目类型默认值 | 第四章适配表 |

---

## 八、加载指令

```yaml
# Meta-Orion 启动时全量加载（推荐）
@LOAD:modules/roles_registry.md

# 按需加载特定章节
@LOAD:modules/roles_registry.md?section=1         # 仅命名映射表
@LOAD:modules/roles_registry.md?section=5,6       # 激活决策表 + 安全域规则
```

---

## 九、模块依赖拓扑

```
OMNIPM_SYSTEM_PROMPT.md
├── @LOAD:modules/roles_registry.md   ← ★ 第一步：加载本注册表
├── @LOAD:modules/meta_analyzer.md    ← 第二步：深度分析（使用注册表中的激活规则）
├── @LOAD:modules/roles.md            ← 第三步：加载专家详细定义（按激活结果）
└── run_experts({...})                ← 第四步：调度 agents/*.md（使用 canonical_name）

翻译链路：
  meta_analyzer → 输出 role_id 列表 → roles_registry 查表 →
  canonical_name 列表 → run_experts 调用 → agents/{canonical_name}.md
```

---

## 版本历史

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v1.0.0 | 2026-07-21 | 从 `modules/roles.md` 提取全局规则：命名体系统一映射表、角色索引、分类映射、项目类型适配表、v2.0.0 激活决策表、安全域强制规则、用户覆盖规则、冲突解决优先级、模块依赖拓扑 |
