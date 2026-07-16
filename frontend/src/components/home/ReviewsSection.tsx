import Link from "next/link";
import type { Review } from "@/types/catalog";
import { Rating } from "@/components/ui/Rating";
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/Reveal";

/**
 * Правка К3б: заголовок и агрегированный рейтинг рендерятся только с реальными
 * данными. Если отзывов нет вообще — секция скрывается целиком (честность
 * важнее "пустой" секции социального доказательства).
 */
export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) return null;

  const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  return (
    <section id="reviews" className="scroll-mt-24 py-16 md:py-24">
      <div className="container-omega">
        <Reveal className="mb-10 flex flex-col items-center gap-4 text-center md:mb-14 md:flex-row md:justify-between md:text-left">
          <div>
            <h2 className="font-display text-[26px] font-semibold md:text-[36px]">Что говорят наши покупатели</h2>
          </div>
          <div className="text-center md:text-right">
            <p className="font-display text-[40px] font-bold leading-none tabular-nums">{avgRating.toFixed(1)}</p>
            <p className="text-sm text-[var(--color-foreground-muted)]">{reviews.length} отзывов</p>
          </div>
        </Reveal>

        <RevealGroup className="flex gap-5 overflow-x-auto pb-2 no-scrollbar md:grid md:grid-cols-3 md:overflow-visible" amount={0.15}>
          {reviews.slice(0, 6).map((review, i) => (
            <RevealItem
              key={`${review.author}-${review.created_at}-${i}`}
              className="w-[85%] shrink-0 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:w-[60%] md:w-auto"
            >
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-primary-soft)] font-semibold text-[#963B26]">
                  {review.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{review.author}</p>
                  <p className="text-xs text-[var(--color-foreground-muted)]">
                    {new Date(review.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>
              <Rating value={review.rating} className="mb-2" />
              <p className="text-sm leading-relaxed text-[var(--color-foreground-muted)]">{review.text}</p>
            </RevealItem>
          ))}
        </RevealGroup>

        <div className="mt-8 text-center">
          <Link href="/catalog" className="text-sm font-semibold hover:text-[var(--color-primary)]">
            Смотреть каталог →
          </Link>
        </div>
      </div>
    </section>
  );
}
