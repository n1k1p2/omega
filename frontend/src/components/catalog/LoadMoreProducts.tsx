"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { ProductGrid } from "@/components/catalog/ProductGrid";
import { getProducts } from "@/lib/api";
import type { ProductCard, ProductListParams } from "@/types/catalog";

export function LoadMoreProducts({
  initialProducts,
  hasNext,
  params,
}: {
  initialProducts: ProductCard[];
  hasNext: boolean;
  params: ProductListParams;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [canLoadMore, setCanLoadMore] = useState(hasNext);
  const [isPending, startTransition] = useTransition();

  function handleLoadMore() {
    startTransition(async () => {
      const nextPage = page + 1;
      const res = await getProducts({ ...params, page: nextPage });
      setProducts((prev) => [...prev, ...res.results]);
      setPage(nextPage);
      setCanLoadMore(!!res.next);
    });
  }

  return (
    <>
      <ProductGrid products={products} />
      {canLoadMore && (
        <div className="mt-10 flex justify-center">
          <Button variant="secondary" size="l" onClick={handleLoadMore} disabled={isPending}>
            {isPending ? "Загружаем…" : "Показать ещё товары"}
          </Button>
        </div>
      )}
    </>
  );
}
