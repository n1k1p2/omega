import type { ProductCard as ProductCardType } from "@/types/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function RelatedProducts({ products }: { products: ProductCardType[] }) {
  if (products.length === 0) return null;
  return (
    <div>
      <h2 className="mb-6 font-display text-2xl font-semibold">Похожие модели</h2>
      <RevealGroup className="flex gap-5 overflow-x-auto pb-2 no-scrollbar sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-4" amount={0.1}>
        {products.map((p) => (
          <RevealItem key={p.id} className="w-[75%] shrink-0 sm:w-auto">
            <ProductCard product={p} />
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  );
}
