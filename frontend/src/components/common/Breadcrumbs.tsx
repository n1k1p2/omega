import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="overflow-x-auto no-scrollbar">
      <ol className="flex items-center gap-1.5 whitespace-nowrap text-sm">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight size={14} className="text-[var(--color-border-strong)]" />}
              {isLast || !item.href ? (
                <span className="text-[var(--color-foreground)]">{item.label}</span>
              ) : (
                <Link href={item.href} className="text-[var(--color-foreground-muted)] underline-offset-2 hover:text-[var(--color-primary)] hover:underline">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
