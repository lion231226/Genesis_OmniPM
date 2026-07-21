export const meta = {
  name: 'omnipm-v1.0.0-pi-stepd',
  description: 'OmniPM v1.0.0-PI Step D — 交叉验证、引用完整性、安全自查',
  phases: [
    { title: '引用检查', detail: '检查模块引用完整性 + 交叉引用一致性' },
    { title: '安全自查', detail: '禁止函数扫描 + 敏感信息泄露 + 残留引用' },
    { title: '格式规范', detail: '输出块格式 + 模块元数据检查' },
    { title: '综合报告', detail: '汇总测试结果，判定门禁通过/阻塞' },
  ],
}

// ============================================================
// Phase 1: 引用完整性 + 交叉引用一致性（并行）
// ============================================================
phase('引用检查')

const [refIntegrity, crossRef, residualCheck] = await parallel([
  // 检查1：OMNIPM_SYSTEM_PROMPT.md 中引用的模块文件是否存在
  () => agent(
    '检查文件 D:\\MyProject\\Genesis_OmniPM\\OMNIPM_SYSTEM_PROMPT.md 中所有引用的模块文件是否在 modules/ 目录下实际存在。\n' +
    '\n' +
    '步骤：\n' +
    '1. Read OMNIPM_SYSTEM_PROMPT.md 全文\n' +
    '2. 提取所有 @LOAD: 引用（如 modules/roles.md、modules/router_logic.md 等）\n' +
    '3. 提取所有 modules/ 路径引用（如 modules/workflows/、modules/weaving/ 等）\n' +
    '4. 对每个引用，用 Glob 或 Read 验证文件是否存在\n' +
    '5. 输出结果表格：引用路径 | 是否存在 | 备注\n' +
    '\n' +
    '特别注意：\n' +
    '- modules/cdl_quality_gate.md — 新增模块，必须存在\n' +
    '- modules/cdl_guide.md — 新增模块，必须存在\n' +
    '- 检查是否引用了已归档的文件（MODEL_PROFILES、CROSS_MODEL_TEST_SUITE、CROSS_MODEL_VALIDATION_PROTOCOL）——如果有则标记为"残留引用"',
    {label: 'ref-integrity'}
  ),

  // 检查2：新模块之间的交叉引用一致性
  () => agent(
    '检查以下新增/修改模块之间的交叉引用是否一致：\n' +
    '\n' +
    '文件列表：\n' +
    'A. OMNIPM_SYSTEM_PROMPT.md 第十六节（CDL）\n' +
    'B. modules/cdl_quality_gate.md\n' +
    'C. modules/cdl_guide.md\n' +
    'D. PI_PROFILE.md\n' +
    '\n' +
    '步骤：\n' +
    '1. Read 以上所有文件\n' +
    '2. 提取每个文件中对其他文件的引用（如"见 modules/cdl_quality_gate.md"、"参考第X节"）\n' +
    '3. 验证每个引用指向的章节/文件确实存在\n' +
    '4. 验证术语一致性：\n' +
    '   - "五维 Q-Score" 在各文件中的权重数值是否一致（安全性30%/活跃度20%/社区验证25%/功能匹配15%/可维护性10%）\n' +
    '   - "8项一票否决" 的条件是否在各文件中一致\n' +
    '   - "best-effort" 模式的描述是否一致\n' +
    '   - "裸奔模式 bare-metal" 的描述是否一致\n' +
    '   - "双生态"（PI + GitHub）的定义是否一致\n' +
    '5. 输出不一致性清单（如果有）',
    {label: 'cross-ref-consistency'}
  ),

  // 检查3：残留引用扫描——检查是否还有指向已归档文件的引用
  () => agent(
    '在整个 D:\\MyProject\\Genesis_OmniPM\\ 项目目录中扫描残留引用。\n' +
    '\n' +
    '已归档文件（不应被任何活跃文件引用）：\n' +
    '- MODEL_PROFILES.md\n' +
    '- CROSS_MODEL_TEST_SUITE.md\n' +
    '- CROSS_MODEL_VALIDATION_PROTOCOL.md\n' +
    '- USER_GUIDE.md（旧版）\n' +
    '\n' +
    '已删除的章节/概念（不应被任何活跃文件引用）：\n' +
    '- 第十四附（模型适配配置层）\n' +
    '- BDS 行为偏差分数\n' +
    '- GPT-4o/Gemini/DeepSeek 特定适配参数\n' +
    '- multi_expert_parallel_hint\n' +
    '- 跨模型安全策略适配表（security_gate.md 附录B）\n' +
    '- "仅完整支持开发型项目" 相关限制描述\n' +
    '\n' +
    '步骤：\n' +
    '1. 用 Grep 搜索以下模式：\n' +
    '   - "MODEL_PROFILES"（不含 _archived_ 前缀）\n' +
    '   - "CROSS_MODEL_TEST_SUITE"（不含 _archived_ 前缀）\n' +
    '   - "CROSS_MODEL_VALIDATION"（不含 _archived_ 前缀）\n' +
    '   - "BDS"（作为行为偏差分数的缩写）\n' +
    '   - "GPT-4o" "Gemini 1.5" "DeepSeek"（在 OMNIPM_SYSTEM_PROMPT.md 和 security_gate.md 中）\n' +
    '   - "仅完整支持开发型" "暂不支持"（在 OMNIPM_SYSTEM_PROMPT.md 中）\n' +
    '   - "第十四附" "§十四附"\n' +
    '   - "multi_expert_parallel_hint"\n' +
    '   - "跨模型安全策略适配表" "附录B"（在 security_gate.md 中）\n' +
    '2. 排除 _archived_ 前缀的文件（这些是归档文件，允许包含旧引用）\n' +
    '3. 排除 CHANGELOG.md 和 PROJECT_DECISIONS.md（这些是历史记录文件，可以提及旧版本）\n' +
    '4. 对每个命中项标记：文件 | 行号 | 匹配内容 | 是否需要修复',
    {label: 'residual-check'}
  ),
])

