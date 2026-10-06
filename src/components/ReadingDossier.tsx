import { ArrowUpRight, BookOpenText, Check, Circle, Heart, NotebookPen, PanelTopClose, Timer } from "lucide-react";
import gsap from "gsap";
import { useEffect, useId, useRef, useState } from "react";
import type { Ref } from "react";
import { BrandSeal } from "./BrandSeal";
import { DetailPanel } from "./DetailPanel";
import { MobileBottomSheet } from "./MobileBottomSheet";
import { ProgressIndicator } from "./ProgressBar";
import type { TaleReadingStatus } from "../lib/readingState";

export type DossierFigure = {
  id: string;
  name: string;
  role: string;
};

export type DossierAdjacentTale = {
  id: string;
  title: string;
};

export type DossierViewModel = {
  registerIndex: number;
  registerTitle: string;
  title: string;
  variantTitle?: string;
  summary: string;
  disclosure: string;
  locus: string;
  form: string;
  socialPressure: string;
  figures: DossierFigure[];
  institutions: string[];
  motifs: string[];
  terms: string[];
  adjacentTales: DossierAdjacentTale[];
  prompts: string[];
  taleCount: number;
  readTaleCount: number;
  isRead: boolean;
};

type ReadingDossierProps = {
  dossier: DossierViewModel;
  readingStatus: TaleReadingStatus;
  readingPercent: number;
  isFavorite: boolean;
  onOpenTale: () => void;
  onSetStatus: (status: TaleReadingStatus) => void;
  onSetPercent: (percent: number) => void;
  onToggleFavorite: () => void;
  onOpenNotes: () => void;
  onOpenFigure: (figureId: string) => void;
  onOpenLexicon: (term: string) => void;
  onOpenAdjacent: (taleId: string) => void;
  onOpenMethod: () => void;
  dismissButtonRef?: Ref<HTMLButtonElement>;
  onDismiss: () => void;
};

type DossierTab = "record" | "analysis" | "prompts";

