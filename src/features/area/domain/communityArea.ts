/**
 * communityArea — area/domain.
 * The Cuendina boundary from the requirements, and the two derived areas the
 * app uses: the exact limit (export) and a padded one (on-screen panning).
 */

import { LatLng } from "../../../shared/domain/LatLng";
import { GeoBounds } from "./GeoBounds";

/** Boundary reference points (the Av. Gral. Rumiñahui marks the eastern edge). */
export const LIMIT_POINTS: readonly LatLng[] = [
  new LatLng(-0.3909986665249684, -78.52572441101076),
  new LatLng(-0.3699706438191488, -78.5276555826159),
  new LatLng(-0.34533781551028914, -78.49478240218458),
  new LatLng(-0.3862780872575675, -78.52675437927248),
  new LatLng(-0.3908270091433711, -78.4968423843384),
  new LatLng(-0.39211643521496226, -78.47074120471324),
  new LatLng(-0.36440194764813816, -78.47066902999498),
];

/** Exact area: drawn as the dashed rectangle and used for export. */
export const LIMIT_BOUNDS = GeoBounds.fromPoints(LIMIT_POINTS);

/** 15% larger area so users can pan slightly beyond the limit on screen. */
export const VIEW_BOUNDS = LIMIT_BOUNDS.pad(0.15);
