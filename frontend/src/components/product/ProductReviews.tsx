"use client";

import { useState } from "react";
import type { Review } from "@/types/catalog";
import { Rating } from "@/components/ui/Rating";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { postReview, ApiUnavailableError, SUPPORT_PHONE, SUPPORT_PHONE_TEL } from "@/lib/api";

export function ProductReviews({ productSlug, reviews }: { productSlug: string; reviews: Review[] }) {
  const [author, setAuthor] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!author.trim() || !text.trim()) {
      setError("Заполните имя и текст отзыва");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await postReview({ product_slug: productSlug, author, rating, text });
      setDone(true);
    } catch (e) {
      setError(e instanceof ApiUnavailableError ? e.message : "Не удалось отправить отзыв");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div id="reviews" className="scroll-mt-24">
      <h2 className="mb-6 font-display text-2xl font-semibold">Отзывы</h2>

      {reviews.length === 0 ? (
        <p className="mb-8 text-[var(--color-foreground-muted)]">Будьте первым, кто оставит отзыв</p>
      ) : (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5">
              <div className="mb-2 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary-soft)] font-semibold text-[#963B26]">
                  {r.author.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold">{r.author}</p>
                  <p className="text-xs text-[var(--color-foreground-muted)]">
                    {new Date(r.created_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              </div>
              <Rating value={r.rating} className="mb-2" />
              <p className="text-sm text-[var(--color-foreground-muted)]">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      <div id="review-form" className="max-w-lg scroll-mt-24 rounded-[var(--radius-lg)] bg-[var(--color-background-alt)] p-6">
        <h3 className="mb-4 font-semibold">Оставить отзыв</h3>
        {done ? (
          <p className="text-sm text-[var(--color-success)]">
            Спасибо! Ваш отзыв появится после проверки модератором.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Имя" placeholder="Ваше имя" value={author} onChange={(e) => setAuthor(e.target.value)} />
            <div>
              <p className="mb-1.5 text-sm font-medium text-[var(--color-foreground-muted)]">Оценка</p>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className="flex h-11 w-11 items-center justify-center text-2xl cursor-pointer"
                    aria-label={`${n} звёзд`}
                  >
                    <span className={n <= rating ? "text-[var(--color-accent)]" : "text-[var(--color-border-strong)]"}>★</span>
                  </button>
                ))}
              </div>
            </div>
            <Textarea
              label="Отзыв"
              placeholder="Расскажите о своём опыте покупки"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {error && (
              <p className="text-sm text-[var(--color-warning-text)]">
                {error} — можно позвонить нам: {" "}
                <a href={`tel:${SUPPORT_PHONE_TEL}`} className="font-semibold underline">{SUPPORT_PHONE}</a>
              </p>
            )}
            <p className="text-xs text-[var(--color-foreground-muted)]">
              Отзыв появится на сайте после проверки модератором
            </p>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Отправляем…" : "Отправить отзыв"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
