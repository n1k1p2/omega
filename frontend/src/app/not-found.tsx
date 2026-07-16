import Link from "next/link";
import { SearchX } from "lucide-react";
import { getCategories } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default async function NotFound() {
  const categories = await getCategories();

  return (
    <div className="container-omega flex flex-col items-center py-20 text-center md:py-28">
      <SearchX size={48} className="mb-6 text-[var(--color-foreground-muted)]" />
      <p className="font-display text-[64px] font-bold leading-none text-[var(--color-primary)] md:text-[96px]">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold md:text-3xl">Страница не найдена</h1>
      <p className="mt-3 max-w-md text-[var(--color-foreground-muted)]">
        Возможно, страница была перемещена или адрес введён с ошибкой. Попробуйте найти нужный товар через поиск
        или посмотрите каталог.
      </p>

      <form action="/search" className="mt-8 w-full max-w-md">
        <div className="flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <SearchX size={18} className="shrink-0 text-[var(--color-foreground-muted)]" />
          <input
            type="search"
            name="q"
            placeholder="Найти диван, кровать, шкаф…"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-foreground-muted)]"
          />
        </div>
      </form>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
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

      <Link href="/" className="mt-10">
        <Button variant="primary" size="l">
          На главную
        </Button>
      </Link>
    </div>
  );
}
