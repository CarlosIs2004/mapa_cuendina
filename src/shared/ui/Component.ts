/**
 * Component — shared/ui.
 * Tiny base class for framework-free UI components. Each component owns one
 * root element, wires its listeners once in `bind()` and redraws in `render()`.
 */

/** Base class for DOM components that own a single root element. */
export abstract class Component<E extends HTMLElement = HTMLElement> {
  /** @param root Element this component controls (from the page or created by a subclass). */
  constructor(protected readonly root: E) {}

  /** The root element, so parents can append or position it. */
  get element(): E {
    return this.root;
  }

  /** Redraws the component from its current state. Override when there is dynamic content. */
  render(): void {}

  /** Binds listeners once and performs the first render. Returns `this` for chaining. */
  mount(): this {
    this.bind();
    this.render();
    return this;
  }

  /** Hook for attaching DOM listeners; called once by `mount()`. */
  protected bind(): void {}

  /** Finds a required element by id; fails fast if the page markup is out of sync. */
  static byId<T extends HTMLElement = HTMLElement>(id: string): T {
    const el = document.getElementById(id);
    if (!el) throw new Error(`Missing element #${id}`);
    return el as T;
  }

  /** Finds a required descendant of `parent` by CSS selector; fails fast if missing. */
  static within<T extends HTMLElement = HTMLElement>(parent: ParentNode, selector: string): T {
    const el = parent.querySelector<T>(selector);
    if (!el) throw new Error(`Missing element ${selector}`);
    return el;
  }
}
