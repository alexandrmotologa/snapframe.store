import { create } from "zustand";
import { Project, Screen, Layer, ScreenSet, Background } from "@/lib/types";
import { nanoid } from "@/lib/utils";
import { BASE_TEMPLATES, BLANK_TEMPLATE } from "@/lib/templates";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import { saveProjectToCloud, saveProjectToCloudDebounced, deleteProjectFromCloud } from "@/lib/cloudProjectSync";
import { FREE_MAX_PROJECTS } from "@/lib/constants";

/** Returns the scoped storage key based on user authentication status */
export function getProjectStorageKey(uid?: string | null, isAnonymous?: boolean): string {
  if (uid && !isAnonymous) {
    return `snapframe-projects_${uid}`;
  }
  return "snapframe-projects_guest";
}

/** Loads projects from a given localStorage key with compatibility fallback */
export function loadProjectsFromStorage(storageKey: string): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.state?.projects)) return parsed.state.projects;
    if (parsed && Array.isArray(parsed.projects)) return parsed.projects;
    return [];
  } catch (e) {
    console.warn("[ProjectStore] Failed to load projects from storageKey:", storageKey, e);
    return [];
  }
}

/** Saves projects to a specific localStorage key */
export function saveProjectsToStorage(storageKey: string, projects: Project[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey, JSON.stringify({ state: { projects }, version: 0 }));
  } catch (e) {
    console.warn("[ProjectStore] Failed to save projects to storageKey:", storageKey, e);
  }
}

/** Resolves the active storage key based on current Auth state or cached session */
function getActiveStorageKey(): string {
  if (typeof window === "undefined") return "snapframe-projects_guest";
  try {
    const { user } = useAuthStore.getState();
    if (user?.uid && !user.isAnonymous) {
      return `snapframe-projects_${user.uid}`;
    }
    const authCacheRaw = localStorage.getItem("snapframe-cached-auth-session");
    if (authCacheRaw) {
      const parsed = JSON.parse(authCacheRaw);
      if (parsed?.user?.uid && !parsed.user.isAnonymous) {
        return `snapframe-projects_${parsed.user.uid}`;
      }
    }
  } catch {}
  return "snapframe-projects_guest";
}

/** Saves projects to the current active user's storage bucket */
export function saveProjectsToActiveStorage(projects: Project[]) {
  const key = getActiveStorageKey();
  saveProjectsToStorage(key, projects);
}

/** Migrates legacy global 'snapframe-projects' to scoped storage on first run */
function migrateLegacyProjects(initialUid?: string | null, isAnonymous?: boolean) {
  if (typeof window === "undefined") return;
  try {
    const legacyRaw = localStorage.getItem("snapframe-projects");
    if (legacyRaw) {
      const legacyProjects = loadProjectsFromStorage("snapframe-projects");
      if (legacyProjects.length > 0) {
        const targetKey = getProjectStorageKey(initialUid, isAnonymous);
        const current = loadProjectsFromStorage(targetKey);
        if (current.length === 0) {
          saveProjectsToStorage(targetKey, legacyProjects);
        }
      }
      localStorage.removeItem("snapframe-projects");
    }
  } catch {}
}

/** Initial startup load of projects for the current session */
function getInitialProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const authCacheRaw = localStorage.getItem("snapframe-cached-auth-session");
    let cachedUid: string | null = null;
    let isAnon = true;
    if (authCacheRaw) {
      const parsed = JSON.parse(authCacheRaw);
      if (parsed?.user?.uid) {
        cachedUid = parsed.user.uid;
        isAnon = Boolean(parsed.user.isAnonymous);
      }
    }
    migrateLegacyProjects(cachedUid, isAnon);
    const targetKey = getProjectStorageKey(cachedUid, isAnon);
    return loadProjectsFromStorage(targetKey);
  } catch {
    return [];
  }
}

