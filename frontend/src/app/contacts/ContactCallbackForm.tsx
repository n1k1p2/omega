"use client";

import { useState } from "react";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PrivacyConsent } from "@/components/common/PrivacyConsent";
import { postCallback, SUPPORT_PHONE, SUPPORT_PHONE_TEL, ApiUnavailableError } from "@/lib/api";
import { formatPhoneInput, isValidRuPhone } from "@/lib/format";

export function ContactCallbackForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Укажите, как к вам обращаться";
    if (!isValidRuPhone(phone)) nextErrors.phone = "Проверьте номер телефона";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setApiError(null);
    try {
      await postCallback({ name, phone, comment, product_slug: null });
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
        Спасибо! Мы получили заявку и перезвоним в ближайшее рабочее время.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Имя"
        placeholder="Иван Петров"
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={errors.name}
      />
      <Input
        label="Телефон"
        placeholder="+7 (___) ___-__-__"
        inputMode="tel"
        value={phone}
        onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
        error={errors.phone}
      />
      <Textarea
        label="Комментарий (необязательно)"
        placeholder="О чём хотите спросить?"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      {apiError && (
        <p className="rounded-[var(--radius-sm)] bg-[var(--color-warning-soft)] p-3 text-sm text-[var(--color-warning-text)]">
          {apiError} — позвоните нам напрямую:{" "}
          <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold underline">
            {SUPPORT_PHONE}
          </a>
        </p>
      )}
      <Button type="submit" size="l" disabled={submitting}>
        {submitting ? "Отправляем…" : "Заказать звонок"}
      </Button>
      <PrivacyConsent />
    </form>
  );
}
