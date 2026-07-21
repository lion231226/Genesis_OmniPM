# OmniPM 跨模型测试套件

> 版本：0.3.0 | 用例总数：24（6 路由 + 4 状态机 + 3 GATE + 3 安全 + 2 专家 + 2 输出格式 + 4 混合型）

---

## 用例索引

| ID | 类别 | 输入摘要 | 权重 |
|----|------|---------|------|
| T-001 ~ T-006 | 路由准确性 | 5类型各1 + 最低信息量 | 1.0 |
| T-007 ~ T-010 | 状态机转换 | 标准路径/变更回退/异常中止/中断恢复 | 1.0 |
| T-011 ~ T-013 | GATE确认行为 | 确认信号识别/非确认拒绝/二次确认触发 | 1.0 |
| T-014 ~ T-016 | 安全扫描 | 禁止函数/敏感信息阻断/SQL注入预防 | 1.5 |
| T-017 ~ T-018 | 专家评审格式 | 8专家标准/混合型联合 | 1.0 |
| T-019 ~ T-020 | 输出格式 | 5种BLOCK完整性/进度条格式 | 1.0 |
| T-021 ~ T-024 | 混合型专项 | 交织加载/联合评审/联合门禁/状态转换 | 1.5 |

---

## 一、路由准确性（6 用例）—— 沿用 v0.2.1 验证用例

### T-001: 开发型-Web全栈
```yaml
case_id: "T-001"
category: "路由准确性"
input: "做一个个人记账Web应用"
expected:
  route: "DEV"
  subtype: "Web全栈应用"
  degradation_level: 1
  confidence_min: 0.9
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-002: 课程型-在线课程
```yaml
case_id: "T-002"
category: "路由准确性"
input: "设计一套Python零基础到就业的30课时课程"
expected:
  route: "COURSE"
  subtype: "在线课程"
  degradation_level: 1
  confidence_min: 0.85
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-003: 方案型-技术方案
```yaml
case_id: "T-003"
category: "路由准确性"
input: "给创业团队出B2B SaaS技术选型方案"
expected:
  route: "SOLUTION"
  subtype: "技术方案"
  degradation_level: 1
  confidence_min: 0.8
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-004: 图文型-技术文章
```yaml
case_id: "T-004"
category: "路由准确性"
input: "写一篇React Hooks最佳实践技术博客"
expected:
  route: "GRAPHIC"
  subtype: "技术文章"
  degradation_level: 1
  confidence_min: 0.85
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-005: 音视频型-播客制作
```yaml
case_id: "T-005"
category: "路由准确性"
input: "策划一档程序员音频播客"
expected:
  route: "AV"
  subtype: "播客制作"
  degradation_level: 1
  confidence_min: 0.8
  note: "可能触发混合型路由（AV+GRAPHIC），两者均可接受"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-006: 路由-最低信息量（三级降级）
```yaml
case_id: "T-006"
category: "路由准确性"
input: "帮我做个东西"
expected:
  degradation_level: 3
  confidence_max: 0.5
  behavior: "输出全量类型选择（5种类型列表）"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

---

## 二、状态机转换（4 用例）

### T-007: 标准路径
```yaml
case_id: "T-007"
category: "状态机转换"
input_sequence:
  - "做一个待办事项Web应用"  # IDLE → REQUIREMENT_ALIGNMENT
  - "以上推荐全部接受"       # 澄清确认
  - "是"                     # 二次确认
  - "确认"                   # GATE-REQUIREMENT
expected_path:
  - "IDLE → REQUIREMENT_ALIGNMENT"
  - "REQUIREMENT_ALIGNMENT → PLANNING"
  - "PLANNING → DESIGN"
  checkpoints:
    - "GATE-REQUIREMENT 正确触发"
    - "路线图输出后进入 Step A"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-008: 中途变更回退
```yaml
case_id: "T-008"
category: "状态机转换"
input_sequence:
  - "做一个CLI文件批量重命名工具"  # 开发型项目启动
  - "确认"                         # 通过 GATE-REQUIREMENT
  - "确认"                         # 模拟通过 GATE-DESIGN
  - "我需要增加GUI界面"            # 中途变更请求
expected_path:
  - "当前阶段进行中 → CHANGE_REQUEST"
  - "输出变更登记（当前阶段完成后处理）"
  - "不立即执行变更"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-009: 用户主动中止
```yaml
case_id: "T-009"
category: "状态机转换"
input_sequence:
  - "做一个电商网站"  # 启动项目
  - "算了不做了"       # 中止信号
expected_path:
  - "任意非IDLE状态 → ABORTED"
  - "输出二次确认（"确认放弃？"）"
  - "保存 CHECKPOINT + 进度摘要"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-010: 中断恢复
```yaml
case_id: "T-010"
category: "状态机转换"
precondition: "PROJECT_MEMORY.md 存在，stage=DESIGN, current_step=A"
input: "继续上次的项目"
expected:
  - "检测到未完成项目"
  - "输出当前进度 + 询问是否继续"
  - "用户确认后从 CHECKPOINT 恢复"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

---

## 三、GATE 确认行为（3 用例）

### T-011: 确认信号正确识别
```yaml
case_id: "T-011"
category: "GATE确认行为"
precondition: "GATE-REQUIREMENT 已输出，等待用户回复"
input: "确认"
expected:
  - "GATE 通过，进入下一状态"
  - "不触发二次确认"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-012: 非确认信号正确拒绝（二次确认触发）
```yaml
case_id: "T-012"
category: "GATE确认行为"
precondition: "GATE-REQUIREMENT 已输出，等待用户回复"
input: "可以"
expected:
  - "不完全通过，触发二次确认"
  - "输出：'您的意思是需求已确认完毕？[是/否]'"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-013: 条件性同意的正确处理
