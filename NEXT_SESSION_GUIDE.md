# OmniPM 新对话引导词 v2.7.0

> **当前版本**：v2.7.0
> **当前进度**：v2.7.0 引擎加固完成(27/27) + 瑜伽馆 Slice2 积分引擎交付(10/10)
> **下一任务**：Slice3 会员卡模块 或 v2.8.0 引擎完善

---

## 一、项目概要

**OmniPM v2.7.0** — Context Engineering 多 Agent 编排引擎。

- v2.7.0 引擎加固已交付：5新文件 + 4文档 + 97测试 ✅
- 瑜伽馆测试验证：Slice1(约课) ✅ | Slice2(积分) ✅ | Slice3-6 待续
- 仓库：`lion231226/Genesis_OmniPM`（引擎）+ `yoga-studio`（测试项目）

---

## 二、当前偏差状态

```
已关闭: 27/27项（v2.7.0引擎加固全部完成）
已关闭: D-1(run_experts空输出), D-2(输出截断), DEV-10(modelConfig)
进行中: 无
```

---

## 三、下一对话执行计划

```
选项A: Slice3 会员卡模块（瑜伽馆继续验证）
选项B: v2.8.0 引擎完善（F5输入净化深度/F7超时完整/F13 TTL/P2增强落地的11项）
```

---

## 四、核心执行原则

```
1. Meta-Orion分析 → PRD → CDL → SPEC → DAG → GATE-DESIGN → 执行
2. 每个 REVIEW 节点 dispatch 子代理 → run_experts
3. 检查 dag_suggestion → 非 complete → omni_dag fail → 闭环修正
4. omni_dag complete（必须带 outputs 参数）
5. 熔断保护 → 3次失败请求用户介入
```

## 五、新对话启动指令

```
@OMNIPM_SYSTEM_PROMPT.md

你是 Orion v2.7.0。新会话启动。

读取:
1. PROJECT_MEMORY.md — 项目状态
2. NEXT_SESSION_GUIDE.md — 本文件
3. OMNIPM_SYSTEM_PROMPT.md — 系统提示词

根据用户需求选择 Slice3 或 v2.8.0 方向。
```
