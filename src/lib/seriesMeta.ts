import { CATALOG_ORDER, getCatalogEntry } from "./cardCatalog";

export type SeriesId = string;

export interface SeriesMeta {
  id: SeriesId;
  name: string;
  cardBackId: string;
  /** DEV-подпись бустера, пока нет данных с API */
  boosterLabel: string;
}

export const SERIES: Record<SeriesId, SeriesMeta> = {
  fantast: {
    id: "fantast",
    name: "Фантастический коллекционер",
    cardBackId: "card-back",
    boosterLabel: "Серия «Фантастический коллекционер» · Тираж № 001",
  },
  classic: {
    id: "classic",
    name: "Классический набор",
    cardBackId: "card-back-classic",
    boosterLabel: "Серия «Классический набор» · Тираж № 001",
  },
  // series-pack:generated:series:start
  
  "summer-2026": {
    id: "summer-2026",
    name: "Пляжный сезон",
    cardBackId: "card-back-summer-2026",
    boosterLabel: "Серия «Пляжный сезон» · Тираж № 001",
  },
// series-pack:generated:series:end
};

export function seriesIdFromSlug(slug: string | undefined): SeriesId {
  if (!slug) return "fantast";
  const entry = getCatalogEntry(slug);
  if (entry?.seriesId) return entry.seriesId;
  if (slug.startsWith("classic-")) return "classic";
  return "fantast";
}

export function getSeriesMeta(slug: string | undefined): SeriesMeta {
  const id = seriesIdFromSlug(slug);
  return SERIES[id] ?? SERIES.fantast;
}

/** Карты одной серии в порядке каталога. */
export function seriesCatalogOrder(seriesId: SeriesId): string[] {
  return CATALOG_ORDER.filter((s) => seriesIdFromSlug(s) === seriesId);
}

/** № карты внутри своей серии (1-based) и размер серии. */
export function seriesCardNumber(slug: string | undefined): {
  n: number;
  total: number;
  seriesName: string;
} {
  const series = getSeriesMeta(slug);
  const order = seriesCatalogOrder(series.id);
  const idx = slug ? order.indexOf(slug) : -1;
  return {
    n: idx >= 0 ? idx + 1 : 0,
    total: order.length,
    seriesName: series.name,
  };
}
