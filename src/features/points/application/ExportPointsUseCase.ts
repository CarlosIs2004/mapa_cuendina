/**
 * ExportPointsUseCase — points/application.
 * "Exportar puntos (JSON)": packages the user points (not the fixed
 * references) so they can be moved to another browser or shared.
 */

import { toExportDocument, type PointsExportDocument } from "../domain/PointsTransfer";
import type { PointsStore } from "./PointsStore";

/** File name plus document to be downloaded by the presentation layer. */
export interface PointsExport {
  fileName: string;
  document: PointsExportDocument;
}

const pad2 = (n: number) => String(n).padStart(2, "0");

/** Builds the JSON export of user points. */
export class ExportPointsUseCase {
  /** @param clock Current time source (injectable for tests). */
  constructor(
    private readonly store: PointsStore,
    private readonly clock: () => Date = () => new Date(),
  ) {}

  /** Returns `puntos-cuendina-YYYY-MM-DD.json` (local date) and the versioned document. */
  execute(): PointsExport {
    const now = this.clock();
    const date = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
    return { fileName: `puntos-cuendina-${date}.json`, document: toExportDocument(this.store.state.userPoints, now) };
  }
}
