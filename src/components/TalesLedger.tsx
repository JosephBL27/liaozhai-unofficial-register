import { ArrowUpRight, Heart, Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { ReadingFilter, TaleReadingStatus } from "../lib/readingState";

export type TaleLedgerRow = {
  id: string;
  title: string;
  variantTitle?: string;
  registerIndex: number;
  registerTitle: string;
  form: string;
  locus: string;
  socialPressure: string;
  isRead: boolean;
  status: TaleReadingStatus;
  percent: number;
  isFavorite: boolean;
};

type TalesLedgerProps = {
  rows: TaleLedgerRow[];
  onSelect: (id: string) => void;
  statusFilter?: ReadingFilter;
  onStatusFilterChange?: (filter: ReadingFilter) => void;
  onToggleFavorite?: (id: string) => void;
};

export function TalesLedger({ rows, onSelect, statusFilter, onStatusFilterChange, onToggleFavorite }: TalesLedgerProps) {
  const [query, setQuery] = useState("");
  const [localShow, setLocalShow] = useState<ReadingFilter>("all");
  const show = statusFilter ?? localShow;
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return rows.filter((row) => {
      const statusMatch = show === "all" ||
        (show === "favorites" ? row.isFavorite : row.status === show);
      const textMatch = !needle || `${row.title} ${row.variantTitle ?? ""} ${row.registerTitle} ${row.form} ${row.locus} ${row.socialPressure}`.toLocaleLowerCase().includes(needle);
      return statusMatch && textMatch;
    });
  }, [query, rows, show]);

  return (
    <section className="workspace-view tales-view" aria-labelledby="tales-title">
      <header className="workspace-view-heading">
        <div>
          <h1 id="tales-title">Representative tale ledger</h1>
          <p>Thirty working entries make the interface testable. They are a study route, not a complete index or a claim about edition order.</p>
        </div>
        <strong>{visible.length} / {rows.length}</strong>
      </header>
      <div className="ledger-toolbar">
        <label><Search aria-hidden="true" /><span className="sr-only">Filter tales</span><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Filter by title, form, pressure, locus…" /></label>
        <div role="group" aria-label="Reading status filter">
          {(["all", "unread", "in-progress", "read", "favorites"] as const).map((status) => (
            <button
              key={status}
              type="button"
              aria-pressed={show === status}
              onClick={() => {
                setLocalShow(status);
                onStatusFilterChange?.(status);
              }}
            >
              {status === "in-progress" ? "in progress" : status === "favorites" ? "favourites" : status}
            </button>
          ))}
        </div>
      </div>
      <div className="tale-table-wrap">
        <table className="tale-table">
          <thead><tr><th>Register</th><th>Record</th><th>Strange form</th><th>Ordinary pressure</th><th>Locus</th><th>Reading</th><th><span className="sr-only">Actions</span></th></tr></thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} data-read={row.isRead ? "true" : "false"} data-status={row.status}>
                <td><span>{String(row.registerIndex).padStart(2, "0")}</span>{row.registerTitle}</td>
                <td><strong>{row.title}</strong>{row.variantTitle && <small>{row.variantTitle}</small>}</td>
                <td>{row.form}</td>
                <td>{row.socialPressure}</td>
                <td>{row.locus}</td>
                <td className="tale-reading-cell"><span>{row.percent}%</span><i aria-hidden="true"><b style={{ inlineSize: `${row.percent}%` }} /></i><small>{row.status.replace("-", " ")}</small></td>
                <td className="tale-row-actions">
                  {onToggleFavorite && (
                    <button type="button" aria-pressed={row.isFavorite} onClick={() => onToggleFavorite(row.id)} aria-label={`${row.isFavorite ? "Remove" : "Add"} ${row.title} ${row.isFavorite ? "from" : "to"} favourites`}>
                      <Heart aria-hidden="true" fill={row.isFavorite ? "currentColor" : "none"} />
                    </button>
                  )}
                  <button type="button" onClick={() => onSelect(row.id)} aria-label={`Open ${row.title}`}><ArrowUpRight aria-hidden="true" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {visible.length === 0 && <div className="workspace-empty"><strong>No tale matches this register.</strong><p>Clear a filter or search for a wider social field.</p></div>}
    </section>
  );
}
