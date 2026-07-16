import Image from "next/image";
import Link from "next/link";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { HeroTextColumn, HeroItem, HeroPhotoColumn } from "./HeroMotion";

/**
 * Hero — правка В11 (обязательная): весь текстовый блок виден в чистой
 * SSR-разметке без opacity:0 и без JS-условий (см. HeroMotion — использует
 * `initial={false}` на motion-примитивах, что подтверждено рендер-тестом:
 * SSR HTML не содержит инлайн opacity/transform, см. отчёт о проверке).
 * Сама разметка (H1/подзаголовок/CTA) остаётся обычными серверными тегами —
 * анимация входа лишь оборачивает их через клиентский HeroMotion-компонент,
 * не подменяя контент.
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[var(--color-background-alt)]">
      <div className="container-omega grid grid-cols-1 items-center gap-8 py-12 md:grid-cols-[55%_45%] md:gap-6 md:py-0 lg:py-0">
        <HeroTextColumn>
          <HeroItem className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.06em] text-[var(--color-accent)]">
            <span className="h-px w-6 bg-[var(--color-accent)]" />
            Фабрика полного цикла · г. Юрьевец
          </HeroItem>

          <HeroItem
            as="h1"
            className="text-balance font-display text-[38px] font-bold leading-[1.15] tracking-[-0.02em] text-[var(--color-foreground)] md:text-[56px] md:leading-[1.1] lg:text-[64px] lg:leading-[1.06]"
          >
            Мебель на всю жизнь — из{" "}
            <span className="relative inline-block whitespace-normal md:whitespace-nowrap">
              массива берёзы,
              <svg
                className="absolute -bottom-1 left-0 w-full text-[var(--color-accent)]"
                height="10"
                viewBox="0 0 200 10"
                preserveAspectRatio="none"
                aria-hidden
              >
                <path d="M0 6 Q50 0 100 5 T200 4" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" />
              </svg>
            </span>{" "}
            без посредников
          </HeroItem>

          <HeroItem as="p" className="max-w-lg text-base leading-relaxed text-[var(--color-foreground-muted)] md:text-lg">
            Свой завод в Ивановской области. Никакой аренды шоурумов и наценок посредников —
            экономию отдаём вам.
          </HeroItem>

          <HeroItem className="mt-2 flex flex-col gap-3 sm:flex-row">
            <Link href="/catalog">
              <Button variant="primary" size="l" fullWidth className="sm:w-auto">
                Выбрать мебель
              </Button>
            </Link>
            <Link href="/catalog">
              <Button variant="secondary" size="l" fullWidth className="sm:w-auto">
                <Wand2 size={18} />
                Подобрать за 1 минуту
              </Button>
            </Link>
          </HeroItem>

          <HeroItem as="ul" className="mt-2 flex flex-col gap-1.5 text-sm text-[var(--color-foreground-muted)] sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
            <li>На рынке с 2013 года</li>
            <li className="hidden sm:inline">·</li>
            <li>101 модель в каталоге</li>
            <li className="hidden sm:inline">·</li>
            <li>Доставка в любой населённый пункт России</li>
          </HeroItem>
        </HeroTextColumn>

        <HeroPhotoColumn>
          {/* Латунное свечение за фото — декоративное, чисто визуальное (opacity/transform only) */}
          <div
            className="pointer-events-none absolute -inset-x-10 -inset-y-10 -z-10 hidden md:block"
            style={{ background: "var(--gradient-brass-glow)", filter: "blur(20px)" }}
            aria-hidden
          />
          <Image
            src="/brand/banner-1.jpg"
            alt="Диван-кровать «Омега» из массива берёзы в интерьере"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 45vw"
            className="object-cover"
          />
        </HeroPhotoColumn>
      </div>
    </section>
  );
}
