---
name: Liaozhai — The Unofficial Register
description: An early-Qing correction register where indigo order is interrupted by cinnabar evidence and a frameless cut-paper fox.
colors:
  ink-950: "#071416"
  ink-900: "#0b1c20"
  ink-850: "#10282c"
  wheel-well-inner: "#173f42"
  wheel-well-outer: "#071416"
  ink-800: "#15343a"
  ink-700: "#1f4549"
  ink-wash: "#2b5a59"
  paper-50: "#f2eddf"
  paper-100: "#e8e1cf"
  paper-200: "#d7cdb6"
  paper-300: "#c1b293"
  paper-ink: "#211d18"
  paper-reading-ink: "#2d2821"
  paper-muted: "#665d50"
  cinnabar-400: "#d65b45"
  cinnabar-500: "#c94936"
  cinnabar-600: "#a93429"
  cinnabar-700: "#81261f"
  celadon-200: "#b9d3bf"
  celadon-300: "#93b8a5"
  celadon-400: "#6f9e90"
  celadon-500: "#4f8078"
  celadon-700: "#254d47"
  celadon-ink: "#244b47"
  celadon-wash: "rgba(111, 158, 144, 0.46)"
  celadon-wash-strong: "rgba(67, 111, 103, 0.6)"
  register-line: "rgba(218, 204, 171, 0.4)"
  register-line-soft: "rgba(218, 204, 171, 0.18)"
  paper-line: "rgba(55, 47, 37, 0.24)"
  paper-line-soft: "rgba(55, 47, 37, 0.12)"
  focus-ring: "#f0c97e"
  error: "#e47b63"
typography:
  display:
    fontFamily: "Literata Variable, Charter, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 4.6rem)"
    fontWeight: 590
    lineHeight: 0.96
    letterSpacing: "-0.035em"
    fontVariation: "opsz 60"
  headline:
    fontFamily: "Literata Variable, Charter, Georgia, serif"
    fontSize: "clamp(1.65rem, 3vw, 3rem)"
    fontWeight: 650
    lineHeight: 0.98
    letterSpacing: "-0.025em"
    fontVariation: "opsz 52"
  title:
    fontFamily: "Literata Variable, Charter, Georgia, serif"
    fontSize: "1.2rem"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: "Literata Variable, Charter, Georgia, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0.1em"
  cjk-title:
    fontFamily: "Noto Serif SC Variable, Songti SC, serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.1em"
rounded:
  micro: "0.1rem"
  tab: "0.15rem"
  pill: "999px"
spacing:
  space-1: "0.25rem"
  space-2: "0.5rem"
  space-3: "0.75rem"
  space-4: "1rem"
  space-5: "1.5rem"
  space-6: "2rem"
  space-7: "3rem"
  header-h: "4.25rem"
  rail-h: "6.5rem"
components:
  seal-action:
    backgroundColor: "{colors.cinnabar-600}"
    textColor: "{colors.paper-50}"
    typography: "{typography.label}"
    rounded: "{rounded.micro}"
    padding: "0.62rem 0.9rem"
    height: "2.75rem"
  seal-action-hover:
    backgroundColor: "{colors.cinnabar-500}"
    textColor: "{colors.paper-50}"
    typography: "{typography.label}"
    rounded: "{rounded.micro}"
    padding: "0.62rem 0.9rem"
    height: "2.75rem"
  secondary-action:
    backgroundColor: "transparent"
    textColor: "{colors.paper-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.micro}"
    padding: "0.62rem 0.9rem"
    height: "2.75rem"
  search-field:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.paper-50}"
    typography: "{typography.body}"
    rounded: "{rounded.micro}"
    padding: "0 0.85rem"
    height: "2.8rem"
  filter-chip:
    backgroundColor: "transparent"
    textColor: "{colors.paper-200}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 0.8rem"
    height: "2.5rem"
  filter-chip-selected:
    backgroundColor: "{colors.cinnabar-700}"
    textColor: "{colors.paper-50}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0.45rem 0.8rem"
    height: "2.5rem"
  register-slip:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.paper-200}"
    typography: "{typography.label}"
    padding: "0.7rem 0.75rem"
    width: "minmax(5.65rem, 1fr)"
  register-slip-active:
    backgroundColor: "{colors.cinnabar-700}"
    textColor: "{colors.paper-50}"
    typography: "{typography.label}"
    padding: "0.7rem 0.75rem"
    width: "minmax(5.65rem, 1fr)"
  dossier-sheet:
    backgroundColor: "{colors.paper-50}"
    textColor: "{colors.paper-ink}"
    typography: "{typography.body}"
    padding: "clamp(1.2rem, 2.3vw, 2.2rem)"
  operations-rail:
    backgroundColor: "{colors.ink-900}"
    textColor: "{colors.paper-200}"
    typography: "{typography.label}"
    width: "12.4rem"
  footer-ledger:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.paper-200}"
    typography: "{typography.label}"
    height: "3.5rem"
  mobile-register-toolbar:
    backgroundColor: "{colors.ink-950}"
    textColor: "{colors.paper-200}"
    typography: "{typography.label}"
    height: "3.35rem"
  radial-register:
    backgroundColor: "{colors.wheel-well-outer}"
    textColor: "{colors.paper-50}"
    typography: "{typography.label}"
    width: "100%"
