import { ArrowUpRight, Search } from "lucide-react";
import { useMemo, useState } from "react";

export type FigureRow = {
  id: string;
  name: string;
  aliases: string[];
  kind: string;
  role: string;
  recordIds: string[];
};

type PeopleRegisterProps = {
  figures: FigureRow[];
  onSelect: (id: string) => void;
};

export function PeopleRegister({ figures, onSelect }: PeopleRegisterProps) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return needle
      ? figures.filter((figure) => `${figure.name} ${figure.aliases.join(" ")} ${figure.kind} ${figure.role}`.toLocaleLowerCase().includes(needle))
      : figures;
  }, [figures, query]);

  return (
    <section className="workspace-view people-view" aria-labelledby="people-title">
      <header className="workspace-view-heading">
        <div><h1 id="people-title">Named figures and unstable identities</h1><p>Names vary across translations; roles here belong to this editorial route and remain linked back to representative records.</p></div>
        <label className="compact-search"><Search aria-hidden="true" /><span className="sr-only">Filter figures</span><input type="search" value={query} onChange={(event) => setQuery(event.currentTarget.value)} placeholder="Find a figure or role" /></label>
      </header>
      <ol className="figure-register">
        {visible.map((figure, index) => (
          <li key={figure.id}>
            <span>{String(index + 1).padStart(3, "0")}</span>
            <div><strong>{figure.name}</strong>{figure.aliases.length > 0 && <small>{figure.aliases.join(" · ")}</small>}</div>
            <i>{figure.kind}</i>
            <p>{figure.role}</p>
            <b>{figure.recordIds.length} {figure.recordIds.length === 1 ? "record" : "records"}</b>
            <button type="button" onClick={() => onSelect(figure.id)} aria-label={`Open figure: ${figure.name}`}><ArrowUpRight aria-hidden="true" /></button>
          </li>
        ))}
      </ol>
    </section>
  );
}
