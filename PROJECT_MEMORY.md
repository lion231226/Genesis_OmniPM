---
project_name: "OmniPM — 自编排项目总负责人"
phase: "V2"
stage: "V2.5.0_DEV4.1_QUALITY_SCORING_ACTIVE"
status: "active"
created: "2026-07-21T00:00:00Z"
updated: "2026-07-24T10:50:00Z"
version: "2.7.0"
current_step: "v2.7.0引擎加固(27/27)+瑜伽馆Slice2积分引擎(10/10)全部交付 | 下一: Slice3会员卡 或 v2.8.0引擎完善"
last_checkpoint:
  state: "V2.7.0_SLICE2_DELIVERED"
  timestamp: "2026-07-24T10:50:00Z"
  summary: |
    【v2.7.0】27项引擎加固全部完成: 5新文件+4文档+2脚本+1CI配置, 97/97测试通过。
    【Slice2】瑜伽馆积分引擎10节点交付: 12文件~1200行代码, 3新表+4端点+3自动触发。
    核心架构修复: 依赖图单向无环(index→{omni-dag,run-experts}→shared→runtime)。
  key_files:
    - "omnipm-orion/extensions/omnipm/tools/shared.ts"
    - "omnipm-orion/extensions/omnipm/runtime/migrations.ts"
    - "omnipm-orion/extensions/omnipm/runtime/diagnostics.ts"
    - "omnipm-orion/.github/workflows/ci.yml"
    - "yoga-studio/backend/internal/service/points_service.go"
    - "yoga-studio/backend/internal/service/expiration_service.go"
resume_point: |
  v2.7.0引擎加固(27/27) ✅ | 瑜伽馆Slice2积分引擎(10/10) ✅
  下一会话: Slice3会员卡模块 或 v2.8.0引擎P2完善
  NEXT_SESSION_GUIDE.md 已更新（本会话结束时重建）
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
    engine_deviations_open: []
    verdict: "PASS_WITH_FIXES"

  - task: "修复引擎偏差D-2：run_experts输出截断"
    date: "2026-07-22"
    dag_nodes: 0
    checks:
      root_cause_analysis: "✅"
      fix_implementation: "✅"
      regression_tests: "✅"
      prevention_measures: "✅"
    deviations: []
    fixes_applied:
      - "getFinalOutput: 拼接全部assistant消息(非仅最后一条) → 修复多轮分析产出丢失"
      - "formatUsage: 新增stopReason参数 → 暴露子代理终止原因(mx_tokens/end_turn)"
      - "generateDAGSuggestion: 新增isOutputTruncated检测 → stopReason=max_tokens自动触发retry"
      - "dag-utils.ts: 同步更新getFinalOutput/generateDAGSuggestion/isOutputTruncated"
      - "chain-executor.ts: 同步更新FailureType/classifyFailure/hints"
      - "dag-utils.test.ts: 新增10个测试(截断检测/拼接输出/混合场景) → 84/84通过"
    engine_deviations_open: []
    verdict: "PASS"

  - task: "安装 agent-reach CLI（解决降级搜索问题）"
    date: "2026-07-22"
    dag_nodes: 0
    checks:
      agent_reach_installed: "✅"
      channels_active: "✅"
      exa_search_configured: "✅"
    deviations:
      - {check: "agent_reach_installed", expected: "任务#3前已安装", actual: "v1.5.0缺失，CDL搜索被迫降级", severity: "P2", target: "omnipm"}
    fixes_applied:
      - "pip install agent-reach v1.5.0（GitHub main.zip）"
      - "agent-reach install --env=auto → 11/15渠道可用"
      - "mcporter config add exa → Exa全网语义搜索已配置"
      - "验证: mcporter call exa.web_search_exa 正常返回结果"
    engine_deviations_open: []
    verdict: "PASS"

  - task: "v2.7.0 引擎企业级加固（27项全量优化）"
    date: "2026-07-24"
    dag_nodes: 11
    checks:
      meta_orion_analysis: "✅"
      dag_structure: "✅"
      prd_spec_integrated: "✅ (v2.6.0新增)"
      expert_quality: "⚠️ (run_experts仍不稳定)"
      outputs_verification: "✅"
      gate_mechanism: "✅"
      correction_loop: "✅"
      dev_selfcheck: "✅"
      cdl_structured: "✅"
    deviations:
      - {check: "expert_quality", expected: "run_experts返回结构化评审", actual: "3次调用中2次空输出，Orion手动评审替代", severity: "P2", target: "omnipm"}
    fixes_applied:
      - "F1: tools/shared.ts 打破依赖循环（index→{omni-dag,run-experts}→shared单向无环）"
      - "F6: atomicWriteJSON(UUID命名+Windows降级+排他锁+乐观锁)"
      - "F12: runtime/migrations.ts 四级迁移链(备份→内存迁移→写入→验证→清理)"
      - "F7: spawn超时可配置(SIGTERM→SIGKILL, OMNIPM_SPAWN_TIMEOUT_MS环境变量)"
      - "F11: DAG start 强制dependsOn验证+阻塞原因输出"
      - "F3: OMNIPM_EXPERT_MODEL 白名单校验"
      - "F10: runtime/diagnostics.ts 诊断日志(脱敏+环形缓冲)"
      - "F13: CDL缓存TTL可配置"
      - "F16: experts Schema minItems=1/maxItems=8"
      - "F18: protobufjs CVE overrides缓解"
      - "F26: GitHub Actions CI(Node 18/20/22, audit+vitest+E2E)"
      - "F24: E2E smoke test 10/10"
      - "F23: cross-platform test stubs 3/3"
      - "新增: tools/shared.ts(124行), runtime/diagnostics.ts(107行), runtime/migrations.ts(207行), .github/workflows/ci.yml, scripts/smoke-test.mjs, scripts/checksum.js"
    engine_deviations_open: []
    verdict: "PASS"

  - task: "瑜伽馆 Slice2 积分引擎（v2.7.0引擎验证）"
    date: "2026-07-24"
    dag_nodes: 10
    checks:
      meta_orion_analysis: "✅"
      dag_structure: "✅"
      prd_spec_cdl: "✅ (PRD→CDL→SPEC→DAG完整链路)"
      depends_on_check: "✅ (F11: start时验证全部dependsOn)"
      atomic_write: "✅ (F6: saveDAGState原子写入)"
      schema_migration: "✅ (F12: 跨节点DAG状态持久化)"
      env_whitelist: "✅ (F3: 拒绝非法OMNIPM_EXPERT_MODEL)"
      outputs_verification: "✅"
      gate_mechanism: "✅"
      correction_loop: "N/A"
    deviations: []
    fixes_applied:
      - "后端: 3新模型+8repo方法+4service方法+1定时任务+4端点"
      - "前端: 更新积分中心页+新增兑换确认页"
      - "自动触发: booking/checkin/register 异步AwardWithRules"
    engine_deviations_open: []
    verdict: "PASS"

