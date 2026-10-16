/**
 * communityArea — area/domain.
 * The Cuendina boundary from the requirements, and the two derived areas the
 * app uses: the exact limit (export) and a padded one (on-screen panning).
 */

import { LatLng } from "../../../shared/domain/LatLng";
import { GeoBounds } from "./GeoBounds";

/** Boundary reference points (the Av. Gral. Rumiñahui marks the eastern edge). */
export const LIMIT_POINTS: readonly LatLng[] = [
  new LatLng(-0.39314438349830977, -78.50735664367677),
  new LatLng(-0.38151459097529916, -78.51619720458986),
  new LatLng(-0.3610014871800428, -78.49388122558595),
  new LatLng(-0.39284398315515895, -78.51572513580324),
  new LatLng(-0.39288689749056177, -78.49383831024171),
  new LatLng(-0.39288689749056177, -78.4777879714966),
  new LatLng(-0.3790684702359321, -78.47508430480958),
];

/** Exact area: drawn as the dashed rectangle and used for export. */
export const LIMIT_BOUNDS = GeoBounds.fromPoints(LIMIT_POINTS);

/** 15% larger area so users can pan slightly beyond the limit on screen. */
export const VIEW_BOUNDS = LIMIT_BOUNDS.pad(0.15);
