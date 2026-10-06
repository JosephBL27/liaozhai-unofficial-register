import type { GlossaryTerm, GlossaryTermId } from "../types";
import { tales } from "./tales";

const glossarySeeds = [
  { id: "liaozhai", label: "Liaozhai", category: "collection", definition: "A common short name for Pu Songling's collection of accounts and crafted tales of the strange.", usageNote: "English titles for the collection vary; this companion does not declare one translation definitive." },
  { id: "zhiguai", label: "Record of the strange", category: "genre", definition: "A broad label for concise accounts that record anomalies, spirits, marvels, and unusual events.", usageNote: "The collection mixes and transforms modes; the label should not be treated as a rigid bin." },
  { id: "chuanqi", label: "Tale of marvels", category: "genre", definition: "A broad narrative mode associated with developed plots, literary characterization, romance, and extraordinary events.", usageNote: "A single Liaozhai tale may draw on both compact record and elaborated tale traditions." },
  { id: "fox-spirit", label: "Fox spirit", category: "being", definition: "A cultivated or transforming fox being whose motives may include kinship, desire, study, healing, mischief, or predation.", usageNote: "Foxes in the collection are not one moral species and should not be reduced to seduction." },
  { id: "ghost", label: "Ghost", category: "being", definition: "A dead person's continuing presence, often shaped by burial, violent death, desire, debt, or unfinished duty." },
  { id: "spirit-substitute", label: "Spirit substitute", category: "practice", definition: "The belief within some tales that a person who died violently may leave that condition when another suffers a corresponding death." },
  { id: "rebirth", label: "Rebirth", category: "practice", definition: "Return to embodied existence in another life or form, sometimes administered by the underworld and sometimes refused." },
  { id: "underworld-court", label: "Underworld court", category: "institution", definition: "An afterlife tribunal represented through offices, judges, clerks, guards, petitions, records, and punishments recognizable from earthly administration." },
  { id: "city-god", label: "City God", category: "office", definition: "A local divine office imagined as protecting and administrating a territorial community, including in the world of the dead." },
  { id: "magistrate", label: "Magistrate", category: "office", definition: "A local official with administrative and judicial authority whose yamen connected households to the state." },
  { id: "yamen", label: "Yamen", category: "institution", definition: "An official's administrative compound and staff, including clerks, runners, guards, and judicial spaces." },
  { id: "civil-examinations", label: "Civil examinations", category: "institution", definition: "The competitive examination system through which mastery of prescribed literary forms could confer degrees and eligibility for office." },
  { id: "degree-holder", label: "Degree-holder", category: "office", definition: "A scholar who has passed a level of the examination system; translations of individual ranks vary." },
  { id: "examination-essay", label: "Examination essay", category: "practice", definition: "Highly regulated prose written for evaluation within the civil examination system." },
  { id: "imperial-tribute", label: "Imperial tribute", category: "institution", definition: "Goods presented upward through official channels; a court demand could generate uncompensated local extraction." },
  { id: "filial-piety", label: "Filial duty", category: "value", definition: "Obligations of care, respect, mourning, and continuity binding children and parents across life and death." },
  { id: "ancestral-rites", label: "Ancestral and mortuary rites", category: "practice", definition: "Burial, mourning, offerings, grave visits, and household observances that maintain relations with the dead." },
  { id: "marriage-go-between", label: "Marriage go-between", category: "office", definition: "An intermediary who carries proposals and helps families negotiate the formal and material conditions of a match." },
  { id: "patrilineal-household", label: "Patrilineal household", category: "institution", definition: "A domestic and lineage structure in which marriage, heirs, service, property, and ancestral continuity are organized around the male line." },
  { id: "taoist-priest", label: "Taoist priest", category: "office", definition: "A religious specialist associated in these tales with ritual, talismans, exorcism, cultivation, healing, and techniques of transformation.", usageNote: "The tales often use popular and literary representations rather than doctrinal description." },
  { id: "buddhist-monk", label: "Buddhist monk", category: "office", definition: "A monastic specialist whose discipline may include celibacy, restricted diet, recitation, teaching, and temple life." },
  { id: "talisman", label: "Talisman", category: "practice", definition: "A written, carried, burned, or displayed ritual object used to direct protective or exorcistic efficacy." },
  { id: "dragon-king", label: "Dragon King", category: "office", definition: "A sovereign associated with waters and an aquatic court, family, officials, and stores of numinous power." },
  { id: "local-cult", label: "Local cult", category: "institution", definition: "Community worship centered on a territorially specific deity or efficacious dead figure, often maintained through a shrine and offerings." },
  { id: "market-exchange", label: "Market exchange", category: "institution", definition: "The movement of goods, money, credit, labor, and reputation through markets, trade routes, and household economies." },
  { id: "literati", label: "Literati", category: "institution", definition: "Educated writers and degree-seekers whose social identity was shaped by textual cultivation, examination, teaching, and office." },
  { id: "karmic-retribution", label: "Karmic retribution", category: "value", definition: "Consequences represented as carrying moral action across time, death, judgment, or rebirth." },
] as const satisfies readonly Omit<GlossaryTerm, "taleIds">[];

export const glossary: readonly GlossaryTerm[] = glossarySeeds.map((term) => ({
  ...term,
  taleIds: tales
    .filter((tale) => (tale.terms as readonly GlossaryTermId[]).includes(term.id))
    .map((tale) => tale.id),
}));

