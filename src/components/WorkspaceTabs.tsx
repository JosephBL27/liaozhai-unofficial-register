import {
  BookOpenText,
  CircleHelp,
  Map,
  Network,
  ScrollText,
  Tags,
  UsersRound,
} from "lucide-react";

export type WorkspaceId =
  | "register"
  | "tales"
  | "relations"
  | "world"
  | "people"
  | "lexicon"
  | "method";

type WorkspaceTabsProps = {
  active: WorkspaceId;
  onChange: (workspace: WorkspaceId) => void;
  compact?: boolean;
  open?: boolean;
};

const items: Array<{
  id: WorkspaceId;
  label: string;
  Icon: typeof BookOpenText;
}> = [
  { id: "register", label: "Register", Icon: ScrollText },
  { id: "tales", label: "Tales", Icon: BookOpenText },
  { id: "relations", label: "Relations", Icon: Network },
  { id: "world", label: "Story world", Icon: Map },
  { id: "people", label: "Figures", Icon: UsersRound },
  { id: "lexicon", label: "Lexicon", Icon: Tags },
  { id: "method", label: "Method", Icon: CircleHelp },
];

export function WorkspaceTabs({ active, onChange, compact = false, open = false }: WorkspaceTabsProps) {
  const className = ["workspace-tabs", compact && "is-compact", open && "is-open"].filter(Boolean).join(" ");
  return (
    <nav className={className} aria-label="Reading workspaces">
      {items.map(({ id, label, Icon }) => (
        <button
          key={id}
          type="button"
          className={active === id ? "is-active" : undefined}
          aria-current={active === id ? "page" : undefined}
          onClick={() => onChange(id)}
        >
          <Icon aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
