"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ShoppingBag, Phone, Menu, X, Heart, User } from "lucide-react";
import { Topbar } from "./Topbar";
import { CategoryMegaMenu } from "./CategoryMegaMenu";
import { MobileMenu } from "./MobileMenu";
import { CartBadge } from "./CartBadge";
import { useCart } from "@/context/CartContext";
import { useModals } from "@/context/ModalContext";
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL } from "@/lib/api";
import type { Category } from "@/types/catalog";

export function Header({ categories }: { categories: Category[] }) {
  const { count, openDrawer } = useCart();
  const { openCallback } = useModals();
  const router = useRouter();

  const [hidden, setHidden] = useState(false);
  const [compact, setCompact] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const lastScrollY = useRef(0);

  // fixed-position overlays (мобильное меню, оверлей поиска) рендерятся через
  // portal в document.body — <header> ниже имеет transform (translate-y для
  // hide-on-scroll), а CSS transform на предке создаёт новый containing block
  // для position:fixed потомков, из-за чего оверлеи иначе обрезались бы
  // высотой хедера вместо полного экрана. Флаг mounted намеренно выставляется
  // в эффекте (не в рендере) — createPortal требует document, недоступный при
  // SSR; это стандартный паттерн "clientside portal after hydration".
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setCompact(y > 24);
      if (y > lastScrollY.current && y > 120) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full bg-[var(--color-surface)] transition-transform duration-250 ease-out ${
        hidden ? "-translate-y-full" : "translate-y-0"
      } ${compact ? "shadow-[var(--shadow-sm)]" : ""}`}
    >
      <Topbar />
      <div className="container-omega flex items-center justify-between gap-4 py-3 md:py-0" style={{ height: undefined }}>
        <div className={`flex w-full items-center justify-between gap-4 transition-[height] duration-200 ${compact ? "md:h-16" : "md:h-[88px]"}`}>
          {/* Mobile: гамбургер слева */}
          <button
            className="flex h-11 w-11 items-center justify-center md:hidden cursor-pointer"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Меню"
          >
            <Menu size={24} />
          </button>

          <Link href="/" className="flex shrink-0 items-center" aria-label="Омега — на главную">
            <Image
              src="/brand/logo.png"
              alt="Фабрика мебели Омега"
              width={164}
              height={42}
              priority
              className="h-9 w-auto md:h-11"
            />
          </Link>

          {/* Desktop: поиск по центру */}
          <div className="hidden flex-1 justify-center md:flex">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-[380px]">
              <div className="flex items-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-border)] bg-[var(--color-surface-sunken)] px-4 py-2.5 focus-within:border-[var(--color-primary)]">
                <Search size={18} className="shrink-0 text-[var(--color-foreground-muted)]" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Найти диван, кровать, шкаф…"
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-foreground-muted)]"
                />
              </div>
            </form>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Desktop: мегаменю категорий */}
            <div className="hidden lg:block">
              <CategoryMegaMenu categories={categories} />
            </div>

            {/* Mobile: иконка поиска */}
            <button
              className="flex h-11 w-11 items-center justify-center md:hidden cursor-pointer"
              onClick={() => setSearchOpen(true)}
              aria-label="Поиск"
            >
              <Search size={22} />
            </button>

            <Link
              href="/account"
              className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--color-background-alt)] md:flex"
              aria-label="Личный кабинет"
            >
              <User size={20} />
            </Link>

            <Link
              href="/favorites"
              className="hidden h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--color-background-alt)] md:flex"
              aria-label="Избранное"
            >
              <Heart size={20} />
            </Link>

            <button
              onClick={openDrawer}
              className="relative flex h-11 w-11 items-center justify-center rounded-full hover:bg-[var(--color-background-alt)] cursor-pointer"
              aria-label="Корзина"
            >
              <ShoppingBag size={22} />
              <CartBadge count={count} />
            </button>

            {/* Компакт sticky: телефон виден вместо скрытого topbar (правка В6) */}
            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              className="hidden h-11 items-center gap-1.5 rounded-[var(--radius-md)] px-2 text-sm font-semibold text-[var(--color-foreground)] hover:text-[var(--color-primary)] lg:flex"
            >
              <Phone size={18} />
              <span className="hidden xl:inline">{SUPPORT_PHONE}</span>
            </a>

            <button
              onClick={openCallback}
              className="hidden items-center gap-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-foreground)] hover:bg-[var(--color-accent)]/10 md:flex cursor-pointer"
            >
              <Phone size={16} className="text-[var(--color-accent)]" />
              Заказать звонок
            </button>

            {/* Mobile: телефон-иконка, tel: ссылка, видна всегда */}
            <a
              href={`tel:${SUPPORT_PHONE_TEL}`}
              className="flex h-11 w-11 items-center justify-center md:hidden"
              aria-label="Позвонить"
            >
              <Phone size={22} />
            </a>
          </div>
        </div>
      </div>

      {mounted &&
        createPortal(
          <>
            {/* Mobile search overlay */}
            {searchOpen && (
              <div className="fixed inset-0 z-[60] bg-[var(--color-surface)] p-4 md:hidden">
                <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
                  <div className="flex flex-1 items-center gap-2 rounded-[var(--radius-full)] border border-[var(--color-border)] px-4 py-3">
                    <Search size={18} className="text-[var(--color-foreground-muted)]" />
                    <input
                      autoFocus
                      type="search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Найти диван, кровать, шкаф…"
                      className="w-full bg-transparent text-base outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    aria-label="Закрыть"
                    className="flex h-11 w-11 items-center justify-center cursor-pointer"
                  >
                    <X size={22} />
                  </button>
                </form>
              </div>
            )}

            <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} categories={categories} />
          </>,
          document.body,
        )}
    </header>
  );
}
