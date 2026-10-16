/**
 * escapeHtml — shared/utils.
 * Escapes user-provided text before it is interpolated into HTML strings
 * (popups, list items, legends). User point names/descriptions are untrusted.
 */

const ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Returns the value as a string with the five HTML-sensitive characters escaped. */
export const escapeHtml = (value: unknown): string =>
  String(value).replace(/[&<>"']/g, (c) => ENTITIES[c] ?? c);
