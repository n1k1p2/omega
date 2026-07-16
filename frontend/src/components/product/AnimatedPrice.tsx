"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionValue, useReducedMotion, animate } from "framer-motion";
import { formatPrice } from "@/lib/format";

/**
 * "Одометр" пересчёта цены — единственное исключение дизайн-системы (правка К2),
 * где число реально анимированно прокатывается от старого к новому значению:
 * переключение отделки «Элит +10%» на PDP. 300-400ms, tabular-nums (Manrope).
 * Поддерживает и одиночную цену, и честный диапазон "от X до Y ₽" — оба числа
 * анимируются независимо, синхронно.
 */
function useAnimatedNumber(value: number | null | undefined): number | null | undefined {
  const shouldReduceMotion = useReducedMotion();
  const motionValue = useMotionValue(value ?? 0);
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current === value) return;
    prevValue.current = value;

    // setDisplay здесь синхронизирует React-состояние с императивным API
    // framer-motion (`animate()`) — тем же внешним по отношению к React
    // источником, что и в AnimatedCounter (см. комментарий там). Ветки
    // null/reduced-motion — синхронный частный случай той же синхронизации,
    // не производное от props состояние, которое можно посчитать при рендере.
    if (value == null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }

    if (shouldReduceMotion) {
      setDisplay(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value, motionValue, shouldReduceMotion]);

  return display;
}

export function AnimatedPriceRange({
  price,
  priceMax,
  className,
}: {
  price: number | null | undefined;
  priceMax: number | null | undefined;
  className?: string;
}) {
  const animatedPrice = useAnimatedNumber(price);
  const animatedPriceMax = useAnimatedNumber(priceMax);

  if (price == null) {
    return <span className={className}>Цена по запросу</span>;
  }

  const text =
    animatedPriceMax && animatedPriceMax > (animatedPrice ?? 0)
      ? `от ${formatPrice(animatedPrice)} до ${formatPrice(animatedPriceMax)}`
      : formatPrice(animatedPrice);

  return (
    <span className={className} suppressHydrationWarning>
      {text}
    </span>
  );
}
