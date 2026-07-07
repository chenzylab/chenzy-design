<!--
  Typography.Numeral — 数值格式化文本（对齐 Semi Typography.Numeral）。
  在 Text 样式基础上，遍历 children 的文本节点，按 rule/precision/truncate/parser
  格式化其中的数字（千分位/百分比/字节/精度/科学计数），渲染到 <span>（或 component）。
  格式化引擎来自 @chenzy-design/core formatNumeral（框架无关、可测）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { formatNumeral, type NumeralRule, type NumeralTruncate } from '@chenzy-design/core';

  type TypoType = 'default' | 'secondary' | 'tertiary' | 'quaternary' | 'warning' | 'danger' | 'success';
  type TypoSize = 'small' | 'default' | 'large' | 'inherit';

  interface Props {
    /** 解析规则（对齐 Semi）。 */
    rule?: NumeralRule;
    /** 保留小数位数。 */
    precision?: number;
    /** 小数截断取整方式。 */
    truncate?: NumeralTruncate;
    /** 自定义解析函数（优先于 rule）。 */
    parser?: (raw: string) => string;
    /** 渲染元素，默认 span。 */
    component?: string;
    /** 渲染为链接样式（对齐 Semi Numeral link）。 */
    link?: boolean;
    // —— 复用 Text 的样式 props ——
    type?: TypoType;
    size?: TypoSize;
    strong?: boolean;
    mark?: boolean;
    underline?: boolean;
    delete?: boolean;
    code?: boolean;
    disabled?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    rule = 'text',
    precision = 0,
    truncate = 'round',
    parser,
    component = 'span',
    link = false,
    type = 'default',
    size = 'default',
    strong = false,
    mark = false,
    underline = false,
    delete: del = false,
    code = false,
    disabled = false,
    class: className = '',
    children,
  }: Props = $props();

  let hostEl = $state<HTMLElement>();

  // 遍历 host 下所有文本节点，按 numeral 规则格式化。渲染后 + children 变化时重跑。
  $effect(() => {
    const el = hostEl;
    if (!el) return;
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

  const cls = $derived(
    [
      'cd-typography',
      'cd-typography--text',
      type !== 'default' && `cd-typography--${type}`,
      size !== 'default' && `cd-typography--size-${size}`,
      link && 'cd-typography--link',
      strong && 'cd-typography--strong',
      mark && 'cd-typography--mark',
      underline && 'cd-typography--underline',
      del && 'cd-typography--delete',
      code && 'cd-typography--code',
      disabled && 'cd-typography--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<svelte:element this={component} bind:this={hostEl} class={cls} aria-disabled={disabled || undefined}>
  {@render children?.()}
</svelte:element>
