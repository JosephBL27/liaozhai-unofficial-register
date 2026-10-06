import { describe, expect, it } from "vitest";
import {
  figureById,
  figures,
  glossary,
  institutions,
  motifs,
  places,
  registers,
  relationEdges,
  searchRecords,
  taleById,
  tales,
  validateCatalog,
} from ".";

describe("the representative Liaozhai catalog", () => {
  it("keeps its declared route internally valid", () => {
    expect(validateCatalog()).toEqual([]);
    expect(registers).toHaveLength(15);
    expect(tales).toHaveLength(30);
    expect(figures).toHaveLength(88);
    expect(motifs).toHaveLength(26);
    expect(glossary).toHaveLength(27);
    expect(institutions).toHaveLength(16);
    expect(places).toHaveLength(18);
  });

  it("assigns exactly two representative tales to every editorial register", () => {
    for (const register of registers) {
      expect(register.taleIds).toHaveLength(2);
      for (const id of register.taleIds) expect(taleById.get(id)?.registerId).toBe(register.id);
    }
  });

  it("resolves every declared figure and cross-tale relation", () => {
    for (const tale of tales) {
      for (const id of tale.figures) expect(figureById.has(id), `${tale.id} -> ${id}`).toBe(true);
    }
    for (const edge of relationEdges) {
      expect(taleById.has(edge.source), edge.id).toBe(true);
      expect(taleById.has(edge.target), edge.id).toBe(true);
      expect(edge.source).not.toBe(edge.target);
    }
  });

  it("ranks exact title searches ahead of contextual matches", () => {
    const [first] = searchRecords("painted skin");
    expect(first?.kind).toBe("tale");
    expect(first?.label).toBe("Painted Skin");
  });
});
