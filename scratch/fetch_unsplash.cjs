const fs = require('fs');

async function scrapeCategory(query) {
  try {
    const res = await fetch(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
      }
    });
    const html = await res.text();
    // Look for image urls like https://images.unsplash.com/photo-12345... or https://plus.unsplash.com/premium_photo-12345...
    const regex = /https:\/\/(images|plus)\.unsplash\.com\/(premium_)?photo-[0-9a-zA-Z_-]+/g;
    const matches = html.match(regex) || [];
    const unique = Array.from(new Set(matches));
    console.log(`Query: ${query} => Found ${unique.length} images`);
    return unique;
  } catch (err) {
    console.error(`Error scraping ${query}:`, err.message);
    return [];
  }
}

async function run() {
  const queries = [
    'lipstick', 'cosmetics', 'eyeshadow', 'blush-makeup', 'mascara',
    'face-serum', 'skincare-bottle', 'face-cream', 'toner-skincare', 'face-cleanser',
    'body-lotion', 'body-scrub', 'hand-cream', 'body-wash', 'body-oil',
    'shampoo-bottle', 'hair-oil', 'hair-care', 'hair-mask',
    'perfume-bottle', 'fragrance', 'aromatherapy-oil', 'scented-candle', 'diffuser',
    'makeup-brushes', 'gua-sha', 'face-roller', 'beauty-blender',
    'sunscreen', 'sun-cream', 'sunblock',
    'face-mask-skincare', 'sheet-mask', 'eye-mask', 'clay-mask',
    'gift-box-cosmetic', 'skincare-gift-set', 'beauty-gift-box'
  ];

  const allFound = new Set();
  for (const q of queries) {
    const list = await scrapeCategory(q);
    list.forEach(url => allFound.add(url));
  }
  console.log(`Total unique Unsplash photos gathered: ${allFound.size}`);
  fs.writeFileSync('scratch/unsplash_photos.json', JSON.stringify(Array.from(allFound), null, 2));
}

run();
