import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Project, Screen, Layer, ScreenSet, Background } from "@/lib/types";
import { nanoid } from "@/lib/utils";
import { BASE_TEMPLATES, BLANK_TEMPLATE } from "@/lib/templates";
import { useAuthStore } from "@/lib/store/authStore";
import { toast } from "@/lib/store/toastStore";
import { saveProjectToCloud, deleteProjectFromCloud } from "@/lib/cloudProjectSync";

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
          return baseScreens.map((ts: { background?: unknown; layers?: Layer[] }, index: number) => ({
            id: nanoid(),
            name: `Screen ${index + 1}`,
            width: 1290,
            height: 2796,
            background: (ts.background && typeof ts.background === "object" && "type" in ts.background)
              ? (ts.background as Background)
              : { type: "solid" as const, color: "#0f172a" },
            layers: (ts.layers ?? []).map((l: Layer) => ({
              ...l,
              id: nanoid(),
            })),
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

        // Project limit check: 1 for Guest, 3 for Free Registered, Unlimited for Pro
        try {
          const { isPro, user, setAuthModalOpen, setUpgradeModalOpen } = useAuthStore.getState();
          const isGuest = Boolean(!user || user.isAnonymous);
          if (isGuest && get().projects.length >= 1) {
            setAuthModalOpen(true);
            toast.info("Guest mode is limited to 1 active project. Sign in free with Google or GitHub to create up to 3 projects!");
            throw new Error("Guest project limit reached (1 max).");
          }
          if (!isPro && get().projects.length >= 3) {
            setUpgradeModalOpen(true);
            toast.info("Free plan includes up to 3 local projects. Upgrade to SnapFrame Pro for unlimited projects & multi-device cloud sync!");
            throw new Error("Free project limit reached (3 max).");
          }
        } catch (e: unknown) {
          const err = e as Error;
          if (err.message?.includes("project limit reached")) throw err;
        }

        const project: Project = {
          id: nanoid(),
          name,
          templateId,
          screenSets,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };

        set((state) => ({ projects: [project, ...state.projects] }));

        // Cloud sync if Pro subscriber
        try {
          const { isPro, user } = useAuthStore.getState();
          if (isPro && user?.uid) {
            saveProjectToCloud(user.uid, project);
          }
        } catch {}

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

        // Cloud sync if Pro subscriber
        try {
          if (modifiedProject) {
            const { isPro, user } = useAuthStore.getState();
            if (isPro && user?.uid) {
              saveProjectToCloud(user.uid, modifiedProject);
            }
          }
        } catch {}
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));

        // Cloud sync if Pro subscriber
        try {
          const { isPro, user } = useAuthStore.getState();
          if (isPro && user?.uid) {
            deleteProjectFromCloud(user.uid, id);
          }
        } catch {}
      },

      duplicateProject: (id) => {
        // Project limit check: 1 for Guest, 3 for Free Registered, Unlimited for Pro
        try {
          const { isPro, user, setAuthModalOpen, setUpgradeModalOpen } = useAuthStore.getState();
          const isGuest = Boolean(!user || user.isAnonymous);
          if (isGuest && get().projects.length >= 1) {
            setAuthModalOpen(true);
            toast.info("Guest mode is limited to 1 active project. Sign in free with Google or GitHub to create up to 3 projects!");
            throw new Error("Guest project limit reached (1 max).");
          }
          if (!isPro && get().projects.length >= 3) {
            setUpgradeModalOpen(true);
            toast.info("Free plan includes up to 3 local projects. Upgrade to SnapFrame Pro for unlimited projects & multi-device cloud sync!");
            throw new Error("Free project limit reached (3 max).");
          }
        } catch (e: unknown) {
          const err = e as Error;
          if (err.message?.includes("project limit reached")) throw err;
        }

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

        // Cloud sync if Pro subscriber
        try {
          const { isPro, user } = useAuthStore.getState();
          if (isPro && user?.uid) {
            saveProjectToCloud(user.uid, duplicate);
          }
        } catch {}

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

        // Cloud sync if Pro subscriber
        try {
          if (modifiedProject) {
            const { isPro, user } = useAuthStore.getState();
            if (isPro && user?.uid) {
              saveProjectToCloud(user.uid, modifiedProject);
            }
          }
        } catch {}
      },
    }),
    {
      name: "snapframe-projects",
    }
  )
);
