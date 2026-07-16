"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type Variants } from "framer-motion";

/**
 * Анимация входа hero (§6 дизайн-системы): stagger caption → H1 → subtitle →
 * CTA → соцдоказательство, шаг ~100ms, translateY(16px→0). Плюс лёгкий
 * параллакс фото на скролл (0.3x, только transform, отключается при
 * prefers-reduced-motion).
 *
 * Правка В11: `initial={false}` на всех motion-элементах — SSR/первый рендер
 * показывает финальные стили сразу (подтверждено рендер-тестом, см. Reveal.tsx),
 * анимация проигрывается уже в браузере как progressive enhancement поверх
 * видимого контента. LCP-фото (справа) не участвует в fade/scale — только
 * контейнер получает статичное свечение, само `<Image priority>` не анимируется.
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const STAGGER = 0.1;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER, delayChildren: 0.05 },
  },
};

function itemVariants(reduced: boolean): Variants {
  return {
    hidden: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.15 : 0.55, ease: EASE },
    },
  };
}

export function HeroTextColumn({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="order-2 flex flex-col gap-5 py-8 md:order-1 md:py-16"
      initial={false}
      animate="visible"
      variants={containerVariants}
    >
      {children}
    </motion.div>
  );
}

/**
 * Item — обёртка над семантическим тегом. Framer-motion не даёt менять тег
 * компонента `motion.div` на лету через prop, поэтому явно выбираем нужный
 * `motion.<tag>` — семантика h1/p/ul в разметке страницы сохраняется полностью
 * (Hero.tsx передаёт as="h1"/"p"/"ul" там, где это важно для SEO/доступности).
 */
export function HeroItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "h1" | "p" | "ul";
}) {
  const shouldReduceMotion = useReducedMotion();
  const variants = itemVariants(!!shouldReduceMotion);
  const MotionTag = motion[as];
  return (
    <MotionTag className={className} initial={false} variants={variants}>
      {children}
    </MotionTag>
  );
}

export function HeroPhotoColumn({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Параллакс 0.3x — фото двигается медленнее скролла, только transform.
  const rawY = useTransform(scrollYProgress, [0, 1], [0, 60]);
  const y = shouldReduceMotion ? 0 : rawY;

  return (
    <motion.div
      ref={ref}
      className="relative order-1 -mx-4 aspect-[16/10] w-[calc(100%+2rem)] overflow-hidden rounded-none md:order-2 md:mx-0 md:aspect-auto md:h-[560px] md:w-full md:rounded-[var(--radius-xl)]"
      style={{ y }}
    >
      {children}
    </motion.div>
  );
}

