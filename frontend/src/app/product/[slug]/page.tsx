import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProduct, getReviews } from "@/lib/api";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { ProductGallery } from "@/components/product/ProductGallery";
import { BuyBox } from "@/components/product/BuyBox";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { ProductInfoAccordion } from "@/components/product/ProductInfoAccordion";
import { ProductReviews } from "@/components/product/ProductReviews";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { formatPriceFrom } from "@/lib/format";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";

interface PageParams {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return {
    title: `${product.name} — ${formatPriceFrom(product.price)}`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.description.slice(0, 160),
      images: product.image ? [{ url: product.image }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const reviews = await getReviews(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: `OM-${product.id}`,
    brand: { "@type": "Brand", name: "Мебель Омега" },
    // Offer без обязательного поля price — ошибка структурированных данных,
    // поэтому для товаров «цена по запросу» блок offers не выводим вовсе
    ...(product.price
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "RUB",
            price: product.price,
            availability: product.in_stock
              ? "https://schema.org/InStock"
              : "https://schema.org/PreOrder",
            url: `https://mebel-omega.ru/product/${product.slug}`,
          },
        }
      : {}),
    ...(product.rating != null
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviews_count,
          },
        }
      : {}),
  };

  return (
    <div className="pb-24 md:pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-omega py-5">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: product.category.name, href: `/catalog/${product.category.slug}` },
            { label: product.name },
          ]}
        />
      </div>

      <StickyBuyBar product={product} />

      <div className="container-omega grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-12">
        <ProductGallery images={product.images} name={product.name} />
        <div id="buy-box-anchor">
          <BuyBox product={product} />
        </div>
      </div>

      <div className="container-omega mt-14 flex flex-col gap-14">
        <Reveal>
          <ProductInfoAccordion product={product} />
        </Reveal>

        <Reveal>
          <ProductReviews productSlug={product.slug} reviews={reviews} />
        </Reveal>

        <Reveal>
          <RelatedProducts products={product.related} />
        </Reveal>

        <Reveal className="rounded-[var(--radius-lg)] bg-[var(--color-background-alt)] p-6 text-sm">
          <p className="mb-1 font-semibold">ООО «Мебель Омега» · производство с 2013 года</p>
          <p className="text-[var(--color-foreground-muted)]">г. Юрьевец, Ивановская обл. · фабрика полного цикла</p>
          <Link href="/about" className="mt-2 inline-block font-semibold text-[var(--color-primary)] hover:underline">
            Подробнее о нашей фабрике →
          </Link>
        </Reveal>
      </div>
    </div>
  );
}
