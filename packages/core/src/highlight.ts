/**
 * highlight — framework-agnostic text highlight chunking with overlap merging.
 * 镜像 Semi semi-foundation/highlight/foundation.ts（findAll = findChunks →
 * combineChunks → fillInChunks）：给定源文本 + 待高亮词（string / string[] /
 * 对象数组），返回一条有序、无重叠、覆盖整段源文本的 chunk 序列
 * [{ text, highlight, className?, style? }]。纯函数，无 DOM。渲染层把 chunk 映射为
 * <mark>/snippet，并在命中片段上合并 highlightStyle/highlightClassName 与 chunk 各自的
 * style/className。
 *
 * 对象数组差异化样式（Semi v2.71+）：searchWords 传 { text, className, style } 时，
 * 每个词的 className/style 随其命中区间一路带到输出 chunk 上。重叠区间合并时对齐 Semi：
 * className 取 prev.className || next.className，style 浅合并 {...prev, ...next}。
 * 相邻（touching）区间同样合并，保证每个字符最多被包裹一次（无嵌套/重复标记）。
 * See specs/components/show/Highlight.spec.md.
 */

/** searchWords 的对象形式：指定文本并单独附带 className/style（Semi v2.71+）。 */
export interface HighlightWord {
  text: string;
  className?: string;
  style?: Record<string, string | number>;
}

/** 单个命中片段的样式载荷，随命中区间流转到输出 chunk。 */
interface ChunkStyle {
  className?: string;
  style?: Record<string, string | number>;
}

/** 带样式载荷的匹配区间 [start, end)（半开区间）。 */
export interface HighlightRange extends ChunkStyle {
  start: number;
  end: number;
}

/** 源文本的一段：命中（highlight=true）或普通文本。命中片段可携带自定义 className/style。 */
export interface HighlightChunk extends ChunkStyle {
  text: string;
  highlight: boolean;
}

export interface FindRangesOptions {
  /** 大小写敏感匹配（默认 false） */
  caseSensitive?: boolean;
  /** 词作为字面量、对正则特殊字符转义（默认 true）；关闭后视为正则源 */
  autoEscape?: boolean;
}

const RE_SPECIAL = /[.*+?^${}()|[\]\\]/g;

function escapeRegExp(s: string): string {
  return s.replace(RE_SPECIAL, '\\$&');
}

/** 归一化 searchWords 为对象数组，滤掉空文本（对齐 Semi findChunks 前置处理）。 */
function normalizeWords(
  words: string | string[] | HighlightWord | HighlightWord[],
): HighlightWord[] {
  const arr = Array.isArray(words) ? words : [words];
  return arr
    .map((w) => (typeof w === 'string' ? { text: w } : w))
    .filter((w): w is HighlightWord => Boolean(w && typeof w.text === 'string' && w.text.length > 0));
}

/**
 * 查找 words 在 source 中的原始（可能重叠）匹配区间，携带每个词的 className/style。
 * 每个词独立扫描，故不同词的区间可能重叠（如 "ab" 与 "bc" 命中 "abc" → [0,2] 与 [1,3]）；
 * 交给 mergeRanges / chunksFromRanges 归一化。区间按文档顺序返回。autoEscape=false 误用导致
 * 的非法正则源静默跳过（该词不贡献区间）。对齐 Semi findChunks。
 */
export function findRanges(
  source: string,
  words: string | string[] | HighlightWord | HighlightWord[],
  options: FindRangesOptions = {},
): HighlightRange[] {
  if (!source) return [];
  const list = normalizeWords(words);
  if (list.length === 0) return [];

  const { caseSensitive = false, autoEscape = true } = options;
  const flags = `${caseSensitive ? '' : 'i'}g`;

  const ranges: HighlightRange[] = [];
  for (const word of list) {
    const src = autoEscape ? escapeRegExp(word.text) : word.text;
    let re: RegExp;
    try {
      re = new RegExp(src, flags);
    } catch {
      continue; // 跳过该词，其余词照常高亮
    }
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      const matched = m[0];
      if (matched.length === 0) {
        re.lastIndex += 1; // 零长匹配防死循环
        continue;
      }
      const range: HighlightRange = { start: m.index, end: m.index + matched.length };
      if (word.className !== undefined) range.className = word.className;
      if (word.style !== undefined) range.style = word.style;
      ranges.push(range);
    }
  }
  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  return ranges;
}

/**
 * 合并重叠或相邻区间为有序、无重叠集合。处理重叠、包含、相邻（端点相接）与重复。
 * 样式载荷合并对齐 Semi combineChunks：className 取 prev || next，style 浅合并 {...prev, ...next}。
 */
export function mergeRanges(ranges: HighlightRange[]): HighlightRange[] {
  const valid = ranges.filter((r) => r.end > r.start);
  if (valid.length === 0) return [];

  // 只带有值的可选键（exactOptionalPropertyTypes：不写入 undefined 键）。
  const clone = (r: HighlightRange): HighlightRange => {
    const out: HighlightRange = { start: r.start, end: r.end };
    if (r.className !== undefined) out.className = r.className;
    if (r.style !== undefined) out.style = r.style;
    return out;
  };

  const sorted = valid.slice().sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: HighlightRange[] = [clone(sorted[0]!)];

  for (let i = 1; i < sorted.length; i++) {
    const cur = sorted[i]!;
    const last = merged[merged.length - 1]!;
    // 重叠或相邻（cur.start <= last.end）→ 扩展并合并样式（对齐 Semi combineChunks）
    if (cur.start <= last.end) {
      if (cur.end > last.end) last.end = cur.end;
      const className = last.className || cur.className; // 对齐 Semi: prev.className || next.className
      if (className !== undefined) last.className = className;
      if (last.style !== undefined || cur.style !== undefined) {
        last.style = { ...last.style, ...cur.style }; // 浅合并，next 覆盖 prev
      }
    } else {
      merged.push(clone(cur));
    }
  }
  return merged;
}

/**
 * 用 ranges 把 source 切成有序、无缝隙的 chunk 序列。ranges 可重叠，先合并，故输出 chunk
 * 不重叠且拼接后精确还原 source。命中片段带 highlight=true 及其 className/style。
 * 对齐 Semi fillInChunks。
 */
export function chunksFromRanges(source: string, ranges: HighlightRange[]): HighlightChunk[] {
  if (!source) return [];
  const merged = mergeRanges(ranges);
  if (merged.length === 0) return [{ text: source, highlight: false }];

  const chunks: HighlightChunk[] = [];
  let cursor = 0;
  for (const { start, end, className, style } of merged) {
    const s = Math.max(0, Math.min(start, source.length));
    const e = Math.max(s, Math.min(end, source.length));
    if (s > cursor) chunks.push({ text: source.slice(cursor, s), highlight: false });
    if (e > s) {
      const chunk: HighlightChunk = { text: source.slice(s, e), highlight: true };
      if (className !== undefined) chunk.className = className;
      if (style !== undefined) chunk.style = style;
      chunks.push(chunk);
    }
    cursor = e;
  }
  if (cursor < source.length) chunks.push({ text: source.slice(cursor), highlight: false });
  return chunks;
}

/**
 * 一步到位：查找 words 在 source 中的匹配并返回合并后无重叠的 chunk 序列。
 * 渲染层直接遍历结果。对齐 Semi findAll。
 */
export function highlightChunks(
  source: string,
  words: string | string[] | HighlightWord | HighlightWord[],
  options: FindRangesOptions = {},
): HighlightChunk[] {
  if (!source) return [];
  const ranges = findRanges(source, words, options);
  return chunksFromRanges(source, ranges);
}
