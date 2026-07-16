"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { postCallback, SUPPORT_PHONE, SUPPORT_PHONE_TEL, ApiUnavailableError } from "@/lib/api";
import { formatPhoneInput, isValidRuPhone } from "@/lib/format";
import { Reveal } from "@/components/motion/Reveal";

export function FinalCTASection() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Укажите имя";
    if (!isValidRuPhone(phone)) nextErrors.phone = "Проверьте номер телефона";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setApiError(null);
    try {
      await postCallback({ name, phone, product_slug: null });
      setDone(true);
    } catch (e) {
      setApiError(e instanceof ApiUnavailableError ? e.message : "Не удалось отправить заявку");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-[var(--color-dark)] py-16 text-white md:py-24">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 animate-glow-pulse"
        style={{ background: "var(--gradient-brass-glow)" }}
        aria-hidden
      />
      <div className="container-omega relative text-center">
        <Reveal>
          <h2 className="font-display text-[26px] font-semibold md:text-[36px]">Остались вопросы? Позвоните нам</h2>
          <a
            href={`tel:${SUPPORT_PHONE_TEL}`}
            className="mt-4 inline-block font-display text-3xl font-bold text-[var(--color-brass-footer)] transition-transform duration-200 hover:scale-[1.02] md:text-4xl"
          >
            {SUPPORT_PHONE}
          </a>
        </Reveal>

        <Reveal delay={0.1} className="mx-auto mt-8 max-w-xl">
          {done ? (
            <p className="rounded-[var(--radius-md)] bg-white/10 p-4 text-sm">
              Спасибо! Мы перезвоним вам в ближайшее рабочее время.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Input
                  placeholder="Ваше имя"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={errors.name}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div className="flex-1">
                <Input
                  placeholder="+7 (___) ___-__-__"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                  error={errors.phone}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <Button type="submit" size="l" disabled={submitting} className="sm:shrink-0">
                {submitting ? "Отправляем…" : "Заказать звонок"}
              </Button>
            </form>
          )}
          {apiError && (
            <p className="mt-3 rounded-[var(--radius-sm)] bg-white/10 p-3 text-sm">
              {apiError} — позвоните напрямую:{" "}
              <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold text-[var(--color-brass-footer)] underline">
                {SUPPORT_PHONE}
              </a>
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
