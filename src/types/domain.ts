export type RegisterId =
  | "fox-kinships"
  | "unquiet-dead"
  | "borrowed-bodies"
  | "dream-judgments"
  | "examination-appetites"
  | "bureaucratic-pressure"
  | "marriage-negotiations"
  | "desire-recognition"
  | "other-than-human-friends"
  | "animal-agency"
  | "religious-specialists"
  | "porous-images"
  | "wealth-circulation"
  | "revenge-redress"
  | "strange-perception";

export type TaleId =
  | "yingning"
  | "jiaona"
  | "nie-xiaoqian"
  | "shui-mang"
  | "painted-skin"
  | "judge-lu"
  | "yellow-millet"
  | "wolf-dream"
  | "smelling-essays"
  | "bookworm"
  | "fighting-cricket"
  | "xi-fangping"
  | "boat-girl-bride"
  | "two-brides"
  | "lianxiang"
  | "dongting-princess"
  | "fisherman-friend"
  | "boon-companion"
  | "faithful-dog"
  | "tiger-zhaocheng"
  | "laoshan-priest"
  | "changqing-monk"
  | "painted-wall"
  | "picture-horse"
  | "planting-pear"
  | "stream-of-cash"
  | "magnanimous-girl"
  | "butterfly-revenge"
  | "talking-pupils"
  | "luocha-sea-market";

/** Figure ids are namespaced to the representative tale that introduces them. */
export type FigureId = `${TaleId}:${string}`;

export type MotifId =
  | "threshold-crossing"
  | "fox-kinship"
  | "burial-and-return"
  | "spirit-substitution"
  | "deceptive-surface"
  | "body-exchange"
  | "dream-verdict"
  | "official-corruption"
  | "examination-failure"
  | "animated-text"
  | "coerced-tribute"
  | "petition-and-appeal"
  | "marriage-bargain"
  | "double-marriage"
  | "healing-and-depletion"
  | "gratitude-repaid"
  | "cross-species-friendship"
  | "animal-testimony"
  | "discipline-versus-display"
  | "soul-and-body"
  | "living-image"
  | "circulating-wealth"
  | "filial-duty"
  | "female-redress"
  | "altered-sight"
  | "reversed-values";

export type GlossaryTermId =
  | "liaozhai"
  | "zhiguai"
  | "chuanqi"
  | "fox-spirit"
  | "ghost"
  | "spirit-substitute"
  | "rebirth"
  | "underworld-court"
  | "city-god"
  | "magistrate"
  | "yamen"
  | "civil-examinations"
  | "degree-holder"
  | "examination-essay"
  | "imperial-tribute"
  | "filial-piety"
  | "ancestral-rites"
  | "marriage-go-between"
  | "patrilineal-household"
  | "taoist-priest"
  | "buddhist-monk"
  | "talisman"
  | "dragon-king"
  | "local-cult"
  | "market-exchange"
  | "literati"
  | "karmic-retribution";

export type InstitutionId =
  | "patrilineal-household"
  | "marriage-brokerage"
  | "civil-examination-system"
  | "district-yamen"
  | "imperial-tribute-chain"
  | "underworld-judiciary"
  | "buddhist-monastery"
  | "taoist-practice"
  | "mortuary-rites"
  | "local-cult"
  | "market-exchange"
  | "elite-patronage"
  | "medical-practice"
  | "dragon-court"
  | "royal-court"
  | "carceral-system";

export type PlaceId =
  | "shandong-village"
  | "scholar-garden-house"
  | "abandoned-temple"
  | "hunan-road"
  | "market-town-house"
  | "underworld-courts"
  | "temple-and-dream"
  | "district-yamen"
  | "river-boats"
  | "dongting-lake"
  | "riverbank-shrine"
  | "laoshan"
  | "changqing-monastery"
  | "monastery-mural"
  | "painted-scroll"
  | "marketplace"
  | "jinling-neighborhood"
  | "luocha-and-sea-court";

export type NarrativeForm =
  | "romance"
  | "encounter"
  | "satire"
  | "dream-vision"
  | "courtroom-tale"
  | "transformation-tale"
  | "marvel-record"
  | "moral-fable"
  | "travel-tale"
  | "revenge-tale"
  | "friendship-tale"
  | "household-tale";

