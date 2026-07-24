# OmniPM v2.7.0 — 引擎企业级加固 PRD（全量27项）

> **来源**：全维度企业级审查报告 v2.6.1（3P1 + 24P2 = 27项）
> **版本**：v2.0（全覆盖版）
> **定位**："做什么" —— 逐项映射审查发现 → 可执行优化任务

---

## 1. 产品愿景

**一句话**：将 OmniPM 引擎从"功能可用"提升到"企业级可靠"——消除并发竞态、建立代码可维护性、补齐安全/数据/韧性/可观测性短板。

---

## 2. 用户角色与场景

| 角色 | 核心场景 | 频率 | 优先级 |
|------|----------|------|--------|
| OmniPM 开发者 | 新增工具/修改 Extension 逻辑/调试子代理异常 | 每版本 | P0 |
| OmniPM 维护者 | 升级引擎版本后恢复旧项目 DAG/安全审计 | 每版本 | P0 |
| Orion (AI Agent) | 并行调度多专家，并发 complete DAG 节点 | 每次项目 | P0 |
| 安全审计者 | 审查引擎依赖安全/密钥管理/输入净化 | 定期 | P1 |
| DevOps | CI/CD 配置/性能基准/部署验证 | 集成时 | P1 |

---

## 3. 功能边界（全量覆盖 27 项）

### 包含（In Scope）— 全部 27 项

#### 🏗️ 架构质量 (2项: 1P1 + 1P2)

| ID | 功能 | 来源 | 优先级 |
|----|------|------|--------|
| F1 | **巨型文件拆分**：index.ts(2294行)→tools/目录(3工具注册)+runtime/目录(辅助函数) | P1-1 | P0 |
| F2 | **跨平台适配器验证**：为 claude/gemini/codex 适配器添加平台兼容性测试用例 | P2-1 | P2 |

#### 🔒 安全加固 (3项: 3P2)

| ID | 功能 | 来源 | 优先级 |
|----|------|------|--------|
| F3 | **环境变量白名单**：`OMNIPM_EXPERT_MODEL` 等关键 env var 加入 MODEL_REGISTRY 白名单校验 | P2-2 | P1 |
| F4 | **密钥管理策略文档**：定义引擎自身凭证管理规范（API key 存储/轮换/审计） | P2-3 | P2 |
| F5 | **代码级输入净化**：在 index.ts 工具参数处理中增加注入检测（对标提示词层 §1.2 规则） | P2-4 | P1 |

#### 🔀 并发安全 (3项: 1P1 + 2P2)

| ID | 功能 | 来源 | 优先级 |
|----|------|------|--------|
| F6 | **DAG 原子写入**：临时文件→fsync→rename 模式，消除并发 complete 竞态 | P1-2 | P0 |
| F7 | **spawn 超时保护**：子代理进程可配置超时（默认300s），超时后 SIGTERM→SIGKILL 优雅终止 | P2-5 | P1 |
| F8 | **correctionCount 原子操作**：将 correctionCount 的读-改-写封装为原子函数 | P2-6 | P1 |

#### 📝 代码逻辑 (3项: 3P2)

| ID | 功能 | 来源 | 优先级 |
|----|------|------|--------|
| F9 | **modelConfig 初始化统一**：将 execute handler 和 runExpert() 中的 modelConfig 获取统一为一个入口函数 | P2-7 | P1 |
| F10 | **异常日志替换静默吞噬**：所有 `catch { /* ignore */ }` 改为写入诊断日志（EventLogger） | P2-8 | P1 |
| F11 | **DAG start 依赖检查强化**：start 时验证全部 dependsOn 已 done，未满足→返回阻塞原因+缺失节点列表 | P2-9 | P1 |

#### 🗄️ 数据层 (4项: 1P1 + 3P2)

| ID | 功能 | 来源 | 优先级 |
|----|------|------|--------|
| F12 | **Schema 版本迁移**：version→migration 映射表，启动时自动检测并迁移旧 DAG 格式 | P1-3 | P0 |
| F13 | **CDL 缓存 TTL 策略**：为 CDLCache 添加可配置 TTL（默认24h），过期自动清除 | P2-10 | P1 |
| F14 | **PROJECT_MEMORY.md 结构化增强**：YAML frontmatter 中 dag_state 自动同步（omni_dag complete/fail 时写入） | P2-11 | P2 |
| F15 | **数据库抽象设计文档**：输出多用户场景的数据库抽象方案（不实现代码，仅设计文档） | P2-12 | P2 |

