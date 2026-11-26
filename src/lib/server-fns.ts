import { createServerFn } from "@tanstack/react-start";
import type { Announcement, Application, AppStatus, Profile, Scholarship } from "@/lib/seed";
import type { BootstrapPayload } from "@/server/db";

const SESSION_COOKIE = "iskoease_session";

async function getSessionUserId(): Promise<string | null> {
  const { getCookie } = await import("@tanstack/react-start/server");
  const { verifySessionToken } = await import("@/server/db");
  return verifySessionToken(getCookie(SESSION_COOKIE));
}

async function setSessionCookie(userId: string) {
  const { setCookie } = await import("@tanstack/react-start/server");
  const { signSessionToken } = await import("@/server/db");
  setCookie(SESSION_COOKIE, signSessionToken(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

async function clearSessionCookie() {
  const { deleteCookie } = await import("@tanstack/react-start/server");
  deleteCookie(SESSION_COOKIE, { path: "/" });
}

export const fetchStateFn = createServerFn({ method: "GET" }).handler(async (): Promise<BootstrapPayload> => {
  const { getBootstrapData } = await import("@/server/db");
  const userId = await getSessionUserId();
  return getBootstrapData(userId);
});

export const loginWithCredentialsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string; password: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<{ ok: true; role: "student" | "admin"; state: BootstrapPayload } | { ok: false; error: string }> => {
      const { authenticateWithCredentials, getBootstrapData } = await import("@/server/db");
      const res = authenticateWithCredentials(data.email, data.password);
      if (!res.ok) return res;
      await setSessionCookie(res.userId);
      return { ok: true, role: res.role, state: getBootstrapData(res.userId) };
    },
  );

export const loginWithGoogleFn = createServerFn({ method: "POST" })
  .inputValidator((data: { email: string }) => data)
  .handler(
    async ({
      data,
    }): Promise<
      | { ok: true; isNew: false; role: "student" | "admin"; state: BootstrapPayload }
      | { ok: true; isNew: true }
      | { ok: false; error: string }
    > => {
      const { authenticateWithGoogle, getBootstrapData } = await import("@/server/db");
      const res = authenticateWithGoogle(data.email);
      if (!res.ok || res.isNew) return res;
      await setSessionCookie(res.userId);
      return { ok: true, isNew: false, role: res.role, state: getBootstrapData(res.userId) };
    },
  );

export const registerStudentFn = createServerFn({ method: "POST" })
  .inputValidator((data: { profile: Profile; password?: string | undefined; authProvider: "email" | "google" }) => data)
  .handler(async ({ data }): Promise<{ ok: true; state: BootstrapPayload } | { ok: false; error: string }> => {
    const { registerStudentAccount, getBootstrapData } = await import("@/server/db");
    const res = registerStudentAccount(data);
    if (!res.ok) return res;
    await setSessionCookie(res.userId);
    return { ok: true, state: getBootstrapData(res.userId) };
  });

export const logoutFn = createServerFn({ method: "POST" }).handler(async (): Promise<BootstrapPayload> => {
  await clearSessionCookie();
  const { getBootstrapData } = await import("@/server/db");
  return getBootstrapData(null);
});

export const toggleSavedFn = createServerFn({ method: "POST" })
  .inputValidator((data: { scholarshipId: string }) => data)
  .handler(async ({ data }): Promise<BootstrapPayload> => {
    const { toggleSavedScholarship, getBootstrapData } = await import("@/server/db");
    const userId = await getSessionUserId();
    if (userId) toggleSavedScholarship(userId, data.scholarshipId);
    return getBootstrapData(userId);
  });

export const submitApplicationFn = createServerFn({ method: "POST" })
  .inputValidator((data: Omit<Application, "id" | "status" | "submittedAt">) => data)
  .handler(async ({ data }): Promise<BootstrapPayload> => {
    const { submitStudentApplication, getBootstrapData } = await import("@/server/db");
    const userId = await getSessionUserId();
    submitStudentApplication(userId, data);
    return getBootstrapData(userId);
  });

export const setApplicationStatusFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string; status: AppStatus }) => data)
  .handler(async ({ data }): Promise<BootstrapPayload> => {
    const { updateApplicationStatus, getBootstrapData } = await import("@/server/db");
    updateApplicationStatus(data.id, data.status);
    return getBootstrapData(await getSessionUserId());
  });

export const saveScholarshipFn = createServerFn({ method: "POST" })
  .inputValidator((data: Omit<Scholarship, "id" | "createdAt"> & { id?: string }) => data)
  .handler(async ({ data }): Promise<BootstrapPayload> => {
    const { upsertScholarship, getBootstrapData } = await import("@/server/db");
    upsertScholarship(data);
    return getBootstrapData(await getSessionUserId());
  });

export const deleteScholarshipFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<BootstrapPayload> => {
    const { removeScholarship, getBootstrapData } = await import("@/server/db");
    removeScholarship(data.id);
    return getBootstrapData(await getSessionUserId());
  });

export const saveAnnouncementFn = createServerFn({ method: "POST" })
  .inputValidator((data: Omit<Announcement, "id"> & { id?: string }) => data)
  .handler(async ({ data }): Promise<BootstrapPayload> => {
    const { upsertAnnouncement, getBootstrapData } = await import("@/server/db");
    upsertAnnouncement(data);
    return getBootstrapData(await getSessionUserId());
  });

export const deleteAnnouncementFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<BootstrapPayload> => {
    const { removeAnnouncement, getBootstrapData } = await import("@/server/db");
    removeAnnouncement(data.id);
    return getBootstrapData(await getSessionUserId());
  });

export const saveProfileFn = createServerFn({ method: "POST" })
  .inputValidator((data: Profile) => data)
  .handler(async ({ data }): Promise<BootstrapPayload> => {
    const { updateStudentProfile, getBootstrapData } = await import("@/server/db");
    const userId = await getSessionUserId();
    if (userId) updateStudentProfile(userId, data);
    return getBootstrapData(userId);
  });
