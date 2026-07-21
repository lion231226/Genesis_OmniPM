# OmniPM Expert Review Aggregation Algorithm v2.1.0

> **用途**：将多位专家的独立评审输出聚合为单一综合决议  
> **依赖**：expert_output_schema.json, roles_registry.md  
> **核心原则**：worstCaseWins + BLOCKED传播 + 语义去重 + 熔断保护

---

## 一、聚合流水线总览

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────────┐    ┌──────────────┐
│ Stage 1     │    │ Stage 2          │    │ Stage 2.5       │    │ Stage 3          │    │ Stage 4      │
│ 收集+验证   │───→│ 综合裁决        │───→│ 语义去重        │───→│ BLOCKED传播      │───→│ 生成聚合报告 │
│             │    │ (worstCaseWins)  │    │ (category+title)│    │ (下游节点门控)   │    │              │
└─────────────┘    └──────────────────┘    └─────────────────┘    └──────────────────┘    └──────────────┘
```

---

## 二、Stage 1: 收集与验证 (Collect & Validate)

### 2.1 输入

```typescript
interface AggregationInput {
  nodeId: string;                        // 当前DAG节点ID
  reviewResults: ExpertOutput[];         // 所有已激活专家的评审输出
  dagState: DAGState;                    // 当前DAG拓扑状态
  expectedExperts: ExpertConfig[];       // roles_registry §5 激活决策表输出的期望专家列表
}
```

### 2.2 验证步骤

```
FUNCTION validateInputs(input: AggregationInput): ValidationResult
  // Step 1: 检查专家覆盖率
  actualExpertIds = input.reviewResults.map(r => r.meta.expertId)
  expectedExpertIds = input.expectedExperts.map(e => e.role_id)
  missingExperts = expectedExpertIds - actualExpertIds
  
  IF missingExperts.length > 0 THEN
    // 缺专家 → 聚合状态降级
    RETURN { status: "PARTIAL", missingExperts, warning: "部分专家未返回评审结果" }
  END IF
  
  // Step 2: 验证每个评审输出的 parseQuality
  FOR EACH review IN input.reviewResults DO
    IF review.assessment.parseQuality.status == "FALLBACK" THEN
      // 兜底解析 → 标记为低置信度
      review.assessment.confidenceScore *= 0.5  // 置信度折半
      ADD_WARNING("专家 {review.meta.expertId} 使用了fallback解析")
    ELSE IF review.assessment.parseQuality.status == "DEGRADED" THEN
      ADD_WARNING("专家 {review.meta.expertId} 输出部分字段缺失: {review.assessment.parseQuality.fieldsMissing}")
    END IF
  END FOR
  
  // Step 3: 验证 findingId 格式
  FOR EACH review IN input.reviewResults DO
    IF NOT review.findingId MATCHES /^FINDING-[a-zA-Z0-9_-]+-[A-Z_]+-[a-f0-9]{8}$/ THEN
      RETURN { status: "INVALID", error: "findingId格式错误: {review.findingId}" }
    END IF
  END FOR
  
  RETURN { status: "VALID" }
```

---

## 三、Stage 2: 综合裁决 (Overall Verdict — worstCaseWins)

### 3.1 裁决优先级

```
worstCaseWins 排序（从最严重到最宽松）:

  BLOCKED  >  REVISE  >  APPROVE_WITH_CONDITIONS  >  APPROVE
  (阻塞)      (需修改)    (有条件通过)                 (通过)
```

### 3.2 聚合算法

```
FUNCTION aggregateVerdict(reviews: ExpertOutput[]): AggregatedVerdict
  
  // Step 1: 收集所有个体裁决
  verdicts = reviews.map(r => r.assessment.overallVerdict)
  
  // Step 2: worstCaseWins 判定
  IF "BLOCKED" IN verdicts THEN
    overallVerdict = "BLOCKED"
  ELSE IF "REVISE" IN verdicts THEN
    overallVerdict = "REVISE"
  ELSE IF "APPROVE_WITH_CONDITIONS" IN verdicts THEN
    overallVerdict = "APPROVE_WITH_CONDITIONS"
  ELSE
    overallVerdict = "APPROVE"
  END IF
  
  // Step 3: 统计分布
  distribution = {
    BLOCKED: count(verdicts, "BLOCKED"),
    REVISE: count(verdicts, "REVISE"),
    APPROVE_WITH_CONDITIONS: count(verdicts, "APPROVE_WITH_CONDITIONS"),
    APPROVE: count(verdicts, "APPROVE")
  }
  
  // Step 4: 识别阻断专家（投票BLOCKED的专家）
  blockingExperts = reviews
    .filter(r => r.assessment.overallVerdict == "BLOCKED")
    .map(r => ({ expertId: r.meta.expertId, reason: r.assessment.thinkingProcess }))
  
  // Step 5: 严重等级汇总
  totalP0 = SUM(reviews.map(r => r.assessment.severitySummary.P0_BLOCKING))
  totalP1 = SUM(reviews.map(r => r.assessment.severitySummary.P1_IMPORTANT))
  totalP2 = SUM(reviews.map(r => r.assessment.severitySummary.P2_SUGGESTION))
  
  RETURN {
    overallVerdict,
    distribution,
    blockingExperts,
    severitySummary: { P0_BLOCKING: totalP0, P1_IMPORTANT: totalP1, P2_SUGGESTION: totalP2 },
    expertCount: reviews.length,
    avgConfidence: AVERAGE(reviews.map(r => r.assessment.confidenceScore))
  }