#### 🔗 API 契约 (2项: 2P2)

| ID | 功能 | 来源 | 优先级 |
|----|------|------|--------|
| F16 | **Schema 强约束**：experts 数组添加 minItems=1/maxItems=8；nodeId 从 Optional 改为条件 Required | P2-13/14 | P1 |
| F17 | **API 文档自动生成**：从 TypeBox Schema 自动生成工具参数文档（或至少手动维护一致性检查） | — | P2 |

#### 📦 依赖安全 (3项: 3P2)

| ID | 功能 | 来源 | 优先级 |
|----|------|------|--------|
| F18 | **protobufjs CVE 缓解**：锁定 `@earendil-works/pi-coding-agent` 版本至已修复版或添加 .npmrc overrides | P2-15 | P1 |
| F19 | **npm audit CI 集成**：在 vitest 配置中增加 `npm audit --audit-level=moderate` 检查步骤 | P2-16 | P1 |
| F20 | **lockfile 完整性校验**：增加 `npm ci` 验证 + package-lock.json hash 校验脚本 | P2-17 | P2 |

#### 🏢 企业就绪 (7项: 7P2)

| ID | 功能 | 来源 | 优先级 |
|----|------|------|--------|
| F21 | **事件日志持久化**：EventLogger 环形缓冲区溢出时自动写入磁盘（.pi/events/ 目录） | P2-18 | P1 |
| F22 | **复盘引擎自动挂钩**：omni_dag 全部节点 done→自动触发 retrospective.createRecord() | P2-19 | P1 |
| F23 | **跨平台测试补全**：为 claude/gemini 适配器添加单元测试（mock 模式） | P2-20 | P2 |
| F24 | **E2E 烟雾测试**：最小 DAG（init→start→complete→status）端到端验证脚本 | P2-21 | P1 |
| F25 | **性能基准测试**：对 mapConcurrency/spawn/原子写入 添加 vitest bench 基准 | P2-22 | P2 |
| F26 | **引擎 CI 配置**：基于 ci_templates.md frontend-node 模板，为 omnipm-orion 创建 GitHub Actions | P2-23 | P1 |
| F27 | **代码完整性校验**：Extension 入口文件 SHA256 校验和，启动时验证 | P2-24 | P2 |

### 不包含（Out of Scope）

> 无。全部 27 项均纳入范围，按优先级分阶段执行。

---

## 4. 分阶段执行策略

### Phase A — 核心加固（P0/P1，16 项）

```
P0 (3项): F1(文件拆分) + F6(原子写入) + F12(Schema迁移)
P1 (13项): F3 + F5 + F7 + F8 + F9 + F10 + F11 + F13 + F16 + F18 + F19 + F21 + F22 + F24 + F26
```

### Phase B — 完善增强（P2，11 项）

```
P2 (11项): F2 + F4 + F14 + F15 + F17 + F20 + F23 + F25 + F27
```

---

## 5. 非功能需求

| 维度 | 要求 |
|------|------|
| 性能 | 原子写入延迟 <50ms；spawn 超时不影响正常流程 |
| 兼容性 | Schema 迁移后 94 测试全部通过；旧项目 DAG 状态可恢复 |
| 安全 | 异常日志不泄露密钥/路径；环境变量白名单防止注入 |
| 可观测性 | 所有 catch 块记录到 EventLogger；复盘记录自动生成 |
| CI/CD | GitHub Actions 含 npm audit + vitest + SHA256 校验 |

---

## 6. 术语表

| 术语 | 定义 |
|------|------|
| 原子写入 | write-to-temp → fsync → atomic-rename |
| Schema 迁移 | 检测版本号 → 应用迁移函数链 → 保存新版本 |
| 熔断 | 同节点失败 3 次 → blocked，需人工介入 |
| 静默吞噬 | `catch { /* ignore */ }` 无日志记录 |
| CDL | Capability Discovery Layer，能力自发现层 |
