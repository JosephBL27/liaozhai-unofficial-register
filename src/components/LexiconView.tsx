import { Search } from "lucide-react";
import { useMemo, useState } from "react";

export type LexiconRow = {
  id: string;
  term: string;
  category: string;
  gloss: string;
  note: string;
};

type LexiconViewProps = {
  entries: LexiconRow[];
  initialQuery?: string;
};

export function LexiconView({ entries, initialQuery = "" }: LexiconViewProps) {
  const [query, setQuery] = useState(initialQuery);
  const categories = useMemo(() => ["all", ...Array.from(new Set(entries.map((entry) => entry.category)))], [entries]);
  const [category, setCategory] = useState("all");
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return entries.filter((entry) => (category === "all" || entry.category === category) && (!needle || `${entry.term} ${entry.gloss} ${entry.note}`.toLocaleLowerCase().includes(needle)));
  }, [category, entries, query]);

  return (
    <section className="workspace-view lexicon-view" aria-labelledby="lexicon-title">
      <header className="workspace-view-heading">
        <div><h1 id="lexicon-title">Terms that carry a world</h1><p>Compact working glosses support reading; they are not substitutes for a translation's notes or a historical dictionary.</p></div>
        <label className="compact-search"><Search aria-hidden="true" /><span className="sr-only">Filter terms</span><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Filter terms" /></label>
      </header>
      <div className="lexicon-categories" role="group" aria-label="Lexicon category filter">
        {categories.map((item) => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
      </div>
      <dl className="lexicon-ledger">
        {visible.map((entry) => (
          <div key={entry.id}>
            <dt><span>{entry.category}</span><strong>{entry.term}</strong></dt>
            <dd><p>{entry.gloss}</p><small>{entry.note}</small></dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
