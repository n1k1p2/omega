"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Phone, Clock, User, Heart } from "lucide-react";
import type { Category } from "@/types/catalog";
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL, SUPPORT_HOURS } from "@/lib/api";

export function MobileMenu({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex md:hidden">
          <motion.div
            className="absolute inset-0 bg-[rgba(43,36,32,0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            className="relative flex h-full w-[86vw] max-w-[360px] flex-col overflow-y-auto bg-[var(--color-surface)] p-5 shadow-[var(--shadow-lg)]"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 340, damping: 34 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <Image src="/brand/logo.png" alt="Омега" width={120} height={30} className="h-8 w-auto" />
              <button onClick={onClose} aria-label="Закрыть" className="flex h-11 w-11 items-center justify-center cursor-pointer">
                <X size={22} />
              </button>
            </div>

            <div className="mb-4 rounded-[var(--radius-md)] bg-[var(--color-background-alt)] p-3 text-sm">
              <a href={`tel:${SUPPORT_PHONE_TEL}`} className="flex items-center gap-2 font-semibold">
                <Phone size={16} className="text-[var(--color-accent)]" />
                {SUPPORT_PHONE}
              </a>
              <p className="mt-1 flex items-center gap-1.5 text-[var(--color-foreground-muted)]">
                <Clock size={14} />
                {SUPPORT_HOURS}
              </p>
            </div>

            <nav className="flex flex-col gap-1">
              <p className="px-1 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-[var(--color-foreground-muted)]">
                Каталог
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/catalog/${cat.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-[var(--radius-md)] px-3 py-3 text-base transition-colors hover:bg-[var(--color-background-alt)]"
                >
                  <span>{cat.name}</span>
                  <span className="text-sm text-[var(--color-foreground-muted)]">{cat.product_count}</span>
                </Link>
              ))}
              <div className="my-2 border-t border-[var(--color-border)]" />
              <Link href="/catalog" onClick={onClose} className="rounded-[var(--radius-md)] px-3 py-3 transition-colors hover:bg-[var(--color-background-alt)]">
                Все товары
              </Link>
              <Link href="/about" onClick={onClose} className="rounded-[var(--radius-md)] px-3 py-3 transition-colors hover:bg-[var(--color-background-alt)]">
                О фабрике
              </Link>
              <Link href="/delivery" onClick={onClose} className="rounded-[var(--radius-md)] px-3 py-3 transition-colors hover:bg-[var(--color-background-alt)]">
                Доставка и оплата
              </Link>
              <Link href="/contacts" onClick={onClose} className="rounded-[var(--radius-md)] px-3 py-3 transition-colors hover:bg-[var(--color-background-alt)]">
                Контакты
              </Link>
              <div className="my-2 border-t border-[var(--color-border)]" />
              <Link
                href="/account"
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-3 transition-colors hover:bg-[var(--color-background-alt)]"
              >
                <User size={18} />
                Личный кабинет
              </Link>
              <Link
                href="/favorites"
                onClick={onClose}
                className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-3 transition-colors hover:bg-[var(--color-background-alt)]"
              >
                <Heart size={18} />
                Избранное
              </Link>
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
