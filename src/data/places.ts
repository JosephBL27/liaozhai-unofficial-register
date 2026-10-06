import type { Place, PlaceId } from "../types";
import { tales } from "./tales";

const placeSeeds = [
  { id: "shandong-village", name: "Shandong village world", kind: "regional", summary: "The collection's recurring north-China social ground of households, fields, roads, temples, and local offices." },
  { id: "scholar-garden-house", name: "Scholar's house and garden", kind: "domestic", summary: "A study and household whose walls contain reading, courtship, visiting spirits, family duty, and hidden gardens." },
  { id: "abandoned-temple", name: "Abandoned temple", kind: "religious", summary: "A neglected religious compound that shelters travelers and gives predatory spirits access to the road." },
  { id: "hunan-road", name: "Provincial road", kind: "regional", summary: "A route between households where tea shelters, money, messengers, and unexpected beings redirect travel." },
  { id: "market-town-house", name: "Market-town household", kind: "domestic", summary: "A domestic enclosure close to commercial traffic, exposed to rumor, visitors, and official attention." },
  { id: "underworld-courts", name: "Underworld courts", kind: "otherworld", summary: "Layered tribunals, prisons, roads, and records that mirror earthly administration after death." },
  { id: "temple-and-dream", name: "Temple and dream threshold", kind: "religious", summary: "A religious stopping place where sleep, divination, literary judgment, and moral vision overlap." },
  { id: "district-yamen", name: "District yamen", kind: "official", summary: "The local official compound where petitions, punishment, clerical work, and delegated enforcement meet." },
  { id: "river-boats", name: "River boats and banks", kind: "aquatic", summary: "Mobile domestic and commercial spaces where class, courtship, danger, and rescue remain difficult to read." },
  { id: "dongting-lake", name: "Dongting Lake", kind: "aquatic", summary: "A large inland water world whose storms and hidden court connect travel, rescue, and aquatic sovereignty." },
  { id: "riverbank-shrine", name: "Riverbank and village shrine", kind: "religious", summary: "A fishing ground or hill margin where repeated conduct becomes a remembered local cult." },
  { id: "laoshan", name: "Laoshan retreat", kind: "religious", summary: "A mountain site of demanding apprenticeship, cultivated adepts, and spectacular technique." },
  { id: "changqing-monastery", name: "Changqing monastery", kind: "religious", summary: "A monastic home whose routine and memories become evidence of identity across bodies." },
  { id: "monastery-mural", name: "Monastery mural", kind: "artwork", summary: "A painted religious wall that operates as image, social world, and permeable boundary." },
  { id: "painted-scroll", name: "Painted scroll", kind: "artwork", summary: "A portable image whose represented animal can enter roads, gardens, and systems of property." },
  { id: "marketplace", name: "Marketplace", kind: "commercial", summary: "A public field of pricing, performance, spectatorship, and improvised judgment." },
  { id: "jinling-neighborhood", name: "Jinling neighborhood", kind: "domestic", summary: "Adjacent poor households in which care, secrecy, work, desire, and disappearance cross the street." },
  { id: "luocha-and-sea-court", name: "Luocha country and aquatic courts", kind: "otherworld", summary: "Estranging political and marine worlds where the standards of appearance, talent, trade, and kinship are re-sorted." },
] as const satisfies readonly Omit<Place, "taleIds">[];

export const places: readonly Place[] = placeSeeds.map((place) => ({
  ...place,
  taleIds: tales
    .filter((tale) => (tale.locus.placeIds as readonly PlaceId[]).includes(place.id))
    .map((tale) => tale.id),
}));
