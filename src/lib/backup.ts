export const BACKUP_VERSION = 1;

export const BACKUP_KEYS = [
  "type-mandarin-history",
  "type-mandarin-review",
  "type-mandarin-chars",
  "type-mandarin-stats",
  "type-mandarin-done",
  "type-mandarin-streak",
  "type-mandarin-daily",
  "soundMode",
  "soundEnabled",
  "showPinyin",
  "strictMode",
] as const;

export type Backup = {
  version: number;
  savedAt: number;
  data: Partial<Record<(typeof BACKUP_KEYS)[number], string | null>>;
};

export function readBackup(raw: unknown): Backup | null {
  if (!raw || typeof raw !== "object") return null;
  const body = raw as { version?: unknown; savedAt?: unknown; data?: unknown };
  if (body.version !== BACKUP_VERSION || !body.data || typeof body.data !== "object") return null;
  const data: Backup["data"] = {};
  for (const key of BACKUP_KEYS) {
    const value = (body.data as Record<string, unknown>)[key];
    if (typeof value === "string" || value === null) data[key] = value;
  }
  return {
    version: BACKUP_VERSION,
    savedAt: typeof body.savedAt === "number" ? body.savedAt : Date.now(),
    data,
  };
}

export function collectBackup(read: (key: string) => string | null): Backup {
  const data: Backup["data"] = {};
  for (const key of BACKUP_KEYS) data[key] = read(key);
  return { version: BACKUP_VERSION, savedAt: Date.now(), data };
}

export function applyBackup(backup: Backup, write: (key: string, value: string | null) => void) {
  for (const key of BACKUP_KEYS) {
    if (!(key in backup.data)) continue;
    write(key, backup.data[key] ?? null);
  }
}
