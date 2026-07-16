import type { ProductCard as ProductCardType } from "@/types/catalog";
import { ProductCard } from "./ProductCard";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Каталожная сетка может содержать 12-24+ карточек одновременно на экране —
 * per-card scroll-reveal с индивидуальным IntersectionObserver нарушил бы
 * ограничение §6 "не более 2-3 одновременных scroll-triggered анимаций"
 * (CRO-чеклист: риск просадки FPS/INP на слабых Android). Поэтому вся сетка
 * получает один лёгкий групповой fade+lift при первом появлении, без stagger
 * по каждой карточке — карточки уже несут собственную hover-физику (4.1).
 */
export function ProductGrid({ products }: { products: ProductCardType[] }) {
  if (products.length === 0) return null;
  return (
    <Reveal
      className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 xl:gap-6"
      amount={0.05}
      duration={0.5}
    >
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </Reveal>
  );
}
