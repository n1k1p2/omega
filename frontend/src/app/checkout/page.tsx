"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PrivacyConsent } from "@/components/common/PrivacyConsent";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { postOrder, ApiUnavailableError, SUPPORT_PHONE, SUPPORT_PHONE_TEL } from "@/lib/api";
import { formatPhoneInput, formatPrice, isValidRuPhone } from "@/lib/format";
import type { OrderPayload } from "@/types/catalog";

type PaymentMethod = "clarify" | "cod" | "card" | "invoice";

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "clarify", label: "Уточним при звонке" },
  { value: "cod", label: "При получении (Москва в пределах МКАД)" },
  { value: "card", label: "Картой — менеджер пришлёт ссылку на оплату" },
  { value: "invoice", label: "Безналичный расчёт по счёту" },
];

interface FormErrors {
  name?: string;
  phone?: string;
  city?: string;
  consent?: string;
}

export default function CheckoutPage() {
  const { items, count, total, clearCart } = useCart();
  const { user, accessToken } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [payment, setPayment] = useState<PaymentMethod>("clarify");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    // Автофокус только на desktop (мобильным клавиатура на автофокусе мешает)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDesktop(window.innerWidth >= 1024);
  }, []);

  // Предзаполняем поля данными профиля, если пользователь залогинен — намеренный
  // setState в эффекте: данные профиля приходят асинхронно из AuthContext
  // (гидратация токена после монтирования), синхронизировать локальные поля
  // формы с ними иначе, чем эффектом, нельзя.
  useEffect(() => {
    if (!user) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setName((prev) => prev || [user.first_name, user.last_name].filter(Boolean).join(" "));
    setPhone((prev) => prev || (user.phone ? formatPhoneInput(user.phone) : ""));
    setEmail((prev) => prev || user.email || "");
    setAddress((prev) => prev || user.address || "");
  }, [user]);

  const paymentComment = useMemo(() => {
    const label = PAYMENT_OPTIONS.find((p) => p.value === payment)?.label;
    return label ? `Способ оплаты: ${label}.` : "";
  }, [payment]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    const nextErrors: FormErrors = {};
    if (!name.trim()) nextErrors.name = "Укажите имя";
    if (!isValidRuPhone(phone)) nextErrors.phone = "Проверьте номер телефона";
    if (!city.trim()) nextErrors.city = "Укажите город";
    if (!consent) nextErrors.consent = "Нужно согласие на обработку персональных данных";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    setApiError(null);

    const fullComment = [comment.trim(), paymentComment].filter(Boolean).join(" ");

    const payload: OrderPayload = {
      name: name.trim(),
      phone,
      email: email.trim() || undefined,
      city: city.trim(),
      address: address.trim() || undefined,
      comment: fullComment || undefined,
      items: items.map((i) => ({
        product_slug: i.slug,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
      })),
    };

    try {
      const order = await postOrder(payload, accessToken ?? undefined);
      sessionStorage.setItem(
        "omega_last_order",
        JSON.stringify({ number: order.number, total: order.total }),
      );
      clearCart();
      router.push("/checkout/success");
    } catch (err) {
      setApiError(err instanceof ApiUnavailableError ? err.message : "Не удалось оформить заказ");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="container-omega py-16 text-center">
        <h1 className="mb-3 font-display text-2xl font-semibold">Корзина пуста</h1>
        <p className="mb-6 text-[var(--color-foreground-muted)]">
          Прежде чем оформить заказ, добавьте товары в корзину.
        </p>
        <Link href="/catalog">
          <Button variant="primary" size="l">
            Перейти в каталог
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container-omega py-5 md:py-8">
      <div className="mb-4">
        <Breadcrumbs
          items={[{ label: "Главная", href: "/" }, { label: "Корзина", href: "/cart" }, { label: "Оформление заказа" }]}
        />
      </div>

      <h1 className="mb-6 font-display text-[32px] font-bold md:text-[40px]">Оформление заказа</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-6 order-2 lg:order-1">
          <section className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6">
            <h2 className="font-display text-xl font-semibold">Контактные данные</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Имя *"
                placeholder="Иван Петров"
                autoFocus={isDesktop}
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={errors.name}
              />
              <Input
                label="Телефон *"
                placeholder="+7 (___) ___-__-__"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
                error={errors.phone}
              />
            </div>
            <Input
              label="Email (необязательно)"
              type="email"
              placeholder="you@mail.ru"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </section>

          <section className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6">
            <h2 className="font-display text-xl font-semibold">Доставка</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Город *"
                placeholder="Москва"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                error={errors.city}
              />
              <Input
                label="Адрес (необязательно)"
                placeholder="Улица, дом, квартира"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
            <p className="rounded-[var(--radius-sm)] bg-[var(--color-background-alt)] p-3 text-sm text-[var(--color-foreground-muted)]">
              Стоимость доставки рассчитает менеджер и подтвердит по телефону после оформления заказа.
            </p>
            <Textarea
              label="Комментарий к заказу (необязательно)"
              placeholder="Удобное время для звонка, пожелания по сборке и т.п."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </section>

          <section className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6">
            <h2 className="font-display text-xl font-semibold">Способ оплаты</h2>
            <div className="flex flex-col gap-2">
              {PAYMENT_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border)] p-3.5 has-[:checked]:border-[var(--color-primary)] has-[:checked]:bg-[var(--color-primary-soft)]/40"
                >
                  <input
                    type="radio"
                    name="payment"
                    value={opt.value}
                    checked={payment === opt.value}
                    onChange={() => setPayment(opt.value)}
                    className="h-5 w-5 accent-[var(--color-primary)]"
                  />
                  <span className="text-sm font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </section>

          <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-background-alt)] p-5">
            <label className="flex cursor-pointer items-start gap-3 text-sm">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-primary)]"
              />
              <span>
                Согласен(на) на обработку персональных данных в соответствии с{" "}
                <Link href="/privacy" className="underline hover:text-[var(--color-primary)]">
                  политикой обработки персональных данных
                </Link>
              </span>
            </label>
            {errors.consent && (
              <p className="text-sm text-[var(--color-destructive)]" role="alert">
                {errors.consent}
              </p>
            )}
          </div>

          {apiError && (
            <p className="rounded-[var(--radius-sm)] bg-[var(--color-warning-soft)] p-4 text-sm text-[var(--color-warning-text)]">
              {apiError} — позвоните нам напрямую:{" "}
              <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold underline">
                {SUPPORT_PHONE}
              </a>
            </p>
          )}

          <Button type="submit" variant="primary" size="l" disabled={submitting} className="lg:hidden">
            {submitting ? "Оформляем…" : `Оформить заказ на ${formatPrice(total)}`}
          </Button>
        </div>

        <aside className="order-1 flex flex-col gap-4 lg:order-2">
          <div className="sticky top-24 flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 md:p-6">
            <h2 className="font-display text-xl font-semibold">Ваш заказ ({count})</h2>
            <ul className="flex max-h-72 flex-col gap-3 overflow-y-auto pr-1">
              {items.map((item) => {
                const key = `${item.slug}__${item.size ?? ""}__${item.color ?? ""}`;
                return (
                  <li key={key} className="flex gap-3">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-background-alt)]">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-sm font-semibold">{item.name}</p>
                      <p className="text-xs text-[var(--color-foreground-muted)]">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                        {(item.size || item.color) && " · "}
                        {item.quantity} шт.
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold tabular-nums">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 text-sm text-[var(--color-foreground-muted)]">
              <span>Доставка</span>
              <span>уточнит менеджер</span>
            </div>
            <div className="flex items-center justify-between font-display text-2xl font-bold">
              <span>Итого</span>
              <span className="tabular-nums">{formatPrice(total)}</span>
            </div>
            <Button
              type="submit"
              variant="primary"
              size="l"
              fullWidth
              disabled={submitting}
              className="hidden lg:inline-flex"
            >
              {submitting ? "Оформляем…" : "Оформить заказ"}
            </Button>
            <div className="flex items-start gap-2 text-xs text-[var(--color-foreground-muted)]">
              <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--color-accent-2)]" />
              <span>Без предоплаты. Менеджер позвонит и подтвердит детали заказа.</span>
            </div>
            <PrivacyConsent />
          </div>
        </aside>
      </form>
    </div>
  );
}
