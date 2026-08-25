import { describe, it, expect, beforeEach, vi } from "vitest";
import { isUserAdmin, getAdminEmails } from "@/lib/adminAuth";
import {
  saveCustomTemplate,
  getLocalCustomTemplates,
  customTemplateToTemplate,
  submitCustomTemplateForReview,
  deleteCustomTemplate,
  CustomTemplate,
} from "@/lib/customTemplates";

describe("Admin Authorization Utilities", () => {
  it("should accurately identify authorized admin emails", () => {
    expect(isUserAdmin("alexandrmotologa@gmail.com")).toBe(true);
    expect(isUserAdmin("admin@snapframe.store")).toBe(true);
    expect(isUserAdmin("alex@snapframe.store")).toBe(true);
  });

  it("should reject unauthorized regular users and invalid inputs", () => {
    expect(isUserAdmin("regular.user@example.com")).toBe(false);
    expect(isUserAdmin("hacker@malicious.org")).toBe(false);
    expect(isUserAdmin("")).toBe(false);
    expect(isUserAdmin(null)).toBe(false);
    expect(isUserAdmin(undefined)).toBe(false);
  });

  it("should return a list of admin emails", () => {
    const admins = getAdminEmails();
    expect(Array.isArray(admins)).toBe(true);
    expect(admins.length).toBeGreaterThan(0);
  });
});

describe("Pro Custom Templates Management", () => {
  let memoryStore: Record<string, string> = {};

  beforeEach(() => {
    memoryStore = {};
    const mockStorage = {
      getItem: (key: string) => memoryStore[key] || null,
      setItem: (key: string, val: string) => {
        memoryStore[key] = String(val);
      },
      removeItem: (key: string) => {
        delete memoryStore[key];
      },
      clear: () => {
        memoryStore = {};
      },
    };

    vi.stubGlobal("localStorage", mockStorage);
    if (typeof window !== "undefined") {
      vi.stubGlobal("window", {
        ...window,
        localStorage: mockStorage,
        dispatchEvent: vi.fn(),
      });
    }

    // Mock global fetch
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    }));
  });

  it("should save a custom template to local storage with private status by default", async () => {
    const created = await saveCustomTemplate({
      userId: "test-user-123",
      authorName: "Marcus Pro",
      name: "Fintech Dark Horizon",
      description: "Sleek obsidian frames with neon cyan captions",
      category: "Finance",
      tags: ["fintech", "dark", "crypto"],
      screens: [],
      previewGradient: ["#09090b", "#18181b"],
      previewColor: "#06b6d4",
      isPro: true,
      status: "private",
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe("Fintech Dark Horizon");
    expect(created.status).toBe("private");

    const list = getLocalCustomTemplates();
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(created.id);
  });

  it("should convert a CustomTemplate into a valid studio Template object", () => {
    const ct: CustomTemplate = {
      id: "custom-test-1",
      userId: "u1",
      authorName: "Sarah",
      name: "Minimalist Cream",
      description: "Clean aesthetic",
      category: "Minimal",
      tags: ["clean"],
      screens: [],
      previewGradient: ["#fafaf9", "#f5f5f4"],
      previewColor: "#e7e5e4",
      isPro: true,
      status: "approved",
      createdAt: 1000,
      updatedAt: 1000,
    };

    const tpl = customTemplateToTemplate(ct);
    expect(tpl.id).toBe("custom-test-1");
    expect(tpl.name).toBe("Minimalist Cream");
    expect(tpl.tags).toContain("custom");
    expect(tpl.tags).toContain("pro");
    expect(tpl.previewGradient).toEqual(["#fafaf9", "#f5f5f4"]);
  });

  it("should transition template status to pending_review when submitted to community", async () => {
    const created = await saveCustomTemplate({
      userId: "user-submit-1",
      authorName: "DevCreator",
      name: "SaaS Gradient Flow",
      description: "Flow layout",
      category: "Productivity",
      tags: ["saas"],
      screens: [],
      isPro: true,
      status: "private",
    });

    const updated = await submitCustomTemplateForReview(created.id);
    expect(updated?.status).toBe("pending_review");

    const localList = getLocalCustomTemplates();
    expect(localList[0].status).toBe("pending_review");
  });

  it("should delete a custom template from local storage", async () => {
    const created = await saveCustomTemplate({
      userId: "user-del",
      authorName: "Dev",
      name: "To Delete",
      description: "Delete me",
      category: "General",
      tags: [],
      screens: [],
      status: "private",
    });

    expect(getLocalCustomTemplates().length).toBe(1);
    await deleteCustomTemplate(created.id);
    expect(getLocalCustomTemplates().length).toBe(0);
  });
});
