// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { FooterLedger, type FooterLedgerProps } from "./FooterLedger";

afterEach(cleanup);

function renderLedger(overrides: Partial<FooterLedgerProps> = {}) {
  const props: FooterLedgerProps = {
    counts: { all: 30, read: 8, unread: 18, inProgress: 4, favorites: 5 },
    onExportNotes: vi.fn(),
    onOpenMethod: vi.fn(),
    onOpenSettings: vi.fn(),
    storageLabel: "Saved on this device",
    ...overrides,
  };
  render(<FooterLedger {...props} />);
  return props;
}

describe("FooterLedger", () => {
  it("renders semantic totals and an honest local-storage status", () => {
    renderLedger();

    const totals = screen.getByLabelText("Reading totals");
    const terms = within(totals).getAllByRole("term");
    const definitions = within(totals).getAllByRole("definition");

    expect(terms.map((term) => term.textContent)).toEqual([
      "Records",
      "Read",
      "In progress",
      "Unread",
      "Favourites",
    ]);
    expect(definitions.map((definition) => definition.textContent)).toEqual(["30", "8", "4", "18", "5"]);
    expect(screen.getByRole("status")).toHaveTextContent("Saved on this device");
  });

  it("keeps each utility wired to a real callback", async () => {
    const user = userEvent.setup();
    const props = renderLedger();

    await user.click(screen.getByRole("button", { name: "Export marginalia" }));
    await user.click(screen.getByRole("button", { name: "Open editorial method" }));
    await user.click(screen.getByRole("button", { name: "Open reader settings" }));

    expect(props.onExportNotes).toHaveBeenCalledOnce();
    expect(props.onOpenMethod).toHaveBeenCalledOnce();
    expect(props.onOpenSettings).toHaveBeenCalledOnce();
  });
});
