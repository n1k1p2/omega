import Link from "next/link";

/**
 * Согласие на обработку персональных данных (152-ФЗ) — обязательный элемент
 * под каждой формой, где собирается телефон/email (правка В12 дизайн-системы).
 */
export function PrivacyConsent({ className = "" }: { className?: string }) {
  return (
    <p className={`text-xs text-[var(--color-foreground-muted)] ${className}`}>
      Нажимая кнопку, вы соглашаетесь с{" "}
      <Link href="/privacy" className="underline hover:text-[var(--color-primary)]">
        политикой обработки персональных данных
      </Link>
    </p>
  );
}
