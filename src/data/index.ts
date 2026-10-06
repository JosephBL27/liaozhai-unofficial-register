import type {
  Figure,
  FigureId,
  GlossaryTerm,
  GlossaryTermId,
  Institution,
  InstitutionId,
  Motif,
  MotifId,
  Place,
  PlaceId,
  ReadingState,
  Register,
  RegisterId,
  SearchRecord,
  Tale,
  TaleId,
} from "../types";
import { figures } from "./figures";
import { glossary } from "./glossary";
import { institutions } from "./institutions";
import { motifs } from "./motifs";
import { places } from "./places";
import { datasetNotice, registers } from "./registers";
import { relationEdges } from "./relations";
import { tales } from "./tales";

export { datasetNotice, figures, glossary, institutions, motifs, places, registers, relationEdges, tales };

export const registerById: ReadonlyMap<RegisterId, Register> = new Map(
  registers.map((register) => [register.id, register]),
);

export const taleById: ReadonlyMap<TaleId, Tale> = new Map(
  tales.map((tale) => [tale.id, tale]),
);

export const figureById: ReadonlyMap<FigureId, Figure> = new Map(
  figures.map((figure) => [figure.id, figure]),
);

export const motifById: ReadonlyMap<MotifId, Motif> = new Map(
  motifs.map((motif) => [motif.id, motif]),
);

export const glossaryById: ReadonlyMap<GlossaryTermId, GlossaryTerm> = new Map(
  glossary.map((term) => [term.id, term]),
);

export const institutionById: ReadonlyMap<InstitutionId, Institution> = new Map(
  institutions.map((institution) => [institution.id, institution]),
);

export const placeById: ReadonlyMap<PlaceId, Place> = new Map(
  places.map((place) => [place.id, place]),
);

/** A fresh state object suitable for a tale's local reading-progress record. */
export const createReadingState = (overrides: Partial<ReadingState> = {}): ReadingState => ({
  status: "unread",
  note: "",
  favorite: false,
  ...overrides,
});

const joinFigureNames = (tale: Tale): string =>
  tale.figures
    .map((id) => figureById.get(id)?.name)
    .filter((name): name is string => Boolean(name))
    .join(" ");

const joinMotifLabels = (tale: Tale): string =>
  tale.motifs
    .map((id) => motifById.get(id)?.label)
    .filter((label): label is string => Boolean(label))
    .join(" ");

const joinTermLabels = (tale: Tale): string =>
  tale.terms
    .map((id) => glossaryById.get(id)?.label)
    .filter((label): label is string => Boolean(label))
    .join(" ");

export const searchIndex: readonly SearchRecord[] = [
  ...registers.map(
    (register): SearchRecord => ({
      id: `register:${register.id}`,
      kind: "register",
      label: register.title,
      subtitle: `Register ${register.index} / ${register.category}`,
      text: [
        register.id,
        register.mark,
        register.thesis,
        register.tone,
        register.category,
        register.socialField,
        ...register.form,
      ].join(" "),
      registerId: register.id,
    }),
  ),
  ...tales.map(
    (tale: Tale): SearchRecord => ({
      id: `tale:${tale.id}`,
      kind: "tale",
      label: tale.title,
      subtitle: tale.variantTitle ?? registerById.get(tale.registerId)?.title ?? "Representative tale",
      text: [
        tale.id,
        tale.variantTitle,
        tale.form,
        ...tale.entity,
        tale.socialPressure,
        tale.locus.label,
        tale.summary,
        tale.disclosure,
        joinFigureNames(tale),
        joinMotifLabels(tale),
        joinTermLabels(tale),
        ...tale.prompts,
      ]
        .filter((part): part is string => Boolean(part))
        .join(" "),
      registerId: tale.registerId,
      taleId: tale.id,
    }),
  ),
  ...figures.map(
    (figure): SearchRecord => ({
      id: `figure:${figure.id}`,
      kind: "figure",
      label: figure.name,
      subtitle: figure.role,
      text: [figure.id, figure.kind, figure.role, figure.summary].join(" "),
      taleId: figure.taleIds[0],
      registerId: figure.taleIds[0] ? taleById.get(figure.taleIds[0])?.registerId : undefined,
    }),
  ),
  ...motifs.map(
    (motif): SearchRecord => ({
      id: `motif:${motif.id}`,
      kind: "motif",
      label: motif.label,
      subtitle: `${motif.taleIds.length} representative tale${motif.taleIds.length === 1 ? "" : "s"}`,
      text: [motif.id, motif.summary].join(" "),
      taleId: motif.taleIds[0],
    }),
  ),
  ...glossary.map(
    (term): SearchRecord => ({
      id: `term:${term.id}`,
      kind: "term",
      label: term.label,
      subtitle: term.category,
      text: [term.id, term.definition, term.usageNote].filter(Boolean).join(" "),
      taleId: term.taleIds[0],
    }),
  ),
  ...institutions.map(
    (institution): SearchRecord => ({
      id: `institution:${institution.id}`,
      kind: "institution",
      label: institution.name,
      subtitle: "Institution or social structure",
      text: [institution.id, institution.pressure].join(" "),
      taleId: institution.taleIds[0],
    }),
  ),
  ...places.map(
    (place): SearchRecord => ({
      id: `place:${place.id}`,
      kind: "place",
      label: place.name,
      subtitle: place.kind,
      text: [place.id, place.kind, place.summary].join(" "),
      taleId: place.taleIds[0],
    }),
  ),
];

