"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PrivacyConsent } from "@/components/common/PrivacyConsent";
import { postCallback, SUPPORT_PHONE, SUPPORT_PHONE_TEL, ApiUnavailableError } from "@/lib/api";
import { formatPhoneInput, isValidRuPhone } from "@/lib/format";

/**
 * Форма "город + телефон → перезвоним с расчётом доставки" — используется
 * на главной (п.11), PDP и странице /delivery (правка В10: доставка честно
 * без автокалькуляции, расчёт делает менеджер).
 */
export function DeliveryCallbackForm({ productSlug }: { productSlug?: string }) {
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ city?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!city.trim()) nextErrors.city = "Укажите город";
    if (!isValidRuPhone(phone)) nextErrors.phone = "Проверьте номер телефона";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setApiError(null);
    try {
      await postCallback({
        name: "Расчёт доставки",
        phone,
        comment: `Город: ${city}. Просьба перезвонить с расчётом стоимости и срока доставки.`,
        product_slug: productSlug ?? null,
      });
      setDone(true);
    } catch (e) {
      setApiError(e instanceof ApiUnavailableError ? e.message : "Не удалось отправить заявку");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p className="rounded-[var(--radius-md)] bg-[var(--color-success)]/10 p-4 text-sm font-medium text-[var(--color-success)]">
        Спасибо! Менеджер свяжется с вами и рассчитает точную стоимость и срок доставки.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex-1">
          <Input
            placeholder="Ваш город"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            error={errors.city}
          />
        </div>
        <div className="flex-1">
          <Input
            placeholder="+7 (___) ___-__-__"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
            error={errors.phone}
          />
        </div>
        <Button type="submit" disabled={submitting} className="sm:shrink-0">
          {submitting ? "Отправляем…" : "Перезвоните мне"}
        </Button>
      </div>
      {apiError && (
        <p className="w-full rounded-[var(--radius-sm)] bg-[var(--color-warning-soft)] p-3 text-sm text-[var(--color-warning-text)]">
          {apiError} — позвоните нам напрямую:{" "}
          <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold underline">
            {SUPPORT_PHONE}
          </a>
        </p>
      )}
      <PrivacyConsent />
    </form>
  );
}