# ═══════════════════════════════════════════
# 引擎偏差修复记录（v2.3.0）
# ═══════════════════════════════════════════
engine_fixes:
  - id: "D-2"
    severity: "P2"
    title: "run_experts(backend) 输出截断（1.6K tokens）"
    status: "已关闭"
    date_opened: "2026-07-22"
    date_closed: "2026-07-22"
    root_cause: |
      三个层面问题叠加导致输出不可靠：
      1. getFinalOutput 仅返回最后一条 assistant 消息。
         子代理多轮分析时前几轮分析产出全部丢失。
      2. stopReason 已捕获但未在输出中暴露。
         Orion 无法判断子代理终止原因（max_tokens/end_turn）。
      3. generateDAGSuggestion 未检测截断模式。
         输出<100字符才判 low_quality，1.6K tokens 的截断输出不触发告警。
    fix: |
      - getFinalOutput: 拼接全部 assistant 消息（非仅最后一条）
      - formatUsage: 新增 stopReason 参数，输出中暴露终止原因
      - generateDAGSuggestion: 新增 isOutputTruncated 检测
        (stopReason=max_tokens + 启发式：未闭合代码块/截断句尾)
      - dag-utils.ts / chain-executor.ts: 同步更新
      - 新增 10 个单元测试（截断检测/拼接输出/混合场景）→ 84/84 通过
    prevention: |
      1. stopReason 始终可见：每次 run_experts 输出中标注 ⏹max_tokens 等
      2. 自动重试截断：DAG_SUGGESTION 中 stopReason=max_tokens → 触发 retry
      3. 链式调用截断处理：truncated 作为独立 FailureType 参与链式重试
      4. 单元测试回归：source-integrity + dag-utils 覆盖截断检测全路径

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
# v2.4.0 偏差闭环修复记录
# ═══════════════════════════════════════════

