import { readFile, writeFile } from "node:fs/promises";
import { extname, resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const outputPath = resolve(projectRoot, "standalone/index.html");

const embeddedAssets = [
  "assets/materials/cut-paper-fox-breach.webp",
  "assets/materials/indigo-docket-cloth.webp",
  "assets/materials/stacked-record-leaves.webp",
  "assets/materials/woodblock-taxonomy.webp",
  "assets/ornaments/liaozhai-bamboo-register.svg",
];

const fontLicenses = [
  ["literata", "Literata-OFL-1.1.txt"],
  ["noto-serif-sc", "Noto-Serif-SC-OFL-1.1.txt"],
  ["barlow-condensed", "Barlow-Condensed-OFL-1.1.txt"],
];

const mimeTypes = new Map([
  [".svg", "image/svg+xml"],
  [".webp", "image/webp"],
]);

let html = await readFile(outputPath, "utf8");

for (const relativePath of embeddedAssets) {
  const sourcePath = resolve(projectRoot, "public", relativePath);
  const mimeType = mimeTypes.get(extname(relativePath));
  const bytes = await readFile(sourcePath);
  const dataUrl = `data:${mimeType};base64,${bytes.toString("base64")}`;
  const candidates = [`/${relativePath}`, `./${relativePath}`, relativePath];
  let replacements = 0;

  for (const candidate of candidates) {
    const fragments = html.split(candidate);
    replacements += fragments.length - 1;
    html = fragments.join(dataUrl);
  }

  if (replacements === 0) {
    throw new Error(`Standalone build did not reference ${relativePath}`);
  }
}

const licenseNotices = [];
for (const [id, filename] of fontLicenses) {
  const license = await readFile(resolve(projectRoot, "public/licenses", filename), "utf8");
  const safeLicense = license.replaceAll("</script", "<\\/script");
  licenseNotices.push(
    `<script type="text/plain" id="font-license-${id}" data-purpose="redistribution-license">${safeLicense}</script>`,
  );
}

html = html.replace("</body>", `${licenseNotices.join("\n")}\n</body>`);
await writeFile(outputPath, html);
