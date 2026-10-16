/**
 * AddPointFlow — points/presentation.
 * Coordinates the "＋ Agregar punto" interaction: toggle add mode, show the
 * hint banner, wait for a map click, then open the form at that position.
 */

import { Component } from "../../../shared/ui/Component";
import type { MapView } from "../../map/domain/MapView";
import type { PointFormModal } from "./PointFormModal";

/** Add-point mode controller wired to the add button and the hint banner. */
export class AddPointFlow extends Component<HTMLButtonElement> {
  private adding = false;

  /**
   * @param root The "Agregar punto" button.
   * @param hint Banner shown while waiting for a map click (contains #cancelAdd).
   * @param onStart Called when add mode starts (e.g. close the sidebar on mobile).
   */
  constructor(
    root: HTMLButtonElement,
    private readonly hint: HTMLElement,
    private readonly map: Pick<MapView, "setAddMode" | "onPick">,
    private readonly form: PointFormModal,
    private readonly onStart: () => void = () => {},
  ) {
    super(root);
  }

  /** Turns add mode on/off and syncs cursor and hint. */
  setAdding(adding: boolean): void {
    this.adding = adding;
    this.map.setAddMode(adding);
    this.hint.classList.toggle("hidden", !adding);
    if (adding) this.onStart();
  }

  protected override bind(): void {
    this.root.addEventListener("click", () => this.setAdding(!this.adding));
    Component.within(this.hint, "#cancelAdd").addEventListener("click", () => this.setAdding(false));
    this.map.onPick((position) => {
      if (!this.adding) return;
      this.setAdding(false);
      this.form.open(position);
    });
  }
}
