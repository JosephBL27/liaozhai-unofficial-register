import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const VIEWPORTS = [
  { name: "1536x1024", width: 1536, height: 1024 },
  { name: "1440x900", width: 1440, height: 900 },
  { name: "1024x768", width: 1024, height: 768 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "390x844", width: 390, height: 844 },
] as const;

const STORAGE_KEYS = {
  notes: "liaozhai.notes.v1",
  panes: "liaozhai.panes.v1",
  progress: "liaozhai.progress.v1",
} as const;

async function openRegister(page: Page): Promise<void> {
  await page.goto("/#register");
  await expect(page.getByRole("heading", { name: "Fifteen-register Liaozhai reading instrument" })).toBeAttached();
  await expect(page.locator("#reading-dossier")).toHaveAttribute("aria-label", /Selected tale:/);
  await page.evaluate(async () => document.fonts.ready);
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));

  expect(
    Math.max(dimensions.document, dimensions.body),
    `document width ${Math.max(dimensions.document, dimensions.body)} should fit viewport ${dimensions.viewport}`,
  ).toBeLessThanOrEqual(dimensions.viewport + 1);
}

function formatViolations(
  violations: Array<{ id: string; impact?: string | null; nodes: Array<{ target: unknown }> }>,
): string {
  return violations
    .map((violation) => `${violation.id} (${violation.impact ?? "unknown"}): ${violation.nodes.map((node) => JSON.stringify(node.target)).join(", ")}`)
    .join("\n");
}