---

# Design System: Liaozhai — The Unofficial Register

## Overview

**Creative North Star: "The Red-Correction Register"**

The interface behaves like an early-Qing examination ledger whose official cells cannot fully contain the evidence placed inside them. Indigo docket cloth, lampblack wells, cool record leaves, compressed docket labels, and decisive cinnabar corrections establish a disciplined reading apparatus; celadon traces recurrence and completion. The uncanny arrives through misregistration, clipped paper, and one frameless fox breaching the seam—not through gothic fog, celestial spectacle, or faux-imperial luxury.

This is a dense reading instrument rather than a themed museum page. A monumental concentric register and a corrected dossier deliberately collide in the first viewport, while the complete fifteen-register route closes the composition below. The other workspaces translate the same register logic into ledgers, relation slips, an explicitly non-geographic story-world plate, figure rows, a lexicon, and an inspectable method record.

The system keeps its construction and limits visible. Generated materials are interpretive contemporary assets, editorial routes identify themselves as editorial, and no visual flourish is allowed to imply edition-specific, historical, genealogical, or geographic certainty that the data does not support.

**Key Characteristics:**

- Indigo docket cloth and near-black ledger fields establish the ordinary system.
- Cinnabar acts as correction, selection, and decisive action rather than ambient decoration.
- Cool record leaves carry sustained reading with visible rules and clipped paper corners.
- A cropped concentric register and overlapping dossier preserve spatial orientation in one viewport.
- A frameless cut-paper fox crosses the wheel/dossier seam as the singular supernatural breach.
- The full fifteen-slip rail remains persistent and keeps the editorial route inspectable.
- Compressed docket labels and literary reading type create two sharply different information scales.
- Four generated WebP materials and one optimized authored SVG ornament have explicit production roles and interpretive provenance.
- Literal ornament, visual, and transparent interaction groups keep the radial register's rendering contract inspectable.
- A desktop operations rail and footer ledger transform into a compact toolbar and dismissible, internally scrolling mobile dossier.
- Provenance, uncertainty, keyboard parity, reduced motion, and browser-local state are part of the visual system.

## Colors

The palette separates bureaucratic field, reading material, correction, and supernatural recurrence into four disciplined families.

### Primary

- **Correction Cinnabar** (`cinnabar-400` through `cinnabar-700`): active register sectors, selected slips, primary actions, numbered corrections, route threads, and small proof marks. Brighter steps are for figures and signals; deeper steps support readable filled states.

### Secondary

- **Spirit Celadon** (`celadon-200` through `celadon-700`, plus ink and wash variants): secondary labels, relationship edges, completion marks, and quiet supernatural or threshold states. It supports cinnabar and never competes for primary emphasis.

### Neutral

- **Docket Ink** (`ink-950` through `ink-700`, the two wheel-well tokens, and `ink-wash`): page field, lacquer seams, instrument wells, graph canvases, and otherworld marks.
- **Record Leaf** (`paper-50` through `paper-300`): dossier sheets, relation slips, paper stacks, ruled tabs, and dark-field reading text.
- **Lampblack and Margin Ink** (`paper-ink`, `paper-reading-ink`, `paper-muted`): primary reading, compact evidence, and secondary text on record leaves.
- **Ledger Rules** (`register-line`, `register-line-soft`, `paper-line`, `paper-line-soft`): structural registration on dark and light materials. Hairlines organize; they do not become decorative frames around every item.
- **Focus Gold** (`focus-ring`): the universal high-contrast keyboard focus indication.
- **Error Coral** (`error`): destructive or invalid-state feedback only.

