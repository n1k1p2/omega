const ITEMS = [
  "Фабрика с 2013 года",
  "Массив берёзы",
  "Доставка по всей России",
  "Гарантия производителя",
  "Без посредников",
];

function MarqueeContent() {
  return (
    <span className="flex shrink-0 items-center gap-8 px-4">
      {ITEMS.map((item, i) => (
        <span key={i} className="flex items-center gap-8 text-[11px] font-medium uppercase tracking-[0.06em] text-white/70 md:text-[13px]">
          {item}
          <span className="text-[var(--color-accent)]">★</span>
        </span>
      ))}
    </span>
  );
}

export function TrustMarquee() {
  return (
    <div className="flex h-11 items-center overflow-hidden bg-[var(--color-dark)] md:h-14">
      <div className="flex animate-marquee" aria-hidden={false}>
        <MarqueeContent key="marquee-1" />
        <MarqueeContent key="marquee-2" />
      </div>
    </div>
  );
}