deviation_closure:
  rounds: 6
  initial_count: 9
  current_count: 2
  elimination_rate: "78%"
  
  round_1:
    date: "2026-07-22"
    fixes:
      - {id: "DEV-2", desc: "v2.4.0新模块集成到index.ts", status: "已关闭"}
      - {id: "DEV-3", desc: "OMNIPM_SYSTEM_PROMPT.md更新至v2.4.0", status: "已关闭"}
      - {id: "DEV-8", desc: "复盘学习引擎集成到omni_dag生命周期", status: "已关闭"}
    downgraded:
      - {id: "DEV-1", desc: "Orion仍是执行者", from: "P0", to: "P1"}
      - {id: "DEV-4", desc: "专家评审质量不可靠", from: "P1", to: "P1"}

  round_2:
    date: "2026-07-22"
    key_discovery: |
      不是token预算问题。deepseek-v4-pro有1M上下文窗口，输入仅47K（5%）。
      模型自己选择何时停止——提示词不够明确导致只输出4K。
      Round 2告知模型上下文大小+明确输出要求→5.9K结构化输出。
    fixes:
      - {id: "DEV-4", desc: "模型自识别+上下文告知+增强提示词→专家输出质量大幅提升", status: "已改善"}
      - {id: "DEV-1", desc: "专家产出可用（6条具体发现），Orion按专家发现修复", status: "已改善"}
      - {id: "BUG", desc: "OmniPMEventEmitter缺pi.events参数→已传参", status: "已关闭"}
      - {id: "BUG", desc: "condition_branch参数schema多余type包装→已修复", status: "已关闭"}
      - {id: "BUG", desc: "extractClaimedFiles正则误报→已移除模糊正则", status: "已关闭"}

  round_3:
    date: "2026-07-22"
    task: "CDL脆弱性根因探查+多维度修复"
    dag_nodes: 9
    key_discovery: |
      CDL子系统之前仅存在于规范文档(cdl_guide.md/cdl_quality_gate.md)中，
      index.ts(73KB)中零引用——纯"提示词驱动的手工流程"。
      本次修复创建 runtime/cdl.ts(936行)，将CDL升级为代码级自动化层。
    fixes:
      - {id: "DEV-6", desc: "CDL能力自发现脆弱→创建cdl.ts(CDLDetector+Orchestrator+QScore+Cache)+cdl_search工具+§九更新", status: "已关闭"}
    remaining_after:
      - {id: "DEV-5", desc: "测试验证停滞(瑜伽馆3/7)", severity: "P1"}
      - {id: "DEV-7", desc: "跨会话手动恢复→自动checkpoint/restore", severity: "P2", status: "已关闭"}
      - {id: "DEV-9", desc: "跨平台适配器空壳", severity: "P2"}
      - {id: "DEV-4.1", desc: "专家输出质量需更多验证", severity: "P2"}

  round_4:
    date: "2026-07-22"
    task: "DEV-7 跨会话自动checkpoint/restore — NSG Auto-Maintenance 固化为引擎核心行为"
    dag_nodes: 0
    key_discovery: |
      JSON适合状态机恢复，Markdown适合LLM恢复——两类不同的"恢复"。
      自动维护NEXT_SESSION_GUIDE.md始终新鲜，用户仍粘贴但内容由引擎驱动。
    fixes:
      - {id: "DEV-7", desc: "NSG Auto-Maintenance（omni_dag生命周期+session_start检测）", status: "已关闭"}
    remaining_after:
      - {id: "DEV-5", desc: "测试验证停滞(瑜伽馆3/7)", severity: "P1"}
      - {id: "DEV-9", desc: "跨平台适配器空壳", severity: "P2"}
      - {id: "DEV-4.1", desc: "专家输出质量需更多验证", severity: "P2"}

  round_5:
    date: "2026-07-22"
    task: "DEV-9 跨平台适配器真实SDK集成 — ClaudeAdapter+CodexAdapter"
    dag_nodes: 0
    key_discovery: |
      原适配器返回占位文本，完全不调用真实平台。
      正确架构：各平台适配器使用其原生SDK（@anthropic-ai/sdk / openai）发起子代理调用。
      GeminiAdapter 保留为 CodexAdapter 的向后兼容别名。
    fixes:
      - {id: "DEV-9", desc: "ClaudeAdapter→@anthropic-ai/sdk + CodexAdapter→openai SDK + 平台配置+成本估算", status: "已关闭"}
    remaining_after:
      - {id: "DEV-5", desc: "测试验证停滞(瑜伽馆3/7)", severity: "P1"}
      - {id: "DEV-4.1", desc: "专家输出质量需更多验证", severity: "P2"}

  round_6:
    date: "2026-07-22"
    task: "DEV-4.1 专家质量评分基础设施 — scoreExpertQuality + 自动日志"
    dag_nodes: 0
    key_discovery: |
      专家质量可以通过4个可量化维度自动评估：结构化符合度、建议完整性、专业深度、可执行性。
      每次 run_experts 调用自动评分并写入质量日志，数据自然积累无需人工干预。
    fixes:
      - {id: "DEV-4.1-infra", desc: "scoreExpertQuality(4维评分)+aggregateQualityScores(汇总)+index.ts自动评分集成+10个单元测试", status: "基础设施就绪"}
    remaining_after:
      - {id: "DEV-5", desc: "测试验证停滞(瑜伽馆3/7)", severity: "P1"}
      - {id: "DEV-4.1", desc: "专家输出质量需更多验证（基础设施就绪，持续积累）", severity: "P2"}

