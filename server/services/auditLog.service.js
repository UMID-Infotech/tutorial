// server/services/auditLog.service.js
//
// Audit Log Service — no database required.
// Logs are stored in two places:
//   1. In-memory circular buffer (fast reads, last MAX_IN_MEMORY entries)
//   2. JSONL file on disk (persistent across restarts)
//
// File location: server/logs/audit.log
// Each line is a JSON object — one event per line.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ── Config ───────────────────────────────────────────────────────────────────
const LOG_DIR = path.join(__dirname, "../logs");
const LOG_FILE = path.join(LOG_DIR, "audit.log");
const MAX_IN_MEMORY = 500; // keep last 500 events in memory

// ── Event Types ───────────────────────────────────────────────────────────────
export const AUDIT_EVENTS = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGIN_LOCKED: "LOGIN_LOCKED",
  LOGOUT: "LOGOUT",
  GOOGLE_LOGIN_SUCCESS: "GOOGLE_LOGIN_SUCCESS",
  PASSWORD_RESET_REQUESTED: "PASSWORD_RESET_REQUESTED",
  PASSWORD_RESET_COMPLETED: "PASSWORD_RESET_COMPLETED",
  TENANT_REGISTERED: "TENANT_REGISTERED",
  TENANT_APPROVED: "TENANT_APPROVED",
  TENANT_BLOCKED: "TENANT_BLOCKED",
  TENANT_INACTIVE: "TENANT_INACTIVE",
  TENANT_DELETED: "TENANT_DELETED",
};

// ── In-memory buffer ──────────────────────────────────────────────────────────
let auditBuffer = [];

// ── Ensure log directory exists ───────────────────────────────────────────────
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// ── Core: add a log entry ─────────────────────────────────────────────────────
export function addAuditLog({ event, userId = null, email = null, role = null, tenantId = null, meta = {}, req = null }) {
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    event,
    userId: userId ? String(userId) : null,
    email,
    role,
    tenantId: tenantId ? String(tenantId) : null,
    ip: req ? (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || null) : null,
    userAgent: req ? (req.headers["user-agent"] || null) : null,
    meta,
    timestamp: new Date().toISOString(),
  };

  // Push to in-memory buffer (circular)
  auditBuffer.push(entry);
  if (auditBuffer.length > MAX_IN_MEMORY) {
    auditBuffer.shift(); // drop oldest
  }

  // Append to file (non-blocking)
  fs.appendFile(LOG_FILE, JSON.stringify(entry) + "\n", (err) => {
    if (err) console.error("[AuditLog] Failed to write log entry:", err.message);
  });

  return entry;
}

// ── Read logs ─────────────────────────────────────────────────────────────────
// Returns in-memory buffer. If you want file-based (older) entries, use readLogsFromFile().
export function getRecentLogs({ limit = 100, event = null, email = null } = {}) {
  let logs = [...auditBuffer].reverse(); // newest first

  if (event) logs = logs.filter((l) => l.event === event);
  if (email) logs = logs.filter((l) => l.email === email);

  return logs.slice(0, limit);
}

// ── Read from file (for full history) ────────────────────────────────────────
export function readLogsFromFile({ limit = 200, event = null, email = null } = {}) {
  try {
    if (!fs.existsSync(LOG_FILE)) return [];

    const raw = fs.readFileSync(LOG_FILE, "utf-8");
    let lines = raw
      .trim()
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        try { return JSON.parse(line); } catch { return null; }
      })
      .filter(Boolean)
      .reverse(); // newest first

    if (event) lines = lines.filter((l) => l.event === event);
    if (email) lines = lines.filter((l) => l.email === email);

    return lines.slice(0, limit);
  } catch (err) {
    console.error("[AuditLog] Failed to read log file:", err.message);
    return [];
  }
}
