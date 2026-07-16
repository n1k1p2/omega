import type { Metadata } from "next";
import { Unbounded, Manrope } from "next/font/google";
import "./globals.css";
import { getCategories } from "@/lib/api";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/context/ToastContext";
import { ModalProvider } from "@/context/ModalContext";
import { AuthProvider } from "@/context/AuthContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingCallButton } from "@/components/layout/FloatingCallButton";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { CallbackModal } from "@/components/common/CallbackModal";
import { OneClickModal } from "@/components/common/OneClickModal";
import { MotionProvider } from "@/components/motion/MotionProvider";

const unbounded = Unbounded({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-unbounded",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mebel-omega.ru"),
  title: {
    default: "Мебель Омега — мебель из массива берёзы с фабрики в Юрьевце",
    template: "%s · Мебель Омега",
  },
  description:
    "Фабрика полного цикла в Ивановской области с 2013 года. Кровати, диваны, шкафы, тумбы и комоды из массива берёзы — без посредников. Доставка по всей России.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const categories = await getCategories();

  return (
    <html
      lang="ru"
      data-scroll-behavior="smooth"
      className={`${unbounded.variable} ${manrope.variable} h-full`}
    >
      <body className="flex min-h-full flex-col antialiased">
        <MotionProvider>
          <ToastProvider>
            <AuthProvider>
              <CartProvider>
                <ModalProvider>
                  <Header categories={categories} />
                  <main className="flex-1">{children}</main>
                  <Footer categories={categories} />
                  <FloatingCallButton />
                  <CartDrawer />
                  <CallbackModal />
                  <OneClickModal />
                </ModalProvider>
              </CartProvider>
            </AuthProvider>
          </ToastProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