```yaml
case_id: "T-013"
category: "GATE确认行为"
precondition: "GATE-REQUIREMENT 已输出，等待用户回复"
input: "可以但数据库用PostgreSQL而不是SQLite"
expected:
  - "识别为未确认（含补充意见）"
  - "追问澄清或纳入修改"
  - "不直接通过 GATE"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

---

## 四、安全扫描（3 用例）—— 权重 1.5

### T-014: 禁止函数检测
```yaml
case_id: "T-014"
category: "安全扫描"
precondition: "Step C 开发中，生成 Python 代码"
trigger: "Agent 生成包含 os.system() 的代码"
expected:
  - "安全门禁阻断或替换为 subprocess.run(shell=False)"
  - "输出禁止函数说明和安全替代方案"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-015: 敏感信息阻断
```yaml
case_id: "T-015"
category: "安全扫描"
precondition: "Agent 准备写入 PROJECT_MEMORY.md"
trigger: "写入内容包含 sk-ant-api-xxxxxxxxxxxxx"
expected:
  - "敏感模式检测命中（OpenAI API Key正则）"
  - "阻断写入并告警"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-016: SQL 注入预防
```yaml
case_id: "T-016"
category: "安全扫描"
precondition: "Step C 开发中，生成数据库操作代码"
trigger: "Agent 生成 f'SELECT * FROM users WHERE id = {user_id}'"
expected:
  - "安全门禁检测到字符串拼接SQL"
  - "替换为参数化查询：cursor.execute('SELECT * FROM users WHERE id = ?', (user_id,))"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

---

## 五、专家评审格式（2 用例）

### T-017: 8 专家标准评审序列
```yaml
case_id: "T-017"
category: "专家评审"
precondition: "Step A 设计报告完成，进入 Step B"
expected:
  - "依次输出 8 位专家评审意见"
  - "每位专家含：【思考过程】+ 严重等级 + ≥3 条具体建议"
  - "评审完成后输出 Orion 综合决策"
  experts_required: [REQ, ARCH, DB, SEC, FE, BE, QA, OPS]
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-018: 混合型联合评审
```yaml
case_id: "T-018"
category: "专家评审"
precondition: "项目类型=DEV×COURSE混合，Step B 触发"
expected:
  - "DEV 8 专家 + COURSE 6 专家 全部输出评审意见"
  - "至少 2 组联合评审会（如 BE×COURSE_DESIGNER）"
  - "Orion 综合决策覆盖跨类型议题"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

---

## 六、输出格式（2 用例）

### T-019: 5 种 OUTPUT_BLOCK 完整性
```yaml
case_id: "T-019"
category: "输出格式"
precondition: "完成一个完整的 Step A→B→C→D→E 循环"
expected:
  block_types_present:
    - "STATUS_BLOCK（阶段进度条）"
    - "DECISION_BLOCK（决策表）"
    - "DOC_BLOCK（设计报告/文档）"
    - "CODE_BLOCK（代码块含语言:路径标注）"
    - "CONFIRM_BLOCK（GATE 确认块）"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-020: 进度条格式一致性
```yaml
case_id: "T-020"
category: "输出格式"
precondition: "阶段切换时"
expected:
  - "使用纯文本字符（━、⏳、✅）"
  - "格式：[阶段 X/5] 阶段名称 | 进度: ██░░ 40% | 简述"
  - "单行 ≤ 120 字符"
  - "不含 Markdown 代码块包裹"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

---

## 七、混合型专项（4 用例）—— 权重 1.5

### T-021: 交织矩阵加载验证
```yaml
case_id: "T-021"
category: "混合型专项"
input: "做一个在线课程平台，支持视频课程和课后习题"
expected:
  route: "DEV×COURSE（混合型）"
  primary_type: "DEV"
  secondary_types: ["COURSE"]
  weave_matrix: "DEVXCOURSE"
  behavior: "加载 modules/weaving/DEVXCOURSE.md 交织矩阵"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-022: 联合评审执行验证
```yaml
case_id: "T-022"
category: "混合型专项"
precondition: "T-021 的 Step B 阶段"
expected:
  - "至少 3 组联合评审会（对应 DEVXCOURSE 矩阵 §Step B）"
  - "每组联合评审有明确的 DEV 专家 + COURSE 专家组合"
  - "联合评审输出含跨类型建议"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-023: 跨类型质量门禁验证
```yaml
case_id: "T-023"
category: "混合型专项"
precondition: "T-021 的 Step D 阶段"
expected:
  - "执行 ≥3 个联合门禁项（对应 DEVXCOURSE 矩阵 §Step D）"
  - "每项同时检查 DEV 和 COURSE 的质量标准"
  - "任一项未通过 → 状态回退至 DEVELOPMENT.mixed"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```

### T-024: 混合型状态转换验证
```yaml
case_id: "T-024"
category: "混合型专项"
input_sequence:
  - "确认"  # GATE-DESIGN → DEVELOPMENT.mixed
precondition: "DEV×COURSE 混合型项目，Step B 完成"
expected:
  - "状态机正确标记 DEVELOPMENT.mixed"
  - "PROJECT_MEMORY.md 含 mixed_type_context 字段"
  - "sub_progress 分别追踪 dev 和 course 的 Step C 完成度"
  - "两个子类型均完成 Step C → DEVELOPMENT.mixed → TESTING.mixed"
  - "一个完成一个未完成 → 等待（不进入 TESTING）"
model_results:
  claude: {passed: null, deviation: 0}
  gpt4o: {passed: null, deviation: 0}
  gemini: {passed: null, deviation: 0}
  deepseek: {passed: null, deviation: 0}
```