```

### 3.3 裁决语义

| 聚合裁决 | 含义 | DAG行为 |
|---------|------|---------|
| **BLOCKED** | 至少1位专家认为存在必须解决的阻塞性问题 | 当前节点 → CORRECT状态；下游节点 → BLOCKED传播 |
| **REVISE** | 无阻塞问题，但有重要问题需在当前阶段修 | 当前节点 → CORRECT状态（触发闭环修正）|
| **APPROVE_WITH_CONDITIONS** | 可推进，但附条件（条件在下阶段检查）| 当前节点 → DONE；条件注入下游节点 success_criteria |
| **APPROVE** | 全部专家一致通过 | 当前节点 → DONE；无附加条件 |

---

## 四、Stage 2.5: 语义去重 (Semantic Deduplication)

### 4.1 去重原理

不同专家可能独立发现相同/高度相似的问题。通过 `(category, normalizedTitle)` 配对识别重复发现，合并为一条综合意见，同时保留每位专家的原始视角。

### 4.2 去重算法

```
FUNCTION semanticDeduplicate(findings: Finding[]): DedupResult
  
  // Step 1: 按 (category, normalizedTitle) 分组
  groups = GROUP_BY(findings, f => (f.category, f.normalizedTitle))
  
  // Step 2: 对每组进行去重判定
  uniqueFindings = []
  duplicateMap = {}  // original_id → canonical_id 映射
  
  FOR EACH (key, group) IN groups DO
    IF group.length == 1 THEN
      // 孤立发现 → 直接保留
      uniqueFindings.APPEND(group[0])
    ELSE
      // 多个专家报告了相同问题 → 合并
      merged = mergeFindingGroup(group)
      uniqueFindings.APPEND(merged)
      
      // 记录映射关系（用于追溯）
      FOR EACH f IN group DO
        duplicateMap[f.id] = merged.id
      END FOR
    END IF
  END FOR
  
  RETURN { uniqueFindings, duplicateMap, 
            originalCount: findings.length, 
            dedupedCount: uniqueFindings.length,
            dedupRatio: uniqueFindings.length / findings.length }
```

### 4.3 合并策略 (mergeFindingGroup)

```
FUNCTION mergeFindingGroup(group: Finding[]): MergedFinding
  
  // Step 1: 取最高严重等级（worstCaseWins 原则）
  severityPriority = ["P0_BLOCKING", "P1_IMPORTANT", "P2_SUGGESTION"]
  mergedSeverity = group[0].severity
  FOR EACH f IN group DO
    IF severityPriority.indexOf(f.severity) < severityPriority.indexOf(mergedSeverity) THEN
      mergedSeverity = f.severity
    END IF
  END FOR
  
  // Step 2: 使用第一个发现的 title 和 normalizedTitle
  // （因为归一化后标题应该相同/高度相似）
  mergedTitle = group[0].title
  mergedNormalizedTitle = group[0].normalizedTitle
  mergedCategory = group[0].category
  
  // Step 3: 合并 detail — 拼接所有专家的观点
  mergedDetail = ""
  FOR EACH f IN group DO
    mergedDetail += "[{f.sourceExpert}] {f.detail}\n"
  END FOR
  
  // Step 4: 合并 suggestion — 取所有建议的去重并集
  allSuggestions = UNIQUE(group.flatMap(f => f.suggestion))
  mergedSuggestion = allSuggestions.join(" | ")
  
  // Step 5: 记录来源专家
  sourceExperts = group.map(f => f.sourceExpert)
  
  // Step 6: 记录合并前的原始ID
  sourceFindingIds = group.map(f => f.id)
  
  RETURN {
    id: "MERGED-" + UUID(),
    severity: mergedSeverity,
    category: mergedCategory,
    normalizedTitle: mergedNormalizedTitle,
    title: mergedTitle,
    detail: mergedDetail,
    suggestion: mergedSuggestion,
    sourceExperts,
    sourceFindingIds,
    isMerged: true,
    mergeCount: group.length
  }
