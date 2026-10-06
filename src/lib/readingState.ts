/**
 * Pure reading-state helpers for the Liaozhai tale catalog.
 *
 * The canonical invariant is deliberately small: percentage determines
 * status, and favorites are independent of completion. All record-producing
 * helpers return fresh, null-prototype objects so imported IDs cannot mutate an
 * object's prototype.
 */

export const TALE_READING_STATUSES = [
  "unread",
  "in-progress",
  "read",
] as const;

export type TaleReadingStatus = (typeof TALE_READING_STATUSES)[number];

export const TALE_READING_FILTERS = [
  "all",
  "read",
  "unread",
  "in-progress",
  "favorites",
] as const;

export type ReadingFilter = (typeof TALE_READING_FILTERS)[number];

/** Backwards-compatible descriptive alias for callers that prefer the prefix. */
export type TaleReadingFilter = ReadingFilter;

export interface TaleReadingState {
  status: TaleReadingStatus;
  percent: number;
  favorite: boolean;
}

export type TaleReadingRecord = Record<string, TaleReadingState>;

export interface TaleReadingCounts {
  all: number;
  read: number;
  unread: number;
  inProgress: number;
  favorites: number;
}

const UNSAFE_RECORD_KEYS = new Set(["__proto__", "constructor", "prototype"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isReadingStatus(value: unknown): value is TaleReadingStatus {
  return (
    value === "unread" || value === "in-progress" || value === "read"
  );
}

function normalizeTaleId(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const id = value.trim();
  return id && !UNSAFE_RECORD_KEYS.has(id) ? id : null;
}

function createRecord(): TaleReadingRecord {
  return Object.create(null) as TaleReadingRecord;
}

function defaultPercentForStatus(status: TaleReadingStatus): number {
  if (status === "read") return 100;
  if (status === "in-progress") return 25;
  return 0;
}

function normalizePercent(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.min(100, Math.max(0, Math.round(value)));
}

function statusForPercent(percent: number): TaleReadingStatus {
  if (percent <= 0) return "unread";
  if (percent >= 100) return "read";
  return "in-progress";
}

function uniqueTaleIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const seen = new Set<string>();
  const ids: string[] = [];
  for (const candidate of value) {
    const id = normalizeTaleId(candidate);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }
  return ids;
}

/** Normalize one candidate into a canonical percentage-driven state. */
export function normalizeTaleReadingState(value: unknown): TaleReadingState {
  const candidate = isRecord(value) ? value : {};
  const suppliedStatus = isReadingStatus(candidate.status)
    ? candidate.status
    : "unread";
  const percent = normalizePercent(
    candidate.percent,
    defaultPercentForStatus(suppliedStatus),
  );

  return {
    status: statusForPercent(percent),
    percent,
    favorite: candidate.favorite === true,
  };
}

/**
 * Normalize an imported record without requiring a catalog allowlist.
 * Unknown-but-safe tale IDs are intentionally retained for forward
 * compatibility; malformed values and prototype-sensitive keys are dropped.
 */
export function normalizeTaleReadingRecord(value: unknown): TaleReadingRecord {
  const normalized = createRecord();
  if (!isRecord(value)) return normalized;

  for (const [candidateId, candidateState] of Object.entries(value)) {
    const id = normalizeTaleId(candidateId);
    if (!id || !isRecord(candidateState)) continue;
    normalized[id] = normalizeTaleReadingState(candidateState);
  }
  return normalized;
}

/** Convert the v1 `readTaleIds` array into canonical per-tale states. */
export function deriveTaleReadingRecordFromLegacy(
  readTaleIds: unknown,
): TaleReadingRecord {
  const derived = createRecord();
  for (const id of uniqueTaleIds(readTaleIds)) {
    derived[id] = { status: "read", percent: 100, favorite: false };
  }
  return derived;
}

/** Read a canonical state; absent or unsafe IDs behave as unread. */
export function getTaleReadingState(
  record: unknown,
  taleId: unknown,
): TaleReadingState {
  const id = normalizeTaleId(taleId);
  if (!id || !isRecord(record) || !Object.hasOwn(record, id)) {
    return { status: "unread", percent: 0, favorite: false };
  }
  return normalizeTaleReadingState(record[id]);
}

/** Set a percentage, deriving unread/in-progress/read from 0/1-99/100. */
export function setTaleReadingPercent(
  record: unknown,
  taleId: unknown,
  percent: number,
): TaleReadingRecord {
  const next = normalizeTaleReadingRecord(record);
  const id = normalizeTaleId(taleId);
  if (!id) return next;

  const current = getTaleReadingState(next, id);
  const normalizedPercent = normalizePercent(percent, current.percent);
  next[id] = {
    ...current,
    status: statusForPercent(normalizedPercent),
    percent: normalizedPercent,
  };
  return next;
}

/**
 * Set a status with useful percentage semantics: unread is 0, read is 100,
 * and in-progress retains a partial percentage or begins at 25%.
 */
export function setTaleReadingStatus(
  record: unknown,
  taleId: unknown,
  status: TaleReadingStatus,
): TaleReadingRecord {
  const next = normalizeTaleReadingRecord(record);
  const id = normalizeTaleId(taleId);
  if (!id || !isReadingStatus(status)) return next;

  const current = getTaleReadingState(next, id);
  const percent =
    status === "unread"
      ? 0
      : status === "read"
        ? 100
        : current.percent > 0 && current.percent < 100
          ? current.percent
          : 25;

  next[id] = { ...current, status, percent };
  return next;
}

/** Toggle a favorite independently of completion status. */
export function toggleTaleFavorite(
  record: unknown,
  taleId: unknown,
): TaleReadingRecord {
  const next = normalizeTaleReadingRecord(record);
  const id = normalizeTaleId(taleId);
  if (!id) return next;

  const current = getTaleReadingState(next, id);
  next[id] = { ...current, favorite: !current.favorite };
  return next;
}

/** Count canonical states for a supplied catalog slice. Missing IDs are unread. */
export function countTaleReadingStates(
  taleIds: readonly string[],
  record: unknown,
): TaleReadingCounts {
  const counts: TaleReadingCounts = {
    all: 0,
    read: 0,
    unread: 0,
    inProgress: 0,
    favorites: 0,
  };

  for (const id of uniqueTaleIds(taleIds)) {
    const state = getTaleReadingState(record, id);
    counts.all += 1;
    if (state.status === "read") counts.read += 1;
    if (state.status === "unread") counts.unread += 1;
    if (state.status === "in-progress") counts.inProgress += 1;
    if (state.favorite) counts.favorites += 1;
  }
  return counts;
}

/** Filter tale IDs in stable input order; duplicate and unsafe IDs are removed. */
export function filterTaleIdsByReadingState(
  taleIds: readonly string[],
  record: unknown,
  filter: TaleReadingFilter,
): string[] {
  const ids = uniqueTaleIds(taleIds);
  if (filter === "all") return ids;

  return ids.filter((id) => {
    const state = getTaleReadingState(record, id);
    return filter === "favorites"
      ? state.favorite
      : state.status === filter;
  });
}
