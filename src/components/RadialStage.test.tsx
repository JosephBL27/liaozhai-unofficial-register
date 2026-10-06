// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { gsapFromTo, gsapTo } = vi.hoisted(() => ({
  gsapFromTo: vi.fn(),
  gsapTo: vi.fn(),
}));

vi.mock("gsap", () => ({
  default: {
    fromTo: gsapFromTo,
    to: gsapTo,
  },
}));

import { figureById, motifById, registers, taleById } from "../data";
import { RadialRing, RadialStage } from "./RadialStage";

const activeRegister = registers[0]!;
const activeTale = taleById.get(activeRegister.taleIds[0])!;
const activeFigures = activeTale.figures.map((id) => figureById.get(id)!).filter(Boolean);
const activeMotifs = activeTale.motifs.map((id) => motifById.get(id)!).filter(Boolean);

beforeEach(() => {
  gsapFromTo.mockClear();
  gsapTo.mockClear();
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  });
  Object.defineProperty(SVGElement.prototype, "getTotalLength", {
    configurable: true,
    value: () => 100,
  });
});

afterEach(cleanup);

function renderRadialStage() {
  const handlers = {
    onSelectFigure: vi.fn(),
    onSelectRegister: vi.fn(),
    onSelectTale: vi.fn(),
    onStep: vi.fn(),
  };
  const rendered = render(
    <RadialStage
      registers={registers}
      activeRegister={activeRegister}
      activeTale={activeTale}
      activeFigures={activeFigures}
      activeMotifs={activeMotifs}
      readRegisterIds={[activeRegister.id]}
      {...handlers}
    />,
  );
  return { ...rendered, handlers };
}

describe("RadialStage SVG architecture", () => {
  it("renders any ring from the shared typed segment contract", () => {
    const segments = [
      { id: "record-a", label: "Record A", start: 0, end: 120, category: "tale", selected: true },
      { id: "record-b", label: "Record B", start: 120, end: 360, category: "tale", selected: false },
    ] as const;
    const { container } = render(
      <svg>
        <RadialRing segments={segments}>
          {(segment) => <path data-id={segment.id} data-category={segment.category} d={`M ${segment.start} ${segment.end}`} />}
        </RadialRing>
      </svg>,
    );

    expect(container.querySelectorAll("path")).toHaveLength(2);
    expect(container.querySelector('[data-id="record-a"]')).toHaveAttribute("data-category", "tale");
  });

  it("keeps ornament, painted content, and transparent hit targets in distinct groups", () => {
    const { container } = renderRadialStage();
    const svg = container.querySelector<SVGSVGElement>(".radial-stage > svg")!;
    const zoomLayer = svg.querySelector<SVGGElement>(".radial-zoom-layer")!;
    const ornament = svg.querySelector<SVGGElement>(".radial-static-ornament")!;
    const visuals = zoomLayer.querySelector<SVGGElement>(":scope > .radial-visual-layer")!;
    const interactions = zoomLayer.querySelector<SVGGElement>(":scope > .radial-interaction-layer")!;

    expect(ornament).toHaveAttribute("data-radial-layer", "ornament");
    expect(visuals).toHaveAttribute("data-radial-layer", "visual");
    expect(visuals).toHaveAttribute("aria-hidden", "true");
    expect(interactions).toHaveAttribute("data-radial-layer", "interaction");
    expect(visuals.querySelectorAll(".radial-segment-face")).toHaveLength(registers.length);
    expect(visuals.querySelector(".radial-hit-target")).not.toBeInTheDocument();
    expect(interactions.querySelector(".radial-segment-face")).not.toBeInTheDocument();
    expect(interactions.querySelectorAll(".radial-hit-target")).toHaveLength(
      registers.length + activeRegister.taleIds.length,
    );
    expect(interactions.querySelector<SVGPathElement>(".radial-hit-target")).toHaveStyle({
      fill: "transparent",
      pointerEvents: "all",
    });
  });

  it("retains accessible SVG titles and snaps both wheel layers with GSAP", () => {
    const { container } = renderRadialStage();
    const svg = container.querySelector<SVGSVGElement>(".radial-stage > svg")!;
    const activeHit = container.querySelector<SVGGElement>(".radial-interaction-layer .radial-segment.is-active")!;

    expect(svg.querySelector("#radial-svg-title")).toHaveTextContent(
      "Fifteen-register Liaozhai reading wheel",
    );
    expect(svg.querySelector("#radial-svg-desc")).toHaveTextContent("active register aligns");
    expect(activeHit.querySelector("title")).toHaveTextContent(
      `Register 1: ${activeRegister.title}, completed`,
    );
    expect(gsapTo).toHaveBeenCalledOnce();
    expect(gsapTo.mock.calls[0]![0]).toHaveLength(2);
    expect(gsapTo.mock.calls[0]![1]).toMatchObject({
      rotation: expect.stringMatching(/_short$/),
      svgOrigin: "330 330",
      duration: 0.72,
    });
    expect(gsapFromTo).toHaveBeenCalledOnce();
  });
});

