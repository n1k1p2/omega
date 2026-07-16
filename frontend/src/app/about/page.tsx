import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TreePine, Link2, Shirt, Wrench, Factory, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "О фабрике",
  description: "Фабрика мебели «Омега» — полный цикл производства в Юрьевце, Ивановская область. Массив берёзы, без посредников, на рынке с 2013 года.",
};

const VALUES = [
  {
    icon: TreePine,
    title: "Массив берёзы",
    text: "Работаем с натуральной берёзой — экологичным материалом без резких запахов химии, который славится прочностью и теплом на ощупь.",
  },
  {
    icon: Link2,
    title: "Двойное крепление углов кроватей",
    text: "Инженерное решение, а не рекламный эпитет: угловые соединения кроватей укреплены вдвойне, поэтому конструкция не расшатывается годами.",
  },
  {
    icon: Shirt,
    title: "Съёмные чехлы диванов",
    text: "Обивка выполнена как съёмный чехол — его легко снять для чистки или заменить на новый, если в доме дети или животные.",
  },
  {
    icon: Wrench,
    title: "Фурнитура от лучших производителей",
    text: "Механизмы трансформации, крепёж и фурнитуру закупаем у проверенных поставщиков — не экономим на комплектующих, которые не видны на фото.",
  },
];

const TRUST_POINTS = [
  {
    icon: Factory,
    title: "Полный цикл производства",
    text: "От раскроя массива до сборки готового изделия — всё происходит на одной площадке, без посредников между цехом и покупателем.",
  },
  {
    icon: ShieldCheck,
    title: "На рынке с 2013 года",
    text: "Больше десяти лет специализируемся на мебели из массива берёзы для спален, гостиных и прихожих.",
  },
];

export default function AboutPage() {
  return (
    <div className="pb-8">
      <div className="container-omega py-5">
        <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "О фабрике" }]} />
      </div>

      <section className="container-omega grid grid-cols-1 items-center gap-10 py-6 md:grid-cols-2 md:gap-16 md:py-10">
        <div>
          <h1 className="font-display text-[32px] font-bold leading-tight md:text-[48px]">
            Фабрика мебели «Омега»
          </h1>
          <p className="mt-4 text-lg text-[var(--color-foreground-muted)]">
            Мы производим мебель из массива берёзы полного цикла — в городе Юрьевец, Ивановская область.
            Без аренды сторонних мощностей и кредитных обязательств, а значит без лишней наценки в цене
            для покупателя.
          </p>
          <p className="mt-4 text-[var(--color-foreground-muted)]">
            Продажа мебели ведётся от ООО «Мебель Омега» (ОГРН 1133702026468). Мы отвечаем за качество каждого
            изделия — от выбора древесины до финальной сборки.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/catalog">
              <Button variant="primary" size="l">
                Смотреть каталог
              </Button>
            </Link>
            <Link href="/contacts">
              <Button variant="secondary" size="l">
                Связаться с нами
              </Button>
            </Link>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-xl)] shadow-[var(--shadow-lg)]">
          <Image
            src="/brand/banner-1.jpg"
            alt="Производство фабрики мебели Омега"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </section>

      <section className="bg-[var(--color-dark)] py-16 text-white md:py-24">
        <div className="container-omega">
          <h2 className="mb-10 text-center font-display text-[26px] font-semibold md:mb-14 md:text-[36px]">
            Из чего и как мы делаем мебель
          </h2>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <v.icon size={22} className="text-[var(--color-brass-footer)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{v.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{v.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-omega py-16 md:py-24">
        <h2 className="mb-10 text-center font-display text-[26px] font-semibold md:mb-14 md:text-[36px]">
          Почему нам доверяют
        </h2>
        <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          {TRUST_POINTS.map((p) => (
            <div key={p.title} className="flex flex-col gap-3 rounded-[var(--radius-lg)] bg-[var(--color-background-alt)] p-6 text-center">
              <p.icon size={28} className="mx-auto text-[var(--color-accent-2)]" />
              <h3 className="font-display text-lg font-semibold">{p.title}</h3>
              <p className="text-sm text-[var(--color-foreground-muted)]">{p.text}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)]">
            <Image src="/brand/banner-2.jpg" alt="Мебель фабрики Омега" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)]">
            <Image src="/brand/banner-3.jpg" alt="Мебель фабрики Омега в интерьере" fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
          </div>
        </div>
      </section>

      <section className="container-omega">
        <div className="flex flex-col items-center gap-4 rounded-[var(--radius-xl)] bg-[var(--color-primary)] px-6 py-12 text-center text-white md:py-16">
          <h2 className="font-display text-2xl font-semibold md:text-3xl">Готовы выбрать мебель для своего дома?</h2>
          <p className="max-w-xl text-white/85">
            Загляните в каталог или позвоните — расскажем о материалах и поможем подобрать модель под ваш интерьер.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href="/catalog">
              <Button variant="dark" size="l">
                Перейти в каталог
              </Button>
            </Link>
            <Link href="/contacts">
              <Button
                variant="secondary"
                size="l"
                className="border-white bg-transparent text-white hover:bg-white/10 hover:text-white"
              >
                Контакты
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
