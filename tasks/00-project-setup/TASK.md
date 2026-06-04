# Task 00: 项目骨架与基础设施搭建

> **分支名：** `feat/project-setup`  
> **负责人：** 架构师 / 技术负责人  
> **优先级：** P0（阻塞所有其他任务）  
> **预估工期：** 1～2 天

---

## 1. 任务目标

搭建可供多人并行开发的 Monorepo 项目骨架，配置好共享依赖、代码规范、数据库连接和容器化环境，确保后续四个开发任务可以零阻塞地并行启动。

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 包管理 | pnpm + workspaces | Monorepo 管理 |
| 语言 | TypeScript 5.x | 全栈统一 |
| 构建 | Vite（前端）/ tsx（后端开发热重载） | — |
| 代码规范 | ESLint + Prettier | 统一配置放根目录 |
| 数据库 | PostgreSQL 15 + Prisma 5.x | 提供初始 migration |
| 缓存/队列 | Redis 7 | BullMQ 依赖 |
| 容器 | Docker + Docker Compose | 开发环境一键启动 |

---

## 3. 交付目录结构

```
freshdash/
├── package.json              # pnpm workspaces 配置
├── pnpm-workspace.yaml
├── tsconfig.base.json        # 共享 TS 配置
├── eslint.config.js
├── prettier.config.js
├── docker-compose.yml        # PostgreSQL + Redis + MinIO(可选)
├── Dockerfile                # 生产构建（server）
├── .env.example              # 环境变量模板
├── packages/
│   └── shared-types/         # 前后端共享类型
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── models/       # Prisma 模型对应的 DTO/类型
│           └── enums/        # 共享枚举（OrderStatus 等）
└── apps/
    ├── miniapp/              # 用户端小程序（空壳即可）
    ├── supplier/             # 商家端小程序（空壳即可）
    ├── admin/                # 管理后台（空壳即可）
    └── server/               # 后端服务（Fastify 空壳 + 数据库连接）
        ├── src/
        │   ├── server.ts     # Fastify 实例创建
        │   ├── plugins/      # CORS、JWT、ErrorHandler
        │   ├── prisma/
        │   │   └── schema.prisma  # 完整 Schema（从 PRD 第 8 章复制）
        │   └── routes/       # 空目录，供后续任务填充
        └── package.json
```

---

## 4. 详细任务清单

### 4.1 Monorepo 配置
- [ ] 根目录 `package.json` 配置 `pnpm-workspace.yaml`
- [ ] 根目录共享 `tsconfig.base.json`（严格模式、`paths` 映射）
- [ ] 根目录 ESLint + Prettier 配置，支持 React + Node 混合项目
- [ ] 配置 `husky` + `lint-staged`（可选，推荐）

### 4.2 共享类型包 `packages/shared-types`
- [ ] 创建独立 package，导出共享 TypeScript 类型
- [ ] 包含：OrderStatus、CommissionStatus、PromoterStatus 等枚举
- [ ] 包含：创建订单 DTO、商品 DTO、地址 DTO 等基础类型
- [ ] 被 `apps/server`、`apps/miniapp`、`apps/supplier`、`apps/admin` 依赖

### 4.3 后端空壳 `apps/server`
- [ ] Fastify 4 初始化，挂载健康检查路由 `GET /health`
- [ ] 注册全局插件：CORS、Helmet、Error Handler、Request Logger
- [ ] JWT 插件封装（区分用户端 JWT 和供应商端 JWT）
- [ ] Prisma Client 初始化，封装为 Fastify 装饰器 `fastify.prisma`
- [ ] BullMQ 连接初始化（Redis）
- [ ] 环境变量校验（使用 `envalid` 或 `zod`）

### 4.4 数据库 Schema & Migration
- [ ] 将 PRD 第 8 章所有表复制到 `schema.prisma`
- [ ] 生成初始 migration：`npx prisma migrate dev --name init`
- [ ] 提供 `prisma seed` 脚本：插入 3-5 个分类、20-30 个商品、2-3 个供应商、1 个管理员账号

### 4.5 Docker 开发环境
- [ ] `docker-compose.yml` 包含：PostgreSQL（端口 5432）、Redis（端口 6379）
- [ ] 提供 `.env.example`，说明每个环境变量的用途

### 4.6 前端空壳（三个）
- [ ] `apps/miniapp`：Taro 3 + React + TS + NutUI 初始化，能编译出微信小程序
- [ ] `apps/supplier`：同上，独立项目配置
- [ ] `apps/admin`：Vite + React + TS + Ant Design Pro 初始化，能跑起登录页骨架

---

## 5. 接口契约提前约定（供其他任务参考）

本任务负责定义并输出一份 **`API_INTERFACE.md`**（放在 `apps/server/docs/` 下），内容包括：

- 统一响应格式：`{ code: number, data: T, message: string }`
- JWT 传递方式：`Authorization: Bearer <token>`
- 分页格式：`{ list: T[], total: number, page: number, pageSize: number }`
- 各模块路由前缀：
  - 用户端：`/`（如 `/products`、`/orders`）
  - 商家端：`/supplier`
  - 管理后台：`/admin`

> 注：具体接口路径和字段详见 PRD 第 9 章，本任务只需约定通用规范。

---

## 6. 依赖关系

| 依赖方 | 说明 |
|--------|------|
| Task 01 (后端 API) | 依赖本项目提供的数据库、Fastify 骨架、共享类型 |
| Task 02 (用户端) | 依赖本项目的 Taro 空壳、共享类型、API 契约 |
| Task 03 (商家端) | 同上 |
| Task 04 (管理后台) | 同上 |

---

## 7. 验收标准

- [ ] `pnpm install` 在根目录一次性安装所有依赖，无冲突
- [ ] `docker-compose up` 能启动 PostgreSQL 和 Redis
- [ ] `cd apps/server && pnpm dev` 能启动后端，访问 `GET /health` 返回 200
- [ ] `cd apps/miniapp && pnpm dev:weapp` 能编译微信小程序（无报错）
- [ ] `cd apps/admin && pnpm dev` 能启动管理后台（看到登录页骨架）
- [ ] `npx prisma migrate dev` 能成功执行初始 migration
- [ ] `npx prisma db seed` 能插入 Demo 数据
- [ ] `packages/shared-types` 能被其他 apps 正常 import

---

## 8. 合并检查清单

合并到 `main` 分支前，确保：
- [ ] 所有目录结构符合本任务第 3 节
- [ ] `.env.example` 完整，无敏感信息泄露
- [ ] `README.md`（根目录）已更新，说明如何启动开发环境
