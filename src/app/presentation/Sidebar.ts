/**
 * Sidebar — app/presentation.
 * Collapsible side panel and its "☰" toggle. Open by default on desktop,
 * closed on phones; other components close it on mobile after an action.
 */

import { Component } from "../../shared/ui/Component";

const MOBILE_BREAKPOINT_PX = 768;

/** Slide-in panel controlled by a toggle button. */
export class Sidebar extends Component {
  private open = !Sidebar.isMobile();

  /** @param toggle The button that opens/closes the panel. */
  constructor(
    root: HTMLElement,
    private readonly toggle: HTMLElement,
  ) {
    super(root);
  }

  /** True on phone-sized viewports, where the panel would cover the map. */
  static isMobile(): boolean {
    return window.innerWidth < MOBILE_BREAKPOINT_PX;
  }

  /** Opens or closes the panel. */
  setOpen(open: boolean): void {
    this.open = open;
    this.render();
  }

  /** Closes the panel only on mobile (after selecting a point or starting add mode). */
  collapseOnMobile(): void {
    if (Sidebar.isMobile()) this.setOpen(false);
  }

  /** Slides the panel and moves the toggle beside it (w-80 = 20rem). */
  override render(): void {
    this.root.style.transform = this.open ? "translateX(0)" : "translateX(-100%)";
    this.toggle.style.transform = this.open ? "translateX(20rem)" : "translateX(0)";
  }

  protected override bind(): void {
    this.toggle.addEventListener("click", () => this.setOpen(!this.open));
  }
}
