# OmniPM v2.2.0 跨平台运行时架构设计

> Orion v2.2.0 | P2-2 | 完整版多平台 Agent 编排框架

---

## 一、设计目标

将 OmniPM 从 Pi Agent 专属引擎升级为**多平台 Agent 编排框架**。

| 目标 | 说明 |
|------|------|
| 平台无关核心 | Meta-Orion 分析、DAG 引擎、闭环修正 → 不依赖特定平台 |
| 可插拔适配器 | 每种平台一个适配器，实现统一接口 |
| Pi 零退化 | 重构后 Pi 平台体验不降级 |
| 测试可验证 | 抽象接口 = 可 mock → 核心逻辑可脱离平台测试 |

## 二、核心架构：抽象运行时接口（ARI）

```
┌─────────────────────────────────────────────────────┐
│              OmniPM Core（平台无关）                    │
│  ┌───────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Meta-Orion │  │ DAG 引擎  │  │ 闭环修正引擎      │  │
│  │ 分析引擎    │  │ 状态管理  │  │ 根因分析+回退     │  │
│  └───────────┘  └──────────┘  └──────────────────┘  │
│                         │                            │
│  ┌─────────────────────▼──────────────────────────┐ │
│  │        Abstract Runtime Interface (ARI)         │ │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────┐  │ │
│  │  │ToolCall   │ │Subagent  │ │FileSystem      │  │ │
│  │  │Interface  │ │Interface │ │Interface       │  │ │
│  │  └──────────┘ └──────────┘ └────────────────┘  │ │
│  └─────────────────────┬──────────────────────────┘ │
└─────────────────────────┼───────────────────────────┘
                          │
    ┌─────────────────────┼───────────────────────────┐
    │            Platform Adapters                     │
    │  ┌──────────┐  ┌───────────┐  ┌──────────────┐  │
    │  │ Pi       │  │ Claude    │  │ Gemini       │  │
    │  │ Adapter  │  │ Adapter   │  │ Adapter      │  │
    │  │ (Native) │  │ (Tool Use)│  │ (Function    │  │
    │  │          │  │           │  │  Calling)    │  │
    │  └──────────┘  └───────────┘  └──────────────┘  │
    └─────────────────────────────────────────────────┘
```

## 三、ARI 接口定义

### 3.1 ToolCallInterface

```typescript
interface IToolCall {
  /** 平台无关的工具名 */
  name: string;
  /** 工具参数（JSON schema 定义） */
  parameters: Record<string, unknown>;
  /** 执行工具调用 */
  execute(params: unknown, context: RuntimeContext): Promise<ToolResult>;
}

interface ToolResult {
  content: Array<{ type: "text" | "image"; text?: string; data?: string }>;
  details?: Record<string, unknown>;
}
```

### 3.2 SubagentInterface

```typescript
interface ISubagentRuntime {
  /** 启动子代理进程/会话 */
  spawn(config: SubagentConfig): Promise<SubagentProcess>;
  /** 列出可用代理 */
  listAgents(scope: "omnipm" | "user" | "both"): Promise<AgentConfig[]>;
  /** 向子代理发送消息 */
  send(processId: string, message: Message): Promise<void>;
  /** 接收子代理响应 */
  receive(processId: string): Promise<Message>;
  /** 终止子代理 */
  kill(processId: string): Promise<void>;
}

interface SubagentConfig {
  name: string;
  systemPrompt: string;
  model?: string;
  tools?: string[];
  contextFiles?: string[];
}
```

### 3.3 FileSystemInterface

```typescript
interface IFileSystem {
  read(path: string, encoding?: string): Promise<string>;
  write(path: string, content: string): Promise<void>;
  exists(path: string): Promise<boolean>;
  mkdir(path: string): Promise<void>;
  glob(pattern: string): Promise<string[]>;
  /** 项目根目录 */
  cwd: string;
}
```

### 3.4 完整 RuntimeContext

```typescript
interface RuntimeContext {
  /** 当前平台标识 */
  platform: "pi" | "claude" | "gemini" | "unknown";
  /** 工具调用能力 */
  tools: IToolRegistry;
  /** 子代理管理 */
  subagent: ISubagentRuntime;
  /** 文件系统 */
  fs: IFileSystem;
  /** 会话持久化 */
  storage: IStorage;
  /** 事件总线 */
  events: IEventBus;
  /** 用户交互 */
  ui: IUserInterface;
}
```

## 四、平台适配器

### 4.1 Pi Adapter（原生实现）

```typescript
class PiAdapter implements ISubagentRuntime, IToolRegistry {
  // 直接使用 Pi Extension API:
  // - pi.registerTool() → IToolRegistry
  // - spawn('pi', ...) → ISubagentRuntime.spawn()
  // - pi.events → IEventBus
  // - fs 模块 → IFileSystem
  
  // Pi 是最完整的实现，其他平台逐步对齐
}
```

