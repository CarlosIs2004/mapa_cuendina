/**
 * SupabaseReferenceSource — points/infrastructure (adapter).
 * Reads the shared `lugares` table through Supabase's REST API with the public
 * (publishable) key. Rows become fixed points, like the built-in references.
 * Table schema: db/lugares.sql, db/visitado.sql.
 */

import { Point } from "../domain/Point";

interface LugarRow {
  id: number;
  nombre: string;
  tipo: string;
  lat: number;
  lng: number;
  visitado: boolean;
}

const TIMEOUT_MS = 5000;

/**
 * Fetches the shared places. Resolves to [] when the URL or key is missing;
 * rejects on network, timeout or HTTP errors so the caller can fall back.
 */
export async function fetchSharedPoints(url: string | undefined, key: string | undefined): Promise<Point[]> {
  if (!url || !key) return [];
  const response = await fetch(`${url}/rest/v1/lugares?select=id,nombre,tipo,lat,lng,visitado`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Supabase responded ${response.status}`);
  const rows = (await response.json()) as LugarRow[];
  return rows.flatMap((row) => {
    // "ref-" ids are fixed points: the UI cannot delete them.
    const point = Point.parse({ id: `ref-${row.id}`, name: row.nombre, category: row.tipo, lat: row.lat, lng: row.lng, visited: row.visitado });
    return point ? [point] : [];
  });
}

/** Persists the visited state through the `marcar_visitado` RPC (the table itself is read-only). */
export async function saveVisited(url: string | undefined, key: string | undefined, pointId: string, visited: boolean): Promise<void> {
  if (!url || !key) throw new Error("Supabase is not configured");
  const response = await fetch(`${url}/rest/v1/rpc/marcar_visitado`, {
    method: "POST",
    headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_id: Number(pointId.replace(/^ref-/, "")), p_visitado: visited }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Supabase responded ${response.status}`);
}
