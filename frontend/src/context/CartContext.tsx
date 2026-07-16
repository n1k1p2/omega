"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CartItem } from "@/types/cart";

const STORAGE_KEY = "omega_cart_v1";

function lineKey(item: Pick<CartItem, "slug" | "size" | "color">) {
  return `${item.slug}__${item.size ?? ""}__${item.color ?? ""}`;
}

interface AddItemInput {
  slug: string;
  name: string;
  price: number;
  image: string | null;
  size?: string;
  color?: string;
  quantity?: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  isDrawerOpen: boolean;
  addItem: (input: AddItemInput) => void;
  removeItem: (item: Pick<CartItem, "slug" | "size" | "color">) => void;
  updateQuantity: (item: Pick<CartItem, "slug" | "size" | "color">, quantity: number) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  clearCart: () => void;
  lastAdded: CartItem | null;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState<CartItem | null>(null);
  const hasShownDrawerThisSession = useRef(false);
  const hydrated = useRef(false);

  // Загрузка из localStorage при монтировании (клиент-онли) — намеренный
  // setState в эффекте: localStorage недоступен при SSR, синхронизация
  // с этим внешним хранилищем возможна только после монтирования на клиенте.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CartItem[];
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      // повреждённые данные localStorage — игнорируем, начинаем с пустой корзины
    } finally {
      hydrated.current = true;
    }
  }, []);

  // Сохранение при каждом изменении (после гидрации, чтобы не затирать сохранённое пустым массивом).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // квота localStorage превышена — не критично, корзина продолжит работать в памяти
    }
  }, [items]);

  const addItem = useCallback((input: AddItemInput) => {
    const quantity = input.quantity ?? 1;
    setItems((prev) => {
      const key = lineKey(input);
      const existing = prev.find((i) => lineKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          lineKey(i) === key ? { ...i, quantity: i.quantity + quantity } : i,
        );
      }
      return [...prev, { ...input, quantity }];
    });
    setLastAdded({ ...input, quantity });
    setIsDrawerOpen(true);
    hasShownDrawerThisSession.current = true;
  }, []);

  const removeItem = useCallback((target: Pick<CartItem, "slug" | "size" | "color">) => {
    setItems((prev) => prev.filter((i) => lineKey(i) !== lineKey(target)));
  }, []);

  const updateQuantity = useCallback(
    (target: Pick<CartItem, "slug" | "size" | "color">, quantity: number) => {
      setItems((prev) =>
        prev
          .map((i) => (lineKey(i) === lineKey(target) ? { ...i, quantity } : i))
          .filter((i) => i.quantity > 0),
      );
    },
    [],
  );

  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);
  const clearCart = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const total = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items]);

  const value = useMemo(
    () => ({
      items,
      count,
      total,
      isDrawerOpen,
      addItem,
      removeItem,
      updateQuantity,
      openDrawer,
      closeDrawer,
      clearCart,
      lastAdded,
    }),
    [items, count, total, isDrawerOpen, addItem, removeItem, updateQuantity, openDrawer, closeDrawer, clearCart, lastAdded],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart должен использоваться внутри <CartProvider>");
  return ctx;
}