export type SupernaturalEntity =
  | "none-explicit"
  | "fox-spirit"
  | "ghost"
  | "demon"
  | "underworld-official"
  | "transformed-human"
  | "immortal"
  | "numinous-animal"
  | "dragon-court"
  | "animated-image"
  | "dream-figure";

export type ReadingStatus = "unread" | "reading" | "read";

export interface ReadingState {
  readonly status: ReadingStatus;
  readonly note: string;
  readonly favorite: boolean;
  readonly updatedAt?: string;
}

export interface ReadingMetadata {
  readonly defaultStatus: "unread";
  readonly storageKey: `liaozhai:tale:${TaleId}`;
  readonly supportsNotes: true;
  readonly supportsFavorite: true;
}

export interface EditorialMetadata {
  readonly selection: "representative";
  readonly summary: "editorial-paraphrase";
  readonly sequence: "thematic-not-source-order";
}

export interface Register {
  readonly id: RegisterId;
  readonly index: number;
  readonly title: string;
  /** Short, Chinese-free UI mark. */
  readonly mark: string;
  readonly thesis: string;
  readonly tone: string;
  readonly category: string;
  readonly socialField: string;
  readonly form: readonly NarrativeForm[];
  readonly taleIds: readonly [TaleId, TaleId];
  readonly editorial: true;
}

export interface Tale {
  readonly id: TaleId;
  /** A working English label, not a claim about a preferred translation. */
  readonly title: string;
  readonly variantTitle?: string;
  readonly titleStatus: "working-english";
  readonly registerId: RegisterId;
  readonly form: NarrativeForm;
  readonly entity: readonly SupernaturalEntity[];
  readonly institutions: readonly InstitutionId[];
  readonly socialPressure: string;
  readonly locus: {
    readonly label: string;
    readonly placeIds: readonly PlaceId[];
  };
  readonly summary: string;
  readonly disclosure: string;
  readonly figures: readonly FigureId[];
  readonly motifs: readonly MotifId[];
  readonly terms: readonly GlossaryTermId[];
  readonly prompts: readonly [string, string, ...string[]];
  readonly adjacentTaleIds: readonly TaleId[];
  readonly reading: ReadingMetadata;
  readonly editorial: EditorialMetadata;
}

export interface Figure {
  readonly id: FigureId;
  readonly name: string;
  readonly kind: "human" | "fox" | "ghost" | "deity" | "animal" | "spirit" | "uncertain";
  readonly role: string;
  readonly summary: string;
  readonly taleIds: readonly TaleId[];
}

export interface Motif {
  readonly id: MotifId;
  readonly label: string;
  readonly summary: string;
  readonly taleIds: readonly TaleId[];
}

export interface GlossaryTerm {
  readonly id: GlossaryTermId;
  readonly label: string;
  readonly category: "collection" | "genre" | "being" | "institution" | "office" | "practice" | "value";
  readonly definition: string;
  readonly usageNote?: string;
  readonly taleIds: readonly TaleId[];
}

export interface Institution {
  readonly id: InstitutionId;
  readonly name: string;
  readonly pressure: string;
  readonly taleIds: readonly TaleId[];
}

export interface Place {
  readonly id: PlaceId;
  readonly name: string;
  readonly kind: "domestic" | "religious" | "official" | "commercial" | "aquatic" | "otherworld" | "regional" | "artwork";
  readonly summary: string;
  readonly taleIds: readonly TaleId[];
}

export type RelationKind =
  | "direct-sequel"
  | "shared-figure-type"
  | "shared-motif"
  | "institutional-echo"
  | "formal-echo"
  | "ethical-contrast"
  | "setting-echo";

export interface RelationEdge {
  readonly id: `edge:${string}`;
  readonly source: TaleId;
  readonly target: TaleId;
  readonly kind: RelationKind;
  readonly label: string;
  readonly rationale: string;
}

export type SearchRecordKind = "register" | "tale" | "figure" | "motif" | "term" | "institution" | "place";

export interface SearchRecord {
  readonly id: string;
  readonly kind: SearchRecordKind;
  readonly label: string;
  readonly subtitle: string;
  readonly text: string;
  readonly registerId?: RegisterId;
  readonly taleId?: TaleId;
}

export interface DatasetNotice {
  readonly route: string;
  readonly titles: string;
  readonly summaries: string;
  readonly precision: string;
}
