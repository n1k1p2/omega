"use client";

import { useState, useRef, useEffect } from "react";
import { Phone, PhoneCall, X } from "lucide-react";
import { useModals } from "@/context/ModalContext";
import { SUPPORT_PHONE_TEL } from "@/lib/api";

/**
 * Плавающая кнопка звонка (нижний правый угол). Пульсация реализована через
 * псевдоэлемент/отдельный div на transform+opacity (правка С5) — не через
 * box-shadow, чтобы анимация оставалась на GPU-композиции.
 */
export function FloatingCallButton() {
  const { openCallback } = useModals();
  const [menuOpen, setMenuOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-40 md:bottom-6 md:right-6">
      {menuOpen && (
        <div className="mb-3 flex w-56 flex-col overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)]">
          <a
            href={`tel:${SUPPORT_PHONE_TEL}`}
            className="flex items-center gap-3 px-4 py-3.5 text-sm font-medium hover:bg-[var(--color-background-alt)]"
          >
            <Phone size={18} className="text-[var(--color-primary)]" />
            Позвонить
          </a>
          <button
            onClick={() => {
              setMenuOpen(false);
              openCallback();
            }}
            className="flex items-center gap-3 border-t border-[var(--color-border)] px-4 py-3.5 text-left text-sm font-medium hover:bg-[var(--color-background-alt)] cursor-pointer"
          >
            <PhoneCall size={18} className="text-[var(--color-primary)]" />
            Заказать звонок
          </button>
        </div>
      )}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Связаться с нами"
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[var(--shadow-lg)] cursor-pointer"
      >
        <span className="absolute inset-0 rounded-full bg-[var(--color-primary)] animate-pulse-ring" aria-hidden />
        {menuOpen ? <X size={24} /> : <Phone size={24} />}
      </button>
    </div>
  );
}
