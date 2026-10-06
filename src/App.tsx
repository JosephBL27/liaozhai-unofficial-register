import { Info, PanelTopOpen } from "lucide-react";
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { FigureId, RegisterId, TaleId } from "./types";
import { figureById, motifById, registerById, registers, taleById, tales } from "./data";
import { AppShell } from "./components/AppShell";
import { FigureSheet } from "./components/FigureSheet";
import { GlobalHeader } from "./components/GlobalHeader";
import { LexiconView } from "./components/LexiconView";
import { MethodView } from "./components/MethodView";
import { MobileRegisterToolbar } from "./components/MobileRegisterToolbar";
import { NotesDrawer } from "./components/NotesDrawer";
import { OperationsRail, type RegisterStatusFilter, type RegisterViewMode } from "./components/OperationsRail";
import { PaneResizer } from "./components/PaneResizer";
import { PeopleRegister } from "./components/PeopleRegister";
import { RadialStage } from "./components/RadialStage";
import { ReadingDossier } from "./components/ReadingDossier";
import { BookRail } from "./components/RegisterRail";
import { SearchDialog, type SearchItem } from "./components/SearchDialog";
import { SettingsDialog } from "./components/SettingsDialog";
import { TaleFocusSheet } from "./components/TaleFocusSheet";
import { TalesLedger } from "./components/TalesLedger";
import { FooterLedger } from "./components/FooterLedger";
import { WorkspaceTabs, type WorkspaceId } from "./components/WorkspaceTabs";
import { useLocalStorage } from "./hooks/useLocalStorage";
import {
  LIAOZHAI_STORAGE_KEYS,
  exportLiaozhaiNotes,
  importLiaozhaiNotes,
  mergeLiaozhaiNotes,
  parseLiaozhaiNotes,
  parseLiaozhaiProgress,
  parseLiaozhaiPaneState,
  serializeLiaozhaiPaneState,
  serializeLiaozhaiNotes,
  serializeLiaozhaiProgress,
  type LiaozhaiNote,
  type LiaozhaiPaneState,
  type LiaozhaiProgress,
} from "./lib/storage";
import {
  countTaleReadingStates,
  filterTaleIdsByReadingState,
  getTaleReadingState,
  normalizeTaleReadingRecord,
  setTaleReadingPercent,
  setTaleReadingStatus,
  toggleTaleFavorite,
  type TaleReadingRecord,
  type TaleReadingStatus,
} from "./lib/readingState";
import {
  buildDossier,
  buildNoteViews,
  buildRelationEdges,
  buildRelationNodes,
  buildTaleRows,
  figureRows,
  lexiconRows,
  railItems,
  searchItems,
  worldPlaces,
} from "./lib/viewModels";

const workspaceIds: WorkspaceId[] = [
  "register",
  "tales",
  "relations",
  "world",
  "people",
  "lexicon",
  "method",
];
const taleIds = tales.map((tale) => tale.id);

const RelationshipGraph = lazy(() => import("./components/RelationshipGraph").then((module) => ({ default: module.RelationshipGraph })));
const StoryWorldChart = lazy(() => import("./components/StoryWorldChart").then((module) => ({ default: module.StoryWorldChart })));

function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

