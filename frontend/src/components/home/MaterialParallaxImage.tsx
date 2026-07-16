"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

/**
 * Параллакс фото среза дерева в блоке «Из чего сделана мебель Омега» (§6):
 * фото двигается на 0.6-0.7x скорости скролла, только transform: translateY,
 * через useScroll/useTransform (requestAnimationFrame-based в framer-motion,
 * не привязано к scroll-событию напрямую).
 */
export function MaterialParallaxImage() {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const rawY = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const y = shouldReduceMotion ? 0 : rawY;

  return (
    <div ref={ref} className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] bg-white">
      <motion.div className="absolute inset-0" style={{ y }}>
        <Image
          src="/products/krovat-omega-klassika-rim-1.jpg"
          alt="Конструкция кровати Омега из массива берёзы"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-6"
        />
      </motion.div>
    </div>
  );
}
