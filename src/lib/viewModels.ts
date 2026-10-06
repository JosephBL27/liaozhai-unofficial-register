import { scaleLinear } from "d3-scale";
import {
  figures,
  glossary,
  glossaryById,
  institutionById,
  motifs,
  places,
  registerById,
  registers,
  relationEdges,
  taleById,
  tales,
} from "../data";
import type { Figure, Motif, Place, Register, Tale, TaleId } from "../types";
import type { LexiconRow } from "../components/LexiconView";
import type { NoteView } from "../components/NotesDrawer";
import type { FigureRow } from "../components/PeopleRegister";
import type { DossierViewModel } from "../components/ReadingDossier";
import type { RegisterRailItem } from "../components/RegisterRail";
import type { RelationEdgeView, RelationNodeView } from "../components/RelationshipGraph";
import type { SearchItem } from "../components/SearchDialog";
import type { WorldPlaceView } from "../components/StoryWorldChart";
import type { TaleLedgerRow } from "../components/TalesLedger";
import type { LiaozhaiNote } from "./storage";
import { getTaleReadingState, type TaleReadingRecord } from "./readingState";

export const railItems: RegisterRailItem[] = registers.map((register) => ({
  id: register.id,
  index: register.index,
  title: register.title,
  mark: register.mark,
  taleCount: register.taleIds.length,
}));

export const figureRows: FigureRow[] = figures.map((figure) => ({
  id: figure.id,
  name: figure.name,
  aliases: [],
  kind: figure.kind,
  role: figure.role,
  recordIds: [...figure.taleIds],
}));

export const lexiconRows: LexiconRow[] = glossary.map((term) => ({
  id: term.id,
  term: term.label,
  category: term.category,
  gloss: term.definition,
  note: term.usageNote ?? `${term.taleIds.length} representative ${term.taleIds.length === 1 ? "record" : "records"} linked`,
}));

export const searchItems: SearchItem[] = [
  ...registers.map((register) => ({
    id: register.id,
    kind: "register" as const,
    title: register.title,
    subtitle: `Register ${register.index} · ${register.socialField}`,
    searchText: `${register.thesis} ${register.tone} ${register.category}`,
  })),
  ...tales.map((tale) => ({
    id: tale.id,
    kind: "tale" as const,
    title: tale.title,
    subtitle: `${registerById.get(tale.registerId)?.title} · ${tale.form}`,
    searchText: `${tale.variantTitle ?? ""} ${tale.summary} ${tale.socialPressure} ${tale.locus.label}`,
  })),
  ...figures.map((figure) => ({
    id: figure.id,
    kind: "figure" as const,
    title: figure.name,
    subtitle: `${figure.kind} · ${figure.role}`,
    searchText: figure.summary,
  })),
  ...motifs.map((motif) => ({
    id: motif.id,
    kind: "motif" as const,
    title: motif.label,
    subtitle: `${motif.taleIds.length} linked records`,
    searchText: motif.summary,
  })),
  ...glossary.map((term) => ({
    id: term.id,
    kind: "term" as const,
    title: term.label,
    subtitle: term.category,
    searchText: `${term.definition} ${term.usageNote ?? ""}`,
  })),
];

export function buildDossier(
  activeRegister: Register,
  activeTale: Tale,
  activeFigures: Figure[],
  activeMotifs: Motif[],
  readTaleIds: readonly string[],
): DossierViewModel {
  return {
    registerIndex: activeRegister.index,
    registerTitle: activeRegister.title,
    title: activeTale.title,
    variantTitle: activeTale.variantTitle,
    summary: activeTale.summary,
    disclosure: activeTale.disclosure,
    locus: activeTale.locus.label,
    form: activeTale.form,
    socialPressure: activeTale.socialPressure,
    figures: activeFigures.map((figure) => ({ id: figure.id, name: figure.name, role: figure.role })),
    institutions: activeTale.institutions
      .map((id) => institutionById.get(id)?.name)
      .filter((name): name is string => name !== undefined),
    motifs: activeMotifs.map((motif) => motif.label),
    terms: activeTale.terms.map((id) => glossaryById.get(id)?.label ?? id),
    adjacentTales: activeTale.adjacentTaleIds
      .map((id) => taleById.get(id))
      .filter((tale): tale is Tale => tale !== undefined)
      .map((tale) => ({ id: tale.id, title: tale.title })),
    prompts: [...activeTale.prompts],
    taleCount: activeRegister.taleIds.length,
    readTaleCount: activeRegister.taleIds.filter((id) => readTaleIds.includes(id)).length,
    isRead: readTaleIds.includes(activeTale.id),
  };
}