log('引用检查阶段完成')

// ============================================================
// Phase 2: 安全自查（并行）
// ============================================================
phase('安全自查')

const [secScan, sensitiveCheck, tsSecPatterns] = await parallel([
  // 检查4：安全门禁自检——禁止函数扫描
  () => agent(
    '对所有 OMNIPM_SYSTEM_PROMPT.md 中生成的代码示例（代码块）执行安全门禁扫描。\n' +
    '\n' +
    '根据 §2.3 安全门禁，检查所有 Markdown 代码块（以 ``` 包裹的内容）中是否包含以下禁止模式：\n' +
    '\n' +
    'Python 禁止函数：\n' +
    '- exec()\n' +
    '- eval()\n' +
    '- os.system()\n' +
    '- subprocess.call(..., shell=True)\n' +
    '- __import__()\n' +
    '- compile()\n' +
    '\n' +
    'TypeScript/JavaScript 禁止模式（v1.0.0-PI 新增）：\n' +
    '- eval()\n' +
    '- new Function()\n' +
    '- import() 动态导入（用户输入拼接）\n' +
    '- child_process.exec()（string 参数）\n' +
    '\n' +
    'SQL 注入风险：\n' +
    '- 字符串拼接 SQL（f"... WHERE id = {user_id}"、 "SELECT * FROM " + table）\n' +
    '\n' +
    '步骤：\n' +
    '1. Read OMNIPM_SYSTEM_PROMPT.md，提取所有代码块\n' +
    '2. 对每个代码块扫描上述禁止模式\n' +
    '3. 特别注意：§2.3 安全门禁章节自身的示例代码——这些是"示范禁止的模式"还是"实际使用的禁止模式"？\n' +
    '   如果是安全门禁章节中的反例（标注了"禁止示例"），不应计入违规，但要确保有对应的"正确示例"\n' +
    '4. 输出：文件 | 行号 | 禁止模式 | 上下文 | 判定（违规/反例示范/误报）',
    {label: 'sec-scan'}
  ),

  // 检查5：敏感信息泄露扫描
  () => agent(
    '扫描 D:\\MyProject\\Genesis_OmniPM\\ 目录下所有活跃文件（排除 _archived_ 和 .claude/），检查是否存在以下敏感信息泄露：\n' +
    '\n' +
    '扫描模式（根据 §2.2 记忆文件写入门禁中的敏感模式检测规则）：\n' +
    '- PEM 私钥：-----BEGIN.*PRIVATE KEY-----\n' +
    '- OpenAI API Key：sk-[a-zA-Z0-9]{32,}\n' +
    '- GitHub Token：ghp_[a-zA-Z0-9]{36}\n' +
    '- AWS Access Key：AKIA[A-Z0-9]{16}\n' +
    '- Bearer Token：Bearer [A-Za-z0-9\\-._~+/]+=\n' +
    '- JWT：eyJ[a-zA-Z0-9\\-_]+\\.eyJ[a-zA-Z0-9\\-_]+\\.[a-zA-Z0-9\\-_]+\n' +
    '- 敏感键值对：包含 password、secret、token、credential 后跟 : 和值的 YAML 行\n' +
    '\n' +
    '步骤：\n' +
    '1. 对每个模式用 Grep 搜索（排除 _archived_ 和 .claude/ 目录）\n' +
    '2. 特别注意 PI_TEST_SUITE.md 和 PI_PROFILE.md 是否包含硬编码的凭据\n' +
    '3. 检查 .pi/ 相关的 YAML 示例中是否使用了环境变量（${...}）而非硬编码\n' +
    '4. 输出：文件 | 行号 | 匹配模式 | 风险等级',
    {label: 'sensitive-check'}
  ),

  // 检查6：TypeScript 安全门禁模式完整性
  () => agent(
    '验证 modules/security_gate.md 中 TypeScript/JavaScript 禁止模式是否完整且正确。\n' +
    '\n' +
    '步骤：\n' +
    '1. Read D:\\MyProject\\Genesis_OmniPM\\modules\\security_gate.md 全文\n' +
    '2. 检查以下 TS/JS 禁止模式是否全部存在（对照 Step B 决议 + D3 设计）：\n' +
    '   - eval() → 安全替代：显式逻辑重构\n' +
    '   - new Function() → 安全替代：显式函数定义\n' +
    '   - import() 动态导入（用户输入拼接）→ 安全替代：静态 import 语句\n' +
    '   - child_process.exec()（string参数）→ 安全替代：child_process.spawn()（array参数）\n' +
    '   - fs.readFile() 路径拼接用户输入 → 安全替代：path.resolve() + 白名单验证\n' +
    '   - JSON.parse() 无 try-catch → 安全替代：try-catch + size limit\n' +
    '3. 检查是否已删除"附录B 跨模型安全策略适配表"\n' +
    '4. 检查是否新增了"PI 命令注入防护"小节\n' +
    '5. 输出完整性报告：每条禁止模式的检查结果',
    {label: 'ts-sec-patterns'}
  ),
])

