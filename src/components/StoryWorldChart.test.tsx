// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { StoryWorldChart, type WorldPlaceView } from "./StoryWorldChart";

const places: WorldPlaceView[] = [
  {
    id: "house",
    name: "Scholar's house and garden",
    region: "domestic",
    x: 95,
    y: 155,
    kind: "household",
    note: "A working domestic locus.",
    recordCount: 2,
  },
  {
    id: "court",
    name: "Luocha country and aquatic courts",
    region: "otherworld",
    x: 940,
    y: 567,
    kind: "otherworld",
    note: "A working otherworld locus.",
    recordCount: 1,
  },
];

afterEach(cleanup);

describe("StoryWorldChart", () => {
  it("protects lower labels inside a visibly non-geographic plate", () => {
    render(<StoryWorldChart places={places} onSelect={vi.fn()} />);

    const chart = screen.getByRole("group", { name: /Editorial story-world chart/ });
    const lowerPlace = screen.getByRole("button", { name: /Luocha country and aquatic courts/i });
    const count = lowerPlace.querySelector<SVGTextElement>(".world-place-count");
    const translate = lowerPlace.getAttribute("transform")?.match(/translate\([^ ]+ ([^)]+)\)/);

    expect(chart).toHaveAttribute("viewBox", "0 0 1000 700");
    expect(screen.getByText(/do not claim geographic scale, route, or proximity/i)).toBeInTheDocument();
    expect(lowerPlace.querySelectorAll(".world-place-name tspan")).toHaveLength(2);
    expect(Number(translate?.[1]) + Number(count?.getAttribute("y"))).toBeLessThan(650);
  });

  it("filters loci and keeps keyboard selection available", () => {
    const onSelect = vi.fn();
    const { container } = render(<StoryWorldChart places={places} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole("button", { name: "household" }));
    expect(container.querySelector(".world-register-key strong")).toHaveTextContent("1");
    expect(screen.queryByRole("button", { name: /Luocha country/i })).not.toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("button", { name: /Scholar's house/i }), { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("house");
  });
});
