import { CATALOG_ORDER, getCatalogEntry } from "@/lib/cardCatalog";
import { getSeriesMeta } from "@/lib/seriesMeta";
import type { CardDef } from "./types";

/** DEV-превью полного каталога — редкости и портреты из cardCatalog. */
export const CARDS: CardDef[] = CATALOG_ORDER.map((slug) => {
  const entry = getCatalogEntry(slug)!;
  const series = getSeriesMeta(slug);
  return {
    princess: entry.name,
    rarity: entry.rarity,
    portrait: entry.portrait,
    slug: entry.id,
    cardBackId: series.cardBackId,
    booster: series.boosterLabel,
  };
});