for (const viewport of VIEWPORTS) {
  test.describe(`responsive register at ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("renders its primary reading state without page overflow", async ({ page }) => {
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));

      await openRegister(page);

      await expect(page.getByRole("banner")).toContainText("Liaozhai");
      await expect(page.locator(".radial-stage > svg")).toBeVisible();
      await expect(page.locator(".register-rail")).toBeVisible();
      const railBox = await page.locator(".register-rail").boundingBox();
      expect(railBox, "register rail should have a rendered box").not.toBeNull();
      expect(railBox!.y).toBeGreaterThanOrEqual(-1);
      expect(railBox!.y + railBox!.height).toBeLessThanOrEqual(viewport.height + 1);
      await expect(page.locator(".register-slip.is-active")).toHaveCount(1);
      await expect(page.locator("#reading-dossier h1")).not.toBeEmpty();
      await expectNoHorizontalOverflow(page);
      expect(pageErrors).toEqual([]);
      await expect(page).toHaveScreenshot(`register-${viewport.name}.png`, {
        animations: "disabled",
        caret: "hide",
        fullPage: false,
      });
    });
  });
}

test.describe("primary reading interactions", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("selecting a register updates the dossier and persistent progress", async ({ page }) => {
    await openRegister(page);

    await page.locator('.register-slip[data-register-id="unquiet-dead"]').click();

    await expect(page.locator("#reading-dossier")).toHaveAttribute("aria-label", "Selected tale: Nie Xiaoqian");
    await expect(page.locator("#reading-dossier h1")).toHaveText("Nie Xiaoqian");
    await expect(page.locator('.register-slip[data-register-id="unquiet-dead"]')).toHaveClass(/is-active/);
    await expect.poll(async () => page.evaluate((key) => {
      const saved = JSON.parse(localStorage.getItem(key) ?? "null") as { currentRegisterId?: string } | null;
      return saved?.currentRegisterId;
    }, STORAGE_KEYS.progress)).toBe("unquiet-dead");
  });

  test("keyboard, wheel, and rail controls each step the radial register", async ({ page }) => {
    await openRegister(page);
    const stage = page.locator(".radial-stage");

    await stage.locator(".radial-segment.is-active").focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.locator('.register-slip[data-register-id="unquiet-dead"]')).toHaveClass(/is-active/);
    await expect(stage.locator('.radial-segment[data-segment-id="unquiet-dead"]')).toBeFocused();

    await stage.dispatchEvent("wheel", { deltaX: 0, deltaY: 120 });
    await expect(page.locator('.register-slip[data-register-id="borrowed-bodies"]')).toHaveClass(/is-active/);
    await expect(page.locator("#reading-dossier h1")).toHaveText("Painted Skin");

    await page.locator(".register-rail").getByRole("button", { name: "Next register" }).click();
    await expect(page.locator('.register-slip[data-register-id="dream-judgments"]')).toHaveClass(/is-active/);
  });

  test("zoom and the semantic HTML index operate the same radial state", async ({ page }) => {
    await openRegister(page);
    const zoom = page.getByRole("group", { name: "Zoom radial register" });

    await zoom.getByRole("button", { name: "Zoom in" }).focus();
    await page.keyboard.press("Enter");
    await expect(zoom.locator("output")).toHaveText("108%");
    await expect(page.locator(".radial-zoom-layer")).toHaveAttribute("transform", /scale\(1\.08\)/);
    await zoom.getByRole("button", { name: "Reset radial register zoom" }).click();
    await expect(zoom.locator("output")).toHaveText("100%");

    const semantic = page.locator(".radial-semantic-index");
    const semanticSelect = semantic.locator("select").first();
    await semanticSelect.selectOption("unquiet-dead");
    await expect(page.locator("#reading-dossier h1")).toHaveText("Nie Xiaoqian");
    await expect(page.locator('.register-slip[data-register-id="unquiet-dead"]')).toHaveClass(/is-active/);

    await semanticSelect.focus();
    await expect(semanticSelect).toBeFocused();
    await expect.poll(() => semantic.evaluate((node) => node.getBoundingClientRect().width)).toBeGreaterThan(100);
    await expect.poll(() => semanticSelect.evaluate((node) => {
      const style = getComputedStyle(node);
      return style.outlineStyle === "solid" && Number.parseFloat(style.outlineWidth) >= 2;
    })).toBe(true);
    await page.keyboard.press("ArrowDown");
    await expect(semanticSelect).toHaveValue("unquiet-dead");
    await expect(page.locator("#reading-dossier h1")).toHaveText("Nie Xiaoqian");

    await expect(semantic.getByRole("button", { name: /Tale 1:/ })).toBeAttached();
    await expect(semantic.getByRole("button", { name: /Nie Xiaoqian:/ })).toBeAttached();
  });

  test("hover uses a visible outline without selecting a different register", async ({ page }) => {
    await openRegister(page);
    const interaction = page.locator('.radial-segment[data-segment-id="unquiet-dead"]');
    const face = page.locator('.radial-segment-visual[data-segment-id="unquiet-dead"] .radial-segment-face');

    await interaction.hover();
    await expect.poll(async () => face.evaluate((node) => ({
      stroke: getComputedStyle(node).stroke,
      strokeWidth: Number.parseFloat(getComputedStyle(node).strokeWidth),
    }))).toMatchObject({ strokeWidth: 1.8 });
    await expect(page.locator('.register-slip[data-register-id="fox-kinships"]')).toHaveClass(/is-active/);
  });

  test("keyboard focus visibly marks utility and separated radial targets", async ({ page }) => {
    await openRegister(page);
    const search = page.getByRole("button", { name: "Search tales, figures, and motifs" });
    await search.focus();
    await expect.poll(() => search.evaluate((node) => {
      const style = getComputedStyle(node);
      return style.outlineStyle === "solid" && Number.parseFloat(style.outlineWidth) >= 2;
    })).toBe(true);

    const interaction = page.locator('.radial-segment[data-segment-id="fox-kinships"]');
    const face = page.locator('.radial-segment-visual[data-segment-id="fox-kinships"] .radial-segment-face');
    await interaction.focus();
    await expect(interaction).toBeFocused();
    await expect.poll(() => face.evaluate((node) => {
      const style = getComputedStyle(node);
      return Number.parseFloat(style.strokeWidth) >= 1.7;
    })).toBe(true);
    expect(await face.evaluate((node) => getComputedStyle(node).stroke)).not.toBe("none");

    const taleInteraction = page.locator(".tale-sector-interaction.is-active");
    const taleFace = page.locator(".tale-sector.is-active path");
    await taleInteraction.focus();
    await expect(taleInteraction).toBeFocused();
    await expect.poll(() => taleFace.evaluate(
      (node) => Number.parseFloat(getComputedStyle(node).strokeWidth) >= 1.7,
    )).toBe(true);

    const figureInteraction = page.locator(".figure-medallion-interaction").first();
    await figureInteraction.focus();
    await expect(figureInteraction).toBeFocused();
    await expect.poll(() => figureInteraction.evaluate((node) => {
      const style = getComputedStyle(node);
      return style.outlineStyle === "solid" && Number.parseFloat(style.outlineWidth) >= 2;
    })).toBe(true);
  });

  test("pointer drag steps the register without disturbing semantic targets", async ({ page }) => {
    await openRegister(page);
    const stage = page.locator(".radial-stage");
    const box = await stage.boundingBox();
    expect(box).not.toBeNull();

    const startX = box!.x + box!.width * 0.7;
    const startY = box!.y + 10;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 80, startY, { steps: 4 });
    await page.mouse.up();

    await expect(page.locator('.register-slip[data-register-id="unquiet-dead"]')).toHaveClass(/is-active/);
  });

  test("Command or Control K searches and opens the selected tale", async ({ page }) => {
    await openRegister(page);

    await page.keyboard.press("ControlOrMeta+K");
    const search = page.getByRole("dialog", { name: "Search the unofficial register" });
    await expect(search).toBeVisible();
    await search.getByRole("searchbox", { name: "Search query" }).fill("Painted Skin");
    await search.locator(".search-results button").filter({ hasText: "Painted Skin" }).first().click();

    const focus = page.getByRole("dialog", { name: "Painted Skin" });
    await expect(focus).toBeVisible();
    await expect(focus.getByRole("heading", { name: "Painted Skin", level: 1 })).toBeVisible();
    await expect(page.locator('.register-slip[data-register-id="borrowed-bodies"]')).toHaveClass(/is-active/);
  });

  test("marginalia save visibly and persist in browser storage", async ({ page }) => {
    await openRegister(page);
    const noteText = "Track how laughter shifts from agency to evidence.";

    await page.locator(".global-header").getByRole("button", { name: "Open marginalia" }).click();
    const notes = page.getByRole("dialog", { name: "Private marginalia" });
    await notes.getByRole("textbox", { name: /Add a note to Yingning/ }).fill(noteText);
    await notes.getByRole("button", { name: "Save marginalia" }).click();

    await expect(notes.getByText(noteText)).toBeVisible();
    await expect.poll(async () => page.evaluate((key) => {
      const saved = JSON.parse(localStorage.getItem(key) ?? "[]") as Array<{ text?: string; taleId?: string }>;
      return saved.map(({ text, taleId }) => ({ text, taleId }));
    }, STORAGE_KEYS.notes)).toContainEqual({ text: noteText, taleId: "yingning" });
  });

  test("malformed marginalia import is rejected rather than announced as merged", async ({ page }) => {
    await openRegister(page);
    await page.locator(".global-header").getByRole("button", { name: "Open marginalia" }).click();
    await page.locator('.notes-dialog input[type="file"]').setInputFiles({
      name: "broken.json",
      mimeType: "application/json",
      buffer: Buffer.from("{not-json"),
    });

    await expect(page.locator('.sr-only[role="status"]')).toContainText("not valid Liaozhai note JSON");
    await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEYS.notes)).toBeNull();
  });

  test("the desktop dossier separator is keyboard operable and persistent", async ({ page }) => {
    await openRegister(page);
    const separator = page.getByRole("separator", { name: "Resize the reading dossier" });
    await expect(separator).toHaveAttribute("aria-valuenow", "39");
    await separator.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(separator).toHaveAttribute("aria-valuenow", "40");
    await expect.poll(async () => page.evaluate((key) => {
      const saved = JSON.parse(localStorage.getItem(key) ?? "{}") as { dossierShare?: number };
      return saved.dossierShare;
    }, STORAGE_KEYS.panes)).toBe(40);
  });

  test("percentage, status, and favourites share one persistent reading record", async ({ page }) => {
    await openRegister(page);
    const dossier = page.locator("#reading-dossier");

    await dossier.getByRole("slider", { name: "Reading progress for Yingning" }).fill("78");
    await expect(dossier.locator(".tale-reading-copy output")).toHaveText("78%");
    await expect(dossier.getByRole("button", { name: "In progress" })).toHaveAttribute("aria-pressed", "true");
    await dossier.getByRole("button", { name: "Favourite" }).click();

    await expect.poll(async () => page.evaluate((key) => {
      const saved = JSON.parse(localStorage.getItem(key) ?? "{}") as {
        taleStates?: Record<string, { status?: string; percent?: number; favorite?: boolean }>;
      };
      return saved.taleStates?.yingning;
    }, STORAGE_KEYS.progress)).toEqual({ status: "in-progress", percent: 78, favorite: true });

    const operations = page.getByRole("complementary", { name: "Register operations" });
    await expect(operations.getByRole("button", { name: "In progress: 1" })).toBeVisible();
    await expect(operations.getByRole("button", { name: "All records: 30" })).toHaveAttribute("aria-pressed", "true");
    await expect(operations.getByRole("button", { name: "Favourites: 1" })).toBeVisible();

    await dossier.getByRole("button", { name: "Read", exact: true }).click();
    await expect(dossier.locator(".tale-reading-copy output")).toHaveText("100%");
    await expect(page.locator(".footer-ledger__total.ledger-total--read dd")).toHaveText("1");
  });

  test("map and table modes retain the same filter and selected record", async ({ page }) => {
    await openRegister(page);
    const operations = page.getByRole("complementary", { name: "Register operations" });

    await page.locator("#reading-dossier").getByRole("button", { name: "Favourite" }).click();
    await operations.getByRole("button", { name: "Table", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Representative tale ledger" })).toBeVisible();
    await operations.getByRole("button", { name: "Favourites: 1" }).click();
    await expect(page.locator(".tale-table tbody tr")).toHaveCount(1);
    await expect(page.locator(".tale-table tbody tr")).toContainText("Yingning");

    await operations.getByRole("button", { name: "Map", exact: true }).click();
    await expect(page.locator(".radial-stage > svg")).toBeVisible();
    await expect(page.locator("#reading-dossier h1")).toHaveText("Yingning");
    await expect(page.locator(".reading-filter-notice")).toContainText("1 favourite records");
  });

  test("settings describe local storage and require confirmation before reset", async ({ page }) => {
    await openRegister(page);
    const dossier = page.locator("#reading-dossier");
    await dossier.getByRole("slider", { name: "Reading progress for Yingning" }).fill("44");
    await dossier.getByRole("button", { name: "Favourite" }).click();

    await page.getByRole("button", { name: "Open reader settings" }).click();
    const settings = page.getByRole("dialog", { name: "Reader settings" });
    await expect(settings).toContainText("only in this browser");
    await settings.getByRole("button", { name: "Reset reading" }).click();
    await expect(settings.getByRole("button", { name: "Confirm reset" })).toBeVisible();
    await settings.getByRole("button", { name: "Keep progress" }).click();
    await expect(settings.getByRole("button", { name: "Reset reading" })).toBeVisible();

    await settings.getByRole("button", { name: "Reset reading" }).click();
    await settings.getByRole("button", { name: "Confirm reset" }).click();
    await expect.poll(async () => page.evaluate((key) => {
      const saved = JSON.parse(localStorage.getItem(key) ?? "{}") as { taleStates?: Record<string, unknown> };
      return Object.keys(saved.taleStates ?? {}).length;
    }, STORAGE_KEYS.progress)).toBe(0);
    await expect(settings).toContainText("0");
  });

  test("every workspace can be entered and the register can be restored", async ({ page }) => {
    await openRegister(page);
    const navigation = page.getByRole("navigation", { name: "Register workspaces" });
    const destinations = [
      ["Tales", "tales", "Representative tale ledger"],
      ["Relations", "relations", "The relation register"],
      ["Story world", "world", "A story-world chart, not a historical map"],
      ["Figures", "people", "Named figures and unstable identities"],
      ["Lexicon", "lexicon", "Terms that carry a world"],
      ["Method", "method", "How to read this register"],
    ] as const;

    for (const [tab, hash, heading] of destinations) {
      await navigation.getByRole("button", { name: tab, exact: true }).click();
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
      await expect(page).toHaveURL(new RegExp(`#${hash}$`));
    }

    await navigation.getByRole("button", { name: "Register", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Fifteen-register Liaozhai reading instrument" })).toBeAttached();
  });

  test("generated materials, ornament, and lazy workspaces load without runtime failures", async ({ page }) => {
    const pageErrors: string[] = [];
    const requestFailures: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => {
      requestFailures.push(`${request.method()} ${request.url()} · ${request.failure()?.errorText ?? "unknown failure"}`);
    });

    await openRegister(page);
    const materialAssets = await page.locator('img[src^="/assets/materials/"]').all();
    expect(materialAssets.length).toBeGreaterThanOrEqual(4);
    for (const asset of materialAssets) {
      await expect(asset).toBeVisible();
      expect(await asset.evaluate((image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0)).toBe(true);
    }

    const navigation = page.getByRole("navigation", { name: "Register workspaces" });
    await navigation.getByRole("button", { name: "Relations", exact: true }).click();
    await expect(page.getByRole("heading", { name: "The relation register" })).toBeVisible();
    await navigation.getByRole("button", { name: "Story world", exact: true }).click();
    await expect(page.getByRole("heading", { name: "A story-world chart, not a historical map" })).toBeVisible();
    await navigation.getByRole("button", { name: "Method", exact: true }).click();
    const ornament = page.locator('.method-ornament img[src$="liaozhai-bamboo-register.svg"]');
    await expect(ornament).toBeVisible();
    await expect.poll(() => ornament.evaluate(
      (image) => image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0,
    )).toBe(true);

    expect(pageErrors).toEqual([]);
    expect(requestFailures).toEqual([]);
  });

  test("the tale focus dialog pages records and closes with Escape", async ({ page }) => {
    await openRegister(page);

    await page.getByRole("button", { name: "Open tale dossier" }).click();
    let focus = page.getByRole("dialog", { name: "Yingning" });
    await expect(focus).toBeVisible();
    await expect(focus.getByRole("heading", { name: "What happens" })).toBeVisible();

    await focus.getByRole("button", { name: /Next record/ }).click();
    focus = page.getByRole("dialog", { name: "Jiaona" });
    await expect(focus).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.locator("#reading-dossier h1")).toHaveText("Jiaona");
  });

  test("tale focus exposes declared adjacent records separately from catalog paging", async ({ page }) => {
    await openRegister(page);
    await page.getByRole("button", { name: "Open tale dossier" }).click();
    const focus = page.getByRole("dialog", { name: "Yingning" });
    await expect(focus.getByRole("heading", { name: "Read beside this record" })).toBeVisible();
    await expect(focus.locator(".focus-adjacent button")).toHaveCount(4);
    await focus.locator(".focus-adjacent").getByRole("button", { name: /Jiaona/ }).click();
    await expect(page.getByRole("dialog", { name: "Jiaona" })).toBeVisible();
  });

  test("one modal remains active and Escape restores its trigger", async ({ page }) => {
    await openRegister(page);
    const trigger = page.getByRole("button", { name: "Open tale dossier" });
    await trigger.click();
    await expect(page.getByRole("dialog", { name: "Yingning" })).toBeVisible();

    await page.keyboard.press("ControlOrMeta+K");
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await expect(page.getByRole("dialog", { name: "Search the unofficial register" })).toHaveCount(0);

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test("dossier tabs implement roving focus and linked tabpanel semantics", async ({ page }) => {
    await openRegister(page);
    const record = page.getByRole("tab", { name: "record" });
    const analysis = page.getByRole("tab", { name: "analysis" });
    await record.focus();
    await page.keyboard.press("ArrowRight");

    await expect(record).toHaveAttribute("tabindex", "-1");
    await expect(analysis).toHaveAttribute("aria-selected", "true");
    await expect(analysis).toBeFocused();
    const panelId = await analysis.getAttribute("aria-controls");
    const tabId = await analysis.getAttribute("id");
    expect(panelId).toBeTruthy();
    expect(tabId).toBeTruthy();
    await expect(page.locator(`#${panelId}`)).toBeVisible();
    await expect(page.locator(`#${panelId}`)).toHaveAttribute("aria-labelledby", tabId!);
  });

  test("all fifteen register slips remain simultaneously visible at desktop width", async ({ page }) => {
    await openRegister(page);
    const result = await page.locator(".register-rail-scroll").evaluate((rail) => {
      const railBox = rail.getBoundingClientRect();
      const slips = [...rail.querySelectorAll<HTMLElement>(".register-slip")];
      return {
        count: slips.length,
        allInside: slips.every((slip) => {
          const box = slip.getBoundingClientRect();
          return box.left >= railBox.left - 1 && box.right <= railBox.right + 1;
        }),
      };
    });
    expect(result).toEqual({ count: 15, allInside: true });
  });

  test("dossier prose remains real selectable text", async ({ page }) => {
    await openRegister(page);
    const selection = await page.locator(".dossier-summary").evaluate((node) => {
      const range = document.createRange();
      range.selectNodeContents(node);
      const current = window.getSelection();
      current?.removeAllRanges();
      current?.addRange(range);
      return current?.toString().trim() ?? "";
    });
    expect(selection.length).toBeGreaterThan(40);
  });
});

