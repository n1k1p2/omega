"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/types/catalog";
import { Rating } from "@/components/ui/Rating";
import { Chip } from "@/components/ui/Chip";
import { Button } from "@/components/ui/Button";
import { TrustIcons } from "./TrustIcons";
import { AnimatedPriceRange } from "./AnimatedPrice";
import { useCart } from "@/context/CartContext";
import { useModals } from "@/context/ModalContext";
import { useToast } from "@/context/ToastContext";

const ELITE_SURCHARGE = 0.1;
const ELITE_KEYWORDS = ["элит"];

export function BuyBox({ product }: { product: Product }) {
  const hasElite = product.description.toLowerCase().includes(ELITE_KEYWORDS[0]);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product.sizes[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors[0]);
  const [eliteSelected, setEliteSelected] = useState(false);

  const { addItem } = useCart();
  const { openOneClick } = useModals();
  const { showToast } = useToast();

  const displayPrice = useMemo(() => {
    if (!hasElite || !eliteSelected || product.price == null) {
      return { price: product.price, priceMax: product.price_max };
    }
    return {
      price: Math.round(product.price * (1 + ELITE_SURCHARGE)),
      priceMax: product.price_max ? Math.round(product.price_max * (1 + ELITE_SURCHARGE)) : null,
    };
  }, [hasElite, eliteSelected, product.price, product.price_max]);

  function handleAddToCart() {
    if (product.price == null) return;
    addItem({
      slug: product.slug,
      name: product.name,
      price: displayPrice.price!,
      image: product.image,
      size: selectedSize,
      color: selectedColor,
    });
  }

  function handleOneClick() {
    openOneClick({
      productSlug: product.slug,
      productName: product.name,
      productImage: product.image,
      price: displayPrice.price,
      size: selectedSize,
      color: selectedColor,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="mb-1 text-sm text-[var(--color-foreground-muted)] tabular-nums">
          Код: OM-{product.id}
        </p>
        <h1 className="font-display text-[28px] font-semibold leading-tight">{product.name}</h1>
      </div>

      {product.rating != null ? (
        <button
          onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })}
          className="w-fit cursor-pointer"
        >
          <Rating value={product.rating} reviewsCount={product.reviews_count} />
        </button>
      ) : (
        <a href="#review-form" className="w-fit text-sm text-[var(--color-primary)] hover:underline">
          Оставить первый отзыв
        </a>
      )}

      <div>
        <AnimatedPriceRange
          price={displayPrice.price}
          priceMax={displayPrice.priceMax}
          className="font-display text-[40px] font-bold leading-none tabular-nums"
        />
        {product.price_max && product.price_max > (product.price ?? 0) && (
          <p className="mt-1 text-sm text-[var(--color-foreground-muted)]">
            итоговая цена зависит от размера и ткани — уточним при звонке
          </p>
        )}
      </div>

      {product.sizes.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Размер</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <Chip key={size} active={selectedSize === size} onClick={() => setSelectedSize(size)}>
                {size}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {product.colors.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold">Цвет</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <Chip key={color} active={selectedColor === color} onClick={() => setSelectedColor(color)}>
                {color}
              </Chip>
            ))}
          </div>
        </div>
      )}

      {hasElite && (
        <div>
          <p className="mb-2 text-sm font-semibold">Отделка</p>
          <div className="flex flex-wrap gap-2">
            <Chip active={!eliteSelected} onClick={() => setEliteSelected(false)}>
              Стандарт
            </Chip>
            <Chip active={eliteSelected} onClick={() => setEliteSelected(true)}>
              Элит +10%
            </Chip>
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--color-foreground-muted)]">
        Фото может отличаться по цвету ткани и обивки
      </p>

      <div className="flex items-center gap-2 text-sm">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: product.in_stock ? "var(--color-success)" : "var(--color-warning-text)" }}
        />
        <span
          className="font-medium"
          style={{ color: product.in_stock ? "var(--color-success)" : "var(--color-warning-text)" }}
        >
          {product.in_stock ? "Есть в наличии" : "Под заказ"}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="primary"
          size="l"
          fullWidth
          onClick={() => {
            handleAddToCart();
          }}
        >
          Оформить заказ
        </Button>
        <Button variant="secondary" size="l" fullWidth onClick={handleOneClick}>
          Купить в 1 клик
        </Button>
        <button
          onClick={() => showToast({ type: "info", message: "Добавлено в избранное" })}
          aria-label="В избранное"
          className="flex h-14 w-14 shrink-0 items-center justify-center self-center rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border-strong)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] cursor-pointer"
        >
          <Heart size={20} />
        </button>
      </div>

      <p className="text-xs text-[var(--color-foreground-muted)]">
        Подтвердим заказ звонком в течение дня · Оплата картой (пришлём ссылку), курьеру (Москва) или по счёту — как удобно вам · Без предоплаты при оформлении
      </p>

      <TrustIcons category={product.category.slug} />

      <div className="rounded-[var(--radius-md)] bg-[var(--color-background-alt)] p-4 text-sm">
        <p className="mb-2 font-medium">
          Доставим в любой населённый пункт России — точную стоимость и срок сообщит менеджер после оформления заказа.
        </p>
        <Link href="/delivery" className="font-semibold text-[var(--color-primary)] hover:underline">
          Оставить город и телефон — перезвоним с расчётом →
        </Link>
      </div>
    </div>
  );
}
