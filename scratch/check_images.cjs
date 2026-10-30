const fs = require('fs');
const content = fs.readFileSync('src/lib/mockData.ts', 'utf8');
const pMatch = content.match(/export const INITIAL_PRODUCTS: Product\[\] = \[([\s\S]*?)\n\];/);
const prods = pMatch[1];
const imgMatches = prods.match(/images:\s*\[([^\]]+)\]/g);
const allImages = [];
imgMatches.forEach(m => {
  const urls = m.match(/['"][^'"]+['"]/g) || [];
  urls.forEach(u => allImages.push(u.replace(/['"]/g, '')));
});
console.log('Total product image entries:', allImages.length);
const counts = {};
allImages.forEach(img => { counts[img] = (counts[img] || 0) + 1; });
const dups = Object.entries(counts).filter(([k, v]) => v > 1);
console.log('Unique images:', Object.keys(counts).length);
console.log('Number of repeated image URLs:', dups.length);
dups.forEach(([url, count]) => console.log(count, 'times:', url));
