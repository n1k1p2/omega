"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

/**
 * Модалка общего назначения — центр на desktop, bottom sheet на mobile
 * (4.10 дизайн-системы). Закрытие по Esc/клику вне/крестику. Фокус-трап
 * упрощённый (фокус на контейнер при открытии). Fade+scale(0.96→1) 220ms
 * через framer-motion AnimatePresence — воспроизводит exit-анимацию тоже,
 * не только appear (в отличие от чистого CSS keyframe, который не может
 * анимировать unmount).
 */
export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    containerRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[90] flex items-end justify-center bg-[rgba(43,36,32,0.5)] backdrop-blur-sm md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            ref={containerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-[var(--radius-xl)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-lg)] outline-none md:max-w-[440px] md:rounded-[var(--radius-xl)] md:p-8"
          >
            <button
              onClick={onClose}
              aria-label="Закрыть"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-foreground-muted)] transition-colors hover:bg-[var(--color-background-alt)] cursor-pointer"
            >
              <X size={20} />
            </button>
            {title && <h3 className="mb-1 pr-10 font-display text-2xl font-semibold">{title}</h3>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
