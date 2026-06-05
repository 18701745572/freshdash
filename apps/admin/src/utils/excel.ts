import * as XLSX from 'xlsx';
import type { AdminOrder, AdminProduct } from '../types';
import { centsToYuan, formatMoney } from './format';
import { ORDER_STATUS_LABELS } from '../constants/order';

export function exportProductsToExcel(products: AdminProduct[], filename = '商品列表.xlsx') {
  const rows = products.map((p) => ({
    商品名称: p.name,
    分类: p.categoryName,
    售价: centsToYuan(p.price),
    成本价: centsToYuan(p.costPrice),
    库存: p.stock,
    默认供应商: p.supplierName || '',
    状态: p.isOnSale ? '上架' : '下架',
  }));
  downloadWorkbook(rows, filename);
}

export function exportOrdersToExcel(orders: AdminOrder[], filename = '发货表.xlsx') {
  const rows = orders.flatMap((order) =>
    order.items.map((item) => ({
      订单号: order.orderNo,
      用户昵称: order.userNickName,
      收货人: order.address.name,
      手机号: order.address.phone,
      收货地址: `${order.address.province}${order.address.city}${order.address.district}${order.address.detail}`,
      商品名称: item.productName,
      数量: item.quantity,
      单价: centsToYuan(item.price),
      订单状态: ORDER_STATUS_LABELS[order.status],
      供应商: order.supplierName || '',
      下单时间: order.createdAt,
    }))
  );
  downloadWorkbook(rows, filename);
}

export function parseProductImportFile(file: File): Promise<Record<string, unknown>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('文件读取失败'));
    reader.readAsArrayBuffer(file);
  });
}

function downloadWorkbook(rows: Record<string, unknown>[], filename: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  XLSX.writeFile(workbook, filename);
}

export { formatMoney };
