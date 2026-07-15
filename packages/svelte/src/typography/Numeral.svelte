<!--
  Typography.Numeral — 数值格式化文本，对齐 Semi Typography.Numeral。
  在 Text 样式（复用 TypographyBase）基础上，遍历渲染后 children 的文本节点，
  按 rule / precision / truncate / parser 格式化其中数字。格式化引擎来自
  @chenzy-design/core formatNumeral（框架无关、可测，逻辑对齐 Semi formatNumeral）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { formatNumeral, type NumeralRule, type NumeralTruncate } from '@chenzy-design/core';
  import TypographyBase, {
    type TypoType,
    type TypoSize,
    type EllipsisConfig,
    type CopyableConfig,
  } from './TypographyBase.svelte';

  interface Props {
    /** 解析规则（对齐 Semi）。 */
    rule?: NumeralRule;
    /** 保留小数位数。 */
    precision?: number;
    /** 小数截断取整方式。 */
    truncate?: NumeralTruncate;
    /** 自定义解析函数（优先于 rule）。 */
    parser?: (raw: string) => string;
    component?: string;
    /** 链接（对齐 Semi Numeral link）。 */
    link?: boolean | Record<string, unknown>;
    /** 前置图标（对齐 Semi icon）。 */
    icon?: Snippet;
    // —— 复用 Text 的样式 props ——
    type?: TypoType;
    size?: TypoSize;
    strong?: boolean;
    mark?: boolean;
    underline?: boolean;
    delete?: boolean;
    code?: boolean;
    disabled?: boolean;
    ellipsis?: boolean | EllipsisConfig;
    copyable?: boolean | CopyableConfig;
    class?: string;
    style?: string;
    children?: Snippet;
  }

  let {
    rule = 'text',
    precision = 0,
    truncate = 'round',
    parser,
    component = 'span',
    link = false,
    icon,
    type = 'primary',
    size = 'normal',
    strong = false,
    mark = false,
    underline = false,
    delete: del = false,
    code = false,
    disabled = false,
    ellipsis = false,
    copyable = false,
    class: className = '',
    style,
    children,
  }: Props = $props();

  let hostEl = $state<HTMLElement | undefined>();

  // 遍历 host 下所有文本节点，按 numeral 规则格式化（对齐 Semi formatNodeDFS 语义）。
  // 渲染后 + 规则变化时重跑。
  $effect(() => {
    const el = hostEl;
    if (!el) return;
    // 依赖收集：规则变化触发重算
    void rule;
    void precision;
    void truncate;
    void parser;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    let n = walker.nextNode();
    while (n) {
      nodes.push(n as Text);
      n = walker.nextNode();
    }
    for (const node of nodes) {
      const raw = node.nodeValue ?? '';
      if (!raw.trim()) continue;
      const formatted = formatNumeral(raw, { rule, precision, truncate, ...(parser ? { parser } : {}) });
      if (formatted !== raw) node.nodeValue = formatted;
    }
  });
</script>

<TypographyBase
  element={component}
  hostRef={(el) => (hostEl = el)}
  {type}
  {size}
  {strong}
  {mark}
  {underline}
  delete={del}
  {code}
  {disabled}
  {icon}
  {link}
  {ellipsis}
  {copyable}
  class={className}
  {style}
>
  {@render children?.()}
</TypographyBase>
