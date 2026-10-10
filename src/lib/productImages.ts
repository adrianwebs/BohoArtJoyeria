import { Product } from './types';

/**
 * Extracts a pool of product images from a list of products.
 * Prioritizes uploaded/non-stock images if available.
 */
export function getProductImagePool(products: Product[]): string[] {
  const allImages: string[] = [];
  for (const p of products) {
    if (Array.isArray(p.images)) {
      for (const img of p.images) {
        if (img && typeof img === 'string' && img.trim() !== '') {
          allImages.push(img.trim());
        }
      }
    }
  }

  // Deduplicate
  const uniqueImages = Array.from(new Set(allImages));

  // Prioritize non-unsplash uploaded images
  const nonStock = uniqueImages.filter((img) => !img.includes('unsplash.com'));
  if (nonStock.length > 0) {
    return nonStock;
  }
  return uniqueImages;
}

/**
 * Picks `count` images from the pool.
 * If the pool has fewer items than `count`, it repeats them.
 */
export function selectProductImages(pool: string[], count: number, shuffle = true): string[] {
  if (!pool || pool.length === 0) return [];
  const list = shuffle ? [...pool].sort(() => 0.5 - Math.random()) : [...pool];
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(list[i % list.length]);
  }
  return result;
}
