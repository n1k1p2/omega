"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

interface OneClickTarget {
  productSlug: string;
  productName: string;
  productImage: string | null;
  price: number | null;
  size?: string;
  color?: string;
}

interface ModalContextValue {
  isCallbackOpen: boolean;
  openCallback: () => void;
  closeCallback: () => void;
  oneClickTarget: OneClickTarget | null;
  openOneClick: (target: OneClickTarget) => void;
  closeOneClick: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [isCallbackOpen, setIsCallbackOpen] = useState(false);
  const [oneClickTarget, setOneClickTarget] = useState<OneClickTarget | null>(null);

  const value = useMemo(
    () => ({
      isCallbackOpen,
      openCallback: () => setIsCallbackOpen(true),
      closeCallback: () => setIsCallbackOpen(false),
      oneClickTarget,
      openOneClick: (target: OneClickTarget) => setOneClickTarget(target),
      closeOneClick: () => setOneClickTarget(null),
    }),
    [isCallbackOpen, oneClickTarget],
  );

  return <ModalContext.Provider value={value}>{children}</ModalContext.Provider>;
}

export function useModals(): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModals должен использоваться внутри <ModalProvider>");
  return ctx;
}

export type { OneClickTarget };
