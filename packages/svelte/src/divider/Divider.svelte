<!--
  Divider — see specs/components/basic/Divider.spec.md
  Pure presentational separator. Token-driven, a11y role="separator".
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
    thickness?: number;
    plain?: boolean;
    class?: string;
    children?: Snippet;
  }

  let {
    layout = 'horizontal',
    dashed = false,
    align = 'center',
    margin,
    thickness = 1,
    plain = true,
    class: className = '',
    children,
  }: Props = $props();

  const hasContent = $derived(layout === 'horizontal' && !!children);

  const marginCss = $derived(typeof margin === 'number' ? `${margin}px` : margin);

  const inlineStyle = $derived(
    [
      `--cd-divider-thickness:${thickness}px`,
      layout === 'horizontal' && marginCss && `margin-block:${marginCss}`,
      layout === 'vertical' && marginCss && `margin-inline:${marginCss}`,
    ]
      .filter(Boolean)
      .join(';'),
  );
</script>

{#if layout === 'vertical'}
  <span
    class={['cd-divider', 'cd-divider--vertical', dashed && 'cd-divider--dashed', className]
      .filter(Boolean)
      .join(' ')}
    role="separator"
    aria-orientation="vertical"
    style={inlineStyle}
  ></span>
{:else if hasContent}
  <div
    class={[
      'cd-divider',
      'cd-divider--horizontal',
      'cd-divider--with-text',
      `cd-divider--align-${align}`,
      dashed && 'cd-divider--dashed',
      !plain && 'cd-divider--bold',
      className,
    ]
      .filter(Boolean)
      .join(' ')}
    role="separator"
    style={inlineStyle}
  >
    <span class="cd-divider__text">{@render children?.()}</span>
  </div>
{:else}
  <div
    class={['cd-divider', 'cd-divider--horizontal', dashed && 'cd-divider--dashed', className]
      .filter(Boolean)
      .join(' ')}
    role="separator"
    style={inlineStyle}
  ></div>
{/if}

<style>
  .cd-divider {
    --cd-divider-thickness: 1px;
    box-sizing: border-box;
    border-color: var(--cd-divider-color);
    border-style: solid;
  }
  .cd-divider--dashed {
    border-style: dashed;
  }

  /* horizontal plain line */
  .cd-divider--horizontal {
    display: block;
    width: 100%;
    border: 0;
    border-block-start: var(--cd-divider-thickness) solid var(--cd-divider-color);
    margin-block: var(--cd-divider-spacing);
  }
  .cd-divider--horizontal.cd-divider--dashed {
    border-block-start-style: dashed;
  }

  /* horizontal with text */
  .cd-divider--with-text {
    display: flex;
    align-items: center;
    width: 100%;
    border: 0;
    margin-block: var(--cd-divider-spacing);
    color: var(--cd-divider-text-color);
    font-size: var(--cd-divider-text-font-size);
  }
  .cd-divider--with-text::before,
  .cd-divider--with-text::after {
    content: '';
    flex: 1 1 auto;
    border-block-start: var(--cd-divider-thickness) solid var(--cd-divider-color);
  }
  .cd-divider--with-text.cd-divider--dashed::before,
  .cd-divider--with-text.cd-divider--dashed::after {
    border-block-start-style: dashed;
  }
  .cd-divider__text {
    flex: 0 0 auto;
    padding-inline: var(--cd-divider-text-gap);
  }
  .cd-divider--bold .cd-divider__text {
    font-weight: var(--cd-divider-text-weight);
  }
  .cd-divider--align-left::before {
    flex: 0 0 5%;
  }
  .cd-divider--align-right::after {
    flex: 0 0 5%;
  }

  /* vertical */
  .cd-divider--vertical {
    display: inline-block;
    height: 0.9em;
    border: 0;
    border-inline-start: var(--cd-divider-thickness) solid var(--cd-divider-color);
    margin-inline: var(--cd-divider-spacing);
    vertical-align: middle;
  }
  .cd-divider--vertical.cd-divider--dashed {
    border-inline-start-style: dashed;
  }
</style>
