import { useSyncExternalStore } from "react";
import {
  deleteAnnouncementFn,
  deleteScholarshipFn,
  fetchStateFn,
  loginWithCredentialsFn,
  loginWithGoogleFn,
  logoutFn,
  registerStudentFn,
  saveAnnouncementFn,
  saveProfileFn,
  saveScholarshipFn,
  setApplicationStatusFn,
  submitApplicationFn,
  toggleSavedFn,
} from "./server-fns";
import {
  seedAnnouncements,
  seedProfile,
  seedScholarships,
  type Announcement,
  type Application,
  type AppStatus,
  type Profile,
  type Scholarship,
} from "./seed";

export type Role = "student" | "admin" | null;

export interface GoogleAccountSummary {
  id: string;
  email: string;
  name: string;
}

export interface State {
  role: Role;
  currentUserId: string | null;
  googleAccounts: GoogleAccountSummary[];
  scholarships: Scholarship[];
  announcements: Announcement[];
  applications: Application[];
  saved: string[];
  profile: Profile;
  loaded: boolean;
}

const initial: State = {
  role: null,
  currentUserId: null,
  googleAccounts: [],
  scholarships: seedScholarships,
  announcements: seedAnnouncements,
  applications: [],
  saved: [],
  profile: seedProfile,
  loaded: false,
};

let state: State = initial;
let loadingPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function applyServerState(payload: Omit<State, "loaded">) {
  state = { ...payload, loaded: true };
  listeners.forEach((l) => l());
}

function ensureLoaded() {
  if (state.loaded || loadingPromise || typeof window === "undefined") return;
  loadingPromise = fetchStateFn()
    .then((payload) => {
      applyServerState(payload);
    })
    .catch(() => {
      state = { ...state, loaded: true };
      listeners.forEach((l) => l());
    })
    .finally(() => {
      loadingPromise = null;
    });
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      ensureLoaded();
      return () => listeners.delete(cb);
    },
    () => {
      ensureLoaded();
      return selector(state);
    },
    () => selector(initial),
  );
}

export const isNemsuEmail = (email: string) => email.trim().toLowerCase().endsWith("@nemsu.edu.ph");
export const isValidStudentId = (id: string) => /^\d{2}-\d{5}$/.test(id.trim());

export const actions = {
  hydrate: async () => {
    const payload = await fetchStateFn();
    applyServerState(payload);
  },
  loginWithCredentials: async (
    email: string,
    password: string,
  ): Promise<{ ok: true; role: "student" | "admin" } | { ok: false; error: string }> => {
    const res = await loginWithCredentialsFn({ data: { email, password } });
    if (!res.ok) return res;
    applyServerState(res.state);
    return { ok: true, role: res.role };
  },
  loginWithGoogle: async (
    email: string,
  ): Promise<{ ok: true; isNew: false; role: "student" | "admin" } | { ok: true; isNew: true } | { ok: false; error: string }> => {
    const res = await loginWithGoogleFn({ data: { email } });
    if (!res.ok || res.isNew) return res;
    applyServerState(res.state);
    return { ok: true, isNew: false, role: res.role };
  },
  registerStudent: async (input: {
    profile: Profile;
    password?: string | undefined;
    authProvider: "email" | "google";
  }): Promise<{ ok: true } | { ok: false; error: string }> => {
    const res = await registerStudentFn({ data: input });
    if (!res.ok) return res;
    applyServerState(res.state);
    return { ok: true };
  },
  logout: async () => {
    const payload = await logoutFn();
    applyServerState(payload);
  },
  toggleSaved: async (id: string) => {
    const payload = await toggleSavedFn({ data: { scholarshipId: id } });
    applyServerState(payload);
  },
  submitApplication: async (a: Omit<Application, "id" | "status" | "submittedAt">) => {
    const payload = await submitApplicationFn({ data: a });
    applyServerState(payload);
  },
  setStatus: async (id: string, status: AppStatus) => {
    const payload = await setApplicationStatusFn({ data: { id, status } });
    applyServerState(payload);
  },
  saveScholarship: async (sc: Omit<Scholarship, "id" | "createdAt"> & { id?: string }) => {
    const payload = await saveScholarshipFn({ data: sc });
    applyServerState(payload);
  },
  deleteScholarship: async (id: string) => {
    const payload = await deleteScholarshipFn({ data: { id } });
    applyServerState(payload);
  },
  saveAnnouncement: async (an: Omit<Announcement, "id"> & { id?: string }) => {
    const payload = await saveAnnouncementFn({ data: an });
    applyServerState(payload);
  },
  deleteAnnouncement: async (id: string) => {
    const payload = await deleteAnnouncementFn({ data: { id } });
    applyServerState(payload);
  },
  saveProfile: async (profile: Profile) => {
    const payload = await saveProfileFn({ data: profile });
    applyServerState(payload);
  },
};

export const formatDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });

export const isOpen = (s: Scholarship) => s.active && s.deadline >= new Date().toISOString().slice(0, 10);
export const daysLeft = (d: string) =>
  Math.ceil(
    (new Date(d + "T00:00:00").getTime() - new Date(new Date().toISOString().slice(0, 10) + "T00:00:00").getTime()) /
      86400000,
  );
