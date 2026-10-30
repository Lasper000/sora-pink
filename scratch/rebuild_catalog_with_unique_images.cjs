// scratch/rebuild_catalog_with_unique_images.cjs
const fs = require('fs');
const path = require('path');

const pools = JSON.parse(fs.readFileSync('scratch/scraped_pools.json', 'utf8'));

// Map category UUID to pool key
const catMap = {
  'c1000000-0000-0000-0000-000000000001': 'cosmetics',
  'c1000000-0000-0000-0000-000000000002': 'skincare',
  'c1000000-0000-0000-0000-000000000003': 'bodycare',
  'c1000000-0000-0000-0000-000000000004': 'haircare',
  'c1000000-0000-0000-0000-000000000005': 'fragrance',
  'c1000000-0000-0000-0000-000000000006': 'beautytools',
  'c1000000-0000-0000-0000-000000000007': 'sunprotection',
  'c1000000-0000-0000-0000-000000000008': 'masks',
  'c1000000-0000-0000-0000-000000000009': 'giftsets',
};

const usedImages = new Set();
const poolIndices = {};
for (const k of Object.keys(pools)) {
  poolIndices[k] = 0;
}

function getUniqueImage(catKey) {
  const pool = pools[catKey] || pools['skincare'];
  while (poolIndices[catKey] < pool.length) {
    const candidate = pool[poolIndices[catKey]++];
    if (!usedImages.has(candidate)) {
      usedImages.add(candidate);
      return candidate;
    }
  }
  // Fallback to any unused from any pool
  for (const [k, p] of Object.entries(pools)) {
    for (const c of p) {
      if (!usedImages.has(c)) {
        usedImages.add(c);
        return c;
      }
    }
  }
  throw new Error(`Exhausted unique images for ${catKey}`);
}

const mockDataPath = path.resolve('src/lib/mockData.ts');
const rawMock = fs.readFileSync(mockDataPath, 'utf8');

const cHeader = 'export const INITIAL_CATEGORIES: Category[] = ';
const pHeader = 'export const INITIAL_PRODUCTS: Product[] = [';
const rHeader = 'export const INITIAL_REVIEWS: Review[] = [';
const promoHeader = 'export const PROMO_CODES: PromoCode[] = [';

const cIdx = rawMock.indexOf(cHeader);
const pIdx = rawMock.indexOf(pHeader);
const rIdx = rawMock.indexOf(rHeader);
const promoIdx = rawMock.indexOf(promoHeader);

if (cIdx === -1 || pIdx === -1 || rIdx === -1 || promoIdx === -1) {
  console.error('Could not find all sections in mockData.ts');
  process.exit(1);
}

// Extract Categories
const rawCategories = rawMock.slice(cIdx + cHeader.length, pIdx).trim();
const categories = eval('(' + rawCategories.replace(/;\s*$/, '') + ')');
console.log(`Parsed ${categories.length} categories.`);

// Extract Products
const pEnd = rawMock.lastIndexOf('];', rIdx);
const rawProducts = rawMock.slice(pIdx + pHeader.length, pEnd).trim();
const products = eval('([' + rawProducts + '])');
console.log(`Parsed ${products.length} products.`);

// Assign 1 distinct unique image to each product!
products.forEach((p) => {
  const catKey = catMap[p.category_id] || 'skincare';
  const uniqueImg = getUniqueImage(catKey);
  p.images = [uniqueImg];
});

console.log(`Assigned unique images to all ${products.length} products!`);
console.log(`Total unique images used: ${usedImages.size}`);

// Verify uniqueness
const counts = {};
products.forEach(p => {
  const img = p.images[0];
  counts[img] = (counts[img] || 0) + 1;
});

const duplicates = Object.entries(counts).filter(([k, v]) => v > 1);
if (duplicates.length === 0) {
  console.log('VERIFIED: Exactly 0 duplicates! Every single product has a 100% unique image.');
} else {
  console.error('DUPLICATES DETECTED:', duplicates);
  process.exit(1);
}

// Format products back to clean TypeScript
const formattedProducts = products.map((p) => {
  return `  {
    id: '${p.id}',
    category_id: '${p.category_id}',
    name: ${JSON.stringify(p.name)},
    description: ${JSON.stringify(p.description)},
    ingredients: ${JSON.stringify(p.ingredients)},
    how_to_use: ${JSON.stringify(p.how_to_use)},
    skin_types: ${JSON.stringify(p.skin_types)},
    skin_concerns: ${JSON.stringify(p.skin_concerns)},
    price: ${p.price},
    discount_price: ${p.discount_price ?? null},
    stock_quantity: ${p.stock_quantity},
    images: [
      '${p.images[0]}',
    ],
    is_active: ${p.is_active ? 'true' : 'false'},
    rating: ${p.rating || 5.0},
    review_count: ${p.review_count || 50},
  },`;
}).join('\n');

