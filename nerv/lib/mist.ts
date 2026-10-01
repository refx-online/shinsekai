const MIST_URL = process.env.PUBLIC_API_URL ?? "http://localhost:7273";
const BANCHO_URL = process.env.PUBLIC_BANCHO_URL ?? "http://localhost:7777";

async function getJson<T>(url: string, label: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch ${label}: ${res.status}`);
  return (await res.json()) as T;
}

export interface HistoryCaptures {
  status: string;
  data: {
    user_id: number;
    mode: number;
    captures: { captured_at: string; rank?: number; overall?: number; country?: number }[];
  };
}

export async function fetchProfileHistory(
  scope: "pp" | "rank" | "peak",
  uid: number,
  mode: number
): Promise<HistoryCaptures> {
  return getJson<HistoryCaptures>(
    `${MIST_URL}/v1/get_player_history?scope=${scope}&id=${uid}&mode=${mode}`,
    `profile history ${scope} ${uid}`
  );
}

export interface PlayerStatus {
  status: string;
  player_status?: {
    online: boolean;
    status?: { beatmap?: { id: number } };
  };
}

export async function fetchPlayerStatus(uid: number): Promise<PlayerStatus> {
  return getJson<PlayerStatus>(`${BANCHO_URL}/api/v1/get_player_status?id=${uid}`, `status ${uid}`);
}

export interface MapInfo {
  id: number;
  set_id: number;
  status: number;
  md5: string;
  artist: string;
  title: string;
  version: string;
  creator: string;
  total_length: number;
  diff: number;
  cs: number;
  ar: number;
  od: number;
  hp: number;
  max_combo: number;
  plays: number;
  passes: number;
}

export async function fetchBeatmap(
  beatmapId: number
): Promise<{ status: string; map?: MapInfo }> {
  return getJson<{ status: string; map?: MapInfo }>(
    `${MIST_URL}/v1/get_map_info?id=${beatmapId}`,
    `beatmap ${beatmapId}`
  );
}
