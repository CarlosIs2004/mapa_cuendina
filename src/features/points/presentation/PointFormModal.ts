/**
 * PointFormModal — points/presentation.
 * "Nuevo punto" dialog: asks for type, name and description for a position
 * picked on the map, then calls AddPointUseCase.
 */

import type { LatLng } from "../../../shared/domain/LatLng";
import { Component } from "../../../shared/ui/Component";
import { Modal } from "../../../shared/ui/Modal";
import type { AddPointUseCase } from "../application/AddPointUseCase";
import type { CategoryCatalog } from "../domain/Category";

/** Modal form that creates a point at a pending position. */
export class PointFormModal extends Component {
  private readonly modal: Modal;
  private readonly form: HTMLFormElement;
  private readonly typeSelect: HTMLSelectElement;
  private readonly nameInput: HTMLInputElement;
  private readonly descInput: HTMLTextAreaElement;
  private pending: LatLng | null = null;

  /** @param root The modal overlay (#modal) containing the form. */
  constructor(
    root: HTMLElement,
    private readonly addPoint: AddPointUseCase,
    private readonly catalog: CategoryCatalog,
  ) {
    super(root);
    this.modal = new Modal(root);
    this.form = Component.within<HTMLFormElement>(root, "#form");
    this.typeSelect = Component.within<HTMLSelectElement>(root, "#fType");
    this.nameInput = Component.within<HTMLInputElement>(root, "#fName");
    this.descInput = Component.within<HTMLTextAreaElement>(root, "#fDesc");
  }

  /** Opens the form for a point at `position`. */
  open(position: LatLng): void {
    this.pending = position;
    this.modal.open();
    this.nameInput.focus();
  }

  /** Closes and resets the form, discarding the pending position. */
  close(): void {
    this.modal.close();
    this.form.reset();
    this.pending = null;
  }

  /** Fills the "Tipo" select with user-selectable categories, grouped. */
  override render(): void {
    this.typeSelect.replaceChildren();
    for (const group of this.catalog.userSelectableGroups) {
      const og = document.createElement("optgroup");
      og.label = this.catalog.groups[group];
      for (const c of this.catalog.inGroup(group)) og.appendChild(new Option(c.label, c.id));
      this.typeSelect.appendChild(og);
    }
  }

  protected override bind(): void {
    Component.within(this.root, "#fCancel").addEventListener("click", () => this.close());
    this.form.addEventListener("submit", (e) => {
      e.preventDefault();
      void this.submit();
    });
  }

  private async submit(): Promise<void> {
    const category = this.typeSelect.value;
    if (!this.pending || !this.catalog.has(category) || !this.nameInput.value.trim()) return;
    await this.addPoint.execute({
      category,
      name: this.nameInput.value,
      description: this.descInput.value,
      lat: this.pending.lat,
      lng: this.pending.lng,
    });
    this.close();
  }
}
