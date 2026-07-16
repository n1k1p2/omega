"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL } from "@/lib/api";

function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  // Автофокус только на desktop — значение читается из эффекта (не в рендере),
  // иначе SSR (window недоступен) и клиент разойдутся в hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(window.innerWidth >= 1024);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Введите корректный email";
    if (!password) nextErrors.password = "Введите пароль";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setApiError(null);
    try {
      await login({ email, password });
      const redirectTo = searchParams.get("redirect") || "/account";
      router.push(redirectTo);
    } catch {
      setApiError("Неверный email или пароль. Проверьте данные и попробуйте снова.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-omega flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md)] md:p-8">
        <h1 className="mb-1 font-display text-2xl font-semibold">Вход в личный кабинет</h1>
        <p className="mb-6 text-sm text-[var(--color-foreground-muted)]">
          Следите за статусом заказов и управляйте своими данными
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@mail.ru"
            autoFocus={isDesktop}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          {apiError && (
            <p className="rounded-[var(--radius-sm)] bg-[var(--color-warning-soft)] p-3 text-sm text-[var(--color-warning-text)]">
              {apiError}
            </p>
          )}

          <Button type="submit" variant="primary" size="l" fullWidth disabled={submitting}>
            {submitting ? "Входим…" : "Войти"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-foreground-muted)]">
          Ещё нет аккаунта?{" "}
          <Link href="/register" className="font-semibold text-[var(--color-primary)] hover:underline">
            Зарегистрироваться
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-[var(--color-foreground-muted)]">
          Нужна помощь со входом? Позвоните нам:{" "}
          <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold underline">
            {SUPPORT_PHONE}
          </a>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
