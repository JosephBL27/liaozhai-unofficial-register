import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { StoryWorldChart } from "../components/StoryWorldChart";
import { worldPlaces } from "./catalogFixtures";

const meta = {
  title: "Atlas/Story-world Chart",
  component: StoryWorldChart,
  tags: ["autodocs"],
  args: {
    places: worldPlaces,
    selectedId: "underworld-courts",
    onSelect: fn(),
  },
  decorators: [
    (Story) => <div className="storybook-stage storybook-stage--world"><Story /></div>,
  ],
} satisfies Meta<typeof StoryWorldChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SelectedOtherworldCourt: Story = {};
