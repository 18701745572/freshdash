import type {
  AdminBanner,
  AdminProduct,
  AdminSupplier,
  DashboardData,
  DiscountRule,
  FarmLog,
  FarmPlot,
  ImportResult,
  PaginatedResult,
} from '../../types';
import {
  mockBanners,
  mockCategories,
  mockCommissions,
  mockDiscountRules,
  mockFarmLogs,
  mockFarmOrders,
  mockFarmPlots,
  mockOrders,
  mockProducts,
  mockPromoters,
  mockSuppliers,
  mockWithdrawals,
  MOCK_ADMIN,
  MOCK_OPERATOR,
} from './data';

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

let products = [...mockProducts];
let suppliers = [...mockSuppliers];
let orders = [...mockOrders];
let promoters = [...mockPromoters];
let commissions = [...mockCommissions];
let withdrawals = [...mockWithdrawals];
let discountRules = [...mockDiscountRules];
let banners = [...mockBanners];
let farmPlots = [...mockFarmPlots];
let farmLogs = [...mockFarmLogs];

function paginate<T>(list: T[], page = 1, pageSize = 10): PaginatedResult<T> {
  const start = (page - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    page,
    pageSize,
  };
}

function nextId(list: { id: string }[]) {
  return String(Math.max(0, ...list.map((i) => Number(i.id))) + 1);
}

export async function mockLogin(body: { username: string; password: string }) {
  await delay();
  const accounts: Record<string, { password: string; user: typeof MOCK_ADMIN }> = {
    admin: { password: 'admin123', user: MOCK_ADMIN },
    operator: { password: 'operator123', user: MOCK_OPERATOR },
  };
  const account = accounts[body.username];
  if (!account || account.password !== body.password) {
    throw new Error('账号或密码错误');
  }
  return { token: `mock_token_${body.username}`, user: account.user };
}

export async function mockGetDashboard(): Promise<DashboardData> {
  await delay();
  const todayOrders = orders.filter((o) => o.createdAt.startsWith('2025-06-05')).length || 12;
  const todayGmv = orders
    .filter((o) => o.createdAt.startsWith('2025-06-05'))
    .reduce((s, o) => s + o.actualAmount, 0) || 568000;
  return {
    todayOrders,
    todayGmv,
    newPromoters: 5,
    commissionPaid: 286000,
    pendingWithdrawals: withdrawals.filter((w) => w.status === 'PENDING').length,
    pendingDispatchOrders: orders.filter((o) => o.status === 'PENDING_DISPATCH').length,
    orderTrend: [
      { date: '05-30', count: 98, gmv: 420000 },
      { date: '05-31', count: 112, gmv: 480000 },
      { date: '06-01', count: 105, gmv: 450000 },
      { date: '06-02', count: 128, gmv: 568000 },
      { date: '06-03', count: 115, gmv: 510000 },
      { date: '06-04', count: 132, gmv: 590000 },
      { date: '06-05', count: todayOrders, gmv: todayGmv },
    ],
    topProducts: products
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5)
      .map((p) => ({ name: p.name, sales: p.sales })),
    statusDistribution: [
      { status: '待派单', count: orders.filter((o) => o.status === 'PENDING_DISPATCH').length },
      { status: '待发货', count: orders.filter((o) => o.status === 'PENDING_SHIP').length },
      { status: '待收货', count: orders.filter((o) => o.status === 'PENDING_RECEIVE').length },
      { status: '已完成', count: orders.filter((o) => o.status === 'COMPLETED').length },
    ],
  };
}

export async function mockGetProducts(params?: {
  categoryId?: string;
  status?: string;
  supplierId?: string;
  keyword?: string;
  page?: number;
  pageSize?: number;
}) {
  await delay();
  let list = [...products];
  if (params?.categoryId) list = list.filter((p) => p.categoryId === params.categoryId);
  if (params?.supplierId) list = list.filter((p) => p.supplierId === params.supplierId);
  if (params?.status === 'on_sale') list = list.filter((p) => p.isOnSale);
  if (params?.status === 'off_sale') list = list.filter((p) => !p.isOnSale);
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(kw));
  }
  return paginate(list, params?.page, params?.pageSize);
}

