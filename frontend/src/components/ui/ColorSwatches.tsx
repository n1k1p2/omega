const COLOR_HEX: Record<string, string> = {
  орех: "#6B4226",
  "орех светлый": "#A9754C",
  берёза: "#E8D4A9",
  береза: "#E8D4A9",
  венге: "#3B2A20",
  вишня: "#5E2A22",
  бук: "#C9995E",
  белый: "#F5F1EA",
  серый: "#B7B0A6",
  "слоновая кость": "#EDE3CD",
  "дуб выбеленный": "#DDD0B8",
  дуб: "#B8895A",
};

function colorToHex(name: string): string {
  return COLOR_HEX[name.toLowerCase()] || "#CBB99E";
}

/**
 * Статичные некликабельные индикаторы цвета (правка В3 дизайн-системы) —
 * API не отдаёт маппинг цвет→фото, поэтому свотчи не переключают фото
 * ни на карточке, ни на PDP. Чисто информационный тултип через title.
 */
export function ColorSwatches({ colors, max = 5 }: { colors: string[]; max?: number }) {
  if (!colors.length) return null;
  const visible = colors.slice(0, max);
  const extra = colors.length - visible.length;

  return (
    <div className="flex items-center gap-1" aria-label={`Доступные цвета: ${colors.join(", ")}`}>
      {visible.map((c) => (
        <span
          key={c}
          title={c}
          className="h-4 w-4 rounded-full border border-[var(--color-border)] shadow-[var(--shadow-sm)] transition-transform duration-200 hover:scale-[1.15]"
          style={{ backgroundColor: colorToHex(c) }}
        />
      ))}
      {extra > 0 && (
        <span className="text-[11px] font-medium text-[var(--color-foreground-muted)]">
          +{extra}
        </span>
      )}
    </div>
  );
}

export { colorToHex };
