/**
 * MapView — map/domain (port).
 * What the rest of the app needs from an interactive map, without naming
 * Leaflet. The composition root depends on this interface;
 * `LeafletMapAdapter` implements it.
 */

import type { LatLng } from "../../../shared/domain/LatLng";
import type { Point } from "../../points/domain/Point";

/** Interactive map contract. */
export interface MapView {
  /** Replaces all markers with the given points. */
  showPoints(points: readonly Point[]): void;
  /** Flies to a point and opens its popup. */
  focus(point: Point): void;
  /** Enables/disables "click to place a point" mode (crosshair cursor). */
  setAddMode(enabled: boolean): void;
  /** Called with the clicked position while add mode is on. */
  onPick(handler: (position: LatLng) => void): void;
  /** Called when the user presses "Eliminar punto" in a popup. */
  onDeleteRequest(handler: (pointId: string) => void): void;
  /** Closes any open popup. */
  closePopup(): void;
}