# ═══════════════════════════════════════════
# 当前打开偏差（下一阶段目标）
# ═══════════════════════════════════════════

engine_deviations_open:
  - id: "PROCES-P1"
    severity: "P1"
    title: "DAG全节点完成后未主动执行闭包流程"
    target: "omnipm"
    date_opened: "2026-07-24"
    description: |
      DAG 10/10 完成后，Orion 未主动执行闭包三步：
      1. NEXT_SESSION_GUIDE.md 更新 → Auto-Maintenance 将其清空为0字节（BUG）
      2. PROJECT_MEMORY.md 验证日志追加 → 未执行
      3. PROJECT_DECISIONS.md ADR 追加 → 未执行
      全部三步依赖用户提问"闭包流程执行了吗？"后才手动补做。
      
      此外，NEXT_SESSION_GUIDE.md 自动维护功能存在 bug：
      omni_dag complete 触发 maintainNextSessionGuide() 时，
      哨兵标记匹配失败导致文件被清空为 0 字节。
    fix: |
      协议层: OMNIPM_SYSTEM_PROMPT.md §二.4 需新增"DAG完成闭包协议"：
        - 所有节点 done → 强制触发复盘记录 + 项目记忆更新 + 引导词生成
        - 闭包未完成 → gate_accept 拒绝标记 done
      Extension层: 修复 NEXT_SESSION_GUIDE.md 哨兵标记匹配逻辑
        - replaceBetween() 未找到哨兵时应追加而非清空
        - 启动时检测空文件 → 从模板重建
    next_action: "v2.8.0 修复：协议层新增闭包强制检查 + Extension层修复NSG哨兵逻辑"

# ═══════════════════════════════════════════
# DAG 执行状态
# ═══════════════════════════════════════════
dag_state:
  version: "2.4.0"
  dag_id: null
  current_node: null
  completed_nodes: []
  failed_nodes: []
  blocked_nodes: []
  correction_count: {}

# ═══════════════════════════════════════════
# 瑜伽馆测试验证 — Slice 规划
# ═══════════════════════════════════════════

yoga_slices:
  - slice: 1
    name: "约课核心闭环"
    status: "✅ 已交付 (2026-07-22)"
    content: "登录/注册 + 约课/取消 + 签到 + 课表展示"
  - slice: 2
    name: "积分引擎（会员端）"
    status: "✅ 已交付 (2026-07-24)"
    content: "积分规则引擎 + 自动获取 + 兑换商城 + 会员等级 + 过期定时任务"
    scope: "会员端——积分查看/兑换/流水。不含运营后台。"
  - slice: 3
    name: "会员卡模块"
    status: "⬜ 待启动"
    content: "次卡/期限卡/储值卡购买与核销"
  - slice: 4
    name: "运营后台（积分+商品管理）"
    status: "⬜ 待启动"
    content: "积分配置界面 + 兑换商品管理 + 数据报表（Web Admin 扩展）"
