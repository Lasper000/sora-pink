async function run() {
  const res = await fetch('https://unsplash.com/s/photos/cosmetic-packaging');
  const html = await res.text();
  console.log('HTML size:', html.length);
  // Find all <script> tags
  const scripts = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g) || [];
  console.log('Script count:', scripts.length);
  for (let i = 0; i < scripts.length; i++) {
    const s = scripts[i];
    if (s.includes('photos') || s.includes('urls') || s.includes('description') || s.includes('alt_description')) {
      console.log(`Script ${i} matches! Length: ${s.length}, snippet: ${s.slice(0, 150)}...`);
    }
  }
}
run();