**The Correction Hierarchy Rule.** Cinnabar means correction, current selection, or a decisive action. It must not be scattered as an atmospheric accent.

**The Spirit-State Rule.** Celadon may mark recurrence, completion, or a supernatural threshold, but text, shape, and semantics must carry the same state without relying on color.

## Typography

- **Display Font:** Literata Variable (with Charter and Georgia fallbacks)
- **Body Font:** Literata Variable (with Charter and Georgia fallbacks)
- **Label Font:** Barlow Condensed (with Arial Narrow fallback)
- **CJK Title Font:** Noto Serif SC Variable (with Songti SC fallback)

**Character:** Literata gives the companion an exact, humane reading voice and optical-size authority at large scales. Barlow Condensed turns navigation, counts, states, and provenance into docket notation. Noto Serif SC is reserved for the verified collection title rather than used to manufacture decorative pseudo-Chinese text.

### Hierarchy

- **Display** (590, `clamp(2rem, 4vw, 4.6rem)`, 0.96): workspace titles; balanced over a maximum of roughly 17 characters per line.
- **Headline** (650, `clamp(1.65rem, 3vw, 3rem)`, 0.98): dossier and sheet titles on record leaves.
- **Title** (600, 1.2rem, 1.15): ledger entries, apparatus steps, and inspector titles.
- **Body** (400, 1rem, 1.55): reading copy; long passages generally stay within 65–70 characters.
- **Label** (500, 0.75rem, 0.1em, uppercase): workspace tabs, controls, categories, boundaries, counts, and register metadata.
- **CJK title** (400, 1rem, 0.1em): the verified `聊斋志异` brand line only.

**The Three-Register Type Rule.** Literata reads, Barlow indexes, and Noto Serif SC carries verified Chinese text. Do not blur those jobs or introduce a decorative display face.

## Layout

The desktop shell is a bounded archive desk: a 12.4rem operations rail at left, the active workspace in the center, and a persistent footer ledger below it. The operations rail carries seven workspaces, Map/Table mode, radial zoom at wide widths, five reading-state filters with counts, and marginalia. The footer reports Records, Read, In progress, Unread, and Favourites alongside local-storage, export, Method, and settings utilities. At 1240px and below the operations rail compresses to a 4.15rem icon column, footer labels collapse, and radial zoom moves onto the stage; above 1240px the full rail returns.

Within the Register workspace, the resizable dossier begins at 39 percent of the stage and overlaps the wheel field by 13rem; the wheel is intentionally cropped beyond the left edge. The frameless fox crosses that collision, and the fifteen-slip route occupies the final 6.5rem of the register composition. At 1181px and above all fifteen slips distribute across the route. At 1180px and below the composition becomes a fixed 58/42 split, the resizer disappears, and the route scrolls horizontally while centering the active slip. The 901–1100px band uses a compact absolute overlap so the wheel and dossier remain one instrument rather than falling into a detached gutter.

At 900px and below, the desktop operations rail is removed and the workspace navigation becomes a menu. A compact Register toolbar exposes Map/Table and the same reading-state filters and counts. The selected dossier becomes dismissible and reopenable over the instrument. At 600px and below it becomes a full-width bottom sheet beginning at `min(10.5rem, 25dvh)`; `.dossier-sheet`, rather than the document, owns vertical scrolling so the generated taxonomy evidence, summary, adjacent-record route, facts, and actions remain reachable while the wheel stays visible above. Dialogs become full-screen, and dense ledgers preserve real text through contained horizontal scrolling or single-column transformation. Container queries condense the radial labels at 44rem and make dossier facts single-column at 43rem. The same mobile transformation supports the tested 200-percent reflow equivalent and the 320px minimum canvas.

Secondary workspaces use a maximum 100rem field, a faint 48-by-72px ledger grid, and full-width ruled rows or plates rather than card stacks. The relation graph and story-world plate own their available work area; the current story-world topology has no detached desktop gutter. Story-world geometry remains a labeled editorial composition, not a map.

**The Collision Rule.** The wheel, dossier, and fox must meet at one legible seam. Do not separate them with a polite gutter or frame the fox as another medallion.

