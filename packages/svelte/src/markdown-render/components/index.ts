/**
 * MarkdownRender 默认组件映射（严格对齐 Semi markdownRender/components/index.tsx）。
 * Semi 导出 11 键：h1-h6 / a / img / table / p / code。逐一映射到本库组件：
 *  - h1-h6 → Typography.Title（h1.svelte ~ h6.svelte，逐文件对齐 Semi h1.tsx ~ h6.tsx）
 *  - a     → Typography.Text link（a.svelte）
 *  - img   → div > Image + alt（img.svelte）
 *  - table → 本库 Table（table.svelte，从 hast 解析 columns/dataSource）
 *  - p     → Typography.Paragraph（p.svelte）
 *  - code  → 有语言 CodeHighlight / 无语言 span.simple-code（code.svelte，同时处理行内与围栏两种）
 * 不覆盖 pre 键（Semi SemiMarkdownComponents 无此键，pre 保留原生标签）。
 */
import type { Component } from 'svelte';
import H1 from './h1.svelte';
import H2 from './h2.svelte';
import H3 from './h3.svelte';
import H4 from './h4.svelte';
import H5 from './h5.svelte';
import H6 from './h6.svelte';
import A from './a.svelte';
import Img from './img.svelte';
import Table from './table.svelte';
import P from './p.svelte';
import Code from './code.svelte';

export { H1, H2, H3, H4, H5, H6, A, Img, Table, P, Code };

/** 默认可覆盖元素集合（对齐 Semi SemiMarkdownComponents 的 11 键 h1-h6/a/img/table/p/code）。 */
export const defaultComponents: Record<string, Component<Record<string, unknown>>> = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  a: A,
  img: Img,
  table: Table,
  p: P,
  code: Code,
};