export async function mockGetProduct(id: string) {
  await delay();
  const product = products.find((p) => p.id === id);
  if (!product) throw new Error('商品不存在');
  return product;
}

export async function mockSaveProduct(data: Partial<AdminProduct> & { id?: string }) {
  await delay();
  const category = mockCategories.find((c) => c.id === data.categoryId);
  const supplier = suppliers.find((s) => s.id === data.supplierId);
  if (data.id) {
    const idx = products.findIndex((p) => p.id === data.id);
    if (idx < 0) throw new Error('商品不存在');
    products[idx] = {
      ...products[idx],
      ...data,
      categoryName: category?.name || products[idx].categoryName,
      supplierName: supplier?.name,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    } as AdminProduct;
    return products[idx];
  }
  const newProduct: AdminProduct = {
    id: nextId(products),
    name: data.name || '',
    categoryId: data.categoryId || '1',
    categoryName: category?.name || '',
    supplierId: data.supplierId,
    supplierName: supplier?.name,
    price: data.price || 0,
    costPrice: data.costPrice || 0,
    stock: data.stock || 0,
    sales: 0,
    mainImages: data.mainImages || [],
    detailImages: data.detailImages || [],
    isOnSale: data.isOnSale ?? true,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  products.push(newProduct);
  return newProduct;
}

export async function mockDeleteProduct(id: string) {
  await delay();
  products = products.filter((p) => p.id !== id);
}

export async function mockImportProducts(rows: Record<string, unknown>[]): Promise<ImportResult> {
  await delay(500);
  const result: ImportResult = { success: 0, failed: 0, errors: [] };
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = String(row['商品名称'] || row['name'] || '');
    if (!name) {
      result.failed++;
      result.errors.push(`第 ${i + 2} 行：商品名称不能为空`);
      continue;
    }
    try {
      const categoryName = String(row['分类'] || row['category'] || '叶菜类');
      const category = mockCategories.find((c) => c.name === categoryName) || mockCategories[0];
      const supplierName = String(row['默认供应商'] || row['supplier'] || '');
      const supplier = suppliers.find((s) => s.name === supplierName);
      await mockSaveProduct({
        name,
        categoryId: category.id,
        supplierId: supplier?.id,
        price: Math.round(Number(row['售价'] || row['price'] || 0) * 100),
        costPrice: Math.round(Number(row['成本价'] || row['costPrice'] || 0) * 100),
        stock: Number(row['库存'] || row['stock'] || 0),
        isOnSale: String(row['状态'] || '上架') !== '下架',
        mainImages: [],
        detailImages: [],
      });
      result.success++;
    } catch (e) {
      result.failed++;
      result.errors.push(`第 ${i + 2} 行：${(e as Error).message}`);
    }
  }
  return result;
}

export async function mockGetCategories() {
  await delay(100);
  return mockCategories;
}

export async function mockGetSuppliers(params?: { page?: number; pageSize?: number }) {
  await delay();
  return paginate(suppliers, params?.page, params?.pageSize);
}

export async function mockGetSupplier(id: string) {
  await delay();
  const supplier = suppliers.find((s) => s.id === id);
  if (!supplier) throw new Error('供应商不存在');
  return supplier;
}

