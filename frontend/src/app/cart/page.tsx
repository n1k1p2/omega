"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, count, total, removeItem, updateQuantity } = useCart();

  return (
    <div className="container-omega py-5 md:py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Корзина" }]} />
      </div>

      <h1 className="mb-6 font-display text-[32px] font-bold md:text-[48px]">
        Корзина{count > 0 ? ` (${count})` : ""}
      </h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-5 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border)] py-20 text-center">
          <ShoppingBag size={44} className="text-[var(--color-foreground-muted)]" />
          <div>
            <p className="font-display text-xl font-semibold">Корзина пока пуста</p>
            <p className="mt-1 text-[var(--color-foreground-muted)]">
              Загляните в каталог — найдётся кровать, диван или шкаф для вашего дома
            </p>
          </div>
          <Link href="/catalog">
            <Button variant="primary" size="l">
              Перейти в каталог
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
          <ul className="flex flex-col gap-4">
            {items.map((item) => {
              const key = `${item.slug}__${item.size ?? ""}__${item.color ?? ""}`;
              return (
                <li
                  key={key}
                  className="flex gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
                >
                  <Link
                    href={`/product/${item.slug}`}
                    className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-background-alt)] sm:h-28 sm:w-28"
                  >
                    {item.image && (
                      <Image src={item.image} alt={item.name} fill sizes="112px" className="object-contain p-1" />
                    )}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/product/${item.slug}`}
                        className="line-clamp-2 font-semibold hover:text-[var(--color-primary)]"
                      >
                        {item.name}
                      </Link>
                      <button
                        onClick={() => removeItem(item)}
                        aria-label="Удалить из корзины"
                        className="flex h-9 w-9 shrink-0 items-center justify-center text-[var(--color-foreground-muted)] hover:text-[var(--color-destructive)] cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    {(item.size || item.color) && (
                      <p className="mt-0.5 text-sm text-[var(--color-foreground-muted)]">
                        {[item.size, item.color].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                      <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                        <button
                          onClick={() => updateQuantity(item, item.quantity - 1)}
                          className="flex h-10 w-10 items-center justify-center cursor-pointer"
                          aria-label="Уменьшить количество"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-5 text-center tabular-nums">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item, item.quantity + 1)}
                          className="flex h-10 w-10 items-center justify-center cursor-pointer"
                          aria-label="Увеличить количество"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="font-display text-lg font-semibold tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-col gap-4">
            <div className="sticky top-24 flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <h2 className="font-display text-xl font-semibold">Итого</h2>
              <div className="flex items-center justify-between text-sm text-[var(--color-foreground-muted)]">
                <span>Товары ({count})</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
              <div className="flex items-center justify-between text-sm text-[var(--color-foreground-muted)]">
                <span>Доставка</span>
                <span>уточнит менеджер</span>
              </div>
              <div className="flex items-center justify-between border-t border-[var(--color-border)] pt-4 font-display text-2xl font-bold">
                <span>Итого</span>
                <span className="tabular-nums">{formatPrice(total)}</span>
              </div>
              <Link href="/checkout">
                <Button variant="primary" size="l" fullWidth>
                  Оформить заказ
                </Button>
              </Link>
              <Link
                href="/catalog"
                className="text-center text-sm font-medium text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)]"
              >
                Продолжить покупки
              </Link>
            </div>

            <div className="flex flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-background-alt)] p-5 text-sm">
              <div className="flex items-start gap-3">
                <Truck size={20} className="mt-0.5 shrink-0 text-[var(--color-accent-2)]" />
                <p>Доставим в любой населённый пункт России — точную стоимость и срок сообщит менеджер после оформления.</p>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck size={20} className="mt-0.5 shrink-0 text-[var(--color-accent-2)]" />
                <p>Без предоплаты — оплата после подтверждения заказа менеджером: картой, при получении (Москва в пределах МКАД) или по счёту.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
