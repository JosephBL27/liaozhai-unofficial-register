import type { Motif, MotifId } from "../types";
import { tales } from "./tales";

const motifSeeds = [
  { id: "threshold-crossing", label: "Crossing a threshold", summary: "A road, temple, wall, river, dream, or death-boundary admits a figure into another jurisdiction." },
  { id: "fox-kinship", label: "Fox kinship", summary: "Fox identity becomes a family relation organized by teaching, care, hospitality, marriage, or inheritance." },
  { id: "burial-and-return", label: "Burial and return", summary: "Bones, graves, and funerary attention give an unquiet dead person a changed relation to the living." },
  { id: "spirit-substitution", label: "Spirit substitution", summary: "A violently dead spirit is offered release through another death, turning rebirth into an ethical problem." },
  { id: "deceptive-surface", label: "Deceptive surface", summary: "Skin, appearance, painting, performance, or spectacle makes perception active in a deception." },
  { id: "body-exchange", label: "Body exchange", summary: "A heart, head, body, species, or state of incarnation crosses the boundary of personal identity." },
  { id: "dream-verdict", label: "Dream verdict", summary: "A dream does not merely predict; it judges an appetite, office, relationship, or possible life." },
  { id: "official-corruption", label: "Official corruption", summary: "Rank directs attention upward while bribery, extraction, or delegated violence travels downward." },
  { id: "examination-failure", label: "Examination failure", summary: "Literary ability and institutional selection diverge, producing obsession, satire, and alternative judgments." },
  { id: "animated-text", label: "Animated text", summary: "Reading makes a literary figure bodily present and tests the reader's ability to distinguish figure from instruction." },
  { id: "coerced-tribute", label: "Coerced tribute", summary: "A luxury demanded above becomes compulsory labor, expense, and danger below." },
  { id: "petition-and-appeal", label: "Petition and appeal", summary: "A vulnerable petitioner forces an institution to hear a claim it is structured to dismiss." },
  { id: "marriage-bargain", label: "Marriage bargain", summary: "Desire must pass through family negotiation, ritual procedure, status, disclosure, and material exchange." },
  { id: "double-marriage", label: "Double marriage", summary: "Two claims on one household are resolved through timing and female negotiation rather than the expected rivalry." },
  { id: "healing-and-depletion", label: "Healing and depletion", summary: "Intimacy is registered through pulse, illness, medicine, nourishment, and the unequal transfer of vitality." },
  { id: "gratitude-repaid", label: "Gratitude repaid", summary: "A small act of hospitality, mercy, or protection returns in another form and another jurisdiction." },
  { id: "cross-species-friendship", label: "Friendship beyond kind", summary: "Reciprocity joins human and nonhuman lives without making species difference disappear." },
  { id: "animal-testimony", label: "Animal testimony", summary: "An animal communicates through conduct, submission, evidence, or mourning rather than human speech." },
  { id: "discipline-versus-display", label: "Discipline and display", summary: "Spectacular efficacy attracts attention while repeated practice and ethical discipline remain harder to see." },
  { id: "soul-and-body", label: "Soul and body", summary: "Memory, vocation, appearance, and social obligation offer competing tests of who inhabits a body." },
  { id: "living-image", label: "Living image", summary: "A represented figure enters ordinary space, or a viewer enters the represented world." },
  { id: "circulating-wealth", label: "Circulating wealth", summary: "Money, food, or property produces value through movement and becomes unstable when immobilized." },
  { id: "filial-duty", label: "Filial duty", summary: "Care for a parent or continuity of the household motivates action across law, species, and death." },
  { id: "female-redress", label: "Female redress", summary: "A woman or feminized supernatural figure constructs an account outside ordinary channels of authority." },
  { id: "altered-sight", label: "Altered sight", summary: "Blindness, doubled vision, inversion, or a changed image exposes the ethics of looking." },
  { id: "reversed-values", label: "Reversed values", summary: "Another world makes familiar standards of beauty, status, merit, or monstrosity appear contingent." },
] as const satisfies readonly Omit<Motif, "taleIds">[];

export const motifs: readonly Motif[] = motifSeeds.map((motif) => ({
  ...motif,
  taleIds: tales
    .filter((tale) => (tale.motifs as readonly MotifId[]).includes(motif.id))
    .map((tale) => tale.id),
}));

