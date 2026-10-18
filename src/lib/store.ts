import { useSyncExternalStore } from "react";
import {
  seedAnnouncements,
  seedApplications,
  seedProfile,
  seedScholarships,
  type Announcement,
  type Application,
  type AppStatus,
  type Profile,
  type Scholarship,
} from "./seed";

export type Role = "student" | "admin" | null;

export interface State {
  role: Role;
  scholarships: Scholarship[];
  announcements: Announcement[];
  applications: Application[];
  saved: string[];
  profile: Profile;
  loaded: boolean;
}

const KEY = "iskoease-v1";

const initial: State = {
  role: null,
  scholarships: seedScholarships,
  announcements: seedAnnouncements,
  applications: seedApplications,
  saved: [],
  profile: seedProfile,
  loaded: false,
};

let state: State = initial;
let hydrated = false;
const listeners = new Set<() => void>();

function load() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = localStorage.getItem(KEY);
    state = { ...initial, ...(raw ? JSON.parse(raw) : {}), loaded: true };
  } catch {
    state = { ...initial, loaded: true };
  }
}

function set(fn: (s: State) => Partial<State>) {
  load();
  state = { ...state, ...fn(state) };
  const { loaded: _l, ...persist } = state;
  try {
    localStorage.setItem(KEY, JSON.stringify(persist));
  } catch {
    /* storage full or unavailable */
  }
  listeners.forEach((l) => l());
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => {
      load();
      return selector(state);
    },
    () => selector(initial),
  );
}

const uid = () => Math.random().toString(36).slice(2, 10);
const today = () => new Date().toISOString().slice(0, 10);

export const actions = {
  login: (role: Role) => set(() => ({ role })),
  logout: () => set(() => ({ role: null })),
  toggleSaved: (id: string) =>
    set((s) => ({ saved: s.saved.includes(id) ? s.saved.filter((x) => x !== id) : [...s.saved, id] })),
  submitApplication: (a: Omit<Application, "id" | "status" | "submittedAt">) =>
    set((s) => ({ applications: [{ ...a, id: uid(), status: "Submitted", submittedAt: today() }, ...s.applications] })),
  setStatus: (id: string, status: AppStatus) =>
    set((s) => ({ applications: s.applications.map((a) => (a.id === id ? { ...a, status } : a)) })),
  saveScholarship: (sc: Omit<Scholarship, "id" | "createdAt"> & { id?: string }) =>
    set((s) =>
      sc.id
        ? { scholarships: s.scholarships.map((x) => (x.id === sc.id ? { ...x, ...sc, id: x.id } : x)) }
        : { scholarships: [{ ...sc, id: uid(), createdAt: today() }, ...s.scholarships] },
    ),
  deleteScholarship: (id: string) =>
    set((s) => ({ scholarships: s.scholarships.filter((x) => x.id !== id), saved: s.saved.filter((x) => x !== id) })),
  saveAnnouncement: (an: Omit<Announcement, "id"> & { id?: string }) =>
    set((s) =>
      an.id
        ? { announcements: s.announcements.map((x) => (x.id === an.id ? { ...x, ...an, id: x.id } : x)) }
        : { announcements: [{ ...an, id: uid() }, ...s.announcements] },
    ),
  deleteAnnouncement: (id: string) => set((s) => ({ announcements: s.announcements.filter((x) => x.id !== id) })),
  saveProfile: (profile: Profile) => set(() => ({ profile })),
  reset: () => set(() => ({ ...initial, loaded: true, role: state.role })),
};

export const formatDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });

export const isOpen = (s: Scholarship) => s.active && s.deadline >= today();
export const daysLeft = (d: string) =>
  Math.ceil((new Date(d + "T00:00:00").getTime() - new Date(today() + "T00:00:00").getTime()) / 86400000);