log('安全自查阶段完成')

// ============================================================
// Phase 3: 格式规范检查
// ============================================================
phase('格式规范')

const [outputFormat, moduleMetadata, piTestSuiteQuality] = await parallel([
  // 检查7：输出格式块检查
  () => agent(
    '检查 OMNIPM_SYSTEM_PROMPT.md 和所有 modules/ 下的文件是否符合 OmniPM 输出格式规范（§五）。\n' +
    '\n' +
    '检查要点：\n' +
    '1. 所有 GATE 确认块是否使用 [GATE] 标记开头\n' +
    '2. 所有 STEP_COMPLETE 块是否使用 [STEP_X_COMPLETE] 格式\n' +
    '3. 决策块是否使用 ## [决策] 格式 + 选项表格 + 推荐行\n' +
    '4. 文档块是否含摘要段 + 详情区\n' +
    '5. 代码块是否标注语言:文件路径\n' +
    '\n' +
    '重点关注新增模块（cdl_quality_gate.md、cdl_guide.md、PI_PROFILE.md、PI_TEST_SUITE.md）是否符合模块元数据头部格式。\n' +
    '\n' +
    '输出：每个文件的格式合规性评估（通过/需修复/不适用）',
    {label: 'output-format'}
  ),

  // 检查8：模块元数据头部检查
  () => agent(
    '检查 D:\\MyProject\\Genesis_OmniPM\\modules\\ 目录下所有 .md 文件的模块元数据头部是否规范。\n' +
    '\n' +
    '标准模块元数据头部格式（参考 modules/roles.md）：\n' +
    '> **模块名称**：...\n' +
    '> **版本**：...\n' +
    '> **依赖**：...\n' +
    '> **用途**：...\n' +
    '\n' +
    '步骤：\n' +
    '1. Glob D:\\MyProject\\Genesis_OmniPM\\modules\\**\\*.md 列出所有模块文件\n' +
    '2. Read 每个文件的前 10 行\n' +
    '3. 检查是否包含模块名称、版本、用途等元数据\n' +
    '4. 特别关注新增的 cdl_quality_gate.md 和 cdl_guide.md\n' +
    '5. 输出：文件 | 是否有元数据头部 | 缺失字段 | 评级',
    {label: 'module-metadata'}
  ),

  // 检查9：PI_TEST_SUITE 自身质量
  () => agent(
    '评估 D:\\MyProject\\Genesis_OmniPM\\PI_TEST_SUITE.md 的自身质量。\n' +
    '\n' +
    '检查要点：\n' +
    '1. 是否覆盖了全部 31 个用例（对照 Step B 决议中的 9 类分布）\n' +
    '2. 每个用例是否包含：用例编号 | 输入 | 期望输出/行为 | 判定标准\n' +
    '3. CDL 测试用例（3个）是否说明了 mock 策略\n' +
    '4. 棕地测试用例（2个）是否说明了测试夹具\n' +
    '5. 测试用例是否可执行（即期望行为是否明确可判断）\n' +
    '6. 是否有重复或遗漏\n' +
    '\n' +
    '输出：用例覆盖矩阵 + 质量问题清单',
    {label: 'test-suite-quality'}
  ),
])

