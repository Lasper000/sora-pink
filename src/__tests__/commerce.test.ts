import { describe, it, expect, beforeEach } from 'vitest';
import { getEffectiveItemUnitPrice, calculateCartTotals } from '../utils/cartMath';
import { resolveProvinceFromPostalCode, THAI_PROVINCES } from '../utils/thaiLocations';
import { validatePromoCode } from '../services/api';
import { isShadeSelectableProduct, COSMETIC_SHADES } from '../utils/productShades';
import { slugify, findProductFromList } from '../utils/productRouting';
import type { CartItem, Product, PromoCode } from '../types';

const makeProduct = (overrides: Partial<Product> = {}): Product => ({
  id: 'a1000000-0000-0000-0000-000000000001',
  category_id: 'c1000000-0000-0000-0000-000000000002',
  name: 'Cloud Hydrating Barrier Serum',
  description: 'Deep hydration serum',
  ingredients: 'Ceramide, HA',
  how_to_use: 'Apply daily',
  skin_types: ['ทุกสภาพผิว'],
  skin_concerns: ['ความชุ่มชื้น'],
  price: 800,
  discount_price: 600,
  stock_quantity: 10,
  images: ['/images/products/test.jpg'],
  is_active: true,
  ...overrides,
});

describe('SORA PINK Commerce Logic', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.clear();
    }
  });

  it('calculates regular, discounted, and bundle unit prices accurately', () => {
    const regularItem: CartItem = {
      id: 'c1',
      product_id: 'p1',
      quantity: 2,
      product: makeProduct({ price: 450, discount_price: null }),
    };
    expect(getEffectiveItemUnitPrice(regularItem)).toBe(450);

    const saleItem: CartItem = {
      id: 'c2',
      product_id: 'p2',
      quantity: 1,
      product: makeProduct({ price: 800, discount_price: 600 }),
    };
    expect(getEffectiveItemUnitPrice(saleItem)).toBe(600);

    const bundledItem: CartItem = {
      id: 'c3',
      product_id: 'p3',
      quantity: 1,
      product: makeProduct({ price: 800, discount_price: 600 }),
      bundleDiscountPercent: 20,
      bundleLabel: 'Morning Ritual',
    };
    expect(getEffectiveItemUnitPrice(bundledItem)).toBe(480);
  });

  it('computes cart totals, free shipping threshold (>=500), and clamps discount to subtotal', () => {
    const under500: CartItem[] = [
      { id: 'c1', product_id: 'p1', quantity: 1, product: makeProduct({ price: 320, discount_price: null }) },
    ];
    const totalsUnder = calculateCartTotals(under500, 0, false);
    expect(totalsUnder.subtotal).toBe(320);
    expect(totalsUnder.shippingFee).toBe(50);
    expect(totalsUnder.grandTotal).toBe(370);

    const totalsFreePromo = calculateCartTotals(under500, 500, true);
    expect(totalsFreePromo.discountAmount).toBe(320);
    expect(totalsFreePromo.shippingFee).toBe(0);
    expect(totalsFreePromo.grandTotal).toBe(0);

    const over500: CartItem[] = [
      { id: 'c2', product_id: 'p2', quantity: 1, product: makeProduct({ price: 650, discount_price: null }) },
    ];
    const totalsOver = calculateCartTotals(over500, 100, false);
    expect(totalsOver.shippingFee).toBe(0);
    expect(totalsOver.grandTotal).toBe(550);
  });

  it('enforces promo code validation rules (active, expiry, maxUses, minSpend)', () => {
    const basePromo: PromoCode = {
      code: 'SAVE100',
      discountAmount: 100,
      minSpend: 500,
      description: 'ลด 100 เมื่อครบ 500',
      isActive: true,
    };

    expect(validatePromoCode(basePromo, 600).valid).toBe(true);
    expect(validatePromoCode(basePromo, 499).valid).toBe(false);
    expect(validatePromoCode({ ...basePromo, isActive: false }, 600).valid).toBe(false);
    expect(validatePromoCode({ ...basePromo, expiresAt: '2020-01-01T00:00:00.000Z' }, 600).valid).toBe(false);
    expect(validatePromoCode({ ...basePromo, maxUses: 5, usedCount: 5 }, 600).valid).toBe(false);
    expect(validatePromoCode({ ...basePromo, maxUses: 5, usedCount: 4 }, 600).valid).toBe(true);
  });

  it('resolves Thai provinces accurately from 5-digit postal codes', () => {
    expect(THAI_PROVINCES.length).toBe(77);
    expect(resolveProvinceFromPostalCode('10110')).toBe('กรุงเทพมหานคร');
    expect(resolveProvinceFromPostalCode('10270')).toBe('สมุทรปราการ');
    expect(resolveProvinceFromPostalCode('50000')).toBe('เชียงใหม่');
    expect(resolveProvinceFromPostalCode('83000')).toBe('ภูเก็ต');
    expect(resolveProvinceFromPostalCode('20150')).toBe('ชลบุรี');
    expect(resolveProvinceFromPostalCode('101')).toBeNull();
  });

  it('identifies cosmetic shade-selectable products and resolves product routing slugs', () => {
    expect(COSMETIC_SHADES.length).toBe(4);
    const lipTint = makeProduct({
      id: 'a1000000-0000-0000-0000-000000000002',
      category_id: 'c1000000-0000-0000-0000-000000000001',
      name: 'Velvet Dew Jelly Lip Tint',
    });
    const shampoo = makeProduct({
      id: 'a1000000-0000-0000-0000-000000000011',
      category_id: 'c1000000-0000-0000-0000-000000000004',
      name: 'Botanical Rosemary Shampoo',
    });

    expect(isShadeSelectableProduct(lipTint)).toBe(true);
    expect(isShadeSelectableProduct(shampoo)).toBe(false);
    expect(slugify('Velvet Dew Jelly Lip Tint')).toBe('velvet-dew-jelly-lip-tint');
    expect(findProductFromList([lipTint, shampoo], 'velvet-dew-jelly-lip-tint')?.id).toBe(lipTint.id);
  });
});