export function ReadingDossier({
  dossier,
  readingStatus,
  readingPercent,
  isFavorite,
  onOpenTale,
  onSetStatus,
  onSetPercent,
  onToggleFavorite,
  onOpenNotes,
  onOpenFigure,
  onOpenLexicon,
  onOpenAdjacent,
  onOpenMethod,
  dismissButtonRef,
  onDismiss,
}: ReadingDossierProps) {
  const [tab, setTab] = useState<DossierTab>("record");
  const tabGroupId = `dossier-${useId().replace(/:/g, "")}`;
  const tabOrder: DossierTab[] = ["record", "analysis", "prompts"];
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.fromTo(
      sheet,
      { autoAlpha: 0.76, x: 16 },
      { autoAlpha: 1, x: 0, duration: 0.38, ease: "power2.out", clearProps: "opacity,visibility,transform" },
    );
  }, [dossier.title]);

  function moveTab(currentIndex: number, key: string) {
    let nextIndex = currentIndex;
    if (key === "ArrowRight") nextIndex = (currentIndex + 1) % tabOrder.length;
    if (key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabOrder.length) % tabOrder.length;
    if (key === "Home") nextIndex = 0;
    if (key === "End") nextIndex = tabOrder.length - 1;
    if (nextIndex === currentIndex && !["Home", "End"].includes(key)) return;
    setTab(tabOrder[nextIndex]);
    tabRefs.current[nextIndex]?.focus();
  }

  return (
    <MobileBottomSheet className="reading-dossier" id="reading-dossier" aria-label={`Selected tale: ${dossier.title}`}>
      <div className="paper-stack" aria-hidden="true">
        <img
          src="/assets/materials/stacked-record-leaves.webp"
          alt=""
          width="900"
          height="600"
          decoding="async"
        />
      </div>
      <div className="dossier-tabs">
        <div className="dossier-tablist" role="tablist" aria-label="Tale dossier sections">
          {tabOrder.map((item, index) => (
            <button
              key={item}
              ref={(node) => { tabRefs.current[index] = node; }}
              id={`${tabGroupId}-tab-${item}`}
              type="button"
              role="tab"
              aria-selected={tab === item}
              aria-controls={`${tabGroupId}-panel-${item}`}
              tabIndex={tab === item ? 0 : -1}
              onClick={() => setTab(item)}
              onKeyDown={(event) => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
                event.preventDefault();
                moveTab(index, event.key);
              }}
            >
              {item}
            </button>
          ))}
        </div>
        <button className="dossier-tab-note" type="button" onClick={onOpenNotes}>
          <NotebookPen aria-hidden="true" />
          <span className="sr-only">Open marginalia</span>
        </button>
        <button ref={dismissButtonRef} className="dossier-mobile-dismiss" type="button" onClick={onDismiss}>
          <PanelTopClose aria-hidden="true" />
          <span className="sr-only">Close selected tale panel</span>
        </button>
      </div>

      <DetailPanel className="dossier-sheet" ref={sheetRef}>
        <header className="dossier-heading">
          <div className="folio-number" aria-label={`Register ${dossier.registerIndex}`}>
            {String(dossier.registerIndex).padStart(2, "0")}
          </div>
          <div>
            <h1>{dossier.title}</h1>
            <span>Register {String(dossier.registerIndex).padStart(2, "0")} · {dossier.registerTitle}</span>
            {dossier.variantTitle && <p>Title varies by edition: {dossier.variantTitle}</p>}
          </div>
          <BrandSeal className="dossier-seal" title="Editorial record mark" />
        </header>

        {tab === "record" && (
          <div className="dossier-panel" id={`${tabGroupId}-panel-record`} role="tabpanel" aria-labelledby={`${tabGroupId}-tab-record`} tabIndex={0}>
            <figure className="dossier-taxonomy-plate">
              <img
                src="/assets/materials/woodblock-taxonomy.webp"
                alt=""
                width="1200"
                height="480"
                loading="lazy"
                decoding="async"
              />
              <figcaption>
                <dl className="dossier-taxonomy-values">
                  <div><dt>Figures</dt><dd>{dossier.figures.slice(0, 2).map((figure) => figure.name).join(" · ")}</dd></div>
                  <div><dt>Pressure</dt><dd>{dossier.institutions.slice(0, 2).join(" · ")}</dd></div>
                  <div><dt>Motif</dt><dd>{dossier.motifs[0]}</dd></div>
                  <div><dt>Locus</dt><dd>{dossier.locus}</dd></div>
                  <div><dt>Term</dt><dd>{dossier.terms[0]}</dd></div>
                </dl>
                <button type="button" onClick={onOpenMethod}>Interpretive generated printmarks · provenance</button>
              </figcaption>
            </figure>

            <p className="dossier-summary">{dossier.summary}</p>

            {dossier.adjacentTales.length > 0 && (
              <section className="dossier-adjacent dossier-adjacent--trace" aria-labelledby={`${tabGroupId}-adjacent`}>
                <h2 id={`${tabGroupId}-adjacent`}>Trace next</h2>
                <div>
                  {dossier.adjacentTales.map((tale) => (
                    <button key={tale.id} type="button" onClick={() => onOpenAdjacent(tale.id)}>{tale.title}</button>
                  ))}
                </div>
              </section>
            )}

            <dl className="dossier-facts">
              <div><dt>Locus</dt><dd>{dossier.locus}</dd></div>
              <div><dt>Strange form</dt><dd>{dossier.form}</dd></div>
              <div className="is-wide is-pressure"><dt>Ordinary pressure</dt><dd>{dossier.socialPressure}</dd></div>
              <div className="is-wide"><dt>What the record discloses</dt><dd>{dossier.disclosure}</dd></div>
            </dl>

            <section className="dossier-cast" aria-labelledby="cast-title">
              <h2 id="cast-title">Figures in this record</h2>
              <div>
                {dossier.figures.map((figure) => (
                  <button key={figure.id} type="button" onClick={() => onOpenFigure(figure.id)}>
                    <span aria-hidden="true">{figure.name.slice(0, 1)}</span>
                    <strong>{figure.name}</strong>
                    <small>{figure.role}</small>
                  </button>
                ))}
              </div>
            </section>

            <section className="dossier-inscriptions" aria-label="Motifs and terms">
              <div>
                <h2>Motifs</h2>
                <ul>{dossier.motifs.map((motif) => <li key={motif}>{motif}</li>)}</ul>
              </div>
              <div>
                <h2>Terms</h2>
                <ul>{dossier.terms.map((term) => <li key={term}><button type="button" onClick={() => onOpenLexicon(term)}>{term}</button></li>)}</ul>
              </div>
            </section>

          </div>
        )}

        {tab === "analysis" && (
          <div className="dossier-panel dossier-analysis" id={`${tabGroupId}-panel-analysis`} role="tabpanel" aria-labelledby={`${tabGroupId}-tab-analysis`} tabIndex={0}>
            <h2>The official cell and what escapes it</h2>
            <p>{dossier.socialPressure}</p>
            <p className="dossier-disclosure">{dossier.disclosure}</p>
            <p className="editorial-note">This guide supplies an editorial relation, not a quotation or definitive interpretation.</p>
          </div>
        )}

        {tab === "prompts" && (
          <div className="dossier-panel dossier-prompts" id={`${tabGroupId}-panel-prompts`} role="tabpanel" aria-labelledby={`${tabGroupId}-tab-prompts`} tabIndex={0}>
            <h2>Close-reading prompts</h2>
            <ol>{dossier.prompts.map((prompt) => <li key={prompt}>{prompt}</li>)}</ol>
          </div>
        )}

        <footer className="dossier-footer">
          <ProgressIndicator value={dossier.readTaleCount} max={dossier.taleCount} label="Register progress" />
          <div className="tale-reading-control">
            <div className="tale-reading-copy">
              <label htmlFor={`${tabGroupId}-progress`}>Tale progress</label>
              <output htmlFor={`${tabGroupId}-progress`}>{readingPercent}%</output>
            </div>
            <input
              id={`${tabGroupId}-progress`}
              type="range"
              min="0"
              max="100"
              step="1"
              value={readingPercent}
              onChange={(event) => onSetPercent(event.currentTarget.valueAsNumber)}
              aria-label={`Reading progress for ${dossier.title}`}
            />
            <div className="reading-statuses" role="group" aria-label="Tale reading status">
              <button type="button" aria-pressed={readingStatus === "unread"} onClick={() => onSetStatus("unread")}>
                <Circle aria-hidden="true" /> Unread
              </button>
              <button type="button" aria-pressed={readingStatus === "in-progress"} onClick={() => onSetStatus("in-progress")}>
                <Timer aria-hidden="true" /> In progress
              </button>
              <button type="button" aria-pressed={readingStatus === "read"} onClick={() => onSetStatus("read")}>
                <Check aria-hidden="true" /> Read
              </button>
            </div>
          </div>
          <div className="dossier-actions">
            <button className="seal-action" type="button" onClick={onOpenTale}>
              <BookOpenText aria-hidden="true" />
              Open tale dossier
              <ArrowUpRight aria-hidden="true" />
            </button>
            <button
              className={isFavorite ? "secondary-action is-favorite" : "secondary-action"}
              type="button"
              onClick={onToggleFavorite}
              aria-pressed={isFavorite}
            >
              <Heart aria-hidden="true" fill={isFavorite ? "currentColor" : "none"} />
              {isFavorite ? "Favourited" : "Favourite"}
            </button>
          </div>
        </footer>
      </DetailPanel>
    </MobileBottomSheet>
  );
}