test.describe("200 percent browser-reflow equivalent", () => {
  test.use({ viewport: { width: 768, height: 512 }, deviceScaleFactor: 1 });

  test("halves a 1536 by 1024 CSS viewport without relying on DPR", async ({ page }) => {
    await openRegister(page);

    const metrics = await page.evaluate(() => ({
      cssWidth: document.documentElement.clientWidth,
      pixelRatio: window.devicePixelRatio,
    }));
    expect(metrics).toEqual({ cssWidth: 768, pixelRatio: 1 });
    await expect(page.getByRole("button", { name: "Open workspace menu" })).toBeVisible();
    await page.getByRole("button", { name: "Open workspace menu" }).click();
    await expect(page.getByRole("navigation", { name: "Reading workspaces" })).toBeVisible();
    await expect(page.locator("#reading-dossier h1")).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
});

test.describe("actual Chromium 200 percent page scale", () => {
  test.use({ viewport: { width: 1536, height: 1024 }, deviceScaleFactor: 1 });

  test("keeps the vector instrument sharp and the reading text selectable", async ({ page }) => {
    await openRegister(page);
    const session = await page.context().newCDPSession(page);
    await session.send("Emulation.setPageScaleFactor", { pageScaleFactor: 2 });

    await expect.poll(() => page.evaluate(() => window.visualViewport?.scale ?? 1)).toBe(2);
    await expect(page.locator(".radial-stage > svg")).toBeVisible();
    await expect(page.locator(".dossier-summary")).toContainText(/father|daughter|spirit|scholar|family/i);
    expect(await page.locator(".dossier-summary").evaluate((node) => node instanceof HTMLElement && node.innerText.length > 40)).toBe(true);
    await expect(page).toHaveScreenshot("register-zoom200-1536x1024.png", {
      animations: "disabled",
      caret: "hide",
      fullPage: false,
    });
  });
});

test.describe("tablet register transformation", () => {
  test.use({ viewport: { width: 768, height: 1024 }, hasTouch: true });

  test("uses the full wheel with an overlay dossier and compact controls", async ({ page }) => {
    await openRegister(page);
    await expect(page.getByRole("region", { name: "Compact register controls" })).toBeVisible();
    await expect(page.getByRole("complementary", { name: "Register operations" })).toBeHidden();
    await expect(page.locator(".radial-stage > svg")).toBeVisible();
    await expect(page.locator("#reading-dossier")).toBeVisible();
    await expect.poll(() => page.locator("#reading-dossier").evaluate((node) => getComputedStyle(node).position)).toBe("absolute");

    await page.keyboard.press("Escape");
    await expect(page.locator("#reading-dossier")).toBeHidden();
    await page.getByRole("button", { name: /Open selected record/ }).tap();
    await expect(page.locator("#reading-dossier")).toBeVisible();
  });
});

test.describe("mobile register controls", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("offers compact view and filter controls plus a dismissible bottom dossier", async ({ page }) => {
    await openRegister(page);
    const toolbar = page.getByRole("region", { name: "Compact register controls" });
    await expect(toolbar).toBeVisible();
    await toolbar.getByRole("button", { name: "Table", exact: true }).tap();
    await expect(page.getByRole("heading", { name: "Representative tale ledger" })).toBeVisible();
    await toolbar.getByRole("button", { name: "Map", exact: true }).tap();
    await toolbar.getByLabel("Reading state").selectOption("unread");
    await expect(page.locator(".reading-filter-notice")).toContainText("unread records");

    const mapControl = toolbar.getByRole("button", { name: "Map", exact: true });
    await mapControl.focus();
    await page.keyboard.press("Escape");
    await expect(page.locator("#reading-dossier")).toBeHidden();
    await expect(mapControl).toBeFocused();
    const reopen = page.getByRole("button", { name: /Open selected record/ });
    await expect(reopen).toBeVisible();
    await reopen.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#reading-dossier")).toBeVisible();
    const dismiss = page.getByRole("button", { name: "Close selected tale panel" });
    await expect(dismiss).toBeFocused();

    await page.keyboard.press("Enter");
    await expect(page.locator("#reading-dossier")).toBeHidden();
    await expect(reopen).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(dismiss).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator("#reading-dossier")).toBeHidden();
    await expect(reopen).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#reading-dossier")).toBeVisible();
    await expect(dismiss).toBeFocused();

    await expect(page.locator(".figure-ring").first()).toBeHidden();
    await expect(page.locator(".evidence-ring")).toBeHidden();
    await expect(page.locator(".tale-sector").first()).toBeVisible();
  });

  test("keeps evidence, summary, and adjacent route visible before progress", async ({ page }) => {
    await openRegister(page);
    const geometry = await page.locator("#reading-dossier").evaluate((dossier) => {
      const sheet = dossier.querySelector<HTMLElement>(".dossier-sheet")!;
      const taxonomy = dossier.querySelector<HTMLElement>(".dossier-taxonomy-plate")!;
      const summary = dossier.querySelector<HTMLElement>(".dossier-summary")!;
      const trace = dossier.querySelector<HTMLElement>(".dossier-adjacent--trace")!;
      const progress = dossier.querySelector<HTMLElement>(".dossier-footer")!;
      const sheetBox = sheet.getBoundingClientRect();
      const boxes = [taxonomy, summary, trace, progress].map((node) => node.getBoundingClientRect());
      return {
        sheetTop: sheetBox.top,
        sheetBottom: sheetBox.bottom,
        taxonomyTop: boxes[0].top,
        taxonomyBottom: boxes[0].bottom,
        summaryTop: boxes[1].top,
        summaryBottom: boxes[1].bottom,
        traceTop: boxes[2].top,
        traceBottom: boxes[2].bottom,
        progressTop: boxes[3].top,
        scrollTop: sheet.scrollTop,
      };
    });

    expect(geometry.scrollTop).toBe(0);
    expect(geometry.taxonomyTop).toBeGreaterThanOrEqual(geometry.sheetTop - 1);
    expect(geometry.taxonomyBottom).toBeLessThanOrEqual(geometry.sheetBottom + 1);
    expect(geometry.summaryTop).toBeGreaterThan(geometry.taxonomyBottom);
    expect(geometry.summaryBottom).toBeLessThanOrEqual(geometry.sheetBottom + 1);
    expect(geometry.traceTop).toBeGreaterThan(geometry.summaryBottom);
    expect(geometry.traceBottom).toBeLessThanOrEqual(geometry.sheetBottom + 1);
    expect(geometry.progressTop).toBeGreaterThan(geometry.traceBottom);
  });

  test("touch zoom controls expose forty-four-pixel targets", async ({ page }) => {
    await openRegister(page);
    const zoomIn = page.getByRole("button", { name: "Zoom in" });
    const box = await zoomIn.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await zoomIn.tap();
    await expect(page.locator(".radial-zoom-layer")).toHaveAttribute("transform", /scale\(1\.08\)/);
  });
});

