/**
 * Observable — shared/domain.
 * Minimal publish/subscribe primitive so application state can notify the
 * presentation layer without knowing anything about it.
 */

export type Listener<T> = (value: T) => void;

/** Base class for anything that broadcasts changes to subscribers. */
export class Observable<T> {
  private readonly listeners = new Set<Listener<T>>();

  /** Registers a listener and returns a function that unregisters it. */
  subscribe(listener: Listener<T>): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /** Notifies every current subscriber with the given value. */
  protected emit(value: T): void {
    this.listeners.forEach((listener) => listener(value));
  }
}
