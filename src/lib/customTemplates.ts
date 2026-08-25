import { TemplateScreen, Template } from "@/lib/types";

export type CustomTemplateStatus = "private" | "pending_review" | "approved" | "rejected";

export interface CustomTemplate {
  id: string;
  userId: string;
  authorName: string;
  authorEmail?: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  screens: TemplateScreen[];
  previewGradient?: string[];
  previewColor?: string;
  isPro?: boolean;
  status: CustomTemplateStatus;
  rejectionReason?: string;
  createdAt: number;
  updatedAt: number;
}

const LOCAL_STORAGE_KEY = "snapframe_custom_templates";
const CUSTOM_TEMPLATES_EVENT = "snapframe_custom_templates_updated";

/**
 * Gets local custom templates saved in LocalStorage
 */
export function getLocalCustomTemplates(): CustomTemplate[] {
  if (typeof window === "undefined" && typeof localStorage === "undefined") return [];
  try {
    const storage = typeof window !== "undefined" ? window.localStorage : (typeof localStorage !== "undefined" ? localStorage : null);
    const raw = storage ? storage.getItem(LOCAL_STORAGE_KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Failed to parse custom templates from localStorage:", err);
    return [];
  }
}

/**
 * Saves local custom templates into LocalStorage
 */
export function saveLocalCustomTemplates(templates: CustomTemplate[]): void {
  if (typeof window === "undefined" && typeof localStorage === "undefined") return;
  try {
    const storage = typeof window !== "undefined" ? window.localStorage : (typeof localStorage !== "undefined" ? localStorage : null);
    if (storage) {
      storage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(templates));
    }
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event(CUSTOM_TEMPLATES_EVENT));
    }
  } catch (err) {
    console.warn("Failed to save custom templates to localStorage:", err);
  }
}

/**
 * Converts a CustomTemplate into a standard Template object for rendering in the studio/previews
 */
export function customTemplateToTemplate(ct: CustomTemplate): Template {
  return {
    id: ct.id,
    name: ct.name,
    description: ct.description,
    category: ct.category,
    tags: [...(ct.tags || []), "custom", ...(ct.isPro ? ["pro"] : [])],
    layout: "screenshot-bottom",
    screens: ct.screens,
    previewGradient: ct.previewGradient || ["#1e1e24", "#0a0a0f"],
    previewColor: ct.previewColor || "#6366f1",
  };
}

/**
 * Creates or updates a custom template for a Pro user
 */
export async function saveCustomTemplate(
  data: Omit<CustomTemplate, "id" | "createdAt" | "updatedAt"> & { id?: string }
): Promise<CustomTemplate> {
  const now = Date.now();
  const id = data.id || `custom-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const templateObj: CustomTemplate = {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  };

  // 1. Update local storage immediately for fast UI response
  const existing = getLocalCustomTemplates();
  const index = existing.findIndex((t) => t.id === id);
  if (index >= 0) {
    existing[index] = { ...existing[index], ...templateObj, updatedAt: now };
  } else {
    existing.unshift(templateObj);
  }
  saveLocalCustomTemplates(existing);

  // 2. Fire-and-forget sync to backend API / Firestore
  try {
    await fetch("/api/templates/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateObj),
    });
  } catch (err) {
    console.warn("Could not sync custom template to Firestore, saved locally:", err);
  }

  return templateObj;
}

/**
 * Deletes a custom template
 */
export async function deleteCustomTemplate(templateId: string): Promise<boolean> {
  const existing = getLocalCustomTemplates();
  const filtered = existing.filter((t) => t.id !== templateId);
  saveLocalCustomTemplates(filtered);

  try {
    await fetch(`/api/templates/community?id=${encodeURIComponent(templateId)}`, {
      method: "DELETE",
    });
    return true;
  } catch {
    return true;
  }
}

/**
 * Submits a custom template for public community review
 */
export async function submitCustomTemplateForReview(templateId: string): Promise<CustomTemplate | null> {
  const existing = getLocalCustomTemplates();
  const index = existing.findIndex((t) => t.id === templateId);
  if (index < 0) return null;

  existing[index].status = "pending_review";
  existing[index].updatedAt = Date.now();
  saveLocalCustomTemplates(existing);

  try {
    await fetch("/api/templates/community", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(existing[index]),
    });
  } catch (err) {
    console.warn("Failed to notify backend of template submission:", err);
  }

  return existing[index];
}

/**
 * Fetches all publicly approved community templates from backend API
 */
export async function getApprovedCommunityTemplates(): Promise<Template[]> {
  try {
    const res = await fetch("/api/templates/community", {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const data: CustomTemplate[] = await res.json();
    return data.map(customTemplateToTemplate);
  } catch {
    return [];
  }
}
