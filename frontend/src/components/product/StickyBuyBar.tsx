"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "@/types/catalog";
import { Button } from "@/components/ui/Button";
import { formatPriceFrom } from "@/lib/format";
import { useCart } from "@/context/CartContext";

/**
 * Sticky-панель покупки: desktop-полоса под хедером при скролле мимо
 * основного блока покупки + mobile bottom bar (см. 4.8/5.3 дизайн-системы).
 * Появление — fade+slide (transform/opacity only), не влияет на layout соседних
 * элементов (position: fixed).
 */
export function StickyBuyBar({ product }: { product: Product }) {
  const [visible, setVisible] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    const target = document.getElementById("buy-box-anchor");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: "-88px 0px 0px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (product.price == null) return null;

  function handleBuy() {
    addItem({
      slug: product.slug,
      name: product.name,
      price: product.price!,
      image: product.image,
    });
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-lg)] [padding-bottom:env(safe-area-inset-bottom)] md:top-16 md:bottom-auto md:border-b md:border-t-0"
        >
          <div className="container-omega flex h-[72px] items-center gap-3">
            {product.image && (
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[var(--radius-sm)] bg-white md:h-10 md:w-10">
                <Image src={product.image} alt={product.name} fill sizes="40px" className="object-contain" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{product.name}</p>
              <p className="text-sm font-bold tabular-nums">{formatPriceFrom(product.price)}</p>
            </div>
            <Button variant="primary" size="m" onClick={handleBuy} className="w-[45%] shrink-0 md:w-auto">
              Оформить заказ
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
