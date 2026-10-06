import { ArrowLeft, ArrowRight, MapPin, Network, Tags, UsersRound, Waypoints } from "lucide-react";
import { DialogFrame } from "./DialogFrame";
import type { DossierViewModel } from "./ReadingDossier";

type TaleFocusSheetProps = {
  dossier: DossierViewModel;
  adjacentTales: Array<{ id: string; title: string }>;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onOpenAdjacent: (taleId: string) => void;
  onOpenRelations: () => void;
  onOpenWorld: () => void;
};

export function TaleFocusSheet({
  dossier,
  adjacentTales,
  onClose,
  onPrevious,
  onNext,
  onOpenAdjacent,
  onOpenRelations,
  onOpenWorld,
}: TaleFocusSheetProps) {
  return (
    <DialogFrame
      className="tale-focus-dialog"
      title={dossier.title}
      description={`A representative record in ${dossier.registerTitle}; English titles vary by edition.`}
      onClose={onClose}
    >
      <div className="focus-register-line">
        <span>{String(dossier.registerIndex).padStart(2, "0")}</span>
        <strong>{dossier.form}</strong>
        <i>{dossier.locus}</i>
      </div>
      <article className="focus-reading">
        <section>
          <h2>What happens</h2>
          <p>{dossier.summary}</p>
        </section>
        <section>
          <h2>The hinge</h2>
          <p>{dossier.disclosure}</p>
        </section>
        <section className="focus-social-pressure">
          <h2>The ordinary rule under pressure</h2>
          <p>{dossier.socialPressure}</p>
        </section>
        <section>
          <h2>Questions to carry back to the text</h2>
          <ol>{dossier.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol>
        </section>
      </article>
      <aside className="focus-crosslinks" aria-label="Cross-linked reading paths">
        <button type="button" onClick={onOpenRelations}><Network aria-hidden="true" /><span>Trace relations</span></button>
        <button type="button" onClick={onOpenWorld}><MapPin aria-hidden="true" /><span>Open story world</span></button>
        <div><UsersRound aria-hidden="true" /><span>{dossier.figures.length} figures</span></div>
        <div><Tags aria-hidden="true" /><span>{dossier.motifs.length} motifs</span></div>
      </aside>
      <section className="focus-adjacent" aria-labelledby="focus-adjacent-title">
        <header>
          <Waypoints aria-hidden="true" />
          <div><span>Declared pathways</span><h2 id="focus-adjacent-title">Read beside this record</h2></div>
        </header>
        <div>
          {adjacentTales.map((tale, index) => (
            <button key={tale.id} type="button" onClick={() => onOpenAdjacent(tale.id)}>
              <span>{String(index + 1).padStart(2, "0")}</span>{tale.title}<ArrowRight aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
      <footer className="focus-pagination" aria-label="Catalog sequence">
        <span>Catalog sequence</span>
        <button type="button" onClick={onPrevious}><ArrowLeft aria-hidden="true" /> Previous record</button>
        <button type="button" onClick={onNext}>Next record <ArrowRight aria-hidden="true" /></button>
      </footer>
    </DialogFrame>
  );
}
