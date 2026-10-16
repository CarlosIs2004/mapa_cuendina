/**
 * Category — points/domain.
 * Category entity and the category catalog (labels, colors, groups) that every
 * other layer reads. To add a category, add its id to `CategoryId` and an entry
 * to `CATEGORY_CATALOG` below; filters, form, legend and export pick it up.
 */

export type CategoryGroupId = "riesgo" | "seguridad" | "referencia";

export type CategoryId =
  | "robos"
  | "licor"
  | "bailes"
  | "violencia"
  | "camaras"
  | "alarmas"
  | "referencia";

/** A kind of point (e.g. "Asaltos / Robos") with its display color and group. */
export class Category {
  constructor(
    readonly id: CategoryId,
    readonly group: CategoryGroupId,
    readonly label: string,
    readonly color: string,
    /** Emoji drawn inside a pin marker; categories without it render as a dot. */
    readonly icon?: string,
  ) {}

  /** Whether the marker is a pin with an icon (references) instead of a colored dot. */
  get usesPin(): boolean {
    return this.icon !== undefined;
  }
}

/** Read-only lookup over the known categories and their groups. */
export class CategoryCatalog {
  private readonly byId: Map<CategoryId, Category>;

  constructor(
    readonly groups: Readonly<Record<CategoryGroupId, string>>,
    readonly categories: readonly Category[],
    /** Groups a user may pick from when adding a point (references are fixed). */
    readonly userSelectableGroups: readonly CategoryGroupId[],
  ) {
    this.byId = new Map(categories.map((c) => [c.id, c]));
  }

  /** Returns the category for an id known at compile time. */
  get(id: CategoryId): Category {
    const category = this.byId.get(id);
    if (!category) throw new Error(`Unknown category ${id}`);
    return category;
  }

  /** Type guard for ids coming from untrusted sources (storage, form values). */
  has(value: unknown): value is CategoryId {
    return typeof value === "string" && this.byId.has(value as CategoryId);
  }

  /** Categories that belong to the given group, in catalog order. */
  inGroup(group: CategoryGroupId): Category[] {
    return this.categories.filter((c) => c.group === group);
  }

  /** Group ids paired with their display label, in declaration order. */
  groupEntries(): [CategoryGroupId, string][] {
    return Object.entries(this.groups) as [CategoryGroupId, string][];
  }
}

/** The app's category catalog (Spanish labels are user-facing copy). */
export const CATEGORY_CATALOG = new CategoryCatalog(
  { riesgo: "Zonas de riesgo", seguridad: "Recursos de seguridad", referencia: "Referencias" },
  [
    new Category("robos", "riesgo", "Asaltos / Robos", "#ef4444"),
    new Category("licor", "riesgo", "Venta de licor artesanal", "#f97316"),
    new Category("bailes", "riesgo", "Bailes clandestinos", "#a855f7"),
    new Category("violencia", "riesgo", "Violencia intrafamiliar", "#eab308"),
    new Category("camaras", "seguridad", "Cámaras de vigilancia (privada)", "#3b82f6"),
    new Category("alarmas", "seguridad", "Alarmas de barrio", "#22c55e"),
    new Category("referencia", "referencia", "Punto de referencia", "#475569", "📍"),
  ],
  ["riesgo", "seguridad"],
);
