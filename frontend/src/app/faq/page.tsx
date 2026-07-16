import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { SUPPORT_PHONE } from "@/lib/api";

export const metadata: Metadata = {
  title: "Частые вопросы",
  description: "Ответы на частые вопросы о заказе, оплате и доставке мебели фабрики Омега.",
};

const FAQ_ITEMS = [
  {
    id: "order",
    title: "Как оформить заказ?",
    content:
      "Выберите товар в каталоге и нажмите «Оформить заказ» или «Купить в 1 клик». Для оформления достаточно указать имя, телефон и город — менеджер перезвонит и подтвердит детали.",
  },
  {
    id: "payment",
    title: "Как оплатить заказ?",
    content:
      "Картой — менеджер пришлёт ссылку на оплату; курьеру при получении (только Москва в пределах МКАД); безналичным расчётом по счёту. Предоплата при оформлении заказа на сайте не требуется.",
  },
  {
    id: "delivery",
    title: "Как рассчитывается доставка?",
    content:
      "Мы доставляем в любой населённый пункт России. Стоимость и срок зависят от веса товара и пункта назначения — их рассчитывает менеджер после оформления заказа и сообщает по телефону.",
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
  {
    id: "material",
    title: "Из какого материала сделана мебель?",
    content:
      "Мы работаем с массивом берёзы — экологичным материалом без резких запахов химии. У кроватей — двойное крепление угловых соединений, у диванов — съёмные чехлы, которые легко снять для чистки.",
  },
  {
    id: "account",
    title: "Зачем регистрироваться в личном кабинете?",
    content:
      "Регистрация не обязательна для заказа — можно оформить его как гость. В личном кабинете удобно отслеживать статусы своих заказов и не вводить контактные данные заново.",
  },
];

export default function FaqPage() {
  return (
    <div className="container-omega py-5 md:py-8">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Частые вопросы" }]} />
      </div>

      <h1 className="mb-6 font-display text-[32px] font-bold md:text-[48px]">Частые вопросы</h1>

      <div className="max-w-3xl rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6">
        <Accordion items={FAQ_ITEMS} />
      </div>

      <div className="mt-10 flex max-w-3xl flex-col items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-background-alt)] p-8 text-center">
        <p className="font-display text-lg font-semibold">Не нашли ответ на свой вопрос?</p>
        <p className="text-sm text-[var(--color-foreground-muted)]">Позвоните нам или напишите — ответим лично</p>
        <Link href="/contacts">
          <Button variant="primary">Связаться с нами</Button>
        </Link>
      </div>
    </div>
  );
}
