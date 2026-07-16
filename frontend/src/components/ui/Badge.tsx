import clsx from "clsx";
import type { ReactNode } from "react";

type BadgeTone = "bestseller" | "new" | "factory-price" | "warning" | "trust";

const toneClasses: Record<BadgeTone, string> = {
  bestseller: "bg-[var(--color-primary-soft)] text-[#963B26]",
  new: "bg-[rgba(74,93,70,0.12)] text-[var(--color-accent-2)]",
  "factory-price": "bg-[var(--color-primary-soft)] text-[#963B26]",
  warning: "bg-[var(--color-warning-soft)] text-[var(--color-warning-text)]",
  trust: "bg-[var(--color-surface)]/90 text-[var(--color-foreground)] shadow-[var(--shadow-sm)]",
};

export function Badge({
  tone,
  children,
  icon,
  className,
}: {
  tone: BadgeTone;
  children: ReactNode;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-[var(--radius-full)] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.06em] whitespace-nowrap",
        toneClasses[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
