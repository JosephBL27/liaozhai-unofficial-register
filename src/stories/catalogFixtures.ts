import {
  figures,
  figureById,
  glossaryById,
  institutionById,
  motifById,
  places,
  registers,
  relationEdges,
  searchIndex,
  taleById,
  tales,
} from "../data";
import type { DossierViewModel } from "../components/ReadingDossier";
import type { RelationEdgeView, RelationNodeView } from "../components/RelationshipGraph";
import type { SearchItem } from "../components/SearchDialog";
import type { WorldPlaceView } from "../components/StoryWorldChart";
import type { TaleReadingRecord } from "../lib/readingState";
import { buildTaleRows } from "../lib/viewModels";
import type { Figure, Motif, Register, Tale } from "../types";

export const firstRegister = registers[0]!;
export const firstTale = taleById.get(firstRegister.taleIds[0])!;

export function talesForRegister(register: Register): Tale[] {
  return register.taleIds.map((id) => taleById.get(id)!).filter(Boolean);
}

export function figuresForTale(tale: Tale): Figure[] {
  return tale.figures.map((id) => figureById.get(id)!).filter(Boolean);
}

export function motifsForTale(tale: Tale): Motif[] {
  return tale.motifs.map((id) => motifById.get(id)!).filter(Boolean);
}

export function dossierFor(tale: Tale, register: Register, isRead = false): DossierViewModel {
  return {
    registerIndex: register.index,
    registerTitle: register.title,
    title: tale.title,
    variantTitle: tale.variantTitle,
    summary: tale.summary,
    disclosure: tale.disclosure,
    locus: tale.locus.label,
    form: tale.form,
    socialPressure: tale.socialPressure,
    figures: figuresForTale(tale).map(({ id, name, role }) => ({ id, name, role })),
    institutions: tale.institutions.map((id) => institutionById.get(id)?.name ?? id),
    motifs: tale.motifs.map((id) => motifById.get(id)?.label ?? id),
    terms: tale.terms.map((id) => glossaryById.get(id)?.label ?? id),
    adjacentTales: tale.adjacentTaleIds
      .map((id) => taleById.get(id))
      .filter((entry): entry is Tale => entry !== undefined)
      .map(({ id, title }) => ({ id, title })),
    prompts: [...tale.prompts],
    taleCount: register.taleIds.length,
    readTaleCount: isRead ? register.taleIds.length : 0,
    isRead,
  };
}

const permittedSearchKinds = new Set<SearchItem["kind"]>(["tale", "figure", "motif", "term", "register"]);

export const searchItems: SearchItem[] = searchIndex
  .filter((record): record is typeof record & { kind: SearchItem["kind"] } => permittedSearchKinds.has(record.kind as SearchItem["kind"]))
  .map((record) => ({
    id: record.id,
    kind: record.kind,
    title: record.label,
    subtitle: record.subtitle,
    searchText: record.text,
  }));

const graphTaleIds = [
  "yingning",
  "jiaona",
  "lianxiang",
  "nie-xiaoqian",
  "shui-mang",
  "painted-skin",
  "painted-wall",
  "talking-pupils",
] as const;

const graphPositions = [
  [60, 60],
  [410, 35],
  [755, 85],
  [65, 310],
  [420, 330],
  [755, 360],
  [405, 570],
  [760, 600],
] as const;

export const relationNodes: RelationNodeView[] = graphTaleIds.map((id, index) => {
  const tale = taleById.get(id)!;
  return {
    id,
    label: tale.title,
    kind: "tale",
    subtitle: tale.form,
    x: graphPositions[index]![0],
    y: graphPositions[index]![1],
  };
});

const graphNodeSet = new Set(graphTaleIds);

export const relationEdgeViews: RelationEdgeView[] = relationEdges
  .filter((edge) => graphNodeSet.has(edge.source as typeof graphTaleIds[number]) && graphNodeSet.has(edge.target as typeof graphTaleIds[number]))
  .map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: edge.label,
    kind: edge.kind,
  }));

const worldKinds: Record<(typeof places)[number]["kind"], WorldPlaceView["kind"]> = {
  domestic: "household",
  official: "institution",
  religious: "threshold",
  commercial: "journey",
  aquatic: "journey",
  otherworld: "otherworld",
  regional: "journey",
  artwork: "threshold",
};

const chartPositions = [
  [115, 455],
  [250, 355],
  [395, 435],
  [505, 265],
  [650, 315],
  [760, 195],
  [885, 330],
  [930, 145],
] as const;

export const worldPlaces: WorldPlaceView[] = places.slice(0, 8).map((place, index) => ({
  id: place.id,
  name: place.name,
  region: place.kind,
  x: chartPositions[index]![0],
  y: chartPositions[index]![1],
  kind: worldKinds[place.kind],
  note: place.summary,
  recordCount: place.taleIds.length,
}));

export const catalogCounts = {
  registers: registers.length,
  tales: tales.length,
  figures: figures.length,
};

const storyReadingState = Object.assign(Object.create(null) as TaleReadingRecord, {
  yingning: { status: "read", percent: 100, favorite: true },
  jiaona: { status: "in-progress", percent: 62, favorite: false },
  lianxiang: { status: "unread", percent: 0, favorite: true },
} satisfies TaleReadingRecord);

export const taleRows = buildTaleRows(storyReadingState);
