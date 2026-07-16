"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";

/**
 * Cart-drawer — сдвиг-панель справа (правка С1). Слайд реализован через
 * framer-motion spring (transform only) — "пружинистое" ощущение вместо
 * линейного ease, ближе к референсу gigacode.
 */
export function CartDrawer() {
  const { items, count, total, isDrawerOpen, closeDrawer, removeItem, updateQuantity } = useCart();

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <div className="fixed inset-0 z-[95] flex justify-end">
          <motion.div
            className="absolute inset-0 bg-[rgba(43,36,32,0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={closeDrawer}
          />
          <motion.div
            className="relative flex h-full w-full max-w-[400px] flex-col bg-[var(--color-surface)] shadow-[var(--shadow-lg)]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5">
              <h3 className="font-display text-xl font-semibold">Корзина ({count})</h3>
              <button onClick={closeDrawer} aria-label="Закрыть" className="flex h-11 w-11 items-center justify-center cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
                <p className="text-[var(--color-foreground-muted)]">Пока пусто. Загляните в каталог</p>
                <Link href="/catalog" onClick={closeDrawer}>
                  <Button variant="primary">Смотреть каталог</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-5">
                  <ul className="flex flex-col gap-4">
                    {items.map((item) => {
                      const key = `${item.slug}__${item.size ?? ""}__${item.color ?? ""}`;
                      return (
                        <li key={key} className="flex gap-3">
                          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius-md)] bg-[var(--color-background-alt)]">
                            {item.image && (
                              <Image src={item.image} alt={item.name} fill sizes="96px" className="object-contain p-1" />
                            )}
                          </div>
                          <div className="flex min-w-0 flex-1 flex-col">
                            <Link
                              href={`/product/${item.slug}`}
                              onClick={closeDrawer}
                              className="line-clamp-2 text-sm font-semibold hover:text-[var(--color-primary)]"
                            >
                              {item.name}
                            </Link>
                            {(item.size || item.color) && (
                              <p className="text-xs text-[var(--color-foreground-muted)]">
                                {[item.size, item.color].filter(Boolean).join(" · ")}
                              </p>
                            )}
                            <div className="mt-auto flex items-center justify-between">
                              <div className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--color-border)]">
                                <button
                                  onClick={() => updateQuantity(item, item.quantity - 1)}
                                  className="flex h-8 w-8 items-center justify-center cursor-pointer active:scale-90 transition-transform"
                                  aria-label="Уменьшить количество"
                                >
                                  <Minus size={14} />
                                </button>
                                <span className="w-4 text-center text-sm tabular-nums">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item, item.quantity + 1)}
                                  className="flex h-8 w-8 items-center justify-center cursor-pointer active:scale-90 transition-transform"
                                  aria-label="Увеличить количество"
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <span className="text-sm font-semibold tabular-nums">
                                {formatPrice(item.price * item.quantity)}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item)}
                            aria-label="Удалить"
                            className="flex h-11 w-11 shrink-0 items-center justify-center self-start text-[var(--color-foreground-muted)] transition-colors hover:text-[var(--color-destructive)] cursor-pointer"
                          >
                            <Trash2 size={18} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="border-t border-[var(--color-border)] p-5">
                  <div className="mb-1 flex items-center justify-between text-sm text-[var(--color-foreground-muted)]">
                    <span>Стоимость доставки уточнит менеджер после оформления</span>
                  </div>
                  <div className="mb-4 flex items-center justify-between font-display text-xl font-semibold">
                    <span>Итого</span>
                    <span className="tabular-nums">{formatPrice(total)}</span>
                  </div>
                  <Link href="/checkout" onClick={closeDrawer}>
                    <Button variant="primary" size="l" fullWidth>
                      Оформить заказ
                    </Button>
                  </Link>
                  <button
                    onClick={closeDrawer}
                    className="mt-2 w-full rounded-[var(--radius-md)] py-2 text-sm font-medium text-[var(--color-foreground-muted)] transition-colors hover:text-[var(--color-foreground)] cursor-pointer"
                  >
                    Продолжить покупки
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