**The Fifteen-Slip Rule.** The complete editorial route stays present as a rail; responsive layouts may scroll it, but they may not replace it with an unexplained page count.

## Elevation & Depth

Depth is material and sparse. The indigo cloth raster sits beneath authored grids and SVG linework. The dossier uses stacked leaves, clipped corners, inset rules, and one paper shadow; dialogs and draggable relation slips use a stronger lift only because they physically rise above the register. Static dark-field rows remain flat. There is no glass, celestial glow, or decorative blur; the only backdrop blur belongs to an active modal boundary.

### Shadow Vocabulary

- **Paper lift** (`0.7rem 1.1rem 2.8rem rgba(0, 0, 0, 0.38)`): the corrected dossier, its offset leaves, and an opened story-world inspector.
- **Floating slip** (`0.4rem 0.8rem 2rem rgba(0, 0, 0, 0.28)`): draggable relation nodes and compact floating controls.
- **Modal lift** (`1rem 1.6rem 5rem rgba(0, 0, 0, 0.62)`): native dialogs above the dimmed application.

**The Material Evidence Rule.** A shadow must explain a lifted sheet, draggable slip, or modal layer. Flat records use rules, tone, and registration—not generic card elevation.

## Shapes

Squared lacquer frames and ruled cells are the default. Controls use nearly square micro-corners; paper tabs use a slight top radius; filter and motif chips are the only routine pills. Reading sheets, relation slips, and action seals use polygonal clipped corners that resemble cut and folded paper. Circles belong to the concentric instrument, figure marks, completion dots, and optical controls—not to generic content containers.

Four generated WebP production materials have distinct duties. `indigo-docket-cloth.webp` is the low-contrast archive field beneath the operations rail and register surfaces. `cut-paper-fox-breach.webp` is a transparent, frameless cinnabar/ivory/lampblack form split into base and forepaw layers so it can pass convincingly across the dossier seam. `stacked-record-leaves.webp` supplies the offset paper leaves behind the dossier. `woodblock-taxonomy.webp` is the abstract printmark field behind the dossier's evidence values. The rejected ringed fox study is not a production shape.

`liaozhai-bamboo-register.svg` is a standalone, optimized 960-by-180 authored ornament with an accessible title and description. Its bamboo, ruled manuscript leaf, misregistered rules, and unlettered correction mark are contemporary interpretive geometry; it does not reproduce or slice a historical plate.

**The Cut-Corner Rule.** Use clipped corners to signal authored paper or a decisive seal. Do not round every surface into a generic card.

**The Contemporary Asset Rule.** Generated WebP materials and the authored SVG ornament must remain visibly identified as interpretive production assets, never historical objects or interface evidence.

## Components

### Global header and workspace navigation

The sticky 4.25rem header pairs a square cinnabar brand seal with the Latin working title, the verified Chinese title, global search, progress, and marginalia. The desktop operations rail is a ruled archive desk whose active workspace adds a visible cinnabar registration bar plus `aria-current`, never color alone. Its view mode and reading-state controls remain synchronized with the Register workspace. At 900px and below, workspace navigation becomes a full-width menu and Register-specific view/filter controls move into the compact toolbar.

### Radial register and dossier collision

The signature SVG register is literally divided into three top-level layers: an inert ornament group, a pointer-free visual group for register/tale faces and labels, figure marks, the five-mark evidence band, and current-record display, and a transparent interaction group carrying the semantic hit geometry. Visual and interaction groups receive the same GSAP rotation while ornament stays fixed. The evidence band derives form, institution, motif, locus, and term marks from the active tale. A semantic HTML mirror separately exposes the complete outer register plus the active inner tale and figure navigation.

Register and inner segments share a typed `id`, `label`, `start`, `end`, `category`, and optional `selected` contract. Targets expose click, Enter/Space, arrow, Home/End, wheel, drag, and previous/next equivalents. The active sector aligns to the fixed pointer and updates the dossier and route as one state. Figure marks remain small paper-and-lampblack targets; the production fox is a frameless raster breach outside that medallion topology. At handheld width the dense evidence and figure arcs hide, while the same active evidence remains available in the dossier taxonomy plate.

**The Three-Layer Register Rule.** Static ornament, visible faces and labels, and transparent interaction geometry remain separate literal SVG groups; only the visual and interaction groups share rotation state.

### Corrected dossier and actions

