import { useSyncExternalStore } from "react";
import {
  seedAccounts,
  seedAnnouncements,
  seedApplications,
  seedProfile,
  seedScholarships,
  type Announcement,
  type Application,
  type AppStatus,
  type Profile,
  type Scholarship,
  type UserAccount,
} from "./seed";

export type Role = "student" | "admin" | null;

export interface State {
  role: Role;
  currentUserId: string | null;
  accounts: UserAccount[];
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
  currentUserId: null,
  accounts: seedAccounts,
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
    const parsed = raw ? (JSON.parse(raw) as Partial<State>) : {};
    state = {
      ...initial,
      ...parsed,
      accounts: parsed.accounts?.length ? parsed.accounts : seedAccounts,
      profile: { ...seedProfile, ...(parsed.profile ?? {}) },
      loaded: true,
    };
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

export const isNemsuEmail = (email: string) => email.trim().toLowerCase().endsWith("@nemsu.edu.ph");
export const isValidStudentId = (id: string) => /^\d{2}-\d{5}$/.test(id.trim());

export const actions = {
  login: (role: Role) =>
    set((s) => {
      if (!role) return { role: null, currentUserId: null };
      const demo = s.accounts.find((a) => a.role === role);
      return {
        role,
        currentUserId: demo?.id ?? null,
        profile: role === "student" && demo ? demo.profile : s.profile,
      };
    }),
  loginWithCredentials: (email: string, password: string): { ok: true; role: "student" | "admin" } | { ok: false; error: string } => {
    load();
    const normalized = email.trim().toLowerCase();
    const account = state.accounts.find((a) => a.email.toLowerCase() === normalized);
    if (!account) {
      return { ok: false, error: "No account found with that email address. Please sign up first." };
    }
    if (account.authProvider === "google" && !account.password) {
      return { ok: false, error: "This account uses Google Sign-In. Please click 'Continue with Google'." };
    }
    if (account.password !== password) {
      return { ok: false, error: "Incorrect password. Please try again." };
    }
    set(() => ({
      role: account.role,
      currentUserId: account.id,
      profile: account.role === "student" ? account.profile : state.profile,
    }));
    return { ok: true, role: account.role };
  },
  loginWithGoogle: (
    email: string,
  ): { ok: true; isNew: false; role: "student" | "admin" } | { ok: true; isNew: true } | { ok: false; error: string } => {
    load();
    const normalized = email.trim().toLowerCase();
    if (!isNemsuEmail(normalized)) {
      return { ok: false, error: "Only NEMSU Google accounts ending in @nemsu.edu.ph are allowed." };
    }
    const existing = state.accounts.find((a) => a.email.toLowerCase() === normalized);
    if (existing) {
      set(() => ({
        role: existing.role,
        currentUserId: existing.id,
        profile: existing.role === "student" ? existing.profile : state.profile,
      }));
      return { ok: true, isNew: false, role: existing.role };
    }
    return { ok: true, isNew: true };
  },
  registerStudent: (input: {
    profile: Profile;
    password?: string | undefined;
    authProvider: "email" | "google";
  }): { ok: true } | { ok: false; error: string } => {
    load();
    const normalized = input.profile.email.trim().toLowerCase();
    if (!isNemsuEmail(normalized)) {
      return { ok: false, error: "Only NEMSU student accounts ending in @nemsu.edu.ph can register." };
    }
    if (state.accounts.some((a) => a.email.toLowerCase() === normalized)) {
      return { ok: false, error: "An account with this email already exists. Please sign in instead." };
    }
    const cleanProfile: Profile = {
      ...input.profile,
      email: input.profile.email.trim(),
      name: input.profile.name.trim(),
      studentId: input.profile.studentId.trim(),
      school: input.profile.school.trim(),
      course: input.profile.course.trim(),
    };
    const newAccount: UserAccount = {
      id: "u-" + uid(),
      email: cleanProfile.email,
      password: input.password,
      role: "student",
      authProvider: input.authProvider,
      acceptedTermsAt: new Date().toISOString(),
      profile: cleanProfile,
    };
    set((s) => ({
      accounts: [newAccount, ...s.accounts],
      role: "student",
      currentUserId: newAccount.id,
      profile: cleanProfile,
    }));
    return { ok: true };
  },
  logout: () => set(() => ({ role: null, currentUserId: null })),
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
  saveProfile: (profile: Profile) =>
    set((s) => ({
      profile,
      accounts: s.currentUserId
        ? s.accounts.map((a) => (a.id === s.currentUserId ? { ...a, email: profile.email, profile } : a))
        : s.accounts,
    })),
  reset: () => set(() => ({ ...initial, loaded: true, role: state.role })),
};

export const formatDate = (d: string) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });

export const isOpen = (s: Scholarship) => s.active && s.deadline >= today();
export const daysLeft = (d: string) =>
  Math.ceil((new Date(d + "T00:00:00").getTime() - new Date(today() + "T00:00:00").getTime()) / 86400000);
