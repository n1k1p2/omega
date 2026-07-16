import Link from "next/link";
import type { ProductCard as ProductCardType } from "@/types/catalog";
import { ProductCard } from "@/components/catalog/ProductCard";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

/**
 * "Подборщик готовых компоновок" — было «Калькулятор» в брифе, упрощено
 * (правка В13): вместо живого пересчёта — готовые SKU-компоновки шкафов
 * с их реальной ценой, взятые прямо из каталога категории shkafy.
 */
export function BundlesSection({ products }: { products: ProductCardType[] }) {
  if (products.length === 0) return null;
  return (
    <section className="bg-[var(--color-background-alt)] py-16 md:py-24">
      <div className="container-omega">
        <Reveal className="mb-8 flex items-end justify-between md:mb-12">
          <div>
            <h2 className="font-display text-[26px] font-semibold md:text-[36px]">Готовые компоновки шкафов</h2>
            <p className="mt-1 text-[var(--color-foreground-muted)]">
              Реальные модели с готовым составом секций и честной ценой
            </p>
          </div>
          <Link href="/catalog/shkafy" className="hidden shrink-0 text-sm font-semibold hover:text-[var(--color-primary)] sm:block">
            Все модели →
          </Link>
        </Reveal>

        <RevealGroup className="grid grid-cols-1 gap-5 sm:grid-cols-3" amount={0.15}>
          {products.slice(0, 3).map((p) => (
            <RevealItem key={p.id}>
              <ProductCard product={p} />
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-6 text-center sm:hidden">
          <Link href="/catalog/shkafy" className="text-sm font-semibold hover:text-[var(--color-primary)]">
            Все модели →
          </Link>
        </div>
      </div>
    </section>
  );
}