/** Switches the active project bucket when logging in, logging out, or migrating from guest */
export function switchProjectUser(
  newUid: string | null,
  isAnonymous = false,
  wasGuest = false
): Project[] {
  if (typeof window === "undefined") return [];

  const newKey = getProjectStorageKey(newUid, isAnonymous);

  // 1. If migrating from Guest session to a registered user
  if (wasGuest && newUid && !isAnonymous) {
    const guestProjects = loadProjectsFromStorage("snapframe-projects_guest");
    if (guestProjects.length > 0) {
      const userProjects = loadProjectsFromStorage(newKey);
      const existingIds = new Set(userProjects.map((p) => p.id));
      const merged = [...guestProjects.filter((gp) => !existingIds.has(gp.id)), ...userProjects];
      saveProjectsToStorage(newKey, merged);
      localStorage.removeItem("snapframe-projects_guest");
      useProjectStore.setState({ projects: merged });
      return merged;
    }
  }

  // 2. Load target user's projects (or empty guest workspace)
  const loadedProjects = loadProjectsFromStorage(newKey);
  useProjectStore.setState({ projects: loadedProjects });
  return loadedProjects;
}

/** Enforces project limits based on user auth tier */
function enforceProjectLimit(currentCount: number) {
  const { isPro, user, setAuthModalOpen, setUpgradeModalOpen } = useAuthStore.getState();
  const isGuest = Boolean(!user || user.isAnonymous);

  if (isGuest && currentCount >= 1) {
    setAuthModalOpen(true);
    toast.info("Guest mode is limited to 1 active project. Sign in free with Google or GitHub to create up to 3 projects!");
    throw new Error("Guest project limit reached (1 max).");
  }

  if (!isPro && currentCount >= FREE_MAX_PROJECTS) {
    setUpgradeModalOpen(true);
    toast.info(`Free plan includes up to ${FREE_MAX_PROJECTS} local projects. Upgrade to SnapFrame Pro for unlimited projects & multi-device cloud sync!`);
    throw new Error(`Free project limit reached (${FREE_MAX_PROJECTS} max).`);
  }
}

/** Syncs a project to cloud if the user is an active Pro subscriber */
function syncProjectIfPro(project: Project, debounced = false) {
  try {
    const { isPro, user } = useAuthStore.getState();
    if (isPro && user?.uid) {
      if (debounced) {
        saveProjectToCloudDebounced(user.uid, project);
      } else {
        saveProjectToCloud(user.uid, project);
      }
    }
  } catch {}
}

/** Deletes a project from cloud if the user is an active Pro subscriber */
function deleteProjectIfPro(projectId: string) {
  try {
    const { isPro, user } = useAuthStore.getState();
    if (isPro && user?.uid) {
      deleteProjectFromCloud(user.uid, projectId);
    }
  } catch {}
}

interface ProjectStore {
  projects: Project[];
  createProject: (
    templateId: string | null,
    name: string,
    platforms?: { ios: boolean; android: boolean },
    templateData?: import("@/lib/types").Template | null
  ) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project;
  getProject: (id: string) => Project | undefined;
  saveProjectThumbnail: (id: string, dataUrl: string) => void;
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: getInitialProjects(),

