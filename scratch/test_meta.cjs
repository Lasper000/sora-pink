async function test() {
  const res = await fetch('https://unsplash.com/s/photos/cosmetics-packaging');
  const html = await res.text();
  
  // Split by <figure or data-testid="asset-grid-masonry-img"
  const figures = html.split('<figure');
  console.log('Total figures:', figures.length - 1);
  
  const results = [];
  for (let i = 1; i < figures.length; i++) {
    const fig = figures[i];
    const descMatch = fig.match(/<meta itemProp="description" content="([^"]+)"/);
    const srcMatch = fig.match(/src="(https:\/\/(images|plus)\.unsplash\.com\/[^"?]+)/);
    if (descMatch && srcMatch) {
      results.push({
        desc: descMatch[1],
        url: srcMatch[1]
      });
    }
  }
  
  console.log(`Extracted ${results.length} photos with descriptions!`);
  results.slice(0, 10).forEach(r => {
    console.log(`- [${r.desc}] => ${r.url}`);
  });
}
test();

