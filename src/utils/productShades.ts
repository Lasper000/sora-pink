import type { Product } from '../types';

export interface ProductShadeOption {
  name: string;
  hex: string;
  undertone: string;
  finish: string;
}

export const COSMETIC_SHADES: ProductShadeOption[] = [
  {
    name: '#01 Sakura Pink',
    hex: '#FF6B8B',
    undertone: 'Cool Rosy Pink (ชมพูซากุระระเรื่อ)',
    finish: 'Dewy Jelly Glow',
  },
  {
    name: '#02 Muted Peach',
    hex: '#FB923C',
    undertone: 'Warm Peach Coral (พีชคอรัลละมุน)',
    finish: 'Velvet Satin',
  },
  {
    name: '#03 Berry Glass',
    hex: '#BE123C',
    undertone: 'Deep Berry Wine (กุหลาบเบอร์รี่ฉ่ำ)',
    finish: 'Glass Shimmer',
  },
  {
    name: '#04 Nude Almond',
    hex: '#C2847A',
    undertone: 'MLBB Nude (นู้ดธรรมชาติ)',
    finish: 'Soft Matte',
  },
];

export const isShadeSelectableProduct = (product: Product | null | undefined): boolean => {
  if (!product) return false;
  return Boolean(
    product.category?.slug === 'cosmetics' ||
      product.category_id === 'c1000000-0000-0000-0000-000000000001' ||
      /lip|tint|blush|cushion|powder|shimmer|glow|ลิป|บลัช|คุชชั่น|แป้ง/i.test(product.name || '')
  );
};
