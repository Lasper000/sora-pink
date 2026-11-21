import type { Product } from '../types';

export const DEFAULT_PAGE_TITLE = 'SORA PINK โซระ พิ้งค์ | เครื่องสำอาง สกินแคร์ & ดูแลผิวกายครบวงจร';

/**
 * Generates canonical, shareable full URL for a product
 */
export function getProductShareUrl(productId: string): string {
  if (typeof window === 'undefined') return '';
  const origin = window.location.origin;
  return `${origin}/product/${encodeURIComponent(productId)}`;
}

/**
 * Extracts product ID or slug from current URL (supports /product/:id, ?product=:id, #/product/:id)
 */
export function getProductIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Check pathname: /product/:id or /products/:id
  const pathname = window.location.pathname;
  const pathMatch = pathname.match(/^\/products?\/([^/?#]+)/i);
  if (pathMatch && pathMatch[1]) {
    return decodeURIComponent(pathMatch[1]);
  }

  // 2. Check query string: ?product=:id or ?p=:id or ?productId=:id
  const searchParams = new URLSearchParams(window.location.search);
  const queryParam = searchParams.get('product') || searchParams.get('p') || searchParams.get('productId');
  if (queryParam) {
    return decodeURIComponent(queryParam);
  }

  // 3. Check hash: #/product/:id or #product-:id
  const hash = window.location.hash;
  const hashMatch = hash.match(/^#\/?products?[-/]([^/?#]+)/i);
  if (hashMatch && hashMatch[1]) {
    return decodeURIComponent(hashMatch[1]);
  }

  return null;
}

/**
 * Helper to slugify product names for matching
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u0E00-\u0E7F-]+/g, '')
    .replace(/--+/g, '-');
}

/**
 * Finds product by ID or slug/name from array
 */
export function findProductFromList(products: Product[], param: string): Product | undefined {
  if (!param || !products || products.length === 0) return undefined;
  const cleanedParam = param.trim().toLowerCase();

  // 1. Exact ID match
  const byId = products.find((p) => p.id === param || p.id.toLowerCase() === cleanedParam);
  if (byId) return byId;

  // 2. Slug / name match
  return products.find((p) => {
    const slug = slugify(p.name);
    return slug === cleanedParam || p.name.toLowerCase() === cleanedParam;
  });
}

/**
 * Update browser title with product name and optionally inject Product JSON-LD for SEO
 */
export function setDocumentProductTitle(productName?: string, product?: Product): void {
  if (typeof document === 'undefined') return;
  if (productName) {
    document.title = `${productName} | SORA PINK โซระ พิ้งค์`;
  } else {
    document.title = DEFAULT_PAGE_TITLE;
  }

  const existing = document.getElementById('sora-product-jsonld');
  if (!product) {
    if (existing) existing.remove();
    return;
  }

  const price = product.discount_price ?? product.price;
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images || [],
    description: product.description,
    sku: product.id,
    brand: { '@type': 'Brand', name: 'SORA PINK' },
    offers: {
      '@type': 'Offer',
      url: getProductShareUrl(product.id),
      priceCurrency: 'THB',
      price: Number(price).toFixed(2),
      availability:
        product.stock_quantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
    ...(product.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: Number(product.rating).toFixed(1),
            reviewCount: Math.max(1, product.review_count || 1),
          },
        }
      : {}),
  };

  let scriptEl = existing as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'sora-product-jsonld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }
  scriptEl.textContent = JSON.stringify(schemaData);
}

/**
 * Reset browser title back to default and remove Product JSON-LD
 */
export function resetDocumentTitle(): void {
  if (typeof document === 'undefined') return;
  document.title = DEFAULT_PAGE_TITLE;
  const existing = document.getElementById('sora-product-jsonld');
  if (existing) existing.remove();
}

/**
 * Bulletproof clipboard copy with modern API and fallback for mobile in-app browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to fallback
    }
  }

  try {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.top = '-9999px';
    textArea.style.left = '-9999px';
    textArea.setAttribute('readonly', '');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.warn('Fallback copy failed:', err);
    return false;
  }
}

