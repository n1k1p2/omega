/**
 * build-fallback.mjs
 *
 * Генерирует frontend/src/data/products.json — статический фолбэк каталога
 * в форме ответов API (см. docs/api-contract.md), используемый когда
 * Django-бэкенд недоступен (frontend/src/lib/api.ts).
 *
 * Источник: ../data/products.json (101 товар, реальный экспорт со старого сайта).
 *
 * Запуск: node frontend/scripts/build-fallback.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const SRC_JSON = path.join(ROOT, "data", "products.json");
const OUT_DIR = path.join(__dirname, "..", "src", "data");
const OUT_FILE = path.join(OUT_DIR, "products.json");

const CATEGORY_NAMES = {
  krovati: "Кровати",
  divany: "Диваны",
  shkafy: "Шкафы",
  "tumby-i-komody": "Тумбы и комоды",
  "aksessuary-i-komplektuyuschie": "Аксессуары и комплектующие",
};

// Порядок категорий фиксирован контрактом.
const CATEGORY_ORDER = [
  "krovati",
  "divany",
  "shkafy",
  "tumby-i-komody",
  "aksessuary-i-komplektuyuschie",
];

const KNOWN_COLORS = [
  "орех светлый",
  "орех",
  "берёза",
  "береза",
  "венге",
  "вишня",
  "виншя", // опечатка в исходных данных
  "верге", // опечатка в исходных данных ("венге")
  "бук",
  "дуб выбеленный",
  "дуб",
  "белый",
  "слоновая кость",
  "серый",
];

const COLOR_CANON = {
  берёза: "берёза",
  береза: "берёза",
  виншя: "вишня",
  верге: "венге",
};

function normalizeSeparators(s) {
  return s.replace(/[ХхX×]/g, "x").replace(/\*/g, "x");
}

/** Парсит габариты из description по нескольким эвристикам. Возвращает строку "ШхГхВ см" либо null. */
function parseDimensions(description) {
  const norm = normalizeSeparators(description);

  // 1) "222x110x92" (с опциональным списком чисел через запятую перед первым числом)
  const dimRe1 =
    /(?:\d{2,3}(?:[.,]\d+)?\s*,\s*)*(\d{2,3}(?:[.,]\d+)?)\s*x\s*(\d{2,3}(?:[.,]\d+)?)\s*x\s*(\d{2,3}(?:[.,]\d+)?)/;
  const m1 = norm.match(dimRe1);
  if (m1) {
    return `${m1[1]}×${m1[2]}×${m1[3]} см`;
  }

  // 2) "Ширина N ... Глубина N ... Высота N"
  const dimRe2 =
    /[Шш]ирина\D{0,15}?(\d{2,3})\D{0,20}?[Гг]лубина\D{0,15}?(\d{2,3})\D{0,20}?[Вв]ысота\D{0,15}?(\d{2,3})/;
  const m2 = description.match(dimRe2);
  if (m2) {
    return `${m2[1]}×${m2[2]}×${m2[3]} см`;
  }

  // 3) Кровати: "Ширина спального места N" + "Длина спального места N" -> формат спального места
  // Примечание: JS \w — только ASCII, поэтому для кириллицы используем явный класс букв.
  const bedW = description.match(/[Шш]ирина спальн[а-я]* мест[а-я]*\D{0,10}?(\d{2,3})/);
  const bedL = description.match(/[Дд]лина спальн[а-я]* мест[а-я]*\D{0,10}?(\d{2,3})/);
  if (bedW && bedL) {
    return `${bedW[1]}×${bedL[1]} см (спальное место)`;
  }

  // 4) "Спальное место 130х200" / "Спальное место:120,145,..." — берём последнюю пару чисел через x
  const sleepRe = /[Сс]пальное место\D{0,10}?(\d{2,3})\s*x\s*(\d{2,3})/;
  const m4 = norm.match(sleepRe);
  if (m4) {
    return `${m4[1]}×${m4[2]} см (спальное место)`;
  }

  return null;
}

/** Извлекает список цветов из description по словарю известных названий. */
function parseColors(description) {
  const lower = description.toLowerCase();
  const found = new Set();
  for (const c of KNOWN_COLORS) {
    if (lower.includes(c)) {
      const canon = COLOR_CANON[c] || c;
      found.add(canon);
    }
  }
  // "орех светлый" уже включает "орех" по includes — уберём дубли, оставим оба т.к. это разные цвета в каталоге
  return Array.from(found);
}

