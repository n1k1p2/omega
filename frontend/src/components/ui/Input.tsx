import { forwardRef } from "react";
import type { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-foreground-muted)]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={clsx(
          "h-12 rounded-[var(--radius-sm)] border-[1.5px] bg-[var(--color-surface)] px-4 text-base text-[var(--color-foreground)] outline-none transition-colors",
          "placeholder:text-[var(--color-foreground-muted)]/70",
          "focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(181,72,47,0.12)]",
          error ? "border-[var(--color-destructive)]" : "border-[var(--color-border)]",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, className, id, ...props },
  ref,
) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-foreground-muted)]">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        className={clsx(
          "min-h-24 rounded-[var(--radius-sm)] border-[1.5px] bg-[var(--color-surface)] px-4 py-3 text-base text-[var(--color-foreground)] outline-none transition-colors",
          "placeholder:text-[var(--color-foreground-muted)]/70",
          "focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[rgba(181,72,47,0.12)]",
          error ? "border-[var(--color-destructive)]" : "border-[var(--color-border)]",
          className,
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
