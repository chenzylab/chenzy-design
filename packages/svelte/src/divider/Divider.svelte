<!--
  Divider — see specs/components/basic/Divider.spec.md
  纯展示分隔线，严格对齐 Semi Design（根永远是 div，无 role/aria）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  type DividerLayout = 'horizontal' | 'vertical';
  type DividerAlign = 'left' | 'center' | 'right';

  interface Props {
    layout?: DividerLayout;
    dashed?: boolean;
    align?: DividerAlign;
    margin?: string | number;
    class?: string;
    style?: string;
    children?: Snippet;
    [key: string]: unknown;
  }

  let {
    layout = 'horizontal',
    dashed = false,
    align = 'center',
    margin,
    class: className = '',
    style,
    children,
    ...rest
  }: Props = $props();

  const hasContent = $derived(!!children && layout === 'horizontal');

  const marginCss = $derived(typeof margin === 'number' ? `${margin}px` : margin);

  // margin 覆盖：vertical → margin-left/right；horizontal → margin-top/bottom。
  // 用户 style 优先（对齐 Semi {...override, ...style}）。
  const overrideStyle = $derived(
    marginCss
      ? layout === 'vertical'
        ? `margin-left:${marginCss};margin-right:${marginCss};`
        : `margin-top:${marginCss};margin-bottom:${marginCss};`
      : '',
  );

  const mergedStyle = $derived([overrideStyle, style].filter(Boolean).join('') || undefined);

  const cls = $derived(
    [
      'cd-divider',
      layout === 'horizontal' && 'cd-divider-horizontal',
      layout === 'vertical' && 'cd-divider-vertical',
      dashed && 'cd-divider-dashed',
      hasContent && 'cd-divider-with-text',
      hasContent && `cd-divider-with-text-${align}`,
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={cls} style={mergedStyle} {...rest}>
  {#if hasContent}
    <span class="cd-divider_inner-text">{@render children?.()}</span>
  {/if}
</div>

<style>
  .cd-divider {
    margin: var(--cd-spacing-divider-horizontal-margintop)
      var(--cd-spacing-divider-horizontal-marginright)
      var(--cd-spacing-divider-horizontal-marginbottom)
      var(--cd-spacing-divider-horizontal-marginleft);
    border-bottom: var(--cd-width-divider-border) solid var(--cd-color-divider-border-color);
    color: var(--cd-color-divider-text-default);
    box-sizing: border-box;
  }

  .cd-divider-dashed {
    border-bottom-style: dashed;
  }

  .cd-divider-horizontal {
    width: 100%;
    display: flex;
  }

  .cd-divider-vertical {
    border-bottom: 0;
    display: inline-block;
    margin: var(--cd-spacing-divider-vertical-margintop)
      var(--cd-spacing-divider-vertical-marginright)
      var(--cd-spacing-divider-vertical-marginbottom)
      var(--cd-spacing-divider-vertical-marginleft);
    border-left: var(--cd-width-divider-border) solid var(--cd-color-divider-border-color);
    height: var(--cd-height-divider-vertical);
    vertical-align: middle;
  }

  .cd-divider-with-text {
    display: flex;
    border-bottom: 0;
    white-space: nowrap;
    align-items: center;
  }

  .cd-divider-with-text .cd-divider_inner-text {
    font-weight: var(--cd-font-divider-text-weight);
    padding: var(--cd-spacing-divider-inner-text-paddingtop)
      var(--cd-spacing-divider-inner-text-paddingright)
      var(--cd-spacing-divider-inner-text-paddingbottom)
      var(--cd-spacing-divider-inner-text-paddingleft);
    display: inline-block;
  }

  .cd-divider-with-text::before,
  .cd-divider-with-text::after {
    content: '';
    width: 50%;
    border-bottom: var(--cd-width-divider-border) solid var(--cd-color-divider-border-color);
  }

  .cd-divider-with-text-left::before {
    width: var(--cd-width-divider-inner-text-left-line);
  }
  .cd-divider-with-text-left::after {
    flex: 1;
  }
  .cd-divider-with-text-right::before {
    flex: 1;
  }
  .cd-divider-with-text-right::after {
    width: var(--cd-width-divider-inner-text-right-line);
  }

  .cd-divider-dashed::before,
  .cd-divider-dashed::after {
    border-bottom: var(--cd-width-divider-border) dashed var(--cd-color-divider-border-color);
  }

  .cd-divider-vertical.cd-divider-dashed {
    border-left: var(--cd-width-divider-border) dashed var(--cd-color-divider-border-color);
  }
</style>