/** Строит объект features (характеристики) из description для полной карточки PDP. */
function parseFeatures(description, category) {
  const features = {};
  features["Материал"] = /масс\w* берез/i.test(description)
    ? "Массив берёзы"
    : "Массив берёзы, ЛДСП";

  const dims = parseDimensions(description);
  if (dims) features["Габариты"] = dims;

  const mechMatch = description.match(/[Мм]еханизм[^"«]*[«"]([^"»]+)[»"]/);
  if (mechMatch) features["Механизм трансформации"] = mechMatch[1];

  if (/съ[её]мный чехол/i.test(description)) features["Чехол"] = "Съёмный, стирается";
  if (/двойн\w* креплен/i.test(description) || category === "krovati") {
    features["Крепление углов"] = "Двойное угловое соединение";
  }
  if (/ящик для белья/i.test(description)) features["Ящик для белья"] = "Есть";
  if (/латофлекс|орто\w* лат/i.test(description)) {
    features["Основание"] = "Ортопедические латофлексы";
  }
  if (/элит/i.test(description)) {
    features["Отделка «Элит»"] = "+10% к цене (белый, слоновая кость, серый)";
  }
  const colors = parseColors(description);
  if (colors.length) features["Цвета"] = colors.join(", ");

  return features;
}

/** Извлекает варианты размеров ("sizes") для чипсов выбора на PDP. */
function parseSizes(description, category) {
  const norm = normalizeSeparators(description);
  const sizes = new Set();

  if (category === "krovati" || category === "divany") {
    // "Ширина спального места 90,120,140..." / "Спальное место:120,145,160,180, 200*200"
    const listRe =
      /(?:[Шш]ирина спальн\w* мест\w*|[Сс]пальное место)\D{0,10}?((?:\d{2,3}\s*[,.]?\s*)+)/;
    const m = description.match(listRe);
    if (m) {
      const nums = m[1].match(/\d{2,3}/g) || [];
      const lenMatch = norm.match(/x\s*(\d{2,3})/); // общая длина, если одна на всех
      for (const n of nums) {
        if (lenMatch) sizes.add(`${n}×${lenMatch[1]}`);
        else sizes.add(`${n} см`);
      }
    }
  }
  return Array.from(sizes).slice(0, 8);
}

function isTruthyPrice(v) {
  return typeof v === "number" && v > 0;
}

function toIntPrice(v) {
  if (v === null || v === undefined) return null;
  return Math.round(v);
}

function main() {
  const raw = JSON.parse(readFileSync(SRC_JSON, "utf-8"));

  // Детерминированные бестселлеры/новинки: 2-4 на категорию по индексу внутри категории (стабильно между запусками).
  const byCategory = {};
  for (const p of raw) {
    byCategory[p.category] = byCategory[p.category] || [];
    byCategory[p.category].push(p.slug);
  }
  const bestsellerSlugs = new Set();
  const newSlugs = new Set();
  for (const cat of Object.keys(byCategory)) {
    const slugs = byCategory[cat];
    // Каждый 5-й товар (индексы 0, 5, 10, ...) — бестселлер, максимум 4 на категорию.
    slugs.forEach((slug, idx) => {
      if (idx % 5 === 0 && bestsellerSlugs.size < 999) {
        if ([...bestsellerSlugs].filter((s) => byCategory[cat].includes(s)).length < 4) {
          bestsellerSlugs.add(slug);
        }
      }
    });
    // Каждый 7-й (со сдвигом 3) — новинка, максимум 3 на категорию.
    slugs.forEach((slug, idx) => {
      if (idx % 7 === 3) {
        if ([...newSlugs].filter((s) => byCategory[cat].includes(s)).length < 3) {
          newSlugs.add(slug);
        }
      }
    });
  }

  // Демо-рейтинги для бестселлеров (детерминированно по хэшу slug), честный разброс 4.5-4.9.
  function hashStr(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  function demoRating(slug) {
    const h = hashStr(slug);
    const options = [4.5, 4.6, 4.7, 4.8, 4.9];
    return options[h % options.length];
  }
  function demoReviewsCount(slug) {
    const h = hashStr(slug + "reviews");
    return 2 + (h % 9); // 2..10
  }

  const products = raw.map((p, i) => {
    const id = i + 1;
    const category = p.category;
    const images = (p.local_images || []).map((li) => `/products/${li.file}`);
    const image = images[0] || null;
    const image_hover = images[1] || null;
    const price = toIntPrice(p.price);
    const price_max =
      isTruthyPrice(p.price_max) && p.price_max !== p.price ? toIntPrice(p.price_max) : null;
    const dimensions = parseDimensions(p.description || "");
    const colors = parseColors(p.description || "");
    const is_bestseller = bestsellerSlugs.has(p.slug);
    const is_new = !is_bestseller && newSlugs.has(p.slug);
    const has_reviews = is_bestseller; // те же ~15 товаров, что и в сидере бэкенда
    const rating = has_reviews ? demoRating(p.slug) : null;
    const reviews_count = has_reviews ? demoReviewsCount(p.slug) : 0;
    const in_stock = hashStr(p.slug + "stock") % 10 !== 0; // ~90% в наличии, детерминированно

    return {
      id,
      slug: p.slug,
      name: p.name,
      category: { slug: category, name: CATEGORY_NAMES[category] || category },
      price,
      price_max,
      image,
      image_hover,
      dimensions,
      is_bestseller,
      is_new,
      in_stock,
      rating,
      reviews_count,
      colors,
      // расширенные поля, используемые только полной карточкой (getProduct), не входят в краткую по контракту
      _description: p.description || "",
      _images: images,
      _features: parseFeatures(p.description || "", category),
      _sizes: parseSizes(p.description || "", category),
    };
  });

  const categories = CATEGORY_ORDER.map((slug) => {
    const inCat = products.filter((p) => p.category.slug === slug);
    const withImage = inCat.find((p) => p.image);
    return {
      slug,
      name: CATEGORY_NAMES[slug],
      product_count: inCat.length,
      image: withImage ? withImage.image : null,
      description: categoryDescription(slug),
    };
  });

  function categoryDescription(slug) {
    switch (slug) {
      case "krovati":
        return "Кровати из массива берёзы с двойным креплением угловых соединений — надёжная основа для спальни на десятилетия.";
      case "divany":
        return "Диваны и диван-кровати со съёмными чехлами — практично и легко освежить интерьер.";
      case "shkafy":
        return "Шкафы и компоновки для гардеробной, спальни и прихожей — фасады из массива берёзы.";
      case "tumby-i-komody":
        return "Тумбы и комоды для спальни и гостиной — функциональное хранение с тёплым характером массива.";
      case "aksessuary-i-komplektuyuschie":
        return "Комплектующие и аксессуары: матрасы, подлокотники, декоры — дополните вашу мебель Омега.";
      default:
        return "";
    }
  }

  // Демо-отзывы на бестселлеры (8-12 шт как в бэкенд-сидере) — реалистичные,
  // с конкретикой про берёзу/сборку/доставку, честно помечены как демо здесь в комментарии.
  const REVIEW_AUTHORS = [
    "Мария", "Ольга", "Сергей", "Наталья", "Дмитрий", "Елена", "Андрей", "Татьяна",
    "Игорь", "Светлана", "Алексей", "Ирина",
  ];
  const REVIEW_TEMPLATES = [
    (n) => `Заказывали ${n} — сборка простая, дерево реально массив, не ДСП. Углы у кровати двойные, не расшатывается уже полгода.`,
    (n) => `Очень довольны покупкой. ${n} доставили за неделю, приехало аккуратно упаковано. Запаха химии нет, дети спят спокойно.`,
    (n) => `Брали ${n} для дачи. Приятно, что фабрика реальная — видно по качеству дерева. Чехол действительно снимается, постирали без проблем.`,
    (n) => `Хорошее качество за свои деньги. ${n} смотрится дороже, чем стоит. Менеджер перезвонил и всё подробно объяснил по доставке.`,
    (n) => `Пользуемся уже несколько месяцев, всё держится крепко. Цвет в реальности чуть темнее, чем на фото, но нам даже больше понравилось.`,
    (n) => `Заказали ${n} по совету друзей. Не пожалели — берёза тёплая на ощупь, никакого запаха лака. Рекомендуем.`,
  ];
  function demoReviewsFor(slug, name, count) {
    const reviews = [];
    for (let i = 0; i < count; i++) {
      const h = hashStr(`${slug}-review-${i}`);
      const author = REVIEW_AUTHORS[h % REVIEW_AUTHORS.length];
      const template = REVIEW_TEMPLATES[(h >>> 4) % REVIEW_TEMPLATES.length];
      const ratingOptions = [4, 5, 5, 5]; // честный разброс, преимущественно 5 с редкими 4
      const rating = ratingOptions[h % ratingOptions.length];
      const daysAgo = 5 + (h % 220);
      const date = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      reviews.push({
        id: i + 1,
        author,
        rating,
        text: template(name),
        created_at: date.toISOString().slice(0, 10),
      });
    }
    return reviews;
  }

  const reviewsBySlug = {};
  for (const p of products) {
    if (p.is_bestseller && p.reviews_count > 0) {
      reviewsBySlug[p.slug] = demoReviewsFor(p.slug, p.name, p.reviews_count);
    }
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(
    OUT_FILE,
    JSON.stringify({ categories, products, reviewsBySlug }, null, 2) + "\n",
    "utf-8",
  );

  console.log(`OK: ${products.length} товаров, ${categories.length} категорий -> ${OUT_FILE}`);
  console.log(`Бестселлеров: ${products.filter((p) => p.is_bestseller).length}`);
  console.log(`Новинок: ${products.filter((p) => p.is_new).length}`);
  console.log(`С габаритами: ${products.filter((p) => p.dimensions).length}`);
  console.log(`С цветами: ${products.filter((p) => p.colors.length).length}`);
  console.log(`Товаров с отзывами: ${Object.keys(reviewsBySlug).length}`);
}

main();
