import { describe, expect, it } from "vitest";

import {
  annularSectorPath,
  buildRadialSegments,
  isLabelArcFlipped,
  labelArcPath,
  normalizeAngle,
  polarPoint,
  segmentAngles,
  snapRotation,
  viewBoxCenter,
  viewBoxPolarPoint,
} from "./radial";

describe("viewBox radial geometry", () => {
  it("derives polar coordinates from an offset viewBox", () => {
    expect(viewBoxCenter("10 20 800 600")).toEqual({ x: 410, y: 320 });
    expect(viewBoxPolarPoint("10 20 800 600", 100, 0)).toEqual({
      x: 410,
      y: 220,
    });

    const east = polarPoint(410, 320, 100, 90);
    expect(east.x).toBeCloseTo(510);
    expect(east.y).toBeCloseTo(320);
  });
});

describe("segmentAngles", () => {
  const registers = Array.from({ length: 15 }, (_, index) => `register-${index}`);

  it("generates fifteen equal data-backed segments", () => {
    const segments = segmentAngles(registers);

    expect(segments).toHaveLength(15);
    expect(segments.every((segment) => segment.spanAngle === 24)).toBe(true);
    expect(segments[0]).toMatchObject({
      item: "register-0",
      index: 0,
      startAngle: 0,
      endAngle: 24,
      midAngle: 12,
    });
    expect(segments[14]).toMatchObject({
      item: "register-14",
      startAngle: 336,
      endAngle: 360,
      midAngle: 348,
    });
  });

  it("closes one full turn without gaps or overlaps", () => {
    const startOffset = -12;
    const segments = segmentAngles(registers, startOffset);

    for (let index = 1; index < segments.length; index += 1) {
      expect(segments[index - 1].endAngle).toBe(segments[index].startAngle);
    }
    expect(segments[0].startAngle).toBe(startOffset);
    expect(segments.at(-1)?.endAngle).toBe(startOffset + 360);
    expect(segments.reduce((sum, segment) => sum + segment.spanAngle, 0)).toBe(360);
  });
});

describe("buildRadialSegments", () => {
  it("preserves typed semantic fields while assigning contiguous intervals", () => {
    const segments = buildRadialSegments([
      { id: "register-a", label: "Fox Kinships", category: "register", selected: true },
      { id: "register-b", label: "Unquiet Dead", category: "register", selected: false },
    ] as const, -90);

    expect(segments).toEqual([
      {
        id: "register-a",
        label: "Fox Kinships",
        category: "register",
        selected: true,
        start: -90,
        end: 90,
      },
      {
        id: "register-b",
        label: "Unquiet Dead",
        category: "register",
        selected: false,
        start: 90,
        end: 270,
      },
    ]);
  });

  it("keeps selection optional for non-selectable segment models", () => {
    expect(buildRadialSegments([
      { id: "ornament", label: "Outer rule", category: "decoration" },
    ] as const)).toEqual([
      {
        id: "ornament",
        label: "Outer rule",
        category: "decoration",
        start: 0,
        end: 360,
      },
    ]);
  });
});

describe("SVG paths", () => {
  it("closes every annular segment and uses opposing arc sweeps", () => {
    const paths = segmentAngles(["a", "b", "c"]).map((segment) =>
      annularSectorPath(
        400,
        400,
        200,
        300,
        segment.startAngle,
        segment.endAngle,
      ),
    );

    expect(paths.every((path) => path.endsWith(" Z"))).toBe(true);
    expect(paths.every((path) => path.includes(" 0 0 1 "))).toBe(true);
    expect(paths.every((path) => path.includes(" 0 0 0 "))).toBe(true);
  });

  it("renders a complete annulus as four arcs rather than a collapsed arc", () => {
    const path = annularSectorPath(100, 100, 40, 80, 0, 360);
    expect(path.match(/\bA\b/g)).toHaveLength(4);
    expect(path.endsWith(" Z")).toBe(true);
  });

  it("reverses lower-half curved labels", () => {
    expect(isLabelArcFlipped(150, 180)).toBe(true);
    expect(isLabelArcFlipped(0, 30)).toBe(false);

    const lower = labelArcPath(100, 100, 70, 150, 180, { padding: 2 });
    const upper = labelArcPath(100, 100, 70, 0, 30, { padding: 2 });
    expect(lower).toContain(" 0 0 0 ");
    expect(upper).toContain(" 0 0 1 ");
  });
});

describe("angle wrapping and wheel snapping", () => {
  it("normalizes positive and negative turns", () => {
    expect(normalizeAngle(-1)).toBe(359);
    expect(normalizeAngle(361)).toBe(1);
    expect(normalizeAngle(-720)).toBe(0);
  });

  it("aligns each selected segment midpoint to the fixed pointer", () => {
    const count = 15;
    for (const index of [0, 1, 7, 14, 15, -1]) {
      const midpoint = index * (360 / count) + 360 / count / 2;
      const rotation = snapRotation(index, count);
      expect(normalizeAngle(midpoint + rotation)).toBeCloseTo(0);
    }

    const pointerAngle = 25;
    const index = 4;
    const midpoint = index * 24 + 12;
    expect(normalizeAngle(midpoint + snapRotation(index, count, pointerAngle))).toBe(
      pointerAngle,
    );
  });
});
