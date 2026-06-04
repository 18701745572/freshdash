# Task 01: 后端 API 与核心业务实现

> **分支名：** `feat/backend-api`  
> **负责人：** 后端开发工程师  
> **优先级：** P0（阻塞前端联调，但前端可基于 Mock 并行）  
> **预估工期：** 2～3 周（可与前端并行，需提前 3-5 天交付核心接口）

---

## 1. 任务目标

实现鲜达生鲜小程序的完整后端服务，包括数据库操作、RESTful API、微信支付、BullMQ 延迟任务、佣金结算、风控规则、供应商派单等全部核心业务逻辑。

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | Fastify 4 | 高性能，内置 JSON Schema 验证 |
| 语言 | TypeScript 5.x | 全栈类型一致性 |
| ORM | Prisma 5.x | 类型安全，自动 migration |
| 数据库 | PostgreSQL 15 | 事务支持强 |
| 缓存 | Redis 7 | 商品分类缓存、购物车、BullMQ |
| 任务队列 | BullMQ 5.x | 订单自动取消、佣金延迟结算 |
| 微信生态 | 微信支付 Node SDK + code2session | 支付 + 登录 |
| 对象存储 | 腾讯云 COS SDK | 图片直传签名 |
| 验证码 | 腾讯云 SMS | 推广员手机号验证 |

---

## 3. 模块拆分与开发顺序

### Phase 1：基础能力（第 1 周前半，需提前交付给前端）
- [ ] 认证模块：微信登录 `/auth/wx-login`、JWT 生成与刷新
- [ ] 供应商登录：`/supplier/login`（账号密码 + bcrypt + 独立 JWT）
- [ ] 商品模块：`/products`、`/products/:id`、`/categories`、`/banners`、`/discount-rules/active`
- [ ] 购物车模块：`/cart/*`（CRUD + 满减预览）
- [ ] 地址模块：`/addresses/*`（CRUD + 默认地址）

### Phase 2：交易闭环（第 1 周后半）
- [ ] 订单创建：`POST /orders`（含库存扣减、满减计算）
- [ ] 微信支付：`POST /orders/:id/pay`、回调 `/wx/pay-notify`
- [ ] 订单查询与状态流转：`GET /orders`、`*:id`、取消、确认收货
- [ ] BullMQ 延迟任务：30 分钟未支付自动取消订单

### Phase 3：供应商与派单（第 2 周前半）
- [ ] 供应商管理后台 API：`/admin/suppliers/*`（CRUD + 重置密码）
- [ ] 派单 API：`/admin/orders/:id/dispatch`、一键自动派单、撤销派单
- [ ] 商家端 API：`/supplier/orders`、`/supplier/orders/:id/ship`
- [ ] 订单导出：`/admin/orders/export`（供应商发货表 Excel）

### Phase 4：推广员与佣金（第 2 周后半）
- [ ] 推广员申请与绑定：`/promoter/apply`、自动绑定、短信验证码
- [ ] 推广中心：`/promoter/commissions`、`*:id/withdrawals`、`*:id/qrcode`
- [ ] 佣金计算与结算：签收后 7 天 BullMQ 延迟任务自动结算
- [ ] 提现：`<100` 自动打款（企业付款到零钱）、`≥100` 人工审核

### Phase 5：风控与运营（第 3 周）
- [ ] 风控规则 R01-R10 全部实现（SQL 查表简单判断）
- [ ] 数据看板统计 API：`/admin/dashboard`
- [ ] 满减规则 CRUD：`/admin/discount-rules/*`
- [ ] 轮播图管理：`/admin/banners/*`
- [ ] 推广员管理：冻结/解冻、提现审核

---

## 4. 核心业务实现要点

### 4.1 满减计算
```typescript
// 逻辑摘要（详见 PRD 7.1）
const applicableTotal = 参与满减的商品总金额（不含运费）
const bestTier = 取满足门槛且优惠最大的梯度（不叠加）
const discount = bestTier.discount
// 按商品金额比例分摊到每个 OrderItem 的 discountAmount
```

### 4.2 佣金计算
```typescript
const netProfit = actualAmount - sum(商品成本价) - 满减金额 - actualAmount * 0.02(售后预留)
const commission = Math.max(0, netProfit) * 0.03
```

### 4.3 风控规则实现（SQL 查表简单判断）
| 规则 | 实现方式 |
|------|----------|
| R01 | 下单时比对 `order.userId` 与 `promoter.userId` |
| R02 | 查询该推广员是否有 `status=COMPLETED` 的订单 |
| R03 | 提现时检查 `createdAt < 30天` 且 `totalCommission < 100` |
| R04 | 注册时按 `deviceId` + 24h 滑动窗口计数 |
| R05 | 退款成功后调用佣金追回逻辑 |
| R06 | 按 `promoterId` + 自然日/自然月计数提现次数 |
| R07 | 按 `addressSnapshot + phone + deviceId` 短时间计数 |
| R10 | 统计该用户签收后投诉未收到的次数 |

### 4.4 派单逻辑
```typescript
// 自动派单：按商品默认 supplierId 分组
const groups = groupBy(order.items, item => item.product.supplierId)
// 每个 supplier 创建一条 OrderDispatch 记录
// 订单状态变为 PENDING_SHIP（全部派完）或保持 PENDING_DISPATCH（部分未派）
```

---

## 5. 依赖关系

| 依赖 | 说明 |
|------|------|
| **Task 00** | 必须使用其提供的 Fastify 骨架、Prisma schema、共享类型、Docker 环境 |
| 被依赖 | Task 02、03、04 均依赖本任务提供的 API；前期可通过 `apps/server/docs/API_INTERFACE.md` 中的 Mock 数据并行 |

---

## 6. 验收标准

### Phase 1 验收（第 1 周前半结束）
- [ ] 微信登录成功返回 JWT，带正确过期时间
- [ ] 商品列表、分类、轮播图接口返回符合 PRD 字段结构
- [ ] 购物车增删改查正常，库存不足时阻止添加

### Phase 2 验收（第 1 周后半结束）
- [ ] 创建订单 → 支付 → 回调 → 状态变为 `PENDING_DISPATCH`
- [ ] 30 分钟未支付，BullMQ 自动取消，库存恢复
- [ ] 用户确认收货 → 状态变为 `COMPLETED`

### Phase 3 验收（第 2 周前半结束）
- [ ] 后台派单后，商家端能看到对应订单
- [ ] 供应商点击发货 → 用户端状态变为 `PENDING_RECEIVE`
- [ ] 导出 Excel 包含正确的收货地址和商品信息

### Phase 4 验收（第 2 周后半结束）
- [ ] 推广员绑定关系正确，佣金计算误差 < 0.01 元
- [ ] 签收 7 天后 BullMQ 自动结算佣金到可提现余额
- [ ] 退款后佣金正确追回（余额可负）

### Phase 5 验收（第 3 周结束）
- [ ] R01-R10 各写单测验证，覆盖正常和异常场景
- [ ] 看板数据与数据库统计一致
- [ ] 满减规则配置后，前端购物车实时生效

---

## 7. 合并检查清单

- [ ] 所有 API 接口已按 PRD 第 9 章实现，无遗漏
- [ ] 数据库 migration 文件已提交，可从零重建
- [ ] 关键业务逻辑（支付、佣金、派单）有单元测试覆盖
- [ ] `.env.example` 中新增的后端变量已补充说明
- [ ] 无敏感密钥泄露（数据库密码、微信支付 key 等）
