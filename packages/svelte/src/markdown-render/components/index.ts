/**
 * MarkdownRender 默认组件映射（严格对齐 Semi markdownRender/components/index.tsx）。
 * Semi 注册 11 键：h1-h6 / p / a / img / table / code。逐一映射到本库组件：
 *  - h1-h6 → Typography.Title（MdHeading 按 tagName 推 heading 级别）
 *  - p     → Typography.Paragraph（MdParagraph）
 *  - a     → Typography.Text link（MdLink）
 *  - img   → div > Image + alt（MdImage）
 *  - table → 本库 Table（MdTable，从 hast 解析 columns/dataSource）
 *  - code  → 有语言 CodeHighlight / 无语言 span.simple-code（MdCode）
 */
import type { Component } from 'svelte';
import MdHeading from './MdHeading.svelte';
import MdParagraph from './MdParagraph.svelte';
import MdLink from './MdLink.svelte';
import MdImage from './MdImage.svelte';
import MdTable from './MdTable.svelte';
import MdCode from './MdCode.svelte';
import MdPre from './MdPre.svelte';

export { MdHeading, MdParagraph, MdLink, MdImage, MdTable, MdCode, MdPre };

/**
 * 默认可覆盖元素集合（对齐 Semi SemiMarkdownComponents 的 11 键 h1-h6/p/a/img/table/code）。
 * 本库标准 remark-rehype 产出 pre>code，故围栏代码块用 pre 键（MdPre）拦截整块渲染
 * CodeHighlight，code 键（MdCode）只处理行内 code——最终 DOM 与 Semi 一致（无 pre 嵌套）。
 */
export const defaultComponents: Record<string, Component<Record<string, unknown>>> = {
  h1: MdHeading,
  h2: MdHeading,
  h3: MdHeading,
  h4: MdHeading,
  h5: MdHeading,
  h6: MdHeading,
  p: MdParagraph,
  a: MdLink,
  img: MdImage,
  table: MdTable,
  code: MdCode,
  pre: MdPre,
};