### 4.2 Claude Adapter（设计）

```typescript
class ClaudeAdapter implements ISubagentRuntime, IToolRegistry {
  // 映射策略:
  // - Subagent → Claude 的 SubAgent 机制（Claude Code）
  //   或 → 独立 API 调用（Claude API）
  // - Tool → Claude Tool Use (function calling)
  // - run_experts → 并行/链式 Claude subagent 调用
  // - omni_dag → JSON 文件持久化（Claude 无原生 DAG）
  // - 文件系统 → Claude Code 的工作区文件访问
  
  // 限制:
  // - 进程隔离: Claude API 无原生进程 fork，用独立请求模拟
  // - 并发控制: 需自行实现 maxConcurrency
  // - 事件系统: Claude 无事件总线，用轮询/回调模拟
}
```

### 4.3 Gemini Adapter（设计）

```typescript
class GeminiAdapter implements ISubagentRuntime, IToolRegistry {
  // 映射策略:
  // - Subagent → Gemini CLI subprocess / Gemini API
  // - Tool → Gemini Function Calling
  // - run_experts → 并行 API 调用
  // - 文件系统 → Gemini CLI 的文件访问能力
  
  // 限制:
  // - 与 Claude 类似，API 模式下需自行实现进程管理
  // - Gemini 上下文窗口较大（1M+），可承载更多上下文
}
```

## 五、目录结构

```
omnipm-orion/extensions/omnipm/
├── index.ts                    # Extension 入口（不变）
├── agents.ts                   # Agent 发现（不变）
│
├── core/                       # ★ 平台无关核心
│   ├── meta-orion.ts           # Meta-Orion 分析引擎
│   ├── dag-engine.ts           # DAG 状态机 + 验证器
│   ├── correction-loop.ts      # 闭环修正引擎
│   └── cdl-engine.ts           # CDL 能力自发现
│
├── runtime/                    # ★ 抽象运行时
│   ├── interface.ts            # ARI 全部接口定义
│   ├── context.ts              # RuntimeContext 工厂
│   ├── tool-registry.ts        # 平台无关工具注册表
│   └── types.ts                # 共享类型
│
├── adapters/                   # ★ 平台适配器
│   ├── pi/
│   │   ├── index.ts            # PiAdapter 主类
│   │   ├── subagent.ts         # Pi ISubagentRuntime 实现
│   │   ├── tools.ts            # Pi IToolRegistry 实现
│   │   └── filesystem.ts       # Pi IFileSystem 实现
│   ├── claude/
│   │   └── index.ts            # ClaudeAdapter（设计阶段）
│   └── gemini/
│       └── index.ts            # GeminiAdapter（设计阶段）
│
├── tools/                      # ★ 平台无关工具定义
│   ├── run-experts.ts          # run_experts 核心逻辑
│   ├── omni-dag.ts             # omni_dag 核心逻辑
│   └── schemas.ts              # 工具参数 Schema
│
└── __tests__/                  # ★ 测试
    ├── core/                   # 核心逻辑测试
    ├── runtime/                # 运行时接口测试
    ├── adapters/               # 适配器测试
    ├── tools/                  # 工具测试
    └── fixtures/               # 测试夹具
        ├── mock-runtime.ts     # Mock 运行时
        └── sample-dag.json     # 示例 DAG 数据
```

## 六、分阶段实施路线

### Phase 1（本轮 v2.2.0）：架构奠基
- ✅ ARI 接口定义 + 类型系统
- ✅ Pi Adapter 重构（将现有代码适配到 ARI）
- ✅ 单元测试框架搭建
- ✅ Claude/Gemini 适配器设计文档

### Phase 2（v2.3.0）：Claude 适配器
- Claude Adapter 实现
- Claude 平台端到端测试
- 平台差异处理（Claude 特有约束）

### Phase 3（v2.4.0）：Gemini 适配器
- Gemini Adapter 实现
- Gemini 平台端到端测试
- 跨平台行为一致性验证

### Phase 4（v2.5.0）：生态完善
- 跨平台 DAG 模板
- 平台自动检测
- 平台能力降级策略

## 七、关键设计决策

| 决策 | 结论 | 理由 |
|------|------|------|
| 抽象层位置 | 工具调用 + 子代理 + 文件系统 | 三个维度覆盖 OmniPM 核心能力 |
| Pi 重构策略 | 渐进式提取，不破坏现有功能 | 保持 Pi 平台零退化 |
| 跨平台测试 | Mock Runtime + 快照测试 | 不依赖真实多平台环境即可验证 |
| 适配器加载 | 运行时检测 + 手动指定 | 自动检测优先，允许手动覆盖 |
| 平台差异 | 能力矩阵 + 降级策略 | 不同平台能力不对称，需优雅降级 |
