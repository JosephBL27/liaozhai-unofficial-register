import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { useState } from "react";
import { TalesLedger, type TaleLedgerRow } from "../components/TalesLedger";
import type { ReadingFilter } from "../lib/readingState";
import { taleRows } from "./catalogFixtures";

function TalesHarness({ initialFilter = "all" }: { initialFilter?: ReadingFilter }) {
  const [rows, setRows] = useState<TaleLedgerRow[]>(taleRows);
  const [filter, setFilter] = useState<ReadingFilter>(initialFilter);

  return (
    <div className="storybook-stage">
      <TalesLedger
        rows={rows}
        statusFilter={filter}
        onStatusFilterChange={setFilter}
        onToggleFavorite={(id) => setRows((current) => current.map((row) => (
          row.id === id ? { ...row, isFavorite: !row.isFavorite } : row
        )))}
        onSelect={fn()}
      />
    </div>
  );
}

const meta = {
  title: "Register/Representative Tale Ledger",
  component: TalesLedger,
  tags: ["autodocs"],
  args: {
    rows: taleRows,
    statusFilter: "all",
    onStatusFilterChange: fn(),
    onToggleFavorite: fn(),
    onSelect: fn(),
  },
  parameters: {
    docs: {
      description: {
        component: "The Table view and Tales workspace share this ruled ledger, its five canonical reading filters, and the same percentage-driven row state.",
      },
    },
  },
} satisfies Meta<typeof TalesLedger>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MixedReadingStates: Story = {
  render: () => <TalesHarness />,
};

export const FavouriteFilter: Story = {
  render: () => <TalesHarness initialFilter="favorites" />,
};

export const FavouriteFocusAndHover: Story = {
  render: () => <TalesHarness />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const favourite = await canvas.findByRole("button", {
      name: "Remove Yingning from favourites",
    });
    await userEvent.hover(favourite);
    favourite.focus();
    await expect(favourite).toHaveFocus();
    await expect(favourite).toHaveAttribute("aria-pressed", "true");
  },
  parameters: {
    docs: {
      description: {
        story: "Leaves the first favourite action in its real hover and keyboard-focus states so the Focus Gold treatment and non-colour pressed semantics remain inspectable.",
      },
    },
  },
};
