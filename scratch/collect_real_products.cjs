// scratch/collect_real_products.cjs
const fs = require('fs');

const PRODUCT_KEYWORDS = [
  'bottle', 'jar', 'tube', 'dropper', 'serum', 'cosmetic', 'cream',
  'lipstick', 'lip', 'makeup', 'perfume', 'powder', 'palette',
  'mascara', 'shampoo', 'brush', 'gua sha', 'soap', 'lotion',
  'sunscreen', 'mask', 'box', 'packaging', 'product', 'container',
  'cologne', 'oil', 'spray', 'moisturizer', 'cleanser', 'diffuser',
  'candle', 'roller', 'sponge', 'balm', 'tonic', 'scrub'
];

const DISQUALIFIED_KEYWORDS = [
  'woman', 'girl', 'man', 'model', 'portrait', 'face of', 'holding',
  'standing', 'wearing', 'selfie', 'person', 'smiling', 'eyes of',
  'hair of a woman', 'legs', 'feet', 'room', 'wall', 'street',
  'nature', 'city', 'building', 'landscape'
];

function isPureProduct(desc) {
  if (!desc) return false;
  const lower = desc.toLowerCase();
  
  // Must not have disqualifying words (person, face, model)
  for (const bad of DISQUALIFIED_KEYWORDS) {
    if (lower.includes(bad)) return false;
  }
  
  // Must have at least one product keyword
  for (const good of PRODUCT_KEYWORDS) {
    if (lower.includes(good)) return true;
  }
  
  return false;
}

async function scrapeCategory(query) {
  try {
    const res = await fetch(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`);
    if (res.status !== 200) return [];
    const html = await res.text();
    
    const figures = html.split('<figure');
    const list = [];
    
    for (let i = 1; i < figures.length; i++) {
      const fig = figures[i];
      const descMatch = fig.match(/<meta itemProp="description" content="([^"]+)"/);
      const imgMatch = fig.match(/(https:\/\/(images|plus)\.unsplash\.com\/(premium_)?photo-[0-9a-zA-Z_-]+)\?/);
      
      if (descMatch && imgMatch) {
        const desc = descMatch[1];
        const rawUrl = imgMatch[1];
        if (isPureProduct(desc)) {
          list.push({
            desc,
            url: `${rawUrl}?auto=format&fit=crop&w=800&q=80`
          });
        }
      }
    }
    return list;
  } catch (err) {
    console.error(`Error with ${query}:`, err.message);
    return [];
  }
}

async function run() {
  const categories = {
    cosmetics: [
      'cosmetics packaging', 'lipstick product', 'eyeshadow palette',
      'blush makeup product', 'powder compact makeup', 'lip gloss tube'
    ],
    skincare: [
      'skincare bottle mockup', 'serum dropper bottle', 'face cream jar',
      'skincare packaging minimalist', 'cosmetic toner bottle', 'facial cleanser bottle'
    ],
    bodycare: [
      'body lotion bottle', 'body scrub jar', 'hand cream tube',
      'soap bar product packaging', 'body wash bottle', 'body oil dropper'
    ],
    haircare: [
      'shampoo bottle product', 'hair oil bottle', 'hair mask jar product',
      'hair product packaging', 'hair serum bottle'
    ],
    fragrance: [
      'perfume bottle luxury', 'fragrance bottle product', 'scented candle glass',
      'reed diffuser bottle', 'perfume bottle pink'
    ],
    beautytools: [
      'makeup brush set product', 'rose quartz gua sha', 'jade face roller',
      'beauty blender sponge', 'makeup tools'
    ],
    sunprotection: [
      'sunscreen tube product', 'sunscreen bottle packaging', 'sun lotion bottle',
      'sunblock product'
    ],
    masks: [
      'sheet mask packaging', 'face mask jar', 'clay mask jar cosmetic',
      'skincare mask product'
    ],
    giftsets: [
      'cosmetic gift box', 'beauty gift box packaging', 'skincare gift set box',
      'luxury product gift box'
    ]
  };

  const pool = {};
  const seenUrls = new Set();

  for (const [cat, queries] of Object.entries(categories)) {
    pool[cat] = [];
    console.log(`\n--- Scraping category: ${cat} ---`);
    for (const q of queries) {
      const items = await scrapeCategory(q);
      for (const item of items) {
        if (!seenUrls.has(item.url)) {
          seenUrls.add(item.url);
          pool[cat].push(item);
        }
      }
      await new Promise(r => setTimeout(r, 400));
    }
    console.log(`=> Found ${pool[cat].length} validated PURE PRODUCT photos for ${cat}`);
    // Print first 3 samples
    pool[cat].slice(0, 3).forEach(it => console.log(`   [OK] ${it.desc.slice(0, 75)}...`));
  }

  console.log(`\n========================================`);
  console.log(`TOTAL PURE PRODUCT PACKSHOTS: ${seenUrls.size}`);
  console.log(`========================================`);
  fs.writeFileSync('scratch/pure_products_pool.json', JSON.stringify(pool, null, 2));
}

run();
