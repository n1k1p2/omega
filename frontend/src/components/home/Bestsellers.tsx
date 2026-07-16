import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/types/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function Bestsellers({ products }: { products: ProductCardType[] }) {
  if (products.length === 0) return null;
  return (
    <section className="bg-[var(--color-background-alt)] py-16 md:py-24">
      <div className="container-omega">
        <Reveal className="mb-8 flex items-end justify-between md:mb-12">
          <div>
            <h2 className="font-display text-[26px] font-semibold md:text-[36px]">Хиты продаж</h2>
            <p className="mt-1 text-[var(--color-foreground-muted)]">Модели, которые выбирают чаще всего</p>
          </div>
          <Link href="/catalog?bestseller=1" className="hidden shrink-0 text-sm font-semibold hover:text-[var(--color-primary)] sm:block">
            Смотреть все →
          </Link>
        </Reveal>

        <RevealGroup className="flex gap-5 overflow-x-auto pb-2 no-scrollbar md:grid md:grid-cols-4 md:overflow-visible" amount={0.1}>
          {products.slice(0, 8).map((p) => (
            <RevealItem key={p.id} className="w-[78%] shrink-0 sm:w-[45%] md:w-auto">
              <ProductCard product={p} />
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/catalog?bestseller=1" className="text-sm font-semibold hover:text-[var(--color-primary)]">
            Смотреть все →
          </Link>
        </div>
      </div>
    </section>
  );
}