function workspaceFromHash(): WorkspaceId {
  if (typeof window === "undefined") return "register";
  const candidate = window.location.hash.replace(/^#/, "") as WorkspaceId;
  return workspaceIds.includes(candidate) ? candidate : "register";
}

function initialProgress(): LiaozhaiProgress {
  return {
    currentRegisterId: registers[0].id,
    readRegisterIds: [],
    readTaleIds: [],
    taleStates: Object.create(null) as TaleReadingRecord,
  };
}

function withTaleStates(
  current: LiaozhaiProgress,
  taleStatesValue: TaleReadingRecord,
): LiaozhaiProgress {
  const taleStates = normalizeTaleReadingRecord(taleStatesValue);
  const readTaleIds = tales
    .filter((tale) => getTaleReadingState(taleStates, tale.id).status === "read")
    .map((tale) => tale.id);
  const readSet = new Set(readTaleIds);
  const readRegisterIds = registers
    .filter((register) => register.taleIds.every((taleId) => readSet.has(taleId)))
    .map((register) => register.id);

  return { ...current, taleStates, readTaleIds, readRegisterIds };
}

function noteId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `note-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function App() {
  const [workspace, setWorkspace] = useState<WorkspaceId>(workspaceFromHash);
  const [viewMode, setViewMode] = useState<RegisterViewMode>("map");
  const [statusFilter, setStatusFilter] = useState<RegisterStatusFilter>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [radialZoom, setRadialZoom] = useState(1);
  const [mobileDossierOpen, setMobileDossierOpen] = useState(true);
  const dossierDismissRef = useRef<HTMLButtonElement>(null);
  const dossierReopenRef = useRef<HTMLButtonElement>(null);
  const dossierFocusDestination = useRef<"dismiss" | "reopen" | null>(null);
  const [activeDialog, setActiveDialog] = useState<"search" | "notes" | "tale" | "figure" | "settings" | null>(null);
  const [selectedFigureId, setSelectedFigureId] = useState<FigureId | null>(null);
  const [selectedWorldId, setSelectedWorldId] = useState<string>();
  const [selectedRelationId, setSelectedRelationId] = useState<string>();
  const [lexiconQuery, setLexiconQuery] = useState("");
  const [announcement, setAnnouncement] = useState("The unofficial register is ready.");
  const [progress, setProgress] = useLocalStorage<LiaozhaiProgress>(
    LIAOZHAI_STORAGE_KEYS.progress,
    initialProgress,
    {
      serialize: serializeLiaozhaiProgress,
      deserialize: (value) => {
        const parsed = parseLiaozhaiProgress(value);
        const validated = registerById.has(parsed.currentRegisterId as RegisterId)
          ? parsed
          : { ...parsed, currentRegisterId: registers[0].id };
        return withTaleStates(validated, validated.taleStates);
      },
    },
  );
  const [notes, setNotes] = useLocalStorage<LiaozhaiNote[]>(
    LIAOZHAI_STORAGE_KEYS.notes,
    [],
    {
      serialize: serializeLiaozhaiNotes,
      deserialize: parseLiaozhaiNotes,
    },
  );
  const [panes, setPanes] = useLocalStorage<LiaozhaiPaneState>(
    LIAOZHAI_STORAGE_KEYS.panes,
    { dossierShare: 39 },
    {
      serialize: serializeLiaozhaiPaneState,
      deserialize: parseLiaozhaiPaneState,
    },
  );

  const activeRegister = registerById.get(progress.currentRegisterId as RegisterId) ?? registers[0];
  const [activeTaleId, setActiveTaleId] = useState<TaleId>(activeRegister.taleIds[0]);
  const activeTale = taleById.get(activeTaleId) ?? taleById.get(activeRegister.taleIds[0])!;
  const activeFigures = useMemo(
    () => activeTale.figures.map((id) => figureById.get(id)).filter(isDefined),
    [activeTale.id],
  );
  const activeMotifs = useMemo(
    () => activeTale.motifs.map((id) => motifById.get(id)).filter(isDefined),
    [activeTale.id],
  );
  const selectedFigure = selectedFigureId ? figureById.get(selectedFigureId) : undefined;
  const activeReading = getTaleReadingState(progress.taleStates, activeTale.id);
  const readingCounts = useMemo(
    () => countTaleReadingStates(taleIds, progress.taleStates),
    [progress.taleStates],
  );
  const visibleTaleIds = useMemo(
    () => filterTaleIdsByReadingState(taleIds, progress.taleStates, statusFilter),
    [progress.taleStates, statusFilter],
  );

  useEffect(() => {
    if (!activeRegister.taleIds.includes(activeTaleId)) {
      setActiveTaleId(activeRegister.taleIds[0]);
    }
  }, [activeRegister, activeTaleId]);

  useEffect(() => {
    const onHashChange = () => setWorkspace(workspaceFromHash());
    const onGlobalKey = (event: KeyboardEvent) => {
      if (activeDialog === null && (event.metaKey || event.ctrlKey) && event.key.toLocaleLowerCase() === "k") {
        event.preventDefault();
        setActiveDialog("search");
      }
      if (
        activeDialog === null &&
        event.key === "Escape" &&
        window.matchMedia("(max-width: 900px)").matches &&
        workspace === "register" &&
        viewMode === "map" &&
        mobileDossierOpen
      ) {
        const dossier = document.getElementById("reading-dossier");
        dossierFocusDestination.current = dossier?.contains(document.activeElement) ? "reopen" : null;
        setMobileDossierOpen(false);
        setAnnouncement("Selected tale panel closed. The wheel remains active.");
      }
    };
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("keydown", onGlobalKey);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("keydown", onGlobalKey);
    };
  }, [activeDialog, mobileDossierOpen, viewMode, workspace]);

  useEffect(() => {
    const destination = dossierFocusDestination.current;
    if (destination === null) return;
    dossierFocusDestination.current = null;
    const target = destination === "dismiss" ? dossierDismissRef.current : dossierReopenRef.current;
    target?.focus();
  }, [mobileDossierOpen]);

  const changeWorkspace = useCallback((next: WorkspaceId) => {
    setWorkspace(next);
    setMenuOpen(false);
    if (window.location.hash !== `#${next}`) window.history.replaceState(null, "", `#${next}`);
    setAnnouncement(`${next === "world" ? "Story world" : next} workspace opened.`);
  }, []);

  const selectRegister = useCallback((registerId: RegisterId) => {
    const next = registerById.get(registerId);
    if (!next) return;
    setProgress((current) => ({ ...current, currentRegisterId: next.id }));
    setActiveTaleId(next.taleIds[0]);
    setMobileDossierOpen(true);
    setAnnouncement(`Register ${next.index}, ${next.title}, aligned with the correction pointer.`);
  }, [setProgress]);

  const stepRegister = useCallback((direction: -1 | 1) => {
    const index = registers.findIndex((register) => register.id === activeRegister.id);
    const nextIndex = (index + direction + registers.length) % registers.length;
    selectRegister(registers[nextIndex].id);
  }, [activeRegister.id, selectRegister]);

  const selectTale = useCallback((taleId: string, openFocus = false) => {
    const next = taleById.get(taleId as TaleId);
    if (!next) return;
    setProgress((current) => ({ ...current, currentRegisterId: next.registerId }));
    setActiveTaleId(next.id);
    setMobileDossierOpen(true);
    setAnnouncement(`${next.title} selected in ${registerById.get(next.registerId)?.title}.`);
    if (openFocus) setActiveDialog("tale");
  }, [setProgress]);

  const updateTaleStatus = useCallback((status: TaleReadingStatus) => {
    setProgress((current) => withTaleStates(
      { ...current, currentRegisterId: activeRegister.id },
      setTaleReadingStatus(current.taleStates, activeTale.id, status),
    ));
    setAnnouncement(`${activeTale.title} marked ${status.replace("-", " ")}.`);
  }, [activeRegister.id, activeTale.id, activeTale.title, setProgress]);

  const updateTalePercent = useCallback((percent: number) => {
    setProgress((current) => withTaleStates(
      { ...current, currentRegisterId: activeRegister.id },
      setTaleReadingPercent(current.taleStates, activeTale.id, percent),
    ));
    setAnnouncement(`${activeTale.title} progress set to ${Math.round(percent)} percent.`);
  }, [activeRegister.id, activeTale.id, activeTale.title, setProgress]);

  const toggleFavorite = useCallback((taleId: string = activeTale.id) => {
    const tale = taleById.get(taleId as TaleId);
    if (!tale) return;
    const wasFavorite = getTaleReadingState(progress.taleStates, tale.id).favorite;
    setProgress((current) => withTaleStates(
      current,
      toggleTaleFavorite(current.taleStates, tale.id),
    ));
    setAnnouncement(`${tale.title} ${wasFavorite ? "removed from" : "added to"} favourites.`);
  }, [activeTale.id, progress.taleStates, setProgress]);

  const changeStatusFilter = useCallback((filter: RegisterStatusFilter) => {
    setStatusFilter(filter);
    const matchingIds = filterTaleIdsByReadingState(taleIds, progress.taleStates, filter);
    if (filter !== "all" && matchingIds.length > 0 && !matchingIds.includes(activeTale.id)) {
      selectTale(matchingIds[0]);
    }
    const label = filter === "in-progress" ? "in progress" : filter === "favorites" ? "favourites" : filter;
    setAnnouncement(`${matchingIds.length} ${label} records shown.`);
  }, [activeTale.id, progress.taleStates, selectTale]);

  const dossier = useMemo(
    () => buildDossier(activeRegister, activeTale, activeFigures, activeMotifs, progress.readTaleIds),
    [activeFigures, activeMotifs, activeRegister, activeTale, progress.readTaleIds],
  );
  const taleRows = useMemo(() => buildTaleRows(progress.taleStates), [progress.taleStates]);
  const relationNodes = useMemo(
    () => buildRelationNodes(activeTale, activeFigures, activeMotifs),
    [activeFigures, activeMotifs, activeTale],
  );
  const graphEdges = useMemo(() => buildRelationEdges(activeTale, relationNodes), [activeTale, relationNodes]);
  const noteViews = useMemo(() => buildNoteViews(notes), [notes]);

  function moveTale(direction: -1 | 1) {
    const index = tales.findIndex((tale) => tale.id === activeTale.id);
    const next = tales[(index + direction + tales.length) % tales.length];
    selectTale(next.id);
  }

  function openFigure(figureId: string) {
    const figure = figureById.get(figureId as FigureId);
    if (!figure) return;
    setSelectedFigureId(figure.id);
    setActiveDialog("figure");
    setAnnouncement(`${figure.name} figure slip opened.`);
  }

  function handleSearchSelect(item: SearchItem) {
    setActiveDialog(null);
    if (item.kind === "register") {
      selectRegister(item.id as RegisterId);
      changeWorkspace("register");
      return;
    }
    if (item.kind === "tale") {
      selectTale(item.id, true);
      changeWorkspace("register");
      return;
    }
    if (item.kind === "figure") {
      openFigure(item.id);
      return;
    }
    if (item.kind === "term") {
      setLexiconQuery(item.title);
      changeWorkspace("lexicon");
      return;
    }
    setSelectedRelationId(`motif:${item.id}`);
    changeWorkspace("relations");
  }

  function saveNote(text: string) {
    const now = new Date().toISOString();
    setNotes((current) => [...current, {
      id: noteId(),
      taleId: activeTale.id,
      registerId: activeRegister.id,
      text,
      createdAt: now,
      updatedAt: now,
    }]);
    setAnnouncement(`Marginalia saved to ${activeTale.title}.`);
  }

  function exportNotes() {
    const contents = exportLiaozhaiNotes(notes, new Date().toISOString());
    const href = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "liaozhai-marginalia.json";
    anchor.click();
    URL.revokeObjectURL(href);
    setAnnouncement("Marginalia exported as JSON.");
  }

  async function importNotes(file: File) {
    try {
      const contents = await file.text();
      const parsed = JSON.parse(contents) as unknown;
      const hasEnvelope = typeof parsed === "object" && parsed !== null && "notes" in parsed;
      const payload = hasEnvelope ? (parsed as { notes?: unknown }).notes : parsed;
      if (!Array.isArray(payload)) throw new Error("Unsupported marginalia payload");
      const imported = importLiaozhaiNotes(payload);
      if (payload.length > 0 && imported.length === 0) throw new Error("No valid marginalia records");
      setNotes((current) => mergeLiaozhaiNotes(current, imported));
      setAnnouncement("Imported marginalia merged by note identifier.");
    } catch {
      setAnnouncement("That marginalia file is not valid Liaozhai note JSON.");
    }
  }

  function renderWorkspace() {
    if (workspace === "register") {
      return (
        <main className={`register-workspace is-${viewMode}-mode`} id="workspace-main" tabIndex={-1}>
          {viewMode === "map" ? (
            <div className={mobileDossierOpen ? "register-composition" : "register-composition is-dossier-collapsed"} style={{ "--dossier-share": `${panes.dossierShare ?? 39}%` } as CSSProperties}>
              {statusFilter !== "all" && (
                <div className="reading-filter-notice" role="status">
                  <strong>{visibleTaleIds.length}</strong>
                  {" "}
                  <span>{statusFilter === "in-progress" ? "in-progress" : statusFilter === "favorites" ? "favourite" : statusFilter} records · full wheel retained</span>
                </div>
              )}
              <RadialStage
                registers={registers}
                activeRegister={activeRegister}
                activeTale={activeTale}
                activeFigures={activeFigures}
                activeMotifs={activeMotifs}
                readRegisterIds={progress.readRegisterIds}
                onSelectRegister={selectRegister}
                onSelectTale={(id) => selectTale(id)}
                onSelectFigure={openFigure}
                onStep={stepRegister}
                zoomValue={radialZoom}
                onZoomChange={setRadialZoom}
              />
              <img
                className="composition-fox-breach"
                src="/assets/materials/cut-paper-fox-breach.webp"
                alt=""
                aria-hidden="true"
              />
              <img
                className="composition-fox-breach is-forepaw"
                src="/assets/materials/cut-paper-fox-breach.webp"
                alt=""
                aria-hidden="true"
              />
              <button className="material-provenance" type="button" onClick={() => changeWorkspace("method")}>
                <Info aria-hidden="true" />
                Interpretive generated artwork · provenance
              </button>
              <PaneResizer
                value={panes.dossierShare ?? 39}
                onChange={(dossierShare) => setPanes((current) => ({ ...current, dossierShare }))}
              />
              <ReadingDossier
                dossier={dossier}
                readingStatus={activeReading.status}
                readingPercent={activeReading.percent}
                isFavorite={activeReading.favorite}
                onOpenTale={() => setActiveDialog("tale")}
                onSetStatus={updateTaleStatus}
                onSetPercent={updateTalePercent}
                onToggleFavorite={() => toggleFavorite()}
                onOpenNotes={() => setActiveDialog("notes")}
                onOpenFigure={openFigure}
                onOpenLexicon={(term) => {
                  setLexiconQuery(term);
                  changeWorkspace("lexicon");
                }}
                onOpenAdjacent={(id) => selectTale(id)}
                onOpenMethod={() => changeWorkspace("method")}
                dismissButtonRef={dossierDismissRef}
                onDismiss={() => {
                  dossierFocusDestination.current = "reopen";
                  setMobileDossierOpen(false);
                  setAnnouncement("Selected tale panel closed. The wheel remains active.");
                }}
              />
              {!mobileDossierOpen && (
                <button
                  ref={dossierReopenRef}
                  className="mobile-dossier-reopen"
                  type="button"
                  onClick={() => {
                    dossierFocusDestination.current = "dismiss";
                    setMobileDossierOpen(true);
                    setAnnouncement(`Selected tale panel opened for ${activeTale.title}.`);
                  }}
                >
                  <PanelTopOpen aria-hidden="true" />
                  <span>Open selected record</span>
                  <strong>{activeTale.title}</strong>
                </button>
              )}
            </div>
          ) : (
            <div className="register-table-mode">
              <TalesLedger
                rows={taleRows}
                statusFilter={statusFilter}
                onStatusFilterChange={changeStatusFilter}
                onToggleFavorite={toggleFavorite}
                onSelect={(id) => selectTale(id, true)}
              />
            </div>
          )}
          <BookRail
            items={railItems}
            activeId={activeRegister.id}
            readIds={progress.readRegisterIds}
            onSelect={(id) => selectRegister(id as RegisterId)}
            onStep={stepRegister}
          />
        </main>
      );
    }
    if (workspace === "tales") return <main id="workspace-main" tabIndex={-1}><TalesLedger rows={taleRows} statusFilter={statusFilter} onStatusFilterChange={changeStatusFilter} onToggleFavorite={toggleFavorite} onSelect={(id) => selectTale(id, true)} /></main>;
    if (workspace === "relations") {
      return (
        <main id="workspace-main" tabIndex={-1}>
          <Suspense fallback={<div className="workspace-loading" role="status">Opening the relation register…</div>}>
            <RelationshipGraph
              nodes={relationNodes}
              edges={graphEdges}
              selectedId={selectedRelationId}
              onSelect={(id) => {
                setSelectedRelationId(id);
                if (id.startsWith("tale:")) selectTale(id.slice(5));
                if (id.startsWith("figure:")) openFigure(id.slice(7));
              }}
            />
          </Suspense>
        </main>
      );
    }
    if (workspace === "world") return <main id="workspace-main" tabIndex={-1}><Suspense fallback={<div className="workspace-loading" role="status">Unfolding the story-world chart…</div>}><StoryWorldChart places={worldPlaces} selectedId={selectedWorldId} onSelect={setSelectedWorldId} /></Suspense></main>;
    if (workspace === "people") return <main id="workspace-main" tabIndex={-1}><PeopleRegister figures={figureRows} onSelect={openFigure} /></main>;
    if (workspace === "lexicon") return <main id="workspace-main" tabIndex={-1}><LexiconView key={lexiconQuery} entries={lexiconRows} initialQuery={lexiconQuery} /></main>;
    return <main id="workspace-main" tabIndex={-1}><MethodView /></main>;
  }

  return (
    <AppShell>
      <GlobalHeader
        progressLabel={`${readingCounts.read} read · ${readingCounts.inProgress} in progress`}
        onOpenSearch={() => setActiveDialog("search")}
        onOpenNotes={() => setActiveDialog("notes")}
        onOpenMenu={() => setMenuOpen((open) => !open)}
      />
      <div className="reading-frame">
        <OperationsRail
          activeWorkspace={workspace}
          onWorkspaceChange={changeWorkspace}
          viewMode={viewMode}
          onViewModeChange={(mode) => {
            setViewMode(mode);
            changeWorkspace("register");
          }}
          statusFilter={statusFilter}
          onStatusFilterChange={changeStatusFilter}
          counts={readingCounts}
          onOpenNotes={() => setActiveDialog("notes")}
          radialZoom={radialZoom}
          onRadialZoomChange={setRadialZoom}
        />
        <div className="reading-surface">
          <WorkspaceTabs active={workspace} open={menuOpen} onChange={changeWorkspace} />
          {workspace === "register" && (
            <MobileRegisterToolbar
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              statusFilter={statusFilter}
              onStatusFilterChange={changeStatusFilter}
              counts={readingCounts}
            />
          )}
          {renderWorkspace()}
          <FooterLedger
            counts={readingCounts}
            storageLabel="Local to this browser"
            onExportNotes={exportNotes}
            onOpenMethod={() => changeWorkspace("method")}
            onOpenSettings={() => setActiveDialog("settings")}
          />
        </div>
      </div>

      {activeDialog === "search" && <SearchDialog items={searchItems} onClose={() => setActiveDialog(null)} onSelect={handleSearchSelect} />}
      {activeDialog === "notes" && (
        <NotesDrawer
          contextLabel={activeTale.title}
          notes={noteViews}
          onClose={() => setActiveDialog(null)}
          onSave={saveNote}
          onDelete={(id) => setNotes((current) => current.filter((note) => note.id !== id))}
          onExport={exportNotes}
          onImport={importNotes}
        />
      )}
      {activeDialog === "tale" && (
        <TaleFocusSheet
          dossier={dossier}
          adjacentTales={activeTale.adjacentTaleIds.map((id) => ({ id, title: taleById.get(id)?.title ?? id }))}
          onClose={() => setActiveDialog(null)}
          onPrevious={() => moveTale(-1)}
          onNext={() => moveTale(1)}
          onOpenAdjacent={(id) => selectTale(id)}
          onOpenRelations={() => { setActiveDialog(null); changeWorkspace("relations"); }}
          onOpenWorld={() => { setActiveDialog(null); changeWorkspace("world"); }}
        />
      )}
      {activeDialog === "figure" && selectedFigure && (
        <FigureSheet
          figure={selectedFigure}
          taleTitles={selectedFigure.taleIds.map((id) => ({ id, title: taleById.get(id)?.title ?? id }))}
          onClose={() => { setSelectedFigureId(null); setActiveDialog(null); }}
          onOpenTale={(id) => { setSelectedFigureId(null); selectTale(id, true); }}
          onOpenRelations={() => { setSelectedRelationId(`figure:${selectedFigure.id}`); setSelectedFigureId(null); setActiveDialog(null); changeWorkspace("relations"); }}
        />
      )}
      {activeDialog === "settings" && (
        <SettingsDialog
          readCount={readingCounts.read}
          inProgressCount={readingCounts.inProgress}
          favoriteCount={readingCounts.favorites}
          noteCount={notes.length}
          onClose={() => setActiveDialog(null)}
          onExportNotes={exportNotes}
          onOpenMethod={() => {
            setActiveDialog(null);
            changeWorkspace("method");
          }}
          onResetReading={() => {
            setProgress((current) => withTaleStates(
              current,
              Object.create(null) as TaleReadingRecord,
            ));
            setStatusFilter("all");
            setAnnouncement("Reading status, percentages, and favourites reset. Marginalia was kept.");
          }}
        />
      )}
      <div className="sr-only" role="status" aria-live="polite">{announcement}</div>
    </AppShell>
  );
}
