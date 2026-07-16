import Image from "next/image";
import Link from "next/link";
import type { Category } from "@/types/catalog";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container-omega">
        <Reveal className="mb-8 flex items-end justify-between md:mb-12">
          <h2 className="font-display text-[26px] font-semibold md:text-[36px]">Категории каталога</h2>
        </Reveal>

        {/* Mobile: горизонтальный свайп */}
        <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 no-scrollbar md:hidden">
          {categories.map((cat) => (
            <CategoryTile key={cat.slug} category={cat} className="w-[85%] shrink-0 snap-start" />
          ))}
        </div>

        {/* Desktop: сетка 3+2 */}
        <RevealGroup className="hidden grid-cols-3 gap-6 md:grid" amount={0.2}>
          {categories.map((cat, i) => (
            <RevealItem key={cat.slug} className={i === 0 ? "col-span-2 row-span-2" : ""}>
              <CategoryTile category={cat} className={i === 0 ? "aspect-[4/3]" : "aspect-[4/3]"} />
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

function CategoryTile({ category, className = "" }: { category: Category; className?: string }) {
  return (
    <Link
      href={`/catalog/${category.slug}`}
      className={`group relative block aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-md)] transition-shadow duration-300 hover:shadow-[var(--shadow-lg)] ${className}`}
    >
      {category.image && (
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 768px) 85vw, 33vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[rgba(42,33,24,0.75)] via-[rgba(42,33,24,0.1)] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5">
        <h3 className="font-display text-xl font-semibold text-white md:text-2xl">{category.name}</h3>
        <p className="mt-1 text-sm text-white/85">{category.product_count} моделей</p>
        <span className="mt-2 inline-block translate-y-1 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Смотреть все →
        </span>
      </div>
    </Link>
  );
}
