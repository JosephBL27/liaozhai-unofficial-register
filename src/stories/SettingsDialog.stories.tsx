import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { SettingsDialog } from "../components/SettingsDialog";

const meta = {
  title: "Overlays/Reader Settings",
  component: SettingsDialog,
  tags: ["autodocs"],
  args: {
    readCount: 8,
    inProgressCount: 6,
    favoriteCount: 5,
    noteCount: 2,
    onClose: fn(),
    onExportNotes: fn(),
    onOpenMethod: fn(),
    onResetReading: fn(),
  },
  parameters: {
    docs: {
      description: {
        component: "The browser-local ledger, portability action, editorial-method route, and protected reset state in one native modal boundary.",
      },
    },
  },
} satisfies Meta<typeof SettingsDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LocalReaderLedger: Story = {};

export const ResetConfirmationFocusAndHover: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reset = await canvas.findByRole("button", { name: "Reset reading" });
    await userEvent.click(reset);
    const confirm = await canvas.findByRole("button", { name: "Confirm reset" });
    await userEvent.hover(confirm);
    confirm.focus();
    await expect(confirm).toHaveFocus();
    await expect(canvas.getByRole("button", { name: "Keep progress" })).toBeVisible();
  },
  parameters: {
    docs: {
      description: {
        story: "Opens the reversible confirmation state and leaves its destructive action hovered and keyboard-focused without executing the reset.",
      },
    },
  },
};