```

### 4.4 相似度阈值（可选增强）

当 `normalizedTitle` 不完全一致但语义高度相似时，可使用编辑距离作为辅助判定：

```
FUNCTION normalizedSimilarity(a: string, b: string): float
  // Levenshtein 距离归一化
  distance = levenshtein(a, b)
  maxLen = MAX(a.length, b.length)
  similarity = 1 - (distance / maxLen)
  RETURN similarity
```

**阈值建议**：similarity ≥ 0.85 且 category 相同 → 视为重复。

---

## 五、Stage 3: BLOCKED 传播 (Blocked Propagation)

### 5.1 传播规则

当聚合裁决为 `BLOCKED` 时，所有直接或间接依赖当前节点的下游节点自动进入 `BLOCKED` 状态。

```
FUNCTION propagateBlocked(input: AggregationInput, verdict: AggregatedVerdict): BlockedPropagationResult
  
  IF verdict.overallVerdict != "BLOCKED" THEN
    RETURN { affectedNodes: [], propagationDepth: 0 }
  END IF
  
  currentNodeId = input.nodeId
  dagState = input.dagState
  
  // Step 1: BFS 遍历下游依赖图
  affectedNodes = []
  queue = [currentNodeId]
  visited = SET()
  
  WHILE queue IS NOT EMPTY DO
    current = queue.DEQUEUE()
    IF current IN visited THEN CONTINUE
    visited.ADD(current)
    
    // 跳过当前节点自身
    IF current != currentNodeId THEN
      affectedNodes.APPEND(current)
    END IF
    
    // 找到所有依赖 current 的节点
    FOR EACH node IN dagState.nodes DO
      IF node.dependsOn CONTAINS current AND node.status != "BLOCKED" THEN
        queue.ENQUEUE(node.nodeId)
      END IF
    END FOR
  END WHILE
  
  // Step 2: 更新受影响节点的状态
  propagationEvents = []
  FOR EACH nodeId IN aff

  END WHILE
  
  // Step 2: Update affected nodes
  propagationEvents = []
  FOR EACH nodeId IN affectedNodes DO
    OLD_STATUS = dagState.getNode(nodeId).status
    dagState.setNodeStatus(nodeId, 'BLOCKED')
    propagationEvents.APPEND({nodeId, previousStatus: OLD_STATUS, newStatus: 'BLOCKED', blockedBy: currentNodeId, reason: 'Upstream node ' + currentNodeId + ' aggregated as BLOCKED'})
  END FOR
  
  propagationDepth = MAX(affectedNodes.map(n => dagState.distanceFrom(currentNodeId, n)))
  RETURN { affectedNodes, propagationEvents, propagationDepth }

### 5.2 BLOCKED Propagation Example
If node_2 aggregates to BLOCKED, all direct dependents (node_3, node_4, node_5) become BLOCKED.

### 5.3 BLOCKED Release
When the blocking node is fixed, downstream nodes are released back to READY if no other upstream blockers remain.

---

## Stage 4: Aggregation Report Generation
Output format as AggregationReport (see §6.1 in algorithm spec). Key fields: overallVerdict, dedupStats, findings (after semantic dedup), blockedPropagation, participatingExperts, qualityIndicators, recommendedAction.

## Circuit Breaker
After 3 corrections on same node → escalate to Meta-Orion. Cascade breaker triggers when 3 consecutive nodes all need corrections → systemic issue suspected.

## Key Design Decisions
| Decision | Choice | Rationale |
|----------|--------|-----------|
| Verdict aggregation | worstCaseWins | Safety-first: any expert finding a blocker must halt progress |
| Dedup granularity | (category, normalizedTitle) | Precise enough to identify synonyms without over-merging |
| BLOCKED propagation | Forward (downstream) | Blocking current stage invalidates subsequent stage inputs |
| Merge principle | Highest severity + union of suggestions | Preserve strictest assessment while respecting all views |
| Breaker threshold | 3 retries | Consistent with dynamic_orchestrator.md v4.4 |
| Missing expert policy | PARTIAL degradation | Don't block flow but reduce confidence + warn |

---

*Version: v2.1.0 | Related: dynamic_orchestrator.md, roles_registry.md v5, expert_output_schema.json*
