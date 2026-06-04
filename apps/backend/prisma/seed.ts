import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 分类
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

  // 供应商
  const supplier = await prisma.supplier.upsert({
    where: { id: 'seed-supplier-1' },
    update: {},
    create: {
      id: 'seed-supplier-1',
      name: '鲜达一号供应商',
      contact: '张经理',
      phone: '13800138000',
      address: '上海市浦东新区生鲜批发市场A区',
      status: 'ACTIVE',
    },
  });
  console.log('✅ Supplier seeded:', supplier.name);

  // 用户
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

  // 商品
  const veg = await prisma.category.findFirst({ where: { name: '新鲜蔬菜' } });
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
        coverImage: 'https://placehold.co/400x400?text=Shanghai+Green',
      },
    });
    console.log('✅ Product seeded:', product.name);
  }

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
