"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Info, AlertTriangle, AlertCircle, X } from "lucide-react";
import { useToastStore } from "@/lib/store/toastStore";
import { cn } from "@/lib/utils";

const ICONS = {
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
};

const STYLES = {
  success: "border-emerald-500/40 text-emerald-500 dark:text-emerald-400 bg-card/98 shadow-2xl shadow-emerald-500/10",
  info: "border-indigo-500/40 text-indigo-500 dark:text-indigo-400 bg-card/98 shadow-2xl shadow-indigo-500/10",
  warning: "border-amber-500/40 text-amber-500 dark:text-amber-400 bg-card/98 shadow-2xl shadow-amber-500/10",
  error: "border-rose-500/40 text-rose-500 dark:text-rose-400 bg-card/98 shadow-2xl shadow-rose-500/10",
};

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full"
    >
      <AnimatePresence>
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-md text-foreground select-none ring-1 ring-border/50",
                STYLES[t.type]
              )}
            >
              <Icon className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0 pr-1">
                {t.title && (
                  <p className="text-xs font-semibold text-foreground leading-tight mb-0.5">{t.title}</p>
                )}
                <p className="text-xs text-foreground/90 leading-snug">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="w-5 h-5 rounded-md hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0 transition-colors cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
