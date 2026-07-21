export const meta = {
  name: 'omnipm-v1.0.0-pi-stepc',
  description: 'OmniPM v1.0.0-PI Step C — 提示词重构 + 新增模块 + 文件更新 + 归档',
  phases: [
    { title: '新增模块', detail: '并行创建 CDL 质量门禁/指南、PI_PROFILE、PI_TEST_SUITE' },
    { title: '核心重构', detail: 'OMNIPM_SYSTEM_PROMPT.md v1.0.0-PI 重构' },
    { title: '文件更新', detail: 'security_gate、AGENTS.md、CHANGELOG、PROJECT_DECISIONS' },
    { title: '归档', detail: '废弃文件归档' },
  ],
}

// ============================================================
// Phase 1: 并行创建所有新增模块
// ============================================================
phase('新增模块')

const [cdlQuality, cdlGuide, piProfile, piTestSuite] = await parallel([
  // modules/cdl_quality_gate.md
  () => agent(
    '创建文件 D:\\MyProject\\Genesis_OmniPM\\modules\\cdl_quality_gate.md。\n' +
    '\n' +
    '这是 OmniPM CDL（能力自发现层）的五维质量评分卡和一票否决条件定义模块。\n' +
    '\n' +
    '内容要求：\n' +
    '1. 五维质量评分卡（Q-Score）：\n' +
    '   - 安全性(30%)：检查已知漏洞、是否使用 --ignore-scripts、LICENSE 类型\n' +
    '   - 活跃度(20%)：最近 commit 时间、release 频率、issue 响应速度\n' +
    '   - 社区验证(25%)：GitHub Stars、npm 下载量、被其他项目依赖数\n' +
    '   - 功能匹配(15%)：与项目需求关键词的交集比例\n' +
    '   - 可维护性(10%)：代码规范、文档完整度、TypeScript 类型覆盖\n' +
    '\n' +
    '2. 评分公式和阈值：\n' +
    '   Q-Score = 安全性×0.30 + 活跃度×0.20 + 社区验证×0.25 + 功能匹配×0.15 + 可维护性×0.10\n' +
    '   >=75 自动通过（auto）/ 50-74 人工审查（manual）/ <50 拒绝（rejected）\n' +
    '\n' +
    '3. 8 项一票否决条件（任一命中则直接拒绝）：\n' +
    '   - 已知 CVE 且未修复\n' +
    '   - LICENSE 不兼容（非 MIT/Apache-2.0/BSD/ISC）\n' +
    '   - 最近 12 个月无 commit\n' +
    '   - README 不存在或 <100 字\n' +
    '   - npm 包包含 install/postinstall 脚本且未经审查\n' +
    '   - GitHub 仓库被 GitHub Advisory Database 标记\n' +
    '   - 依赖树包含已知恶意包\n' +
    '   - 仅 1 个 contributor 且 Stars < 10\n' +
    '\n' +
    '4. GitHub 生态额外质量门禁（D3.8 要求）：\n' +
    '   - Stars >= 50 或来自 Verified Organization\n' +
    '   - 最近 6 个月内有 commit\n' +
    '   - LICENSE 文件存在且为宽松协议\n' +
    '   - 不在 GitHub Advisory Database 中\n' +
    '   - README.md >= 200字\n' +
    '\n' +
    '5. YAML schema 定义（用于 .pi/skills.yaml 的质量字段）\n' +
    '\n' +
    '格式：标准 OmniPM 模块文件（Markdown + YAML），含模块元数据头部（模块名称、版本、依赖、用途）。参考 modules/security_gate.md 的风格。',
    {label: 'cdl-quality-gate'}
  ),

  // modules/cdl_guide.md
  () => agent(
    '创建文件 D:\\MyProject\\Genesis_OmniPM\\modules\\cdl_guide.md。\n' +
    '\n' +
    '这是 OmniPM CDL 能力搜索与安装操作指南模块。\n' +
    '\n' +
    '内容要求：\n' +
    '1. CDL 触发时机：GATE-REQUIREMENT 确认后 → 项目全景图(PROJECT_PANORAMA.md)生成 → CDL 搜索启动\n' +
    '2. 双生态搜索流程：\n' +
    '   - PI 生态：Skills Registry (npx skills search)、npm Registry、MCP Registry\n' +
    '   - GitHub 生态：Verified Orgs、Community repos、Actions Marketplace、Dev Container templates\n' +
    '3. 搜索关键词生成规则：从项目全景图的技术栈+功能需求自动提取搜索词\n' +
    '4. Q-Score 评估流程（引用 modules/cdl_quality_gate.md）\n' +
    '5. 安装命令模板：\n' +
    '   - Skill: npx skills add <name>\n' +
    '   - npm: npm install -D <name> --ignore-scripts --save-exact\n' +
    '   - MCP: npm install -D <package> --ignore-scripts --save-exact\n' +
    '   - GitHub: gh repo clone <owner/repo> --depth 1\n' +
    '6. .pi/ 配置文件写入格式（skills.yaml / mcp.yaml / subagents.yaml）\n' +
    '7. 安装后验证步骤：命令可用性检查（--version / --help）\n' +
    '8. CDL 裸奔模式（bare-metal mode）：设置 CDL_MODE=baremetal 跳过全部搜索，纯提示词执行\n' +
    '9. Best-effort 策略：部分安装失败不阻塞，标记 verified: false + failure_reason\n' +
    '10. 超时策略：每个生态 30s 超时，标记 search_status: timeout，下次会话重试\n' +
    '11. npm 安全策略：默认 --ignore-scripts，需要生命周期脚本时输出脚本内容预览 + 用户二次确认\n' +
    '\n' +
    '格式：标准 OmniPM 模块文件，含模块元数据头部。',
    {label: 'cdl-guide'}
  ),

  // PI_PROFILE.md
  () => agent(
    '创建文件 D:\\MyProject\\Genesis_OmniPM\\PI_PROFILE.md。\n' +
    '\n' +
    '这是 PI Agent 特有能力与限制速查文档，替代 v0.3.0 的 MODEL_PROFILES.md。\n' +
    '\n' +
    '内容要求：\n' +
    '1. PI Agent 基本信息：仓库 earendil-works/pi，Stars 74.2k+，Releases 247+，最新 v0.80.10\n' +
    '   技术栈 TypeScript 93.3% + JavaScript 6.0%，License MIT\n' +
    '   4 核心包：pi-coding-agent / pi-agent-core / pi-ai / pi-tui\n' +
    '\n' +
    '2. PI 关键特征（对 OmniPM 的影响）：\n' +
    '   - AGENTS.md 原生支持 → OmniPM 零配置自动加载\n' +
    '   - 无内置权限系统 → OmniPM 安全层是核心防线\n' +
    '   - ReAct 事件循环（Think-Act-Observe）→ 匹配 OmniPM 状态机\n' +
    '   - 提供商无关（pi-ai）→ 简化模型适配（仅需 Anthropic 路径）\n' +
    '   - 自扩展能力 → Agent 可修改自身配置\n' +
    '   - 差分 TUI 渲染 → OmniPM 输出格式需适配\n' +
    '\n' +
    '3. PI 可访问机制（OmniPM 可利用）：\n' +
    '   - steering 消息 → GATE 确认块可以利用\n' +
    '   - terminate 信号 → Step 完成信号\n' +
    '   - sessionId → SESSION_CONTEXT 追踪\n' +
    '   - AGENTS.md @filename 语法 → 模块加载\n' +
    '\n' +
    '4. PI 不可访问机制（OmniPM 无法触及的 PI 内部 API）：\n' +
    '   - beforeToolCall / afterToolCall hooks → PI agent-core 内部\n' +
    '   - transformContext → PI agent-core 内部\n' +
    '   - agent-core 内部状态管理\n' +
    '\n' +
    '5. PI 容器化方案：Gondolin（微VM）/ Plain Docker / OpenShell\n' +
    '\n' +
    '6. PI 供应链安全策略：exact pinning / --ignore-scripts / npm-shrinkwrap / CI audit\n' +
    '\n' +
    '7. OmniPM 适配参数（仅 PI 环境）：\n' +
    '   gate_confirm_insist: STRICT\n' +
    '   state_tracking_frequency: HIGH\n' +
    '   output_format_verbosity: FULL（TUI 适配）\n' +
    '   security_scan_depth: DEEP\n' +
    '\n' +
    '格式：Markdown，结构化表格。参考被替代的 MODEL_PROFILES.md 风格但完全重写。',
    {label: 'pi-profile'}
  ),

  // PI_TEST_SUITE.md
  () => agent(
    '创建文件 D:\\MyProject\\Genesis_OmniPM\\PI_TEST_SUITE.md。\n' +
    '\n' +
    '这是 PI 专属测试用例集，替代 v0.3.0 的 CROSS_MODEL_TEST_SUITE.md。共 31 个用例。\n' +
    '\n' +
    '请先 Read D:\\MyProject\\Genesis_OmniPM\\CROSS_MODEL_TEST_SUITE.md 了解原有结构和风格。\n' +
    '\n' +
    '内容要求（31 用例，分 9 类）：\n' +
    '\n' +
    '1. 路由测试（6 用例）：\n' +
    '   - 个人记账Web应用 → DEV-Web全栈\n' +
    '   - Python零基础课程 → COURSE-在线课程\n' +
    '   - B2B SaaS技术选型方案 → SOLUTION-技术方案\n' +
    '   - React Hooks技术博客 → GRAPHIC-技术文章\n' +
    '   - 程序员音频播客 → AV-播客制作\n' +
    '   - "帮我做个东西" → 三级降级\n' +
    '\n' +
    '2. 状态机测试（4 用例）：\n' +
    '   - IDLE → REQUIREMENT_ALIGNMENT（正常触发）\n' +
    '   - GATE 非"确认"短语 → 二次确认（§1.4 字典）\n' +
    '   - Step D 测试失败 → 回退 Step C\n' +
    '   - Step B 设计级缺陷 → 回退 Step A\n' +
    '\n' +
    '3. GATE 测试（3 用例）：GATE-REQUIREMENT / GATE-DESIGN / GATE-ACCEPTANCE 格式完整性\n' +
    '\n' +
    '4. 安全测试（5 用例，含 2 个新增 TS 用例）：\n' +
    '   - 提示词注入阻断\n' +
    '   - 禁止函数检测（Python eval）\n' +
    '   - TypeScript eval() 检测（新增）\n' +
    '   - TypeScript new Function() 检测（新增）\n' +
    '   - 依赖审查确认流程\n' +
    '\n' +
    '5. 专家评审测试（2 用例）：8 专家输出格式 + 交织指令原语解析\n' +
    '\n' +
    '6. 输出格式测试（2 用例）：5 种 OUTPUT_BLOCK 格式 + PI TUI 差分渲染兼容\n' +
    '\n' +
    '7. 混合型测试（4 用例）：DEV×COURSE / DEV×GRAPHIC / SOLUTION×GRAPHIC / 未知混合型骨架降级\n' +
    '\n' +
    '8. 能力自发现测试（3 用例，新增）：\n' +
    '   - CDL 搜索返回匹配 Skill\n' +
    '   - CDL Q-Score 评分准确性\n' +
    '   - CDL 安装 + .pi/ 写入\n' +
    '   重要：CDL 测试需使用 mock 策略——测试模式从 fixtures/cdl-mock-results/ 读取预定义搜索结果\n' +
    '\n' +
    '9. 棕地接管测试（2 用例，新增）：\n' +
    '   - 既存 React 项目（CRA）扫描分析\n' +
    '   - 既存项目状态机入口判断（清晰代码→Step C / 需重新设计→Step A）\n' +
    '\n' +
    '测试夹具说明：\n' +
    '   - fixtures/greenfield-empty/ — 空目录\n' +
    '   - fixtures/brownfield-react-app/ — CRA 项目（package.json + tsconfig.json + src/App.tsx + README.md，版本锁定）\n' +
    '\n' +
    '每个用例格式：用例编号 | 输入 | 期望输出/行为 | 判定标准 | PI 特定注意事项',
    {label: 'pi-test-suite'}
  ),
])

