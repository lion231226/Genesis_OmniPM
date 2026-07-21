# OmniPM 模型适配配置表

> 版本：0.3.0 | 用途：跨模型部署时的行为特征参考和参数调优指南

---

## 一、模型行为特征矩阵

| 特征维度 | Claude (3.5/4) | GPT-4o | Gemini 1.5 Pro | DeepSeek-V3 |
|---------|---------------|--------|---------------|-------------|
| **上下文窗口** | 200K | 128K | 1M+ | 128K |
| **指令遵循精度** | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ |
| **长上下文稳定性** | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ |
| **中文理解** | ★★★★☆ | ★★★★☆ | ★★★★☆ | ★★★★★ |
| **结构化输出** | ★★★★★ | ★★★★☆ | ★★★☆☆ | ★★★★☆ |
| **多角色切换** | ★★★★★ | ★★★☆☆ | ★★★☆☆ | ★★★★☆ |
| **安全指令遵循** | ★★★★★ | ★★★★☆ | ★★★★★ | ★★★★☆ |
| **前缀缓存支持** | ✅ 自动 | ✅ 自动 | ✅ API显式 | ✅ 自动 |

## 二、适配参数配置

```yaml
# 模型适配参数 —— 部署时根据目标模型设置
model_profiles:
  claude:
    gate_confirm_insist: STRICT
    state_tracking_frequency: NORMAL
    output_format_verbosity: FULL
    security_scan_depth: DEEP
    multi_expert_parallel_hint: null  # Claude可并行生成
    known_quirks: []
    
  gpt4o:
    gate_confirm_insist: STRICT
    state_tracking_frequency: HIGH       # 需更频繁的状态心跳防止漂移
    output_format_verbosity: FULL
    security_scan_depth: STANDARD
    multi_expert_parallel_hint: "[请严格依次扮演每位专家，完成一位后再开始下一位]"
    known_quirks:
      - "长上下文中可能跳过GATE确认步骤，需增强心跳频率"
      - "对自定义指令语法（@WEAVE等）的解析可能不稳定"
      
  gemini:
    gate_confirm_insist: STRICT
    state_tracking_frequency: HIGH       # 最高频率，1M上下文中最易退化
    output_format_verbosity: COMPACT     # 精简输出以节省上下文
    security_scan_depth: STANDARD
    multi_expert_parallel_hint: "[请依次扮演每位专家，严格使用指定输出格式]"
    known_quirks:
      - "超长上下文（>100K）中状态机遵循显著退化，建议分会话"
      - "对Markdown表格的解析优于YAML块"
      - "安全过滤在API层和提示词层双重生效，可能过度拒绝"
      
  deepseek:
    gate_confirm_insist: STRICT
    state_tracking_frequency: HIGH
    output_format_verbosity: FULL
    security_scan_depth: STANDARD
    multi_expert_parallel_hint: "[请依次扮演每位专家]"
    known_quirks:
      - "中文安全指令遵循良好，英文安全指令可能被忽略——安全关键词检测需提供中英双语版本"
      - "对YAML结构化数据的解析准确度高于Markdown表格"
```

## 三、已知不兼容项

| 功能 | Claude | GPT-4o | Gemini | DeepSeek | 说明 |
|------|--------|--------|--------|----------|------|
| 并行多专家评审 | ✅ | ❌ | ❌ | ❌ | 非Claude模型需显式"依次"指令 |
| 自定义指令语法(@WEAVE等) | ✅ | ⚠️ | ⚠️ | ✅ | GPT-4o/Gemini可能误解自定义语法 |
| 超长会话(>100K tokens) | ✅ | ⚠️ | ❌ | ⚠️ | Gemini最易退化 |
| Mermaid图表渲染 | ✅ | ✅ | ⚠️ | ✅ | Gemini Mermaid支持不稳定 |
| 记忆文件自校验(checksum) | ✅ | ⚠️ | ⚠️ | ⚠️ | SHA256计算依赖模型遵循度 |

> ✅ 完全支持 | ⚠️ 部分支持（需增强指令/适配参数） | ❌ 已知问题

## 四、前缀缓存优化指南

```
缓存友好结构：
  ┌─────────────────────────┐
  │ §〇 状态机定义           │ ← 固定，高缓存命中
  │ §一 角色身份             │ ← 固定
  │ §二 安全协议             │ ← 固定
  │ §三 核心交互协议         │ ← 大部分固定（§3.3.1混合型 为新增可选段）
  │ ...                      │
  │ §十四 Few-shot           │ ← 固定
  │ §十四附 模型适配配置     │ ← 新增，~200 tokens，放在固定段末尾
  │ §十五 开始               │ ← 固定
  └─────────────────────────┘

缓存破坏模式（避免）：
  ❌ 在固定段中插入 {{CURRENT_DATETIME}}
  ❌ 在固定段中插入 {{SESSION_ID}}
  ❌ 在固定段中插入用户项目名
  ✅ 将动态内容放在用户消息中传递，而非系统提示词中
```
