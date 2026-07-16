"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PrivacyConsent } from "@/components/common/PrivacyConsent";
import { useAuth } from "@/context/AuthContext";
import { formatPhoneInput, isValidRuPhone } from "@/lib/format";

interface FormErrors {
  firstName?: string;
  phone?: string;
  email?: string;
  password?: string;
  consent?: string;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
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
    const nextErrors: FormErrors = {};
    if (!firstName.trim()) nextErrors.firstName = "Укажите, как к вам обращаться";
    if (!isValidRuPhone(phone)) nextErrors.phone = "Проверьте номер телефона";
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Введите корректный email";
    if (password.length < 6) nextErrors.password = "Минимум 6 символов";
    if (!consent) nextErrors.consent = "Нужно согласие на обработку персональных данных";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setApiError(null);
    try {
      await register({ email, password, first_name: firstName.trim(), phone });
      router.push("/account");
    } catch (err) {
      setApiError(
        err instanceof Error && err.message.toLowerCase().includes("email")
          ? "Такой email уже зарегистрирован. Попробуйте войти."
          : "Не удалось зарегистрироваться. Проверьте данные и попробуйте снова.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-omega flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-md)] md:p-8">
        <h1 className="mb-1 font-display text-2xl font-semibold">Регистрация</h1>
        <p className="mb-6 text-sm text-[var(--color-foreground-muted)]">
          Создайте аккаунт, чтобы отслеживать заказы и не вводить данные заново
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Имя"
            placeholder="Иван"
            autoFocus={isDesktop}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={errors.firstName}
          />
          <Input
            label="Телефон"
            placeholder="+7 (___) ___-__-__"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            error={errors.phone}
          />
          <Input
            label="Email"
            type="email"
            placeholder="you@mail.ru"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="Пароль"
            type="password"
            placeholder="Минимум 6 символов"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
          />

          <label className="flex cursor-pointer items-start gap-2.5 text-xs text-[var(--color-foreground-muted)]">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
            />
            <PrivacyConsent />
          </label>
          {errors.consent && (
            <p className="text-sm text-[var(--color-destructive)]" role="alert">
              {errors.consent}
            </p>
          )}

          {apiError && (
            <p className="rounded-[var(--radius-sm)] bg-[var(--color-warning-soft)] p-3 text-sm text-[var(--color-warning-text)]">
              {apiError}
            </p>
          )}

          <Button type="submit" variant="primary" size="l" fullWidth disabled={submitting}>
            {submitting ? "Регистрируем…" : "Зарегистрироваться"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-foreground-muted)]">
          Уже есть аккаунт?{" "}
          <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}
