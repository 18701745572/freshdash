/** 满减规则：满 50 元减 5 元（单位：分） */
const DISCOUNT_THRESHOLD = 5000;
const DISCOUNT_AMOUNT = 500;

export const formatPrice = (priceInCents: number) => (priceInCents / 100).toFixed(2);

export const calcSubtotal = (items: { price: number; quantity: number }[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const calcDiscount = (subtotal: number) =>
  subtotal >= DISCOUNT_THRESHOLD ? DISCOUNT_AMOUNT : 0;

export const calcTotal = (subtotal: number) => subtotal - calcDiscount(subtotal);