log('新增模块创建完成: ' + [cdlQuality, cdlGuide, piProfile, piTestSuite].filter(Boolean).join(', '))

// ============================================================
// Phase 2: 核心提示词重构
// ============================================================
phase('核心重构')

const coreResult = await agent(
  '重构文件 D:\\MyProject\\Genesis_OmniPM\\OMNIPM_SYSTEM_PROMPT.md，将其从 v0.3.0 升级到 v1.0.0-PI。\n' +
  '\n' +
  '请先 Read 完整文件（约1100行），然后逐项执行以下修改。\n' +
  '\n' +
  '=== 删除操作 ===\n' +
  '\n' +
  '1. 删除第十四附（模型适配配置层）：约 60 行的模型适配参数表（Claude/GPT-4o/Gemini/DeepSeek 适配参数速查、模型特定行为提示、前缀缓存优化）。整节删除。\n' +
  '\n' +
  '2. 删除第一节能力声明中"暂不支持的类型"描述和跨模型相关文本。\n' +
  '\n' +
  '=== 修改操作 ===\n' +
  '\n' +
  '3. 第一节版本和能力声明：\n' +
  '   - 版本标记更新为 VERSION: 1.0.0-PI\n' +
  '   - 能力声明：覆盖全部 5 种项目类型 + PI Agent 原生运行时 + CDL 能力自发现\n' +
  '   - 移除"仅完整支持开发型项目"的限制描述\n' +
  '\n' +
  '4. 第3.2节项目阶段规划，在"项目类型识别"和"阶段拆分"之间，新增步骤1.5——能力需求分析：\n' +
  '   根据项目类型+技术栈+功能需求生成《项目全景图》(PROJECT_PANORAMA.md)，然后触发 CDL 搜索。\n' +
  '\n' +
  '5. 第3.3节 Step B 专家评审末尾增加：\n' +
  '   "在 PI Agent 环境中，可尝试利用 Subagent 机制并行评审（如果可用），否则降级为文本依次扮演。"\n' +
  '\n' +
  '6. 第3.3节 Step C 开发实现：\n' +
  '   - 工具调用描述从"纯文本指令"改为"调用 PI 工具链 + 已安装的 Skill/MCP"\n' +
  '   - 安全门禁增加 TypeScript 禁止模式：eval()、new Function()、动态 import()（用户输入拼接）、child_process.exec()（string参数）\n' +
  '\n' +
  '7. 第2.3节代码生成安全门禁，禁止函数清单新增 TypeScript/JavaScript 列：\n' +
  '   - eval() → 显式逻辑重构\n' +
  '   - new Function() → 显式函数定义\n' +
  '   - import() 动态导入（用户输入拼接）→ 静态 import 语句\n' +
  '   - child_process.exec() string参数 → child_process.spawn() array参数\n' +
  '\n' +
  '8. 第9节模块加载协议，区分两种加载路径：\n' +
  '   - 静态模块：modules/ 目录下的预定义文件（roles.md、router_logic.md 等），通过 @LOAD 指令加载\n' +
  '   - 动态能力：CDL 搜索安装的外部 Skill/MCP/Subagent，通过 PI 工具调用加载\n' +
  '\n' +
  '=== 新增操作 ===\n' +
  '\n' +
  '9. 新增第十六节——能力自发现层（CDL），插入在第十五节（开始）之前。内容：\n' +
  '   - CDL 触发时机：GATE-REQUIREMENT 确认 → PROJECT_PANORAMA 生成 → CDL 搜索启动\n' +
  '   - 双生态搜索：PI 生态（Skills Registry/npm/MCP Registry）+ GitHub 生态（Verified Orgs/Actions/Dev Containers/模板仓库/参考实现）\n' +
  '   - 五维 Q-Score 质量评分（安全性30%/活跃度20%/社区验证25%/功能匹配15%/可维护性10%）+ 8 项一票否决\n' +
  '   - 安装安全协议：npm --ignore-scripts 默认 + 来源白名单 + 生命周期脚本二次确认\n' +
  '   - Best-effort 模式：部分安装失败标记 verified: false + failure_reason，不阻塞流程\n' +
  '   - 裸奔模式：CDL_MODE=baremetal 跳过全部搜索\n' +
  '   - .pi/ 目录配置写入（skills.yaml / mcp.yaml / subagents.yaml）\n' +
  '   - 能力类型开放式原则：包括但不限于 Skill/Subagent/Workflow/MCP/Actions/Dev Containers/CLI工具/参考实现\n' +
  '\n' +
  '10. 第十五节打招呼文案：\n' +
  '    - 版本号 v1.0.0-PI\n' +
  '    - 提及 PI Agent 原生运行\n' +
  '    - 提及 CDL 能力自发现\n' +
  '    - 移除"仅支持开发型"的限制描述\n' +
  '\n' +
  '=== 约束（不可修改的部分）===\n' +
  '以下章节必须保持完全不变：\n' +
  '- 第〇节 状态机定义\n' +
  '- 第2.1-2.2节 安全协议核心\n' +
  '- 第六节 门控协议\n' +
  '- 第五节 输出格式\n' +
  '- 第十节 专家分歧协议\n' +
  '- 第十二节 回退路径\n' +
  '- 第十四节 Few-shot 示例引用\n' +
  '\n' +
  '编辑后保存到原文件路径。不要创建新文件。',
  {label: 'core-refactor'}
)

