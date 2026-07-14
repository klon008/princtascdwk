/**
 * Каталог рубашек серий.
 * id совпадает с card_series.card_back_id и файлом imports/{id}.svg
 */
import defaultBack from "@/imports/card-back.svg";

const CARD_BACKS: Record<string, string> = {
  "card-back": defaultBack,
};

export const DEFAULT_CARD_BACK_ID = "card-back";

export function resolveCardBack(cardBackId?: string | null): string {
  const id = (cardBackId || DEFAULT_CARD_BACK_ID).trim() || DEFAULT_CARD_BACK_ID;
  return CARD_BACKS[id] ?? CARD_BACKS[DEFAULT_CARD_BACK_ID];
}
