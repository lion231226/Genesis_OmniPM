# OmniPM v2.2.0 — Claude/Gemini 适配器设计

> P2-2 | 设计阶段 | Phase 2/3 实现参考

---

## 一、设计原则

1. **ARI 一致性**：所有适配器实现相同的 `ISubagentRuntime` 接口
2. **平台能力声明**：通过 `PlatformCapabilities` 矩阵透明暴露差异
3. **降级策略**：平台不支持的功能 → 优雅降级而非报错
4. **渐进实现**：先跑通核心流程（DAG + run_experts），再完善边缘功能

---

## 二、Claude 适配器

### 2.1 平台特性

| 特性 | Claude Code (CLI) | Claude API |
|------|-------------------|------------|
| 工具调用 | Tool Use (MCP + 内置工具) | Tool Use (API) |
| 子代理 | SubAgent 机制 | 无原生支持 |
| 进程隔离 | ✅ (CLI 模式) | ❌ (API 请求隔离) |
| 文件系统 | ✅ 工作区读写 | ❌ (需自行实现) |
| 事件总线 | ❌ | ❌ |
| 并发 | ⚠️ 有限 | ⚠️ 受 API rate limit |

### 2.2 工具映射

```typescript
// ClaudeAdapter 的工具映射表
const CLAUDE_TOOL_MAP = {
  // OmniPM → Claude Tool Use
  run_experts: {
    name: "run_experts",
    description: "调度 OmniPM 专家子代理进行评审",
    // Claude 端通过 SubAgent 或 API 调用实现
  },
  omni_dag: {
    name: "omni_dag",
    description: "管理 DAG 执行状态",
    // Claude 端操作 .pi/omnipm_dag_state.json 文件
  },
};
```

### 2.3 子代理实现策略

由于 Claude API 无原生进程 fork，子代理采用**独立 API 请求**方式：

```
Orion (Claude) 调用 run_experts
  → ClaudeAdapter.spawn()
    → 构建子代理系统提示词（专家 role + DAG_CONTEXT）
    → 发起独立 Anthropic API 请求
    → 等待响应 → 解析为 ExpertResult
    → 返回给 Orion

并行模式: Promise.all([apiReq1, apiReq2, ...])
链式模式: for-loop + {previous} 上下文传递
```

**限制**：
- 并发数受 Claude API rate limit 限制（默认 1-2 并发）
- 每次子代理调用是独立请求，无状态共享
- 上下文通过提示词传递（非共享内存）

### 2.4 GATE 门控实现

Claude Code 模式下，GATE 通过 `ask_user` 工具实现暂停：

```
// GATE-DESIGN 块输出后
Orion: 输出 GATE-DESIGN 块
  → 调用 ask_user({ question: "请确认执行计划" })
  → Claude 暂停，等待用户回复
  → 用户回复后继续
```

### 2.5 限制与降级

| 功能 | Pi 原生 | Claude 降级 |
|------|---------|-------------|
| 进程隔离 | ✅ fork | ⚠️ 独立 API 请求（弱隔离） |
| 并发 4 专家 | ✅ spawnParallel | ⚠️ 受 rate limit，建议串行 |
| 事件总线 | ✅ pi.events | ❌ 无（用文件轮询代替） |
| DAG 持久化 | ✅ 内存 + JSON | ✅ JSON 文件 |
| 实时输出流 | ✅ stdout pipe | ❌ 请求-响应模式 |

---

## 三、Gemini 适配器

### 3.1 平台特性

| 特性 | Gemini CLI | Gemini API |
|------|------------|------------|
| 工具调用 | Function Calling | Function Calling |
| 子代理 | 无原生支持 | 无原生支持 |
| 上下文窗口 | - | **1M+ tokens** ⭐ |
| 文件系统 | ⚠️ 有限 | ❌ |
| 并发 | - | 受 API quota 限制 |

### 3.2 Gemini 特有优势

- **1M+ 上下文窗口**：可在单个请求中承载完整 DAG 状态 + 全部上游上下文 → 子代理无需紧凑裁剪
- **原生 Function Calling**：与 Pi/Claude 的 Tool Use 语义接近
- **Google 生态集成**：可对接 Google Sheets（报表）、Google Calendar（排课）

### 3.3 工具映射

```typescript
const GEMINI_TOOL_DECLARATIONS = [
  {
    name: "run_experts",
    description: "调度 OmniPM 专家子代理进行独立评审",
    parameters: {
      type: "object",
      properties: {
        experts: { type: "array", items: { type: "object" } },
        intensity: { type: "string", enum: ["LIGHT", "STANDARD", "DEEP", "PAIR"] },
      },
    },
  },
  {
    name: "omni_dag",
    description: "管理 DAG 执行状态",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: ["init", "start", "complete", "fail", "status", "reset"] },
      },
    },
  },
];
```

### 3.4 大上下文利用策略

```
常规平台 (200K ctx):
  DAG_CONTEXT 需裁剪 → 上游 dist≤2 + 下游 dist≤1 + 兄弟摘要

Gemini (1M+ ctx):
  可注入完整 DAG 状态 + 全部13位专家定义 + 项目记忆 + 设计文档
  → 更准确的评审和决策
```

### 3.5 限制

- Function Calling 响应格式与 Claude Tool Use 不同 → 需适配解析层
- 子代理同样无原生进程 fork → 用并行 API 请求模拟
- 无文件系统原生访问 → JSON 文件持久化

---

## 四、适配器注册与自动检测

```typescript
// 适配器注册表
const ADAPTER_REGISTRY: Record<Platform, () => Promise<ISubagentRuntime>> = {
  pi: async () => new PiAdapter(),
  claude: async () => new ClaudeAdapter(),
  gemini: async () => new GeminiAdapter(),
  unknown: async () => { throw new Error("Unknown platform"); },
};

// 自动检测
function detectPlatform(): Platform {
  if (process.env.PI_AGENT) return "pi";
  if (process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_CODE) return "claude";
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) return "gemini";
  return "unknown";
}
```

---

## 五、实施路线

### Phase 2: Claude 适配器（v2.3.0）

```
1. [ ] ClaudeAdapter 类实现（ISubagentRuntime 接口）
2. [ ] Claude Tool Use 工具注册（run_experts + omni_dag）
3. [ ] 独立 API 请求子代理实现
4. [ ] ask_user GATE 门控
5. [ ] CLI 模式端到端测试（瑜伽馆项目）
6. [ ] API 模式端到端测试
7. [ ] 降级策略验证
```

### Phase 3: Gemini 适配器（v2.4.0）

```
1. [ ] GeminiAdapter 类实现
2. [ ] Function Calling 声明
3. [ ] 大上下文优化策略
4. [ ] 端到端测试
5. [ ] Google 生态集成（可选）
```

### Phase 4: 跨平台一致性验证（v2.5.0）

```
1. [ ] 同一项目在 3 个平台分别执行
2. [ ] DAG 结构一致性对比
3. [ ] 专家输出一致性评分
4. [ ] 平台差异文档
```
