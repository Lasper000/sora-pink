const fs = require('fs');

async function testNextData() {
  const res = await fetch('https://unsplash.com/s/photos/cosmetics', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const html = await res.text();
  console.log('HTML contains __NEXT_DATA__:', html.includes('__NEXT_DATA__'));
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (match) {
    try {
      const data = JSON.parse(match[1]);
      console.log('Keys in data:', Object.keys(data));
      const str = JSON.stringify(data);
      const urls = str.match(/https:\/\/images\.unsplash\.com\/photo-[0-9a-zA-Z_-]+/g) || [];
      console.log('Found photo URLs in NEXT_DATA:', urls.length);
      console.log('Sample:', urls.slice(0, 3));
    } catch(e) {
      console.error('Parse error:', e.message);
    }
  } else {
    // Check other matches
    const allImgs = html.match(/https:\/\/images\.unsplash\.com\/[^\"\s\?]+/g) || [];
    console.log('All images.unsplash URLs in HTML:', allImgs.length);
    console.log('Sample:', allImgs.slice(0, 5));
  }
}
testNextData();
