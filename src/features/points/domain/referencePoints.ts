/**
 * referencePoints — points/domain.
 * Fixed points shown to everyone: landmarks and reported robbery locations
 * (coordinates taken from the Google Maps links in the requirements). They are
 * not stored and cannot be deleted.
 */

import { Point } from "./Point";

/** Fixed points shown on the map: reported robbery locations. */
export const REFERENCE_POINTS: readonly Point[] = [
  { id: "ref-4", name: "Asalto / robo 1", category: "robos" as const, lat: -0.385152, lng: -78.510945, description: "Lugar de asaltos / robos." },
  { id: "ref-5", name: "Asalto / robo 2", category: "robos" as const, lat: -0.38690138030862953, lng: -78.50744694998298, description: "Lugar de asaltos / robos." },
  { id: "ref-6", name: "Asalto / robo 3", category: "robos" as const, lat: -0.3854215218788336, lng: -78.50829869655665, description: "Lugar de asaltos / robos." },
].map((s) => Point.fromSnapshot(s));