log('核心重构完成: ' + (coreResult || 'done'))

// ============================================================
// Phase 3: 更新现有文件（并行）
// ============================================================
phase('文件更新')

const [secGate, agentsMd, changelog, decisions] = await parallel([
  // security_gate.md 更新
  () => agent(
    '更新文件 D:\\MyProject\\Genesis_OmniPM\\modules\\security_gate.md。\n' +
    '\n' +
    '请先 Read 完整文件，然后执行以下最小化修改：\n' +
    '\n' +
    '1. 在禁止函数清单表格中新增 TypeScript/JavaScript 列：\n' +
    '   - eval() → 安全替代：显式逻辑重构\n' +
    '   - new Function() → 安全替代：显式函数定义\n' +
    '   - import() 动态导入（用户输入拼接）→ 安全替代：静态 import 语句\n' +
    '   - child_process.exec(string参数) → 安全替代：child_process.spawn(array参数)\n' +
    '   - fs.readFile() 路径拼接用户输入 → 安全替代：path.resolve() + 白名单验证\n' +
    '   - JSON.parse() 无 try-catch → 安全替代：try-catch + size limit\n' +
    '\n' +
    '2. 新增"PI 命令注入防护"小节：\n' +
    '   - PI 的 ! 前缀命令转义中，用户输入需白名单校验\n' +
    '   - 禁止在 ! 命令中拼接未净化的用户输入\n' +
    '\n' +
    '3. 删除附录B（跨模型安全策略适配表）——因为 v1.0.0-PI 不再需要跨模型适配。\n' +
    '\n' +
    '不改变现有文件的其他结构和格式。',
    {label: 'security-gate-update'}
  ),

  // AGENTS.md 更新
  () => agent(
    '更新或创建文件 D:\\MyProject\\Genesis_OmniPM\\AGENTS.md。\n' +
    '\n' +
    '目标内容（如果文件不存在或为空则创建）：\n' +
    '第一行：@OMNIPM_SYSTEM_PROMPT.md\n' +
    '\n' +
    '如果文件已有内容，在第一行插入或替换为 @OMNIPM_SYSTEM_PROMPT.md，保留其余内容（如 PI 项目规则等）。\n' +
    '\n' +
    '请先 Read 文件确认当前状态。',
    {label: 'agents-md'}
  ),

  // CHANGELOG.md 更新
  () => agent(
    '更新文件 D:\\MyProject\\Genesis_OmniPM\\CHANGELOG.md。\n' +
    '\n' +
    '请先 Read 完整文件，找到版本号说明表格之后、[v0.1.0] 条目之前的插入位置。\n' +
    '\n' +
    '在该位置插入 v1.0.0-PI 条目（注意：用实际的换行和缩进，不要用代码块标记）：\n' +
    '\n' +
    '## [v1.0.0-PI] — PI Agent 原生运行时 + 能力自发现层（CDL）\n' +
    '\n' +
    '**发布日期**：2026-07-21\n' +
    '\n' +
    '### 战略转向\n' +
    'OmniPM 从"跨模型通用提示词系统"转型为"PI Agent 原生项目总负责人运行时"。\n' +
    '\n' +
    '### 核心变更\n' +
    '\n' +
    '#### 移除（跨模型兼容层退役）\n' +
    '- 第十四附 模型适配配置层（~60行）\n' +
    '- MODEL_PROFILES.md → 归档\n' +
    '- CROSS_MODEL_TEST_SUITE.md → 归档为 PI_TEST_SUITE.md\n' +
    '- CROSS_MODEL_VALIDATION_PROTOCOL.md → 归档\n' +
    '- BDS 行为偏差分数\n' +
    '- GPT-4o/Gemini/DeepSeek 特定适配参数\n' +
    '\n' +
    '#### 新增（PI 原生 + CDL）\n' +
    '- 第十六节 能力自发现层（CDL）：PI + GitHub 双生态搜索、五维 Q-Score、8 项一票否决\n' +
    '- PI_PROFILE.md：PI Agent 特有能力与限制速查\n' +
    '- PI_TEST_SUITE.md：31 个 PI 专属测试用例\n' +
    '- modules/cdl_quality_gate.md：Q-Score 评分卡\n' +
    '- modules/cdl_guide.md：CDL 搜索安装操作指南\n' +
    '- .pi/ 项目级配置目录规范\n' +
    '- 绿地/棕地双入口模式\n' +
    '- TypeScript 安全门禁\n' +
    '\n' +
    '#### 修改（PI 化适配）\n' +
    '- 第一节：v1.0.0-PI，PI Agent 原生\n' +
    '- 第3.2节：新增步骤 1.5——能力需求分析 → CDL 触发\n' +
    '- 第3.3节 Step B/C：PI Subagent 并行 + TypeScript 安全模式\n' +
    '- 第2.3节：新增 TS/JS 禁止模式\n' +
    '- 第九节：静态模块 vs CDL 动态能力\n' +
    '- 第十五节：PI Agent 原生 + CDL 提及\n' +
    '- modules/security_gate.md：+TS 禁止模式，-跨模型适配表\n' +
    '- AGENTS.md：@OMNIPM_SYSTEM_PROMPT.md\n' +
    '\n' +
    '#### 保留（不变的核心资产）\n' +
    '- 全部 13 位专家角色、5 类型路由、10 对交织矩阵、4 种差异化工作流\n' +
    '- 状态机定义、门控协议、安全协议核心、输出格式、回退路径\n' +
    '\n' +
    '请确保格式与现有 CHANGELOG 条目一致。',
    {label: 'changelog'}
  ),

  // PROJECT_DECISIONS.md 更新
  () => agent(
    '更新文件 D:\\MyProject\\Genesis_OmniPM\\PROJECT_DECISIONS.md。\n' +
    '\n' +
    '请先 Read 完整文件，找到最后一条 ADR 记录的结束位置（最后的 --- 分隔符之后）。\n' +
    '\n' +
    '在该位置追加两条新 ADR：\n' +
    '\n' +
    '=== ADR #007 — PI Agent 原生适配决策 ===\n' +
    '\n' +
    '## [决策] #007 — PI Agent 原生适配决策\n' +
    '\n' +
    '- 时间戳：2026-07-21T00:00:00Z\n' +
    '- 决策人：Orion（综合 8 位专家评审意见）\n' +
    '- 议题：OmniPM 从跨模型通用提示词转型为 PI Agent 原生运行时\n' +
    '- 背景：v0.3.0 完成了跨模型兼容性验证，但"通用"意味着"均不深入"。PI Agent 的工具调用循环、AGENTS.md 原生支持、自扩展能力使其成为 OmniPM 最理想的运行环境。\n' +
    '- 选项：\n' +
    '  - A: 保持跨模型通用 + 继续维护 4 套模型适配参数\n' +
    '  - B: 完全转向 PI Agent，移除跨模型兼容层\n' +
    '  - C: 分叉为两个版本（通用版 + PI 版）\n' +
    '- 结论：选择 B。移除第十四附（~60行）、MODEL_PROFILES.md、CROSS_MODEL_TEST_SUITE.md、CROSS_MODEL_VALIDATION_PROTOCOL.md 及所有跨模型适配代码。OmniPM 完整保留全部核心能力。\n' +
    '- 影响范围：OMNIPM_SYSTEM_PROMPT.md、modules/security_gate.md、AGENTS.md\n' +
    '- 替代方案记录：A 被淘汰因为维护成本高于收益；C 被淘汰因为分叉维护负担过重。\n' +
    '\n' +
    '---\n' +
    '\n' +
    '=== ADR #008 — 能力自发现层（CDL）架构决策 ===\n' +
    '\n' +
    '## [决策] #008 — 能力自发现层（CDL）架构决策\n' +
    '\n' +
    '- 时间戳：2026-07-21T00:00:00Z\n' +
    '- 决策人：Orion（综合 8 位专家评审意见，Step B 决议）\n' +
    '- 议题：CDL 的搜索范围、质量门禁和安装策略\n' +
    '- 背景：v0.3.0 的模块加载是静态的。用户需要手动发现和配置外部能力。v1.0.0-PI 需要实现主动能力发现。\n' +
    '- 选项：\n' +
    '  - A: 仅搜索 PI 生态（Skills Registry / npm / MCP Registry）\n' +
    '  - B: PI + GitHub 双生态搜索（含 Actions、Dev Containers、模板仓库、参考实现等）\n' +
    '  - C: 开放式搜索（PI + GitHub + GitLab + 任意 URL）\n' +
    '- 结论：选择 B。PI 生态覆盖核心能力，GitHub 生态覆盖辅助能力。C 的部分功能通过 .pi/config.yaml 的 custom_sources 字段实现（含私有 GitLab），任意 URL 因安全风险暂不支持。\n' +
    '- 影响范围：OMNIPM_SYSTEM_PROMPT.md 第十六节、modules/cdl_quality_gate.md、modules/cdl_guide.md、.pi/ 目录\n' +
    '- 替代方案记录：A 被淘汰因为范围过窄；C 部分采纳——通过 custom_sources 支持用户自定义扩展源。\n' +
    '\n' +
    '---\n',
    {label: 'project-decisions'}
  ),
])

