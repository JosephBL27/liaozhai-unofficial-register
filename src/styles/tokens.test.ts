// @vitest-environment node

import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const SOURCE_ROOT = join(process.cwd(), "src");
const ALLOWED_EXTENSIONS = new Set([".css", ".ts", ".tsx"]);

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return ALLOWED_EXTENSIONS.has(extname(path)) ? [path] : [];
  });
}

describe("design-token boundary", () => {
  it("keeps authored hexadecimal palette values in tokens.css", () => {
    const violations = sourceFiles(SOURCE_ROOT)
      .filter((path) => !path.endsWith("tokens.css") && !path.endsWith("tokens.test.ts"))
      .flatMap((path) => {
        const matches = readFileSync(path, "utf8").match(/#[0-9a-f]{3,8}\b/gi) ?? [];
        return matches.map((value) => `${relative(process.cwd(), path)}: ${value}`);
      });

    expect(violations).toEqual([]);
  });
});
