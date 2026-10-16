# Arquitectura

Clean Architecture organizada por feature (screaming architecture). Cada feature tiene sus propias capas, y lo reutilizable vive en `src/shared/`.

## Capas

| Capa | Contiene | Puede depender de |
|------|----------|-------------------|
| `domain/` | Entidades y value objects (`Point`, `Category`, `PointFilter`, `GeoBounds`, `LatLng`), reglas puras (`PointsTransfer`, `ExportLayout`) y **puertos** (`PointRepository`, `MapView`, `TileProvider`, `MapImageRenderer`, `ExportWriter`) | solo otro `domain` / `shared/domain` / `shared/utils` |
| `application/` | Casos de uso con un único `execute()` (`AddPointUseCase`, `RemovePointUseCase`, `LoadPointsUseCase`, `ListPointsUseCase`, `FilterPointsUseCase`, `ExportPointsUseCase`, `ImportPointsUseCase`, `ExportMapUseCase`) y el estado observable `PointsStore` | `domain` |
| `infrastructure/` | Adaptadores que implementan los puertos (`LocalStoragePointRepository`, `LeafletMapAdapter`, `OsmTileProvider`, `CanvasMapRenderer`, `JsPdfExporter`) | `domain` + librerías (Leaflet, jsPDF, DOM) |
| `presentation/` | Componentes de UI como clases con `mount()`/`render()` (`CategoryFilters`, `PointList`, `PointFormModal`, `SearchBox`, `AddPointFlow`, `PointsTransferPanel`, `ExportPanel`, `Sidebar`) | `application` (casos de uso / store), `shared/ui` |
| `main.ts` | Composition root: crea los adaptadores y los inyecta por constructor | todo |

### Regla de dependencias

Las capas internas nunca importan de las externas: `domain` no conoce Leaflet, el DOM ni `localStorage`, y `application` solo habla con puertos. La única excepción controlada es `main.ts`, que es el único archivo que conoce las clases concretas.

Las librerías quedan encerradas en un solo adaptador cada una: Leaflet en `LeafletMapAdapter` y jsPDF en `JsPdfExporter`.

## Árbol

```
src/
├── main.ts
├── styles.css
├── app/presentation/Sidebar.ts
├── shared/
│   ├── domain/          LatLng, Observable, Result
│   ├── infrastructure/  BrowserFileDownloader
│   ├── ui/              Component, Button, Modal, Chip
│   └── utils/           escapeHtml, webMercator
└── features/
    ├── area/domain/           GeoBounds, communityArea (LIMIT_BOUNDS, VIEW_BOUNDS)
    ├── points/
    │   ├── domain/            Category, Point, PointFilter, PointsTransfer, PointRepository, referencePoints
    │   ├── application/       PointsStore + casos de uso
    │   ├── infrastructure/    LocalStoragePointRepository
    │   └── presentation/      SearchBox, CategoryFilters, PointList, PointFormModal, AddPointFlow, PointsTransferPanel
    ├── map/
    │   ├── domain/            MapView (puerto), directions (URL de Google Maps)
    │   └── infrastructure/    LeafletMapAdapter, popupTemplate
    └── export/
        ├── domain/            ExportLayout (matemática pura), ports
        ├── application/       ExportMapUseCase
        ├── infrastructure/    OsmTileProvider, CanvasMapRenderer, JsPdfExporter
        └── presentation/      ExportPanel
```

## Flujo: "Agregar punto"

1. **presentation**: el usuario toca "＋ Agregar punto". `AddPointFlow` activa el modo agregar en el `MapView` (cursor en cruz) y muestra el aviso.
2. **infrastructure**: `LeafletMapAdapter` recibe el clic y llama a `onPick(LatLng)`.
3. **presentation**: `AddPointFlow` apaga el modo y abre `PointFormModal` en esa posición. Al guardar, el modal llama a `AddPointUseCase.execute(datos)`.
4. **application**: `AddPointUseCase` crea la entidad con `Point.create` (domain: valida el nombre y recorta el texto), la guarda con el puerto `PointRepository.add` y después la publica en `PointsStore`.
5. **infrastructure**: `LocalStoragePointRepository` la escribe en `localStorage` (`mapa-cuendina:points:v1`).
6. **presentation**: `PointsStore` notifica a sus suscriptores. `PointList` y `CategoryFilters` se redibujan, y `main.ts` pide a `MapView.showPoints(...)` que repinte los marcadores.

## Cambiar localStorage por un backend

1. Creá `src/features/points/infrastructure/HttpPointRepository.ts` que implemente `PointRepository` (`list`, `add`, `remove` con `fetch`). El puerto ya es asíncrono, y conviene validar las respuestas con `Point.parse`.
2. En `main.ts`, cambiá `new LocalStoragePointRepository(window.localStorage)` por `new HttpPointRepository(baseUrl)`.

No hace falta tocar los casos de uso, la UI ni los tests de dominio. Para pasar los puntos ya guardados al backend, se puede usar el export JSON y después el import.

## Decisiones no obvias

- **Tiles OSM y `file://`**: bajo `file://` no se envía `Referer` y OSM responde 403. Por eso la app se sirve con Vite.
- **Puerto 8000 fijo**: es el mismo origen que la app anterior, así se comparte el `localStorage` sin migrar nada.
- **Exportar a z17**: los textos de OSM tienen un tamaño fijo en píxeles. A z17, impreso a unos 110-160 dpi, los nombres de calles se leen bien en A3/A4.
- **CORS en el canvas**: los tiles se cargan con `crossOrigin = "anonymous"`. Sin eso el canvas queda "tainted" y `toDataURL()` falla.
- **Atribución**: toda imagen exportada incluye "© OpenStreetMap contributors", como lo exige la licencia ODbL.
- **jsPDF se carga bajo demanda** (`import()` dinámico), así no pesa en la carga inicial.
