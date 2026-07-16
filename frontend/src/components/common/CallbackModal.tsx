"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PrivacyConsent } from "@/components/common/PrivacyConsent";
import { useModals } from "@/context/ModalContext";
import { useToast } from "@/context/ToastContext";
import { postCallback, SUPPORT_PHONE, SUPPORT_PHONE_TEL, ApiUnavailableError } from "@/lib/api";
import { formatPhoneInput, isValidRuPhone } from "@/lib/format";
import { isWithinBusinessHours } from "@/lib/business-hours";

export function CallbackModal() {
  const { isCallbackOpen, closeCallback } = useModals();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  function reset() {
    setName("");
    setPhone("");
    setErrors({});
    setApiError(null);
  }

  function close() {
    reset();
    closeCallback();
  }

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
      await postCallback({ name, phone, product_slug: null });
      showToast({ type: "success", message: "Заявка отправлена! Перезвоним в ближайшее рабочее время." });
      close();
    } catch (e) {
      setApiError(
        e instanceof ApiUnavailableError
          ? e.message
          : "Не удалось отправить заявку",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={isCallbackOpen} onClose={close} title="Перезвоните мне">
      <p className="mb-5 text-sm text-[var(--color-foreground-muted)]">
        {isWithinBusinessHours()
          ? "Ответим в течение рабочего дня, Пн–Пт 10:00–18:00 МСК"
          : "Сейчас нерабочее время — перезвоним первым делом утром, Пн–Пт 10:00–18:00 МСК"}
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Имя"
          placeholder="Иван Петров"
          autoFocus={typeof window !== "undefined" && window.innerWidth >= 1024}
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
        {apiError && (
          <p className="rounded-[var(--radius-sm)] bg-[var(--color-warning-soft)] p-3 text-sm text-[var(--color-warning-text)]">
            {apiError} — позвоните нам напрямую:{" "}
            <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold underline">
              {SUPPORT_PHONE}
            </a>
          </p>
        )}
        <Button type="submit" size="l" fullWidth disabled={submitting}>
          {submitting ? "Отправляем…" : "Заказать звонок"}
        </Button>
        <PrivacyConsent className="text-center" />
      </form>
    </Modal>
  );
}
