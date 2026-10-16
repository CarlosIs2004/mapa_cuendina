# Mapa Cuendina

Mapa comunitario de seguridad de Cuendina (Amaguaña): zonas de riesgo, recursos de seguridad y puntos de referencia sobre OpenStreetMap, con exportación a PDF/PNG e intercambio de puntos en JSON.

Stack: Vite + TypeScript (strict), Tailwind CSS v4, Leaflet, jsPDF y Vitest. No usa framework de UI.

## Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:8000
```

Otros scripts: `npm run build` (typecheck + build en `dist/`), `npm run preview`, `npm test`, `npm run typecheck`.

### ¿Por qué hace falta un servidor http?

Si abrís `index.html` con doble clic (`file://`), el navegador no manda `Referer` y los tiles de `tile.openstreetmap.org` responden **403**. Por eso hay que servir la app por http (`npm run dev` o `npm run preview`).

### Tus puntos guardados se conservan

La app vieja corría en `http://localhost:8000`, y `localStorage` está separado por origen. Vite está fijado en el puerto **8000** (`strictPort`) para usar el mismo origen. La app nueva lee la misma clave `mapa-cuendina:points:v1` y el mismo formato (un array de puntos), así que los puntos que ya tenías aparecen sin migrar nada. Si el puerto 8000 está ocupado, Vite no arranca en vez de cambiar de puerto. Liberá el puerto antes de correrlo.

Para pasar puntos a otro navegador o equipo, usá **Exportar puntos (JSON)** e **Importar puntos (JSON)**. El importador también acepta el array que guardaba la app vieja.

## Estructura

```
src/
├── main.ts              # composition root: instancia adaptadores y casos de uso, monta la UI
├── styles.css           # Tailwind + estilos de marcadores/popups
├── app/presentation/    # Sidebar (shell)
├── shared/
│   ├── domain/          # LatLng, Observable, Result
│   ├── infrastructure/  # BrowserFileDownloader
│   ├── ui/              # Component, Button, Modal, Chip
│   └── utils/           # escapeHtml, webMercator
└── features/
    ├── points/          # domain · application · infrastructure · presentation
    ├── area/            # domain (límites de Cuendina)
    ├── map/             # domain (puerto MapView) · infrastructure (Leaflet)
    └── export/          # domain · application · infrastructure · presentation
```

Los detalles de las capas y la regla de dependencias están en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Cómo agregar una categoría

1. En `src/features/points/domain/Category.ts`, agregá el id al tipo `CategoryId`.
2. Agregá la entrada en `CATEGORY_CATALOG` (`new Category(id, grupo, etiqueta, color)`).

Los filtros, el formulario, la leyenda y la exportación la toman solos. Para un grupo nuevo, agregalo a `CategoryGroupId` y a los grupos del catálogo, y sumalo a `userSelectableGroups` si los usuarios pueden elegirlo.
