import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Project, Screen, Layer, ScreenSet, Background } from "@/lib/types";
import { nanoid } from "@/lib/utils";
import { BASE_TEMPLATES, BLANK_TEMPLATE } from "@/lib/templates";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import { saveProjectToCloud, saveProjectToCloudDebounced, deleteProjectFromCloud } from "@/lib/cloudProjectSync";
import { FREE_MAX_PROJECTS } from "@/lib/constants";

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

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],

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

        set((state) => ({ projects: [project, ...state.projects] }));
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
          return { projects: updatedList };
        });

        if (modifiedProject) {
          syncProjectIfPro(modifiedProject, true);
        }
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
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

        set((state) => ({
          projects: [duplicate, ...state.projects],
        }));

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
          return { projects: updatedList };
        });

        if (modifiedProject) {
          syncProjectIfPro(modifiedProject, false);
        }
      },
    }),
    {
      name: "snapframe-projects",
    }
  )
);
