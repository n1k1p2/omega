import type { Metadata } from "next";
import { Truck, CreditCard, Banknote, FileText, PhoneCall, PackageCheck, ClipboardCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { DeliveryCallbackForm } from "@/components/common/DeliveryCallbackForm";
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL, SUPPORT_HOURS } from "@/lib/api";

export const metadata: Metadata = {
  title: "Доставка и оплата",
  description: "Как рассчитывается доставка мебели по России и какие способы оплаты доступны на фабрике Омега.",
};

const PAYMENT_METHODS = [
  {
    icon: Truck,
    title: "Курьеру при получении",
    text: "Только для Москвы в пределах МКАД — оплата наличными или картой курьеру в момент доставки.",
  },
  {
    icon: CreditCard,
    title: "Картой по ссылке",
    text: "Менеджер пришлёт персональную ссылку на оплату после подтверждения заказа — платите онлайн, не выходя из дома.",
  },
  {
    icon: Banknote,
    title: "Безналичный расчёт",
    text: "Оплата по счёту — удобно для организаций и тех, кто предпочитает банковский перевод.",
  },
];

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "1. Оформляете заказ на сайте",
    text: "Выбираете товар, указываете контакты, город и удобный способ оплаты. Предоплата не требуется.",
  },
  {
    icon: PhoneCall,
    title: "2. Менеджер подтверждает заказ",
    text: "Мы позвоним в рабочее время, уточним детали и рассчитаем точную стоимость и срок доставки — исходя из веса товара и пункта назначения.",
  },
  {
    icon: FileText,
    title: "3. Согласовываем детали",
    text: "Подтверждаете стоимость доставки и способ оплаты, при необходимости — дату и время.",
  },
  {
    icon: PackageCheck,
    title: "4. Получаете мебель",
    text: "Доставляем в любой населённый пункт России — от крупных городов до небольших посёлков.",
  },
];

export default function DeliveryPage() {
  return (
    <div className="container-omega py-5 md:py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Доставка и оплата" }]} />
      </div>

      <h1 className="mb-4 font-display text-[32px] font-bold md:text-[48px]">Доставка и оплата</h1>
      <p className="max-w-2xl text-lg text-[var(--color-foreground-muted)]">
        Доставляем мебель в любой населённый пункт России. Точную стоимость и срок доставки рассчитывает
        менеджер после оформления заказа — честно, без скрытых наценок в последний момент.
      </p>

      <section className="mt-12">
        <h2 className="mb-6 font-display text-2xl font-semibold">Как рассчитывается стоимость доставки</h2>
        <p className="max-w-2xl text-[var(--color-foreground-muted)]">
          Расчёт производится исходя из веса товара и пункта назначения. Мы не можем показать точную сумму
          автоматически на сайте — слишком много факторов (габариты, транспортная компания, удалённость),
          поэтому после оформления заказа с вами свяжется менеджер и назовёт итоговую стоимость и срок.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="mb-6 font-display text-2xl font-semibold">Способы оплаты</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          {PAYMENT_METHODS.map((m) => (
            <div key={m.title} className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              <m.icon size={26} className="text-[var(--color-accent-2)]" />
              <h3 className="font-semibold">{m.title}</h3>
              <p className="text-sm text-[var(--color-foreground-muted)]">{m.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-6 font-display text-2xl font-semibold">Этапы оформления заказа</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {STEPS.map((s) => (
            <div key={s.title} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
                <s.icon size={22} className="text-[#963B26]" />
              </div>
              <div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">{s.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14 rounded-[var(--radius-xl)] bg-[var(--color-background-alt)] p-6 md:p-10">
        <h2 className="mb-2 font-display text-2xl font-semibold">Хотите узнать стоимость доставки заранее?</h2>
        <p className="mb-6 max-w-xl text-[var(--color-foreground-muted)]">
          Оставьте город и телефон — перезвоним и назовём примерную стоимость и срок ещё до оформления заказа.
        </p>
        <div className="max-w-2xl">
          <DeliveryCallbackForm />
        </div>
      </section>

      <section className="mt-14 flex flex-col items-center gap-2 text-center">
        <p className="text-[var(--color-foreground-muted)]">Остались вопросы о доставке и оплате?</p>
        <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-display text-2xl font-semibold text-[var(--color-primary)]">
          {SUPPORT_PHONE}
        </a>
        <p className="text-sm text-[var(--color-foreground-muted)]">{SUPPORT_HOURS}</p>
      </section>
    </div>
  );
}
