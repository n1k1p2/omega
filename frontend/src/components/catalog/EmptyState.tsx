import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function EmptyState({
  title = "Ничего не найдено",
  description = "Попробуйте изменить фильтры или посмотрите весь каталог.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16 text-center">
      <PackageSearch size={40} className="text-[var(--color-foreground-muted)]" />
      <div>
        <p className="font-display text-xl font-semibold">{title}</p>
        <p className="mt-1 text-[var(--color-foreground-muted)]">{description}</p>
      </div>
      <Link href="/catalog">
        <Button variant="primary">Смотреть весь каталог</Button>
      </Link>
    </div>
  );
}
