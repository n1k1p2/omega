import type { Metadata } from "next";
import Link from "next/link";
import { SearchX } from "lucide-react";
import { getCategories, getProducts } from "@/lib/api";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProductGrid } from "@/components/catalog/ProductGrid";

export const metadata: Metadata = {
  title: "Результаты поиска",
  robots: { index: false, follow: true },
};

interface PageSearchParams {
  q?: string;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const { q } = await searchParams;
  const query = (q || "").trim();

  const [res, categories] = await Promise.all([
    query ? getProducts({ search: query, ordering: "popular" }) : Promise.resolve(null),
    getCategories(),
  ]);

  return (
    <div className="container-omega py-5 md:py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Поиск" }]} />
      </div>

      <h1 className="mb-2 font-display text-[28px] font-bold md:text-[36px]">
        {query ? (
          <>
            Результаты поиска: <span className="text-[var(--color-primary)]">«{query}»</span>
          </>
        ) : (
          "Поиск по каталогу"
        )}
      </h1>

      {res && (
        <p className="mb-6 text-sm text-[var(--color-foreground-muted)]">
          {res.count > 0 ? `Найдено моделей: ${res.count}` : "Ничего не найдено"}
        </p>
      )}

      {!query && (
        <p className="mb-8 text-[var(--color-foreground-muted)]">
          Введите название товара в поиске сверху страницы — например, «диван» или «кровать 160×200».
        </p>
      )}

      {query && res && res.results.length > 0 && <ProductGrid products={res.results} />}

      {query && res && res.results.length === 0 && (
        <div className="flex flex-col items-center gap-6 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16 text-center">
          <SearchX size={40} className="text-[var(--color-foreground-muted)]" />
          <div>
            <p className="font-display text-xl font-semibold">По запросу «{query}» ничего не нашлось</p>
            <p className="mt-1 text-[var(--color-foreground-muted)]">
              Проверьте написание или посмотрите популярные категории каталога
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/catalog/${c.slug}`}
                className="rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-4 py-2.5 text-sm font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
