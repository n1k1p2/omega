import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategories, getProducts } from "@/lib/api";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { CatalogControls } from "@/components/catalog/CatalogControls";
import { LoadMoreProducts } from "@/components/catalog/LoadMoreProducts";
import { EmptyState } from "@/components/catalog/EmptyState";
import type { ProductListParams } from "@/types/catalog";

interface PageParams {
  category: string;
}

interface PageSearchParams {
  ordering?: string;
  min_price?: string;
  max_price?: string;
  bestseller?: string;
  new?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { category } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) return {};
  return {
    title: `${cat.name} — купить недорого от фабрики Омега`,
    description: cat.description,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<PageParams>;
  searchParams: Promise<PageSearchParams>;
}) {
  const { category } = await params;
  const sp = await searchParams;

  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === category);
  if (!cat) notFound();

  const listParams: ProductListParams = {
    category,
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
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: "Каталог", href: "/catalog" },
            { label: cat.name },
          ]}
        />
      </div>

      <div className="mb-6">
        <h1 className="font-display text-[32px] font-bold md:text-[48px]">{cat.name}</h1>
        <p className="mt-2 max-w-2xl text-[var(--color-foreground-muted)]">{cat.description}</p>
        <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{res.count} моделей</p>
      </div>

      <CatalogControls />

      {res.results.length === 0 ? (
        <EmptyState description="В этой категории с такими фильтрами товаров не нашлось. Попробуйте изменить цену или посмотрите весь каталог." />
      ) : (
        <LoadMoreProducts initialProducts={res.results} hasNext={!!res.next} params={listParams} />
      )}
    </div>
  );
}
