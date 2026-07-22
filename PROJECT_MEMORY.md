---
project_name: "OmniPM — 自编排项目总负责人"
phase: "V2"
stage: "V2.3.0_VALIDATION"
status: "active"
created: "2026-07-21T00:00:00Z"
updated: "2026-07-22T16:00:00Z"
version: "2.3.0"
current_step: "任务#3完成：小程序首页课表展示"
last_checkpoint:
  state: "TASK_3_COMPLETE"
  timestamp: "2026-07-22T16:00:00Z"
  summary: |
    原子任务「小程序首页课表展示」完成（5/5 DAG节点）。
    新增3文件 + 修改2文件。2个REST端点（schedule/month + schedule/daily）。
    前后端14项字段对齐验证全部通过。
    run_experts(backend) 输出截断 → 手动字段对齐替代（P2偏差D-2已记录）。
  key_files:
    - "project/backend/internal/model/schedule_dto.go (新增)"
    - "project/backend/internal/service/schedule_service.go (新增)"
    - "project/backend/internal/handler/schedule_handler.go (新增)"
    - "project/backend/internal/handler/router.go (+11行)"
    - "project/backend/cmd/server/main.go (+1行)"
resume_point: |
  下一会话：继续原子任务队列，按 NEXT_SESSION_GUIDE.md §七 执行任务#4。
  任务#4推荐：Web管理后台会员管理CRUD（验证GATE硬阻断+专家评审质量）。
user_tech_level: "advanced"
estimated_completion: "ongoing"
tags:
  - "v2.3.0"
  - "cross-platform-runtime"
  - "71-tests"
  - "13-expert-enhanced"
  - "yoga-studio-validation"
  - "test-protocol"
  - "atomic-tasks"
description: |
  OmniPM v2.3.0 引擎完成，进入测试验证阶段。
  使用瑜伽馆数字AI化运营系统作为真实测试项目，
  每次对话执行一个原子任务，每节点完成后对照设计验证，
  发现偏差立即分类修复，所有验证记录存入 validation_log。

# ═══════════════════════════════════════════
# 测试验证日志（v2.3.0 新增）
# ═══════════════════════════════════════════
validation_log:
  - task: "后端登录/注册模块完善"
    date: "2026-07-22"
    dag_nodes: 5
    checks:
      meta_orion_analysis: "✅"
      dag_structure: "✅"
      expert_quality: "⚠️"
      outputs_verification: "pending"
      gate_mechanism: "pending"
      correction_loop: "✅"
      dev_selfcheck: "pending"
    deviations:
      - {check: "expert_quality", expected: "run_experts(security)返回结构化P0/P1/P2评审", actual: "3次均返回空输出，触发熔断", severity: "P2"}
    fixes_applied:
      - "熔断后手动执行安全分析替代 → 安全分析结论已移交至测试项目 project/PROJECT_MEMORY.md"
      - "router.go 变量名冲突修复(auth→authGroup/authed)"
      - "jwt.RandomBytes 导出(小写→大写)以供service包使用"
    engine_deviations_open: []
    verdict: "PASS_WITH_FIXES"

  - task: "小程序首页课表展示"
    date: "2026-07-22"
    dag_nodes: 5
    checks:
      meta_orion_analysis: "✅"
      dag_structure: "✅"
      expert_quality: "⚠️"
      outputs_verification: "✅"
      gate_mechanism: "✅"
      correction_loop: "✅"
      dev_selfcheck: "✅"
    deviations:
      - {check: "expert_quality", expected: "run_experts(backend)返回完整结构化P0/P1/P2评审", actual: "输出在读取代码阶段截断（↓1.6k tokens），无逐项审查结论", severity: "P2", target: "omnipm"}
    fixes_applied:
      - "手动逐项审查替代：SQL安全性/索引/解密安全/字段对齐/错误处理 → 14项字段对齐矩阵验证通过"
      - "新增 schedule_dto.go + schedule_service.go + schedule_handler.go"
      - "router.go 注册2个公开课表端点 + main.go 传递 aesKey"
    engine_deviations_open:
      - {id: "D-2", severity: "P2", desc: "run_experts(backend) 输出截断：评审内容在读取代码阶段中止，仅1.6K tokens", status: "待修复"}
    verdict: "PASS_WITH_FIXES"

# ═══════════════════════════════════════════
# 引擎偏差修复记录（v2.3.0）
# ═══════════════════════════════════════════
engine_fixes:
  - id: "D-2"
    severity: "P2"
    title: "run_experts(backend) 输出截断（1.6K tokens）"
    status: "待修复"
    date_opened: "2026-07-22"
    date_closed: ""
    root_cause: |
      run_experts expert=backend 评审时，子代理输出在"接下来读取已有代码模式作为一致性参照"
      步骤后中止。↓1.6K tokens远低于预期评审产出。与任务#1的D-1空输出模式相似但不同：
      非空输出，而是内容截断——子代理似乎启动了评审流程但被提前终止（exitCode=0）。
      疑似子代理上下文中的代码材料不足或读取阶段超时/被限流。
    fix: "待调查：需检查子代理日志确认终止原因（token_limit? timeout? context_error?）"
    prevention: "与D-1共享三级预防机制（CI门禁/启动自检/完整性测试）。额外考虑：增加评审超时诊断日志。"

  - id: "D-1"
    severity: "P2"
    title: "run_experts(security) 3次空输出"
    status: "已关闭"
    date_opened: "2026-07-22"
    date_closed: "2026-07-22"
    root_cause: |
      Extension 源码 index.ts 中 2 处 \n 转义序列被展平为字面换行符（行1389/1451）。
      导致 TypeScript 解析失败（ParseError: Unterminated string constant），
      Extension 无法加载，run_experts 工具未注册。
      
      更深层原因：runExpert() 启动的子进程是 `pi --mode json -p --no-session`，
      不带 -ne 参数，子进程同样尝试加载 OmniPM Extension → 同样解析失败 →
      子进程静默退出（exitCode=0 但无消息输出）→ 表象为"空输出"。
      
      腐败机制：源码文件中的 `\n`（反斜杠+n两字符）在文件保存/拷贝过程中
      被错误解释为字面换行符（0x0A），导致字符串字面量未正确闭合。
    fix: |
      - 修复行1389: .join("\n") 的字面换行 → 正确的 \n 转义
      - 修复行1451: 同上
      - 验证: pi --mode json 加载 Extension → 正常
      - 验证: 安全专家直调 + JSON mode + tools 完整链路 → exitCode=0, 560条消息
    prevention: |
      1. 新增单元测试 source-integrity.test.ts：扫描所有 .ts/.md 文件中
         正则字符串内的字面换行符（预防同类腐败回归）
      2. Extension 启动时增加自检：验证自身核心源码关键模式完整性
      3. CI 流水线中 source-integrity 测试作为第一道门禁

# ═══════════════════════════════════════════
# DAG 执行状态（保留）
# ═══════════════════════════════════════════
dag_state:
  version: "2.3.0"
  dag_id: null
  current_node: null
  completed_nodes: []
  failed_nodes: []
  blocked_nodes: []
  correction_count: {}
