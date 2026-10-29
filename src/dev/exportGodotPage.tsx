/**
 * Standalone render stage for scripts/export-godot-assets.mjs.
 * Served by `vite dev` at /export-godot.html; the app itself never imports it.
 * Renders one card (the real CardSVG) or one series card back at native 350×490,
 * ready for an element screenshot.
 *
 * Only fonts.css + typography.css are imported on purpose: they style the
 * princess name. cardEffects.css carries the animations (portrait fade-in,
 * holo/mythic sweeps) — skipping it freezes every card in a deterministic
 * rest frame, which is what we want for baking PNGs.
 */
import type { ReactElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { CATALOG_ORDER, getCatalogEntry } from "@/lib/cardCatalog";
import {
  SERIES,
  getSeriesMeta,
  seriesCatalogOrder,
  seriesCardNumber,
} from "@/lib/seriesMeta";
import { resolveCardBack } from "@/lib/cardBacks";
import { CFG } from "@/app/rarityConfig";
import { CardSVG } from "@/app/cards/CardSVG";
import type { RarityKey } from "@/app/types";
import "@/styles/fonts.css";
import "@/styles/typography.css";

const CARD_W = 350;
const CARD_H = 490;

export interface GodotCardInfo {
  id: string;
  name: string;
  rarity: RarityKey;
  portrait: string;
  seriesId: string;
  seriesName: string;
  cardBackId: string;
  backUrl: string;
  num: number;
  seriesCount: number;
}

const stage = document.getElementById("stage")!;
stage.style.width = `${CARD_W}px`;
stage.style.height = `${CARD_H}px`;

let root: Root | null = null;

function renderStage(node: ReactElement) {
  if (!root) root = createRoot(stage);
  root.render(node);
}

function nextFrame(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

function preloadImage(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`image failed to load: ${url}`));
    img.src = url;
  });
}

function listCards(): GodotCardInfo[] {
  return CATALOG_ORDER.flatMap<GodotCardInfo>((slug) => {
    const entry = getCatalogEntry(slug);
    if (!entry?.portrait) return [];
    const series = getSeriesMeta(slug);
    const num = seriesCardNumber(slug);
    return [{
      id: entry.id,
      name: entry.name,
      rarity: entry.rarity,
      portrait: entry.portrait,
      seriesId: series.id,
      seriesName: series.name,
      cardBackId: series.cardBackId,
      backUrl: resolveCardBack(series.cardBackId),
      num: num.n,
      seriesCount: num.total,
    }];
  });
}

function listSeries() {
  return Object.values(SERIES).map((s) => ({
    id: s.id,
    name: s.name,
    cardBackId: s.cardBackId,
    backUrl: resolveCardBack(s.cardBackId),
    count: seriesCatalogOrder(s.id).length,
  }));
}

function listRarities() {
  return (Object.keys(CFG) as RarityKey[]).map((key) => ({
    key,
    name: CFG[key].name,
    tier: CFG[key].tier,
    color: CFG[key].color,
  }));
}

async function renderCard(card: GodotCardInfo): Promise<void> {
  await preloadImage(card.portrait);
  renderStage(
    <div style={{ width: "100%", height: "100%" }}>
      <CardSVG rarity={card.rarity} portrait={card.portrait} princessName={card.name} />
    </div>,
  );
  await nextFrame();
}

async function renderBack(url: string): Promise<void> {
  await preloadImage(url);
  renderStage(
    <img
      src={url}
      alt=""
      draggable={false}
      style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
    />,
  );
  await nextFrame();
}

async function fontsReady(): Promise<void> {
  try {
    // If Google Fonts is unreachable the card falls back to Georgia — still fine.
    await Promise.race([
      Promise.all([
        document.fonts.load('700 17px "PT Serif Caption"'),
        document.fonts.load('400 17px "PT Serif Caption"'),
        document.fonts.ready,
      ]),
      new Promise((resolve) => setTimeout(resolve, 10_000)),
    ]);
  } catch {
    /* keep the serif fallback */
  }
}

(window as unknown as Record<string, unknown>).__godotExport = {
  listCards,
  listSeries,
  listRarities,
  renderCard,
  renderBack,
  fontsReady,
};
