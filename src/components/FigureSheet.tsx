import { BookOpenText, Network, UserRoundSearch } from "lucide-react";
import type { Figure } from "../types";
import { DialogFrame } from "./DialogFrame";

type FigureSheetProps = {
  figure: Figure;
  taleTitles: Array<{ id: string; title: string }>;
  onClose: () => void;
  onOpenTale: (taleId: string) => void;
  onOpenRelations: () => void;
};

export function FigureSheet({
  figure,
  taleTitles,
  onClose,
  onOpenTale,
  onOpenRelations,
}: FigureSheetProps) {
  return (
    <DialogFrame
      className="figure-dialog"
      title={figure.name}
      description={`${figure.kind} · ${figure.role}`}
      onClose={onClose}
    >
      <div className="figure-sheet-mark" aria-hidden="true">
        <span>{figure.name.slice(0, 1)}</span>
        <UserRoundSearch />
      </div>
      <article className="figure-sheet-reading">
        <span>Editorial figure slip</span>
        <h2>{figure.role}</h2>
        <p>{figure.summary}</p>
        <small>Names and title labels vary across translations. This role description belongs to the companion's representative route.</small>
      </article>
      <section className="figure-appearances" aria-labelledby="figure-appearances-title">
        <h2 id="figure-appearances-title">Linked records</h2>
        <ul>
          {taleTitles.map((tale) => (
            <li key={tale.id}>
              <button type="button" onClick={() => onOpenTale(tale.id)}>
                <BookOpenText aria-hidden="true" />
                <span>{tale.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <button className="seal-action figure-relation-action" type="button" onClick={onOpenRelations}>
        <Network aria-hidden="true" /> Trace this figure in the relation register
      </button>
    </DialogFrame>
  );
}
