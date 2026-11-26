import Database from "better-sqlite3";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  seedAnnouncements,
  seedScholarships,
  type Announcement,
  type Application,
  type AppStatus,
  type Category,
  type Profile,
  type Scholarship,
} from "@/lib/seed";

export type Role = "student" | "admin" | null;

export interface GoogleAccountSummary {
  id: string;
  email: string;
  name: string;
}

export interface BootstrapPayload {
  role: Role;
  currentUserId: string | null;
  googleAccounts: GoogleAccountSummary[];
  scholarships: Scholarship[];
  announcements: Announcement[];
  applications: Application[];
  saved: string[];
  profile: Profile;
}

const emptyProfile: Profile = {
  studentId: "",
  name: "",
  email: "",
  contactNumber: "",
  school: "North Eastern Mindanao State University",
  course: "",
  yearLevel: "1st Year",
  gwa: "",
  preferredCategories: ["Government"],
  preferredLocation: "Nationwide",
  financialNeed: "Full Tuition + Stipend",
};

const uid = () => crypto.randomBytes(6).toString("hex");
const today = () => new Date().toISOString().slice(0, 10);
const isNemsuEmail = (email: string) => email.trim().toLowerCase().endsWith("@nemsu.edu.ph");

let dbInstance: Database.Database | null = null;

function getDbPath(): string {
  return process.env["ISKOEASE_DB_PATH"] || path.resolve(process.cwd(), "data", "iskoease.db");
}

