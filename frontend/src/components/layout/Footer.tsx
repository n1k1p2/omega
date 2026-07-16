"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import type { Category } from "@/types/catalog";
import { SUPPORT_PHONE, SUPPORT_PHONE_TEL, SUPPORT_EMAIL, SUPPORT_HOURS, postCallback, ApiUnavailableError } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

export function Footer({ categories }: { categories: Category[] }) {
  const { showToast } = useToast();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLeadMagnetSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      // У формы лид-магнита нет поля телефона (только email) — поле phone в контракте
      // обязательно для /callbacks/, поэтому передаём "не указан", а сам email — в comment,
      // чтобы менеджер видел, куда отправлять гид.
      await postCallback({
        name: "Заявка на PDF-гид",
        phone: "не указан",
        comment: `Скачать гид «Как выбрать диван для вашей семьи». Email: ${email}`,
        product_slug: null,
      });
      showToast({ type: "success", message: "Заявка принята — пришлём гид в течение дня." });
      setEmail("");
    } catch (e) {
      showToast({
        type: "error",
        message: e instanceof ApiUnavailableError ? e.message : "Не удалось отправить заявку",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <footer className="bg-[var(--color-dark)] text-white/85">
      <div className="container-omega grid grid-cols-1 gap-10 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-1">
          <h4 className="mb-4 font-semibold text-white">Каталог</h4>
          <ul className="flex flex-col gap-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/catalog/${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Компания</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/about" className="hover:text-white">О фабрике</Link></li>
            <li><Link href="/delivery" className="hover:text-white">Доставка и оплата</Link></li>
            <li><Link href="/contacts" className="hover:text-white">Контакты</Link></li>
            <li><Link href="/reviews" className="hover:text-white">Отзывы</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Покупателям</h4>
          <ul className="flex flex-col gap-2 text-sm">
            <li><Link href="/account" className="hover:text-white">Личный кабинет</Link></li>
            <li><Link href="/account/orders" className="hover:text-white">Заказы</Link></li>
            <li><Link href="/faq" className="hover:text-white">Как оформить</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
            <li><Link href="/privacy" className="hover:text-white">Политика обработки персональных данных</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Контакты</h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li>
              <a
                href={`tel:${SUPPORT_PHONE_TEL}`}
                className="flex items-center gap-2 font-display text-xl font-semibold text-[var(--color-brass-footer)]"
              >
                <Phone size={18} />
                {SUPPORT_PHONE}
              </a>
            </li>
            <li>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-2 hover:text-white">
                <Mail size={16} />
                {SUPPORT_EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} />
              г. Юрьевец, Ивановская обл.
            </li>
            <li className="flex items-center gap-2">
              <Clock size={16} />
              {SUPPORT_HOURS}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-semibold text-white">Гид по выбору мебели</h4>
          <p className="mb-3 text-sm text-white/70">
            PDF «Как выбрать диван для вашей семьи» — оставьте почту, пришлём в течение дня.
          </p>
          <form onSubmit={handleLeadMagnetSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@mail.ru"
              className="h-11 rounded-[var(--radius-sm)] border border-white/20 bg-white/5 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-[var(--color-brass-footer)]"
            />
            <button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-[var(--radius-md)] bg-[var(--color-brass-footer)] px-4 text-sm font-semibold text-[var(--color-dark)] hover:brightness-95 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Отправляем…" : "Получить гид"}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <div className="container-omega flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/70">
          <span>Массив берёзы</span>
          <span className="h-3 w-px bg-white/15" />
          <span>Полный цикл производства</span>
          <span className="h-3 w-px bg-white/15" />
          <span>Без посредников</span>
          <span className="h-3 w-px bg-white/15" />
          <span>Доставка по всей РФ</span>
        </div>
      </div>

      <div className="border-t border-white/10 py-5">
        <div className="container-omega flex flex-col items-center justify-between gap-2 text-xs text-white/50 sm:flex-row">
          <p>© 2026 ООО «Мебель Омега» · ОГРН 1133702026468</p>
          <p>Оплата: карта · безналичный расчёт · курьеру (Москва)</p>
        </div>
      </div>
    </footer>
  );
}