The dossier is a clipped, ruled record leaf with generated stacked-paper depth and three roving tabs: Record, Analysis, and Prompts. The Record tab begins with an abstract taxonomy printmark and visible values for Figures, Pressure, Motif, Locus, and Term plus a provenance action; the tale summary and a visible `Trace next` adjacent-record route follow immediately. Locus, strange form, ordinary pressure, disclosure, figure actions, motifs, terms, and progress continue below. On mobile, compact wrapping and internal `.dossier-sheet` scrolling keep that complete reading order available inside the dismissible bottom sheet. Analysis visibly labels editorial interpretation; Prompts stays a separate close-reading state. Primary actions are clipped cinnabar seals; secondary actions are transparent ruled controls, and completed state changes both label and semantics.

### Register route and persistent ledger

Each of the fifteen route slips carries a two-digit index, editorial title, strange-form mark, record count, completion marks, and explicit active styling. Previous/next controls duplicate wheel stepping. Wide desktop distributes all slips; narrower layouts scroll and call `scrollIntoView` on the selected slip. The separate footer ledger persists aggregate reading state and browser-local utilities; below 900px it becomes a compact horizontally scrollable strip without causing document overflow.

### Ledgers, search, and filters

Tales use a ruled table; figures use full-width numbered rows; the lexicon uses paired term/gloss cells. Search fields are dark rectangular wells with real labels and icons. Filters may be pill-shaped because they are compact set controls, and selected filters pair filled cinnabar with `aria-pressed`. Empty states state what can be changed rather than leaving a blank grid.

### Relation register and story-world plate

React Flow renders clipped paper relation slips over a dark ruled canvas, with celadon edges and text labels for declared editorial connections. The story-world chart uses D3 scale output only to establish deterministic SVG coordinates; React owns rendering and interaction. Its full-width plate chrome, numbered locus marks, dashed cinnabar display-order thread, count key, and explicit non-geographic copy stay visible. Selecting a locus opens a clipped paper inspector rather than changing the chart into a literal map.

### Dialogs, progress, and marginalia

Native dialogs share dark docket headers and record-leaf bodies. Search, figure sheets, tale focus, and private marginalia are mutually exclusive, close on Escape, and restore focus to their trigger. Progress uses text counts plus a celadon bar. Notes, read state, current register, and the desktop dossier split are browser-local; marginalia can be exported and merged from validated JSON.

### Motion and registration

GSAP owns three bounded mechanical transitions: the 720ms `power3.inOut` radial snap with shortened rotation, a 520ms `power2.out` active-path draw, and a 380ms `power2.out` dossier entrance. The radial snap and active path use zero duration under reduced motion, while the dossier entrance is skipped. CSS state changes use 180ms ease-out; the active workspace rule uses 240ms with the register easing curve; progress uses 480ms with the same curve. Wheel stepping is throttled for 380ms. Reduced motion removes choreography and smooth scrolling while preserving every state change and input path.

### Accessibility states

A 0.15rem Focus Gold outline with 0.2rem offset is the universal focus treatment. A skip link reaches the current workspace; SVG targets have names and keyboard activation; dossier tabs use roving focus and linked tabpanels; live regions announce selection, persistence, imports, and workspace changes. Touch, pointer, wheel, and drag behaviors always have button or keyboard equivalents. The 320px minimum inline size, mobile transformations, real text, reduced motion, and no-document-overflow rule support zoom and reflow.

### Editorial truth states

The fifteen registers are transparent editorial scaffolding, not Pu Songling's source order or a complete table of contents. The thirty tale records, summaries, prompts, and relation labels are representative editorial material, not quotations or edition references. Variant titles remain marked. Relation edges do not assert genealogy; story-world positions do not assert geography, route, scale, or proximity. Generated art is labeled interpretive and institutional sources remain inspectable without being reproduced as interface evidence.

**The One Breach Rule.** Use the frameless cut-paper fox once at the primary wheel/dossier seam. Do not restore the rejected ring, multiply fox silhouettes, or turn generated art into historical evidence.

**The State Parity Rule.** Every visible active, completed, selected, or uncertain state needs text or semantics in addition to pigment.

**The Marked-Uncertainty Rule.** When the catalog cannot support historical or edition-specific precision, state the omission instead of making the interface look certain.

### Persistence, implementation, and QA state