export function buildTaleRows(taleStates: TaleReadingRecord): TaleLedgerRow[] {
  return tales.map((tale) => {
    const register = registerById.get(tale.registerId)!;
    const reading = getTaleReadingState(taleStates, tale.id);
    return {
      id: tale.id,
      title: tale.title,
      variantTitle: tale.variantTitle,
      registerIndex: register.index,
      registerTitle: register.title,
      form: tale.form,
      locus: tale.locus.label,
      socialPressure: tale.socialPressure,
      isRead: reading.status === "read",
      status: reading.status,
      percent: reading.percent,
      isFavorite: reading.favorite,
    };
  });
}

export function buildRelationNodes(
  activeTale: Tale,
  activeFigures: Figure[],
  activeMotifs: Motif[],
): RelationNodeView[] {
  const nodes: RelationNodeView[] = [{
    id: `tale:${activeTale.id}`,
    label: activeTale.title,
    kind: "tale",
    subtitle: "selected record",
    x: 0,
    y: 250,
  }];
  activeFigures.forEach((figure, index) => nodes.push({
    id: `figure:${figure.id}`,
    label: figure.name,
    kind: "figure",
    subtitle: figure.role,
    x: -390,
    y: 20 + index * 160,
  }));
  activeMotifs.forEach((motif, index) => nodes.push({
    id: `motif:${motif.id}`,
    label: motif.label,
    kind: "motif",
    subtitle: "recurring form",
    x: 10 + index * 175,
    y: -120,
  }));
  activeTale.institutions.slice(0, 4).forEach((id, index) => {
    const institution = institutionById.get(id);
    if (!institution) return;
    nodes.push({
      id: `institution:${id}`,
      label: institution.name,
      kind: "institution",
      subtitle: "ordinary pressure",
      x: 370,
      y: 30 + index * 155,
    });
  });
  const relatedTaleIds = relationEdges
    .filter((edge) => edge.source === activeTale.id || edge.target === activeTale.id)
    .map((edge) => edge.source === activeTale.id ? edge.target : edge.source)
    .slice(0, 4);
  relatedTaleIds.forEach((id, index) => {
    const tale = taleById.get(id);
    if (!tale) return;
    nodes.push({
      id: `tale:${id}`,
      label: tale.title,
      kind: "tale",
      subtitle: registerById.get(tale.registerId)?.title ?? "adjacent record",
      x: 760,
      y: 10 + index * 155,
    });
  });
  return nodes;
}

export function buildRelationEdges(activeTale: Tale, nodes: RelationNodeView[]): RelationEdgeView[] {
  const source = `tale:${activeTale.id}`;
  return nodes
    .filter((node) => node.id !== source)
    .map((node, index) => {
      const linkedTaleId = node.id.startsWith("tale:") ? node.id.slice(5) as TaleId : undefined;
      const declared = linkedTaleId
        ? relationEdges.find((edge) =>
          (edge.source === activeTale.id && edge.target === linkedTaleId) ||
          (edge.target === activeTale.id && edge.source === linkedTaleId))
        : undefined;
      return {
        id: declared?.id ?? `relation:${activeTale.id}:${index}`,
        source,
        target: node.id,
        label: declared?.label ?? (node.kind === "institution" ? "pressured by" : node.kind === "motif" ? "recurs as" : "cross-reference"),
        kind: declared?.kind ?? node.kind,
      };
    });
}

function placeKind(kind: Place["kind"]): WorldPlaceView["kind"] {
  if (kind === "domestic") return "household";
  if (kind === "otherworld") return "otherworld";
  if (kind === "artwork") return "threshold";
  if (kind === "regional" || kind === "aquatic") return "journey";
  return "institution";
}

export const worldPlaces: WorldPlaceView[] = (() => {
  const xScale = scaleLinear().domain([0, 5]).range([95, 895]);
  const yScale = scaleLinear().domain([0, 2]).range([155, 525]);
  return places.map((place, index) => {
    const column = index % 6;
    const row = Math.floor(index / 6);
    return {
      id: place.id,
      name: place.name,
      region: place.kind,
      x: xScale(column) + (row % 2) * 45,
      y: yScale(row) + (column % 2) * 42,
      kind: placeKind(place.kind),
      note: place.summary,
      recordCount: place.taleIds.length,
    };
  });
})();

export function buildNoteViews(notes: readonly LiaozhaiNote[]): NoteView[] {
  return notes.map((note) => {
    const tale = note.taleId ? taleById.get(note.taleId as TaleId) : undefined;
    const register = note.registerId ? registerById.get(note.registerId as Register["id"]) : undefined;
    return {
      id: note.id,
      context: tale?.title ?? register?.title ?? "Unplaced marginalia",
      text: note.text,
      updatedAt: note.updatedAt,
    };
  });
}