log('文件更新完成: ' + [secGate, agentsMd, changelog, decisions].filter(Boolean).join(', '))

// ============================================================
// Phase 4: 归档废弃文件
// ============================================================
phase('归档')

const archiveResult = await agent(
  '在 D:\\MyProject\\Genesis_OmniPM\\ 目录下执行以下文件重命名（归档而非删除）：\n' +
  '\n' +
  '对每个文件，先检查是否存在（用 Read 工具），存在则用 Bash mv 重命名：\n' +
  '\n' +
  '1. MODEL_PROFILES.md → _archived_MODEL_PROFILES.md\n' +
  '2. CROSS_MODEL_TEST_SUITE.md → _archived_CROSS_MODEL_TEST_SUITE.md\n' +
  '3. CROSS_MODEL_VALIDATION_PROTOCOL.md → _archived_CROSS_MODEL_VALIDATION_PROTOCOL.md\n' +
  '4. USER_GUIDE.md → _archived_USER_GUIDE.md\n' +
  '\n' +
  '返回归档结果（哪些成功、哪些因文件不存在而跳过）。',
  {label: 'archive'}
)

log('归档完成')

// ============================================================
// 汇总
// ============================================================
return {
  phase1_new_modules: [cdlQuality, cdlGuide, piProfile, piTestSuite].filter(Boolean).length + ' 个模块创建',
  phase2_core_refactor: coreResult ? '完成' : '待确认',
  phase3_updates: [secGate, agentsMd, changelog, decisions].filter(Boolean).length + ' 个文件更新',
  phase4_archive: archiveResult || '待确认',
}
