import type { Figure, FigureId, TaleId } from "../types";

const figure = (
  taleId: TaleId,
  slug: string,
  name: string,
  kind: Figure["kind"],
  role: string,
  summary: string,
): Figure => ({
  id: `${taleId}:${slug}` as FigureId,
  name,
  kind,
  role,
  summary,
  taleIds: [taleId],
});

export const figures = [
  figure("yingning", "yingning", "Yingning", "fox", "laughing bride and daughter of a fox", "Her delight in flowers and laughter sustains a household until public accusation makes her disclose the ghostly care behind her upbringing."),
  figure("yingning", "wang-zifu", "Wang Zifu", "human", "scholar, suitor, and husband", "He turns a festival glimpse into a search, then accepts burial duties that join Yingning's hidden family to his own."),
  figure("yingning", "ghost-mother", "Yingning's foster mother", "ghost", "guardian and unburied dead", "She raises Yingning outside ordinary kinship and later asks, through Yingning, for burial and remembrance."),

  figure("jiaona", "jiaona", "Jiaona", "fox", "healer and reciprocal protector", "Her medical intervention saves Kong, and her later bond with him exceeds the marriage plot that surrounds her family."),
  figure("jiaona", "kong-xueli", "Kong Xueli", "human", "stranded scholar and tutor", "He enters a fox household through teaching and later repays its hospitality by sheltering the family."),
  figure("jiaona", "huangfu", "Huangfu", "fox", "student, host, and fox kinsman", "He recruits Kong as tutor, introduces him to the household, and makes scholarly friendship a route into fox kinship."),

  figure("nie-xiaoqian", "nie-xiaoqian", "Nie Xiaoqian", "ghost", "coerced ghost and later household member", "Forced to lure travelers, she risks disclosure, requests reburial, and gradually builds a life beyond the demon's command."),
  figure("nie-xiaoqian", "ning-caichen", "Ning Caichen", "human", "traveler and ethical ally", "His refusal of seduction and false wealth makes him a possible protector, but protection expands into burial and domestic obligation."),
  figure("nie-xiaoqian", "yan-chixia", "Yan Chixia", "human", "Taoist swordsman", "A guarded traveler whose sword case can contain hostile spirits and whose presence makes the abandoned temple temporarily safer."),

  figure("shui-mang", "chu", "Chu", "ghost", "poisoned traveler, son, and reformer", "After death he returns to care for his mother and refuses to buy rebirth by passing the poison to another victim."),
  figure("shui-mang", "sanniang", "Sanniang", "ghost", "poisoner, wife, and fellow dead", "Initially trapped in the substitution system, she becomes part of Chu's ghost household and shares its duties."),
  figure("shui-mang", "chu-mother", "Chu's mother", "human", "bereaved mother and household center", "Her grief draws Chu home and makes ongoing care, rather than rebirth, the dead couple's chosen work."),

  figure("painted-skin", "wang", "Wang", "human", "desiring householder", "He shelters a disguised being, dismisses warnings, and leaves others to repair the violence produced by his misrecognition."),
  figure("painted-skin", "wang-wife", "Wang's wife", "human", "petitioner and restorer", "She pursues help after Wang's death and accepts a humiliating cure that restores his missing heart."),
  figure("painted-skin", "painted-demon", "The painted-skin demon", "spirit", "predator in a fabricated human surface", "Its painted disguise converts Wang's habits of looking into access to his household."),
  figure("painted-skin", "taoist-priest", "The Taoist priest", "human", "warning specialist and exorcist", "He identifies danger before Wang believes it and later contains the creature after its attack."),

  figure("judge-lu", "judge-lu", "Judge Lu", "deity", "underworld judge and surgeon", "His friendship with Zhu lets him treat hearts and heads as exchangeable means to earthly advancement."),
  figure("judge-lu", "zhu-erdan", "Zhu Erdan", "human", "student and beneficiary", "He welcomes an underworld official into convivial friendship and accepts bodily improvement without controlling its sources."),
  figure("judge-lu", "zhu-wife", "Zhu's wife", "human", "subject of an unsolicited transformation", "Her altered appearance fulfills Zhu's wish while making consent and bodily ownership unavoidable questions."),

  figure("yellow-millet", "zeng", "Zeng", "human", "successful candidate and dream official", "A flattering prediction expands his ambition into a complete career of patronage, coercion, fall, and punishment."),
  figure("yellow-millet", "old-monk", "The old monk", "human", "silent host and dream guide", "His presence frames the career vision and his closing judgment redirects Zeng from rank toward cultivation."),
  figure("yellow-millet", "infernal-king", "The infernal king", "deity", "judge of the dream career", "He reads Zeng's official appetites as a record of injuries that the afterlife makes bodily."),

  figure("wolf-dream", "old-pai", "Old Pai", "human", "father and dream witness", "He sees his son's administration in animal form, warns him, and later asks that punishment spare the innocent household."),
  figure("wolf-dream", "pai-jia", "Pai Jia", "human", "corrupt magistrate", "He treats superiors as the only audience that matters and regards predatory subordinates as the ordinary machinery of office."),
  figure("wolf-dream", "ting", "Ting", "spirit", "infernal arrest agent and guide", "His ambiguous visit gives Old Pai access to the dream jurisdiction where public corruption becomes visible."),

  figure("smelling-essays", "blind-priest", "The blind priest", "human", "unofficial literary judge", "He claims no institutional power yet distinguishes prose by smelling the smoke of burned essays."),
  figure("smelling-essays", "wang-scholar", "Scholar Wang", "human", "modest examination candidate", "His essay receives the priest's qualified approval but not the examiners' institutional recognition."),
  figure("smelling-essays", "yuhang-scholar", "The Yuhang scholar", "human", "braggart and successful candidate", "His self-regard survives a comic judgment and is rewarded by the result list anyway."),

  figure("bookworm", "lang-yuzhu", "Lang Yuzhu", "human", "obsessive reader and failed candidate", "He mistakes literary promises for a program of life until a figure from his books teaches forms of attention beyond study."),
  figure("bookworm", "yan-ruyu", "Yan Ruyu", "spirit", "book spirit, teacher, and partner", "She steps out of a paper image and trains Lang in play, music, intimacy, and less possessive reading."),
  figure("bookworm", "magistrate-shi", "Magistrate Shi", "human", "suspicious official", "His investigation destroys Lang's books and turns private literary enchantment into an official grievance."),

  figure("fighting-cricket", "cheng", "Cheng", "human", "conscripted beadle and father", "Unable to pass the examinations or refuse local service, he bears the household cost of a tribute demand sent from above."),
  figure("fighting-cricket", "cheng-son", "Cheng's son", "human", "child and transformed fighter", "His accident and altered consciousness connect the replacement cricket's prowess to family sacrifice."),
  figure("fighting-cricket", "cheng-wife", "Cheng's wife", "human", "problem-solver under coercion", "She seeks divinatory help and keeps the household moving while office and grief immobilize Cheng."),

  figure("xi-fangping", "xi-fangping", "Xi Fangping", "ghost", "filial petitioner", "He leaves his body, survives repeated procedural violence, and refuses to treat coerced silence as justice."),
  figure("xi-fangping", "xi-lian", "Xi Lian", "ghost", "wronged father", "His torture after death originates the petition and exposes bribery as a system spanning earthly enmity and infernal office."),
  figure("xi-fangping", "erlang", "Erlang", "deity", "higher adjudicator", "He finally hears the case outside the compromised hierarchy and places the judges themselves on trial."),

  figure("boat-girl-bride", "meng-yun", "Meng Yun", "human", "misrecognized traveler and bride", "She insists that Wang approach her family properly and later forces his careless disclosure into a test of trust."),
  figure("boat-girl-bride", "wang", "Wang", "human", "widower, pursuer, and husband", "His desire is persistent but repeatedly distorted by class assumptions, money, and a taste for provocative speech."),
  figure("boat-girl-bride", "xu", "Mr. Xu", "human", "family connection and marriage intermediary", "He turns Wang's failed direct purchase into a procedurally legitimate proposal."),

  figure("two-brides", "chi-sheng", "Chi-sheng", "human", "young scholar and desired husband", "His lovesickness makes him the declared center of the plot even as the women and older generation control its timing."),
  figure("two-brides", "wuke", "Wuke", "human", "second desired bride and strategist", "She tests whether Chi-sheng's redirected desire is durable and chooses to enter the household despite the first bride's arrival."),
  figure("two-brides", "guixiu", "Guixiu", "human", "cousin and first desired bride", "Blocked by her father, she is carried into the wedding through her mother's counter-plan and forms an alliance with Wuke."),

  figure("lianxiang", "lianxiang", "Lianxiang", "fox", "fox lover and healer", "She reads the bodily danger Sang dismisses, treats him, and eventually develops an alliance across her rivalry with a ghost."),
  figure("lianxiang", "sang-ziming", "Sang Ziming", "human", "solitary scholar and patient", "He welcomes supernatural visitors but mistakes skepticism for fairness even as his body records unequal costs."),
  figure("lianxiang", "miss-li", "Miss Li", "ghost", "ghost lover and rival", "Her desire depletes Sang without a fully formed intention to kill; recognition and rebirth alter her bond with Lianxiang."),

  figure("dongting-princess", "chen-pijiao", "Chen Pijiao", "human", "secretary, rescuer, and lake-court bridegroom", "An act of mercy returns as protection, status, and marriage in a world he reaches only after shipwreck."),
  figure("dongting-princess", "princess", "The princess of Dongting", "spirit", "hunter, reader, and bride", "Her attraction to Chen's writing joins her mother's debt of gratitude to her own choice."),
  figure("dongting-princess", "lake-queen", "The queen of the lake", "deity", "rescued water ruler and mother", "Once wounded in animal form, she recognizes Chen and reframes his trespass as a claim of gratitude."),

  figure("fisherman-friend", "xu", "Fisherman Xu", "human", "host and enduring friend", "His habitual libations open a relation with the drowned dead, and his later journey honors friendship after Wang's promotion."),
  figure("fisherman-friend", "wang-liulang", "Wang Liulang", "ghost", "drowned helper and future local guardian", "He refuses a mother's death as the price of his rebirth and receives a public protective office instead."),
  figure("fisherman-friend", "drowning-mother", "The mother at the river", "human", "prospective substitute", "Her child makes visible that one replacement death would produce more than one loss."),

  figure("boon-companion", "che", "Che", "human", "poor scholar and drinking companion", "His welcome turns a vulnerable drunken fox into a friend whose advice creates material security."),
  figure("boon-companion", "fox-friend", "Che's fox friend", "fox", "companion and economic adviser", "He repays wine with found money and agricultural foresight, then ends the visits when the friendship's human partner dies."),

  figure("faithful-dog", "black-dog", "The black dog", "animal", "guardian and witness", "Unable to explain the dropped silver in words, it spends its life stopping, returning, and guarding."),
  figure("faithful-dog", "filial-son", "The imprisoned man's son", "human", "traveler carrying ransom money", "His urgent filial errand narrows his attention until loss teaches him how to read the dog's conduct."),

  figure("tiger-zhaocheng", "old-woman", "The old woman of Zhaocheng", "human", "mother and petitioner", "She compels the yamen to recognize her son's death, then revises her judgment as the tiger sustains and mourns her."),
  figure("tiger-zhaocheng", "tiger", "The tiger of Zhaocheng", "animal", "killer, defendant, and substitute son", "It submits to legal speech through gesture and fulfills a sentence of care rather than execution."),
  figure("tiger-zhaocheng", "li-neng", "Li Neng", "human", "runner charged with the impossible arrest", "A drunken promise becomes enforced labor until his prayer brings the tiger voluntarily into custody."),

  figure("laoshan-priest", "wang", "Wang", "human", "impatient aspirant", "He wants a portable wonder, not a practice, and converts the technique he receives into a failed household performance."),
  figure("laoshan-priest", "taoist-master", "The Laoshan master", "human", "teacher and wonder-worker", "He tests Wang through labor, stages marvels without explaining them, and warns that technique depends on conduct."),
  figure("laoshan-priest", "moon-dancer", "The moon dancer", "spirit", "figure conjured from light", "She emerges from a paper moon during the adepts' gathering, making spectacle the temptation at the center of Wang's apprenticeship."),

  figure("changqing-monk", "old-monk", "The monk of Changqing", "ghost", "monastic consciousness", "He continues his discipline in another man's body and uses memory to reclaim his former place."),
  figure("changqing-monk", "young-heir", "The young heir", "human", "deceased body donor", "His social body carries wealth, spouses, and obligations that the monk's consciousness refuses to resume."),
  figure("changqing-monk", "disciples", "The Changqing disciples", "human", "skeptical former students", "They require remembered particulars before accepting the younger stranger as their old teacher."),

  figure("painted-wall", "zhu", "Scholar Zhu", "human", "viewer and mural traveler", "His concentrated gaze moves him into an image where looking quickly becomes courtship and concealment."),
  figure("painted-wall", "mural-woman", "The woman in the mural", "spirit", "painted figure and bride", "She beckons Zhu into the painted world, and her changed hairstyle remains the encounter's material trace."),
  figure("painted-wall", "old-monk", "The monastery monk", "human", "custodian and caller", "He neither confirms nor denies the image world, but can summon Zhu back by addressing the wall."),

  figure("picture-horse", "tsui", "Mr. Tsui", "human", "borrower and seller", "Poverty makes the recurring horse useful, then saleable, before its return to the image exposes the transaction."),
  figure("picture-horse", "picture-horse", "The picture horse", "animal", "animated mount", "It crosses from a damaged painting into roads and court property, then runs home to its surface."),
  figure("picture-horse", "tseng", "Mr. Tseng", "human", "owner of the painted scroll", "He knows nothing of the horse's travels yet faces official pressure when it disappears into his house."),

  figure("planting-pear", "pear-seller", "The pear seller", "human", "merchant and target of the marvel", "He refuses one fruit, watches a miraculous distribution, and discovers that his own stock supplied it."),
  figure("planting-pear", "taoist", "The ragged Taoist", "human", "beggar and wonder-worker", "He converts a gifted seed into public abundance and the seller's barrow into the tree that seems to provide it."),
  figure("planting-pear", "market-beadle", "The market beadle", "human", "intermediary donor", "He buys the requested pear to end the dispute, making the later redistribution possible."),

  figure("stream-of-cash", "servant", "The garden servant", "human", "witness and would-be hoarder", "His first handfuls succeed; his attempt to immobilize the whole current makes the rest vanish."),
  figure("stream-of-cash", "master", "The garden's master", "human", "absent owner", "The unnamed master marks the garden as someone else's property even though the marvel is encountered by a servant."),

  figure("magnanimous-girl", "swordswoman", "The lady knight-errant", "human", "caregiver, avenger, and departing mother", "She gives material and filial care on her own terms while concealing the revenge duty that determines her exit."),
  figure("magnanimous-girl", "gu", "Gu", "human", "poor scholar and neighbor", "He admires care as marriageable virtue but never fully apprehends the woman's purposes beyond his household."),
  figure("magnanimous-girl", "fox-youth", "The fox youth", "fox", "charming visitor and threat", "His cultivated friendship with Gu masks a predatory relation the swordswoman recognizes immediately."),

  figure("butterfly-revenge", "magistrate-wang", "Magistrate Wang", "human", "official and collector", "He turns living butterflies into a whimsical penalty until a superior's displeasure makes the cost personal."),
  figure("butterfly-revenge", "butterfly-woman", "The butterfly woman", "spirit", "dream accuser", "She speaks collectively for the insects killed to satisfy the magistrate's aesthetic practice."),
  figure("butterfly-revenge", "censor", "The censor", "human", "offended superior", "His reading of an accidental ornament as disrespect delivers the social punishment that ends the custom."),

  figure("talking-pupils", "fang-dong", "Fang Dong", "human", "intrusive viewer and penitent", "Blinding turns his public entitlement to look into dependence on unseen agents and sustained reform."),
  figure("talking-pupils", "eye-spirits", "The eye spirits", "spirit", "tiny speakers within the pupils", "They travel through Fang's body, report on the garden, and finally share a single eye."),
  figure("talking-pupils", "immortal-attendant", "The immortal attendant", "spirit", "guardian who rebukes the gaze", "She identifies the guarded traveler as beyond Fang's reach and throws the dust that begins his transformation."),

  figure("luocha-sea-market", "ma-jun", "Ma Jun", "human", "merchant, performer, and marine court poet", "His beauty becomes monstrosity, his mask becomes advancement, and his writing becomes a different basis for recognition."),
  figure("luocha-sea-market", "retired-envoy", "The retired Luocha envoy", "human", "host and court sponsor", "Experienced in foreign difference, he alone receives Ma directly and introduces him to the court."),
  figure("luocha-sea-market", "sea-princess", "The sea princess", "spirit", "marine bride and separated partner", "She joins Ma through literary recognition but cannot abandon her realm when his filial duties call him home."),
] as const satisfies readonly Figure[];
