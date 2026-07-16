"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const safeImages = images.length ? images : [];

  if (safeImages.length === 0) {
    return <div className="aspect-square w-full rounded-[var(--radius-lg)] bg-[var(--color-background-alt)]" />;
  }

  function prev() {
    setActive((a) => (a - 1 + safeImages.length) % safeImages.length);
  }
  function next() {
    setActive((a) => (a + 1) % safeImages.length);
  }

  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      {safeImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar md:w-16 md:flex-col md:overflow-y-auto">
          {safeImages.map((img, i) => (
            <button
              key={img}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-[var(--radius-sm)] border-2 bg-white cursor-pointer ${
                i === active ? "border-[var(--color-primary)]" : "border-[var(--color-border)]"
              }`}
              aria-label={`Фото ${i + 1}`}
            >
              <Image src={img} alt="" fill sizes="64px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}

      <div className="group relative aspect-square flex-1 overflow-hidden rounded-[var(--radius-lg)] bg-white">
        <Image
          src={safeImages[active]}
          alt={name}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-6"
        />
        {safeImages.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-surface)]/90 opacity-0 shadow-[var(--shadow-md)] transition-opacity group-hover:opacity-100 cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={next}
              aria-label="Следующее фото"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--color-surface)]/90 shadow-[var(--shadow-md)] opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:hidden">
              {safeImages.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === active ? "bg-[var(--color-primary)]" : "bg-[var(--color-border-strong)]"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
