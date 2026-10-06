import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SearchDialog } from "../components/SearchDialog";
import { searchItems } from "./catalogFixtures";

const meta = {
  title: "Overlays/Search",
  component: SearchDialog,
  tags: ["autodocs"],
  args: {
    items: searchItems,
    onClose: fn(),
    onSelect: fn(),
  },
} satisfies Meta<typeof SearchDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NoResults: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const searchbox = await canvas.findByRole("searchbox");
    await userEvent.type(searchbox, "quartz aeroplane");
    await expect(canvas.getByText(/No record matches/)).toBeInTheDocument();
  },
};
