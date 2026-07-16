import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "accent-outline" | "dark";
type Size = "s" | "m" | "l";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-[var(--color-primary)] text-white shadow-[0_0_0_0_rgba(181,72,47,0)] hover:bg-[var(--color-primary-hover)] hover:shadow-[0_8px_24px_-4px_rgba(181,72,47,0.45)] disabled:hover:bg-[var(--color-primary)] disabled:hover:shadow-none",
  secondary:
    "bg-[var(--color-surface)] text-[var(--color-foreground)] border-[1.5px] border-[var(--color-border-strong)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]",
  ghost:
    "bg-transparent text-[var(--color-foreground)] hover:bg-[var(--color-background-alt)]",
  "accent-outline":
    "bg-transparent text-[var(--color-accent)] border-[1.5px] border-[var(--color-accent)] hover:bg-[var(--color-accent)]/10",
  dark: "bg-[var(--color-dark)] text-white hover:bg-[var(--color-dark-surface)]",
};

const sizeClasses: Record<Size, string> = {
  s: "h-9 px-3.5 text-sm rounded-[var(--radius-md)]",
  m: "h-12 px-5 text-base rounded-[var(--radius-md)]",
  l: "h-14 px-7 text-lg rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "m", fullWidth, className, children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={clsx(
        "inline-flex items-center justify-center gap-2 font-semibold tracking-[0.01em] transition-[background-color,box-shadow,transform,color,border-color] duration-[180ms] ease-out active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer",
        variant === "primary" && size === "l" && "hover:scale-[1.02]",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
});
