/**
 * main — composition root.
 * The only place that knows every concrete class: it builds the adapters,
 * injects them into use cases through constructors, mounts the UI and
 * wires cross-feature events (list → map, map → form, popup → delete).
 */

import "leaflet/dist/leaflet.css";
import "./styles.css";

import { Sidebar } from "./app/presentation/Sidebar";
import { LIMIT_BOUNDS, LIMIT_POINTS, VIEW_BOUNDS } from "./features/area/domain/communityArea";
import { ExportMapUseCase } from "./features/export/application/ExportMapUseCase";
import { CanvasMapRenderer } from "./features/export/infrastructure/CanvasMapRenderer";
import { JsPdfExporter } from "./features/export/infrastructure/JsPdfExporter";
import { OsmTileProvider } from "./features/export/infrastructure/OsmTileProvider";
import { ExportPanel } from "./features/export/presentation/ExportPanel";
import { LeafletMapAdapter } from "./features/map/infrastructure/LeafletMapAdapter";
import { AddPointUseCase } from "./features/points/application/AddPointUseCase";
import { ExportPointsUseCase } from "./features/points/application/ExportPointsUseCase";
import { FilterPointsUseCase } from "./features/points/application/FilterPointsUseCase";
import { ImportPointsUseCase } from "./features/points/application/ImportPointsUseCase";
import { ListPointsUseCase } from "./features/points/application/ListPointsUseCase";
import { LoadPointsUseCase } from "./features/points/application/LoadPointsUseCase";
import { PointsStore } from "./features/points/application/PointsStore";
import { SetVisitedUseCase } from "./features/points/application/SetVisitedUseCase";
import { RemovePointUseCase } from "./features/points/application/RemovePointUseCase";
import { CATEGORY_CATALOG } from "./features/points/domain/Category";
import { REFERENCE_POINTS } from "./features/points/domain/referencePoints";
import { LocalStoragePointRepository } from "./features/points/infrastructure/LocalStoragePointRepository";
import { fetchSharedPoints, saveVisited } from "./features/points/infrastructure/SupabaseReferenceSource";
import { AddPointFlow } from "./features/points/presentation/AddPointFlow";
import { CategoryFilters } from "./features/points/presentation/CategoryFilters";
import { PointFormModal } from "./features/points/presentation/PointFormModal";
import { PointList } from "./features/points/presentation/PointList";
import { PointsTransferPanel } from "./features/points/presentation/PointsTransferPanel";
import { SearchBox } from "./features/points/presentation/SearchBox";
import { BrowserFileDownloader } from "./shared/infrastructure/BrowserFileDownloader";
import { Component } from "./shared/ui/Component";

/**
 * Export zoom: OSM labels have a fixed pixel size, so z17 printed at
 * ~110-160 dpi keeps street names legible on A3/A4.
 */
const EXPORT_ZOOM = 17;

/** Builds the object graph and starts the app. */
async function bootstrap(): Promise<void> {
  const byId = Component.byId;
  const catalog = CATEGORY_CATALOG;

  // Infrastructure (adapters). Replace LocalStoragePointRepository with an
  // HTTP repository here to share points through a backend.
  const repository = new LocalStoragePointRepository(window.localStorage);
  const downloader = new BrowserFileDownloader();
  const map = new LeafletMapAdapter(byId("map"), { viewBounds: VIEW_BOUNDS, limitBounds: LIMIT_BOUNDS, catalog });
  // Dev mode: open the app with ?editar to show the menu and drag the limit corners.
  const editMode = new URLSearchParams(location.search).has("editar");
  if (editMode) map.enableLimitEditor(LIMIT_POINTS);

  // Application (state + use cases).
  const store = new PointsStore();
  // Shared places from Supabase; the built-in list is the offline fallback.
  const sharedPoints = await fetchSharedPoints(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY).catch(() => []);
  const listPoints = new ListPointsUseCase(store, sharedPoints.length ? sharedPoints : REFERENCE_POINTS);
  const visiblePoints = new FilterPointsUseCase(listPoints, store);
  store.setVisitedIds(sharedPoints.filter((p) => p.visited).map((p) => p.id));
  const setVisited = new SetVisitedUseCase(
    (id, visited) => saveVisited(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY, id, visited),
    store,
  );
  const loadPoints = new LoadPointsUseCase(repository, store);
  const addPoint = new AddPointUseCase(repository, store);
  const removePoint = new RemovePointUseCase(repository, store);
  const exportPoints = new ExportPointsUseCase(store);
  const importPoints = new ImportPointsUseCase(repository, store);
  const exportMap = new ExportMapUseCase(
    new CanvasMapRenderer(new OsmTileProvider(), catalog),
    new JsPdfExporter(downloader),
    LIMIT_BOUNDS,
    EXPORT_ZOOM,
  );

  // Presentation.
  const sidebar = new Sidebar(byId("sidebar"), byId("toggle")).mount();
  if (!editMode) {
    byId("sidebar").style.display = "none";
    byId("toggle").style.display = "none";
  }
  const form = new PointFormModal(byId("modal"), addPoint, catalog).mount();
  new AddPointFlow(byId<HTMLButtonElement>("addBtn"), byId("hint"), map, form, () => sidebar.collapseOnMobile()).mount();
  new SearchBox(byId<HTMLInputElement>("search"), store).mount();
  new CategoryFilters(byId("filters"), store, catalog).mount();
  new PointList(byId<HTMLUListElement>("list"), store, visiblePoints, catalog, (point) => {
    map.focus(point);
    sidebar.collapseOnMobile();
  }).mount();
  new PointsTransferPanel(byId("pointsTransfer"), exportPoints, importPoints, downloader).mount();
  new ExportPanel(byId("exportPanel"), exportMap, visiblePoints).mount();

  // Cross-feature wiring.
  map.onDeleteRequest(async (id) => {
    if (!window.confirm("¿Eliminar este punto?")) return;
    map.closePopup();
    await removePoint.execute(id);
  });
  map.onVisitedRequest(async (id, visited) => {
    if (!(await setVisited.execute(id, visited))) window.alert("No se pudo guardar el estado. Intenta de nuevo.");
  });
  store.subscribe(() => map.showPoints(visiblePoints.execute()));

  map.showPoints(visiblePoints.execute());
  await loadPoints.execute();
}

void bootstrap();