log('格式规范检查阶段完成')

// ============================================================
// Phase 4: 综合汇总
// ============================================================
phase('综合报告')

const summary = await agent(
  '汇总以下 9 项检查的结果，生成 Step D 质量门禁报告。\n' +
  '\n' +
  '我已经并行执行了 9 项检查，现在需要你汇总结果。\n' +
  '\n' +
  '将各检查结果汇总为统一的门禁报告，格式如下：\n' +
  '\n' +
  '## Step D 质量门禁报告\n' +
  '\n' +
  '### 门禁总览\n' +
  '| # | 检查项 | 结果 | 严重度 | 说明 |\n' +
  '|---|--------|------|--------|------|\n' +
  '\n' +
  '### 阻塞项（必须修复才能进入 Step E）\n' +
  '列出所有不通过的检查项及修复建议\n' +
  '\n' +
  '### 通过项\n' +
  '列出所有通过的检查项\n' +
  '\n' +
  '### 最终判定\n' +
  '[ ] 全部通过 → 自动进入 Step E\n' +
  '[ ] 存在阻塞项 → 回退 Step C 修复\n' +
  '[ ] 仅 P2 问题 → 通过但标注已知问题\n' +
  '\n' +
  '关键约束：\n' +
  '- 任何引用完整性失败 = P0 阻塞\n' +
  '- 任何安全扫描命中（非反例示范）= P0 阻塞\n' +
  '- 任何残留 v0.3.0 引用（在活跃文件中）= P1 重要\n' +
  '- 格式规范问题 = P2 建议',
  {label: 'final-summary'}
)

return {
  phase1_refs: {refIntegrity, crossRef, residualCheck},
  phase2_security: {secScan, sensitiveCheck, tsSecPatterns},
  phase3_format: {outputFormat, moduleMetadata, piTestSuiteQuality},
  phase4_summary: summary,
}
