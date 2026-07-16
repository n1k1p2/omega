import Link from "next/link";
import { CalendarCheck, LayoutGrid, Truck, ShieldCheck, Check } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

const FACTS = [
  "Свой завод в Ивановской области — без аренды шоурумов и наценок посредников",
  "Массив берёзы: экологично, прочно, служит десятилетиями",
  "Двойное крепление углов — кровати не расшатываются",
  "Съёмные чехлы диванов — легко стирать, легко освежить интерьер",
];

export function WhyOmega() {
  return (
    <section className="bg-[var(--color-background-alt)] py-16 md:py-24">
      <div className="container-omega">
        <Reveal className="mb-10 text-center md:mb-14">
          <h2 className="font-display text-[26px] font-semibold md:text-[36px]">Почему фабрика Омега</h2>
        </Reveal>

        <RevealGroup className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6" amount={0.25}>
          <RevealItem className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-sm)]">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--gradient-brass-glow)" }}>
              <CalendarCheck className="text-[var(--color-accent)]" size={28} />
            </div>
            <AnimatedCounter target={13} suffix="+ лет" duration={600} className="font-display text-[30px] font-bold md:text-[40px]" />
            <p className="text-sm text-[var(--color-foreground-muted)]">на рынке (с 2013 года)</p>
          </RevealItem>

          <RevealItem className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-sm)]">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--gradient-brass-glow)" }}>
              <LayoutGrid className="text-[var(--color-accent)]" size={28} />
            </div>
            <AnimatedCounter target={101} suffix="" duration={1200} className="font-display text-[30px] font-bold md:text-[40px]" />
            <p className="text-sm text-[var(--color-foreground-muted)]">моделей, 5 категорий</p>
          </RevealItem>

          <RevealItem className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-sm)]">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--gradient-brass-glow)" }}>
              <Truck className="text-[var(--color-accent)]" size={28} />
            </div>
            <p className="font-display text-lg font-bold md:text-xl">Доставка по всей России</p>
            <p className="text-sm text-[var(--color-foreground-muted)]">в любой населённый пункт</p>
          </RevealItem>

          <RevealItem className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] bg-[var(--color-surface)] p-6 text-center shadow-[var(--shadow-sm)]">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "var(--gradient-brass-glow)" }}>
              <ShieldCheck className="text-[var(--color-accent)]" size={28} />
            </div>
            <p className="font-display text-lg font-bold md:text-xl">Гарантия производителя</p>
            <p className="text-sm text-[var(--color-foreground-muted)]">на все изделия фабрики</p>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2" stagger={0.06}>
          {FACTS.map((fact) => (
            <RevealItem key={fact} className="flex items-start gap-2 text-sm text-[var(--color-foreground-muted)]">
              <Check size={18} className="mt-0.5 shrink-0 text-[var(--color-accent-2)]" />
              {fact}
            </RevealItem>
          ))}
        </RevealGroup>

        <Reveal className="mt-10 flex justify-center" delay={0.1}>
          <Link
            href="/catalog"
            className="rounded-[var(--radius-md)] px-5 py-2.5 text-sm font-semibold text-[var(--color-foreground)] transition-colors hover:bg-[var(--color-surface)]"
          >
            Смотреть каталог →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
