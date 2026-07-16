"use client";

import { MotionConfig } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Глобальный guard prefers-reduced-motion (§6 анимаций, обязательное правило):
 * "user" — framer-motion сам читает `window.matchMedia('(prefers-reduced-motion: reduce)')`
 * и для ВСЕХ motion-компонентов дерева (включая AnimatePresence-оверлеи:
 * модалки, корзину, мобильное меню, тосты и т.д., которые не завязаны на
 * собственный useReducedMotion()) автоматически убирает/сокращает анимации
 * transform, оставляя лишь мгновенные состояния — единая точка защиты поверх
 * точечных вызовов useReducedMotion() в Reveal/Hero/параллаксе/счётчиках.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