  createProject: (templateId, name, platforms = { ios: true, android: true }, templateData = null) => {
    const ID_ALIASES: Record<string, string> = {
      "premium-dark": "template-28",
      "minimal-light": "template-29",
      "vibrant-playful": "template-30",
      "professional-blue": "template-31",
      "neon-cyber": "template-32",
      "dynamic-flow": "template-33",
    };
    const resolvedId = templateId ? (ID_ALIASES[templateId] ?? templateId) : null;
    const template = templateData ?? (resolvedId
      ? BASE_TEMPLATES.find((t) => t.id === resolvedId)
      : null);

    const baseScreens = template?.screens && template.screens.length > 0
      ? template.screens
      : BLANK_TEMPLATE.screens;

    const generateScreens = (): Screen[] => {
      return baseScreens.map((ts, index: number) => ({
        id: nanoid(),
        name: `Screen ${index + 1}`,
        width: 1290,
        height: 2796,
        background: (ts.background && typeof ts.background === "object" && "type" in ts.background)
          ? (ts.background as Background)
          : { type: "solid" as const, color: "#0f172a" },
        layers: (ts.layers ?? []).map((l) => ({
          ...l,
          id: nanoid(),
        })) as Layer[],
      }));
    };

    const screenSets: ScreenSet[] = [];

    if (platforms.ios) {
      screenSets.push({
        id: nanoid(),
        store: "ios",
        name: "iOS - iPhone 16 Pro Max",
        preset: {
          name: 'iPhone 6.7"',
          width: 1290,
          height: 2796,
          store: "ios",
          description: "App Store standard",
        },
        mockup: {
          device: "iphone-16-pro-max",
          color: "natural-titanium",
          showFrame: true,
          showReflection: true,
          showShadow: true,
        },
        deviceId: "iphone-16-pro-max",
        screens: generateScreens(),
      });
    }

    if (platforms.android) {
      screenSets.push({
        id: nanoid(),
        store: "android",
        name: "Android - Modern Phone",
        preset: {
          name: 'Android 6.7"',
          width: 1290,
          height: 2796,
          store: "android",
          description: "Google Play standard",
        },
        mockup: {
          device: "pixel-10-pro-xl",
          color: "obsidian",
          showFrame: true,
          showReflection: true,
          showShadow: true,
        },
        deviceId: "pixel-10-pro-xl",
        screens: generateScreens(),
      });
    }

    if (screenSets.length === 0) {
      screenSets.push({
        id: nanoid(),
        store: "ios",
        name: "Default Set",
        preset: {
          name: 'iPhone 6.7"',
          width: 1290,
          height: 2796,
          store: "ios",
          description: "App Store standard",
        },
        mockup: {
          device: "iphone-16-pro-max",
          color: "natural-titanium",
          showFrame: true,
          showReflection: true,
          showShadow: true,
        },
        deviceId: "iphone-16-pro-max",
        screens: generateScreens(),
      });
    }

    // Enforce plan project limits
    enforceProjectLimit(get().projects.length);

    const project: Project = {
      id: nanoid(),
      name,
      templateId,
      screenSets,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => {
      const updated = [project, ...state.projects];
      saveProjectsToActiveStorage(updated);
      return { projects: updated };
    });

    syncProjectIfPro(project, false);
    return project;
  },

  updateProject: (id, updates) => {
    let modifiedProject: Project | undefined;
    set((state) => {
      const updatedList = state.projects.map((p) => {
        if (p.id === id) {
          modifiedProject = { ...p, ...updates, updatedAt: Date.now() };
          return modifiedProject;
        }
        return p;
      });
      saveProjectsToActiveStorage(updatedList);
      return { projects: updatedList };
    });

    if (modifiedProject) {
      syncProjectIfPro(modifiedProject, true);
    }
  },

  deleteProject: (id) => {
    set((state) => {
      const updatedList = state.projects.filter((p) => p.id !== id);
      saveProjectsToActiveStorage(updatedList);
      return { projects: updatedList };
    });
    deleteProjectIfPro(id);
  },

  duplicateProject: (id) => {
    enforceProjectLimit(get().projects.length);

    const project = get().projects.find((p) => p.id === id);
    if (!project) throw new Error("Project not found");

    const duplicate: Project = {
      ...project,
      id: nanoid(),
      name: `${project.name} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      screenSets: project.screenSets.map((ss) => ({
        ...ss,
        id: nanoid(),
        screens: ss.screens.map((s) => ({
          ...s,
          id: nanoid(),
          layers: s.layers.map((l) => ({ ...l, id: nanoid() })),
        })),
      })),
    };

    set((state) => {
      const updatedList = [duplicate, ...state.projects];
      saveProjectsToActiveStorage(updatedList);
      return { projects: updatedList };
    });

    syncProjectIfPro(duplicate, false);
    return duplicate;
  },

  getProject: (id) => get().projects.find((p) => p.id === id),

  saveProjectThumbnail: (id, dataUrl) => {
    let modifiedProject: Project | undefined;
    set((state) => {
      const updatedList = state.projects.map((p) => {
        if (p.id === id) {
          modifiedProject = { ...p, thumbnail: dataUrl };
          return modifiedProject;
        }
        return p;
      });
      saveProjectsToActiveStorage(updatedList);
      return { projects: updatedList };
    });

    if (modifiedProject) {
      syncProjectIfPro(modifiedProject, false);
    }
  },
}));
