/**
 * Export catalog cards + series card backs as PNGs + manifest.json
 * for the Godot memory game.
 *
 * Spins up a throwaway `vite dev` server, opens /export-godot.html in a
 * headless Chromium-family browser (system Edge/Chrome — nothing is downloaded),
 * renders every catalog card through the real CardSVG component and saves
 * element screenshots. Output is deterministic: cardEffects.css animations
 * are intentionally not loaded on the stage.
 *
 * Usage (PowerShell):
 *   node scripts/export-godot-assets.mjs
 *   node scripts/export-godot-assets.mjs --only classic --scale 2 --out godot-export
 *
 * Flags:
 *   --only <substr>  export cards whose id/name contains <substr> (backs always go)
 *   --scale <n>      deviceScaleFactor, default 2 → PNG 700×980 from the 350×490 card
 *   --out <dir>      output dir, default godot-export/
 *
 * Output layout:
 *   godot-export/cards/<slug>.png     card face (rounded corners are transparent)
 *   godot-export/backs/<back-id>.png  series card back
 *   godot-export/manifest.json        cards/series/rarities metadata for Godot
 *
 * Note: cards/ and backs/ are cleaned on every run (generated output).
 */

import { mkdirSync, writeFileSync, rmSync, statSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";
import { chromium } from "playwright-core";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const CARD_W = 350;
const CARD_H = 490;

function argValue(name, fallback) {
  const i = process.argv.indexOf(name);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return fallback;
}

const OUT = resolve(ROOT, argValue("--out", "godot-export"));
const SCALE = Math.max(1, Number(argValue("--scale", "2")) || 2);
const ONLY = argValue("--only", "").toLowerCase();

/** System browsers only — playwright-core never downloads anything. */
async function launchBrowser() {
  for (const channel of ["msedge", "chrome"]) {
    try {
      return await chromium.launch({ channel, headless: true });
    } catch {
      /* try next */
    }
  }
  try {
    return await chromium.launch({ headless: true });
  } catch {
    throw new Error(
      "No browser found. Install Edge or Chrome, or run: npm i -D playwright && npx playwright install chromium",
    );
  }
}

function dirSize(dir) {
  let total = 0;
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    total += st.isDirectory() ? dirSize(p) : st.size;
  }
  return total;
}

async function main() {
  const cardsDir = join(OUT, "cards");
  const backsDir = join(OUT, "backs");
  rmSync(cardsDir, { recursive: true, force: true });
  rmSync(backsDir, { recursive: true, force: true });
  mkdirSync(cardsDir, { recursive: true });
  mkdirSync(backsDir, { recursive: true });

  console.log("Starting throwaway vite dev server...");
  const server = await createServer({
    root: ROOT,
    logLevel: "error",
    server: { port: 0 },
  });
  await server.listen();
  const baseUrl = server.resolvedUrls?.local?.[0];
  if (!baseUrl) throw new Error("vite dev server did not report a local URL");
  const pageUrl = new URL("export-godot.html", baseUrl).href;

  console.log("Launching headless browser...");
  const browser = await launchBrowser();

  const consoleErrors = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1100, height: 720 }, // wide enough for .card-princess-name clamp() max
      deviceScaleFactor: SCALE,
    });
    const page = await context.newPage();
    page.on("pageerror", (e) => consoleErrors.push(`pageerror: ${e}`));
    page.on("console", (m) => {
      if (m.type() === "error") consoleErrors.push(`console: ${m.text()}`);
    });

    console.log("Loading stage:", pageUrl);
    await page.goto(pageUrl, { waitUntil: "load", timeout: 120_000 });
    await page.waitForFunction(
      () => Boolean((window).__godotExport),
      null,
      { timeout: 60_000 },
    );
    await page.evaluate(() => (window).__godotExport.fontsReady());

    const shotInto = async (filePath) => {
      await page
        .locator("#stage > *")
        .first()
        .screenshot({ path: filePath, omitBackground: true, animations: "disabled" });
    };

    // ── Series card backs ────────────────────────────────────────────────
    const series = await page.evaluate(() => (window).__godotExport.listSeries());
    const backFiles = {};
    for (const s of series) {
      await page.evaluate((url) => (window).__godotExport.renderBack(url), s.backUrl);
      const file = `backs/${s.cardBackId}.png`;
      await shotInto(join(OUT, file));
      backFiles[s.cardBackId] = file;
      console.log(`back: ${file}`);
    }

    // ── Cards ────────────────────────────────────────────────────────────
    let cards = await page.evaluate(() => (window).__godotExport.listCards());
    if (ONLY) cards = cards.filter((c) => c.id.toLowerCase().includes(ONLY) || c.name.toLowerCase().includes(ONLY));
    console.log(`Exporting ${cards.length} cards at scale ${SCALE} → ${CARD_W * SCALE}×${CARD_H * SCALE}px`);
    const exported = [];
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      try {
        await page.evaluate((c) => (window).__godotExport.renderCard(c), card);
        const file = `cards/${card.id}.png`;
        await shotInto(join(OUT, file));
        exported.push({
          id: card.id,
          name: card.name,
          rarity: card.rarity,
          seriesId: card.seriesId,
          seriesName: card.seriesName,
          cardBackId: card.cardBackId,
          num: card.num,
          seriesCount: card.seriesCount,
          img: file,
          back: backFiles[card.cardBackId] ?? null,
        });
      } catch (e) {
        console.warn(`  ! skipped ${card.id}: ${e?.message ?? e}`);
      }
      if ((i + 1) % 10 === 0 || i + 1 === cards.length) console.log(`  ${i + 1}/${cards.length}`);
    }

    // ── Manifest ─────────────────────────────────────────────────────────
    const rarities = await page.evaluate(() => (window).__godotExport.listRarities());
    const manifest = {
      generatedAt: new Date().toISOString(),
      source: "princtascdwk · Зачарованный архив",
      pixelSize: { width: CARD_W * SCALE, height: CARD_H * SCALE },
      rarities,
      series: series.map((s) => ({
        id: s.id,
        name: s.name,
        cardBackId: s.cardBackId,
        count: s.count,
        back: backFiles[s.cardBackId] ?? null,
      })),
      cards: exported,
    };
    const manifestPath = join(OUT, "manifest.json");
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

    console.log(
      `\nDone: ${exported.length}/${cards.length} cards, ${series.length} backs → ${OUT}` +
      ` (${(dirSize(OUT) / 1024 / 1024).toFixed(1)} MB)`,
    );
    if (ONLY && exported.length === 0) {
      console.warn(`No cards matched --only "${ONLY}".`);
    }
    if (consoleErrors.length) {
      console.warn(`${consoleErrors.length} browser error(s) during export (first 10):`);
      for (const e of consoleErrors.slice(0, 10)) console.warn("  -", e);
    }
  } finally {
    await browser.close().catch(() => {});
    await server.close().catch(() => {});
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