function initSchema(db: Database.Database) {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT,
      role TEXT NOT NULL CHECK(role IN ('student', 'admin')),
      auth_provider TEXT NOT NULL CHECK(auth_provider IN ('email', 'google')),
      accepted_terms_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      student_id TEXT NOT NULL,
      name TEXT NOT NULL,
      contact_number TEXT NOT NULL DEFAULT '',
      school TEXT NOT NULL,
      course TEXT NOT NULL,
      year_level TEXT NOT NULL,
      gwa TEXT NOT NULL DEFAULT '',
      preferred_categories TEXT NOT NULL DEFAULT '[]',
      preferred_location TEXT NOT NULL DEFAULT 'Nationwide',
      financial_need TEXT NOT NULL DEFAULT 'Full Tuition + Stipend'
    );

    CREATE TABLE IF NOT EXISTS scholarships (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      provider TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      benefits TEXT NOT NULL,
      eligibility TEXT NOT NULL,
      documents TEXT NOT NULL,
      instructions TEXT NOT NULL,
      deadline TEXT NOT NULL,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      institution TEXT NOT NULL,
      date TEXT NOT NULL,
      content TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY,
      scholarship_id TEXT NOT NULL,
      user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
      scholarship_title TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      school TEXT NOT NULL,
      course TEXT NOT NULL,
      year_level TEXT NOT NULL,
      statement TEXT NOT NULL,
      documents TEXT NOT NULL,
      status TEXT NOT NULL,
      submitted_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS saved_scholarships (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      scholarship_id TEXT NOT NULL REFERENCES scholarships(id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, scholarship_id)
    );
  `);
}

function seedInitialContent(db: Database.Database) {
  const scCount = db.prepare("SELECT COUNT(*) as count FROM scholarships").get() as { count: number };
  if (scCount.count === 0) {
    const insertScholarship = db.prepare(`
      INSERT INTO scholarships (id, title, provider, category, location, description, benefits, eligibility, documents, instructions, deadline, active, created_at)
      VALUES (@id, @title, @provider, @category, @location, @description, @benefits, @eligibility, @documents, @instructions, @deadline, @active, @created_at)
    `);
    const tx = db.transaction((items: Scholarship[]) => {
      for (const s of items) {
        insertScholarship.run({
          ...s,
          eligibility: JSON.stringify(s.eligibility),
          documents: JSON.stringify(s.documents),
          active: s.active ? 1 : 0,
          created_at: s.createdAt,
        });
      }
    });
    tx(seedScholarships);
  }

  const anCount = db.prepare("SELECT COUNT(*) as count FROM announcements").get() as { count: number };
  if (anCount.count === 0) {
    const insertAnnouncement = db.prepare(`
      INSERT INTO announcements (id, title, institution, date, content)
      VALUES (@id, @title, @institution, @date, @content)
    `);
    const tx = db.transaction((items: Announcement[]) => {
      for (const a of items) {
        insertAnnouncement.run(a);
      }
    });
    tx(seedAnnouncements);
  }
}

export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;
  const dbPath = getDbPath();
  if (dbPath !== ":memory:") {
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const db = new Database(dbPath);
  initSchema(db);
  seedInitialContent(db);
  dbInstance = db;
  return db;
}

export function resetDbForTests() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, keyHex] = stored.split(":");
  if (!salt || !keyHex) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(keyHex, "hex");
  if (derived.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(derived, storedBuf);
}

const SESSION_SECRET = process.env["ISKOEASE_SESSION_SECRET"] || "iskoease-local-sqlite-session-secret";

export function signSessionToken(userId: string): string {
  const payload = Buffer.from(JSON.stringify({ userId, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString("base64url");
  const sig = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifySessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = crypto.createHmac("sha256", SESSION_SECRET).update(payload).digest("base64url");
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { userId?: string; exp?: number };
    if (!parsed.userId || !parsed.exp || parsed.exp < Date.now()) return null;
    return parsed.userId;
  } catch {
    return null;
  }
}

interface ScholarshipRow {
  id: string;
  title: string;
  provider: string;
  category: Category;
  location: string;
  description: string;
  benefits: string;
  eligibility: string;
  documents: string;
  instructions: string;
  deadline: string;
  active: number;
  created_at: string;
}

interface ApplicationRow {
  id: string;
  scholarship_id: string;
  user_id: string | null;
  scholarship_title: string;
  name: string;
  email: string;
  school: string;
  course: string;
  year_level: string;
  statement: string;
  documents: string;
  status: AppStatus;
  submitted_at: string;
}

function mapScholarship(row: ScholarshipRow): Scholarship {
  return {
    id: row.id,
    title: row.title,
    provider: row.provider,
    category: row.category,
    location: row.location,
    description: row.description,
    benefits: row.benefits,
    eligibility: JSON.parse(row.eligibility) as string[],
    documents: JSON.parse(row.documents) as string[],
    instructions: row.instructions,
    deadline: row.deadline,
    active: row.active === 1,
    createdAt: row.created_at,
  };
}

function mapApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    scholarshipId: row.scholarship_id,
    scholarshipTitle: row.scholarship_title,
    name: row.name,
    email: row.email,
    school: row.school,
    course: row.course,
    yearLevel: row.year_level,
    statement: row.statement,
    documents: JSON.parse(row.documents) as string[],
    status: row.status,
    submittedAt: row.submitted_at,
  };
}

function getProfileForUser(db: Database.Database, userId: string): Profile | null {
  const row = db
    .prepare(
      `SELECT u.email, sp.student_id, sp.name, sp.contact_number, sp.school, sp.course, sp.year_level, sp.gwa, sp.preferred_categories, sp.preferred_location, sp.financial_need
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.id = ?`,
    )
    .get(userId) as
    | {
        email: string;
        student_id: string | null;
        name: string | null;
        contact_number: string | null;
        school: string | null;
        course: string | null;
        year_level: string | null;
        gwa: string | null;
        preferred_categories: string | null;
        preferred_location: string | null;
        financial_need: string | null;
      }
    | undefined;

  if (!row) return null;
  return {
    studentId: row.student_id ?? "",
    name: row.name ?? "",
    email: row.email,
    contactNumber: row.contact_number ?? "",
    school: row.school ?? "North Eastern Mindanao State University",
    course: row.course ?? "",
    yearLevel: row.year_level ?? "1st Year",
    gwa: row.gwa ?? "",
    preferredCategories: row.preferred_categories ? (JSON.parse(row.preferred_categories) as Category[]) : ["Government"],
    preferredLocation: row.preferred_location ?? "Nationwide",
    financialNeed: row.financial_need ?? "Full Tuition + Stipend",
  };
}

export function getBootstrapData(sessionUserId: string | null): BootstrapPayload {
  const db = getDb();
  const scholarships = (db.prepare("SELECT * FROM scholarships ORDER BY created_at DESC").all() as ScholarshipRow[]).map(
    mapScholarship,
  );
  const announcements = db.prepare("SELECT * FROM announcements ORDER BY date DESC").all() as Announcement[];

  const googleAccounts = db
    .prepare(
      `SELECT u.id, u.email, COALESCE(sp.name, u.email) as name
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.auth_provider = 'google'
       ORDER BY u.created_at DESC`,
    )
    .all() as GoogleAccountSummary[];

  let role: Role = null;
  let currentUserId: string | null = null;
  let profile: Profile = emptyProfile;
  let saved: string[] = [];
  let applications: Application[] = [];

  if (sessionUserId) {
    const user = db.prepare("SELECT id, role, email FROM users WHERE id = ?").get(sessionUserId) as
      | { id: string; role: "student" | "admin"; email: string }
      | undefined;

    if (user) {
      role = user.role;
      currentUserId = user.id;
      profile = getProfileForUser(db, user.id) ?? { ...emptyProfile, email: user.email };

      saved = (
        db.prepare("SELECT scholarship_id FROM saved_scholarships WHERE user_id = ?").all(user.id) as {
          scholarship_id: string;
        }[]
      ).map((r) => r.scholarship_id);

      if (user.role === "admin") {
        applications = (
          db.prepare("SELECT * FROM applications ORDER BY submitted_at DESC").all() as ApplicationRow[]
        ).map(mapApplication);
      } else {
        applications = (
          db
            .prepare("SELECT * FROM applications WHERE user_id = ? OR LOWER(email) = LOWER(?) ORDER BY submitted_at DESC")
            .all(user.id, user.email) as ApplicationRow[]
        ).map(mapApplication);
      }
    }
  }

  return {
    role,
    currentUserId,
    googleAccounts,
    scholarships,
    announcements,
    applications,
    saved,
    profile,
  };
}

export function authenticateWithCredentials(
  email: string,
  password: string,
): { ok: true; userId: string; role: "student" | "admin" } | { ok: false; error: string } {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const user = db
    .prepare("SELECT id, password_hash, role, auth_provider FROM users WHERE LOWER(email) = ?")
    .get(normalized) as
    | { id: string; password_hash: string | null; role: "student" | "admin"; auth_provider: "email" | "google" }
    | undefined;

  if (!user) {
    return { ok: false, error: "No account found with that email address. Please sign up first." };
  }
  if (user.auth_provider === "google" && !user.password_hash) {
    return { ok: false, error: "This account uses Google Sign-In. Please click 'Continue with Google'." };
  }
  if (!user.password_hash || !verifyPassword(password, user.password_hash)) {
    return { ok: false, error: "Incorrect password. Please try again." };
  }
  return { ok: true, userId: user.id, role: user.role };
}

export function authenticateWithGoogle(
  email: string,
): { ok: true; isNew: false; userId: string; role: "student" | "admin" } | { ok: true; isNew: true } | { ok: false; error: string } {
  const normalized = email.trim().toLowerCase();
  if (!isNemsuEmail(normalized)) {
    return { ok: false, error: "Only NEMSU Google accounts ending in @nemsu.edu.ph are allowed." };
  }
  const db = getDb();
  const user = db.prepare("SELECT id, role FROM users WHERE LOWER(email) = ?").get(normalized) as
    | { id: string; role: "student" | "admin" }
    | undefined;

  if (user) {
    return { ok: true, isNew: false, userId: user.id, role: user.role };
  }
  return { ok: true, isNew: true };
}

export function registerStudentAccount(input: {
  profile: Profile;
  password?: string | undefined;
  authProvider: "email" | "google";
}): { ok: true; userId: string } | { ok: false; error: string } {
  const normalized = input.profile.email.trim().toLowerCase();
  if (!isNemsuEmail(normalized)) {
    return { ok: false, error: "Only NEMSU student accounts ending in @nemsu.edu.ph can register." };
  }

  const db = getDb();
  const existing = db.prepare("SELECT id FROM users WHERE LOWER(email) = ?").get(normalized);
  if (existing) {
    return { ok: false, error: "An account with this email already exists. Please sign in instead." };
  }

  const userId = "u-" + uid();
  const now = new Date().toISOString();
  const passwordHash = input.authProvider === "email" && input.password ? hashPassword(input.password) : null;

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO users (id, email, password_hash, role, auth_provider, accepted_terms_at, created_at)
       VALUES (?, ?, ?, 'student', ?, ?, ?)`,
    ).run(userId, input.profile.email.trim(), passwordHash, input.authProvider, now, now);

    db.prepare(
      `INSERT INTO student_profiles (user_id, student_id, name, contact_number, school, course, year_level, gwa, preferred_categories, preferred_location, financial_need)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      userId,
      input.profile.studentId.trim(),
      input.profile.name.trim(),
      input.profile.contactNumber.trim(),
      input.profile.school.trim(),
      input.profile.course.trim(),
      input.profile.yearLevel,
      input.profile.gwa.trim(),
      JSON.stringify(input.profile.preferredCategories),
      input.profile.preferredLocation,
      input.profile.financialNeed,
    );
  });
  tx();

  return { ok: true, userId };
}

export function toggleSavedScholarship(userId: string, scholarshipId: string) {
  const db = getDb();
  const existing = db
    .prepare("SELECT 1 FROM saved_scholarships WHERE user_id = ? AND scholarship_id = ?")
    .get(userId, scholarshipId);
  if (existing) {
    db.prepare("DELETE FROM saved_scholarships WHERE user_id = ? AND scholarship_id = ?").run(userId, scholarshipId);
  } else {
    db.prepare("INSERT OR IGNORE INTO saved_scholarships (user_id, scholarship_id) VALUES (?, ?)").run(
      userId,
      scholarshipId,
    );
  }
}

export function submitStudentApplication(
  userId: string | null,
  app: Omit<Application, "id" | "status" | "submittedAt">,
) {
  const db = getDb();
  db.prepare(
    `INSERT INTO applications (id, scholarship_id, user_id, scholarship_title, name, email, school, course, year_level, statement, documents, status, submitted_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', ?)`,
  ).run(
    "ap-" + uid(),
    app.scholarshipId,
    userId,
    app.scholarshipTitle,
    app.name,
    app.email,
    app.school,
    app.course,
    app.yearLevel,
    app.statement,
    JSON.stringify(app.documents),
    today(),
  );
}

