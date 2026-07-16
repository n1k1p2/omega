import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ContactCallbackForm } from "./ContactCallbackForm";
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL, SUPPORT_EMAIL, SUPPORT_HOURS } from "@/lib/api";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Адрес, телефон и почта фабрики мебели Омега в Юрьевце, Ивановская область. Часы работы консультантов и форма заказа звонка.",
};

const CONTACT_ITEMS = [
  { icon: MapPin, label: "Адрес", value: "Ивановская область, г. Юрьевец" },
  { icon: Phone, label: "Телефон", value: SUPPORT_PHONE, href: `tel:${SUPPORT_PHONE_TEL}` },
  { icon: Mail, label: "Почта", value: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` },
  { icon: Clock, label: "Часы работы консультантов", value: SUPPORT_HOURS },
];

export default function ContactsPage() {
  return (
    <div className="container-omega py-5 md:py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Контакты" }]} />
      </div>

      <h1 className="mb-4 font-display text-[32px] font-bold md:text-[48px]">Контакты</h1>
      <p className="max-w-2xl text-lg text-[var(--color-foreground-muted)]">
        Свяжитесь с нами удобным способом — ответим на вопросы о моделях, доставке и оплате.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {CONTACT_ITEMS.map((item) => (
            <div key={item.label} className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-soft)]">
                <item.icon size={20} className="text-[#963B26]" />
              </div>
              <div>
                <p className="text-sm text-[var(--color-foreground-muted)]">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="font-display text-lg font-semibold hover:text-[var(--color-primary)]">
                    {item.value}
                  </a>
                ) : (
                  <p className="font-display text-lg font-semibold">{item.value}</p>
                )}
              </div>
            </div>
          ))}

          <p className="mt-2 text-sm text-[var(--color-foreground-muted)]">
            ООО «Мебель Омега» · ОГРН 1133702026468 · производство полного цикла в Ивановской области
          </p>

          <div className="mt-2 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)]">
            <iframe
              title="Фабрика «Омега» на карте — г. Юрьевец, Ивановская область"
              src="https://yandex.ru/map-widget/v1/?text=Ивановская%20область%2C%20г.%20Юрьевец&z=13"
              width="100%"
              height="320"
              loading="lazy"
              style={{ border: 0, display: "block" }}
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <div className="rounded-[var(--radius-xl)] bg-[var(--color-background-alt)] p-6 md:p-8">
          <h2 className="mb-1 font-display text-xl font-semibold">Закажите обратный звонок</h2>
          <p className="mb-6 text-sm text-[var(--color-foreground-muted)]">
            Оставьте имя и телефон — перезвоним в ближайшее рабочее время
          </p>
          <ContactCallbackForm />
        </div>
      </div>
    </div>
  );
}
