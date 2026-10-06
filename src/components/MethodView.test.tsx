// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { MethodView } from "./MethodView";

afterEach(cleanup);

describe("MethodView", () => {
  it("presents the method as an ordered editorial sequence with visible boundaries", () => {
    render(<MethodView />);

    const sequence = screen.getByRole("list", { name: "Editorial reading sequence" });
    const passes = within(sequence).getAllByRole("listitem");

    expect(passes).toHaveLength(4);
    expect(within(passes[0]!).getByRole("heading", { name: "Begin with an editorial register" })).toBeInTheDocument();
    expect(within(passes[2]!).getByText(/does not assert genealogy, geographic proximity/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot support historical or edition-specific precision/i)).toBeInTheDocument();
  });

  it("keeps every institutional source inspectable", () => {
    render(<MethodView />);

    expect(screen.getAllByRole("link")).toHaveLength(4);
    expect(screen.getByRole("link", { name: /Endless Stories/i })).toHaveAttribute("href", expect.stringContaining("chnmuseum.cn"));
    expect(screen.getByRole("link", { name: /The Printed Image in China/i })).toHaveAttribute("href", expect.stringContaining("metmuseum.org"));
  });
});
