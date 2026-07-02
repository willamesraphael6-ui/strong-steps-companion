import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type ToastItem = { id: number; msg: string; icon?: string };
type Ctx = { push: (msg: string, icon?: string) => void };

const ToastCtx = createContext<Ctx | null>(null);
const listeners = new Set<(t: ToastItem) => void>();

export function toast(msg: string, icon = "💪") {
  const item: ToastItem = { id: Date.now() + Math.random(), msg, icon };
  listeners.forEach((l) => l(item));
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const push = useCallback((msg: string, icon?: string) => {
    toast(msg, icon);
  }, []);
  return <ToastCtx.Provider value={{ push }}>{children}</ToastCtx.Provider>;
}

export function useToast() {
  const c = useContext(ToastCtx);
  if (!c) throw new Error("useToast outside provider");
  return c;
}

export function Toast() {
  const [current, setCurrent] = useState<ToastItem | null>(null);
  useEffect(() => {
    const l = (t: ToastItem) => {
      setCurrent(t);
      window.setTimeout(() => setCurrent((c) => (c?.id === t.id ? null : c)), 2500);
    };
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return (
    <div
      className={
        "fixed top-4 left-1/2 -translate-x-1/2 max-w-sm w-[88%] z-[200] bg-paper text-ink rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-2 font-semibold text-sm transition-transform duration-300 " +
        (current
          ? "translate-y-0"
          : "-translate-y-[200%] pointer-events-none")
      }
      role="status"
    >
      <span className="text-lg">{current?.icon || "💪"}</span>
      <span>{current?.msg || ""}</span>
    </div>
  );
}