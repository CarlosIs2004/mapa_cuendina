/**
 * Result — shared/domain.
 * Explicit success/failure value so use cases can report expected failures
 * (e.g. a failed export) without throwing across layer boundaries.
 */

export type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };

/** Constructors for Result values. */
export const Result = {
  /** Wraps a successful value. */
  ok<T>(value: T): Result<T, never> {
    return { ok: true, value };
  },
  /** Wraps a failure. */
  fail<E>(error: E): Result<never, E> {
    return { ok: false, error };
  },
};
