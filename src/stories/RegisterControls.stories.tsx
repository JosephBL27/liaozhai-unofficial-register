import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { useState } from "react";
import { FooterLedger } from "../components/FooterLedger";
import {
  OperationsRail,
  type RegisterStatusFilter,
  type RegisterViewMode,
} from "../components/OperationsRail";
import type { WorkspaceId } from "../components/WorkspaceTabs";

const counts = { all: 30, read: 8, unread: 16, inProgress: 6, favorites: 5 };

function OperationsHarness() {
  const [workspace, setWorkspace] = useState<WorkspaceId>("register");
  const [view, setView] = useState<RegisterViewMode>("map");
  const [filter, setFilter] = useState<RegisterStatusFilter>("all");
  return (
    <div style={{ blockSize: "48rem", inlineSize: "12.4rem" }}>
      <OperationsRail
        activeWorkspace={workspace}
        onWorkspaceChange={setWorkspace}
        viewMode={view}
        onViewModeChange={setView}
        statusFilter={filter}
        onStatusFilterChange={setFilter}
        counts={counts}
        onOpenNotes={fn()}
      />
    </div>
  );
}

const operationsMeta = {
  title: "Register/Operations Rail",
  component: OperationsRail,
  tags: ["autodocs"],
  args: {
    activeWorkspace: "register",
    onWorkspaceChange: fn(),
    viewMode: "map",
    onViewModeChange: fn(),
    statusFilter: "all",
    onStatusFilterChange: fn(),
    counts,
    onOpenNotes: fn(),
  },
} satisfies Meta<typeof OperationsRail>;

export default operationsMeta;
type OperationsStory = StoryObj<typeof operationsMeta>;

export const InteractiveArchiveDesk: OperationsStory = {
  render: () => <OperationsHarness />,
};

export const FilteredFavourites: OperationsStory = {
  args: { statusFilter: "favorites", viewMode: "table" },
};

export const LocalLedger: OperationsStory = {
  render: () => (
    <div style={{ inlineSize: "90rem" }}>
      <FooterLedger
        counts={counts}
        storageLabel="Local to this browser"
        onExportNotes={fn()}
        onOpenMethod={fn()}
        onOpenSettings={fn()}
      />
    </div>
  ),
};
