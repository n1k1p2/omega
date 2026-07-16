/**
 * Типы данных каталога — строго по docs/api-contract.md.
 * Используются и для реального ответа API, и для статического фолбэка
 * (src/data/products.json), поэтому не должны зависеть от деталей фолбэка.
 */

export interface Category {
  slug: string;
  name: string;
  product_count: number;
  image: string | null;
  description: string;
}

/** Краткая карточка товара — GET /products/ (results[]) */
export interface ProductCard {
  id: number;
  slug: string;
  name: string;
  category: { slug: string; name: string };
  price: number | null;
  price_max: number | null;
  image: string | null;
  image_hover: string | null;
  dimensions: string | null;
  is_bestseller: boolean;
  is_new: boolean;
  in_stock: boolean;
  rating: number | null;
  reviews_count: number;
  colors: string[];
}

/** Полная карточка товара — GET /products/<slug>/ */
export interface Product extends ProductCard {
  description: string;
  images: string[];
  features: Record<string, string>;
  sizes: string[];
  related: ProductCard[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ProductListParams {
  category?: string;
  search?: string;
  ordering?: "price" | "-price" | "name" | "-created_at" | "popular";
  is_bestseller?: boolean;
  is_new?: boolean;
  min_price?: number;
  max_price?: number;
  page?: number;
}

export interface Review {
  id: number;
  author: string;
  rating: number;
  text: string;
  created_at: string;
}

export interface ReviewCreatePayload {
  product_slug: string;
  author: string;
  rating: number;
  text: string;
}

export interface CallbackPayload {
  name: string;
  phone: string;
  comment?: string;
  product_slug?: string | null;
}

export interface CallbackResponse {
  id: number;
  status: string;
}

export interface OrderItemPayload {
  product_slug: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface OrderPayload {
  name: string;
  phone: string;
  email?: string;
  city: string;
  address?: string;
  comment?: string;
  items: OrderItemPayload[];
}

export interface OrderResponse {
  id: number;
  number: string;
  total: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  product: ProductCard;
  quantity: number;
  price: number;
  size?: string;
  color?: string;
}

export interface Order {
  id: number;
  number: string;
  status: string;
  status_display: string;
  total: number;
  created_at: string;
  items: OrderItem[];
}

export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  address?: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  phone: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenPair {
  access: string;
  refresh: string;
}
