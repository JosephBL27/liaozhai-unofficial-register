import { describe, expect, it } from "vitest";

import {
  LIAOZHAI_STORAGE_KEYS,
  exportLiaozhaiNotes,
  importLiaozhaiNotes,
  loadLiaozhaiProgress,
  mergeLiaozhaiNotes,
  parseLiaozhaiPaneState,
  parseLiaozhaiProgress,
  safeJsonParse,
  saveLiaozhaiProgress,
  type LiaozhaiNote,
  type StorageLike,
} from "./storage";

const older: LiaozhaiNote = {
  id: "note-1",
  taleId: "yingning",
  text: "Older reading",
  createdAt: "2026-08-01T10:00:00.000Z",
  updatedAt: "2026-08-01T10:00:00.000Z",
};

const newer: LiaozhaiNote = {
  ...older,
  text: "Revised reading",
  updatedAt: "2026-08-02T10:00:00.000Z",
};

describe("Liaozhai storage codecs", () => {
  it("uses the versioned namespace contract", () => {
    expect(LIAOZHAI_STORAGE_KEYS).toEqual({
      progress: "liaozhai.progress.v1",
      notes: "liaozhai.notes.v1",
      panes: "liaozhai.panes.v1",
    });
  });

  it("falls back safely for malformed or schema-invalid JSON", () => {
    const fallback = { safe: true };
    expect(safeJsonParse("{not-json", fallback)).toBe(fallback);
    expect(
      safeJsonParse('{"safe":false}', fallback, (value): value is typeof fallback =>
        typeof value === "object" && value !== null && (value as { safe?: unknown }).safe === true,
      ),
    ).toBe(fallback);

    expect(parseLiaozhaiProgress("{broken")).toEqual({
      currentRegisterId: "",
      readRegisterIds: [],
      readTaleIds: [],
      taleStates: {},
    });
  });

  it("sanitizes progress and pane data independently", () => {
    expect(
      parseLiaozhaiProgress(
        JSON.stringify({
          currentRegisterId: " fox-kinships ",
          readRegisterIds: ["fox-kinships", "fox-kinships", 9],
          readTaleIds: ["yingning", null],
        }),
      ),
    ).toEqual({
      currentRegisterId: "fox-kinships",
      readRegisterIds: ["fox-kinships"],
      readTaleIds: ["yingning"],
      taleStates: {
        yingning: { status: "read", percent: 100, favorite: false },
      },
    });

    expect(
      parseLiaozhaiPaneState(
        JSON.stringify({ rail: 320, dossier: 0, broken: -4, infinite: null }),
      ),
    ).toEqual({ rail: 320, dossier: 0 });
  });

  it("survives storage access failures without touching global browser state", () => {
    const unavailable: StorageLike = {
      getItem() {
        throw new DOMException("blocked", "SecurityError");
      },
      setItem() {
        throw new DOMException("full", "QuotaExceededError");
      },
    };

    expect(loadLiaozhaiProgress(unavailable)).toEqual({
      currentRegisterId: "",
      readRegisterIds: [],
      readTaleIds: [],
      taleStates: {},
    });
    expect(
      saveLiaozhaiProgress(unavailable, {
        currentRegisterId: "fox-kinships",
        readRegisterIds: [],
        readTaleIds: [],
        taleStates: {},
      }),
    ).toBe(false);
  });

  it("migrates legacy read ids and keeps structured tale state canonical", () => {
    const parsed = parseLiaozhaiProgress(JSON.stringify({
      currentRegisterId: "fox-kinships",
      readTaleIds: ["yingning", "legacy-read"],
      taleStates: {
        yingning: { percent: 62, favorite: true },
        favorite: { percent: 0, favorite: true },
      },
    }));

    expect(parsed.readTaleIds).toEqual(["legacy-read"]);
    expect(parsed.taleStates).toEqual({
      yingning: { status: "in-progress", percent: 62, favorite: true },
      "legacy-read": { status: "read", percent: 100, favorite: false },
      favorite: { status: "unread", percent: 0, favorite: true },
    });
  });
});

describe("note import, export, and merge", () => {
  it("merges by id using the newest update without mutating inputs", () => {
    const existing = [older];
    const incoming = [newer, {
      id: "note-2",
      registerId: "unquiet-dead",
      text: "A second note",
      createdAt: "2026-08-03T10:00:00.000Z",
      updatedAt: "2026-08-03T10:00:00.000Z",
    }];

    const merged = mergeLiaozhaiNotes(existing, incoming);

    expect(merged).toHaveLength(2);
    expect(merged[0].text).toBe("Revised reading");
    expect(existing).toEqual([older]);
    expect(incoming[0]).toBe(newer);
  });

  it("round-trips a portable export and drops invalid imported notes", () => {
    const exportedAt = "2026-08-06T12:00:00.000Z";
    const exported = exportLiaozhaiNotes([newer], exportedAt);
    const envelope = JSON.parse(exported) as Record<string, unknown>;

    expect(envelope.schema).toBe("liaozhai.notes.v1");
    expect(envelope.exportedAt).toBe(exportedAt);
    expect(importLiaozhaiNotes(exported)).toEqual([newer]);
    expect(
      importLiaozhaiNotes(
        JSON.stringify({
          notes: [newer, { id: "bad", text: "", createdAt: "not-a-date" }],
        }),
      ),
    ).toEqual([newer]);
  });
});
