# 鲜达生鲜小程序 · 多人并行开发任务总览

---

## 协作模式

- **分支策略：** 每人基于 `main` 切出独立 `feature` 分支，开发完成后通过 Pull Request 合并回 `main`
- **并行策略：**
  1. **Task 00（项目骨架）** 需最先完成，阻塞所有其他任务
  2. **Task 01（后端 API）** 与 **Task 02/03/04（前端三端）** 可并行：前端基于 Mock 数据先行开发，后端提前 3-5 天交付核心接口契约
  3. **联调阶段：** 后端接口就绪后，前端逐步替换 Mock 为真实 API

---

## 任务分配

| 编号 | 任务 | 分支名 | 负责人 | 工期 | 优先级 |
|------|------|--------|--------|------|--------|
| 00 | 项目骨架与基础设施 | `feat/project-setup` | 架构师 | 1-2 天 | P0 |
| 01 | 后端 API 与核心业务 | `feat/backend-api` | 后端开发 | 2-3 周 | P0 |
| 02 | 用户端小程序 | `feat/user-miniapp` | 前端开发 A | 2 周 | P1 |
| 03 | 商家端小程序 | `feat/supplier-miniapp` | 前端开发 B | 1 周 | P1 |
| 04 | 管理后台 | `feat/admin-dashboard` | 前端开发 C | 2 周 | P1 |

---

## 目录结构

```
freshdash/
├── tasks/                          # 本目录：开发任务文档
│   ├── README.md                   # 总览（本文件）
│   ├── 00-project-setup/
│   │   └── TASK.md                 # 项目骨架搭建任务
│   ├── 01-backend-api/
│   │   └── TASK.md                 # 后端 API 开发任务
│   ├── 02-user-miniapp/
│   │   └── TASK.md                 # 用户端小程序开发任务
│   ├── 03-supplier-miniapp/
│   │   └── TASK.md                 # 商家端小程序开发任务
│   └── 04-admin-dashboard/
│       └── TASK.md                 # 管理后台开发任务
│
├── apps/                           # 代码目录（由 Task 00 创建）
│   ├── miniapp/                    # 用户端小程序（Task 02）
│   ├── supplier/                   # 商家端小程序（Task 03）
│   ├── admin/                      # 管理后台（Task 04）
│   └── server/                     # 后端服务（Task 01）
│
├── packages/
│   └── shared-types/               # 前后端共享类型（Task 00 创建，全员维护）
│
└── 鲜达生鲜小程序_产品需求文档_PRD.md   # 产品需求文档（唯一数据源）
```

---

## 开发流程

### 1. 认领任务
每位开发者阅读对应目录下的 `TASK.md`，确认范围和验收标准。

### 2. 创建分支
```bash
# 从最新的 main 切出
git checkout main
git pull origin main
git checkout -b feat/xxx
```

### 3. 开发规范
- **代码规范：** 根目录 ESLint + Prettier，提交前必须 `pnpm lint` 通过
- **提交规范：** 使用 `feat:`、`fix:`、`docs:`、`refactor:` 等前缀
- **Mock 策略：** 前端开发初期使用 TASK.md 中指定的 Mock 数据，接口契约以 PRD 第 9 章为准

### 4. 每日同步
- 早会 10 分钟同步进度和阻塞点
- 后端每完成一个 Phase 的接口，在群里通知前端替换 Mock

### 5. 合并前检查
开发者在 `TASK.md` 末尾的"合并检查清单"中逐项自查，全部勾选后发起 Pull Request。

### 6. Code Review
- 至少 1 人 Review 通过后方可合并
- 冲突解决原则：以 `main` 分支为准，本地 rebase 后强制 push 到 feature 分支

---

## 关键协作节点

| 时间节点 | 事件 | 参与方 |
|----------|------|--------|
| Day 1-2 | Task 00 完成，项目骨架可用，API 契约文档输出 | 架构师 → 全员 |
| Day 3 | Task 01 Phase 1 完成（认证/商品/购物车/地址 API） | 后端 → 前端 |
| Day 5 | Task 01 Phase 2 完成（订单/支付 API） | 后端 → 前端 |
| Day 8 | Task 01 Phase 3 完成（供应商/派单 API） | 后端 → 前端 |
| Day 12 | Task 01 Phase 4 完成（推广员/佣金 API） | 后端 → 前端 |
| Day 15 | 全员联调开始，前端逐步替换 Mock | 全员 |
| Day 18 | 联调结束，进入测试验收 | 全员 |

---

## 注意事项

1. **PRD 是唯一数据源：** 任何业务规则、字段定义、状态流转以根目录的 PRD 为准，任务文档是对 PRD 的拆解而非替代
2. **共享类型全员维护：** `packages/shared-types` 变更需通知所有前端和后端，避免类型不一致
3. **环境变量统一管理：** 新增环境变量必须同步更新 `.env.example`，禁止在代码中硬编码密钥
4. **数据库变更走 migration：** 任何人修改 `schema.prisma` 后必须生成 migration 文件并提交
