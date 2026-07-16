import { Accordion } from "@/components/ui/Accordion";
import { SUPPORT_PHONE } from "@/lib/api";
import { Reveal } from "@/components/motion/Reveal";

const FAQ_ITEMS = [
  {
    id: "payment",
    title: "Как оплатить заказ?",
    content:
      "Картой — менеджер пришлёт ссылку на оплату; курьеру при получении (только Москва в пределах МКАД); безналичным расчётом по счёту для юрлиц.",
  },
  {
    id: "delivery",
    title: "Как рассчитывается доставка?",
    content:
      "Мы доставляем в любой населённый пункт России. Стоимость и срок зависят от веса товара и пункта назначения — их рассчитывает менеджер после оформления заказа.",
  },
  {
    id: "warranty",
    title: "Есть ли гарантия?",
    content: "Да, гарантия производителя действует на всю мебель фабрики Омега.",
  },
  {
    id: "return",
    title: "Можно ли вернуть товар?",
    content: `Свяжитесь с нами по телефону ${SUPPORT_PHONE} — обсудим детали конкретного случая, мы работаем по законодательству РФ о защите прав потребителей.`,
  },
  {
    id: "assembly",
    title: "Сборка входит в стоимость?",
    content: "Уточните этот момент у менеджера при оформлении заказа — по конкретной модели условия могут отличаться.",
  },
  {
    id: "custom",
    title: "Можно сделать мебель на заказ, под нестандартный размер?",
    content: `Звоните нам по телефону ${SUPPORT_PHONE} — обсудим возможность индивидуального изготовления.`,
  },
];

export function FAQSection() {
  return (
    <section className="bg-[var(--color-background-alt)] py-16 md:py-24">
      <div className="container-omega max-w-3xl">
        <Reveal>
          <h2 className="mb-8 text-center font-display text-[26px] font-semibold md:mb-12 md:text-[36px]">
            Частые вопросы
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="rounded-[var(--radius-lg)] bg-[var(--color-surface)] px-6">
            <Accordion items={FAQ_ITEMS} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
