/**
 * Button — shared/ui.
 * Wraps a <button> with click handling and temporary busy/feedback labels,
 * reused by panels that trigger slow actions (export).
 */

import { Component } from "./Component";

/** Button with click handler and transient label states. */
export class Button extends Component<HTMLButtonElement> {
  private readonly idleLabel: string;

  /** @param root Existing button element; its current text is the idle label. */
  constructor(root: HTMLButtonElement) {
    super(root);
    this.idleLabel = root.textContent ?? "";
  }

  /** Registers a click handler. */
  onClick(handler: () => void): this {
    this.root.addEventListener("click", handler);
    return this;
  }

  /** Disables the button and shows `label` while busy; restores the idle label when done. */
  setBusy(busy: boolean, label = this.idleLabel): void {
    this.root.disabled = busy;
    this.root.textContent = busy ? label : this.idleLabel;
  }

  /** Shows `label` for `ms` milliseconds, then restores the idle label (e.g. "Error"). */
  flash(label: string, ms = 2000): void {
    this.root.textContent = label;
    window.setTimeout(() => (this.root.textContent = this.idleLabel), ms);
  }
}
