/**
 * CodeHighlight helpers — framework-agnostic class-name resolution for a
 * Prism-highlighted `<code>` element. Pure functions only; the render layer
 * (svelte runes) owns the DOM effect that calls Prism.highlightElement.
 *
 * Mirrors Semi Design (semi-foundation/codeHighlight): the `<code>` element
 * gets `language-<lang>` and, when line numbers are on, `line-numbers`.
 * We keep Prism itself out of core so this package stays library-agnostic.
 */

export interface ResolveCodeClassNameOptions {
  /** Prism language id, e.g. 'js' | 'ts' | 'css' | 'markup'. */
  language: string;
  /** When true, add Prism's `line-numbers` plugin class. */
  lineNumber?: boolean;
}

const LANGUAGE_CLASS_RE = /(^|\s)language-\S+/;

/**
 * Resolve the class string for the `<code>` element Prism highlights.
 *
 * Aligns with Semi: if a `language-*` class already exists on the element we
 * do NOT add another (avoids duplicate/conflicting language classes across
 * re-highlights); the required `line-numbers` class is added/kept when
 * `lineNumber` is on and removed when off.
 *
 * @param currentClassName the code element's existing className (may be empty)
 * @param language Prism language id
 * @param lineNumber whether to enable the line-numbers plugin
 * @returns the deduplicated, space-joined class string
 */
export function resolveCodeClassName(
  currentClassName: string,
  language: string,
  lineNumber = true,
): string {
  const classes = (currentClassName ?? '')
    .split(/\s+/)
    .filter((c) => c && c !== 'line-numbers');

  const hasLanguage = LANGUAGE_CLASS_RE.test(currentClassName ?? '');
  if (!hasLanguage && language) {
    classes.push(`language-${language}`);
  }

  if (lineNumber) {
    classes.push('line-numbers');
  }

  return classes.join(' ');
}
