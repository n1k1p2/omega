import clsx from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className, children, ...props }: ChipProps) {
  return (
    <button
      type="button"
      className={clsx(
        "min-h-11 rounded-[var(--radius-full)] px-4 text-sm font-medium transition-all duration-200 border cursor-pointer active:scale-[0.97]",
        active
          ? "text-white border-transparent"
          : "bg-[var(--color-surface-sunken)] text-[var(--color-foreground)] border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:scale-[1.03]",
        className,
      )}
      style={active ? { background: "var(--gradient-amber)" } : undefined}
      {...props}
    >
      {children}
    </button>
  );
}
