/**
 * Markdown 文本中的 HTML 尖括号转义 —— 严格对齐 Semi
 * `semi-foundation/utils/escapeHtml.ts` 的 `escapeHtmlInMarkdown`。
 *
 * 背景：Markdown 渲染管线会剥离 raw HTML 节点，用户输入的形如 `<AgentChat />`
 * 的内容会被当成 HTML 标签而**静默消失**。把代码块 / 行内代码之外的 `<` 转成
 * `&lt;`，解析器就会按字面文本处理。
 *
 * 保留不转义的两种语境（与 Semi 一致）：
 *   1. ``` / ~~~ 围栏代码块内的所有行；
 *   2. 行内 `code` span（按反引号数量精确配对）。
 */

/** 转义单行中位于行内代码之外的 `<`。 */
function escapeAngleBracketsOutsideInlineCode(line: string): string {
  const parts: string[] = [];
  let i = 0;

  while (i < line.length) {
    if (line[i] === '`') {
      // 统计开引号数量，找同样数量的闭引号
      let count = 0;
      const start = i;
      while (i < line.length && line[i] === '`') {
        count++;
        i++;
      }
      const closer = '`'.repeat(count);
      const closeIdx = line.indexOf(closer, i);
      if (closeIdx !== -1) {
        parts.push(line.slice(start, closeIdx + count));
        i = closeIdx + count;
      } else {
        // 没有配对闭引号：反引号按普通文本处理，其中的 `<` 照常转义
        parts.push(line.slice(start, i).replace(/</g, '&lt;'));
      }
    } else if (line[i] === '<') {
      parts.push('&lt;');
      i++;
    } else {
      // 一次性收集一段普通字符，减少循环次数
      const next = line.indexOf('<', i);
      const nextBt = line.indexOf('`', i);
      let end: number;
      if (next === -1 && nextBt === -1) {
        end = line.length;
      } else if (next === -1) {
        end = nextBt;
      } else if (nextBt === -1) {
        end = next;
      } else {
        end = Math.min(next, nextBt);
      }
      parts.push(line.slice(i, end));
      i = end;
    }
  }

  return parts.join('');
}

/** 转义 Markdown 文本中的 HTML 尖括号，保留代码块与行内代码。 */
export function escapeHtmlInMarkdown(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let fenceChar: string | null = null;
  let fenceLen = 0;

  for (const line of lines) {
    if (fenceChar !== null) {
      // 围栏代码块内部——原样保留，并检测闭合围栏
      result.push(line);
      const trimmed = line.trimEnd();
      if (
        trimmed.length >= fenceLen &&
        trimmed[0] === fenceChar &&
        trimmed === fenceChar.repeat(trimmed.length)
      ) {
        fenceChar = null;
      }
    } else {
      const fenceMatch = line.match(/^(`{3,}|~{3,})/);
      const fence = fenceMatch?.[1];
      if (fence) {
        // 本库 tsconfig 比 Semi 严格（noUncheckedIndexedAccess）：捕获组需先取出判空，
        // 不能直接 fenceMatch[1][0]。
        fenceChar = fence[0] ?? null;
        fenceLen = fence.length;
        result.push(line);
      } else {
        result.push(escapeAngleBracketsOutsideInlineCode(line));
      }
    }
  }

  return result.join('\n');
}
