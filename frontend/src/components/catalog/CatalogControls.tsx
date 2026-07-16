"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";

const SORT_OPTIONS = [
  { value: "popular", label: "По популярности" },
  { value: "price", label: "Сначала дешёвые" },
  { value: "-price", label: "Сначала дорогие" },
  { value: "-created_at", label: "Новинки" },
] as const;

const BUDGET_CHIPS = [
  { label: "до 30 000 ₽", min: undefined, max: 30000 },
  { label: "30 000–60 000 ₽", min: 30000, max: 60000 },
  { label: "от 60 000 ₽", min: 60000, max: undefined },
] as const;

export function CatalogControls() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const ordering = searchParams.get("ordering") || "popular";
  const minPrice = searchParams.get("min_price");
  const maxPrice = searchParams.get("max_price");
  const isBestseller = searchParams.get("bestseller") === "1";
  const isNew = searchParams.get("new") === "1";

  const activeFilterCount = [minPrice || maxPrice, isBestseller, isNew].filter(Boolean).length;

  function updateParams(updates: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === undefined) params.delete(key);
      else params.set(key, value);
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  }

  function toggleBudget(budget: (typeof BUDGET_CHIPS)[number]) {
    const isActive = minPrice === String(budget.min ?? "") && maxPrice === String(budget.max ?? "");
    if (isActive) {
      updateParams({ min_price: undefined, max_price: undefined });
    } else {
      updateParams({
        min_price: budget.min ? String(budget.min) : undefined,
        max_price: budget.max ? String(budget.max) : undefined,
      });
    }
  }

  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setFiltersOpen(true)}
          className="flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 text-sm font-medium lg:hidden cursor-pointer"
        >
          <SlidersHorizontal size={16} />
          Фильтры{activeFilterCount > 0 && ` (${activeFilterCount})`}
        </button>

        <div className="hidden flex-wrap gap-2 lg:flex">
          {BUDGET_CHIPS.map((b) => (
            <Chip
              key={b.label}
              active={minPrice === String(b.min ?? "") && maxPrice === String(b.max ?? "")}
              onClick={() => toggleBudget(b)}
            >
              {b.label}
            </Chip>
          ))}
          <Chip active={isBestseller} onClick={() => updateParams({ bestseller: isBestseller ? undefined : "1" })}>
            Хиты
          </Chip>
          <Chip active={isNew} onClick={() => updateParams({ new: isNew ? undefined : "1" })}>
            Новинки
          </Chip>
        </div>

        <select
          value={ordering}
          onChange={(e) => updateParams({ ordering: e.target.value })}
          className="h-11 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 text-sm outline-none focus:border-[var(--color-primary)]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Mobile chips row — правый fade-hint подсказывает, что ряд можно проскроллить (правка по UX-ревью) */}
      <div className="relative lg:hidden">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {BUDGET_CHIPS.map((b) => (
            <Chip
              key={b.label}
              active={minPrice === String(b.min ?? "") && maxPrice === String(b.max ?? "")}
              onClick={() => toggleBudget(b)}
              className="shrink-0"
            >
              {b.label}
            </Chip>
          ))}
          <Chip active={isBestseller} onClick={() => updateParams({ bestseller: isBestseller ? undefined : "1" })} className="shrink-0">
            Хиты
          </Chip>
          <Chip active={isNew} onClick={() => updateParams({ new: isNew ? undefined : "1" })} className="shrink-0">
            Новинки
          </Chip>
        </div>
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--color-background)] to-transparent"
          aria-hidden
        />
      </div>

      {/* Mobile filters bottom sheet (только цена, правка К1) */}
      <AnimatePresence>
        {filtersOpen && (
          <div className="fixed inset-0 z-[80] flex items-end lg:hidden">
            <motion.div
              className="absolute inset-0 bg-[rgba(43,36,32,0.5)]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setFiltersOpen(false)}
            />
            <motion.div
              className="relative flex max-h-[85vh] w-full flex-col rounded-t-[var(--radius-xl)] bg-[var(--color-surface)] p-5"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 34 }}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-semibold">Фильтры</h3>
                <button onClick={() => setFiltersOpen(false)} aria-label="Закрыть" className="flex h-11 w-11 items-center justify-center cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <p className="mb-2 text-sm font-semibold">Цена</p>
              <div className="mb-6 flex flex-wrap gap-2">
                {BUDGET_CHIPS.map((b) => (
                  <Chip
                    key={b.label}
                    active={minPrice === String(b.min ?? "") && maxPrice === String(b.max ?? "")}
                    onClick={() => toggleBudget(b)}
                  >
                    {b.label}
                  </Chip>
                ))}
              </div>
              <Button onClick={() => setFiltersOpen(false)} size="l" fullWidth>
                Показать товары
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
