// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { OperationsRail, type OperationsRailProps } from "./OperationsRail";

afterEach(cleanup);

const counts = {
  all: 30,
  read: 8,
  unread: 18,
  inProgress: 4,
  favorites: 5,
};

function renderRail(overrides: Partial<OperationsRailProps> = {}) {
  const props: OperationsRailProps = {
    activeWorkspace: "register",
    onWorkspaceChange: vi.fn(),
    viewMode: "map",
    onViewModeChange: vi.fn(),
    statusFilter: "all",
    onStatusFilterChange: vi.fn(),
    counts,
    onOpenNotes: vi.fn(),
    ...overrides,
  };
  render(<OperationsRail {...props} />);
  return props;
}

describe("OperationsRail", () => {
  it("exposes only the seven real workspaces and identifies the current one", () => {
    renderRail({ activeWorkspace: "relations" });

    const navigation = screen.getByRole("navigation", { name: "Register workspaces" });
    expect(navigation.querySelectorAll("button")).toHaveLength(7);
    expect(screen.getByRole("button", { name: "Relations" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("button", { name: "Register" })).not.toHaveAttribute("aria-current");
  });

  it("reports and changes view and reading filters as pressed controls", async () => {
    const user = userEvent.setup();
    const props = renderRail();

    expect(screen.getByRole("button", { name: "Map" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "Table" })).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByRole("button", { name: "All records: 30" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("button", { name: "Table" }));
    await user.click(screen.getByRole("button", { name: "In progress: 4" }));

    expect(props.onViewModeChange).toHaveBeenCalledWith("table");
    expect(props.onStatusFilterChange).toHaveBeenCalledWith("in-progress");
  });

  it("routes workspace and private-note actions through explicit callbacks", async () => {
    const user = userEvent.setup();
    const props = renderRail();

    await user.click(screen.getByRole("button", { name: "Story world" }));
    await user.click(screen.getByRole("button", { name: /Marginalia/ }));

    expect(props.onWorkspaceChange).toHaveBeenCalledWith("world");
    expect(props.onOpenNotes).toHaveBeenCalledOnce();
  });
});
