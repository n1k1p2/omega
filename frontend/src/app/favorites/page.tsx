import type { Metadata } from "next";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Избранное",
  robots: { index: false, follow: true },
};

export default function FavoritesPage() {
  return (
    <div className="container-omega py-5 md:py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Избранное" }]} />
      </div>

      <h1 className="mb-6 font-display text-[32px] font-bold md:text-[48px]">Избранное</h1>

      <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-20 text-center">
        <Heart size={40} className="text-[var(--color-foreground-muted)]" />
        <div>
          <p className="font-display text-xl font-semibold">Пока ничего не добавлено</p>
          <p className="mt-1 text-[var(--color-foreground-muted)]">
            Нажимайте на иконку сердечка на странице товара, чтобы сохранить понравившиеся модели
          </p>
        </div>
        <Link href="/catalog">
          <Button variant="primary">Смотреть каталог</Button>
        </Link>
      </div>
    </div>
  );
}
