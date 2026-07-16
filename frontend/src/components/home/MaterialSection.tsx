import Link from "next/link";
import { TreePine, Link2, Shirt, Wrench } from "lucide-react";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { MaterialParallaxImage } from "./MaterialParallaxImage";

const POINTS = [
  {
    icon: TreePine,
    title: "Массив берёзы",
    text: "Экологичный материал без резких запахов химии — прочный и тёплый, служит десятилетиями.",
  },
  {
    icon: Link2,
    title: "Двойное крепление углов",
    text: "Кровати не расшатываются даже при активном использовании — это инженерное решение, а не эпитет.",
  },
  {
    icon: Shirt,
    title: "Съёмные чехлы диванов",
    text: "Легко снять для чистки или заменить на новый — практично для семей с детьми и животными.",
  },
  {
    icon: Wrench,
    title: "Фурнитура от лучших производителей",
    text: "Механизмы трансформации и крепёж — от проверенных поставщиков, а не самого дешёвого варианта.",
  },
];

export function MaterialSection() {
  return (
    <section className="bg-[var(--color-dark)] py-16 text-white md:py-24">
      <div className="container-omega grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center md:gap-16">
        <MaterialParallaxImage />

        <div>
          <Reveal>
            <h2 className="font-display text-[26px] font-semibold md:text-[36px]">
              Из чего сделана мебель Омега
            </h2>
          </Reveal>
          <RevealGroup className="mt-8 flex flex-col gap-6" stagger={0.06}>
            {POINTS.map((p) => (
              <RevealItem key={p.title} className="flex gap-4" direction="left">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <p.icon size={20} className="text-[var(--color-brass-footer)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-white/70">{p.text}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
          <Reveal delay={0.15}>
            <Link
              href="/about"
              className="mt-8 inline-flex items-center gap-2 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--color-brass-footer)] transition-colors hover:bg-white/5"
            >
              Узнать больше о фабрике
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
