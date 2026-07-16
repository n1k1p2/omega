import { Truck, CreditCard, Calculator } from "lucide-react";
import { DeliveryCallbackForm } from "@/components/common/DeliveryCallbackForm";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

export function DeliverySection() {
  return (
    <section className="py-16 md:py-24">
      <div className="container-omega grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
        <Reveal className="order-2 md:order-1" direction="left" duration={0.7}>
          <svg viewBox="0 0 400 400" className="mx-auto w-full max-w-sm text-[var(--color-accent)]" aria-hidden>
            <path
              d="M80 100 Q60 200 120 260 Q160 300 200 280 Q260 320 320 260 Q360 200 300 140 Q320 80 260 60 Q200 30 150 60 Q100 70 80 100 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              opacity="0.4"
            />
            <circle cx="120" cy="150" r="6" fill="currentColor" />
            <circle cx="260" cy="110" r="6" fill="currentColor" />
            <circle cx="220" cy="250" r="6" fill="currentColor" />
            <circle cx="150" cy="230" r="6" fill="currentColor" />
          </svg>
        </Reveal>

        <div className="order-1 md:order-2">
          <Reveal direction="right" duration={0.7}>
            <h2 className="font-display text-[26px] font-semibold md:text-[36px]">
              Доставим туда, куда не берутся другие
            </h2>
            <p className="mt-2 text-[var(--color-foreground-muted)]">
              от Калининграда до Владивостока — в любой населённый пункт России
            </p>
          </Reveal>

          <RevealGroup className="mt-6 flex flex-col gap-4" stagger={0.08}>
            <RevealItem className="flex items-start gap-3">
              <Truck size={20} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
              <p className="text-sm text-[var(--color-foreground-muted)]">
                Расчёт стоимости и срока — по весу товара и пункту назначения, точную сумму сообщит менеджер
              </p>
            </RevealItem>
            <RevealItem className="flex items-start gap-3">
              <CreditCard size={20} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
              <p className="text-sm text-[var(--color-foreground-muted)]">
                Оплата курьеру при получении (только Москва в пределах МКАД), картой по ссылке или по счёту
              </p>
            </RevealItem>
            <RevealItem className="flex items-start gap-3">
              <Calculator size={20} className="mt-0.5 shrink-0 text-[var(--color-accent)]" />
              <p className="text-sm text-[var(--color-foreground-muted)]">
                Оставьте город и телефон — перезвоним с точным расчётом
              </p>
            </RevealItem>
          </RevealGroup>

          <Reveal delay={0.1}>
            <div className="mt-6">
              <DeliveryCallbackForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
