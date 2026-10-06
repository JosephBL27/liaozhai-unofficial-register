import { describe, expect, it } from "vitest";

import {
  countTaleReadingStates,
  deriveTaleReadingRecordFromLegacy,
  filterTaleIdsByReadingState,
  getTaleReadingState,
  normalizeTaleReadingRecord,
  normalizeTaleReadingState,
  setTaleReadingPercent,
  setTaleReadingStatus,
  toggleTaleFavorite,
  type TaleReadingRecord,
} from "./readingState";

describe("tale reading-state normalization", () => {
  it("uses percentage as the canonical source of status", () => {
    expect(normalizeTaleReadingState(null)).toEqual({
      status: "unread",
      percent: 0,
      favorite: false,
    });
    expect(
      normalizeTaleReadingState({ status: "read", percent: 41, favorite: true }),
    ).toEqual({ status: "in-progress", percent: 41, favorite: true });
    expect(normalizeTaleReadingState({ status: "read" })).toEqual({
      status: "read",
      percent: 100,
      favorite: false,
    });
    expect(normalizeTaleReadingState({ status: "in-progress" })).toEqual({
      status: "in-progress",
      percent: 25,
      favorite: false,
    });
  });

  it("rounds and clamps finite percentages without coercing strings", () => {
    expect(normalizeTaleReadingState({ percent: -9 })).toMatchObject({
      status: "unread",
      percent: 0,
    });
    expect(normalizeTaleReadingState({ percent: 61.6 })).toMatchObject({
      status: "in-progress",
      percent: 62,
    });
    expect(normalizeTaleReadingState({ percent: 400 })).toMatchObject({
      status: "read",
      percent: 100,
    });
    expect(normalizeTaleReadingState({ percent: "80", favorite: 1 })).toEqual({
      status: "unread",
      percent: 0,
      favorite: false,
    });
    expect(normalizeTaleReadingState({ percent: Number.NaN })).toMatchObject({
      status: "unread",
      percent: 0,
    });
  });

  it("preserves arbitrary safe IDs while dropping malformed and unsafe entries", () => {
    const imported = JSON.parse(
      '{"obscure-tale":{"percent":17,"favorite":true},"future-id":{"status":"read"},"broken":null,"__proto__":{"polluted":true},"constructor":{"percent":100}}',
    ) as unknown;
    const normalized = normalizeTaleReadingRecord(imported);

    expect(Object.getPrototypeOf(normalized)).toBeNull();
    expect({ ...normalized }).toEqual({
      "obscure-tale": {
        status: "in-progress",
        percent: 17,
        favorite: true,
      },
      "future-id": { status: "read", percent: 100, favorite: false },
    });
    expect(Object.hasOwn(normalized, "__proto__")).toBe(false);
    expect(Object.hasOwn(normalized, "constructor")).toBe(false);
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });
});

