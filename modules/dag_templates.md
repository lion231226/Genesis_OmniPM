# OmniPM v2.4.0 — 工作流 DAG 模板库

> 预置 12 个常见项目类型的 DAG 模板，减少 Meta-Orion 从头生成成本。
> Meta-Orion 按项目特征选择最匹配的模板，然后按需裁剪节点/增减专家。

---

## 模板索引

| # | 模板名 | 适用场景 | 节点数 | 核心专家 |
|---|--------|---------|--------|---------|
| T1 | `web-app-fullstack` | Web全栈应用 | 8 | REQ+ARCH+DB+SEC+FE+BE+QA+OPS |
| T2 | `api-backend` | 纯后端API服务 | 5 | REQ+ARCH+DB+SEC+BE+QA |
| T3 | `mobile-app` | 移动端App | 8 | REQ+ARCH+SEC+FE+BE+QA+OPS |
| T4 | `mini-program` | 微信小程序 | 6 | REQ+ARCH+FE+BE+QA |
| T5 | `data-pipeline` | 数据管道/ETL | 5 | REQ+ARCH+DB+BE+QA |
| T6 | `microservice` | 微服务拆分 | 9 | REQ+ARCH+DB+SEC+BE+QA+OPS |
| T7 | `online-course` | 在线课程 | 5 | REQ+COURSE+REVIEWER+SEO+MEDIA |
| T8 | `consulting-report` | 咨询报告/方案 | 4 | REQ+ARCH+MARKET+CONTENT_REVIEWER |
| T9 | `content-blog` | 图文内容/博客 | 4 | REQ+REVIEWER+SEO+FE |
| T10 | `video-production` | 视频制作 | 5 | REQ+MEDIA+REVIEWER+SEO |
| T11 | `devops-pipeline` | CI/CD流水线 | 4 | REQ+ARCH+OPS+SEC |
| T12 | `security-audit` | 安全审计 | 4 | REQ+SEC+ARCH+OPS |

---

## T1: web-app-fullstack（Web全栈应用）

```yaml
template: web-app-fullstack
version: "2.4.0"
description: "前后端分离的Web全栈应用，含数据库、认证、部署"
nodes:
  - {id: "GATE-REQ", name: "需求分析+CDL搜索", type: GATE, dependsOn: []}
  - {id: "DESIGN-ARCH", name: "系统架构设计", type: DESIGN, dependsOn: ["GATE-REQ"]}
  - {id: "DESIGN-DB", name: "数据库模型设计", type: DESIGN, dependsOn: ["DESIGN-ARCH"]}
  - {id: "DESIGN-API", name: "API接口设计", type: DESIGN, dependsOn: ["DESIGN-ARCH"]}
  - {id: "REVIEW-SEC", name: "安全评审", type: REVIEW, dependsOn: ["DESIGN-API", "DESIGN-DB"]}
  - {id: "GATE-DESIGN", name: "设计冻结确认", type: GATE, dependsOn: ["DESIGN-API", "DESIGN-DB", "REVIEW-SEC"]}
  - {id: "DEV-BACKEND", name: "后端开发", type: DEVELOP, dependsOn: ["GATE-DESIGN"]}
  - {id: "DEV-FRONTEND", name: "前端开发", type: DEVELOP, dependsOn: ["GATE-DESIGN"]}
  - {id: "TEST-INTEGRATION", name: "集成测试", type: TEST, dependsOn: ["DEV-BACKEND", "DEV-FRONTEND"]}
  - {id: "DEPLOY", name: "部署上线", type: DELIVER, dependsOn: ["TEST-INTEGRATION"]}
  - {id: "GATE-ACCEPT", name: "交付验收", type: GATE, dependsOn: ["DEPLOY"]}
expert_assembly:
  default: [requirements, architect, database, security, frontend, backend, qa, devops]
  by_node:
    GATE-REQ: [requirements]
    DESIGN-ARCH: [architect, requirements]
    DESIGN-DB: [database, architect]
    DESIGN-API: [backend, architect]
    REVIEW-SEC: [security]
    DEV-BACKEND: [backend]
    DEV-FRONTEND: [frontend]
    TEST-INTEGRATION: [qa]
    DEPLOY: [devops]
```

