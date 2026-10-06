import {
  BookOpenText,
  Menu,
  NotebookTabs,
} from "lucide-react";
import { BrandSeal } from "./BrandSeal";
import { UtilitySearch } from "./UtilitySearch";

type GlobalHeaderProps = {
  progressLabel: string;
  onOpenSearch: () => void;
  onOpenNotes: () => void;
  onOpenMenu: () => void;
};

export function GlobalHeader({
  progressLabel,
  onOpenSearch,
  onOpenNotes,
  onOpenMenu,
}: GlobalHeaderProps) {
  return (
    <header className="global-header">
      <a className="brand-lockup" href="#register" aria-label="Return to the Liaozhai register">
        <BrandSeal className="brand-seal" />
        <span className="brand-copy">
          <strong>Liaozhai</strong>
          <small>The Unofficial Register</small>
        </span>
        <span className="brand-hanzi" lang="zh-Hans">聊斋志异</span>
      </a>

      <nav className="header-actions" aria-label="Reading utilities">
        <UtilitySearch onOpen={onOpenSearch} />
        <button className="header-progress" type="button" onClick={onOpenNotes}>
          <BookOpenText aria-hidden="true" />
          <span>{progressLabel}</span>
        </button>
        <button className="header-icon-button" type="button" onClick={onOpenNotes}>
          <NotebookTabs aria-hidden="true" />
          <span className="sr-only">Open marginalia</span>
        </button>
        <button className="header-icon-button mobile-only" type="button" onClick={onOpenMenu}>
          <Menu aria-hidden="true" />
          <span className="sr-only">Open workspace menu</span>
        </button>
      </nav>
    </header>
  );
}
