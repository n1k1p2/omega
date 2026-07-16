import fallbackData from "@/data/products.json";
import type {
  CallbackPayload,
  CallbackResponse,
  Category,
  LoginPayload,
  Order,
  OrderPayload,
  OrderResponse,
  PaginatedResponse,
  Product,
  ProductCard,
  ProductListParams,
  RegisterPayload,
  Review,
  ReviewCreatePayload,
  TokenPair,
  AuthUser,
} from "@/types/catalog";

/**
 * Слой доступа к API — единственная точка входа для всех каталожных
 * и заявочных запросов (docs/api-contract.md).
 *
 * Фолбэк: если API недоступен (сеть/таймаут/5xx), каталожные функции
 * (getCategories/getProducts/getProduct/getReviews) молча откатываются на
 * статический src/data/products.json — сайт остаётся живым без бэкенда
 * (это штатный режим по контракту, а не аварийный).
 *
 * Заявочные функции (postCallback/postOrder/postReview) при недоступном API
 * бросают ApiUnavailableError — компоненты обязаны показать честное сообщение
 * с телефоном +7 (930) 357-07-75, а не притворяться, что заявка ушла.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:8000/api/v1";
const TIMEOUT_MS = 3000;

export const SUPPORT_PHONE = "+7 (930) 357-07-75";
export const SUPPORT_PHONE_TEL = "+79303570775";
export const SUPPORT_EMAIL = "omega.zakaz@mail.ru";
export const SUPPORT_HOURS = "Пн–Пт 10:00–18:00 МСК";

export class ApiUnavailableError extends Error {
  constructor(message = "Сервис временно недоступен") {
    super(message);
    this.name = "ApiUnavailableError";
  }
}

/**
 * Валидационная ошибка от DRF (HTTP 400) — данные конкретны (например,
 * "неверный формат телефона"), сервис при этом доступен и работает.
 * Отличается от ApiUnavailableError: UI должен показать `fieldErrors`
 * рядом с полями формы, а не общее "звоните нам" (см. правку по код-ревью).
 */
export class ApiValidationError extends Error {
  fieldErrors: Record<string, string>;
  constructor(fieldErrors: Record<string, string>, message = "Проверьте правильность заполнения формы") {
    super(message);
    this.name = "ApiValidationError";
    this.fieldErrors = fieldErrors;
  }
}

function flattenDrfErrors(body: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (body && typeof body === "object") {
    for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
      if (Array.isArray(value)) {
        out[key] = value.map(String).join(" ");
      } else if (typeof value === "string") {
        out[key] = value;
      }
    }
  }
  return out;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    });
    if (!res.ok) {
      // 400 — валидационная ошибка DRF: сервис жив, данные некорректны.
      // Пробрасываем отдельным типом ошибки, чтобы UI показал конкретное
      // поле с ошибкой, а не общее "сервис недоступен, позвоните".
      if (res.status === 400) {
        let body: unknown = null;
        try {
          body = await res.json();
        } catch {
          // не JSON — не сможем разобрать поля, упадём в общую ветку ниже
        }
        if (body) {
          throw new ApiValidationError(flattenDrfErrors(body));
        }
      }
      let detail = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        detail = body?.detail || JSON.stringify(body);
      } catch {
        // не JSON — оставляем detail как есть
      }
      throw new Error(detail);
    }
    if (res.status === 204) return undefined as T;
    return (await res.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

// ---------------------------------------------------------------------------
// Фолбэк-данные (src/data/products.json, сгенерированы scripts/build-fallback.mjs)
// ---------------------------------------------------------------------------

interface FallbackProduct extends ProductCard {
  _description: string;
  _images: string[];
  _features: Record<string, string>;
  _sizes: string[];
}

interface FallbackData {
  categories: Category[];
  products: FallbackProduct[];
  reviewsBySlug: Record<string, Review[]>;
}

const FALLBACK = fallbackData as unknown as FallbackData;

function toProductCard(p: FallbackProduct): ProductCard {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _description, _images, _features, _sizes, ...card } = p;
  return card;
}

function toFullProduct(p: FallbackProduct): Product {
  const related = FALLBACK.products
    .filter((x) => x.category.slug === p.category.slug && x.slug !== p.slug)
    .slice(0, 4)
    .map(toProductCard);

  return {
    ...toProductCard(p),
    description: p._description,
    images: p._images.length ? p._images : p.image ? [p.image] : [],
    features: p._features,
    sizes: p._sizes,
    related,
  };
}

function fallbackCategories(): Category[] {
  return FALLBACK.categories;
}

