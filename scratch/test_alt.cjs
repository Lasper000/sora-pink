async function run() {
  const res = await fetch('https://unsplash.com/s/photos/cosmetic-product');
  const html = await res.text();
  const imgs = html.match(/<img[^>]+>/g) || [];
  console.log('Total img tags:', imgs.length);
  imgs.slice(0, 10).forEach((tag, i) => {
    console.log(`[${i}] ${tag.slice(0, 160)}...`);
  });
}
run();
