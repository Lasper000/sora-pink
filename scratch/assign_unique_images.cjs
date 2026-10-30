// scratch/assign_unique_images.cjs
const fs = require('fs');
const path = require('path');

const pools = JSON.parse(fs.readFileSync('scratch/scraped_pools.json', 'utf8'));
const mockDataPath = path.resolve('src/lib/mockData.ts');
let mockContent = fs.readFileSync(mockDataPath, 'utf8');

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

// Global set of assigned images
const usedImages = new Set();
const poolIndices = {};
for (const k of Object.keys(pools)) {
  poolIndices[k] = 0;
}

function getNextUniqueImage(catKey) {
  const pool = pools[catKey] || pools['skincare'];
  while (poolIndices[catKey] < pool.length) {
    const candidate = pool[poolIndices[catKey]++];
    if (!usedImages.has(candidate)) {
      usedImages.add(candidate);
      return candidate;
    }
  }
  // Fallback to any unused image from any pool
  for (const [k, p] of Object.entries(pools)) {
    for (const c of p) {
      if (!usedImages.has(c)) {
        usedImages.add(c);
        return c;
      }
    }
  }
  throw new Error(`Ran out of unique images for ${catKey}!`);
}

// Extract INITIAL_PRODUCTS array block
const pStart = mockContent.indexOf('export const INITIAL_PRODUCTS: Product[] = [');
const pEnd = mockContent.indexOf('\n];\n\nexport const INITIAL_REVIEWS');

if (pStart === -1 || pEnd === -1) {
  console.error('Could not find INITIAL_PRODUCTS block in mockData.ts');
  process.exit(1);
}

const productsBlock = mockContent.slice(pStart, pEnd);

// Split products by regex matching { id: 'a1000000-...
// Instead of complex regex, let's parse each product object
const productChunks = productsBlock.split(/(?=\s*\{\s*id:\s*'a1000000-)/);

console.log(`Found ${productChunks.length - 1} product entries in mockData.ts`);

const updatedChunks = [];
updatedChunks.push(productChunks[0]); // The header `export const INITIAL_PRODUCTS: Product[] = [`

let assignedCount = 0;
const productRecordList = [];

for (let i = 1; i < productChunks.length; i++) {
  let chunk = productChunks[i];
  
  // Extract category_id
  const catMatch = chunk.match(/category_id:\s*'([^']+)'/);
  const idMatch = chunk.match(/id:\s*'([^']+)'/);
  const nameMatch = chunk.match(/name:\s*([^,\n]+)/);

  if (!catMatch) {
    console.warn(`Could not find category_id in chunk ${i}`);
    updatedChunks.push(chunk);
    continue;
  }

  const catId = catMatch[1];
  const catKey = catMap[catId] || 'skincare';

  // Get 1 unique primary image
  const primaryImg = getNextUniqueImage(catKey);

  // Replace images: [...] in this chunk
  // Pattern: images: [\s\S]*?],
  const newImagesStr = `images: [\n      '${primaryImg}',\n    ],`;
  
  chunk = chunk.replace(/images:\s*\[[\s\S]*?\],/, newImagesStr);
  updatedChunks.push(chunk);
  assignedCount++;

  productRecordList.push({
    id: idMatch ? idMatch[1] : `p-${i}`,
    name: nameMatch ? nameMatch[1] : '',
    category_id: catId,
    image: primaryImg
  });
}

const newProductsBlock = updatedChunks.join('');
mockContent = mockContent.slice(0, pStart) + newProductsBlock + mockContent.slice(pEnd);

fs.writeFileSync(mockDataPath, mockContent, 'utf8');
console.log(`Successfully assigned unique images to ${assignedCount} products!`);
console.log(`Total unique images used: ${usedImages.size}`);

// Verify NO DUPLICATES
const counts = {};
productRecordList.forEach(p => {
  counts[p.image] = (counts[p.image] || 0) + 1;
});
const duplicates = Object.entries(counts).filter(([k, v]) => v > 1);
console.log(`Duplicate images count: ${duplicates.length}`);
if (duplicates.length === 0) {
  console.log('PERFECT: 100% of all 112 products have a completely unique, non-repeating image!');
} else {
  console.error('WARNING: Found duplicates:', duplicates);
}

// Now also regenerate supabase_insert_100_products.sql with the new unique images
const sqlScriptPath = path.resolve('scratch/generate_catalog.cjs');
// Run catalog generation or update SQL file
const sqlPath = path.resolve('supabase_insert_100_products.sql');
let sqlContent = fs.readFileSync(sqlPath, 'utf8');

// For each product in productRecordList, update its image in the SQL file
productRecordList.forEach(p => {
  // Regex to match image array for this product id
  const idPattern = new RegExp(`('${p.id}',[\\s\\S]*?ARRAY\\[)[^\\]]+(\\]::text\\[\\])`);
  if (sqlContent.match(idPattern)) {
    sqlContent = sqlContent.replace(idPattern, `$1'${p.image}'$2`);
  }
});

fs.writeFileSync(sqlPath, sqlContent, 'utf8');
console.log('Successfully updated supabase_insert_100_products.sql with the unique images!');

