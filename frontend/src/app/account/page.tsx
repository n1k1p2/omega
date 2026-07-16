"use client";

import { Suspense, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Package, User, LogOut } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { getOrders } from "@/lib/api";
import { formatPhoneInput, formatPrice, isValidRuPhone } from "@/lib/format";
import type { Order } from "@/types/catalog";

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  confirmed: "Подтверждён",
  production: "В производстве",
  shipped: "Отправлен",
  done: "Выполнен",
  cancelled: "Отменён",
};

const STATUS_TONE: Record<string, string> = {
  new: "bg-[rgba(156,122,46,0.14)] text-[var(--color-accent)]",
  confirmed: "bg-[rgba(74,93,70,0.12)] text-[var(--color-accent-2)]",
  production: "bg-[var(--color-primary-soft)] text-[#963B26]",
  shipped: "bg-[rgba(74,93,70,0.12)] text-[var(--color-accent-2)]",
  done: "bg-[rgba(63,122,78,0.14)] text-[var(--color-success)]",
  cancelled: "bg-[var(--color-warning-soft)] text-[var(--color-warning-text)]",
};

type Tab = "orders" | "profile";

function AccountPageInner() {
  const { user, isLoading, accessToken, logout, updateProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();

  const [tab, setTab] = useState<Tab>(searchParams.get("tab") === "profile" ? "profile" : "orders");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  // Гард: неавторизованных отправляем на /login
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login?redirect=/account");
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!accessToken || tab !== "orders" || orders !== null) return;
    let cancelled = false;
    getOrders(accessToken)
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch(() => {
        if (!cancelled) setOrdersError("Не удалось загрузить заказы. Попробуйте обновить страницу.");
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, tab, orders]);

  if (isLoading || !user) {
    return (
      <div className="container-omega py-16 text-center text-[var(--color-foreground-muted)]">
        Загрузка…
      </div>
    );
  }

  return (
    <div className="container-omega py-5 md:py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Личный кабинет" }]} />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[32px] font-bold md:text-[40px]">Личный кабинет</h1>
          <p className="mt-1 text-[var(--color-foreground-muted)]">{user.email}</p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="flex items-center gap-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border-strong)] px-4 py-2.5 text-sm font-semibold hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] cursor-pointer"
        >
          <LogOut size={16} />
          Выйти
        </button>
      </div>

      <div className="mb-8 flex gap-2 border-b border-[var(--color-border)]">
        <TabButton active={tab === "orders"} onClick={() => setTab("orders")} icon={Package}>
          Мои заказы
        </TabButton>
        <TabButton active={tab === "profile"} onClick={() => setTab("profile")} icon={User}>
          Профиль
        </TabButton>
      </div>

      {tab === "orders" ? (
        <OrdersTab orders={orders} error={ordersError} />
      ) : (
        <ProfileTab user={user} onSave={updateProfile} showToast={showToast} />
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountPageInner />
    </Suspense>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Package;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-semibold cursor-pointer transition-colors",
        active
          ? "border-[var(--color-primary)] text-[var(--color-primary)]"
          : "border-transparent text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]",
      )}
    >
      <Icon size={16} />
      {children}
    </button>
  );
}

function OrdersTab({ orders, error }: { orders: Order[] | null; error: string | null }) {
  if (error) {
    return <p className="rounded-[var(--radius-md)] bg-[var(--color-warning-soft)] p-4 text-sm text-[var(--color-warning-text)]">{error}</p>;
  }

  if (orders === null) {
    return <p className="text-[var(--color-foreground-muted)]">Загружаем заказы…</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-16 text-center">
        <Package size={40} className="text-[var(--color-foreground-muted)]" />
        <div>
          <p className="font-display text-xl font-semibold">Заказов пока нет</p>
          <p className="mt-1 text-[var(--color-foreground-muted)]">Оформите первый заказ в каталоге</p>
        </div>
        <Link href="/catalog">
          <Button variant="primary">Перейти в каталог</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {orders.map((order) => (
        <div key={order.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-display text-lg font-semibold">Заказ {order.number}</p>
              <p className="text-sm text-[var(--color-foreground-muted)]">
                {new Date(order.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
            <span
              className={clsx(
                "rounded-[var(--radius-full)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.04em]",
                STATUS_TONE[order.status] || STATUS_TONE.new,
              )}
            >
              {order.status_display || STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          <ul className="flex flex-col gap-3">
            {order.items.map((item, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-[var(--color-background-alt)]">
                  {item.product.image && (
                    <Image src={item.product.image} alt={item.product.name} fill sizes="56px" className="object-contain p-1" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium">{item.product.name}</p>
                  <p className="text-xs text-[var(--color-foreground-muted)]">
                    {[item.size, item.color].filter(Boolean).join(" · ")}
                    {(item.size || item.color) && " · "}
                    {item.quantity} шт. × {formatPrice(item.price)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-[var(--color-border)] pt-4">
            <span className="text-sm text-[var(--color-foreground-muted)]">Итого</span>
            <span className="font-display text-lg font-bold tabular-nums">{formatPrice(order.total)}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileTab({
  user,
  onSave,
  showToast,
}: {
  user: { first_name: string; last_name?: string; phone?: string; address?: string; email: string };
  onSave: (payload: { first_name: string; last_name?: string; phone?: string; address?: string }) => Promise<void>;
  showToast: (data: { type: "success" | "error" | "info"; message: string }) => void;
}) {
  const [firstName, setFirstName] = useState(user.first_name || "");
  const [lastName, setLastName] = useState(user.last_name || "");
  const [phone, setPhone] = useState(user.phone ? formatPhoneInput(user.phone) : "");
  const [address, setAddress] = useState(user.address || "");
  const [errors, setErrors] = useState<{ firstName?: string; phone?: string }>({});
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors: typeof errors = {};
    if (!firstName.trim()) nextErrors.firstName = "Укажите имя";
    if (phone && !isValidRuPhone(phone)) nextErrors.phone = "Проверьте номер телефона";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await onSave({
        first_name: firstName.trim(),
        last_name: lastName.trim() || undefined,
        phone: phone || undefined,
        address: address.trim() || undefined,
      });
      showToast({ type: "success", message: "Данные профиля сохранены" });
    } catch {
      showToast({ type: "error", message: "Не удалось сохранить изменения. Попробуйте ещё раз." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-lg flex-col gap-4">
      <Input label="Email" value={user.email} disabled className="opacity-60" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          error={errors.firstName}
        />
        <Input label="Фамилия" value={lastName} onChange={(e) => setLastName(e.target.value)} />
      </div>
      <Input
        label="Телефон"
        inputMode="tel"
        placeholder="+7 (___) ___-__-__"
        value={phone}
        onChange={(e) => setPhone(formatPhoneInput(e.target.value))}
        error={errors.phone}
      />
      <Input
        label="Адрес доставки"
        placeholder="Город, улица, дом, квартира"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />
      <Button type="submit" variant="primary" size="l" disabled={saving} className="w-fit">
        {saving ? "Сохраняем…" : "Сохранить изменения"}
      </Button>
    </form>
  );
}
