import { Star } from "lucide-react";
import clsx from "clsx";

/**
 * Рендерится ТОЛЬКО если rating != null (правка К3а дизайн-системы) —
 * компонент сам ничего не решает про null, эту логику держит вызывающий код,
 * этот компонент просто рисует переданное значение.
 */
export function Rating({
  value,
  reviewsCount,
  size = 14,
  className,
}: {
  value: number;
  reviewsCount?: number;
  size?: number;
  className?: string;
}) {
  return (
    <div className={clsx("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(value);
          return (
            <Star
              key={i}
              size={size}
              className={filled ? "fill-[var(--color-accent)] text-[var(--color-accent)]" : "text-[var(--color-border-strong)]"}
            />
          );
        })}
      </div>
      <span className="text-sm text-[var(--color-foreground-muted)]">
        {value.toFixed(1)}
        {typeof reviewsCount === "number" && ` (${reviewsCount} отзыв${pluralSuffix(reviewsCount)})`}
      </span>
    </div>
  );
}

function pluralSuffix(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "а";
  return "ов";
}
