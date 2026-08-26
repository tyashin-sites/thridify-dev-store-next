export interface ApiProductImage {
  url: string;
  alt?: string;
  order: number;
  isPrimary: boolean;
}

export interface ApiProduct {
  // The Tyashin ecommerce API returns the Mongo id as `_id`; `id` is not sent.
  // `_id` is the identity plugins (e.g. Thridify) resolve a product by.
  _id?: string;
  id: string;
  name: string;
  slug: string;
  sku?: string;
  description: string;
  shortDescription?: string;
  price: number;            // smallest unit (paise for INR)
  compareAtPrice?: number;
  status: 'draft' | 'active' | 'archived';
  categoryId?: string;
  tags: string[];
  images: ApiProductImage[];
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCategory {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  order: number;
  isActive: boolean;
  productCount?: number;
}

// Light view derived from ApiProduct for display purposes
export interface ProductView {
  slug: string;
  name: string;
  sku: string;
  productKey: string;         // SKU || name — the semantic id Thridify binds to
  shortDescription: string;
  description: string;
  image: string;
  imageAlt: string;
  category?: string;          // resolved category name (computed)
  categorySlug?: string;
  tags: string[];
  priceLabel: string | null;  // formatted price, or null => "Price on request"
}
