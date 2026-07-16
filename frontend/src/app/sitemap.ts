import type { MetadataRoute } from "next";
import { getCategories, getProducts } from "@/lib/api";

const BASE_URL = "https://mebel-omega.ru";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, productsRes] = await Promise.all([
    getCategories(),
    getProducts({ page: 1 }),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/catalog`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/delivery`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contacts`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/faq`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${BASE_URL}/catalog/${c.slug}`,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // Догружаем все страницы товаров (page_size=24) — 101 товар умещается в ~5 запросов.
  const allProducts = [...productsRes.results];
  let nextPage = productsRes.next ? 2 : null;
  while (nextPage) {
    const res = await getProducts({ page: nextPage });
    allProducts.push(...res.results);
    nextPage = res.next ? nextPage + 1 : null;
  }

  const productRoutes: MetadataRoute.Sitemap = allProducts.map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
