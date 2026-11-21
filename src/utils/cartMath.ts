import type { CartItem } from '../types';

export const getEffectiveItemUnitPrice = (item: CartItem): number => {
  const base = item.product.discount_price ?? item.product.price;
  return item.bundleDiscountPercent
    ? Math.round(base * (1 - item.bundleDiscountPercent / 100))
    : base;
};

export const calculateCartTotals = (
  cart: CartItem[],
  discountAmountInput: number,
  hasFreeShippingPromo: boolean
) => {
  const subtotal = cart.reduce((sum, item) => sum + getEffectiveItemUnitPrice(item) * item.quantity, 0);
  const discountAmount = Math.min(subtotal, Math.max(0, discountAmountInput));
  const shippingFee = subtotal >= 500 || hasFreeShippingPromo || cart.length === 0 ? 0 : 50;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return { subtotal, discountAmount, shippingFee, grandTotal, itemCount };
};
