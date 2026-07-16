/** Форматирует целую цену в рублях: 35700 -> "35 700 ₽". */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return `${new Intl.NumberFormat("ru-RU").format(Math.round(value))} ₽`;
}

/** "от 35 700 ₽" — базовый формат цены каталога/PDP. */
export function formatPriceFrom(value: number | null | undefined): string {
  if (value === null || value === undefined) return "Цена по запросу";
  return `от ${formatPrice(value)}`;
}

/** Честный диапазон цены "от X до Y ₽" для PDP, если price_max отличается. */
export function formatPriceRange(
  price: number | null | undefined,
  priceMax: number | null | undefined,
): string {
  if (price === null || price === undefined) return "Цена по запросу";
  if (priceMax && priceMax > price) {
    return `от ${formatPrice(price)} до ${formatPrice(priceMax)}`;
  }
  return formatPrice(price);
}

/** Простая маска телефона для отображения при вводе: +7 (___) ___-__-__ */
export function formatPhoneInput(raw: string): string {
  const digits = raw.replace(/\D/g, "").replace(/^7/, "").replace(/^8/, "").slice(0, 10);
  let out = "+7";
  if (digits.length > 0) out += ` (${digits.slice(0, 3)}`;
  if (digits.length >= 3) out += `)`;
  if (digits.length > 3) out += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) out += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) out += `-${digits.slice(8, 10)}`;
  return out;
}

export function isValidRuPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 11 || digits.length === 10;
}