describe("RadialStage navigation parity", () => {
  it("mirrors register, active-register tale, and active-tale figure navigation in HTML", () => {
    const { handlers } = renderRadialStage();
    const semanticNavigation = screen.getByRole("navigation", { name: "Semantic radial navigation" });

    fireEvent.change(within(semanticNavigation).getByRole("combobox", { name: "Register" }), {
      target: { value: registers[1]!.id },
    });
    expect(handlers.onSelectRegister).toHaveBeenCalledWith(registers[1]!.id);

    const taleGroup = within(semanticNavigation).getByRole("group", {
      name: `Tales in Register ${activeRegister.index}: ${activeRegister.title}`,
    });
    const taleButtons = within(taleGroup).getAllByRole("button");
    expect(taleButtons).toHaveLength(activeRegister.taleIds.length);
    expect(taleButtons[0]).toHaveAttribute("aria-current", "page");
    fireEvent.click(taleButtons[1]!);
    expect(handlers.onSelectTale).toHaveBeenCalledWith(activeRegister.taleIds[1]);

    const figureGroup = within(semanticNavigation).getByRole("group", {
      name: `Figures in ${activeTale.title}`,
    });
    const figureButtons = within(figureGroup).getAllByRole("button");
    expect(figureButtons).toHaveLength(activeFigures.length);
    fireEvent.click(figureButtons[0]!);
    expect(handlers.onSelectFigure).toHaveBeenCalledWith(activeFigures[0]!.id);
  });

  it("keeps SVG keyboard selection, stage arrows, wheel stepping, and drag stepping intact", () => {
    const { container, handlers } = renderRadialStage();
    const stage = container.querySelector<HTMLDivElement>(".radial-stage")!;
    const activeHit = container.querySelector<SVGGElement>(".radial-interaction-layer .radial-segment.is-active")!;

    expect(activeHit).toHaveAttribute("tabindex", "0");
    expect(activeHit).toHaveAttribute("aria-current", "step");
    fireEvent.keyDown(activeHit, { key: "Enter" });
    expect(handlers.onSelectRegister).toHaveBeenCalledWith(activeRegister.id);

    fireEvent.keyDown(activeHit, { key: "ArrowRight" });
    expect(handlers.onStep).toHaveBeenCalledWith(1);

    fireEvent.wheel(stage, { deltaX: 0, deltaY: -120 });
    expect(handlers.onStep).toHaveBeenCalledWith(-1);

    Object.defineProperty(stage, "setPointerCapture", { value: vi.fn() });
    fireEvent.pointerDown(stage, { pointerId: 7, clientX: 200 });
    fireEvent.pointerUp(stage, { pointerId: 7, clientX: 150 });
    expect(handlers.onStep).toHaveBeenLastCalledWith(1);
  });
});
