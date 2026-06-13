import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

async function main() {
  const categories = await prisma.category.createMany({
    data: [
      { name: '新鲜蔬菜', sort: 1, icon: '🥬' },
      { name: '时令水果', sort: 2, icon: '🍎' },
      { name: '肉禽蛋品', sort: 3, icon: '🍗' },
      { name: '水产海鲜', sort: 4, icon: '🦐' },
      { name: '米面粮油', sort: 5, icon: '🍚' },
      { name: '乳品烘焙', sort: 6, icon: '🥛' },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Categories seeded:', categories.count);

  const supplier = await prisma.supplier.upsert({
    where: { id: 'seed-supplier-1' },
    update: {
      username: '13800138000',
      passwordHash: hashPassword('123456'),
    },
    create: {
      id: 'seed-supplier-1',
      name: '鲜达一号供应商',
      username: '13800138000',
      passwordHash: hashPassword('123456'),
      contact: '张经理',
      phone: '13800138000',
      address: '上海市浦东新区生鲜批发市场A区',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Supplier seeded:', supplier.name);

  const user = await prisma.user.upsert({
    where: { id: 'seed-user-1' },
    update: {},
    create: {
      id: 'seed-user-1',
      openId: 'mock-openid-1',
      nickName: '测试用户',
      phone: '13900139000',
    },
  });
  console.log('✅ User seeded:', user.nickName);

  const veg = await prisma.category.findFirst({ where: { name: '新鲜蔬菜' } });
  let productId = 'seed-product-1';
  if (veg) {
    const product = await prisma.product.upsert({
      where: { id: 'seed-product-1' },
      update: {},
      create: {
        id: 'seed-product-1',
        name: '有机上海青',
        unit: '份',
        price: 399,
        originalPrice: 599,
        stock: 100,
        categoryId: veg.id,
        supplierId: supplier.id,
        coverImage: 'https://placehold.co/400x400?text=Shanghai+Green',
      },
    });
    productId = product.id;
    console.log('✅ Product seeded:', product.name);
  }

  const addressSnapshot = JSON.stringify({
    name: '张三',
    phone: '13800138000',
    detail: '北京市海淀区中关村大街1号',
  });

  await prisma.order.upsert({
    where: { id: 'seed-order-pending-1' },
    update: {},
    create: {
      id: 'seed-order-pending-1',
      orderNo: '20250604000001',
      userId: user.id,
      supplierId: supplier.id,
      status: 'PENDING_SHIPMENT',
      totalAmount: 4250,
      address: addressSnapshot,
      remark: '请发顺丰',
      items: {
        create: [
          {
            productId,
            productName: '有机菠菜',
            productImage: 'https://placehold.co/200x200?text=Spinach',
            price: 1250,
            quantity: 2,
          },
          {
            productId,
            productName: '新鲜草莓',
            productImage: 'https://placehold.co/200x200?text=Strawberry',
            price: 2990,
            quantity: 1,
          },
        ],
      },
    },
  });

  await prisma.order.upsert({
    where: { id: 'seed-order-shipped-1' },
    update: {},
    create: {
      id: 'seed-order-shipped-1',
      orderNo: '20250603000008',
      userId: user.id,
      supplierId: supplier.id,
      status: 'SHIPPED',
      totalAmount: 3980,
      address: JSON.stringify({
        name: '王五',
        phone: '13700137000',
        detail: '深圳市南山区科技园南区',
      }),
      trackingNo: 'SF1234567890',
      shippedAt: new Date('2026-06-03T18:00:00'),
      items: {
        create: [
          {
            productId,
            productName: '烟台红富士苹果',
            productImage: 'https://placehold.co/200x200?text=Apple',
            price: 1990,
            quantity: 2,
          },
        ],
      },
    },
  });

  console.log('✅ Supplier orders seeded');
  console.log('🌱 Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
