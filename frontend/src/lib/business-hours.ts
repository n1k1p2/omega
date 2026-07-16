/** Пн–Пт 10:00–18:00 МСК (site_info.json). Проверка по МСК (UTC+3) без зависимостей. */
export function isWithinBusinessHours(date: Date = new Date()): boolean {
  const mskOffsetMinutes = 3 * 60;
  const utcMinutes = date.getUTCHours() * 60 + date.getUTCMinutes();
  const mskMinutes = (utcMinutes + mskOffsetMinutes) % (24 * 60);
  const mskDay = new Date(date.getTime() + mskOffsetMinutes * 60000).getUTCDay(); // 0=Вс..6=Сб, сдвинуто на МСК

  const isWeekday = mskDay >= 1 && mskDay <= 5;
  const isWorkingHour = mskMinutes >= 10 * 60 && mskMinutes < 18 * 60;
  return isWeekday && isWorkingHour;
}
