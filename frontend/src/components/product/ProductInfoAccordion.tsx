import type { Product } from "@/types/catalog";
import { Accordion } from "@/components/ui/Accordion";
import { DeliveryCallbackForm } from "@/components/common/DeliveryCallbackForm";

export function ProductInfoAccordion({ product }: { product: Product }) {
  const items = [
    {
      id: "description",
      title: "Описание",
      content: <p className="whitespace-pre-line">{product.description}</p>,
    },
    {
      id: "features",
      title: "Характеристики",
      content: (
        <table className="w-full text-sm">
          <tbody>
            {Object.entries(product.features).map(([key, value]) => (
              <tr key={key} className="border-b border-[var(--color-border)] last:border-0">
                <td className="py-2 pr-4 text-[var(--color-foreground-muted)]">{key}</td>
                <td className="py-2 font-medium text-[var(--color-foreground)]">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      id: "delivery",
      title: "Доставка и оплата",
      content: (
        <div className="flex flex-col gap-3">
          <p>
            Доставим в любой населённый пункт России. Точную стоимость и срок рассчитает менеджер после
            оформления заказа исходя из веса товара и пункта назначения.
          </p>
          <p>
            Оплата: картой (менеджер пришлёт ссылку на оплату), курьеру при получении (только Москва в
            пределах МКАД), безналичным расчётом по счёту.
          </p>
          <DeliveryCallbackForm productSlug={product.slug} />
        </div>
      ),
    },
  ];

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-6">
      <Accordion items={items} defaultOpenId="description" />
    </div>
  );
}
