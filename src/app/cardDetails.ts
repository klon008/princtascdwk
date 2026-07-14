import type { CardDetails } from "./types";
import raw from "./cardDetails.json";

/** DEV-заглушки бустера/даты, пока нет данных с API. */
export const FIRST_EDITION_BOOSTER =
  "Серия «Фантастический коллекционер» · Тираж № 001";
export const COLLECTION_START_DATE = "12 июля 2026";

const STORIES: Record<string, string> =
  raw && typeof raw === "object" && "stories" in raw
    ? ((raw as { stories: Record<string, string> }).stories ?? {})
    : {};

/** Описание лора по slug карты (`cinderella`, …). Источник: cardDetails.json. */
export function getCardStory(slug: string | undefined): string | undefined {
  if (!slug) return undefined;
  const s = STORIES[slug];
  return typeof s === "string" && s.trim() ? s : undefined;
}

/**
 * DEV / legacy: детали для модалки без album API.
 * Бустер и дата в проде приходят с API (`card.booster` / `card.obtainedDate`).
 */
export function getCardDetails(slug: string | undefined): CardDetails | undefined {
  const story = getCardStory(slug);
  if (!story) return undefined;
  return {
    story,
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  };
}
