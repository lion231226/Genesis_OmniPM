# OmniPM v2.4.0 — 专家注册表 (Roles Registry)

> 统一管理 13 位专家的命名映射、激活决策表和输出 Schema。
> v2.4.0: 与 .pi/agents/*.md YAML frontmatter 保持同步。

---

## 命名映射

| 短ID | Agent名 | 图标 | 中文名 | 分类 |
|------|---------|------|--------|------|
| `REQ` | `requirements` | 📋 | 需求分析师 | design |
| `ARCH` | `architect` | 🏗️ | 系统架构师 | design |
| `DB` | `database` | 🗄️ | 数据库专家 | design/develop |
| `SEC` | `security` | 🔒 | 安全专家 | design/test/deploy |
| `FE` | `frontend` | 🎨 | 前端专家 | develop |
| `BE` | `backend` | ⚙️ | 后端专家 | develop |
| `QA` | `qa` | 🧪 | 测试架构师 | test |
| `OPS` | `devops` | 🚀 | DevOps工程师 | deploy |
| `COURSE` | `course-designer` | 📖 | 教学设计专家 | course |
| `REVIEWER` | `content-reviewer` | ✅ | 内容审核专家 | course/graphic |
| `MARKET` | `market-analyst` | 📊 | 市场分析师 | solution |
| `SEO` | `seo-expert` | 🔍 | SEO专家 | graphic/av |
| `MEDIA` | `media-producer` | 🎬 | 媒体制作专家 | av |

---

## 激活决策表 v2.4.0

| Agent | 激活条件 | 默认强度 | 安全域强制 |
|-------|----------|----------|-----------|
| `requirements` | **始终激活** | STANDARD | — |
| `architect` | `domains`含"API设计"或"系统架构" 或 `complexity`≥中 | weight≥0.7→DEEP, 否则 STANDARD | — |
| `database` | `domains`含"数据库" | weight≥0.7→DEEP, 否则 STANDARD | — |
| `security` | `security_risk`≥🟡 **或** 安全域强制 | risk=🔴→DEEP, 🟡→STANDARD, 强制→LIGHT | 用户数据/PII/支付/认证/API对外暴露/第三方集成 |
| `frontend` | `domains`含"前端" | STANDARD（weight<0.3→LIGHT） | — |
| `backend` | `domains`含"API设计" | STANDARD（weight<0.3→LIGHT） | — |
| `qa` | `complexity`≥中 或 `security_risk`≥🟡 | risk=🔴→DEEP, 否则 STANDARD | — |
| `devops` | `domains`含"部署运维" 且 weight≥0.3 | weight≥0.5→STANDARD, 否则 LIGHT | — |
| `course-designer` | type=课程型 | STANDARD | — |
| `content-reviewer` | type∈{课程型,图文型} | STANDARD | — |
| `market-analyst` | type=方案型 | STANDARD | — |
| `seo-expert` | type∈{图文型,音视频型} | LIGHT | — |
| `media-producer` | type=音视频型 | STANDARD | — |

### 安全域强制激活（不可覆盖）

以下任一条件满足 → `security` 至少 LIGHT：
- 涉及用户数据（PII）
- 涉及支付/金融交易
- 涉及用户认证/授权
- API 对外暴露
- 涉及第三方集成

### 调用强度说明

| 强度 | token消耗 | 适用场景 |
|------|----------|---------|
| SKIP | 0 | 不需要此专家 |
| LIGHT | ~2K | 快速扫描，仅关键检查项 |
| STANDARD | ~5K | 标准评审，完整检查清单 |
| DEEP | ~10K | 深度审查，含威胁建模和详细分析 |
| PAIR | ~15K | 双人结对，两位专家协同评审 |

---

## 输出 Schema v2.4.0（统一 JSON Schema）

每位专家输出必须包含以下结构化字段（以 Markdown 形式呈现，但可被解析为 JSON）：

```yaml
schema: expert_output_v2.4.0
fields:
  expert_name: string          # Agent名
  severity: "P0" | "P1" | "P2"  # 严重等级
  thinking_process: string     # 思考过程
  assessment_table:            # 维度评估表
    - dimension: string
      score: 1-5
      note: string
  findings:                    # 发现清单
    - id: string               # 发现编号（如 SEC-001）
      level: "P0" | "P1" | "P2"
      category: string         # 分类（如"认证安全"）
      description: string
      recommendation: string
  collaboration_notes: string  # 协作提示（给其他专家）
  context_references: string[] # 上游节点引用（上下文感知）
```

> 此 Schema 在 `modules/expert_schema.md` 中有完整定义，供 Orion 自动聚合解析。

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v2.4.0 | 2026-07-22 | 与 .pi/agents/*.md 同步；新增统一输出Schema；PAIR强度 |
| v2.1.0 | 2026-07-21 | 初始版本，13位专家激活决策表 + 安全域规则 |
