/**
 * Каталог рубашек серий.
 * id совпадает с card_series.card_back_id и файлом imports/{id}.svg
 */
import defaultBack from "@/imports/card-back.svg";
import classicBack from "@/imports/card-back-classic.svg";
// series-pack:generated:back-imports:start
// series-pack:generated:back-imports:end

const CARD_BACKS: Record<string, string> = {
  "card-back": defaultBack,
  "card-back-classic": classicBack,
  // series-pack:generated:back-map:start
  // series-pack:generated:back-map:end
};

export const DEFAULT_CARD_BACK_ID = "card-back";

export function resolveCardBack(cardBackId?: string | null): string {
  const id = (cardBackId || DEFAULT_CARD_BACK_ID).trim() || DEFAULT_CARD_BACK_ID;
  return CARD_BACKS[id] ?? CARD_BACKS[DEFAULT_CARD_BACK_ID];
}
