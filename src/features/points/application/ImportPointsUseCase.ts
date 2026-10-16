/**
 * ImportPointsUseCase — points/application.
 * "Importar puntos (JSON)": parses JSON text, validates each point in the
 * domain, merges new ones (dedupe by id) and persists them.
 */

import { Result } from "../../../shared/domain/Result";
import type { PointRepository } from "../domain/PointRepository";
import { mergeImported, payloadEntries, type ImportSummary } from "../domain/PointsTransfer";
import type { PointsStore } from "./PointsStore";

/** Imports user points from exported JSON or the old localStorage array. */
export class ImportPointsUseCase {
  constructor(
    private readonly repository: PointRepository,
    private readonly store: PointsStore,
  ) {}

  /** Fails (without changing data) when the text is not JSON or not a recognized shape. */
  async execute(jsonText: string): Promise<Result<ImportSummary>> {
    let payload: unknown;
    try {
      payload = JSON.parse(jsonText);
    } catch {
      return Result.fail(new Error("Invalid JSON"));
    }
    const entries = payloadEntries(payload);
    if (!entries) return Result.fail(new Error("Unrecognized points file"));

    const { accepted, skipped } = mergeImported(this.store.state.userPoints, entries);
    for (const point of accepted) await this.repository.add(point);
    if (accepted.length) this.store.setUserPoints([...this.store.state.userPoints, ...accepted]);
    return Result.ok({ imported: accepted.length, skipped });
  }
}
