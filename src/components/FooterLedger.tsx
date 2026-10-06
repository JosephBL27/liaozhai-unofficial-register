import {
  BookCheck,
  BookOpen,
  CircleHelp,
  Download,
  HardDrive,
  PenLine,
  Settings2,
  Star,
} from "lucide-react";

import type { RegisterCounts } from "./OperationsRail";

export type FooterLedgerProps = {
  counts: RegisterCounts;
  onExportNotes: () => void;
  onOpenMethod: () => void;
  onOpenSettings: () => void;
  storageLabel: string;
};

const ledgerTotals: ReadonlyArray<{
  label: string;
  countKey: keyof RegisterCounts;
  className: string;
  Icon: typeof BookOpen;
}> = [
  { label: "Records", countKey: "all", className: "ledger-total--all", Icon: BookOpen },
  { label: "Read", countKey: "read", className: "ledger-total--read", Icon: BookCheck },
  { label: "In progress", countKey: "inProgress", className: "ledger-total--progress", Icon: PenLine },
  { label: "Unread", countKey: "unread", className: "ledger-total--unread", Icon: BookOpen },
  { label: "Favourites", countKey: "favorites", className: "ledger-total--favorites", Icon: Star },
];

export function FooterLedger({
  counts,
  onExportNotes,
  onOpenMethod,
  onOpenSettings,
  storageLabel,
}: FooterLedgerProps) {
  return (
    <footer className="footer-ledger" aria-label="Register ledger">
      <dl className="footer-ledger__totals" aria-label="Reading totals">
        {ledgerTotals.map(({ label, countKey, className, Icon }) => (
          <div key={countKey} className={`footer-ledger__total ${className}`}>
            <Icon aria-hidden="true" />
            <dt>{label}</dt>
            <dd>{counts[countKey]}</dd>
          </div>
        ))}
      </dl>

      <div className="footer-ledger__utilities" role="group" aria-label="Register utilities">
        <span className="footer-ledger__storage" role="status">
          <HardDrive aria-hidden="true" />
          <span>{storageLabel}</span>
        </span>
        <button type="button" aria-label="Export marginalia" onClick={onExportNotes}>
          <Download aria-hidden="true" />
          <span>Export notes</span>
        </button>
        <button type="button" aria-label="Open editorial method" onClick={onOpenMethod}>
          <CircleHelp aria-hidden="true" />
          <span>Method</span>
        </button>
        <button type="button" aria-label="Open reader settings" onClick={onOpenSettings}>
          <Settings2 aria-hidden="true" />
          <span>Settings</span>
        </button>
      </div>
    </footer>
  );
}
