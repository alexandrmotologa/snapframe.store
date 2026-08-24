import { doc, setDoc, deleteDoc, getDocs, collection, onSnapshot, Unsubscribe } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase";
import { useProjectStore } from "@/lib/store/projectStore";
import { useAuthStore } from "@/lib/store/authStore";
import { Project } from "@/lib/types";
import { toast } from "@/lib/store/toastStore";

let currentUnsub: Unsubscribe | null = null;
let isSyncing = false;

/**
 * Initializes real-time cloud synchronization for the user's projects from Firebase Firestore.
 * Cloud sync is exclusively available for SnapFrame Pro subscribers.
 * When a free user upgrades to Pro, all their existing local projects are automatically migrated to Firestore.
 */
export async function syncProjectsOnLogin(uid: string): Promise<void> {
  if (!uid || isSyncing) return;

  const isPro = useAuthStore.getState().isPro;
  if (!isPro) {
    // Free users store projects locally in localStorage
    return;
  }

  isSyncing = true;

  try {
    const db = await getFirebaseDb();
    if (!db) {
      isSyncing = false;
      return;
    }

    const projectsCol = collection(db, "users", uid, "projects");
    
    // 1. Fetch initial snapshot of cloud projects
    const snapshot = await getDocs(projectsCol);
    const cloudProjects: Project[] = [];
    snapshot.forEach((d) => {
      const data = d.data();
      if (data && data.id) {
        cloudProjects.push(data as Project);
      }
    });

    const localProjects = useProjectStore.getState().projects;

    // 2. Merge local + cloud projects (keyed by project ID)
    const mergedMap = new Map<string, Project>();
    
    // Add all cloud projects
    cloudProjects.forEach((p) => mergedMap.set(p.id, p));

    let migratedCount = 0;
    // Migrate local projects to cloud if missing or newer
    for (const lp of localProjects) {
      const existing = mergedMap.get(lp.id);
      if (!existing) {
        mergedMap.set(lp.id, lp);
        await saveProjectToCloud(uid, lp);
        migratedCount++;
      } else {
        const localTime = new Date(lp.updatedAt || 0).getTime();
        const cloudTime = new Date(existing.updatedAt || 0).getTime();
        if (localTime > cloudTime) {
          mergedMap.set(lp.id, lp);
          await saveProjectToCloud(uid, lp);
        }
      }
    }

    if (migratedCount > 0) {
      toast.success(`☁️ Multi-device Cloud Sync enabled! Backed up ${migratedCount} local ${migratedCount === 1 ? "project" : "projects"} to your Pro Cloud.`);
    }

    const mergedList = Array.from(mergedMap.values());
    if (mergedList.length > 0) {
      useProjectStore.setState({ projects: mergedList });
    }

    // 3. Attach real-time snapshot listener for changes across other devices/tabs
    if (currentUnsub) {
      currentUnsub();
    }
    currentUnsub = onSnapshot(projectsCol, (snap) => {
      const remoteProjects: Project[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data && data.id) {
          remoteProjects.push(data as Project);
        }
      });

      if (remoteProjects.length > 0) {
        useProjectStore.setState((state) => {
          const map = new Map<string, Project>();
          state.projects.forEach((p) => map.set(p.id, p));
          remoteProjects.forEach((rp) => {
            const current = map.get(rp.id);
            if (!current || new Date(rp.updatedAt || 0).getTime() >= new Date(current.updatedAt || 0).getTime()) {
              map.set(rp.id, rp);
            }
          });
          return { projects: Array.from(map.values()) };
        });
      }
    }, (error) => {
      // Gracefully handle permission errors when security rules are restricted
      if (error?.code !== "permission-denied") {
        console.warn("[CloudSync] Snapshot listener info:", error?.message || error);
      }
    });

  } catch (err: any) {
    if (err?.code !== "permission-denied" && !err?.message?.includes("permissions")) {
      console.warn("[CloudSync] Sync notice:", err?.message || err);
    }
  } finally {
    isSyncing = false;
  }
}

const cloudSaveTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Recursively cleans any `undefined` values from an object or array to ensure compatibility with Firestore setDoc/updateDoc.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === "object") {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Saves or updates a project in Firestore under users/{uid}/projects/{projectId} (Immediate)
 * Only executed for Pro subscribers.
 */
export async function saveProjectToCloud(uid: string, project: Project): Promise<void> {
  if (!uid || !project?.id) return;
  const isPro = useAuthStore.getState().isPro;
  if (!isPro) return;

  // Clear any pending debounced timers for this project to avoid duplicate writes
  const existingTimer = cloudSaveTimers.get(project.id);
  if (existingTimer) {
    clearTimeout(existingTimer);
    cloudSaveTimers.delete(project.id);
  }

  try {
    const db = await getFirebaseDb();
    if (!db) return;
    const projectRef = doc(db, "users", uid, "projects", project.id);
    const payload = sanitizeForFirestore({
      ...project,
      updatedAt: project.updatedAt || Date.now(),
    });
    await setDoc(projectRef, payload, { merge: true });
  } catch (err: any) {
    if (err?.code !== "permission-denied" && !err?.message?.includes("permissions")) {
      console.warn("[CloudSync] Failed to save project to cloud:", err?.message || err);
    }
  }
}

/**
 * Debounced project save for Firestore to prevent high-frequency write operations during editing.
 */
export function saveProjectToCloudDebounced(uid: string, project: Project, delayMs = 1200): void {
  if (!uid || !project?.id) return;
  const isPro = useAuthStore.getState().isPro;
  if (!isPro) return;

  const existingTimer = cloudSaveTimers.get(project.id);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  const timer = setTimeout(() => {
    cloudSaveTimers.delete(project.id);
    saveProjectToCloud(uid, project);
  }, delayMs);

  cloudSaveTimers.set(project.id, timer);
}

/**
 * Deletes a project from Firestore under users/{uid}/projects/{projectId}
 */
export async function deleteProjectFromCloud(uid: string, projectId: string): Promise<void> {
  if (!uid || !projectId) return;
  const isPro = useAuthStore.getState().isPro;
  if (!isPro) return;

  try {
    const db = await getFirebaseDb();
    if (!db) return;
    const projectRef = doc(db, "users", uid, "projects", projectId);
    await deleteDoc(projectRef);
  } catch (err: any) {
    if (err?.code !== "permission-denied" && !err?.message?.includes("permissions")) {
      console.warn("[CloudSync] Failed to delete project from cloud:", err?.message || err);
    }
  }
}

/**
 * Cleans up listeners on sign-out
 */
export function stopCloudSync(): void {
  if (currentUnsub) {
    currentUnsub();
    currentUnsub = null;
  }
}
