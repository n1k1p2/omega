"use client";

import { useEffect, useRef } from "react";
import { animate, useMotionValue, useReducedMotion } from "framer-motion";

/**
 * Бейдж корзины в хедере — pop-анимация при добавлении товара (§6:
 * "Toast-уведомления... иконка внутри может иметь микро-bounce"). Здесь тот же
 * приём применён к самому счётчику корзины: при увеличении count — scale
 * 0.8→1.15→1 на transform, без layout-сдвига (position: absolute уже задан
 * родителем).
 */
export function CartBadge({ count }: { count: number }) {
  const shouldReduceMotion = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const scale = useMotionValue(1);
  const prevCount = useRef(count);

  useEffect(() => {
    if (count === prevCount.current) return;
    const increased = count > prevCount.current;
    prevCount.current = count;
    if (shouldReduceMotion || !increased || !ref.current) return;

    const controls = animate(scale, [0.8, 1.2, 1], {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.style.transform = `scale(${latest})`;
      },
    });
    return () => controls.stop();
  }, [count, scale, shouldReduceMotion]);

  if (count <= 0) return null;

  return (
    <span
      ref={ref}
      className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[10px] font-bold text-white tabular-nums"
    >
      {count}
    </span>
  );
}