// Extract reviews and promo codes verbatim
const rawReviews = rawMock.slice(rIdx + rHeader.length, rawMock.lastIndexOf('];', promoIdx)).trim();
const rawPromo = rawMock.slice(promoIdx + promoHeader.length, rawMock.lastIndexOf('];')).trim();

const newMockDataContent = `// ============================================================================
// SORA PINK - MOCK & SEED DATA (112 PRODUCTS WITH 100% UNIQUE IMAGES)
// ============================================================================
import type { Category, Product, PromoCode, Review } from '../types';

export const INITIAL_CATEGORIES: Category[] = ${JSON.stringify(categories, null, 2)};

export const INITIAL_PRODUCTS: Product[] = [
${formattedProducts}
];

export const INITIAL_REVIEWS: Review[] = [
${rawReviews}
];

export const PROMO_CODES: PromoCode[] = [
${rawPromo}
];
`;

fs.writeFileSync(mockDataPath, newMockDataContent, 'utf8');
console.log('Successfully updated src/lib/mockData.ts with unique images!');

// Regenerate supabase_insert_100_products.sql
let sql = `-- ============================================================================
-- SORA PINK - SQL MIGRATION / SEED FOR 112 PRODUCTS & 9 CATEGORIES (100% UNIQUE IMAGES)
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/xghfnyelfgsbvztwzfmu/sql)
-- ============================================================================

-- 1. Insert/Update all 9 Categories
INSERT INTO categories (id, name, slug, description, image_url)
VALUES
`;

const catSqlRows = categories.map((c) => {
  return `  ('${c.id}', '${c.name.replace(/'/g, "''")}', '${c.slug}', '${c.description.replace(/'/g, "''")}', '${c.image_url}')`;
}).join(',\n');

sql += catSqlRows + `
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;

-- 2. Insert/Update All 112 Products (Every product with unique image)
INSERT INTO products (
  id, category_id, name, description, ingredients, how_to_use,
  skin_types, skin_concerns, price, discount_price, stock_quantity,
  images, is_active, rating, review_count
) VALUES
`;

const prodSqlRows = products.map((p) => {
  const imagesArray = `ARRAY[${p.images.map(img => `'${img.replace(/'/g, "''")}'`).join(', ')}]::text[]`;
  const skinTypesArray = `ARRAY[${p.skin_types.map(t => `'${t.replace(/'/g, "''")}'`).join(', ')}]::text[]`;
  const skinConcernsArray = `ARRAY[${p.skin_concerns.map(c => `'${c.replace(/'/g, "''")}'`).join(', ')}]::text[]`;

  return `  (
    '${p.id}',
    '${p.category_id}',
    '${p.name.replace(/'/g, "''")}',
    '${p.description.replace(/'/g, "''")}',
    '${p.ingredients.replace(/'/g, "''")}',
    '${p.how_to_use.replace(/'/g, "''")}',
    ${skinTypesArray},
    ${skinConcernsArray},
    ${p.price},
    ${p.discount_price ?? 'NULL'},
    ${p.stock_quantity},
    ${imagesArray},
    ${p.is_active ? 'true' : 'false'},
    ${p.rating || 5.0},
    ${p.review_count || 50}
  )`;
}).join(',\n');

sql += prodSqlRows + `
ON CONFLICT (id) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  ingredients = EXCLUDED.ingredients,
  how_to_use = EXCLUDED.how_to_use,
  skin_types = EXCLUDED.skin_types,
  skin_concerns = EXCLUDED.skin_concerns,
  price = EXCLUDED.price,
  discount_price = EXCLUDED.discount_price,
  stock_quantity = EXCLUDED.stock_quantity,
  images = EXCLUDED.images,
  is_active = EXCLUDED.is_active,
  rating = EXCLUDED.rating,
  review_count = EXCLUDED.review_count;
`;

const sqlPath = path.resolve('supabase_insert_100_products.sql');
fs.writeFileSync(sqlPath, sql, 'utf8');
console.log('Successfully updated supabase_insert_100_products.sql with 100% unique images!');
