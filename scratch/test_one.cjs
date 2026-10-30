async function test() {
  const res = await fetch('https://unsplash.com/s/photos/cosmetics');
  console.log('Status:', res.status);
  const text = await res.text();
  console.log('Length:', text.length);
  const regex = /https:\/\/(images|plus)\.unsplash\.com\/(premium_)?photo-[0-9-]+[a-z0-9]+/gi;
  const matches = text.match(regex) || [];
  console.log('Matches:', matches.length);
}
test();

