"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type, title, message, duration = 4000 }: Omit<ToastItem, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (title: string, message?: string) => addToast({ type: "success", title, message }),
    error: (title: string, message?: string) => addToast({ type: "error", title, message }),
    warning: (title: string, message?: string) => addToast({ type: "warning", title, message }),
    info: (title: string, message?: string) => addToast({ type: "info", title, message }),
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl ${
                t.type === "success"
                  ? "bg-emerald-950/80 border-emerald-500/30 text-emerald-200"
                  : t.type === "error"
                  ? "bg-rose-950/80 border-rose-500/30 text-rose-200"
                  : t.type === "warning"
                  ? "bg-amber-950/80 border-amber-500/30 text-amber-200"
                  : "bg-slate-900/80 border-slate-700/50 text-slate-200"
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {t.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {t.type === "error" && <AlertCircle className="w-5 h-5 text-rose-400" />}
                {t.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
                {t.type === "info" && <Info className="w-5 h-5 text-cyan-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold tracking-tight text-white">{t.title}</h4>
                {t.message && <p className="text-xs mt-1 text-slate-300 leading-relaxed">{t.message}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