export async function mockSaveSupplier(data: Partial<AdminSupplier> & { id?: string; password?: string }) {
  await delay();
  if (data.id) {
    const idx = suppliers.findIndex((s) => s.id === data.id);
    if (idx < 0) throw new Error('供应商不存在');
    suppliers[idx] = { ...suppliers[idx], ...data };
    return suppliers[idx];
  }
  const newSupplier: AdminSupplier = {
    id: nextId(suppliers),
    name: data.name || '',
    contactName: data.contactName || '',
    phone: data.phone || '',
    loginName: data.loginName || '',
    status: data.status || 'ACTIVE',
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  suppliers.push(newSupplier);
  return newSupplier;
}

export async function mockResetSupplierPassword(id: string, _password: string) {
  await delay();
  const supplier = suppliers.find((s) => s.id === id);
  if (!supplier) throw new Error('供应商不存在');
  return { success: true };
}

export async function mockGetOrders(params?: {
  status?: string;
  supplierId?: string;
  keyword?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  await delay();
  let list = [...orders];
  if (params?.status) list = list.filter((o) => o.status === params.status);
  if (params?.supplierId) list = list.filter((o) => o.supplierId === params.supplierId);
  if (params?.keyword) {
    const kw = params.keyword.toLowerCase();
    list = list.filter(
      (o) =>
        o.orderNo.includes(kw) ||
        o.userNickName.toLowerCase().includes(kw) ||
        (o.userPhone || '').includes(kw) ||
        (o.supplierName || '').toLowerCase().includes(kw)
    );
  }
  return paginate(list, params?.page, params?.pageSize);
}

export async function mockGetOrder(id: string) {
  await delay();
  const order = orders.find((o) => o.id === id);
  if (!order) throw new Error('订单不存在');
  return order;
}

export async function mockDispatchOrder(orderId: string, supplierId: string) {
  await delay();
  const order = orders.find((o) => o.id === orderId);
  const supplier = suppliers.find((s) => s.id === supplierId);
  if (!order) throw new Error('订单不存在');
  if (!supplier) throw new Error('供应商不存在');
  if (order.status !== 'PENDING_DISPATCH') throw new Error('订单状态不允许派单');
  order.status = 'PENDING_SHIP';
  order.supplierId = supplierId;
  order.supplierName = supplier.name;
  return order;
}

export async function mockAutoDispatch() {
  await delay(500);
  const pending = orders.filter((o) => o.status === 'PENDING_DISPATCH');
  let success = 0;
  let failed = 0;
  for (const order of pending) {
    const defaultSupplierId = order.items[0]?.supplierId;
    const supplier = suppliers.find((s) => s.id === defaultSupplierId && s.status === 'ACTIVE');
    if (supplier) {
      order.status = 'PENDING_SHIP';
      order.supplierId = supplier.id;
      order.supplierName = supplier.name;
      success++;
    } else {
      failed++;
    }
  }
  return { success, failed, total: pending.length };
}

export async function mockRevokeDispatch(orderId: string) {
  await delay();
  const order = orders.find((o) => o.id === orderId);
  if (!order) throw new Error('订单不存在');
  if (order.status !== 'PENDING_SHIP') throw new Error('仅待发货订单可撤销派单');
  order.status = 'PENDING_DISPATCH';
  order.supplierId = undefined;
  order.supplierName = undefined;
  return order;
}

export async function mockGetPromoters(params?: { page?: number; pageSize?: number }) {
  await delay();
  return paginate(promoters, params?.page, params?.pageSize);
}

export async function mockFreezePromoter(id: string, frozen: boolean) {
  await delay();
  const promoter = promoters.find((p) => p.id === id);
  if (!promoter) throw new Error('推广员不存在');
  promoter.status = frozen ? 'FROZEN' : 'ACTIVE';
  return promoter;
}

export async function mockGetPromoterCommissions(promoterId: string) {
  await delay();
  return commissions.filter((c) => c.promoterId === promoterId);
}

export async function mockGetWithdrawals(params?: { status?: string; page?: number; pageSize?: number }) {
  await delay();
  let list = [...withdrawals];
  if (params?.status) list = list.filter((w) => w.status === params.status);
  return paginate(list, params?.page, params?.pageSize);
}

export async function mockApproveWithdrawal(id: string) {
  await delay();
  const w = withdrawals.find((x) => x.id === id);
  if (!w) throw new Error('提现记录不存在');
  if (w.status !== 'PENDING') throw new Error('该申请已处理');
  w.status = 'PAID';
  return w;
}

export async function mockRejectWithdrawal(id: string, remark?: string) {
  await delay();
  const w = withdrawals.find((x) => x.id === id);
  if (!w) throw new Error('提现记录不存在');
  if (w.status !== 'PENDING') throw new Error('该申请已处理');
  w.status = 'REJECTED';
  w.remark = remark;
  const promoter = promoters.find((p) => p.id === w.promoterId);
  if (promoter) promoter.balance += w.amount;
  return w;
}

export async function mockGetDiscountRules() {
  await delay();
  return discountRules;
}

export async function mockSaveDiscountRule(data: Partial<DiscountRule> & { id?: string }) {
  await delay();
  if (data.isActive) {
    discountRules.forEach((r) => {
      if (r.id !== data.id) r.isActive = false;
    });
  }
  if (data.id) {
    const idx = discountRules.findIndex((r) => r.id === data.id);
    if (idx < 0) throw new Error('规则不存在');
    discountRules[idx] = { ...discountRules[idx], ...data } as DiscountRule;
    return discountRules[idx];
  }
  const newRule: DiscountRule = {
    id: nextId(discountRules),
    name: data.name || '',
    tiers: data.tiers || [],
    scope: data.scope || 'ALL',
    isActive: data.isActive ?? false,
    createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
  };
  discountRules.push(newRule);
  return newRule;
}

export async function mockDeleteDiscountRule(id: string) {
  await delay();
  discountRules = discountRules.filter((r) => r.id !== id);
}

export async function mockGetBanners() {
  await delay();
  return [...banners].sort((a, b) => a.sort - b.sort);
}

export async function mockSaveBanner(data: Partial<AdminBanner> & { id?: string }) {
  await delay();
  if (data.id) {
    const idx = banners.findIndex((b) => b.id === data.id);
    if (idx < 0) throw new Error('轮播图不存在');
    banners[idx] = { ...banners[idx], ...data } as AdminBanner;
    return banners[idx];
  }
  const newBanner: AdminBanner = {
    id: nextId(banners),
    imageUrl: data.imageUrl || '',
    linkType: data.linkType || 'NONE',
    linkId: data.linkId,
    linkLabel: data.linkLabel,
    sort: data.sort ?? banners.length + 1,
    isActive: data.isActive ?? true,
  };
  banners.push(newBanner);
  return newBanner;
}

export async function mockDeleteBanner(id: string) {
  await delay();
  banners = banners.filter((b) => b.id !== id);
}

export async function mockReorderBanners(orderedIds: string[]) {
  await delay();
  orderedIds.forEach((id, index) => {
    const banner = banners.find((b) => b.id === id);
    if (banner) banner.sort = index + 1;
  });
  return mockGetBanners();
}

export async function mockGetUploadSign() {
  await delay(100);
  return {
    url: 'https://mock-cos.example.com/upload',
    key: `uploads/${Date.now()}`,
    signature: 'mock_signature',
  };
}

export async function mockGetFarmPlots() {
  await delay();
  return farmPlots;
}

export async function mockSaveFarmPlot(data: Partial<FarmPlot> & { id?: string }) {
  await delay();
  if (data.id) {
    const idx = farmPlots.findIndex((p) => p.id === data.id);
    if (idx < 0) throw new Error('地块不存在');
    farmPlots[idx] = { ...farmPlots[idx], ...data } as FarmPlot;
    return farmPlots[idx];
  }
  const newPlot: FarmPlot = {
    id: nextId(farmPlots),
    name: data.name || '',
    area: data.area || 0,
    quarterPrice: data.quarterPrice || 0,
    yearPrice: data.yearPrice || 0,
    stock: data.stock || 0,
    rtmpUrl: data.rtmpUrl,
    status: data.stock && data.stock > 0 ? 'AVAILABLE' : 'FULL',
  };
  farmPlots.push(newPlot);
  return newPlot;
}

export async function mockGetFarmLogs(plotId: string) {
  await delay();
  return farmLogs.filter((l) => l.plotId === plotId);
}

export async function mockAddFarmLog(data: Omit<FarmLog, 'id'>) {
  await delay();
  const log: FarmLog = { ...data, id: nextId(farmLogs) };
  farmLogs.push(log);
  return log;
}

export async function mockGetFarmOrders() {
  await delay();
  return mockFarmOrders;
}