test.describe("reduced motion", () => {
  test.use({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });

  test("honors the preference while selection remains functional", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await openRegister(page);
    expect(await page.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches)).toBe(true);

    await page.locator('.register-slip[data-register-id="unquiet-dead"]').click();
    await expect(page.locator("#reading-dossier h1")).toHaveText("Nie Xiaoqian");
    await page.waitForTimeout(40);
    expect(await page.evaluate(() => document.getAnimations().filter((animation) => animation.playState === "running").length)).toBe(0);
  });
});

for (const viewport of [VIEWPORTS[0], VIEWPORTS.at(-1)!]) {
  test.describe(`accessibility at ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("has no detectable WCAG A or AA violations in the primary view", async ({ page }) => {
      await openRegister(page);
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      expect(results.violations, formatViolations(results.violations)).toEqual([]);
    });
  });
}

test.describe("synchronized state and secondary accessibility", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("cross-tab progress changes reconcile the visible tale selection", async ({ context, page }) => {
    const second = await context.newPage();
    await Promise.all([openRegister(page), openRegister(second)]);

    await second.locator('.register-slip[data-register-id="unquiet-dead"]').click();
    await expect(page.locator('.register-slip[data-register-id="unquiet-dead"]')).toHaveClass(/is-active/);
    await expect(page.locator("#reading-dossier")).toHaveAttribute("aria-label", "Selected tale: Nie Xiaoqian");
  });

  test("modal and Method states have no detectable WCAG A or AA violations", async ({ page }) => {
    await openRegister(page);
    await page.getByRole("button", { name: "Open tale dossier" }).click();
    const modalResults = await new AxeBuilder({ page })
      .include("dialog")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(modalResults.violations, formatViolations(modalResults.violations)).toEqual([]);
    await page.keyboard.press("Escape");

    await page.getByRole("navigation", { name: "Register workspaces" }).getByRole("button", { name: "Method", exact: true }).click();
    const methodResults = await new AxeBuilder({ page })
      .include("#workspace-main")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(methodResults.violations, formatViolations(methodResults.violations)).toEqual([]);
  });

  test("table, settings, and every secondary workspace remain axe-clean", async ({ page }) => {
    await openRegister(page);
    const operations = page.getByRole("complementary", { name: "Register operations" });
    const tags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

    await operations.getByRole("button", { name: "Table", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Representative tale ledger" })).toBeVisible();
    let results = await new AxeBuilder({ page }).include("#workspace-main").withTags(tags).analyze();
    expect(results.violations, `table\n${formatViolations(results.violations)}`).toEqual([]);

    const workspaces = [
      ["Relations", "The relation register"],
      ["Story world", "A story-world chart, not a historical map"],
      ["Figures", "Named figures and unstable identities"],
      ["Lexicon", "Terms that carry a world"],
      ["Method", "How to read this register"],
    ] as const;

    for (const [workspaceName, heading] of workspaces) {
      await operations.getByRole("button", { name: workspaceName, exact: true }).click();
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
      results = await new AxeBuilder({ page }).include("#workspace-main").withTags(tags).analyze();
      expect(results.violations, `${workspaceName}\n${formatViolations(results.violations)}`).toEqual([]);
    }

    await page.getByRole("button", { name: "Open reader settings" }).click();
    await expect(page.getByRole("dialog", { name: "Reader settings" })).toBeVisible();
    results = await new AxeBuilder({ page }).include("dialog").withTags(tags).analyze();
    expect(results.violations, `settings\n${formatViolations(results.violations)}`).toEqual([]);
  });
});
