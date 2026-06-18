<!--
  Typography.Paragraph — see specs/components/basic/Typography.spec.md
  Renders a <p>. Shares the cd-typography base style class.
  NOTE: ellipsis/copyable/editable interactions are not implemented this round.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type TypoType = 'default' | 'secondary' | 'tertiary' | 'warning' | 'danger' | 'success';
  type TypoWeight = number | 'regular' | 'medium' | 'semibold' | 'bold';

  interface Props {
    type?: TypoType;
    strong?: boolean;
    weight?: TypoWeight;
    disabled?: boolean;
    mark?: boolean;
    underline?: boolean;
    delete?: boolean;
    code?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    type = 'default',
    strong = false,
    weight,
    disabled = false,
    mark = false,
    underline = false,
    delete: del = false,
    code = false,
    class: className = '',
    children,
  }: Props = $props();

  const weightMap: Record<string, string> = {
    regular: 'var(--cd-font-weight-regular)',
    medium: 'var(--cd-font-weight-medium)',
    semibold: 'var(--cd-font-weight-semibold)',
    bold: '700',
  };

  const resolvedWeight = $derived.by(() => {
    if (weight === undefined) return undefined;
    return typeof weight === 'number' ? String(weight) : weightMap[weight];
  });

  const cls = $derived(
    [
      'cd-typography',
      'cd-typography--paragraph',
      type !== 'default' && `cd-typography--${type}`,
      strong && 'cd-typography--strong',
      disabled && 'cd-typography--disabled',
      mark && 'cd-typography--mark',
      underline && 'cd-typography--underline',
      del && 'cd-typography--delete',
      code && 'cd-typography--code',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );

  const inlineStyle = $derived(resolvedWeight ? `font-weight:${resolvedWeight}` : undefined);
</script>

<p class={cls} style={inlineStyle} aria-disabled={disabled || undefined}>
  {@render children?.()}
</p>

<style>
  .cd-typography {
    margin: 0;
    color: var(--cd-typography-color);
  }
  .cd-typography--paragraph {
    margin-block-end: var(--cd-spacing-4);
  }
  .cd-typography--secondary {
    color: var(--cd-typography-color-secondary);
  }
  .cd-typography--tertiary {
    color: var(--cd-typography-color-tertiary);
  }
  .cd-typography--warning {
    color: var(--cd-color-warning);
  }
  .cd-typography--danger {
    color: var(--cd-color-danger);
  }
  .cd-typography--success {
    color: var(--cd-color-success);
  }
  .cd-typography--strong {
    font-weight: var(--cd-font-weight-semibold);
  }
  .cd-typography--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .cd-typography--mark {
    background-color: var(--cd-typography-mark-bg);
  }
  .cd-typography--underline {
    text-decoration-line: underline;
  }
  .cd-typography--delete {
    text-decoration-line: line-through;
  }
  .cd-typography--underline.cd-typography--delete {
    text-decoration-line: underline line-through;
  }
  .cd-typography--code {
    font-family: var(--cd-font-family-mono, monospace);
    font-size: var(--cd-typography-code-font-size);
    background-color: var(--cd-typography-code-bg);
    padding-inline: 0.4em;
    padding-block: 0.1em;
    border-radius: 3px;
  }
</style>
