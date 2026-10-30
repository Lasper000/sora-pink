async function test() {
  const res = await fetch('https://unsplash.com/s/photos/cosmetics-packaging');
  const html = await res.text();
  
  const figures = html.split('<figure');
  
  for (let i = 1; i <= 5; i++) {
    const fig = figures[i];
    const descMatch = fig.match(/<meta itemProp="description" content="([^"]+)"/);
    // Find img with photo- or premium_photo-
    const imgMatch = fig.match(/(https:\/\/(images|plus)\.unsplash\.com\/(premium_)?photo-[0-9a-zA-Z_-]+)\?/);
    console.log(`[${i}]`);
    console.log(`  DESC: ${descMatch ? descMatch[1] : 'none'}`);
    console.log(`  PHOTO: ${imgMatch ? imgMatch[1] : 'none'}`);
  }
}
test();