describe("legacy migration and immutable updates", () => {
  it("derives completed states from sanitized legacy read IDs", () => {
    const migrated = deriveTaleReadingRecordFromLegacy([
      " yingning ",
      "yingning",
      "painted-skin",
      "",
      7,
      "__proto__",
    ]);

    expect(Object.getPrototypeOf(migrated)).toBeNull();
    expect({ ...migrated }).toEqual({
      yingning: { status: "read", percent: 100, favorite: false },
      "painted-skin": { status: "read", percent: 100, favorite: false },
    });
    expect(deriveTaleReadingRecordFromLegacy("yingning")).toEqual(
      Object.create(null),
    );
  });

  it("sets clamped percentages and leaves its input untouched", () => {
    const originalState = {
      status: "in-progress" as const,
      percent: 45,
      favorite: true,
    };
    const original: TaleReadingRecord = { yingning: originalState };

    const unread = setTaleReadingPercent(original, "yingning", -20);
    const partial = setTaleReadingPercent(original, "yingning", 78.8);
    const read = setTaleReadingPercent(original, "yingning", 120);

    expect(unread.yingning).toEqual({ status: "unread", percent: 0, favorite: true });
    expect(partial.yingning).toEqual({
      status: "in-progress",
      percent: 79,
      favorite: true,
    });
    expect(read.yingning).toEqual({ status: "read", percent: 100, favorite: true });
    expect(original).toEqual({ yingning: originalState });
    expect(original.yingning).toBe(originalState);
    expect(partial).not.toBe(original);
    expect(partial.yingning).not.toBe(originalState);
  });

  it("maps statuses to sensible percentages and retains partial progress", () => {
    const source: TaleReadingRecord = {
      partial: { status: "in-progress", percent: 63, favorite: false },
      finished: { status: "read", percent: 100, favorite: true },
    };

    expect(setTaleReadingStatus(source, "partial", "in-progress").partial.percent).toBe(63);
    expect(setTaleReadingStatus(source, "finished", "in-progress").finished).toEqual({
      status: "in-progress",
      percent: 25,
      favorite: true,
    });
    expect(setTaleReadingStatus(source, "partial", "read").partial).toEqual({
      status: "read",
      percent: 100,
      favorite: false,
    });
    expect(setTaleReadingStatus(source, "partial", "unread").partial).toEqual({
      status: "unread",
      percent: 0,
      favorite: false,
    });
    expect(source.partial.percent).toBe(63);
  });

  it("toggles favorites for existing and previously absent tales", () => {
    const original: TaleReadingRecord = {
      yingning: { status: "read", percent: 100, favorite: false },
    };
    const favorited = toggleTaleFavorite(original, "yingning");
    const newFavorite = toggleTaleFavorite(original, "new-tale");

    expect(favorited.yingning).toEqual({
      status: "read",
      percent: 100,
      favorite: true,
    });
    expect(newFavorite["new-tale"]).toEqual({
      status: "unread",
      percent: 0,
      favorite: true,
    });
    expect(original.yingning.favorite).toBe(false);
  });

  it("treats absent, malformed, and unsafe lookups as unread", () => {
    expect(getTaleReadingState({}, "missing")).toEqual({
      status: "unread",
      percent: 0,
      favorite: false,
    });
    expect(getTaleReadingState({ broken: null }, "broken")).toEqual({
      status: "unread",
      percent: 0,
      favorite: false,
    });
    expect(getTaleReadingState({}, "__proto__")).toEqual({
      status: "unread",
      percent: 0,
      favorite: false,
    });
  });
});

describe("catalog counts and filters", () => {
  const ids = ["read", "partial", "unread", "favorite", "unread"];
  const record: TaleReadingRecord = {
    read: { status: "read", percent: 100, favorite: false },
    partial: { status: "in-progress", percent: 55, favorite: true },
    favorite: { status: "unread", percent: 0, favorite: true },
    "outside-slice": { status: "read", percent: 100, favorite: true },
  };

  it("counts each requested tale once and treats missing states as unread", () => {
    expect(countTaleReadingStates(ids, record)).toEqual({
      all: 4,
      read: 1,
      unread: 2,
      inProgress: 1,
      favorites: 2,
    });
  });

  it("filters in stable order across every supported filter", () => {
    expect(filterTaleIdsByReadingState(ids, record, "all")).toEqual([
      "read",
      "partial",
      "unread",
      "favorite",
    ]);
    expect(filterTaleIdsByReadingState(ids, record, "read")).toEqual(["read"]);
    expect(filterTaleIdsByReadingState(ids, record, "unread")).toEqual([
      "unread",
      "favorite",
    ]);
    expect(filterTaleIdsByReadingState(ids, record, "in-progress")).toEqual([
      "partial",
    ]);
    expect(filterTaleIdsByReadingState(ids, record, "favorites")).toEqual([
      "partial",
      "favorite",
    ]);
  });
});
