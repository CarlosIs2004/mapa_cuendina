/**
 * Modal — shared/ui.
 * Show/hide behavior for an overlay element using Tailwind's `hidden` class.
 */

import { Component } from "./Component";

/** Overlay that can be opened and closed. */
export class Modal extends Component {
  /** Makes the overlay visible. */
  open(): void {
    this.root.classList.remove("hidden");
  }

  /** Hides the overlay. */
  close(): void {
    this.root.classList.add("hidden");
  }

  /** Whether the overlay is currently visible. */
  get isOpen(): boolean {
    return !this.root.classList.contains("hidden");
  }
}
