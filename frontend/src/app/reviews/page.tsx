import { redirect } from "next/navigation";

/**
 * API не предоставляет отдельный эндпоинт для агрегированного списка отзывов
 * по всем товарам (только GET /reviews/?product=<slug> для конкретного
 * товара) — отзывы показываются на главной (блок «Что говорят наши
 * покупатели») и на карточке товара. Эта страница — алиас на главную.
 */
export default function ReviewsRedirect() {
  redirect("/#reviews");
}
