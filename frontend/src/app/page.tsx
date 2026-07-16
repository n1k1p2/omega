import type { Metadata } from "next";
import { getCategories, getProducts, getReviews } from "@/lib/api";
import { Hero } from "@/components/home/Hero";
import { TrustMarquee } from "@/components/home/TrustMarquee";
import { WhyOmega } from "@/components/home/WhyOmega";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Bestsellers } from "@/components/home/Bestsellers";
import { MaterialSection } from "@/components/home/MaterialSection";
import { QuizPicker } from "@/components/home/QuizPicker";
import { BundlesSection } from "@/components/home/BundlesSection";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { DeliverySection } from "@/components/home/DeliverySection";
import { FAQSection } from "@/components/home/FAQSection";
import { FinalCTASection } from "@/components/home/FinalCTASection";
import type { Review } from "@/types/catalog";

export const metadata: Metadata = {
  title: "Мебель из массива берёзы с фабрики — купить недорого без посредников",
  description:
    "Кровати, диваны, шкафы, тумбы и комоды из массива берёзы от фабрики «Омега» в Юрьевце. Двойное крепление углов, съёмные чехлы диванов, доставка по всей России.",
};

export default async function HomePage() {
  const [categories, bestsellersRes, shkafyRes] = await Promise.all([
    getCategories(),
    getProducts({ is_bestseller: true, ordering: "popular" }),
    getProducts({ category: "shkafy", ordering: "popular" }),
  ]);

  const bestsellers = bestsellersRes.results;

  // Собираем реальные отзывы бестселлеров (демо-отзывы сидируются именно на них).
  const reviewLists = await Promise.all(
    bestsellers.slice(0, 6).map((p) => getReviews(p.slug)),
  );
  const reviews: Review[] = reviewLists.flat();

  return (
    <>
      <Hero />
      <TrustMarquee />
      <WhyOmega />
      <CategoryGrid categories={categories} />
      <Bestsellers products={bestsellers} />
      <MaterialSection />
      <QuizPicker />
      <BundlesSection products={shkafyRes.results} />
      <ReviewsSection reviews={reviews} />
      <DeliverySection />
      <FAQSection />
      <FinalCTASection />
    </>
  );
}
