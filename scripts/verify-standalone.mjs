import { readFile, stat } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const outputPath = resolve(projectRoot, "standalone/index.html");
const html = await readFile(outputPath, "utf8");
const rootHtml = await readFile(resolve(projectRoot, "index.html"), "utf8");
const file = await stat(outputPath);
const externalCssUrls = [...html.matchAll(/url\(([^)]+)\)/g)]
  .map((match) => match[1].trim().replace(/^["']|["']$/g, ""))
  .filter((url) => url.length > 0 && !url.startsWith("data:") && !url.startsWith("#"));

const requirements = [
  [rootHtml.includes('new URL("./standalone/index.html"'), "root file-protocol handoff"],
  [!rootHtml.includes("needs its local server"), "no server-only fallback"],
  [html.includes('data-standalone="true"'), "standalone document marker"],
  [html.includes('id="root"'), "React mount point"],
  [html.includes("data:image/webp;base64,"), "embedded WebP materials"],
  [html.includes("data:image/svg+xml;base64,"), "embedded SVG ornament"],
  [html.includes("data:font/woff2;base64,"), "embedded fonts"],
  [html.includes('id="font-license-literata"'), "Literata license notice"],
  [html.includes('id="font-license-noto-serif-sc"'), "Noto Serif SC license notice"],
  [html.includes('id="font-license-barlow-condensed"'), "Barlow Condensed license notice"],
  [!/<script\b[^>]*\bsrc=/i.test(html), "no external script source"],
  [!/<link\b[^>]*\brel=["']stylesheet["']/i.test(html), "no external stylesheet"],
  [!/(?:src|href)=["'](?:\.?\/)?assets\//i.test(html), "no external asset element"],
  [!html.includes("/src/main.tsx"), "no source-module reference"],
  [!html.includes("sourceMappingURL="), "no external source map"],
  [externalCssUrls.length === 0, "no external CSS URL"],
];

const missing = requirements.filter(([passes]) => !passes).map(([, label]) => label);
if (missing.length > 0) {
  throw new Error(`Standalone verification failed: ${missing.join(", ")}`);
}

console.log(`Verified standalone/index.html (${(file.size / 1024 / 1024).toFixed(2)} MiB): all runtime code, styles, fonts, and imagery are embedded.`);
