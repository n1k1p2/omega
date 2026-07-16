"use client";

import { useState, type ReactNode } from "react";
import { Plus } from "lucide-react";
import clsx from "clsx";

interface AccordionItemData {
  id: string;
  title: string;
  content: ReactNode;
}

/**
 * Аккордеон — используется на PDP (описание/характеристики/доставка/отзывы)
 * и FAQ. Разворачивание через grid-template-rows 0fr->1fr (плавно, без CLS,
 * см. правку С6 — единственное осознанное исключение из правила
 * "анимировать только transform/opacity", допустимое т.к. срабатывает
 * только по клику пользователя, локально в пределах блока).
 */
export function Accordion({
  items,
  defaultOpenId,
}: {
  items: AccordionItemData[];
  defaultOpenId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? items[0]?.id ?? null);

  return (
    <div className="flex flex-col">
      {items.map((item) => {
        const isOpen = openId === item.id;
        return (
          <div key={item.id} className="border-b border-[var(--color-border)]">
            <button
              onClick={() => setOpenId(isOpen ? null : item.id)}
              className="flex h-14 w-full cursor-pointer items-center justify-between text-left font-bold"
              aria-expanded={isOpen}
            >
              {item.title}
              <Plus
                size={20}
                className={clsx("shrink-0 text-[var(--color-foreground-muted)] transition-transform duration-200", isOpen && "rotate-45")}
              />
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-300 ease-in-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="pb-5 text-sm leading-relaxed text-[var(--color-foreground-muted)]">
                  {item.content}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
