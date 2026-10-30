// scratch/gather_120_unique_images.cjs
const fs = require('fs');

async function scrapeImages(query) {
  try {
    const res = await fetch(`https://unsplash.com/s/photos/${encodeURIComponent(query)}`);
    if (res.status !== 200) {
      console.log(`Query ${query} returned status ${res.status}`);
      return [];
    }
    const html = await res.text();
    const regex = /https:\/\/(images|plus)\.unsplash\.com\/(premium_)?photo-[0-9-]+[a-z0-9]+/gi;
    const matches = html.match(regex) || [];
    const unique = Array.from(new Set(matches)).map(u => `${u}?auto=format&fit=crop&w=800&q=80`);
    console.log(`Query "${query}" => Found ${unique.length} unique photos`);
    return unique;
  } catch (e) {
    console.error(`Error scraping query "${query}":`, e.message);
    return [];
  }
}

async function main() {
  const categoryQueries = {
    // Category 1: เครื่องสำอาง (Cosmetics)
    cosmetics: ['cosmetics', 'lipstick', 'eyeshadow', 'blush', 'makeup'],
    // Category 2: ดูแลผิวหน้า (Facial Skincare)
    skincare: ['skincare', 'serum', 'moisturizer', 'cleanser', 'toner'],
    // Category 3: ดูแลผิวกาย (Body & Personal Care)
    bodycare: ['body lotion', 'body scrub', 'hand cream', 'bath', 'soap'],
    // Category 4: ดูแลเส้นผม (Hair Care)
    haircare: ['hair care', 'shampoo', 'hair treatment', 'hair oil'],
    // Category 5: น้ำหอม (Perfume & Fragrance)
    fragrance: ['perfume', 'fragrance', 'scented candle', 'diffuser', 'aromatherapy'],
    // Category 6: บิวตี้ทูลส์ (Beauty Tools)
    beautytools: ['makeup brush', 'gua sha', 'face roller', 'sponge makeup'],
    // Category 7: กันแดด (Sun Protection)
    sunprotection: ['sunscreen', 'sunblock', 'sun cream', 'sun lotion'],
    // Category 8: มาสก์ (Masks & Spa)
    masks: ['face mask skincare', 'sheet mask', 'clay mask', 'eye patch'],
    // Category 9: เซ็ตของขวัญ (Gift Sets)
    giftsets: ['gift box cosmetics', 'beauty gift set', 'present box beauty']
  };

  const poolByCategory = {};
  const globalSeen = new Set();

  for (const [catKey, queries] of Object.entries(categoryQueries)) {
    poolByCategory[catKey] = [];
    console.log(`\nGathering images for: ${catKey}...`);
    for (const q of queries) {
      const urls = await scrapeImages(q);
      for (const url of urls) {
        if (!globalSeen.has(url)) {
          globalSeen.add(url);
          poolByCategory[catKey].push(url);
        }
      }
      // Small pause to be gentle
      await new Promise(r => setTimeout(r, 400));
    }
    console.log(`-> Total for ${catKey}: ${poolByCategory[catKey].length} unique photos`);
  }

  console.log(`\n========================================`);
  console.log(`GRAND TOTAL UNIQUE BEAUTY PHOTOS: ${globalSeen.size}`);
  console.log(`========================================`);
  fs.writeFileSync('scratch/scraped_pools.json', JSON.stringify(poolByCategory, null, 2));
}

main();
