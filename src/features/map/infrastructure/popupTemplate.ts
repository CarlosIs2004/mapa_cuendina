/**
 * popupTemplate — map/infrastructure.
 * HTML for marker popups and marker icons. All user text goes through
 * escapeHtml because popups are rendered with innerHTML by Leaflet.
 */

import { escapeHtml } from "../../../shared/utils/escapeHtml";
import type { CategoryCatalog } from "../../points/domain/Category";
import type { Point } from "../../points/domain/Point";
import { googleMapsDirectionsUrl } from "../domain/directions";

/** Popup body: category, name, description, directions link, visited toggle (reference points) and delete (user points). */
export function popupHtml(p: Point, catalog: CategoryCatalog): string {
  const c = catalog.get(p.category);
  return `
    <div class="p-3">
      <span class="text-[11px] font-semibold uppercase tracking-wide" style="color:${c.color}">${escapeHtml(c.label)}</span>
      <h3 class="font-bold text-sm mt-0.5">${escapeHtml(p.name)}</h3>
      ${p.description ? `<p class="text-xs text-slate-600 mt-1">${escapeHtml(p.description)}</p>` : ""}
      <a href="${googleMapsDirectionsUrl(p)}" target="_blank" rel="noopener noreferrer"
         class="mt-3 block text-center rounded-lg bg-emerald-600 text-xs font-semibold py-2" style="color:#fff">Abrir en Google Maps</a>
      ${p.isUserPoint ? "" : `<button data-visit="${escapeHtml(p.id)}" data-visited="${p.visited}" class="mt-2 w-full rounded-lg border text-xs py-1.5 ${p.visited ? "border-slate-300 text-slate-600" : "border-emerald-600 text-emerald-700"}">${p.visited ? "Marcar como no visitado" : "Marcar como visitado"}</button>`}
      ${p.isUserPoint ? `<button data-del="${escapeHtml(p.id)}" class="mt-2 w-full rounded-lg border border-red-300 text-red-600 text-xs py-1.5">Eliminar punto</button>` : ""}
    </div>`;
}