---

## T2: api-backend（纯后端API服务）

```yaml
template: api-backend
version: "2.4.0"
description: "纯后端API服务，无前端UI"
nodes:
  - {id: "GATE-REQ", name: "需求分析+CDL搜索", type: GATE, dependsOn: []}
  - {id: "DESIGN-ARCH", name: "系统架构+API设计", type: DESIGN, dependsOn: ["GATE-REQ"]}
  - {id: "DESIGN-DB", name: "数据库模型设计", type: DESIGN, dependsOn: ["DESIGN-ARCH"]}
  - {id: "REVIEW-SEC", name: "安全评审", type: REVIEW, dependsOn: ["DESIGN-ARCH", "DESIGN-DB"]}
  - {id: "GATE-DESIGN", name: "设计冻结确认", type: GATE, dependsOn: ["REVIEW-SEC"]}
  - {id: "DEV-BACKEND", name: "后端开发", type: DEVELOP, dependsOn: ["GATE-DESIGN"]}
  - {id: "TEST", name: "测试+质量门禁", type: TEST, dependsOn: ["DEV-BACKEND"]}
  - {id: "GATE-ACCEPT", name: "交付验收", type: GATE, dependsOn: ["TEST"]}
expert_assembly:
  default: [requirements, architect, database, security, backend, qa]
```

---

## T3: mobile-app（移动端App）

```yaml
template: mobile-app
version: "2.4.0"
description: "React Native/Flutter 移动端应用"
nodes:
  - {id: "GATE-REQ", name: "需求分析+CDL搜索", type: GATE, dependsOn: []}
  - {id: "DESIGN-ARCH", name: "移动端架构设计", type: DESIGN, dependsOn: ["GATE-REQ"]}
  - {id: "DESIGN-API", name: "API接口设计", type: DESIGN, dependsOn: ["DESIGN-ARCH"]}
  - {id: "REVIEW-SEC", name: "安全评审", type: REVIEW, dependsOn: ["DESIGN-API"]}
  - {id: "GATE-DESIGN", name: "设计冻结确认", type: GATE, dependsOn: ["DESIGN-API", "REVIEW-SEC"]}
  - {id: "DEV-FRONTEND", name: "移动端开发", type: DEVELOP, dependsOn: ["GATE-DESIGN"]}
  - {id: "DEV-BACKEND", name: "后端API开发", type: DEVELOP, dependsOn: ["GATE-DESIGN"]}
  - {id: "TEST", name: "集成测试+E2E", type: TEST, dependsOn: ["DEV-FRONTEND", "DEV-BACKEND"]}
  - {id: "DEPLOY", name: "发布上线", type: DELIVER, dependsOn: ["TEST"]}
  - {id: "GATE-ACCEPT", name: "交付验收", type: GATE, dependsOn: ["DEPLOY"]}
expert_assembly:
  default: [requirements, architect, security, frontend, backend, qa, devops]
```

---

## T4: mini-program（微信小程序）

```yaml
template: mini-program
version: "2.4.0"
description: "微信小程序，含云开发或自建后端"
nodes:
  - {id: "GATE-REQ", name: "需求分析+CDL搜索", type: GATE, dependsOn: []}
  - {id: "DESIGN-ARCH", name: "小程序架构+API设计", type: DESIGN, dependsOn: ["GATE-REQ"]}
  - {id: "GATE-DESIGN", name: "设计冻结确认", type: GATE, dependsOn: ["DESIGN-ARCH"]}
  - {id: "DEV-MINI", name: "小程序前端开发", type: DEVELOP, dependsOn: ["GATE-DESIGN"]}
  - {id: "DEV-BACKEND", name: "后端API开发", type: DEVELOP, dependsOn: ["GATE-DESIGN"]}
  - {id: "TEST", name: "测试+审核准备", type: TEST, dependsOn: ["DEV-MINI", "DEV-BACKEND"]}
  - {id: "GATE-ACCEPT", name: "交付验收", type: GATE, dependsOn: ["TEST"]}
expert_assembly:
  default: [requirements, architect, frontend, backend, qa]
```

