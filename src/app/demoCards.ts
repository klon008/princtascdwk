import { CATALOG_ORDER, getCatalogEntry } from "@/lib/cardCatalog";
import type { CardDef } from "./types";

/** DEV-превью полного каталога — редкости и портреты из cardCatalog. */
export const CARDS: CardDef[] = CATALOG_ORDER.map((slug) => {
  const entry = getCatalogEntry(slug)!;
  return {
    princess: entry.name,
    rarity: entry.rarity,
    portrait: entry.portrait,
    slug: entry.id,
  };
});
