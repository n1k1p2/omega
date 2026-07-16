"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import clsx from "clsx";

type ToastType = "success" | "error" | "info";

interface ToastData {
  id: number;
  type: ToastType;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastContextValue {
  showToast: (data: Omit<ToastData, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE: Record<ToastType, { border: string; icon: ReactNode }> = {
  success: { border: "border-l-[var(--color-success)]", icon: <CheckCircle2 size={20} className="text-[var(--color-success)]" /> },
  error: { border: "border-l-[var(--color-destructive)]", icon: <AlertTriangle size={20} className="text-[var(--color-destructive)]" /> },
  info: { border: "border-l-[var(--color-accent)]", icon: <Info size={20} className="text-[var(--color-accent)]" /> },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastData | null>(null);
  const idRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((data: Omit<ToastData, "id">) => {
    idRef.current += 1;
    setToast({ ...data, id: idRef.current });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex justify-center md:inset-x-auto md:right-6 md:top-24 md:justify-end">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 24, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className={clsx(
                "pointer-events-auto relative flex w-[min(92vw,380px)] items-start gap-3 overflow-hidden rounded-[var(--radius-md)] border-l-4 bg-[var(--color-surface)] p-4 shadow-[var(--shadow-lg)]",
                TONE[toast.type].border,
              )}
              role="status"
            >
              <motion.span
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.05, 1] }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {TONE[toast.type].icon}
              </motion.span>
              <div className="flex-1 text-sm text-[var(--color-foreground)]">
                {toast.message}
                {toast.actionLabel && toast.onAction && (
                  <button
                    onClick={toast.onAction}
                    className="mt-1 block font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
                  >
                    {toast.actionLabel}
                  </button>
                )}
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-[var(--color-foreground-muted)] hover:text-[var(--color-foreground)] cursor-pointer"
                aria-label="Закрыть"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[var(--color-primary)]/20">
                <div className="h-full w-full origin-left bg-[var(--color-primary)] [animation:toast-progress_4s_linear_forwards]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <style>{`
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast должен использоваться внутри <ToastProvider>");
  return ctx;
}
