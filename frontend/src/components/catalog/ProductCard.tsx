"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Ruler, Zap } from "lucide-react";
import type { ProductCard as ProductCardType } from "@/types/catalog";
import { Badge } from "@/components/ui/Badge";
import { Rating } from "@/components/ui/Rating";
import { ColorSwatches } from "@/components/ui/ColorSwatches";
import { formatPriceFrom } from "@/lib/format";
import { useModals } from "@/context/ModalContext";
import { useCart } from "@/context/CartContext";

export function ProductCard({ product }: { product: ProductCardType }) {
  const [hovered, setHovered] = useState(false);
  const { openOneClick } = useModals();
  const { addItem } = useCart();

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)] transition-all duration-[260ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-lg)]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/product/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-white sm:aspect-[4/5]">
        {product.image && (
          <>
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className={`object-contain p-3 transition-[opacity,transform] duration-[400ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                hovered ? "scale-[1.04]" : "scale-100"
              } ${hovered && product.image_hover ? "opacity-0" : "opacity-100"}`}
            />
            {product.image_hover && (
              <Image
                src={product.image_hover}
                alt={product.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={`object-contain p-3 transition-[opacity,transform] duration-[400ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                  hovered ? "scale-[1.04] opacity-100" : "scale-100 opacity-0"
                }`}
              />
            )}
          </>
        )}

        {(product.is_bestseller || product.is_new) && (
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.is_bestseller && <Badge tone="bestseller">Хит продаж</Badge>}
            {!product.is_bestseller && product.is_new && <Badge tone="new">Новинка</Badge>}
          </div>
        )}

        {product.colors.length > 0 && (
          <div className="absolute bottom-3 left-3">
            <ColorSwatches colors={product.colors} />
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-4 sm:p-[18px]">
        <Link href={`/product/${product.slug}`}>
          <h3 className="line-clamp-2 font-sans text-[18px] font-bold leading-snug hover:text-[var(--color-primary)]">
            {product.name}
          </h3>
        </Link>

        {product.dimensions && (
          <p className="flex items-center gap-1.5 text-sm text-[var(--color-foreground-muted)]">
            <Ruler size={14} />
            {product.dimensions}
          </p>
        )}

        {product.rating != null && (
          <Rating value={product.rating} reviewsCount={product.reviews_count} />
        )}

        <div className="flex items-center gap-2 text-sm">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: product.in_stock ? "var(--color-success)" : "var(--color-warning-text)" }}
          />
          <span style={{ color: product.in_stock ? "var(--color-success)" : "var(--color-warning-text)" }}>
            {product.in_stock ? "В наличии" : "Под заказ"}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <div>
            <p className="text-[20px] font-bold tabular-nums leading-tight">
              {formatPriceFrom(product.price)}
            </p>
            {product.price_max && product.price_max > (product.price ?? 0) && (
              <p className="text-xs text-[var(--color-foreground-muted)]">зависит от размера и ткани</p>
            )}
          </div>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (product.price == null) return;
              addItem({
                slug: product.slug,
                name: product.name,
                price: product.price,
                image: product.image,
              });
            }}
            className="h-11 flex-1 cursor-pointer rounded-[var(--radius-md)] bg-[var(--color-primary)] text-sm font-semibold text-white transition-all duration-200 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] sm:bg-[var(--color-surface-sunken)] sm:text-[var(--color-foreground)] sm:group-hover:bg-[var(--color-primary)] sm:group-hover:text-white"
          >
            Заказать
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              openOneClick({
                productSlug: product.slug,
                productName: product.name,
                productImage: product.image,
                price: product.price,
              });
            }}
            aria-label="Купить в 1 клик"
            title="Купить в 1 клик"
            className="flex h-11 shrink-0 cursor-pointer items-center gap-1.5 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-accent)] px-3 text-sm font-semibold text-[var(--color-foreground)] transition-all duration-200 hover:bg-[var(--color-accent)]/10 active:scale-[0.98]"
          >
            <Zap size={16} className="text-[var(--color-accent)]" />
            <span className="hidden sm:inline">В 1 клик</span>
          </button>
        </div>
      </div>
    </div>
  );
}
