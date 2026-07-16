"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Числовой счётчик 0 → target при входе в viewport, один раз (IntersectionObserver).
 * SSR-разметка сразу показывает финальное значение (правка В11 — ничего не скрыто
 * до гидрации), JS лишь на клиенте проигрывает анимацию поверх.
 */
export function AnimatedCounter({
  target,
  suffix = "",
  duration = 1600,
  className,
}: {
  target: number;
  suffix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(target);
  // Ref-флаг (не state) — читается синхронно внутри замыканий IntersectionObserver
  // и таймера-фолбэка ниже, не подвержен проблеме "устаревшего замыкания" (stale
  // closure), в отличие от state-переменной, захваченной в момент монтирования.
  const hasStartedRef = useRef(false);

  useEffect(() => {
    // Сброс к 0 перед стартом наблюдения — намеренный setState в эффекте:
    // счётчик синхронизируется с внешней системой (IntersectionObserver),
    // а не с производным от props состоянием, которое можно посчитать при рендере.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(0);
    const el = ref.current;
    if (!el) return;

    function runCountUp() {
      if (hasStartedRef.current) return;
      hasStartedRef.current = true;
      const start = performance.now();
      function tick(now: number) {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(Math.round(eased * target));
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }

    if (typeof IntersectionObserver === "undefined") {
      // Нет поддержки IntersectionObserver — считаем сразу, лишь бы не застрять на 0.
      runCountUp();
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            runCountUp();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.3 },
    );
    observer.observe(el);

    // Защитный фолбэк: если по какой-то причине observer ни разу не сработал
    // за разумное время — досчитываем сами, чтобы счётчик не завис на 0
    // навсегда. `hasStartedRef` гарантирует, что реальный запуск произойдёт
    // только один раз, кто бы его ни инициировал первым.
    const fallbackTimer = window.setTimeout(runCountUp, 1200);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <span ref={ref} className={className}>
      <span className="tabular-nums">{value}</span>
      {suffix}
    </span>
  );
}
