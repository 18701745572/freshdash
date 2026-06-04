# 鲜达生鲜小程序 · 产品需求文档（PRD）

> **版本：** v1.0.0 · **日期：** 2026-06-04
> **状态：** 草稿
> **作者：** 产品团队

---

## 目录

1. [项目概述](#1-项目概述)
2. [技术栈与架构](#2-技术栈与架构)
3. [用户角色定义](#3-用户角色定义)
4. [功能模块总览](#4-功能模块总览)
5. [用户端功能详述](#5-用户端功能详述)
6. [后台管理功能详述](#6-后台管理功能详述)
7. [核心业务规则](#7-核心业务规则)
8. [数据库表结构](#8-数据库表结构)
9. [后端 API 接口清单](#9-后端-api-接口清单)
10. [前端开发注意事项](#10-前端开发注意事项)
11. [有机认养模块（最后阶段）](#11-有机认养模块最后阶段)
12. [开发阶段与交付物](#12-开发阶段与交付物)
13. [测试验收标准](#13-测试验收标准)
14. [非功能性需求](#14-非功能性需求)

---

## 1. 项目概述

| 字段 | 内容 |
|------|------|
| **产品名称** | 鲜达生鲜小程序 |
| **产品类型** | 微信小程序 + Web 管理后台 |
| **核心业务** | 生鲜电商（蔬菜、牛羊肉），SKU 约 100～150 个，供应商一件代发 |
| **盈利方式** | 商品差价 + 有机菜地认养服务费 |
| **推广方式** | 推广专员分享小程序码绑定用户，收取订单净利润 3% 佣金 |
| **优惠方式** | 统一满减（如满100减10），后台可配置 |
| **特色功能** | 有机菜地认养（24小时视频监控，最后阶段开发） |
| **目标用户** | 注重食品安全、追求有机绿色食品的家庭用户 |

### 1.1 产品目标

- **Demo 阶段**：可演示完整购物流程，用于对外展示融资/合作谈判
- **MVP 阶段**：跑通"选品→下单→支付→发货→收货→佣金结算"完整闭环
- **完整运营版**：上线推广员体系、满减活动、运营数据看板
- **最终形态**：加入有机菜地认养、24小时直播监控差异化功能

---

## 2. 技术栈与架构

### 2.1 技术选型总览

```
┌─────────────────────────────────────────────────────────────────┐
│                      鲜达生鲜系统架构                             │
├──────────────┬──────────────────┬───────────────────────────────┤
│   用户端      │    管理后台       │         基础设施               │
│  微信小程序   │   PC Web 后台     │                               │
├──────────────┼──────────────────┤   PostgreSQL 主数据库          │
│ Taro 3       │ React 18         │   Redis 缓存 + 队列            │
│ + React 18   │ + Ant Design Pro │   腾讯云 COS 对象存储          │
│ + TypeScript │ + TypeScript     │   腾讯云 CVM 服务器            │
│ + Zustand    │ + Zustand        │                               │
│ + NutUI      │                  ├───────────────────────────────┤
├──────────────┴──────────────────┤        后端服务                │
│         统一 REST API           │   Fastify + TypeScript        │
│    JWT 鉴权 + 微信 code2session │   Prisma ORM                  │
│                                 │   BullMQ 任务队列             │
│                                 │   微信支付官方 Node.js SDK    │
└─────────────────────────────────┴───────────────────────────────┘
```

### 2.2 技术栈明细

#### 前端（微信小程序）

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Taro 3 | ^3.6 | 用户端 + 商家端共用一套技术栈，降低维护成本 |
| UI 框架 | React | 18 | Taro 官方支持，生态最成熟 |
| 语言 | TypeScript | ^5.0 | 强类型，复杂业务逻辑必须 |
| 状态管理 | Zustand | ^4 | 购物车、用户信息全局状态，轻量 |
| UI 组件库 | NutUI | ^4 | 京东出品，专为 Taro 生态设计 |
| 图片上传 | wx.chooseMedia | — | 直传腾讯云 COS，不走服务器 |
| Canvas 海报 | wx.createOffscreenCanvas | — | 推广码分享海报本地生成 |
| 请求封装 | Taro.request 二次封装 | — | 统一错误处理、JWT 注入 |

#### 后端（Node.js 服务）

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Fastify | ^4 | 高性能，内置 JSON Schema 验证 |
| 语言 | TypeScript | ^5.0 | 全栈类型一致性 |
| ORM | Prisma | ^5 | 类型安全，自动 migration |
| 数据库 | PostgreSQL | 15 | 事务支持强，JSONB 扩展字段 |
| 缓存 | Redis | 7 | 商品分类缓存、购物车、BullMQ 依赖 |
| 任务队列 | BullMQ | ^5 | 订单自动取消、佣金延迟结算 |
| 微信登录 | code2session + JWT | — | 标准小程序鉴权 |
| 支付 | 微信支付 Node SDK（官方） | — | 调起支付 + 企业付款到零钱 |
| 对象存储 | 腾讯云 COS SDK | — | 商品图、分享海报 |
| 验证码 | 腾讯云短信 SMS | — | 推广员申请手机号验证 |

#### 管理后台

| 层级 | 技术 | 说明 |
|------|------|------|
| 框架 | React 18 + Vite | 快速开发 |
| UI | Ant Design Pro 5 | 表格/表单/图表组件完整 |
| 语言 | TypeScript | |
| 状态 | Zustand | |
| 构建 | Vite | |

#### 基础设施

| 组件 | 选型 | 规格建议 |
|------|------|----------|
| 服务器 | 腾讯云 CVM | 2C4G 起，后续按需升级 |
| 数据库 | PostgreSQL 15 | CVM 本地安装 |
| 缓存 | Redis 7 | CVM 本地安装 |
| 对象存储 | 腾讯云 COS | 按量付费 |
| CDN | 腾讯云 CDN | 商品图片加速 |
| HTTPS | 腾讯云 SSL | 免费证书 |

### 2.3 目录结构规划

```
freshdash/
├── apps/
│   ├── miniapp/          # Taro 小程序（用户端）
│   │   ├── src/
│   │   │   ├── pages/    # 页面
│   │   │   ├── components/
│   │   │   ├── stores/   # Zustand stores
│   │   │   ├── services/ # API 调用层
│   │   │   └── utils/
│   ├── supplier/         # Taro 小程序（商家端/供应商端）
│   │   └── src/          # 登录、待处理订单、订单详情、发货
│   ├── admin/            # Ant Design Pro 后台
│   │   └── src/
│   └── server/           # Fastify 后端
│       ├── src/
│       │   ├── routes/   # 路由（按模块分）
│       │   ├── services/ # 业务逻辑
│       │   ├── jobs/     # BullMQ 任务
│       │   └── prisma/   # Schema + migrations
├── packages/
│   └── shared-types/     # 前后端共享 TypeScript 类型
└── package.json          # pnpm workspaces monorepo
```

---

## 3. 用户角色定义

| 角色 | 描述 | 入口 |
|------|------|------|
| **普通用户** | 浏览商品、下单购买、确认收货 | 微信小程序 |
| **推广专员** | 在普通用户基础上，可生成推广码分享，获取佣金 | 微信小程序（申请后解锁） |
| **平台运营** | 商品管理、订单管理、推广员管理、满减配置 | Web 管理后台 |
| **供应商** | 查看平台派发的订单、确认发货 | 商家端小程序（独立入口） |

**说明：** 供应商拥有独立的商家端小程序账号，由平台运营在后台创建分配。供应商仅能看到自己被派发的订单，操作发货后订单状态流转。

---

## 4. 功能模块总览

```
鲜达生鲜
├── 用户端（小程序）
│   ├── 首页（轮播 + 商品列表）
│   ├── 分类页（左栏分类 + 右栏商品）
│   ├── 商品详情页
│   ├── 搜索页
│   ├── 购物车
│   ├── 结算页（地址 + 满减 + 支付）
│   ├── 我的页（订单 / 地址 / 推广）
│   ├── 订单详情页
│   ├── 推广专员申请页
│   ├── 推广中心（佣金 / 提现）
│   └── 认养菜地（占位页 → 最终完整页）
│
├── 商家端（小程序 / H5）
│   ├── 登录页（账号密码）
│   ├── 待处理订单（平台派发的待发货订单）
│   ├── 订单详情（商品、收货地址、发货操作）
│   └── 已发货订单（历史记录）
│
├── 管理后台（PC Web）
│   ├── 首页看板
│   ├── 商品管理（增删改查 + Excel 导入导出 + 关联供应商）
│   ├── 供应商管理（账号创建、启用/禁用）
│   ├── 订单管理（派单 / 发货跟踪 / 导出供应商表）
│   ├── 满减活动配置
│   ├── 推广员管理（冻结/解冻 + 提现审核）
│   ├── 轮播图管理
│   └── 认养地块管理（最后阶段）
│
└── 后端服务
    ├── 认证模块（微信登录 + JWT + 供应商登录）
    ├── 商品模块
    ├── 购物车模块
    ├── 订单模块（含微信支付 + 派单逻辑）
    ├── 满减模块
    ├── 推广员模块（含佣金计算）
    ├── 提现模块（微信企业付款）
    ├── 文件上传模块（COS 直传签名）
    └── 任务队列（订单自动取消 + 佣金结算）
```

---

## 5. 用户端功能详述

### 5.1 首页

**URL：** `/pages/index/index`

**功能组成：**

| 区域 | 功能 | 数据来源 |
|------|------|----------|
| 顶部搜索框 | 输入商品名称，跳转搜索结果页 | 本地跳转 |
| 轮播图 | 展示促销图片，支持点击跳转商品或分类 | 后台配置，API 拉取 |
| 快捷入口图标区 | `全部商品`（跳分类）、`推广赚钱`（跳推广）、`认养菜地`（跳占位页） | 静态 |
| 商品列表 | 展示商品卡片：主图、名称、售价、满减标签，默认按销量排序 | `GET /products` |
| 底部 Tab Bar | 首页 / 分类 / 购物车 / 我的 | 静态 |

**满减标签规则：** 有任意满减活动启用时，每个商品卡片显示"满X减Y"徽标。

---

### 5.2 分类页

**URL：** `/pages/category/index`

**功能组成：**

| 区域 | 功能 |
|------|------|
| 左侧一级分类栏 | 叶菜类、根茎类、茄果类、牛肉、羊肉（后台可扩展） |
| 右侧商品列表 | 展示当前分类商品：主图、名称、售价、销量 |

**交互：** 点击左侧分类，右侧内容滚动至对应区域（吸顶效果）。

---

### 5.3 商品详情页

**URL：** `/pages/product/detail?id=:productId`

**功能组成：**

| 区域 | 功能 |
|------|------|
| 商品主图轮播 | 支持多图，可保存图片 |
| 价格区域 | 售价（红色大字）+ 划线原价 |
| 满减提示 | "本商品参与满X减Y活动" |
| 商品规格 | 重量/规格（如500g/1kg，单规格 SKU） |
| 数量选择器 | +/- 控制，最大值受库存限制 |
| 商品详情图 | 富文本或详情图展示产地、营养信息 |
| 底部操作栏 | `加入购物车` + `立即购买` 两个按钮 |

---

### 5.4 搜索页

**URL：** `/pages/search/index`

**功能组成：**
- 搜索框自动获焦
- 历史搜索记录（本地缓存，最多10条，可清除）
- 实时搜索结果列表（输入停顿300ms后触发，防抖）
- 无结果时显示"未找到相关商品"

---

### 5.5 购物车

**URL：** `/pages/cart/index`

**功能组成：**

| 功能 | 描述 |
|------|------|
| 商品列表 | 展示已加入商品，含主图、名称、规格、单价、数量 |
| 数量修改 | +/- 实时更新，最小值1，超出库存给提示 |
| 删除商品 | 左滑删除或全选删除 |
| 全选/反选 | 支持批量选中/取消 |
| 满减预计算 | 底部实时显示"已满足X减Y"或"再购X元可减Y" |
| 结算按钮 | 底部固定，显示"去结算（N件）¥XX.XX" |

**状态存储：** 购物车数据存储在服务端（用户登录后），同时 Zustand 本地缓存用于 UI 响应速度。

---

### 5.6 结算页（下单页）

**URL：** `/pages/checkout/index`

**功能组成：**

| 区域 | 功能 |
|------|------|
| 收货地址 | 展示默认地址，点击可切换/新增 |
| 商品清单 | 只读展示已选商品 |
| 满减明细 | 明确显示"已享优惠 -¥X.XX" |
| 订单备注 | 可选填文本框（50字以内） |
| 费用汇总 | 商品总价 / 满减优惠 / 运费（暂时免邮） / **实付金额** |
| 提交订单按钮 | 调起微信支付，支付成功跳转订单详情 |

**支付流程：**
```
用户点击"提交订单"
→ 后端创建订单（状态：待支付）
→ 后端调用微信支付统一下单，返回 prepay_id
→ 前端调起 wx.requestPayment
→ 支付成功：微信回调后端 → 订单状态变"待派单"
→ 前端跳转订单详情页
→ 支付超时30分钟未付：BullMQ 自动取消订单，恢复库存
```

**派单后流程：**
```
订单状态：待派单
→ 平台运营在后台手动派单给供应商（或按商品默认供应商自动派单）
→ 订单状态变"待发货"（供应商可见）
→ 供应商在商家端点击"确认发货"
→ 订单状态变"待收货"
→ 用户确认收货或15天自动收货 → 订单完成
```

---

### 5.7 我的页面

**URL：** `/pages/mine/index`

**功能组成：**

| 模块 | 条件 | 功能 |
|------|------|------|
| 头像 + 昵称 | 已登录 | 来自微信授权，一键获取 |
| 我的订单 | 已登录 | Tab 展示：全部 / 待付款 / 待发货 / 待收货 / 已完成 |
| 我的推广 | 推广员身份 | 显示累计佣金、可提现余额、推广码、分享海报、提现入口 |
| 成为推广员 | 非推广员 | 按钮点击跳转申请页 |
| 收货地址管理 | — | 增删改，设默认地址 |
| 客服/投诉电话 | — | 写死号码，点击拨号 |

---

### 5.8 订单列表 & 订单详情页

**URL：** `/pages/order/list`、`/pages/order/detail?id=:orderId`

**订单状态流转：**

```
待付款 → 待派单 → 待发货 → 待收货 → 已完成
   ↓       ↓        ↓        ↓
 超时取消 平台派单 供应商发货 自动收货(15天)
 (30分钟) 给供应商 (商家端操作)
```

**说明：** 用户支付成功后，订单先进入"待派单"状态。平台运营在后台将订单派发给对应供应商（或按商品默认供应商自动派单），供应商在商家端确认发货后，状态变为"待收货"。

**订单详情页功能：**
- 状态进度条
- 商品清单
- 收货地址
- 费用明细（含满减）
- 操作按钮（根据状态显示）：
  - 待付款：`继续支付`、`取消订单`
  - 待收货：`确认收货`（核心！）
  - 已完成：`再次购买`

---

### 5.9 推广专员申请页

**URL：** `/pages/promoter/apply`

**表单字段：**
| 字段 | 必填 | 规则 |
|------|------|------|
| 真实姓名 | 是 | 2-10个汉字 |
| 手机号 | 是 | 11位手机号格式 |
| 短信验证码 | 是 | 腾讯云 SMS 发送，60s 内有效 |
| 邀请码 | 否 | 其他推广员的唯一邀请码（绑定上级关系） |

**提交逻辑：** 提交后自动审核通过，系统生成唯一推广码（6位字母+数字），跳转推广中心页。

---

### 5.10 推广中心

**URL：** `/pages/promoter/center`（仅推广员可见）

**功能组成：**

| 模块 | 功能 |
|------|------|
| 数据概览 | 今日佣金 / 可提现余额 / 累计佣金（三格卡片） |
| 我的推广码 | 展示小程序二维码，支持保存到相册 |
| 分享海报 | Canvas 生成带推广码的海报，支持保存/转发 |
| 复制推广链接 | 生成带 promoterCode 参数的小程序短链 |
| 我绑定的客户数 | 显示通过推广码进入的用户总数 |
| 佣金明细 | 列表：时间 / 订单号 / 佣金金额 / 状态（待结算/已到账/已追回） |
| 提现 | 输入金额（≥10元），提现到微信零钱；≥100元需人工审核 |

---

### 5.11 认养菜地（占位页）

**URL：** `/pages/farm/index`

**Demo/MVP 阶段展示内容：**
- 标题："有机菜地认养，即将上线"
- 文案："租一块有机菜地，24小时视频监控，亲眼见证零农药种植。"
- 配图：有机菜地效果图
- 底部按钮："通知我"（触发获取手机号授权，后台记录）

---

## 6. 后台管理功能详述

### 6.0 登录

- 账号密码登录（不使用微信登录）
- 支持多管理员账号，角色：超级管理员 / 运营
- JWT 鉴权，Token 有效期 8 小时

### 6.1 首页数据看板

| 指标 | 说明 |
|------|------|
| 今日订单数 | 自然日内创建的订单总数 |
| 今日 GMV | 实付金额总和 |
| 今日新增推广员 | 当日申请通过的推广员数 |
| 今日佣金支出 | 当日结算的佣金金额合计 |
| 待处理提现申请 | 金额 ≥100 元待人工审核的数量（醒目红标） |

---

### 6.2 商品管理

**列表字段：** 商品图（缩略图）/ 名称 / 分类 / 售价 / 成本价 / 库存 / 状态 / 操作

**功能：**
- 新增商品：名称、一级分类、售价、成本价（敏感，仅管理员可见）、库存、**默认供应商**、主图（最多5张）、详情图（最多10张）、是否上架
- 编辑商品：同上
- 删除商品：软删除（isDeleted=true），已购买过的订单历史数据不丢失
- 上架/下架：快速切换，下架后前端不展示
- 批量导入：上传 Excel 模板，字段：名称、分类、售价、成本价、库存、供应商ID
- 导出 Excel：支持按分类/状态/供应商筛选后导出

---

### 6.3 供应商管理

**列表字段：** 供应商名称 / 联系人 / 手机号 / 账号状态 / 创建时间 / 操作

**功能：**
- 新增供应商：名称、联系人、手机号、登录账号、初始密码
- 编辑供应商：修改联系信息、重置密码
- 启用/禁用：禁用后该供应商无法登录商家端，已派单订单不受影响
- 供应商商品关联：查看每个供应商负责的商品列表

**商家端账号说明：** 供应商使用后台创建的账号密码登录商家端小程序，不涉及微信登录。

---

### 6.4 订单管理

**列表字段：** 订单号 / 用户昵称 / 商品数量 / 商品总价 / 满减 / 实付金额 / 状态 / **所属供应商** / 下单时间 / 操作

**功能：**
- 订单详情：展示收货信息、商品清单、价格明细、支付信息、当前派单供应商
- **派单操作**：对"待派单"状态订单，选择供应商进行派发；支持按商品默认供应商**一键自动派单**
- 发货跟踪：查看供应商是否已确认发货，显示发货时间
- 撤销派单：供应商未发货前，可撤回重新派单给其他供应商
- 退款处理：对已签收订单在7天内的退款申请进行审批，通过后调用微信退款接口
- 导出订单：按状态/时间范围/供应商筛选后导出供应商发货表（含收货地址、商品、数量）
- 搜索：按订单号、用户昵称、手机号、供应商名称搜索

---

### 6.5 满减活动配置

| 字段 | 说明 |
|------|------|
| 规则名称 | 如"双周特惠满减" |
| 满减梯度 | 可配置多条，如：满100减10，满200减25 |
| 适用范围 | 全部商品 / 指定分类（多选） |
| 状态 | 启用 / 停用 |

**约束：** 同一时间只能有一个满减活动处于启用状态（避免规则冲突）。

---

### 6.6 推广员管理

**列表字段：** 姓名 / 手机号 / 绑定客户数 / 累计佣金 / 待结算佣金 / 可提现余额 / 注册时间 / 状态

**功能：**
- 冻结/解冻推广员（冻结后停止计算新佣金，不可提现）
- 佣金明细查询（按推广员筛选）
- 提现申请审核列表：
  - 金额 < 100 元：自动打款（调用企业付款到零钱）
  - 金额 ≥ 100 元：人工审核，通过后手动打款
- 审核操作：通过（触发打款）/ 驳回（备注驳回原因，余额退回）

---

### 6.7 轮播图管理

| 字段 | 说明 |
|------|------|
| 图片 | 上传（建议尺寸 750×300px） |
| 跳转类型 | 无跳转 / 跳转商品详情 / 跳转分类 |
| 跳转目标 | 商品ID 或 分类ID |
| 排序 | 数字越小越靠前 |
| 状态 | 启用 / 停用 |

---

### 6.8 认养地块管理（最后阶段实现）

| 字段 | 说明 |
|------|------|
| 地块名称 | 如"1号有机地块" |
| 面积 | 平方米 |
| 季度价格 | ¥ |
| 年价格 | ¥ |
| 库存 | 可认养数量 |
| 摄像头 RTMP 地址 | 直播流地址 |
| 当前状态 | 可认养 / 已满 |
| 农事记录 | 追加录入（时间 + 内容 + 图片） |

---

## 7. 核心业务规则

### 7.1 满减规则

**计算逻辑：**
1. 以订单中参与满减的商品总金额（不含运费）与满减门槛比较
2. 多条满减规则同时满足时，取优惠金额最大的一条（**不叠加**）
3. 满减金额按各商品金额占比，分摊到每件商品（用于佣金基准计算）

**示例：**
- 规则：满100减10，满200减25
- 订单商品总额 220元 → 适用"满200减25"，实付 195元

**前端展示要求：**
- 购物车：实时显示"已满足满X减Y"或"再花X元可享满X减Y"
- 结算页：明确显示"满减优惠 -¥XX"
- 订单详情：历史满减金额只读展示

---

### 7.2 分销分润规则

#### 7.2.1 推广员注册

- 任何用户均可申请，无消费门槛，提交后**自动通过**
- 系统生成唯一推广码（格式：`FD` + 6位随机大写字母数字）
- 推广员在完成自己的**第一笔消费订单**后，分润功能才激活

#### 7.2.2 用户绑定规则

- 用户**首次**通过推广员的小程序码或链接进入小程序，自动绑定该推广员
- 绑定**永久有效，不可更换**
- 推广员自身不绑定任何推广员（即使通过别人链接进入也不绑定）

#### 7.2.3 佣金计算公式

```
订单净利润 = 实付金额 - 商品成本价合计 - 平台满减金额 - 预估售后预留(2%)

佣金 = max(0, 订单净利润) × 3%
```

> 说明：佣金比例 3% 可在后台全局配置，初期写死在配置文件中。

#### 7.2.4 佣金结算条件（两个条件缺一不可）

1. 用户手动点击"**确认收货**"（强制签收）
2. 签收时间后满 **7天**，且无售后退款

条件满足后，佣金状态从"**待结算**"变为"**可提现**"。

由 BullMQ 延迟任务在签收后 7 天触发自动结算。

#### 7.2.5 佣金追回

- 签收后 7 天内用户发起退款成功 → 系统追回已结算或待结算佣金
- 若可提现余额不足，记为**负数**，下次收入自动抵充

---

### 7.3 派单与发货规则

| 规则 | 说明 |
|------|------|
| 派单时机 | 用户支付成功后，订单进入"待派单"状态，平台运营进行派单 |
| 手动派单 | 运营在后台选择供应商，点击"派单"，订单状态变为"待发货" |
| 自动派单 | 支持按商品默认供应商一键自动派单（适用于单供应商订单） |
| 订单拆分 | 一个订单含多个供应商商品时，按供应商拆分为子订单分别派发 |
| 供应商发货 | 供应商在商家端看到"待发货"订单，点击"确认发货"后状态变"待收货" |
| 发货时效 | 供应商需在派单后 24 小时内确认发货（可配置） |
| 撤销派单 | 供应商未发货前，平台运营可撤回重新派单给其他供应商 |
| 导出兼容 | 保留导出供应商发货表功能，支持线下兜底发货 |

---

### 7.4 签收规则

| 规则 | 说明 |
|------|------|
| 强制手动签收 | 用户必须主动点击"确认收货"，不点击不结算佣金 |
| 自动签收兜底 | 系统在**发货后15天**自动触发签收（BullMQ 定时任务） |
| 签收记录 | 后端记录签收时间、用户 OpenID、IP、设备信息 |

---

### 7.5 风控规则

| 规则ID | 触发条件 | 处理方式 |
|--------|----------|----------|
| R01 | 推广员自己下单（OpenID 与绑定用户 OpenID 一致） | 该订单不产生佣金 |
| R02 | 推广员从未产生过消费订单 | 可生成推广码，但分润功能冻结，直到其完成第一笔消费 |
| R03 | 新推广员（注册<30天且累计佣金<100元） | 单笔提现上限50元，每日限1次 |
| R04 | 同一设备24小时内注册推广员超过3个 | 后续注册需要人工审核（后台先标记为待审核） |
| R05 | 订单签收后7天内发生退款 | 从推广员余额扣除等额佣金（可负） |
| R06 | 同一天内提现次数3次，或当月10次 | 触发人工审核，暂停自动打款 |
| R07 | 同一收货地址+手机号+设备，短时间多笔相似订单 | 延迟分润7天（即售后追溯期延长至14天） |
| R10 | 同一用户有3次订单显示签收但投诉未收到 | 限制该地址下单（后台拉黑地址） |

> **实现说明：** 以上规则的后台实现可以先用简单判断（SQL 查表），不要求复杂模型。

---

### 7.6 订单取消规则

| 情况 | 处理 |
|------|------|
| 用户主动取消（待付款状态） | 立即取消，无需退款 |
| 支付后30分钟未付款 | BullMQ 延迟任务自动取消，恢复库存 |
| 已付款订单用户申请退款 | 需联系客服处理（本期不做退款申请流程，仅管理员手动退款） |

---

## 8. 数据库表结构

> 使用 Prisma Schema 描述，PostgreSQL 15

### 8.1 用户表 `users`

```prisma
model User {
  id          Int       @id @default(autoincrement())
  openid      String    @unique
  nickname    String?
  avatarUrl   String?
  phone       String?
  promoterId  Int?      // 绑定的推广员ID，永久绑定
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  orders      Order[]
  promoter    Promoter? // 若该用户也是推广员
  addresses   Address[]
}
```

### 8.2 推广员表 `promoters`

```prisma
model Promoter {
  id              Int       @id @default(autoincrement())
  userId          Int       @unique
  realName        String
  phone           String
  promoterCode    String    @unique  // FD + 6位 alphanumeric
  status          PromoterStatus @default(ACTIVE)
  totalCommission Decimal   @default(0) @db.Decimal(10,2)
  pendingCommission Decimal @default(0) @db.Decimal(10,2)
  availableBalance  Decimal @default(0) @db.Decimal(10,2)
  firstOrderAt    DateTime? // 第一笔消费时间（激活分润）
  createdAt       DateTime  @default(now())

  user            User      @relation(fields: [userId], references: [id])
  commissions     Commission[]
  withdrawals     Withdrawal[]
}

enum PromoterStatus {
  ACTIVE
  FROZEN
}
```

### 8.3 供应商表 `suppliers`

```prisma
model Supplier {
  id          Int       @id @default(autoincrement())
  name        String                            // 供应商名称
  contactName String?                           // 联系人
  phone       String?                           // 联系人手机号
  loginName   String    @unique                 // 商家端登录账号
  password    String                            // 加密密码（bcrypt）
  status      SupplierStatus @default(ACTIVE)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  products    Product[]
  dispatches  OrderDispatch[]
}

enum SupplierStatus {
  ACTIVE
  DISABLED
}
```

### 8.4 商品表 `products`

```prisma
model Product {
  id          Int       @id @default(autoincrement())
  name        String
  categoryId  Int
  supplierId  Int?                            // 默认供应商
  price       Decimal   @db.Decimal(10,2)  // 售价
  costPrice   Decimal   @db.Decimal(10,2)  // 成本价
  stock       Int       @default(0)
  sales       Int       @default(0)        // 累计销量
  mainImages  String[]  // 主图 COS URLs
  detailImages String[] // 详情图
  isOnSale    Boolean   @default(true)
  isDeleted   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  category    Category  @relation(fields: [categoryId], references: [id])
  supplier    Supplier? @relation(fields: [supplierId], references: [id])
  orderItems  OrderItem[]
}
```

### 8.5 商品分类表 `categories`

```prisma
model Category {
  id        Int       @id @default(autoincrement())
  name      String    @unique  // 叶菜类/根茎类/茄果类/牛肉/羊肉
  sort      Int       @default(0)
  products  Product[]
}
```

### 8.6 地址表 `addresses`

```prisma
model Address {
  id          Int     @id @default(autoincrement())
  userId      Int
  name        String
  phone       String
  province    String
  city        String
  district    String
  detail      String
  isDefault   Boolean @default(false)
  createdAt   DateTime @default(now())

  user        User    @relation(fields: [userId], references: [id])
}
```

### 8.7 订单表 `orders`

```prisma
model Order {
  id              Int           @id @default(autoincrement())
  orderNo         String        @unique  // 年月日+8位随机
  userId          Int
  promoterId      Int?          // 归属推广员
  addressSnapshot Json          // 下单时地址快照
  totalAmount     Decimal       @db.Decimal(10,2)  // 商品总价
  discountAmount  Decimal       @default(0) @db.Decimal(10,2)  // 满减金额
  actualAmount    Decimal       @db.Decimal(10,2)  // 实付
  status          OrderStatus   @default(PENDING_PAYMENT)
  remark          String?
  wxTransactionId String?       // 微信支付交易号
  trackingNo      String?       // 快递单号（选填）
  signedAt        DateTime?     // 签收时间
  autoSignAt      DateTime?     // 自动签收时间（发货+15天）
  cancelledAt     DateTime?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  user            User          @relation(fields: [userId], references: [id])
  items           OrderItem[]
  commission      Commission?
}

enum OrderStatus {
  PENDING_PAYMENT   // 待付款
  PENDING_DISPATCH  // 待派单（已支付，待平台派发）
  PENDING_SHIP      // 待发货（已派单，待供应商发货）
  PENDING_RECEIVE   // 待收货（已发货）
  COMPLETED         // 已完成（已签收）
  CANCELLED         // 已取消
  REFUNDED          // 已退款
}
```

### 8.8 订单派单记录表 `order_dispatches`

```prisma
model OrderDispatch {
  id          Int       @id @default(autoincrement())
  orderId     Int
  supplierId  Int
  status      DispatchStatus @default(PENDING)
  shippedAt   DateTime? // 供应商确认发货时间
  trackingNo  String?   // 快递单号
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  order       Order     @relation(fields: [orderId], references: [id])
  supplier    Supplier  @relation(fields: [supplierId], references: [id])
}

enum DispatchStatus {
  PENDING   // 待发货
  SHIPPED   // 已发货
  REVOKED   // 已撤销（运营撤回重新派单）
}
```

### 8.9 订单商品表 `order_items`

```prisma
model OrderItem {
  id              Int     @id @default(autoincrement())
  orderId         Int
  productId       Int
  productSnapshot Json    // 下单时商品名称/价格快照
  quantity        Int
  unitPrice       Decimal @db.Decimal(10,2)
  unitCostPrice   Decimal @db.Decimal(10,2)
  discountAmount  Decimal @default(0) @db.Decimal(10,2)  // 分摊的满减

  order           Order   @relation(fields: [orderId], references: [id])
  product         Product @relation(fields: [productId], references: [id])
}
```

### 8.10 佣金记录表 `commissions`

```prisma
model Commission {
  id              Int               @id @default(autoincrement())
  orderId         Int               @unique
  promoterId      Int
  amount          Decimal           @db.Decimal(10,2)
  status          CommissionStatus  @default(PENDING)
  settleAt        DateTime?         // 实际结算时间
  reclaimedAt     DateTime?         // 追回时间
  createdAt       DateTime          @default(now())

  order           Order             @relation(fields: [orderId], references: [id])
  promoter        Promoter          @relation(fields: [promoterId], references: [id])
}

enum CommissionStatus {
  PENDING       // 待结算（签收后7天等待期）
  SETTLED       // 已结算到可用余额
  RECLAIMED     // 已追回（退款）
}
```

### 8.11 提现记录表 `withdrawals`

```prisma
model Withdrawal {
  id            Int               @id @default(autoincrement())
  promoterId    Int
  amount        Decimal           @db.Decimal(10,2)
  status        WithdrawalStatus  @default(PENDING)
  wxPaymentId   String?           // 企业付款流水号
  rejectReason  String?
  reviewedAt    DateTime?
  createdAt     DateTime          @default(now())

  promoter      Promoter          @relation(fields: [promoterId], references: [id])
}

enum WithdrawalStatus {
  PENDING       // 待处理（自动打款 or 等待人工审核）
  APPROVED      // 已打款
  REJECTED      // 已驳回
}
```

### 8.12 满减规则表 `discount_rules`

```prisma
model DiscountRule {
  id          Int     @id @default(autoincrement())
  name        String
  isActive    Boolean @default(false)
  tiers       Json    // [{threshold: 100, discount: 10}, {threshold: 200, discount: 25}]
  scope       String  @default("ALL")  // ALL or category IDs JSON
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### 8.13 轮播图表 `banners`

```prisma
model Banner {
  id          Int     @id @default(autoincrement())
  imageUrl    String
  linkType    String  @default("NONE")  // NONE / PRODUCT / CATEGORY
  linkId      Int?
  sort        Int     @default(0)
  isActive    Boolean @default(true)
  createdAt   DateTime @default(now())
}
```

---

## 9. 后端 API 接口清单

> 基础路径：`https://api.freshdash.com/v1`
> 鉴权：Authorization: Bearer {JWT}（标注 🔐 的需要鉴权）

### 9.1 认证模块

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/auth/wx-login` | 微信登录（接收 code，返回 token） |
| POST | `/auth/refresh` | 刷新 JWT Token |

### 9.2 商品模块

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/products` | 商品列表（支持分类、关键词、排序、分页） |
| GET | `/products/:id` | 商品详情 |
| GET | `/categories` | 分类列表 |
| GET | `/banners` | 首页轮播图 |
| GET | `/discount-rules/active` | 当前生效的满减规则 |

### 9.3 购物车模块 🔐

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/cart` | 获取购物车 |
| POST | `/cart/items` | 添加商品 |
| PUT | `/cart/items/:id` | 修改数量 |
| DELETE | `/cart/items/:id` | 删除商品 |
| POST | `/cart/preview` | 预览购物车满减（实时计算） |

### 9.4 订单模块 🔐

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/orders` | 创建订单 |
| GET | `/orders` | 我的订单列表（支持状态筛选、分页） |
| GET | `/orders/:id` | 订单详情 |
| POST | `/orders/:id/pay` | 发起支付（返回微信支付参数） |
| POST | `/orders/:id/cancel` | 取消订单（待付款状态） |
| POST | `/orders/:id/confirm-receive` | 确认收货 |
| POST | `/wx/pay-notify` | 微信支付回调（不需要 JWT，验签） |

### 9.5 地址模块 🔐

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/addresses` | 地址列表 |
| POST | `/addresses` | 新增地址 |
| PUT | `/addresses/:id` | 编辑地址 |
| DELETE | `/addresses/:id` | 删除地址 |
| PUT | `/addresses/:id/default` | 设为默认 |

### 9.6 推广模块 🔐

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/promoter/me` | 我的推广员信息（非推广员返回404） |
| POST | `/promoter/apply` | 申请成为推广员 |
| POST | `/promoter/send-sms` | 发送手机验证码 |
| GET | `/promoter/commissions` | 佣金明细列表 |
| GET | `/promoter/withdrawals` | 提现记录列表 |
| POST | `/promoter/withdraw` | 申请提现 |
| GET | `/promoter/qrcode` | 获取推广小程序码（COS URL） |

### 9.7 文件上传

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/upload/sign` 🔐 | 获取 COS 直传临时签名 |

### 9.8 管理后台 API（前缀 `/admin`）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/admin/login` | 管理员登录 |
| GET | `/admin/dashboard` | 看板数据 |
| GET/POST/PUT/DELETE | `/admin/products` | 商品 CRUD |
| POST | `/admin/products/import` | Excel 批量导入 |
| GET | `/admin/products/export` | 导出 Excel |
| GET | `/admin/orders` | 订单列表（支持多条件筛选） |
| PUT | `/admin/orders/:id/ship` | 确认发货 |
| POST | `/admin/orders/:id/refund` | 申请退款 |
| GET | `/admin/orders/export` | 导出发货表 |
| GET/POST/PUT/DELETE | `/admin/discount-rules` | 满减规则 CRUD |
| GET | `/admin/promoters` | 推广员列表 |
| PUT | `/admin/promoters/:id/freeze` | 冻结推广员 |
| GET | `/admin/withdrawals` | 提现申请列表 |
| PUT | `/admin/withdrawals/:id/approve` | 审批通过打款 |
| PUT | `/admin/withdrawals/:id/reject` | 驳回 |
| GET/POST/PUT/DELETE | `/admin/banners` | 轮播图管理 |
| GET/POST/PUT | `/admin/suppliers` | 供应商管理（CRUD + 重置密码） |
| POST | `/admin/orders/:id/dispatch` | 手动派单给供应商 |
| POST | `/admin/orders/auto-dispatch` | 按商品默认供应商一键自动派单 |
| PUT | `/admin/orders/:id/revoke-dispatch` | 撤销派单（供应商未发货前） |

### 9.9 商家端 API（前缀 `/supplier`）

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/supplier/login` | 供应商账号密码登录 |
| GET | `/supplier/orders` 🔐 | 待处理订单列表（已派给当前供应商） |
| GET | `/supplier/orders/history` 🔐 | 已发货订单列表 |
| GET | `/supplier/orders/:id` 🔐 | 订单详情 |
| PUT | `/supplier/orders/:id/ship` 🔐 | 确认发货 |

---

## 10. 前端开发注意事项

### 10.1 微信登录方案

```typescript
// 启动时静默登录流程
// 1. 调用 wx.login() 获取 code
// 2. 请求 /auth/wx-login?code=xxx 获取 JWT
// 3. 存储 token 到本地 storage
// 4. Zustand useAuthStore 管理登录状态

// 涉及用户隐私（昵称、头像）的按钮必须使用 <Button open-type="getUserInfo">
// 获取手机号必须使用 <Button open-type="getPhoneNumber"> + 云函数解密
```

### 10.2 推广员绑定时机

```typescript
// App.tsx onLaunch 时检查 options.query.promoterCode
// 若存在 promoterCode 且用户尚未绑定推广员，
// 调用 /users/bind-promoter 接口绑定（静默，无需用户感知）
```

### 10.3 Canvas 推广海报生成

```typescript
// 使用 wx.createOffscreenCanvas（type: '2d'）
// 海报元素：背景图 + 店铺 LOGO + 推广码图片 + 用户昵称
// 推广码图片从 API /promoter/qrcode 获取 COS URL
// 生成完成后调用 wx.saveImageToPhotosAlbum 保存
```

### 10.4 图片上传流程

```typescript
// 1. wx.chooseMedia 选择图片
// 2. 请求 /upload/sign 获取 COS 临时签名
// 3. wx.uploadFile 直传 COS（跳过服务器）
// 4. 将 COS URL 提交到业务接口
```

### 10.5 支付注意事项

- `wx.requestPayment` 必须在用户点击事件中调用（不能异步延迟）
- 支付回调通过后端 Webhook 处理，**不能依赖前端页面回调判断支付结果**
- 前端轮询策略：支付完成后每隔 1s 轮询订单状态，最多 10 次

### 10.6 购物车库存校验

- 结算前调用 `/cart/preview` 接口重新校验库存，库存不足时提示用户并阻止下单

### 10.7 分页加载

- 商品列表、订单列表均使用**下拉加载更多**（onReachBottom），pageSize=20

---

## 11. 有机认养模块（最后阶段）

> 本模块在**阶段四（开发周期第7-8周）**开始实现

### 11.1 用户端功能

- 认养地块列表：卡片展示地块名称、面积、价格、库存、实时监控画面（截图）
- 地块详情：
  - 实时视频播放（调用腾讯云直播 SDK 播放 RTMP 流）
  - 农事记录时间轴（种植日期、浇水记录、施肥、采收）
  - 认养期限选择：季度 / 年
  - 支付入口
- 我的认养：展示已认养地块、到期时间、剩余天数

### 11.2 后台管理功能

- 地块管理：增删改地块信息、RTMP 地址管理
- 农事记录录入：图文记录（由运营人员录入）
- 认养订单列表

---

## 12. 开发阶段与交付物

### 阶段一：Demo 演示版（3天）

**目标：** 可演示完整购物流程，数据全部 Mock

| 交付物 | 说明 |
|--------|------|
| 小程序前端 | 首页、分类、商品详情、购物车、结算（Mock支付）、订单列表 |
| 基础后端框架 | Fastify + Prisma 初始化，基础商品/分类/订单接口（静态数据） |
| 管理后台框架 | Ant Design Pro 初始化 + 商品列表页 |
| 基础数据 | 录入3-5个分类，20-30个商品 Demo 数据 |

### 阶段二：MVP 内测版（2周）

**目标：** 完整交易闭环上线内测，真实微信支付

| 交付物 | 说明 |
|--------|------|
| 微信登录 & JWT | 真实 code2session，生产环境 |
| 完整支付流程 | 微信支付接入，支付回调，BullMQ 自动取消订单 |
| 收货地址管理 | 完整 CRUD |
| 订单全流程 | 创建→支付→发货→签收 |
| 管理后台-订单管理 | 发货操作，订单导出 |
| COS 图片上传 | 商品图真实上传 |

### 阶段三：完整运营版（2周）

**目标：** 推广员体系、满减活动、运营数据看板、派单自动化上线

| 交付物 | 说明 |
|--------|------|
| 推广员申请 & 绑定 | 完整流程，含风控 R01-R10 |
| 佣金计算 & 结算 | BullMQ 延迟7天结算任务 |
| 提现功能 | 微信企业付款，含人工审核流程 |
| 满减活动配置 | 后台配置，前端实时展示 |
| 推广中心 | Canvas 海报生成 |
| 数据看板 | 今日核心指标（含供应商维度） |
| 自动签收 | 发货后15天 BullMQ 任务 |
| **一键自动派单** | 按商品默认供应商自动派单，减少运营人工操作 |
| **撤销派单** | 供应商未发货前，运营可撤回重新派单 |

### 阶段四：有机认养完整版（2周）

**目标：** 认养菜地功能上线，完整替换占位页

| 交付物 | 说明 |
|--------|------|
| 认养地块列表&详情 | 含视频直播（腾讯云直播SDK） |
| 认养支付流程 | 独立支付流程 |
| 农事记录 | 时间轴展示 |
| 后台地块管理 | 完整 CRUD + RTMP 管理 |

---

## 13. 测试验收标准

### 阶段一 Demo 验收

- [ ] 可完整演示：首页→分类→商品详情→加购→结算（Mock支付）→订单页
- [ ] 20+商品正常展示，分类筛选正确
- [ ] 满减标签正常显示

### 阶段二 MVP 验收

- [ ] 微信真实登录成功，JWT 正常
- [ ] 微信支付真实扣款，支付回调订单状态正确变为"待派单"
- [ ] 订单30分钟未支付自动取消
- [ ] 后台派单给供应商→订单状态变为"待发货"
- [ ] 供应商在商家端点击"确认发货"→用户端状态变为"待收货"
- [ ] 用户确认收货→订单状态变为"已完成"
- [ ] 商家端账号密码登录正常，仅能看到自己被派发的订单

### 阶段三 运营版验收

- [ ] 推广员申请流程完整（含手机号验证）
- [ ] 通过推广码进入的用户正确绑定推广员
- [ ] 佣金计算公式正确（含满减分摊）
- [ ] R01-R10 风控规则有效（推广员自己下单不产生佣金、频繁注册拦截等）
- [ ] 签收7天后佣金自动结算至可提现余额
- [ ] 退款后佣金正确追回
- [ ] 满减规则配置后，前端实时生效
- [ ] 提现 <100元自动打款到微信零钱，≥100元进入人工审核队列
- [ ] 一键自动派单按商品默认供应商正确分配
- [ ] 撤销派单后订单回到"待派单"状态，可重新派单
- [ ] 供应商管理后台增删改查正常，禁用后无法登录商家端

### 阶段四 认养版验收

- [ ] 认养地块视频直播正常播放
- [ ] 认养支付完整
- [ ] 农事记录时间轴正常展示

---

## 14. 非功能性需求

### 14.1 性能

| 指标 | 目标值 |
|------|--------|
| 首页商品列表加载 | < 1.5 秒 |
| 支付接口响应 | < 2 秒 |
| 管理后台订单列表 | < 2 秒 |
| 图片加载（CDN） | < 800ms |

### 14.2 可用性

- 后端服务可用性目标：99.5%（每月不超过 3.6 小时停机）
- 数据库每日自动备份，保留 7 天

### 14.3 安全性

- 所有接口走 HTTPS
- JWT 有效期 7 天，支持刷新
- 管理后台 IP 白名单（运维团队配置）
- 成本价字段仅管理员 API 可见，小程序 API 不返回
- 微信支付回调必须验签

### 14.4 兼容性

- 小程序最低基础库版本：2.30.0
- iOS 14+，Android 8+
- 管理后台支持 Chrome 100+、Edge 100+

---

## 附录：环境变量清单

```env
# 微信小程序
WX_APP_ID=
WX_APP_SECRET=

# 微信支付
WX_MCH_ID=
WX_PAY_KEY=
WX_NOTIFY_URL=

# 数据库
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...

# 腾讯云 COS
COS_SECRET_ID=
COS_SECRET_KEY=
COS_BUCKET=
COS_REGION=

# 腾讯云 SMS
SMS_SECRET_ID=
SMS_SECRET_KEY=
SMS_APP_ID=
SMS_TEMPLATE_ID=

# JWT
JWT_SECRET=
JWT_EXPIRES_IN=7d

# 业务配置
COMMISSION_RATE=0.03
COMMISSION_SETTLE_DAYS=7
AUTO_SIGN_DAYS=15
ORDER_CANCEL_MINUTES=30
```

---

*本文档由产品团队基于 Demo 演示版需求文档整理，结合 Fastify + Prisma + Taro 技术栈补充技术细节。如有业务规则变更，请同步更新本文档对应章节。*
