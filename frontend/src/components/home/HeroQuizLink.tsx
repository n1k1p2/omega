"use client";

import type { ReactNode } from "react";

/**
 * Кнопка «Подобрать за 1 минуту» в hero — CEO-ревью [БЛОКЕР]: раньше вела
 * на /catalog (обычный каталог без подбора), хотя на главной уже есть
 * реальный квиз-подборщик (QuizPicker). Меняем на плавный скролл-якорь к
 * секции квиза — текст кнопки остаётся честным, т.к. квиз действительно
 * отвечает за ~минуту (2 шага: комната → бюджет).
 */
export function HeroQuizLink({ children }: { children: ReactNode }) {
  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    document.getElementById("quiz-picker")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <a href="#quiz-picker" onClick={handleClick}>
      {children}
    </a>
  );
}