The application is React 19 with TypeScript and Vite 8. React owns state and authored SVG; GSAP is limited to register snapping, active-path drawing, and dossier entrance; React Flow is lazy-loaded only for the relation workspace; D3 Scale supplies deterministic geometry and does not own the DOM. Browser-local state uses `liaozhai.progress.v1`, `liaozhai.notes.v1`, and `liaozhai.panes.v1`; malformed values fall back safely, same-document and cross-tab changes synchronize, and invalid note imports are rejected. The root host document redirects direct `file://` openings to `standalone/index.html`, a separately generated single-file build with code, styles, fonts, four WebP materials, the SVG ornament, and required font-license notices embedded. Hosted builds remain in `dist/`; the offline target does not replace the Vite development graph.

Storybook 10 exposes twenty stories across the radial stage, reading dossier, operations rail, tale ledger, settings, marginalia, search, relation graph, story-world chart, and standalone ornament. Its accessibility addon runs in error mode with named 390x844, 768x1024, and 1440x900 viewports. The verified unit run is 50 passing tests across 11 files. The verified 38-check Playwright run covers five responsive screenshot baselines at 1536x1024, 1440x900, 1024x768, 768x1024, and 390x844 plus a sixth baseline under actual Chromium 200-percent page scaling; it also covers the 200-percent reflow equivalent, explicit 768x1024 tablet transformation, visible utility and separated-SVG focus, selection and input parity, persistence and cross-tab state, all workspaces and dialogs, reduced motion, no horizontal overflow, and axe WCAG A/AA scans. Runtime integrity asserts all four generated WebP materials, the standalone ornament, and the lazy React Flow and D3 workspaces load without page errors or failed requests.

The second and final reviewer disposition was `fix`. It identified two explicit defects: at 390px the taxonomy/value evidence area was visibly blank, making figures, pressure, motif, locus, term, and provenance unavailable; and adding that evidence plate had displaced the tale summary while leaving no visible `Trace next` adjacent-record path on desktop or mobile. Both defects were subsequently repaired through compact evidence rows, restored summary and adjacent navigation, and internal dossier scrolling. A dedicated 390x844 regression now asserts the taxonomy, summary, and `Trace next` order and keeps all three within the initial dossier sheet before footer/progress. Measured post-fix geometry placed taxonomy at 445.8–575.9px, summary at 591.9–636.3px, and `Trace next` at 645.1–698.8px inside a sheet ending at 703.98px. Those repairs are geometry- and test-verified, but they were not independently re-reviewed; do not describe them as reviewer-approved.

## Do's and Don'ts

### Do:

- **Do** let lampblack cells establish ordinary order before cinnabar interrupts it.
- **Do** preserve the wheel/dossier collision, frameless fox breach, and full fifteen-slip rail as one composition.
- **Do** use Literata for reading, Barlow Condensed for docket notation, and Noto Serif SC only for verified Chinese text.
- **Do** keep every selected, completed, and uncertain state legible without color.
- **Do** preserve keyboard, reduced-motion, 200-percent reflow, and browser-local continuation behavior with every visual extension.
- **Do** keep the dossier evidence, tale summary, and `Trace next` route in that order and reachable through the dossier's own scroll region.
- **Do** identify editorial scaffolding, generated material, variant titles, and non-geographic or non-genealogical diagrams where they appear.
- **Do** preserve the distinct roles and provenance of all four WebP materials and the standalone optimized SVG ornament.
- **Do** keep the material-source links inspectable while making clear that no institutional object is reproduced as interface evidence.

### Don't:

- **Don't** restore the Ovidian celestial instrument, Renaissance folio imagery, Greek/Roman ornament, or the discarded Metamorphoses palette.
- **Don't** put a gutter between the wheel and dossier or frame the fox inside a ring, seal, or medallion.
- **Don't** use generic gothic fog, chinoiserie, pseudo-Chinese text, faux-imperial luxury, or photoreal paper behind core reading text.
- **Don't** turn the interface into rounded cards, glass panels, or pills outside compact filter and motif controls.
- **Don't** use cinnabar as ambient decoration or celadon as the only sign of completion or supernatural category.
- **Don't** imply that fifteen registers are source order, thirty records are complete, editorial prose is quotation, relations are genealogy, or story-world coordinates are geography.
- **Don't** add remote accounts, analytics, or storage to a system whose progress and marginalia are intentionally browser-local.
