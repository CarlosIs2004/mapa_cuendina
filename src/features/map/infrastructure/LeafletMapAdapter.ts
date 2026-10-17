/**
 * LeafletMapAdapter — map/infrastructure (adapter).
 * Implements the MapView port with Leaflet + OpenStreetMap tiles. This is the
 * only module that knows about Leaflet; swapping map libraries means writing
 * another MapView implementation.
 *
 * OSM tiles require an http(s) origin: under file:// no Referer is sent and
 * tile.openstreetmap.org responds 403, so run the app with `npm run dev`.
 */

import L from "leaflet";
import { LatLng } from "../../../shared/domain/LatLng";
import type { GeoBounds } from "../../area/domain/GeoBounds";
import type { Category, CategoryCatalog } from "../../points/domain/Category";
import type { Point } from "../../points/domain/Point";
import type { MapView } from "../domain/MapView";
import { popupHtml } from "./popupTemplate";

export interface LeafletMapOptions {
  /** Area users can pan within. */
  viewBounds: GeoBounds;
  /** Exact community limit, drawn as a dashed rectangle. */
  limitBounds: GeoBounds;
  catalog: CategoryCatalog;
}

const VISITED_COLOR = "#16a34a";
const PENDING_COLOR = "#ef4444";

const toLeaflet = (b: GeoBounds): L.LatLngBounds => L.latLngBounds([b.south, b.west], [b.north, b.east]);

/** Leaflet-backed interactive map. */
export class LeafletMapAdapter implements MapView {
  private readonly map: L.Map;
  private readonly layer: L.LayerGroup;
  private readonly markers = new Map<string, L.Marker>();
  private addMode = false;
  private pickHandler: (position: LatLng) => void = () => {};
  private deleteHandler: (pointId: string) => void = () => {};
  private visitedHandler: (pointId: string, visited: boolean) => void = () => {};

  /** Creates the map inside `container`, initially framed on the view bounds. */
  constructor(
    private readonly container: HTMLElement,
    private readonly options: LeafletMapOptions,
  ) {
    const view = toLeaflet(options.viewBounds);
    const limit = toLeaflet(options.limitBounds);
    this.map = L.map(container, { zoomControl: false, minZoom: 15, maxBounds: limit, maxBoundsViscosity: 1.0 }).fitBounds(view);
    L.control.zoom({ position: "bottomright" }).addTo(this.map);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      detectRetina: true,
      attribution: "© OpenStreetMap contributors",
    }).addTo(this.map);
    L.rectangle(toLeaflet(options.limitBounds), { color: "#0f172a", weight: 2, fill: false, dashArray: "6 6", interactive: false }).addTo(this.map);
    this.layer = L.layerGroup().addTo(this.map);

    this.map.on("click", (e: L.LeafletMouseEvent) => {
      if (this.addMode) this.pickHandler(new LatLng(e.latlng.lat, e.latlng.lng));
    });
    // Popups are re-created on open, so the delete button is wired each time.
    this.map.on("popupopen", (e: L.PopupEvent) => {
      const btn = e.popup.getElement()?.querySelector<HTMLButtonElement>("[data-del]");
      const id = btn?.dataset.del;
      if (btn && id) btn.addEventListener("click", () => this.deleteHandler(id));
      const visit = e.popup.getElement()?.querySelector<HTMLButtonElement>("[data-visit]");
      const visitId = visit?.dataset.visit;
      if (visit && visitId) visit.addEventListener("click", () => this.visitedHandler(visitId, visit.dataset.visited !== "true"));
    });
  }

  /**
   * Dev tool: draggable markers for the limit points. On drop it logs the
   * updated array ready to paste into LIMIT_POINTS (reload to see the rectangle).
   */
  enableLimitEditor(points: readonly LatLng[]): void {
    const current = points.map((p) => ({ lat: p.lat, lng: p.lng }));
    // Edit mode only: allow panning well beyond the limit to place new points.
    const panLimit = this.map.options.maxBounds;
    if (panLimit) this.map.setMaxBounds((panLimit as L.LatLngBounds).pad(1));
    current.forEach((p, i) => {
      L.marker([p.lat, p.lng], { draggable: true, zIndexOffset: 1000 })
        .bindTooltip(`${i}`, { permanent: true, direction: "top" })
        .on("dragend", (e: L.LeafletEvent) => {
          const { lat, lng } = (e.target as L.Marker).getLatLng();
          current[i] = { lat, lng };
          console.log(current.map((c) => `  new LatLng(${c.lat}, ${c.lng}),`).join("\n"));
        })
        .addTo(this.map);
    });
  }

  /** Replaces all markers with the given points. */
  showPoints(points: readonly Point[]): void {
    this.layer.clearLayers();
    this.markers.clear();
    for (const p of points) {
      const marker = L.marker([p.lat, p.lng], { icon: this.icon(this.options.catalog.get(p.category), p) })
        .bindPopup(popupHtml(p, this.options.catalog))
        .addTo(this.layer);
      this.markers.set(p.id, marker);
    }
  }

  /** Flies to the point (at least z17) and opens its popup. */
  focus(point: Point): void {
    this.map.flyTo([point.lat, point.lng], Math.max(this.map.getZoom(), 17), { duration: 0.6 });
    this.markers.get(point.id)?.openPopup();
  }

  /** Toggles pick mode and the crosshair cursor. */
  setAddMode(enabled: boolean): void {
    this.addMode = enabled;
    this.container.classList.toggle("adding", enabled);
  }

  /** Registers the handler for map clicks in add mode. */
  onPick(handler: (position: LatLng) => void): void {
    this.pickHandler = handler;
  }

  /** Registers the handler for popup delete buttons. */
  onDeleteRequest(handler: (pointId: string) => void): void {
    this.deleteHandler = handler;
  }

  /** Registers the handler for the popup visited toggle. */
  onVisitedRequest(handler: (pointId: string, visited: boolean) => void): void {
    this.visitedHandler = handler;
  }

  /** Closes the open popup, if any. */
  closePopup(): void {
    this.map.closePopup();
  }

  /** Pin with emoji for categories with an icon, colored dot otherwise. */
  private icon(c: Category, p: Point): L.DivIcon {
    // Reference points show their visited state: green = visited, red = pending.
    const color = p.isUserPoint ? c.color : p.visited ? VISITED_COLOR : PENDING_COLOR;
    if (c.usesPin)
      return L.divIcon({
        className: "",
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -34],
        html: `<div class="pin" style="background:${color}"><span>${c.icon}</span></div>`,
      });
    return L.divIcon({
      className: "",
      iconSize: [22, 22],
      iconAnchor: [11, 11],
      popupAnchor: [0, -10],
      html: `<div class="dot" style="background:${color}"></div>`,
    });
  }
}