export function updateApplicationStatus(id: string, status: AppStatus) {
  getDb().prepare("UPDATE applications SET status = ? WHERE id = ?").run(status, id);
}

export function upsertScholarship(sc: Omit<Scholarship, "id" | "createdAt"> & { id?: string }) {
  const db = getDb();
  if (sc.id) {
    db.prepare(
      `UPDATE scholarships
       SET title = ?, provider = ?, category = ?, location = ?, description = ?, benefits = ?, eligibility = ?, documents = ?, instructions = ?, deadline = ?, active = ?
       WHERE id = ?`,
    ).run(
      sc.title,
      sc.provider,
      sc.category,
      sc.location,
      sc.description,
      sc.benefits,
      JSON.stringify(sc.eligibility),
      JSON.stringify(sc.documents),
      sc.instructions,
      sc.deadline,
      sc.active ? 1 : 0,
      sc.id,
    );
  } else {
    db.prepare(
      `INSERT INTO scholarships (id, title, provider, category, location, description, benefits, eligibility, documents, instructions, deadline, active, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      "s-" + uid(),
      sc.title,
      sc.provider,
      sc.category,
      sc.location,
      sc.description,
      sc.benefits,
      JSON.stringify(sc.eligibility),
      JSON.stringify(sc.documents),
      sc.instructions,
      sc.deadline,
      sc.active ? 1 : 0,
      today(),
    );
  }
}

export function removeScholarship(id: string) {
  getDb().prepare("DELETE FROM scholarships WHERE id = ?").run(id);
}

export function upsertAnnouncement(an: Omit<Announcement, "id"> & { id?: string }) {
  const db = getDb();
  if (an.id) {
    db.prepare("UPDATE announcements SET title = ?, institution = ?, date = ?, content = ? WHERE id = ?").run(
      an.title,
      an.institution,
      an.date,
      an.content,
      an.id,
    );
  } else {
    db.prepare("INSERT INTO announcements (id, title, institution, date, content) VALUES (?, ?, ?, ?, ?)").run(
      "a-" + uid(),
      an.title,
      an.institution,
      an.date,
      an.content,
    );
  }
}

export function removeAnnouncement(id: string) {
  getDb().prepare("DELETE FROM announcements WHERE id = ?").run(id);
}

export function updateStudentProfile(userId: string, profile: Profile) {
  const db = getDb();
  const tx = db.transaction(() => {
    db.prepare("UPDATE users SET email = ? WHERE id = ?").run(profile.email.trim(), userId);
    db.prepare(
      `INSERT INTO student_profiles (user_id, student_id, name, contact_number, school, course, year_level, gwa, preferred_categories, preferred_location, financial_need)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         student_id = excluded.student_id,
         name = excluded.name,
         contact_number = excluded.contact_number,
         school = excluded.school,
         course = excluded.course,
         year_level = excluded.year_level,
         gwa = excluded.gwa,
         preferred_categories = excluded.preferred_categories,
         preferred_location = excluded.preferred_location,
         financial_need = excluded.financial_need`,
    ).run(
      userId,
      profile.studentId.trim(),
      profile.name.trim(),
      profile.contactNumber.trim(),
      profile.school.trim(),
      profile.course.trim(),
      profile.yearLevel,
      profile.gwa.trim(),
      JSON.stringify(profile.preferredCategories),
      profile.preferredLocation,
      profile.financialNeed,
    );
  });
  tx();
}
