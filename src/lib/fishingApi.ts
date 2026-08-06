import { resolveApiBase } from "./apiCodec";

export interface FishingCatchRow {
  species: string;
  user_name: string;
  weight: number;
  achieved_at: number;
}

export interface FishingResponse {
  v: number;
  week_id: string;
  week_leaders: FishingCatchRow[];
  fish_of_week: FishingCatchRow | null;
  trophies: FishingCatchRow[];
}

export type FishingFetchError = "no_api" | "offline" | "unknown";

export interface FishingFetchResult {
  ok: true;
  data: FishingResponse;
}

export interface FishingFetchFailure {
  ok: false;
  error: FishingFetchError;
}

export type FishingResult = FishingFetchResult | FishingFetchFailure;

export interface Catch {
  fish: string;
  player: string;
  weight: number;
}

export function mapCatchRow(row: FishingCatchRow): Catch {
  return {
    fish: row.species,
    player: row.user_name,
    weight: row.weight,
  };
}

export async function fetchFishingStats(
  params: URLSearchParams,
  secret: string,
): Promise<FishingResult> {
  const apiParam = params.get("api");
  const apiBase = await resolveApiBase(apiParam, secret);
  if (!apiBase) {
    return { ok: false, error: "no_api" };
  }

  const url = `${apiBase}/api/v1/fishing`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { ok: false, error: "offline" };
    const data = (await res.json()) as FishingResponse;
    if (!data || !Array.isArray(data.week_leaders) || !Array.isArray(data.trophies)) {
      return { ok: false, error: "unknown" };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "offline" };
  }
}
