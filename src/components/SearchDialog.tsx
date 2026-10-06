import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { DialogFrame } from "./DialogFrame";

export type SearchItem = {
  id: string;
  kind: "tale" | "figure" | "motif" | "term" | "register";
  title: string;
  subtitle: string;
  searchText: string;
};

type SearchDialogProps = {
  items: SearchItem[];
  onClose: () => void;
  onSelect: (item: SearchItem) => void;
};

export function SearchDialog({ items, onClose, onSelect }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return items.slice(0, 10);
    return items
      .filter((item) => `${item.title} ${item.subtitle} ${item.searchText}`.toLocaleLowerCase().includes(needle))
      .slice(0, 24);
  }, [items, query]);

  return (
    <DialogFrame
      className="search-dialog"
      title="Search the unofficial register"
      description="Search representative tales, figures, motifs, terms, and editorial registers."
      onClose={onClose}
    >
      <label className="dialog-search-field">
        <Search aria-hidden="true" />
        <span className="sr-only">Search query</span>
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
          placeholder="Try fox, examination, dream, debt…"
        />
        <kbd>Esc</kbd>
      </label>
      <div className="search-result-count" aria-live="polite">{results.length} visible records</div>
      <ul className="search-results">
        {results.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <button type="button" onClick={() => onSelect(item)}>
              <span>{item.kind}</span>
              <strong>{item.title}</strong>
              <small>{item.subtitle}</small>
              <ArrowUpRight aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {results.length === 0 && (
        <div className="dialog-empty">
          <strong>No record matches “{query}”.</strong>
          <p>Try a broader figure, institution, place, or motif.</p>
        </div>
      )}
    </DialogFrame>
  );
}
