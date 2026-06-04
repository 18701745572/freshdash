# FreshDash API 接口契约文档

> 本文档由架构师在项目骨架阶段输出，作为前后端联调的统一契约。
> 所有接口均以 `/api` 为前缀，返回格式统一为 `{ code, message, data }`。

## 认证相关

### POST /api/auth/wechat-login
微信小程序登录，获取 JWT Token。

**请求体：**
```json
{
  "code": "wx_login_code"
}
```

**响应：**
```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "token": "jwt_token",
    "user": { "id", "openid", "nickName", "avatarUrl", "role" }
  }
}
```

### GET /api/auth/me
获取当前登录用户信息。

**响应：**
```json
{
  "code": 0,
  "data": { "id", "openid", "nickName", "avatarUrl", "phone", "role", "balance", "promoterCode" }
}
```

### PUT /api/auth/phone
绑定手机号（需要微信手机号授权 code）。

---

## 首页与商品

### GET /api/banners
获取首页 Banner 列表。

**响应：**
```json
{
  "code": 0,
  "data": [
    { "id", "imageUrl", "linkUrl", "sortOrder" }
  ]
}
```

### GET /api/categories
获取商品分类树。

**响应：**
```json
{
  "code": 0,
  "data": [
    { "id", "name", "icon", "children": [...] }
  ]
}
```

### GET /api/products
获取商品列表（支持分类筛选、分页）。

**查询参数：**
- `categoryId` (可选)
- `keyword` (可选)
- `page` (默认 1)
- `pageSize` (默认 10)

**响应：**
```json
{
  "code": 0,
  "data": {
    "list": [ { "id", "name", "coverImage", "price", "originalPrice", "unit", "tags" } ],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### GET /api/products/:id
获取商品详情。

**响应：**
```json
{
  "code": 0,
  "data": { "id", "name", "description", "images", "price", "originalPrice", "unit", "stock", "category", "tags" }
}
```

---

## 购物车

### GET /api/cart
获取购物车列表。

### POST /api/cart
添加商品到购物车。

**请求体：**
```json
{ "productId": "xxx", "quantity": 2 }
```

### PUT /api/cart/:id
更新购物车商品数量或选中状态。

### DELETE /api/cart/:id
删除购物车商品。

---

## 地址管理

### GET /api/addresses
获取地址列表。

### POST /api/addresses
新增地址。

### PUT /api/addresses/:id
修改地址。

### DELETE /api/addresses/:id
删除地址。

### PUT /api/addresses/:id/default
设为默认地址。

---

## 订单

### POST /api/orders
创建订单。

**请求体：**
```json
{
  "items": [{ "productId": "xxx", "quantity": 2 }],
  "addressId": "xxx",
  "remark": ""
}
```

### GET /api/orders
获取订单列表（支持状态筛选）。

**查询参数：**
- `status` (可选)
- `page`
- `pageSize`

### GET /api/orders/:id
获取订单详情。

### POST /api/orders/:id/pay
模拟支付（生成预付单）。

### POST /api/orders/:id/cancel
取消订单。

### POST /api/orders/:id/confirm
确认收货。

---

## 推广员

### POST /api/promoter/apply
申请成为推广员。

### GET /api/promoter/code
获取推广码（含二维码图片 URL）。

### GET /api/promoter/stats
获取推广统计（累计佣金、已结算、待结算、推广人数、订单数）。

### GET /api/promoter/commissions
获取佣金明细列表。

### POST /api/promoter/withdraw
申请提现。

**请求体：**
```json
{ "amount": 5000 }
```

---

## 供应商（商家端）

### POST /api/supplier/auth/login
供应商登录（手机号 + 密码）。

### GET /api/supplier/dispatches
获取被派发的订单列表。

**查询参数：**
- `status` (pending/shipped/completed)
- `page`
- `pageSize`

### POST /api/supplier/dispatches/:id/ship
确认发货。

**请求体：**
```json
{ "logisticsCompany": "顺丰", "trackingNo": "SF123456" }
```

---

## 管理后台

### POST /api/admin/login
管理员登录。

### GET /api/admin/dashboard
获取经营看板数据（今日订单/销售额/用户/待处理）。

### GET /api/admin/products
商品列表（含状态筛选）。

### POST /api/admin/products
新增/修改商品。

### GET /api/admin/orders
订单列表（含派单操作）。

### POST /api/admin/orders/:id/dispatch
手动派单给供应商。

**请求体：**
```json
{ "supplierId": "xxx" }
```

### GET /api/admin/suppliers
供应商列表。

### POST /api/admin/suppliers
新增/修改供应商。

### GET /api/admin/promoters
推广员列表。

### POST /api/admin/promoters/:id/audit
审核推广员提现。

**请求体：**
```json
{ "status": "approved", "remark": "" }
```

### GET /api/admin/withdrawals
提现申请列表。

---

## WebSocket（可选）

### ws://localhost:3000/ws
用于实时推送新订单、派单通知等。

---

## 状态码说明

| Code | 含义 |
|------|------|
| 0 | 成功 |
| 400 | 参数错误 |
| 401 | 未登录或 Token 过期 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
| 1001 | 业务错误（如库存不足） |
| 1002 | 订单状态不允许此操作 |
