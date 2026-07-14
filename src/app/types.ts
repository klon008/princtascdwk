import type { RarityKey } from "@/lib/albumApi";

export type { RarityKey };

export type AlbumViewState =
  | "landing"
  | "loading"
  | "album"
  | "offline"
  | "unauthorized"
  | "not_found";

export interface CardDef {
  princess: string;
  rarity: RarityKey;
  portrait?: string;
  obtainedDate?: string;
  booster?: string;
  slug?: string;
  /** id рубашки серии (card_series.card_back_id) */
  cardBackId?: string;
}

export interface CardDetails {
  story: string;
  booster: string;
  obtainedDate: string;
}
