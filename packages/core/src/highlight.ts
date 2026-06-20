/**
 * highlight — framework-agnostic text highlight chunking with overlap merging.
 * Pure: given a source string + search words (or precomputed match ranges),
 * returns a flat, ordered, non-overlapping sequence of chunks
 * [{ text, matched }] covering the whole source. No DOM, no regex side effects
 * on caller input. The render layer maps chunks → <mark>/snippet.
 *
 * Overlap handling: when multiple search words match overlapping regions, the
 * ranges are merged so a character is wrapped at most once (no nested/duplicated
 * markup). Adjacent (touching) matched ranges are also coalesced.
 * See specs/components/show/Highlight.spec.md.
 */

/** A half-open match range [start, end) into the source string. */
export interface HighlightRange {
  start: number;
  end: number;
}

/** One contiguous piece of the source: either a match or plain text. */
export interface HighlightChunk {
  text: string;
  matched: boolean;
}

export interface FindRangesOptions {
  /** match case-sensitively (default false) */
  caseSensitive?: boolean;
  /** match all occurrences (default true); false = first occurrence only */
  highlightAll?: boolean;
  /** treat words as literal text by escaping regex (default true) */
  autoEscape?: boolean;
}

const RE_SPECIAL = /[.*+?^${}()|[\]\\]/g;

function escapeRegExp(s: string): string {
  return s.replace(RE_SPECIAL, '\\$&');
}

function normalizeWords(words: string | string[]): string[] {
  const arr = Array.isArray(words) ? words : [words];
  return arr.filter((w) => typeof w === 'string' && w.length > 0);
}

/**
 * Find raw (possibly overlapping) match ranges of `words` in `source`.
 *
 * Each word is scanned independently, so ranges from different words may
 * overlap (e.g. "ab" and "bc" in "abc" → [0,2] and [1,3]); feed the result to
 * mergeRanges / chunksFromRanges to normalize. Returns ranges in document
 * order. An invalid regex source (autoEscape=false misuse) for any word is
 * silently skipped (that word contributes no ranges).
 */
export function findRanges(
  source: string,
  words: string | string[],
  options: FindRangesOptions = {},
): HighlightRange[] {
  if (!source) return [];
  const list = normalizeWords(words);
  if (list.length === 0) return [];

  const { caseSensitive = false, highlightAll = true, autoEscape = true } = options;
  const flags = `${caseSensitive ? '' : 'i'}g`;

  const ranges: HighlightRange[] = [];
  for (const word of list) {
    const src = autoEscape ? escapeRegExp(word) : word;
    let re: RegExp;
    try {
      re = new RegExp(src, flags);
    } catch {
      continue; // skip this word, keep the rest highlighting
    }
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      const matched = m[0];
      if (matched.length === 0) {
        re.lastIndex += 1; // avoid infinite loop on zero-length match
        continue;
      }
      ranges.push({ start: m.index, end: m.index + matched.length });
      if (!highlightAll) break;
    }
  }
  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  return ranges;
}

/**
 * Merge overlapping or adjacent ranges into a sorted, non-overlapping set.
 * Handles: overlap, containment, adjacency (touching ends), and duplicates.
 */
export function mergeRanges(ranges: HighlightRange[]): HighlightRange[] {
  const valid = ranges.filter((r) => r.end > r.start);
  if (valid.length <= 1) return valid.slice();

  const sorted = valid.slice().sort((a, b) => a.start - b.start || a.end - b.end);
  const first = sorted[0]!;
  const merged: HighlightRange[] = [{ start: first.start, end: first.end }];

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const last = merged[merged.length - 1]!;
    // overlap or adjacency (cur.start <= last.end) → extend
    if (cur.start <= last.end) {
      if (cur.end > last.end) last.end = cur.end;
    } else {
      merged.push({ start: cur.start, end: cur.end });
    }
  }
  return merged;
}

/**
 * Slice `source` into an ordered, gap-free chunk sequence using `ranges`.
 * `ranges` may overlap; they are merged first, so output chunks never overlap
 * and concatenating their text reproduces `source` exactly.
 */
export function chunksFromRanges(source: string, ranges: HighlightRange[]): HighlightChunk[] {
  if (!source) return [];
  const merged = mergeRanges(ranges);
  if (merged.length === 0) return [{ text: source, matched: false }];

  const chunks: HighlightChunk[] = [];
  let cursor = 0;
  for (const { start, end } of merged) {
    const s = Math.max(0, Math.min(start, source.length));
    const e = Math.max(s, Math.min(end, source.length));
    if (s > cursor) chunks.push({ text: source.slice(cursor, s), matched: false });
    if (e > s) chunks.push({ text: source.slice(s, e), matched: true });
    cursor = e;
  }
  if (cursor < source.length) chunks.push({ text: source.slice(cursor), matched: false });
  return chunks;
}

/**
 * One-shot: find matches of `words` in `source` and return merged,
 * non-overlapping chunks. The render layer iterates the result directly.
 */
export function highlightChunks(
  source: string,
  words: string | string[],
  options: FindRangesOptions = {},
): HighlightChunk[] {
  if (!source) return [];
  const ranges = findRanges(source, words, options);
  return chunksFromRanges(source, ranges);
}
