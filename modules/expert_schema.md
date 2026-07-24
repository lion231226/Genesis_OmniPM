# OmniPM v2.4.0 — 专家输出 JSON Schema

> 统一 13 位专家输出为结构化 Schema，便于 Orion 自动聚合和偏差检测。
> 对应 `roles_registry.md` §输出Schema。

---

## JSON Schema 定义

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://omnipm.dev/schemas/expert-output-v2.4.0.json",
  "title": "OmniPM Expert Output",
  "description": "13位OmniPM专家的标准化输出格式",
  "type": "object",
  "required": ["expert_name", "severity", "thinking_process", "findings"],
  "properties": {
    "expert_name": {
      "type": "string",
      "enum": ["requirements", "architect", "database", "security", "frontend", "backend", "qa", "devops", "course-designer", "content-reviewer", "market-analyst", "seo-expert", "media-producer"],
      "description": "专家标识名"
    },
    "severity": {
      "type": "string",
      "enum": ["P0", "P1", "P2"],
      "description": "最高严重等级"
    },
    "thinking_process": {
      "type": "string",
      "minLength": 50,
      "description": "思考过程（≥50字符）"
    },
    "assessment_table": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["dimension", "score"],
        "properties": {
          "dimension": { "type": "string" },
          "score": { "type": "integer", "minimum": 1, "maximum": 5 },
          "note": { "type": "string" }
        }
      }
    },
    "findings": {
      "type": "array",
      "minItems": 3,
      "items": {
        "type": "object",
        "required": ["id", "level", "category", "description"],
        "properties": {
          "id": {
            "type": "string",
            "pattern": "^[A-Z]{2,4}-\\d{3}$",
            "description": "发现编号（如 SEC-001, BE-042）"
          },
          "level": {
            "type": "string",
            "enum": ["P0", "P1", "P2"]
          },
          "category": { "type": "string" },
          "description": { "type": "string", "minLength": 10 },
          "recommendation": { "type": "string" }
        }
      }
    },
    "collaboration_notes": {
      "type": "string",
      "description": "给其他专家的协作提示"
    },
    "context_references": {
      "type": "array",
      "items": { "type": "string" },
      "description": "上游DAG节点引用"
    }
  }
}
```

---

## Orion 聚合规则

### 多专家输出合并

当 `run_experts` 并行调用多位专家时，Orion 按以下规则聚合：

```
1. 按 expert_name 分组
2. 取 max(severity) 作为综合严重等级（P0 > P1 > P2）
3. findings 合并去重（按 category + description 相似度>80% 去重）
4. 生成聚合报告：综合等级 + 按P0/P1/P2分组的发现清单
```

### 聚合示例

```
输入: security(P0), backend(P1), database(P2)
输出: 综合等级 P0
      P0: [SEC-001] SQL注入风险 ...
      P1: [BE-003] 缺少幂等性保护 ...
      P2: [DB-007] 索引优化建议 ...
```

---

## Orion 自动解析

Orion 从专家 Markdown 输出中提取结构化数据：

```typescript
function parseExpertOutput(markdown: string): ExpertOutput {
  return {
    expert_name: extract(/###\s*(.+?)\s*评审意见/.exec(markdown)?.[1]),
    severity: extract(/严重等级[：:]\s*(P[012])/.exec(markdown)?.[1]),
    thinking_process: extractBetween(markdown, '【思考过程】', '【'),
    findings: extractFindings(markdown), // 正则提取编号+等级+描述
    collaboration_notes: extractBetween(markdown, '协作提示', '---'),
    context_references: extractRefs(markdown), // [基于上游 N1] 模式
  };
}
```

---

## 质量验证规则

| 检查项 | 规则 | 不满足时 |
|--------|------|---------|
| 输出完整性 | findings ≥ 3 条 | retry(P1) |
| 思考过程 | thinking_process ≥ 50 字符 | retry(P2) |
| 严重等级 | 必须含 P0/P1/P2 | retry(P0) |
| 发现编号 | 格式 `XX-NNN` | warn（不阻断） |
| 协作提示 | 非空 | warn（不阻断） |

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v2.4.0 | 2026-07-22 | 初始版本；统一13位专家输出Schema；Orion聚合规则 |
