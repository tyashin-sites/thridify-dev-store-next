// Single point of change for every Tyashin public-API call (server + client).
import type { ApiProduct, ApiCategory, ProductView } from './types';

const API_URL = process.env.NEXT_PUBLIC_TYASHIN_API_URL || 'https://website-api.tyashin.com';
const STOREFRONT =
  process.env.NEXT_PUBLIC_TYASHIN_STOREFRONT_URL || `${API_URL}/api/v1/public/ecommerce`;
const API_KEY =
  process.env.NEXT_PUBLIC_TYASHIN_API_KEY || process.env.TYASHIN_API_KEY || '';

type FetchOpts = RequestInit & { next?: { revalidate?: number }; cache?: RequestCache };

async function apiFetch<T>(path: string, opts: FetchOpts = {}): Promise<T> {
  const res = await fetch(`${STOREFRONT}${path}`, {
    ...opts,
    headers: { 'X-API-Key': API_KEY, Accept: 'application/json', ...(opts.headers as Record<string, string>) },
    next: opts.next ?? { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`Tyashin API ${path} -> ${res.status}`);
  const json = (await res.json()) as { success: boolean; data: T };
  return json.data;
}

export interface StoreInfo {
  storeName?: string;
  currency: string;
  storeEmail?: string;
}

export async function getStoreInfo(): Promise<StoreInfo> {
  try {
    return await apiFetch<StoreInfo>('/store-info');
  } catch {
    return { currency: 'INR' };
  }
}

export async function listProducts(params: {
  limit?: number;
  page?: number;
  category?: string;
  sortBy?: 'name' | 'price' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<ApiProduct[]> {
  const qs = new URLSearchParams();
  if (params.limit) qs.set('limit', String(params.limit));
  if (params.page) qs.set('page', String(params.page));
  if (params.category) qs.set('category', params.category);
  qs.set('sortBy', params.sortBy ?? 'createdAt');
  qs.set('sortOrder', params.sortOrder ?? 'desc');
  qs.set('status', 'active');
  try {
    return await apiFetch<ApiProduct[]>(`/products?${qs.toString()}`);
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<ApiProduct | null> {
  try {
    return await apiFetch<ApiProduct>(`/products/${encodeURIComponent(slug)}`);
  } catch {
    return null;
  }
}

export async function getRelated(slug: string, limit = 4): Promise<ApiProduct[]> {
  try {
    // This endpoint returns `{ products: [...] }` with a `thumbnailUrl` (not the full images array).
    const data = await apiFetch<any>(`/products/${encodeURIComponent(slug)}/related?limit=${limit}`);
    const arr: any[] = Array.isArray(data) ? data : (data?.products ?? []);
    return arr.map((r) => ({
      ...r,
      images: Array.isArray(r.images) && r.images.length
        ? r.images
        : r.thumbnailUrl
          ? [{ url: r.thumbnailUrl, isPrimary: true, order: 0 }]
          : [],
    })) as ApiProduct[];
  } catch {
    return [];
  }
}

export async function listCategories(): Promise<ApiCategory[]> {
  try {
    return await apiFetch<ApiCategory[]>('/categories');
  } catch {
    return [];
  }
}

export function formatPrice(amountMinor: number | undefined, currency: string): string | null {
  if (!amountMinor || amountMinor <= 0) return null; // 0 => "price on request"
  try {
    return new Intl.NumberFormat(currency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(0)} ${currency}`;
  }
}

// View transform for display. `productKey` is the SEMANTIC id Thridify binds to
// (SKU, falling back to name) — never the Mongo _id.
export function toView(p: ApiProduct, categories: ApiCategory[] = [], currency = 'INR'): ProductView {
  const primary = p.images?.find((i) => i.isPrimary) ?? p.images?.[0];
  const cat = categories.find((c) => c.id === p.categoryId || (c as any)._id === p.categoryId);
  return {
    slug: p.slug,
    name: p.name,
    sku: p.sku ?? '',
    productKey: p.sku || p.name,
    shortDescription: p.shortDescription ?? '',
    description: p.description ?? '',
    image: primary?.url ?? '',
    imageAlt: primary?.alt ?? p.name,
    category: cat?.name,
    categorySlug: cat?.slug,
    tags: p.tags ?? [],
    priceLabel: formatPrice(p.price, currency),
  };
}
