"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BedDouble, Sofa, Baby, Trees } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Квиз-подборщик — 2 шага, оба маппятся на реальные параметры /products/
 * (category, min_price/max_price), правка В13 дизайн-системы.
 * Переключение шагов: slide-horizontal + fade, 300ms (§6 анимаций).
 */
const ROOM_OPTIONS = [
  { key: "spalnya", label: "Спальня", icon: BedDouble, categories: ["krovati"] },
  { key: "gostinaya", label: "Гостиная", icon: Sofa, categories: ["divany"] },
  { key: "detskaya", label: "Детская", icon: Baby, categories: ["krovati", "shkafy"] },
  { key: "dacha", label: "Дача", icon: Trees, categories: [] }, // все категории
] as const;

const BUDGET_OPTIONS = [
  { key: "low", label: "до 30 000 ₽", min: undefined, max: 30000 },
  { key: "mid", label: "30 000–60 000 ₽", min: 30000, max: 60000 },
  { key: "high", label: "от 60 000 ₽", min: 60000, max: undefined },
] as const;

const EASE = [0.22, 1, 0.36, 1] as const;

export function QuizPicker() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [room, setRoom] = useState<(typeof ROOM_OPTIONS)[number]["key"] | null>(null);

  function handleBudgetSelect(budget: (typeof BUDGET_OPTIONS)[number]) {
    const roomOption = ROOM_OPTIONS.find((r) => r.key === room);
    const category = roomOption?.categories[0];
    const params = new URLSearchParams();
    if (category) params.set("category_hint", category);
    if (budget.min) params.set("min_price", String(budget.min));
    if (budget.max) params.set("max_price", String(budget.max));

    const path = category ? `/catalog/${category}` : "/catalog";
    router.push(`${path}?${params.toString()}`);
  }

  const slideDistance = shouldReduceMotion ? 0 : 24;

  return (
    <section className="py-16 md:py-24">
      <div className="container-omega">
        <Reveal
          id="quiz-picker"
          className="overflow-hidden rounded-[var(--radius-xl)] bg-[var(--color-surface)] p-6 md:p-12 scroll-mt-24"
          duration={0.7}
          style={{ boxShadow: "var(--shadow-glow-amber)" }}
        >
          <div className="mb-8 text-center">
            <h2 className="font-display text-2xl font-semibold md:text-[32px]">
              Не знаете, что выбрать? Ответим за минуту
            </h2>
          </div>

          {/* Прогресс-бар — scaleX вместо width (только transform, §6 анимаций) */}
          <div className="mx-auto mb-8 h-1.5 max-w-md overflow-hidden rounded-full bg-[var(--color-border)]">
            <motion.div
              className="h-full w-full origin-left rounded-full"
              style={{ background: "var(--gradient-amber)" }}
              initial={false}
              animate={{ scaleX: step === 0 ? 0.5 : 1 }}
              transition={{ duration: 0.3, ease: EASE }}
            />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {step === 0 && (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: -slideDistance }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -slideDistance }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <p className="mb-5 text-center font-semibold">Для какой комнаты подбираем мебель?</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {ROOM_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      onClick={() => {
                        setRoom(opt.key);
                        setStep(1);
                      }}
                      className="flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 text-center transition-all duration-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-soft)]/40 active:scale-[0.98]"
                    >
                      <opt.icon size={28} className="text-[var(--color-accent)]" />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: slideDistance }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: slideDistance }}
                transition={{ duration: 0.3, ease: EASE }}
              >
                <p className="mb-5 text-center font-semibold">Какой бюджет рассматриваете?</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {BUDGET_OPTIONS.map((b) => (
                    <Chip key={b.key} onClick={() => handleBudgetSelect(b)}>
                      {b.label}
                    </Chip>
                  ))}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="ghost" onClick={() => setStep(0)}>
                    ← Назад
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Reveal>
      </div>
    </section>
  );
}
