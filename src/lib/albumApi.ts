import { resolveApiBase } from "./apiCodec";

export type RarityKey =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic"
  | "secretRare";

export interface AlbumSeries {
  id: string;
  name: string;
  owned: number;
  total: number;
  card_back_id?: string;
}

export interface AlbumCard {
  id: string;
  name: string;
  rarity: RarityKey;
  d: string;
  b: string;
  image_url?: string;
  series_id?: string;
  card_back_id?: string;
}

export interface AlbumResponse {
  v: number;
  u: string;
  series: AlbumSeries[];
  collection: { owned: number; total: number };
  cards: AlbumCard[];
}

export type AlbumFetchError =
  | "missing_params"
  | "no_api"
  | "unauthorized"
  | "not_found"
  | "offline"
  | "unknown";

export interface AlbumFetchResult {
  ok: true;
  data: AlbumResponse;
}

export interface AlbumFetchFailure {
  ok: false;
  error: AlbumFetchError;
}

export type AlbumResult = AlbumFetchResult | AlbumFetchFailure;

export async function fetchAlbum(
  params: URLSearchParams,
  secret: string,
): Promise<AlbumResult> {
  const u = params.get("u")?.trim() ?? "";
  const k = params.get("k")?.trim() ?? "";
  const exp = params.get("exp")?.trim() ?? "";
  const apiParam = params.get("api");

  if (!u || !k || !exp) {
    return { ok: false, error: "missing_params" };
  }

  const apiBase = await resolveApiBase(apiParam, secret);
  if (!apiBase) {
    return { ok: false, error: "no_api" };
  }

  const qs = new URLSearchParams({ u, k, exp });
  const url = `${apiBase}/api/v1/album?${qs}`;

  try {
    const res = await fetch(url);
    if (res.status === 401) return { ok: false, error: "unauthorized" };
    if (res.status === 404) return { ok: false, error: "not_found" };
    if (!res.ok) return { ok: false, error: "offline" };
    const data = (await res.json()) as AlbumResponse;
    return { ok: true, data };
  } catch {
    return { ok: false, error: "offline" };
  }
}