const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const scoreRecord = (record: SearchRecord, normalizedQuery: string, tokens: readonly string[]): number => {
  const label = normalizeSearchText(record.label);
  const subtitle = normalizeSearchText(record.subtitle);
  const body = normalizeSearchText(record.text);
  const haystack = `${label} ${subtitle} ${body}`;

  if (!tokens.every((token) => haystack.includes(token))) return -1;

  let score = 0;
  if (label === normalizedQuery) score += 100;
  if (label.startsWith(normalizedQuery)) score += 55;
  if (label.includes(normalizedQuery)) score += 30;
  if (subtitle.includes(normalizedQuery)) score += 12;
  if (body.includes(normalizedQuery)) score += 8;
  for (const token of tokens) {
    if (label.split(" ").some((word) => word.startsWith(token))) score += 6;
    else if (label.includes(token)) score += 3;
    if (subtitle.includes(token)) score += 1;
  }
  return score;
};

/** Searches every editorial record. All query tokens must occur; strongest label matches rank first. */
export const searchRecords = (query: string): readonly SearchRecord[] => {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return [];
  const tokens = normalizedQuery.split(/\s+/);

  return searchIndex
    .map((record, order) => ({ record, order, score: scoreRecord(record, normalizedQuery, tokens) }))
    .filter((result) => result.score >= 0)
    .sort((left, right) => right.score - left.score || left.order - right.order)
    .map(({ record }) => record);
};

const duplicateIds = <T extends { readonly id: string }>(records: readonly T[]): readonly string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const record of records) {
    if (seen.has(record.id)) duplicates.add(record.id);
    seen.add(record.id);
  }
  return [...duplicates];
};

/** Returns actionable catalog errors without throwing during module import. */
export const validateCatalog = (): readonly string[] => {
  const errors: string[] = [];
  const taleAssignments = new Map<TaleId, number>();

  if (registers.length !== 15) errors.push(`Expected 15 registers; found ${registers.length}.`);
  if (tales.length !== 30) errors.push(`Expected 30 tales; found ${tales.length}.`);

  const registerDuplicates = duplicateIds(registers);
  const taleDuplicates = duplicateIds(tales);
  const figureDuplicates = duplicateIds(figures);
  if (registerDuplicates.length) errors.push(`Duplicate register ids: ${registerDuplicates.join(", ")}.`);
  if (taleDuplicates.length) errors.push(`Duplicate tale ids: ${taleDuplicates.join(", ")}.`);
  if (figureDuplicates.length) errors.push(`Duplicate figure ids: ${figureDuplicates.join(", ")}.`);

  const indexes = [...registers.map((register) => register.index)].sort((a, b) => a - b);
  if (indexes.some((index, position) => index !== position + 1)) {
    errors.push(`Register indexes must be exactly 1 through 15; found ${indexes.join(", ")}.`);
  }

  for (const register of registers) {
    if (!/^[\x20-\x7e]+$/.test(register.mark)) {
      errors.push(`Register ${register.id} has a non-ASCII mark.`);
    }
    if (register.taleIds.length !== 2) {
      errors.push(`Register ${register.id} must contain exactly two representative tales.`);
    }
    for (const taleId of register.taleIds) {
      taleAssignments.set(taleId, (taleAssignments.get(taleId) ?? 0) + 1);
      const tale = taleById.get(taleId);
      if (!tale) errors.push(`Register ${register.id} references missing tale ${taleId}.`);
      else if (tale.registerId !== register.id) {
        errors.push(`Tale ${tale.id} declares ${tale.registerId} but is assigned to ${register.id}.`);
      }
    }
  }

  for (const tale of tales) {
    if ((taleAssignments.get(tale.id) ?? 0) !== 1) {
      errors.push(`Tale ${tale.id} must be assigned to exactly one register.`);
    }
    if (tale.reading.storageKey !== `liaozhai:tale:${tale.id}`) {
      errors.push(`Tale ${tale.id} has a mismatched reading storage key.`);
    }
    for (const figureId of tale.figures) {
      const figure = figureById.get(figureId);
      if (!figure) errors.push(`Tale ${tale.id} references missing figure ${figureId}.`);
      else if (!figure.taleIds.includes(tale.id)) errors.push(`Figure ${figureId} omits tale ${tale.id}.`);
    }
    for (const motifId of tale.motifs) {
      if (!motifById.has(motifId)) errors.push(`Tale ${tale.id} references missing motif ${motifId}.`);
    }
    for (const termId of tale.terms) {
      if (!glossaryById.has(termId)) errors.push(`Tale ${tale.id} references missing term ${termId}.`);
    }
    for (const institutionId of tale.institutions) {
      if (!institutionById.has(institutionId)) {
        errors.push(`Tale ${tale.id} references missing institution ${institutionId}.`);
      }
    }
    for (const placeId of tale.locus.placeIds) {
      if (!placeById.has(placeId)) errors.push(`Tale ${tale.id} references missing place ${placeId}.`);
    }
    for (const adjacentId of tale.adjacentTaleIds) {
      if (adjacentId === tale.id) errors.push(`Tale ${tale.id} is adjacent to itself.`);
      if (!taleById.has(adjacentId)) errors.push(`Tale ${tale.id} references missing adjacent tale ${adjacentId}.`);
    }
  }

  for (const relation of relationEdges) {
    if (relation.source === relation.target) errors.push(`Relation ${relation.id} is self-referential.`);
    if (!taleById.has(relation.source)) errors.push(`Relation ${relation.id} has missing source ${relation.source}.`);
    if (!taleById.has(relation.target)) errors.push(`Relation ${relation.id} has missing target ${relation.target}.`);
  }

  return errors;
};

export const catalogDiagnostics = validateCatalog();

export const assertCatalogIntegrity = (): void => {
  if (catalogDiagnostics.length) {
    throw new Error(`Pu Songling catalog validation failed:\n${catalogDiagnostics.join("\n")}`);
  }
};
