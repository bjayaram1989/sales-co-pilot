import { randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  passwordHash: string | null;
  image: string | null;
}

const defaultDbPath = resolve(process.cwd(), '.data/auth.db');
const dbPath = process.env.AUTH_DB_PATH ? resolve(process.env.AUTH_DB_PATH) : defaultDbPath;

mkdirSync(dirname(dbPath), { recursive: true });

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    password_hash TEXT,
    image TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

function mapUser(row: Record<string, unknown> | undefined): AuthUser | null {
  if (!row) {
    return null;
  }

  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    passwordHash: row.password_hash ? String(row.password_hash) : null,
    image: row.image ? String(row.image) : null,
  };
}

function hashPassword(password: string): string {
  const salt = randomUUID();
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  if (!salt || !hash) {
    return false;
  }

  const passwordBuffer = scryptSync(password, salt, 64);
  const hashBuffer = Buffer.from(hash, 'hex');

  if (passwordBuffer.length !== hashBuffer.length) {
    return false;
  }

  return timingSafeEqual(passwordBuffer, hashBuffer);
}

export function getUserByEmail(email: string): AuthUser | null {
  const stmt = db.prepare('SELECT id, email, name, password_hash, image FROM users WHERE email = ? LIMIT 1');
  return mapUser(stmt.get(email.trim().toLowerCase()) as Record<string, unknown> | undefined);
}

export function createUserWithPassword(params: { email: string; password: string; name?: string }): AuthUser {
  const now = new Date().toISOString();
  const email = params.email.trim().toLowerCase();
  const name = params.name?.trim() || null;
  const id = randomUUID();
  const passwordHash = hashPassword(params.password);

  const stmt = db.prepare(`
    INSERT INTO users (id, email, name, password_hash, image, created_at, updated_at)
    VALUES (?, ?, ?, ?, NULL, ?, ?)
  `);

  stmt.run(id, email, name, passwordHash, now, now);

  return {
    id,
    email,
    name,
    passwordHash,
    image: null,
  };
}

export function upsertGoogleUser(params: { email: string; name?: string; image?: string }): AuthUser {
  const now = new Date().toISOString();
  const email = params.email.trim().toLowerCase();
  const name = params.name?.trim() || null;
  const image = params.image?.trim() || null;

  const existing = getUserByEmail(email);

  if (existing) {
    db.prepare('UPDATE users SET name = ?, image = ?, updated_at = ? WHERE id = ?').run(name, image, now, existing.id);
    return {
      ...existing,
      name,
      image,
    };
  }

  const id = randomUUID();

  db.prepare(`
    INSERT INTO users (id, email, name, password_hash, image, created_at, updated_at)
    VALUES (?, ?, ?, NULL, ?, ?, ?)
  `).run(id, email, name, image, now, now);

  return {
    id,
    email,
    name,
    passwordHash: null,
    image,
  };
}

export function verifyUserCredentials(email: string, password: string): AuthUser | null {
  const user = getUserByEmail(email);
  if (!user?.passwordHash) {
    return null;
  }

  return verifyPassword(password, user.passwordHash) ? user : null;
}
