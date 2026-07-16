"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Phone, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL, SUPPORT_HOURS } from "@/lib/api";
import { formatPrice } from "@/lib/format";

interface LastOrder {
  number: string;
  total: number;
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("omega_last_order");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      // нет сохранённого заказа — покажем общее сообщение об успехе
    } finally {
      setChecked(true);
    }
  }, []);

  if (!checked) return null;

  return (
    <div className="container-omega flex flex-col items-center py-16 text-center md:py-24">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--color-success)]/10">
        <CheckCircle2 size={44} className="text-[var(--color-success)]" />
      </div>

      <h1 className="font-display text-[28px] font-bold md:text-[36px]">Заказ оформлен!</h1>

      {order ? (
        <p className="mt-3 text-lg text-[var(--color-foreground-muted)]">
          Номер заказа <span className="font-semibold text-[var(--color-foreground)]">{order.number}</span> на сумму{" "}
          <span className="font-semibold text-[var(--color-foreground)]">{formatPrice(order.total)}</span>
        </p>
      ) : (
        <p className="mt-3 text-lg text-[var(--color-foreground-muted)]">
          Спасибо! Мы приняли ваш заказ в работу.
        </p>
      )}

      <div className="mt-8 flex max-w-md flex-col gap-4 rounded-[var(--radius-lg)] bg-[var(--color-background-alt)] p-6 text-left">
        <h2 className="font-display text-lg font-semibold">Что дальше?</h2>
        <div className="flex items-start gap-3 text-sm">
          <Phone size={18} className="mt-0.5 shrink-0 text-[var(--color-accent-2)]" />
          <p>Наш менеджер позвонит вам, чтобы подтвердить состав заказа и рассчитать стоимость и срок доставки.</p>
        </div>
        <div className="flex items-start gap-3 text-sm">
          <Clock size={18} className="mt-0.5 shrink-0 text-[var(--color-accent-2)]" />
          <p>Работаем {SUPPORT_HOURS}. Если оформили заказ в нерабочее время — перезвоним первым делом на следующий рабочий день.</p>
        </div>
        <a
          href={`tel:${SUPPORT_PHONE_TEL}`}
          className="flex items-center gap-2 font-display text-xl font-semibold text-[var(--color-primary)]"
        >
          <Phone size={18} />
          {SUPPORT_PHONE}
        </a>
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/catalog">
          <Button variant="primary" size="l">
            Продолжить покупки
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" size="l">
            На главную
          </Button>
        </Link>
      </div>
    </div>
  );
}
