import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { RelationshipGraph } from "../components/RelationshipGraph";
import { relationEdgeViews, relationNodes } from "./catalogFixtures";

const relationsMeta = {
  title: "Atlas/Relationship Register",
  component: RelationshipGraph,
  tags: ["autodocs"],
  args: {
    nodes: relationNodes,
    edges: relationEdgeViews,
    selectedId: "yingning",
    onSelect: fn(),
  },
  decorators: [
    (Story) => <div className="storybook-stage storybook-stage--graph"><Story /></div>,
  ],
} satisfies Meta<typeof RelationshipGraph>;

export default relationsMeta;
type RelationsStory = StoryObj<typeof relationsMeta>;

export const RelationGraph: RelationsStory = {};
