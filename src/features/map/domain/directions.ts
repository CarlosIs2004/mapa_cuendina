/**
 * directions — map/domain.
 * Builds the "Abrir en Google Maps" link so people can navigate to a point
 * with the app they already use.
 */

/** Google Maps directions URL with the point as destination. */
export const googleMapsDirectionsUrl = (p: { lat: number; lng: number }): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`;
