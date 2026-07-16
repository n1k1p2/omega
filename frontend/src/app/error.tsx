"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL } from "@/lib/api";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-omega flex flex-col items-center py-20 text-center md:py-28">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-warning-soft)]">
        <AlertTriangle size={30} className="text-[var(--color-warning-text)]" />
      </div>
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Что-то пошло не так</h1>
      <p className="mt-3 max-w-md text-[var(--color-foreground-muted)]">
        Произошла непредвиденная ошибка. Попробуйте обновить страницу — если проблема повторится, позвоните нам
        напрямую.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="primary" size="l" onClick={reset}>
          Попробовать снова
        </Button>
        <Link href="/">
          <Button variant="secondary" size="l">
            На главную
          </Button>
        </Link>
      </div>

      <a
        href={`tel:${SUPPORT_PHONE_TEL}`}
        className="mt-8 font-display text-xl font-semibold text-[var(--color-primary)]"
      >
        {SUPPORT_PHONE}
      </a>
    </div>
  );
}
