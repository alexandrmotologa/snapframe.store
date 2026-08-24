import { describe, it, expect, beforeEach, beforeAll } from "vitest";
import {
  getProjectStorageKey,
  loadProjectsFromStorage,
  saveProjectsToStorage,
  switchProjectUser,
  useProjectStore,
} from "@/lib/store/projectStore";
import { Project } from "@/lib/types";

// In-memory localStorage mock for node test environment
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => {
    mockStorage[key] = value.toString();
  },
  removeItem: (key: string) => {
    delete mockStorage[key];
  },
  clear: () => {
    for (const key of Object.keys(mockStorage)) {
      delete mockStorage[key];
    }
  },
};

beforeAll(() => {
  (global as any).window = { location: { origin: "http://localhost:3000" } };
  (global as any).localStorage = localStorageMock;
});

describe("Project Store Multi-Tenant Isolation & Storage", () => {
  beforeEach(() => {
    localStorageMock.clear();
    useProjectStore.setState({ projects: [] });
  });

  it("should generate correct scoped storage keys", () => {
    expect(getProjectStorageKey("user_abc123", false)).toBe("snapframe-projects_user_abc123");
    expect(getProjectStorageKey("user_anon999", true)).toBe("snapframe-projects_guest");
    expect(getProjectStorageKey(null, false)).toBe("snapframe-projects_guest");
    expect(getProjectStorageKey(undefined, false)).toBe("snapframe-projects_guest");
  });

  it("should save and load projects correctly per storage key", () => {
    const mockProjects: Project[] = [
      {
        id: "proj-1",
        name: "User 1 App",
        templateId: "template-1",
        screenSets: [],
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    saveProjectsToStorage("snapframe-projects_user_1", mockProjects);
    const loaded = loadProjectsFromStorage("snapframe-projects_user_1");
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe("User 1 App");

    // Other user key should be empty
    const loadedUser2 = loadProjectsFromStorage("snapframe-projects_user_2");
    expect(loadedUser2).toHaveLength(0);
  });

  it("should isolate projects between different user accounts", () => {
    const userAProjects: Project[] = [
      {
        id: "proj-a",
        name: "User A Fintech App",
        templateId: null,
        screenSets: [],
        createdAt: 1000,
        updatedAt: 1000,
      },
    ];

    const userBProjects: Project[] = [
      {
        id: "proj-b",
        name: "User B Crypto App",
        templateId: null,
        screenSets: [],
        createdAt: 2000,
        updatedAt: 2000,
      },
    ];

    saveProjectsToStorage("snapframe-projects_user_a", userAProjects);
    saveProjectsToStorage("snapframe-projects_user_b", userBProjects);

    // 1. User A logs in
    switchProjectUser("user_a", false, false);
    expect(useProjectStore.getState().projects).toHaveLength(1);
    expect(useProjectStore.getState().projects[0].name).toBe("User A Fintech App");

    // 2. User A logs out
    switchProjectUser(null, true, false);
    expect(useProjectStore.getState().projects).toHaveLength(0);

    // 3. User B logs in
    switchProjectUser("user_b", false, false);
    expect(useProjectStore.getState().projects).toHaveLength(1);
    expect(useProjectStore.getState().projects[0].name).toBe("User B Crypto App");

    // 4. Verify User A's data was never modified or leaked to User B
    const userAStored = loadProjectsFromStorage("snapframe-projects_user_a");
    expect(userAStored).toHaveLength(1);
    expect(userAStored[0].name).toBe("User A Fintech App");
  });

  it("should seamlessly migrate guest projects to new account upon registration", () => {
    const guestDraftProject: Project = {
      id: "guest-draft-1",
      name: "My First Draft Screenshot",
      templateId: "template-28",
      screenSets: [],
      createdAt: 5000,
      updatedAt: 5000,
    };

    // Guest creates a project in guest storage
    saveProjectsToStorage("snapframe-projects_guest", [guestDraftProject]);
    useProjectStore.setState({ projects: [guestDraftProject] });

    // Guest registers with new UID
    const migrated = switchProjectUser("new_user_123", false, true);

    expect(migrated).toHaveLength(1);
    expect(migrated[0].name).toBe("My First Draft Screenshot");
    expect(useProjectStore.getState().projects[0].id).toBe("guest-draft-1");

    // Guest bucket should be cleared
    const remainingGuestProjects = loadProjectsFromStorage("snapframe-projects_guest");
    expect(remainingGuestProjects).toHaveLength(0);

    // Stored in new user key
    const userProjects = loadProjectsFromStorage("snapframe-projects_new_user_123");
    expect(userProjects).toHaveLength(1);
    expect(userProjects[0].name).toBe("My First Draft Screenshot");
  });
});
