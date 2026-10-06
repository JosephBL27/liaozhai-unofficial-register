/**
 * Typed, SSR-neutral persistence codecs for the Liaozhai reader.
 *
 * This module never reaches for `window`, `document`, Blob URLs, or download
 * anchors. Browser storage is passed in explicitly through `StorageLike`.
 */

import {
  deriveTaleReadingRecordFromLegacy,
  normalizeTaleReadingRecord,
  type TaleReadingRecord,
} from "./readingState";

export const LIAOZHAI_STORAGE_KEYS = {
  progress: "liaozhai.progress.v1",
  notes: "liaozhai.notes.v1",
  panes: "liaozhai.panes.v1",
} as const;

export type LiaozhaiStorageKey =
  (typeof LIAOZHAI_STORAGE_KEYS)[keyof typeof LIAOZHAI_STORAGE_KEYS];

export interface LiaozhaiProgress {
  currentRegisterId: string;
  readRegisterIds: string[];
  readTaleIds: string[];
  taleStates: TaleReadingRecord;
}

export interface LiaozhaiNote {
  id: string;
  taleId?: string;
  registerId?: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export type LiaozhaiPaneState = Record<string, number>;

export interface LiaozhaiNotesExport {
  readonly schema: typeof LIAOZHAI_STORAGE_KEYS.notes;
  readonly exportedAt: string;
  readonly notes: LiaozhaiNote[];
}

/** The subset of Web Storage needed by the persistence helpers. */
export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export type JsonGuard<T> = (value: unknown) => value is T;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validTimestamp(value: unknown): value is string {
  return typeof value === "string" && Number.isFinite(Date.parse(value));
}

function cleanOptionalId(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value.trim();
  return clean || undefined;
}

function uniqueIds(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  const ids = value
    .filter((entry): entry is string => typeof entry === "string")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return [...new Set(ids)];
}

export function createDefaultLiaozhaiProgress(): LiaozhaiProgress {
  return {
    currentRegisterId: "",
    readRegisterIds: [],
    readTaleIds: [],
    taleStates: Object.create(null) as TaleReadingRecord,
  };
}

/** Parse JSON without allowing malformed or schema-invalid data to escape. */
export function safeJsonParse<T>(
  serialized: string | null | undefined,
  fallback: T,
  guard?: JsonGuard<T>,
): T {
  if (typeof serialized !== "string") return fallback;

  try {
    const parsed: unknown = JSON.parse(serialized);
    return guard && !guard(parsed) ? fallback : (parsed as T);
  } catch {
    return fallback;
  }
}

export function normalizeLiaozhaiProgress(value: unknown): LiaozhaiProgress {
  if (!isRecord(value)) return createDefaultLiaozhaiProgress();

  const legacyReadTaleIds = uniqueIds(value.readTaleIds);
  const legacyStates = deriveTaleReadingRecordFromLegacy(legacyReadTaleIds);
  const storedStates = normalizeTaleReadingRecord(value.taleStates);
  const taleStates = Object.assign(
    Object.create(null) as TaleReadingRecord,
    legacyStates,
    storedStates,
  );
  const readTaleIds = Object.entries(taleStates)
    .filter(([, state]) => state.status === "read")
    .map(([id]) => id);

  return {
    currentRegisterId:
      typeof value.currentRegisterId === "string"
        ? value.currentRegisterId.trim()
        : "",
    readRegisterIds: uniqueIds(value.readRegisterIds),
    readTaleIds,
    taleStates,
  };
}

export function parseLiaozhaiProgress(
  serialized: string | null | undefined,
): LiaozhaiProgress {
  const parsed = safeJsonParse<unknown>(serialized, null);
  return normalizeLiaozhaiProgress(parsed);
}

export function serializeLiaozhaiProgress(value: LiaozhaiProgress): string {
  return JSON.stringify(normalizeLiaozhaiProgress(value));
}

export function normalizeLiaozhaiNote(value: unknown): LiaozhaiNote | null {
  if (!isRecord(value)) return null;

  const id = cleanOptionalId(value.id);
  const text = typeof value.text === "string" ? value.text.trim() : "";
  if (!id || !text || !validTimestamp(value.createdAt)) return null;

  const note: LiaozhaiNote = {
    id,
    text,
    createdAt: value.createdAt,
    updatedAt: validTimestamp(value.updatedAt) ? value.updatedAt : value.createdAt,
  };

  const taleId = cleanOptionalId(value.taleId);
  const registerId = cleanOptionalId(value.registerId);
  if (taleId) note.taleId = taleId;
  if (registerId) note.registerId = registerId;

  return note;
}

function compareNotes(left: LiaozhaiNote, right: LiaozhaiNote): number {
  const createdDelta = Date.parse(left.createdAt) - Date.parse(right.createdAt);
  return createdDelta || left.id.localeCompare(right.id);
}

/**
 * Merge notes by id without mutating either input. The most recently updated
 * note wins; an incoming note wins an exact timestamp tie.
 */
export function mergeLiaozhaiNotes(
  existing: readonly LiaozhaiNote[],
  incoming: readonly LiaozhaiNote[],
): LiaozhaiNote[] {
  const merged = new Map<string, LiaozhaiNote>();

  const mergeOne = (candidateValue: unknown, preferTie: boolean): void => {
    const candidate = normalizeLiaozhaiNote(candidateValue);
    if (!candidate) return;

    const current = merged.get(candidate.id);
    const candidateTime = Date.parse(candidate.updatedAt);
    const currentTime = current ? Date.parse(current.updatedAt) : Number.NEGATIVE_INFINITY;
    if (
      !current ||
      candidateTime > currentTime ||
      (preferTie && candidateTime === currentTime)
    ) {
      merged.set(candidate.id, candidate);
    }
  };

  existing.forEach((note) => mergeOne(note, false));
  incoming.forEach((note) => mergeOne(note, true));
  return [...merged.values()].sort(compareNotes);
}

function notePayload(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (isRecord(value) && Array.isArray(value.notes)) return value.notes;
  return [];
}

/** Accept a JSON string, an export envelope, or a bare notes array. */
export function importLiaozhaiNotes(payload: unknown): LiaozhaiNote[] {
  const parsed =
    typeof payload === "string"
      ? safeJsonParse<unknown>(payload, null)
      : payload;
  const normalized = notePayload(parsed)
    .map(normalizeLiaozhaiNote)
    .filter((note): note is LiaozhaiNote => note !== null);
  return mergeLiaozhaiNotes([], normalized);
}

export function parseLiaozhaiNotes(
  serialized: string | null | undefined,
): LiaozhaiNote[] {
  if (typeof serialized !== "string") return [];
  return importLiaozhaiNotes(serialized);
}

export function serializeLiaozhaiNotes(notes: readonly LiaozhaiNote[]): string {
  return JSON.stringify(mergeLiaozhaiNotes([], notes));
}

export function mergeLiaozhaiNoteImport(
  existing: readonly LiaozhaiNote[],
  payload: unknown,
): LiaozhaiNote[] {
  return mergeLiaozhaiNotes(existing, importLiaozhaiNotes(payload));
}

/** Return portable JSON; the caller supplies time so this helper stays pure. */
export function exportLiaozhaiNotes(
  notes: readonly LiaozhaiNote[],
  exportedAt: string,
): string {
  if (!validTimestamp(exportedAt)) {
    throw new TypeError("exportedAt must be a valid timestamp.");
  }

  const payload: LiaozhaiNotesExport = {
    schema: LIAOZHAI_STORAGE_KEYS.notes,
    exportedAt,
    notes: mergeLiaozhaiNotes([], notes),
  };
  return JSON.stringify(payload, null, 2);
}

export function normalizeLiaozhaiPaneState(value: unknown): LiaozhaiPaneState {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(
      (entry): entry is [string, number] => {
        const [key, size] = entry;
        return (
          key !== "__proto__" &&
          key !== "constructor" &&
          key !== "prototype" &&
          typeof size === "number" &&
          Number.isFinite(size) &&
          size >= 0
        );
      },
    ),
  );
}

