import { CATALOG_ORDER } from "./cardCatalog";

export type SeriesId = "fantast" | "classic";

export interface SeriesMeta {
  id: SeriesId;
  name: string;
  cardBackId: string;
  /** DEV-подпись бустера, пока нет album API */
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
};

export function seriesIdFromSlug(slug: string | undefined): SeriesId {
  if (slug?.startsWith("classic-")) return "classic";
  return "fantast";
}

export function getSeriesMeta(slug: string | undefined): SeriesMeta {
  return SERIES[seriesIdFromSlug(slug)];
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
