/**
 * PointsTransfer — points/domain.
 * The JSON exchange format for sharing user points between browsers, and the
 * rules for reading and merging an imported payload. No file or DOM access
 * here; reading files and downloading happen in presentation/infrastructure.
 */

import { Point, type PointSnapshot } from "./Point";

export const TRANSFER_VERSION = 1;

/** Versioned export document. */
export interface PointsExportDocument {
  version: typeof TRANSFER_VERSION;
  exportedAt: string;
  points: PointSnapshot[];
}

/** Outcome counts shown to the user after an import. */
export interface ImportSummary {
  imported: number;
  skipped: number;
}

/** Builds the export document for the given user points. */
export function toExportDocument(points: readonly Point[], exportedAt: Date): PointsExportDocument {
  return { version: TRANSFER_VERSION, exportedAt: exportedAt.toISOString(), points: points.map((p) => p.toSnapshot()) };
}

/**
 * Extracts the raw entries of a payload. Accepts the versioned document and a
 * bare array (the shape the old single-file app kept in localStorage).
 * Returns null when the shape is not recognized.
 */
export function payloadEntries(payload: unknown): unknown[] | null {
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object" && payload !== null && Array.isArray((payload as { points?: unknown }).points))
    return (payload as { points: unknown[] }).points;
  return null;
}

/**
 * Validates entries and merges them with existing points. An entry is skipped
 * when invalid, a reference id ("ref-"), already present, or repeated in the file.
 */
export function mergeImported(existing: readonly Point[], entries: readonly unknown[]): { accepted: Point[]; skipped: number } {
  const seen = new Set(existing.map((p) => p.id));
  const accepted: Point[] = [];
  for (const entry of entries) {
    const point = Point.parse(entry);
    if (!point || !point.isUserPoint || seen.has(point.id)) continue;
    seen.add(point.id);
    accepted.push(point);
  }
  return { accepted, skipped: entries.length - accepted.length };
}
