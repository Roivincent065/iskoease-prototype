// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  authenticateWithCredentials,
  authenticateWithGoogle,
  getBootstrapData,
  registerStudentAccount,
  resetDbForTests,
  signSessionToken,
  submitStudentApplication,
  toggleSavedScholarship,
  updateStudentProfile,
  verifySessionToken,
} from "@/server/db";
import type { Profile } from "@/lib/seed";

const sampleProfile: Profile = {
  studentId: "24-12345",
  name: "Maria Clara",
  email: "maria.clara@nemsu.edu.ph",
  contactNumber: "0917-555-0100",
  school: "North Eastern Mindanao State University",
  course: "BS Computer Science",
  yearLevel: "2nd Year",
  gwa: "1.45",
  preferredCategories: ["Government", "University"],
  preferredLocation: "Nationwide",
  financialNeed: "Full Tuition + Stipend",
};

describe("SQLite database layer", () => {
  beforeEach(() => {
    process.env["ISKOEASE_DB_PATH"] = ":memory:";
    resetDbForTests();
  });

  afterEach(() => {
    resetDbForTests();
    delete process.env["ISKOEASE_DB_PATH"];
  });

  it("seeds scholarships and announcements without mock users", () => {
    const data = getBootstrapData(null);
    expect(data.scholarships.length).toBeGreaterThan(0);
    expect(data.announcements.length).toBeGreaterThan(0);
    expect(data.googleAccounts).toHaveLength(0);
    expect(data.role).toBeNull();
  });

  it("enforces @nemsu.edu.ph and authenticates registered students with hashed passwords", () => {
    const nonNemsu = registerStudentAccount({
      profile: { ...sampleProfile, email: "maria@gmail.com" },
      password: "secret123",
      authProvider: "email",
    });
    expect(nonNemsu).toEqual({
      ok: false,
      error: "Only NEMSU student accounts ending in @nemsu.edu.ph can register.",
    });

    const reg = registerStudentAccount({
      profile: sampleProfile,
      password: "secret123",
      authProvider: "email",
    });
    expect(reg.ok).toBe(true);
    if (!reg.ok) return;

    const badLogin = authenticateWithCredentials("maria.clara@nemsu.edu.ph", "wrongpass");
    expect(badLogin.ok).toBe(false);

    const goodLogin = authenticateWithCredentials("maria.clara@nemsu.edu.ph", "secret123");
    expect(goodLogin).toEqual({ ok: true, userId: reg.userId, role: "student" });
  });

  it("handles Google sign-in, saved scholarships, profile updates, applications, and session tokens", () => {
    const newGoogle = authenticateWithGoogle("jose.rizal@nemsu.edu.ph");
    expect(newGoogle).toEqual({ ok: true, isNew: true });

    const reg = registerStudentAccount({
      profile: { ...sampleProfile, studentId: "24-54321", name: "Jose Rizal", email: "jose.rizal@nemsu.edu.ph" },
      authProvider: "google",
    });
    expect(reg.ok).toBe(true);
    if (!reg.ok) return;

    const existingGoogle = authenticateWithGoogle("jose.rizal@nemsu.edu.ph");
    expect(existingGoogle).toEqual({ ok: true, isNew: false, userId: reg.userId, role: "student" });

    toggleSavedScholarship(reg.userId, "s1");
    updateStudentProfile(reg.userId, { ...sampleProfile, email: "jose.rizal@nemsu.edu.ph", gwa: "1.25" });
    submitStudentApplication(reg.userId, {
      scholarshipId: "s1",
      scholarshipTitle: "Merit Scholarship Program (Demo)",
      name: "Jose Rizal",
      email: "jose.rizal@nemsu.edu.ph",
      school: "North Eastern Mindanao State University",
      course: "BS Computer Science",
      yearLevel: "2nd Year",
      statement: "I am committed to academic excellence and community service.",
      documents: ["Form 138: form138.pdf"],
    });

    const token = signSessionToken(reg.userId);
    expect(verifySessionToken(token)).toBe(reg.userId);

    const state = getBootstrapData(reg.userId);
    expect(state.role).toBe("student");
    expect(state.saved).toEqual(["s1"]);
    expect(state.profile.gwa).toBe("1.25");
    expect(state.applications).toHaveLength(1);
    expect(state.googleAccounts).toHaveLength(1);
  });
});
