/**
 * Chip — shared/ui.
 * Pill-shaped toggle button with a color dot, used by category filters.
 */

import { escapeHtml } from "../utils/escapeHtml";
import { Component } from "./Component";

export interface ChipProps {
  label: string;
  color: string;
  active: boolean;
  onToggle: () => void;
}

/** Toggleable pill showing a color swatch and a label; dimmed when inactive. */
export class Chip extends Component<HTMLButtonElement> {
  /** Creates its own <button> root from the given props. */
  constructor(private readonly props: ChipProps) {
    super(document.createElement("button"));
    this.root.type = "button";
  }

  /** Draws the swatch, label and active state. */
  override render(): void {
    const { label, color, active } = this.props;
    this.root.className = `flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${active ? "" : "opacity-40"}`;
    this.root.setAttribute("aria-pressed", String(active));
    this.root.innerHTML = `<span class="w-2.5 h-2.5 rounded-full" style="background:${color}"></span>${escapeHtml(label)}`;
  }

  protected override bind(): void {
    this.root.addEventListener("click", this.props.onToggle);
  }
}
