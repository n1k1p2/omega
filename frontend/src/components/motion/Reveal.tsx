"use client";

import { motion, useReducedMotion, type Variants, type Transition } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

/**
 * Reveal — базовый примитив scroll-reveal для всего сайта (§6 дизайн-системы).
 *
 * Правило В11 (обязательное): SSR-разметка не может быть invisible по умолчанию.
 * ВАЖНО (проверено эмпирически рендером в Node через renderToStaticMarkup):
 * `motion.div` с `initial="hidden"` САМ ПО СЕБЕ рендерит SSR-разметку с инлайн
 * `style="opacity:0;transform:translateY(24px)"` — то есть framer-motion по
 * умолчанию НЕ решает правило В11 автоматически, вопреки интуиции. Единственный
 * задокументированный способ получить чистый, видимый SSR HTML — явный проп
 * `initial={false}` на каждом motion-элементе: он отключает применение
 * initial-состояния только при самом первом рендере/маунте (в т.ч. серверном),
 * поэтому SSR/первый клиентский рендер показывает элемент сразу в конечных
 * стилях (без opacity/transform вообще — ни в HTML, ни инлайн-стилем после
 * гидратации). При этом `whileInView` продолжает работать как обычно для ВСЕХ
 * последующих срабатываний IntersectionObserver — т.е. как только элемент,
 * который был на экране при загрузке (или чуть выше), уходит из viewport и
 * возвращается, либо просто входит в viewport первый раз уже после маунта,
 * анимация `hidden → visible` играет нормально. Единственный практический
 * компромисс: если элемент уже виден на экране в момент гидратации (типично
 * для первого экрана/hero), он не проигрывает reveal-переход при самой
 * гидратации — визуально не отличается от "домашнего" паттерна с классом
 * .js-ready (там тоже нет анимации до появления класса), а для элементов
 * ниже экрана animation отрабатывает как обычный scroll-reveal.
 *
 * `once: true`, только transform/opacity, easing ease-out-expo-ish.
 * `prefers-reduced-motion` — явно проверяем через useReducedMotion и убираем
 * transform-смещение (оставляем лёгкий fade вместо полного отключения).
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

const OFFSETS: Record<RevealDirection, { x?: number; y?: number }> = {
  up: { y: 24 },
  down: { y: -24 },
  left: { x: 24 },
  right: { x: -24 },
  none: {},
};

interface RevealProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  id?: string;
  direction?: RevealDirection;
  delay?: number;
  duration?: number;
  once?: boolean;
  amount?: number;
  as?: "div" | "section" | "span" | "li";
}

export function Reveal({
  children,
  className,
  style,
  id,
  direction = "up",
  delay = 0,
  duration = 0.6,
  once = true,
  amount = 0.15,
  as = "div",
}: RevealProps) {
  const shouldReduceMotion = useReducedMotion();
  const offset = OFFSETS[direction];

  const variants: Variants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, x: offset.x ?? 0, y: offset.y ?? 0 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.15 : duration,
        delay: shouldReduceMotion ? 0 : delay,
        ease: EASE,
      } as Transition,
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      id={id}
      className={className}
      style={style}
      initial={false}
      whileInView="visible"
      variants={variants}
      viewport={{ once, amount }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * RevealGroup — контейнер со stagger для карточек/списков внутри секции
 * (80–100ms между соседними детьми, см. §6). Дети — <RevealItem>.
 */
interface RevealGroupProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  once?: boolean;
  amount?: number;
  as?: "div" | "ul" | "section";
}

export function RevealGroup({
  children,
  className,
  stagger = 0.09,
  delay = 0,
  once = true,
  amount = 0.15,
  as = "div",
}: RevealGroupProps) {
  const shouldReduceMotion = useReducedMotion();
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : stagger,
        delayChildren: shouldReduceMotion ? 0 : delay,
      },
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={false}
      whileInView="visible"
      viewport={{ once, amount }}
      variants={containerVariants}
    >
      {children}
    </MotionTag>
  );
}

interface RevealItemProps {
  children: ReactNode;
  className?: string;
  direction?: RevealDirection;
  duration?: number;
  as?: "div" | "li" | "span";
}

export function RevealItem({
  children,
  className,
  direction = "up",
  duration = 0.5,
  as = "div",
}: RevealItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const offset = OFFSETS[direction];

  const itemVariants: Variants = {
    hidden: shouldReduceMotion
      ? { opacity: 0 }
      : { opacity: 0, x: offset.x ?? 0, y: offset.y ?? 0 },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.15 : duration,
        ease: EASE,
      } as Transition,
    },
  };

  const MotionTag = motion[as];

  return (
    <MotionTag className={className} variants={itemVariants}>
      {children}
    </MotionTag>
  );
}
