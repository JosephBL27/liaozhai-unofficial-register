import type { Institution, InstitutionId } from "../types";
import { tales } from "./tales";

const institutionSeeds = [
  { id: "patrilineal-household", name: "Patrilineal household", pressure: "Marriage, heirs, service, property, and burial duties make the household both refuge and disciplinary institution." },
  { id: "marriage-brokerage", name: "Marriage brokerage", pressure: "Family consent, go-betweens, contracts, gifts, status, and timing mediate private desire." },
  { id: "civil-examination-system", name: "Civil examination system", pressure: "Literary ranking offers status and office while producing failure, obsession, resentment, and dependence on examiners." },
  { id: "district-yamen", name: "District yamen", pressure: "Local administration concentrates legal authority in a magistrate and an underpaid staff with many opportunities for coercion." },
  { id: "imperial-tribute-chain", name: "Imperial tribute chain", pressure: "A valued court object becomes an uncompensated levy as each official transfers demand to those below." },
  { id: "underworld-judiciary", name: "Underworld judiciary", pressure: "Afterlife offices reproduce petitions, records, bribery, punishment, and escalation familiar from earthly courts." },
  { id: "buddhist-monastery", name: "Buddhist monastery", pressure: "Monastic space offers shelter and discipline but also becomes a threshold where lay desire meets other jurisdictions." },
  { id: "taoist-practice", name: "Taoist ritual and cultivation", pressure: "Technique is inseparable from apprenticeship, conduct, ritual authority, and popular expectations of visible efficacy." },
  { id: "mortuary-rites", name: "Mortuary and ancestral rites", pressure: "Proper burial, mourning, offerings, and grave care determine whether the dead remain abandoned or socially held." },
  { id: "local-cult", name: "Local cult", pressure: "Private efficacy becomes a public, territorial relation maintained by shrine, reputation, and communal offerings." },
  { id: "market-exchange", name: "Market exchange", pressure: "Scarcity and circulation organize encounters among sellers, travelers, servants, specialists, and patrons." },
  { id: "elite-patronage", name: "Elite patronage", pressure: "Tutoring, secretarial work, gifts, and court purchase can support talent while making it dependent on rank." },
  { id: "medical-practice", name: "Medical practice", pressure: "Diagnosis and healing expose access to bodies, unequal knowledge, and the line between care and transformation." },
  { id: "dragon-court", name: "Aquatic dragon court", pressure: "An otherworldly monarchy binds gratitude, marriage, family, literary recognition, and territorial power." },
  { id: "royal-court", name: "Royal court", pressure: "Access to a ruler converts taste and performance into office, privilege, exposure, or disgrace." },
  { id: "carceral-system", name: "Carceral system", pressure: "Prison and official custody place families under financial, bodily, and procedural pressure." },
] as const satisfies readonly Omit<Institution, "taleIds">[];

export const institutions: readonly Institution[] = institutionSeeds.map((institution) => ({
  ...institution,
  taleIds: tales
    .filter((tale) => (tale.institutions as readonly InstitutionId[]).includes(institution.id))
    .map((tale) => tale.id),
}));