function fallbackProducts(params: ProductListParams = {}): PaginatedResponse<ProductCard> {
  let items = FALLBACK.products.slice();

  if (params.category) {
    items = items.filter((p) => p.category.slug === params.category);
  }
  if (params.search) {
    const q = params.search.toLowerCase();
    items = items.filter(
      (p) => p.name.toLowerCase().includes(q) || p._description.toLowerCase().includes(q),
    );
  }
  if (params.is_bestseller) {
    items = items.filter((p) => p.is_bestseller);
  }
  if (params.is_new) {
    items = items.filter((p) => p.is_new);
  }
  if (typeof params.min_price === "number") {
    items = items.filter((p) => (p.price ?? 0) >= params.min_price!);
  }
  if (typeof params.max_price === "number") {
    items = items.filter((p) => (p.price ?? 0) <= params.max_price!);
  }

  switch (params.ordering) {
    case "price":
      items.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      break;
    case "-price":
      items.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      break;
    case "name":
      items.sort((a, b) => a.name.localeCompare(b.name, "ru"));
      break;
    case "-created_at":
      // фолбэк не хранит created_at — новинки вперёд, затем по id убыв.
      items.sort((a, b) => Number(b.is_new) - Number(a.is_new) || b.id - a.id);
      break;
    case "popular":
    default:
      items.sort((a, b) => Number(b.is_bestseller) - Number(a.is_bestseller) || a.id - b.id);
      break;
  }

  const pageSize = 24;
  const page = params.page && params.page > 0 ? params.page : 1;
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize).map(toProductCard);

  return {
    count: items.length,
    next: start + pageSize < items.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
    results: pageItems,
  };
}

function fallbackProduct(slug: string): Product | null {
  const found = FALLBACK.products.find((p) => p.slug === slug);
  return found ? toFullProduct(found) : null;
}

// ---------------------------------------------------------------------------
// Каталог (публичные эндпоинты, с фолбэком)
// ---------------------------------------------------------------------------

export async function getCategories(): Promise<Category[]> {
  try {
    return await apiFetch<Category[]>("/categories/");
  } catch {
    return fallbackCategories();
  }
}

function buildQuery(params: ProductListParams): string {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.search) sp.set("search", params.search);
  if (params.ordering) sp.set("ordering", params.ordering);
  if (params.is_bestseller) sp.set("is_bestseller", "true");
  if (params.is_new) sp.set("is_new", "true");
  if (typeof params.min_price === "number") sp.set("min_price", String(params.min_price));
  if (typeof params.max_price === "number") sp.set("max_price", String(params.max_price));
  if (params.page) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function getProducts(
  params: ProductListParams = {},
): Promise<PaginatedResponse<ProductCard>> {
  try {
    return await apiFetch<PaginatedResponse<ProductCard>>(`/products/${buildQuery(params)}`);
  } catch {
    return fallbackProducts(params);
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await apiFetch<Product>(`/products/${slug}/`);
  } catch {
    return fallbackProduct(slug);
  }
}

// ---------------------------------------------------------------------------
// Заявки (публичные) — без фолбэка на статику: при недоступности API кидаем
// ApiUnavailableError, UI обязан показать честную ошибку с телефоном.
// ---------------------------------------------------------------------------

export async function postCallback(payload: CallbackPayload): Promise<CallbackResponse> {
  try {
    return await apiFetch<CallbackResponse>("/callbacks/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (e) {
    throw new ApiUnavailableError(
      e instanceof Error ? e.message : "Не удалось отправить заявку",
    );
  }
}

// ---------------------------------------------------------------------------
// Отзывы
// ---------------------------------------------------------------------------

export async function getReviews(productSlug: string): Promise<Review[]> {
  try {
    return await apiFetch<Review[]>(`/reviews/?product=${encodeURIComponent(productSlug)}`);
  } catch {
    return FALLBACK.reviewsBySlug[productSlug] || [];
  }
}

export async function postReview(payload: ReviewCreatePayload): Promise<void> {
  try {
    await apiFetch<unknown>("/reviews/", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (e) {
    throw new ApiUnavailableError(
      e instanceof Error ? e.message : "Не удалось отправить отзыв",
    );
  }
}

// ---------------------------------------------------------------------------
// Аутентификация (JWT)
// ---------------------------------------------------------------------------

export async function registerUser(payload: RegisterPayload): Promise<AuthUser> {
  return apiFetch<AuthUser>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function loginUser(payload: LoginPayload): Promise<TokenPair> {
  return apiFetch<TokenPair>("/auth/token/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function refreshToken(refresh: string): Promise<{ access: string }> {
  return apiFetch<{ access: string }>("/auth/token/refresh/", {
    method: "POST",
    body: JSON.stringify({ refresh }),
  });
}

export async function getMe(accessToken: string): Promise<AuthUser> {
  return apiFetch<AuthUser>("/me/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export async function updateMe(
  accessToken: string,
  payload: Partial<AuthUser>,
): Promise<AuthUser> {
  return apiFetch<AuthUser>("/me/", {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// Заказы
// ---------------------------------------------------------------------------

export async function postOrder(
  payload: OrderPayload,
  accessToken?: string,
): Promise<OrderResponse> {
  try {
    return await apiFetch<OrderResponse>("/orders/", {
      method: "POST",
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      body: JSON.stringify(payload),
    });
  } catch (e) {
    throw new ApiUnavailableError(
      e instanceof Error ? e.message : "Не удалось оформить заказ",
    );
  }
}

export async function getOrders(accessToken: string): Promise<Order[]> {
  return apiFetch<Order[]>("/orders/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
