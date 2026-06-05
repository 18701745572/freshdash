import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  private async getOrCreateCart(userId: string) {
    let cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await this.prisma.cart.create({ data: { userId } });
    }
    return cart;
  }

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: { product: true },
        },
      },
    });
    if (!cart) {
      return { items: [], totalAmount: 0, discountAmount: 0 };
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      coverImage: item.product.coverImage,
      price: item.product.price,
      quantity: item.quantity,
      subtotal: item.product.price * item.quantity,
    }));

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return {
      items,
      totalAmount,
      discountAmount: 0,
      finalAmount: totalAmount,
    };
  }

  async addItem(userId: string, productId: string, quantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      throw new BadRequestException('商品不存在');
    }
    if (product.stock < quantity) {
      throw new BadRequestException('库存不足');
    }

    const cart = await this.getOrCreateCart(userId);

    const existingItem = await this.prisma.cartItem.findFirst({
      where: { cartId: cart.id, productId },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException('库存不足');
      }
      return this.prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    }

    return this.prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity },
    });
  }

  async updateItem(itemId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true },
    });
    if (!item) {
      throw new BadRequestException('购物车项不存在');
    }
    if (item.product.stock < quantity) {
      throw new BadRequestException('库存不足');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });
  }

  async removeItem(itemId: string) {
    return this.prisma.cartItem.delete({ where: { id: itemId } });
  }

  async previewDiscount(userId: string) {
    const cart = await this.getCart(userId);
    const rules = await this.prisma.discountRule.findMany({
      where: { isActive: true },
    });

    if (rules.length === 0 || cart.totalAmount === 0) {
      return {
        ...cart,
        discountAmount: 0,
        finalAmount: cart.totalAmount,
        appliedRule: null,
      };
    }

    let bestDiscount = 0;
    let appliedRule: any = null;

    for (const rule of rules) {
      const tiers = rule.tiers as Array<{ threshold: number; discount: number }>;
      const applicableTiers = tiers.filter((t) => t.threshold <= cart.totalAmount);
      if (applicableTiers.length > 0) {
        const bestTier = applicableTiers.reduce((a, b) =>
          a.discount > b.discount ? a : b
        );
        if (bestTier.discount > bestDiscount) {
          bestDiscount = bestTier.discount;
          appliedRule = { name: rule.name, discount: bestTier.discount };
        }
      }
    }

    return {
      ...cart,
      discountAmount: bestDiscount,
      finalAmount: cart.totalAmount - bestDiscount,
      appliedRule,
    };
  }

  async clearCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
    return { success: true };
  }
}
