import { useId, type ComponentType } from "react";
import {
  BookCheck,
  BookOpen,
  BookOpenText,
  CircleHelp,
  Map,
  Network,
  NotebookTabs,
  PenLine,
  ScrollText,
  Star,
  TableProperties,
  Tags,
  UsersRound,
  type LucideProps,
} from "lucide-react";

import type { WorkspaceId } from "./WorkspaceTabs";
import { SideNavigation } from "./SideNavigation";
import { ZoomControl } from "./ZoomControl";

export type RegisterViewMode = "map" | "table";

export type RegisterStatusFilter =
  | "all"
  | "read"
  | "unread"
  | "in-progress"
  | "favorites";

export type RegisterCounts = {
  all: number;
  read: number;
  unread: number;
  inProgress: number;
  favorites: number;
};

export type OperationsRailProps = {
  activeWorkspace: WorkspaceId;
  onWorkspaceChange: (workspace: WorkspaceId) => void;
  viewMode: RegisterViewMode;
  onViewModeChange: (mode: RegisterViewMode) => void;
  statusFilter: RegisterStatusFilter;
  onStatusFilterChange: (filter: RegisterStatusFilter) => void;
  counts: RegisterCounts;
  onOpenNotes: () => void;
  radialZoom?: number;
  onRadialZoomChange?: (zoom: number) => void;
};

type RailIcon = ComponentType<LucideProps>;

const workspaceItems: ReadonlyArray<{
  id: WorkspaceId;
  label: string;
  Icon: RailIcon;
}> = [
  { id: "register", label: "Register", Icon: ScrollText },
  { id: "tales", label: "Tales", Icon: BookOpenText },
  { id: "relations", label: "Relations", Icon: Network },
  { id: "world", label: "Story world", Icon: Map },
  { id: "people", label: "Figures", Icon: UsersRound },
  { id: "lexicon", label: "Lexicon", Icon: Tags },
  { id: "method", label: "Method", Icon: CircleHelp },
];

const viewItems: ReadonlyArray<{
  id: RegisterViewMode;
  label: string;
  Icon: RailIcon;
}> = [
  { id: "map", label: "Map", Icon: Map },
  { id: "table", label: "Table", Icon: TableProperties },
];

const statusItems: ReadonlyArray<{
  id: RegisterStatusFilter;
  label: string;
  countKey: keyof RegisterCounts;
  Icon: RailIcon;
}> = [
  { id: "all", label: "All records", countKey: "all", Icon: BookOpenText },
  { id: "read", label: "Read", countKey: "read", Icon: BookCheck },
  { id: "unread", label: "Unread", countKey: "unread", Icon: BookOpen },
  { id: "in-progress", label: "In progress", countKey: "inProgress", Icon: PenLine },
  { id: "favorites", label: "Favourites", countKey: "favorites", Icon: Star },
];

export function OperationsRail({
  activeWorkspace,
  onWorkspaceChange,
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  counts,
  onOpenNotes,
  radialZoom,
  onRadialZoomChange,
}: OperationsRailProps) {
  const viewHeadingId = useId();
  const statusHeadingId = useId();

  return (
    <aside className="operations-rail" aria-label="Register operations">
      <header className="operations-rail__header">
        <strong>Reading rooms</strong>
        <small>Seven linked registers</small>
      </header>

      <SideNavigation className="operations-rail__workspaces" aria-label="Register workspaces">
        {workspaceItems.map(({ id, label, Icon }) => {
          const active = activeWorkspace === id;
          return (
            <button
              key={id}
              type="button"
              className={active ? "is-active" : undefined}
              aria-current={active ? "page" : undefined}
              onClick={() => onWorkspaceChange(id)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          );
        })}
      </SideNavigation>

      <section className="operations-rail__section" aria-labelledby={viewHeadingId}>
        <h2 id={viewHeadingId}>Register view</h2>
        <div className="operations-rail__view-switch" role="group" aria-label="Register view">
          {viewItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              className={viewMode === id ? "is-active" : undefined}
              aria-pressed={viewMode === id}
              onClick={() => onViewModeChange(id)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      {radialZoom !== undefined && onRadialZoomChange && activeWorkspace === "register" && viewMode === "map" && (
        <section className="operations-rail__section operations-rail__zoom" aria-label="Instrument scale">
          <h2>Instrument scale</h2>
          <ZoomControl value={radialZoom} onChange={onRadialZoomChange} />
        </section>
      )}

      <section className="operations-rail__section" aria-labelledby={statusHeadingId}>
        <h2 id={statusHeadingId}>Reading state</h2>
        <div className="operations-rail__filters">
          {statusItems.map(({ id, label, countKey, Icon }) => (
            <button
              key={id}
              type="button"
              className={statusFilter === id ? "is-active" : undefined}
              aria-label={`${label}: ${counts[countKey]}`}
              aria-pressed={statusFilter === id}
              onClick={() => onStatusFilterChange(id)}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
              <span className="operations-rail__count">{counts[countKey]}</span>
            </button>
          ))}
        </div>
      </section>

      <button className="operations-rail__notes" type="button" onClick={onOpenNotes}>
        <NotebookTabs aria-hidden="true" />
        <span>
          <strong>Marginalia</strong>
          <small>Private local notes</small>
        </span>
      </button>
    </aside>
  );
}
