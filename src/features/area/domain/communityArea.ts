/**
 * communityArea — area/domain.
 * The Cuendina boundary from the requirements, and the two derived areas the
 * app uses: the exact limit (export) and a padded one (on-screen panning).
 */

import { LatLng } from "../../../shared/domain/LatLng";
import { GeoBounds } from "./GeoBounds";

/** Boundary reference points (the Av. Gral. Rumiñahui marks the eastern edge). */
export const LIMIT_POINTS: readonly LatLng[] = [
  new LatLng(-0.3758942828902126, -78.49456872010586),
  new LatLng(-0.3873115067829975, -78.51212194292775),
  new LatLng(-0.3665785483732827, -78.47564224197447),
  new LatLng(-0.400356821282775, -78.50074857530066),
  new LatLng(-0.3995853616717257, -78.48525482090285),
  new LatLng(-0.39190074686962606, -78.4722071696194),
  new LatLng(-0.37967150464754157, -78.47049213286999),
];

/** Exact area: drawn as the dashed rectangle and used for export. */
export const LIMIT_BOUNDS = GeoBounds.fromPoints(LIMIT_POINTS);

/** 15% larger area so users can pan slightly beyond the limit on screen. */
export const VIEW_BOUNDS = LIMIT_BOUNDS.pad(0.15);
