import type { Metadata } from "next";
import { getProducts } from "@/lib/api";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CatalogControls } from "@/components/catalog/CatalogControls";
import { LoadMoreProducts } from "@/components/catalog/LoadMoreProducts";
import { EmptyState } from "@/components/catalog/EmptyState";
import type { ProductListParams } from "@/types/catalog";

export const metadata: Metadata = {
  title: "Каталог мебели — все модели фабрики Омега",
  description: "Кровати, диваны, шкафы, тумбы, комоды и аксессуары из массива берёзы. Вся мебель фабрики Омега в одном каталоге.",
};

interface PageSearchParams {
  ordering?: string;
  min_price?: string;
  max_price?: string;
  bestseller?: string;
  new?: string;
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<PageSearchParams>;
}) {
  const sp = await searchParams;

  const listParams: ProductListParams = {
    ordering: (sp.ordering as ProductListParams["ordering"]) || "popular",
    min_price: sp.min_price ? Number(sp.min_price) : undefined,
    max_price: sp.max_price ? Number(sp.max_price) : undefined,
    is_bestseller: sp.bestseller === "1" || undefined,
    is_new: sp.new === "1" || undefined,
  };

  const res = await getProducts(listParams);

  return (
    <div className="container-omega py-5 md:py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />
      </div>

      <div className="mb-6">
        <h1 className="font-display text-[32px] font-bold md:text-[48px]">Весь каталог</h1>
        <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{res.count} моделей</p>
      </div>

      <CatalogControls />

      {res.results.length === 0 ? (
        <EmptyState />
      ) : (
        <LoadMoreProducts
          key={JSON.stringify(listParams)}
          initialProducts={res.results}
          hasNext={!!res.next}
          params={listParams}
        />
      )}
    </div>
  );
}
