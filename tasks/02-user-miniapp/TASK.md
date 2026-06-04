# Task 02: 用户端小程序开发

> **分支名：** `feat/user-miniapp`  
> **负责人：** 前端开发工程师（用户端）  
> **优先级：** P1  
> **预估工期：** 2 周（可与后端并行，基于 Mock 数据先行）

---

## 1. 任务目标

实现鲜达生鲜微信小程序的全部用户端页面与交互，覆盖从浏览商品、加购、下单、支付、查看到推广员申请与佣金提现的完整用户旅程。

---

## 2. 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 框架 | Taro 3 | ^3.6 |
| UI 框架 | React | 18 |
| 语言 | TypeScript | ^5.0 |
| 状态管理 | Zustand | ^4 |
| UI 组件库 | NutUI | ^4 |
| 样式 | SCSS / Less | — |

---

## 3. 页面清单与开发顺序

### Phase 1：浏览与购物核心（第 1 周）

| 页面 | 路径 | 核心功能 | 数据来源 |
|------|------|----------|----------|
| 首页 | `/pages/index/index` | 轮播图、快捷入口、商品列表、满减标签 | `GET /products`、`GET /banners` |
| 分类页 | `/pages/category/index` | 左侧分类栏、右侧商品列表、吸顶 | `GET /categories`、`GET /products?categoryId=` |
| 商品详情 | `/pages/product/detail` | 轮播、价格、满减提示、规格、数量、图文详情 | `GET /products/:id` |
| 搜索页 | `/pages/search/index` | 搜索框、历史记录、实时结果、防抖 | `GET /products?keyword=` |
| 购物车 | `/pages/cart/index` | 商品列表、数量修改、左滑删除、全选、满减预计算 | `GET /cart`、`PUT /cart/items/:id`、`DELETE` |
| 结算页 | `/pages/checkout/index` | 地址选择、商品清单、满减明细、备注、微信支付 | `POST /orders`、`POST /orders/:id/pay` |

### Phase 2：订单与我的（第 1 周后半）

| 页面 | 路径 | 核心功能 | 数据来源 |
|------|------|----------|----------|
| 订单列表 | `/pages/order/list` | Tab 栏筛选（全部/待付款/待派单/待收货/已完成）、下拉刷新 | `GET /orders?status=` |
| 订单详情 | `/pages/order/detail` | 状态进度条、商品清单、地址、费用明细、操作按钮 | `GET /orders/:id` |
| 我的 | `/pages/mine/index` | 头像昵称、订单入口、地址管理、推广入口 | 本地 + `GET /promoter/me` |
| 地址管理 | `/pages/address/list` | 列表、新增、编辑、删除、设为默认 | `GET /addresses`、`POST`、`PUT`、`DELETE` |

### Phase 3：推广员体系（第 2 周）

| 页面 | 路径 | 核心功能 | 数据来源 |
|------|------|----------|----------|
| 推广申请 | `/pages/promoter/apply` | 表单（姓名、手机、验证码、邀请码）、自动审核 | `POST /promoter/apply`、`POST /promoter/send-sms` |
| 推广中心 | `/pages/promoter/center` | 数据概览、推广码、分享海报 Canvas、客户数、佣金明细、提现 | `GET /promoter/me`、`GET /promoter/commissions`、`POST /promoter/withdraw` |
| 认养菜地 | `/pages/farm/index` | 占位页（Demo/MVP 阶段）：标题、文案、配图、"通知我"按钮 | 静态页面 |

---

## 4. 关键交互实现规范

### 4.1 微信登录流程
```typescript
// App.tsx onLaunch
const login = async () => {
  const { code } = await Taro.login()
  const { token, userInfo } = await api.post('/auth/wx-login', { code })
  useAuthStore.getState().setToken(token)
}
```

### 4.2 推广员绑定
```typescript
// App.tsx onLaunch 检查 options.query.promoterCode
// 若存在且未绑定，静默调用 /users/bind-promoter
```

### 4.3 分享海报生成
- 使用 `wx.createOffscreenCanvas({ type: '2d' })`
- 元素：背景图 + 店铺 LOGO + 推广码图片（从 `GET /promoter/qrcode` 获取）+ 用户昵称
- 生成后调用 `wx.saveImageToPhotosAlbum`

### 4.4 支付流程
- 在**用户点击事件**中同步调用 `wx.requestPayment`（禁止异步延迟）
- 支付完成后轮询订单状态（1s/次，最多 10 次）
- 不依赖前端回调，以服务端 Webhook 为准

### 4.5 购物车库存校验
- 结算前调用 `POST /cart/preview` 重新校验库存
- 库存不足时 Toast 提示并阻止跳转结算页

---

## 5. Mock 数据策略（与后端并行时）

在 `apps/miniapp/src/services/mock/` 下创建 Mock 数据，格式与后端 API 契约保持一致：

```typescript
// mock/products.ts
export const mockProducts = [
  { id: 1, name: '有机菠菜', price: 12.5, stock: 100, categoryId: 1, ... },
  // ...
]
```

- Phase 1 和 Phase 2 页面开发时，API 层先指向 Mock 数据
- 后端接口就绪后，切换为真实 API（通过环境变量或统一开关控制）

---

## 6. 依赖关系

| 依赖 | 说明 |
|------|------|
| **Task 00** | 项目骨架、Taro 初始化配置、共享类型 |
| **Task 01** | 后端 API（前期用 Mock 代替，接口契约见 `apps/server/docs/API_INTERFACE.md`） |

---

## 7. 验收标准

### Phase 1 验收
- [ ] 首页商品列表滚动流畅，分类筛选正确
- [ ] 商品详情页主图轮播、数量选择器、底部操作栏交互正常
- [ ] 搜索页实时搜索防抖有效，无结果状态正确
- [ ] 购物车数量修改、左滑删除、全选/反选、满减预计算正确
- [ ] 结算页地址选择、满减明细、备注、微信支付调起正常

### Phase 2 验收
- [ ] 订单列表 Tab 切换与状态筛选正确，下拉刷新有效
- [ ] 订单详情页状态进度条与操作按钮（继续支付/取消/确认收货）按状态显示正确
- [ ] 地址管理 CRUD 完整，默认地址逻辑正确
- [ ] 我的页面微信头像昵称正常显示

### Phase 3 验收
- [ ] 推广员申请表单校验（姓名、手机号、验证码）正确
- [ ] 推广中心数据概览、佣金明细列表正常
- [ ] Canvas 海报生成清晰，保存到相册成功
- [ ] 提现金额校验（≥10 元）正确，提交后状态更新

---

## 8. 合并检查清单

- [ ] 所有页面在小程序开发者工具中无报错、无警告
- [ ] 各页面在 iOS / Android 真机预览正常
- [ ] 图片、图标等资源已压缩，无大尺寸静态资源
- [ ] 无 console.log 残留（或已替换为正式日志方案）
- [ ] 提交代码前执行 `pnpm lint` 通过