---

## T5: data-pipeline（数据管道/ETL）

```yaml
template: data-pipeline
version: "2.4.0"
description: "数据采集/清洗/转换/存储管道"
nodes:
  - {id: "GATE-REQ", name: "数据需求分析", type: GATE, dependsOn: []}
  - {id: "DESIGN-ARCH", name: "数据架构设计", type: DESIGN, dependsOn: ["GATE-REQ"]}
  - {id: "DESIGN-DB", name: "存储模型设计", type: DESIGN, dependsOn: ["DESIGN-ARCH"]}
  - {id: "GATE-DESIGN", name: "设计冻结确认", type: GATE, dependsOn: ["DESIGN-DB"]}
  - {id: "DEV-PIPELINE", name: "管道开发", type: DEVELOP, dependsOn: ["GATE-DESIGN"]}
  - {id: "TEST", name: "数据质量验证", type: TEST, dependsOn: ["DEV-PIPELINE"]}
  - {id: "GATE-ACCEPT", name: "交付验收", type: GATE, dependsOn: ["TEST"]}
expert_assembly:
  default: [requirements, architect, database, backend, qa]
```

---

## T6: microservice（微服务拆分）

```yaml
template: microservice
version: "2.4.0"
description: "单体拆微服务或新建微服务架构"
nodes:
  - {id: "GATE-REQ", name: "需求分析+CDL搜索", type: GATE, dependsOn: []}
  - {id: "DESIGN-DOMAIN", name: "领域划分（DDD）", type: DESIGN, dependsOn: ["GATE-REQ"]}
  - {id: "DESIGN-ARCH", name: "微服务架构设计", type: DESIGN, dependsOn: ["DESIGN-DOMAIN"]}
  - {id: "DESIGN-DB", name: "每服务数据模型", type: DESIGN, dependsOn: ["DESIGN-ARCH"]}
  - {id: "REVIEW-SEC", name: "安全评审", type: REVIEW, dependsOn: ["DESIGN-ARCH"]}
  - {id: "GATE-DESIGN", name: "设计冻结确认", type: GATE, dependsOn: ["DESIGN-DB", "REVIEW-SEC"]}
  - {id: "DEV-SERVICES", name: "各服务开发", type: DEVELOP, dependsOn: ["GATE-DESIGN"]}
  - {id: "TEST-INTEGRATION", name: "集成+契约测试", type: TEST, dependsOn: ["DEV-SERVICES"]}
  - {id: "DEPLOY", name: "容器化部署", type: DELIVER, dependsOn: ["TEST-INTEGRATION"]}
  - {id: "GATE-ACCEPT", name: "交付验收", type: GATE, dependsOn: ["DEPLOY"]}
expert_assembly:
  default: [requirements, architect, database, security, backend, qa, devops]
```

---

## T7: online-course（在线课程）

```yaml
template: online-course
version: "2.4.0"
description: "在线课程/培训项目设计"
nodes:
  - {id: "GATE-REQ", name: "课程需求+受众分析", type: GATE, dependsOn: []}
  - {id: "DESIGN-COURSE", name: "教学大纲+学习路径", type: DESIGN, dependsOn: ["GATE-REQ"]}
  - {id: "REVIEW-CONTENT", name: "内容审核", type: REVIEW, dependsOn: ["DESIGN-COURSE"]}
  - {id: "GATE-DESIGN", name: "设计冻结确认", type: GATE, dependsOn: ["DESIGN-COURSE", "REVIEW-CONTENT"]}
  - {id: "DEV-CONTENT", name: "内容制作", type: DEVELOP, dependsOn: ["GATE-DESIGN"]}
  - {id: "TEST", name: "试讲+评估验证", type: TEST, dependsOn: ["DEV-CONTENT"]}
  - {id: "GATE-ACCEPT", name: "交付验收", type: GATE, dependsOn: ["TEST"]}
expert_assembly:
  default: [requirements, course-designer, content-reviewer, seo-expert, media-producer]
```

