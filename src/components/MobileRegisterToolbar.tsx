import { Map, TableProperties } from "lucide-react";

import type {
  RegisterCounts,
  RegisterStatusFilter,
  RegisterViewMode,
} from "./OperationsRail";
import { FilterToolbar } from "./FilterToolbar";

type MobileRegisterToolbarProps = {
  viewMode: RegisterViewMode;
  onViewModeChange: (mode: RegisterViewMode) => void;
  statusFilter: RegisterStatusFilter;
  onStatusFilterChange: (filter: RegisterStatusFilter) => void;
  counts: RegisterCounts;
};

export function MobileRegisterToolbar({
  viewMode,
  onViewModeChange,
  statusFilter,
  onStatusFilterChange,
  counts,
}: MobileRegisterToolbarProps) {
  return (
    <FilterToolbar className="mobile-register-toolbar" aria-label="Compact register controls">
      <div className="mobile-register-toolbar__views" role="group" aria-label="Register view">
        <button
          type="button"
          aria-pressed={viewMode === "map"}
          onClick={() => onViewModeChange("map")}
        >
          <Map aria-hidden="true" />
          Map
        </button>
        <button
          type="button"
          aria-pressed={viewMode === "table"}
          onClick={() => onViewModeChange("table")}
        >
          <TableProperties aria-hidden="true" />
          Table
        </button>
      </div>

      <label>
        <span>Reading state</span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.currentTarget.value as RegisterStatusFilter)}
        >
          <option value="all">All records · {counts.all}</option>
          <option value="read">Read · {counts.read}</option>
          <option value="unread">Unread · {counts.unread}</option>
          <option value="in-progress">In progress · {counts.inProgress}</option>
          <option value="favorites">Favourites · {counts.favorites}</option>
        </select>
      </label>
    </FilterToolbar>
  );
}
