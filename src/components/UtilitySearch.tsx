import { Command, Search } from "lucide-react";

type UtilitySearchProps = {
  onOpen: () => void;
};

export function UtilitySearch({ onOpen }: UtilitySearchProps) {
  return (
    <button
      className="search-control"
      type="button"
      aria-label="Search tales, figures, and motifs"
      onClick={onOpen}
    >
      <Search aria-hidden="true" />
      <span>Search tales, figures, motifs</span>
      <kbd><Command aria-hidden="true" /> K</kbd>
    </button>
  );
}