export function parseLiaozhaiPaneState(
  serialized: string | null | undefined,
): LiaozhaiPaneState {
  const parsed = safeJsonParse<unknown>(serialized, null);
  return normalizeLiaozhaiPaneState(parsed);
}

export function serializeLiaozhaiPaneState(value: LiaozhaiPaneState): string {
  return JSON.stringify(normalizeLiaozhaiPaneState(value));
}

function readStorage<T>(
  storage: StorageLike,
  key: LiaozhaiStorageKey,
  parser: (serialized: string | null) => T,
  fallback: () => T,
): T {
  try {
    return parser(storage.getItem(key));
  } catch {
    return fallback();
  }
}

function writeStorage(
  storage: StorageLike,
  key: LiaozhaiStorageKey,
  serialized: string,
): boolean {
  try {
    storage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

export function loadLiaozhaiProgress(storage: StorageLike): LiaozhaiProgress {
  return readStorage(
    storage,
    LIAOZHAI_STORAGE_KEYS.progress,
    parseLiaozhaiProgress,
    createDefaultLiaozhaiProgress,
  );
}

export function saveLiaozhaiProgress(
  storage: StorageLike,
  progress: LiaozhaiProgress,
): boolean {
  return writeStorage(
    storage,
    LIAOZHAI_STORAGE_KEYS.progress,
    serializeLiaozhaiProgress(progress),
  );
}

export function loadLiaozhaiNotes(storage: StorageLike): LiaozhaiNote[] {
  return readStorage(storage, LIAOZHAI_STORAGE_KEYS.notes, parseLiaozhaiNotes, () => []);
}

export function saveLiaozhaiNotes(
  storage: StorageLike,
  notes: readonly LiaozhaiNote[],
): boolean {
  return writeStorage(
    storage,
    LIAOZHAI_STORAGE_KEYS.notes,
    serializeLiaozhaiNotes(notes),
  );
}

export function loadLiaozhaiPaneState(storage: StorageLike): LiaozhaiPaneState {
  return readStorage(storage, LIAOZHAI_STORAGE_KEYS.panes, parseLiaozhaiPaneState, () => ({}));
}

export function saveLiaozhaiPaneState(
  storage: StorageLike,
  panes: LiaozhaiPaneState,
): boolean {
  return writeStorage(
    storage,
    LIAOZHAI_STORAGE_KEYS.panes,
    serializeLiaozhaiPaneState(panes),
  );
}