---

## T8: consulting-report（咨询报告/方案）

```yaml
template: consulting-report
version: "2.4.0"
description: "技术方案/商业策划/咨询报告"
nodes:
  - {id: "GATE-REQ", name: "需求确认+调研范围", type: GATE, dependsOn: []}
  - {id: "RESEARCH", name: "市场/技术调研", type: ANALYSIS, dependsOn: ["GATE-REQ"]}
  - {id: "DESIGN-REPORT", name: "报告架构设计", type: DESIGN, dependsOn: ["RESEARCH"]}
  - {id: "REVIEW", name: "内容审核+数据验证", type: REVIEW, dependsOn: ["DESIGN-REPORT"]}
  - {id: "GATE-DESIGN", name: "审核确认", type: GATE, dependsOn: ["REVIEW"]}
  - {id: "WRITE", name: "报告撰写", type: DEVELOP, dependsOn: ["GATE-DESIGN"]}
  - {id: "GATE-ACCEPT", name: "交付验收", type: GATE, dependsOn: ["WRITE"]}
expert_assembly:
  default: [requirements, architect, market-analyst, content-reviewer]
```

---

## T9-T12: 轻量模板

### T9: content-blog（图文内容/博客）
```yaml
nodes: [GATE-REQ, DESIGN, REVIEW, GATE-DESIGN, DEV, GATE-ACCEPT]
experts: [requirements, content-reviewer, seo-expert, frontend]
```

### T10: video-production（视频制作）
```yaml
nodes: [GATE-REQ, SCRIPT-DESIGN, REVIEW, GATE-DESIGN, PRODUCTION, GATE-ACCEPT]
experts: [requirements, media-producer, content-reviewer, seo-expert]
```

### T11: devops-pipeline（CI/CD流水线）
```yaml
nodes: [GATE-REQ, DESIGN-PIPELINE, REVIEW-SEC, GATE-DESIGN, IMPLEMENT, GATE-ACCEPT]
experts: [requirements, architect, devops, security]
```

### T12: security-audit（安全审计）
```yaml
nodes: [GATE-REQ, THREAT-MODEL, AUDIT, GATE-DESIGN, REMEDIATION, GATE-ACCEPT]
experts: [requirements, security, architect, devops]
```

---

## 使用方式

### Meta-Orion 模板选择逻辑

```yaml
template_selection:
  match_rules:
    - if: project_type == "开发型" AND has_frontend AND has_backend
      template: web-app-fullstack
    - if: project_type == "开发型" AND has_backend AND NOT has_frontend
      template: api-backend
    - if: project_type == "开发型" AND platform == "miniprogram"
      template: mini-program
    - if: project_type == "开发型" AND has_mobile
      template: mobile-app
    - if: project_type == "开发型" AND architecture == "microservices"
      template: microservice
    - if: project_type == "开发型" AND domain == "data"
      template: data-pipeline
    - if: project_type == "课程型"
      template: online-course
    - if: project_type == "方案型"
      template: consulting-report
    - if: project_type == "图文型"
      template: content-blog
    - if: project_type == "音视频型"
      template: video-production
  default: web-app-fullstack  # 无法匹配时降级
```

### 模板裁剪规则

Meta-Orion 选定模板后按以下规则裁剪：
1. 移除不适用领域的节点（如无数据库→移除 DESIGN-DB）
2. 调整专家强度（低风险 → DEEP→STANDARD）
3. 新增项目特有的节点（如支付模块→新增 REVIEW-PCI）
4. META-GATE 阶段展示裁剪结果供用户确认

---

## 版本历史

| 版本 | 日期 | 变更 |
|------|------|------|
| v2.4.0 | 2026-07-22 | 初始版本；12个预置模板；模板选择+裁剪规则 |
