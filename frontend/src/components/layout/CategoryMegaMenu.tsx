"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import type { Category } from "@/types/catalog";

export function CategoryMegaMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleEnter() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function handleLeave() {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button className="flex h-11 items-center gap-1 rounded-[var(--radius-md)] px-3 text-sm font-semibold transition-colors hover:bg-[var(--color-background-alt)] cursor-pointer">
        Каталог
        <ChevronDown size={16} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 top-full z-40 flex w-[640px] gap-1 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 shadow-[var(--shadow-lg)]"
          >
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/catalog/${cat.slug}`}
                className="group flex flex-1 flex-col overflow-hidden rounded-[var(--radius-md)] border border-transparent transition-colors hover:border-[var(--color-border)]"
              >
                <div className="relative h-24 w-full overflow-hidden bg-[var(--color-background-alt)]">
                  {cat.image && (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="120px"
                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="p-2 text-center">
                  <p className="text-sm font-semibold">{cat.name}</p>
                  <p className="text-xs text-[var(--color-foreground-muted)]">{cat.product_count} моделей</p>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
