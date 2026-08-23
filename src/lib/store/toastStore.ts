import { create } from "zustand";

export interface ToastItem {
  id: string;
  type: "success" | "info" | "warning" | "error";
  title?: string;
  message: string;
  duration?: number;
  timestamp?: number;
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const MAX_VISIBLE_TOASTS = 3;
const DEDUPE_WINDOW_MS = 1500;
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();
const lastToastTimes = new Map<string, number>();

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  addToast: (toastData) => {
    const now = Date.now();
    const msgKey = `${toastData.type}:${toastData.message}`;

    // 1. Suppress duplicate toast spam within DEDUPE_WINDOW_MS
    const lastSeen = lastToastTimes.get(msgKey);
    if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) {
      return;
    }
    lastToastTimes.set(msgKey, now);

    // Clean up old dedupe entries
    if (lastToastTimes.size > 50) {
      const cutoff = now - 10000;
      lastToastTimes.forEach((time, key) => {
        if (time < cutoff) lastToastTimes.delete(key);
      });
    }

    const id = Math.random().toString(36).substring(2, 9);
    const duration = toastData.duration ?? 3000;

    // 2. Limit maximum visible toasts & deduplicate active messages
    set((state) => {
      const withoutSameMessage = state.toasts.filter((t) => t.message !== toastData.message);
      const trimmed =
        withoutSameMessage.length >= MAX_VISIBLE_TOASTS
          ? withoutSameMessage.slice(withoutSameMessage.length - (MAX_VISIBLE_TOASTS - 1))
          : withoutSameMessage;

      return {
        toasts: [...trimmed, { ...toastData, id, timestamp: now }],
      };
    });

    // 3. Manage auto-dismiss timers
    if (duration > 0) {
      const timer = setTimeout(() => {
        get().removeToast(id);
        toastTimeouts.delete(id);
      }, duration);
      toastTimeouts.set(id, timer);
    }
  },
  removeToast: (id) => {
    const timer = toastTimeouts.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimeouts.delete(id);
    }
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
  clearAll: () => {
    toastTimeouts.forEach((timer) => clearTimeout(timer));
    toastTimeouts.clear();
    set({ toasts: [] });
  },
}));

export const toast = {
  success: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: "success", message, title }),
  info: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: "info", message, title }),
  warning: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: "warning", message, title }),
  error: (message: string, title?: string) =>
    useToastStore.getState().addToast({ type: "error", message, title }),
  clear: () => useToastStore.getState().clearAll(),
};
