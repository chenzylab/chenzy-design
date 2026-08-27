/**
 * 从 .svelte 文件抽取 <script> 块（含 <script lang="ts"> 与 <script module>），
 * 供 oxc 按 TS 处理（删函数体 / 抽函数），处理结果按原 offset 拼回——模板
 * （markup）永远保留：模板本身就是结构信息。
 */

export interface ScriptBlock {
  /** 块内容（不含 <script> 标签） */
  content: string;
  /** 内容在原文中的起始 offset */
  start: number;
  /** 内容在原文中的结束 offset */
  end: number;
}

/**
 * 找到 <script ...> 开标签的结束 `>`。属性值里可能含 `>`（如
 * generics="T extends Record<string, unknown>"），必须做引号感知扫描，
 * 不能用 [^>]* 正则。
 */
function findTagEnd(source: string, tagStart: number): number {
  let inStr: string | null = null;
  for (let i = tagStart; i < source.length; i++) {
    const ch = source[i];
    if (inStr) {
      if (ch === inStr) inStr = null;
      continue;
    }
    if (ch === '"' || ch === "'") inStr = ch;
    else if (ch === '>') return i;
  }
  return -1;
}

export function extractScriptBlocks(source: string): ScriptBlock[] {
  const blocks: ScriptBlock[] = [];
  const re = /<script\b/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const tagEnd = findTagEnd(source, m.index);
    if (tagEnd === -1) break;
    const contentStart = tagEnd + 1;
    const close = source.indexOf('</script>', contentStart);
    if (close === -1) break;
    blocks.push({
      content: source.slice(contentStart, close),
      start: contentStart,
      end: close,
    });
    re.lastIndex = close + '</script>'.length;
  }
  return blocks;
}

/**
 * 对每个 script 块应用 transform（如 removeFunctionBodies），失败的块原样保留。
 * 返回拼回后的完整 .svelte 文本。
 */
export function transformSvelteScripts(
  source: string,
  transform: (scriptContent: string) => string,
): string {
  const blocks = extractScriptBlocks(source);
  if (blocks.length === 0) return source;

  let result = '';
  let cursor = 0;
  for (const block of blocks) {
    result += source.slice(cursor, block.start);
    let transformed = block.content;
    try {
      transformed = transform(block.content);
    } catch {
      // oxc 解析失败 → 该块原样保留（fallback）
    }
    result += transformed;
    cursor = block.end;
  }
  result += source.slice(cursor);
  return result;
}
