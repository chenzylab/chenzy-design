/**
 * 从 hast code 元素节点提取 language（严格对齐 Semi `nth(props.className?.split("-"), -1)`）。
 *
 * 非标准 'language-' 前缀切割：取 className 整串按 '-' 分隔后的最后一段。
 * 语言名本身含 '-' 时（如 'language-objective-c'）会取到 'c'，这是 Semi 的既有行为，
 * 严格对齐要求复刻而非"修正"。供 markdown-render 的 code.svelte 与 chat/aiChatDialogue
 * 的 Code 覆盖组件共享（Semi 侧 chat/code.tsx、aiChatDialogue/code.tsx 都直接复用
 * markdownRender/components 的 code(props) 判定逻辑）。
 */
import type { Element } from 'hast';

export function getCodeClassName(node: Element | undefined): string {
  const cn = node?.properties?.className;
  const classes = Array.isArray(cn) ? cn.map(String) : cn ? [String(cn)] : [];
  return classes.join(' ');
}

export function getCodeLanguage(node: Element | undefined): string | undefined {
  const className = getCodeClassName(node);
  if (!className) return undefined;
  const parts = className.split('-');
  return parts[parts.length - 1] || undefined;
}
