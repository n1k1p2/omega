"use client";

import { useState } from "react";
import Image from "next/image";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PrivacyConsent } from "@/components/common/PrivacyConsent";
import { useModals } from "@/context/ModalContext";
import { useToast } from "@/context/ToastContext";
import { postCallback, SUPPORT_PHONE, SUPPORT_PHONE_TEL, ApiUnavailableError } from "@/lib/api";
import { formatPhoneInput, formatPriceFrom, isValidRuPhone } from "@/lib/format";

export function OneClickModal() {
  const { oneClickTarget, closeOneClick } = useModals();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const open = !!oneClickTarget;

  function reset() {
    setName("");
    setPhone("");
    setErrors({});
    setApiError(null);
  }

  function close() {
    reset();
    closeOneClick();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!oneClickTarget) return;
    const nextErrors: typeof errors = {};
    if (!name.trim()) nextErrors.name = "Укажите, как к вам обращаться";
    if (!isValidRuPhone(phone)) nextErrors.phone = "Проверьте номер телефона";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setApiError(null);
    try {
      const parts = [];
      if (oneClickTarget.size) parts.push(`размер: ${oneClickTarget.size}`);
      if (oneClickTarget.color) parts.push(`цвет: ${oneClickTarget.color}`);
      await postCallback({
        name,
        phone,
        product_slug: oneClickTarget.productSlug,
        comment: parts.length ? `Купить в 1 клик (${parts.join(", ")})` : "Купить в 1 клик",
      });
      showToast({ type: "success", message: "Заявка принята! Перезвоним, чтобы подтвердить заказ." });
      close();
    } catch (e) {
      setApiError(e instanceof ApiUnavailableError ? e.message : "Не удалось отправить заявку");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title="Купить в 1 клик">
      {oneClickTarget && (
        <>
          <div className="mb-5 flex items-center gap-3 rounded-[var(--radius-md)] bg-[var(--color-background-alt)] p-3">
            {oneClickTarget.productImage && (
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-white">
                <Image
                  src={oneClickTarget.productImage}
                  alt={oneClickTarget.productName}
                  fill
                  sizes="56px"
                  className="object-contain"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{oneClickTarget.productName}</p>
              <p className="text-xs text-[var(--color-foreground-muted)]">
                {[oneClickTarget.size, oneClickTarget.color].filter(Boolean).join(" · ")}
              </p>
              <p className="text-sm font-semibold text-[var(--color-primary)]">
                {formatPriceFrom(oneClickTarget.price)}
              </p>
            </div>
          </div>
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
            {apiError && (
              <p className="rounded-[var(--radius-sm)] bg-[var(--color-warning-soft)] p-3 text-sm text-[var(--color-warning-text)]">
                {apiError} — позвоните нам напрямую:{" "}
                <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold underline">
                  {SUPPORT_PHONE}
                </a>
              </p>
            )}
            <Button type="submit" size="l" fullWidth disabled={submitting}>
              {submitting ? "Отправляем…" : "Заказать"}
            </Button>
            <p className="text-center text-xs text-[var(--color-foreground-muted)]">
              Без предоплаты — обсудим детали по телефону
            </p>
            <PrivacyConsent className="text-center" />
          </form>
        </>
      )}
    </Modal>
  );
}
