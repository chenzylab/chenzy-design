<!--
  Button — 对外派发器（严格对齐 Semi semi-ui/button/index.tsx）。
  Semi：有 icon || (loading && !disabled) → IconButton 组装；否则 → BaseButton 纯容器。
  Svelte 无 cloneElement，故：BaseButton 承载全部视觉 CSS，本组件负责 content 子结构组装
  （icon 元素 + 文字 span），并把组装出的额外 class（-with-icon/-with-icon-only/-loading）、
  noHorizontalPadding 的 inline padding 透传给 BaseButton。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconAILoading } from '@chenzy-design/icons';
  import BaseButton from './BaseButton.svelte';
  import {
    getButtonGroupContext,
    type ButtonType,
    type ButtonTheme,
    type ButtonSize,
  } from './context.js';

  interface Props {
    type?: ButtonType;
    theme?: ButtonTheme;
    size?: ButtonSize;
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /**
     * AI 多彩按钮：对齐 Semi，仅 type=primary/tertiary 有 colorful 语义
     * （primary solid/light/borderless/outline，tertiary solid），其余组合无效果。
     */
    colorful?: boolean;
    htmlType?: 'button' | 'submit' | 'reset';
    /** 圆形按钮（border-radius:50%），配合 icon-only 呈正圆。 */
    circle?: boolean;
    /** 无障碍名；纯图标按钮必填（透传 aria-label）。 */
    ariaLabel?: string;
    /** 图标内容（Snippet）。 */
    icon?: Snippet;
    /** 图标相对文字位置。 */
    iconPosition?: 'left' | 'right';
    /**
     * 水平方向去内边距，仅在设置了 icon 时有效（对齐 Semi IconButton）。
     * true 等效 ['left','right']；'left'/'right' 去单侧；数组组合去两侧。inline padding 实现。
     */
    noHorizontalPadding?: boolean | 'left' | 'right' | Array<'left' | 'right'>;
    /** 根元素自定义类名（透传，叠加在内置 class 之后）。 */
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    /** 内容区（.cd-button-content）自定义类名（对齐 Semi contentClassName）。 */
    contentClassName?: string;
    children?: Snippet;
    onclick?: (e: MouseEvent) => void;
    onmousedown?: (e: MouseEvent) => void;
    onmouseenter?: (e: MouseEvent) => void;
    onmouseleave?: (e: MouseEvent) => void;
    /** 其余原生属性透传到根 button（data-* 名 name value form title tabindex aria-controls aria-expanded 等）。 */
    [key: string]: unknown;
  }

  let {
    type: typeProp,
    theme: themeProp,
    size: sizeProp,
    block = false,
    disabled: disabledProp,
    loading = false,
    colorful: colorfulProp,
    htmlType = 'button',
    circle = false,
    ariaLabel,
    icon,
    iconPosition = 'left',
    noHorizontalPadding = false,
    class: className,
    style: styleProp,
    contentClassName,
    children,
    onclick,
    onmousedown,
    onmouseenter,
    onmouseleave,
    ...rest
  }: Props = $props();

  // ButtonGroup 上下文：仅在未显式设置对应 prop 时作为默认回退（显式 prop 始终优先）。
  const group = getButtonGroupContext();
  const type = $derived<ButtonType>(typeProp ?? group?.type ?? 'primary');
  const theme = $derived<ButtonTheme>(themeProp ?? group?.theme ?? 'light');
  const size = $derived<ButtonSize>(sizeProp ?? group?.size ?? 'default');
  const disabled = $derived<boolean>(disabledProp ?? group?.disabled ?? false);
  const colorful = $derived<boolean>(colorfulProp ?? group?.colorful ?? false);

  // 对齐 Semi 派发：有 icon || (loading && !disabled) 走 IconButton 组装分支。
  const isIconButton = $derived(!!icon || (loading && !disabled));
  // loading 图标：仅在 loading && !disabled 时渲染 spinner（对齐 Semi）。
  const showLoadingIcon = $derived(loading && !disabled);
  // colorful loading 用自带渐变的 IconAILoading（对齐 Semi iconButton：渐变文字组合下 content
  // color:transparent 会吃掉 stroke=currentColor 的普通 spinner，故这些组合改用 stroke=url(#渐变)
  // 的 AILoading）。条件镜像 Semi：colorful 且 theme∈{light,outline,borderless} 或 solid+tertiary。
  const colorfulLoading = $derived(
    colorful &&
      (theme === 'light' ||
        theme === 'outline' ||
        theme === 'borderless' ||
        (theme === 'solid' && type === 'tertiary')),
  );
  // 是否渲染图标元素（loading spinner 或用户 icon）。
  const hasIconElem = $derived(showLoadingIcon || !!icon);
  // 纯图标（无文字）→ with-icon-only（对齐 Semi children == null）。
  const iconOnly = $derived(isIconButton && !children);

  // 组装到根 button 的额外 class（对齐 Semi iconBtnCls）。
  const extraClass = $derived(
    isIconButton
      ? [
          'cd-button-with-icon',
          iconOnly && 'cd-button-with-icon-only',
          loading && 'cd-button-loading',
        ]
          .filter(Boolean)
          .join(' ')
      : undefined,
  );

  // noHorizontalPadding → inline paddingLeft/Right=0（对齐 Semi IconButton，仅有 icon 时）。
  const style = $derived.by(() => {
    if (!icon || !noHorizontalPadding) return styleProp;
    const arr: Array<'left' | 'right'> = Array.isArray(noHorizontalPadding)
      ? noHorizontalPadding
      : noHorizontalPadding === true
        ? ['left', 'right']
        : [noHorizontalPadding];
    const parts: string[] = [];
    const base = styleProp?.trim().replace(/;$/, '');
    if (base) parts.push(base);
    if (arr.includes('left')) parts.push('padding-left:0');
    if (arr.includes('right')) parts.push('padding-right:0');
    return parts.length ? `${parts.join(';')};` : undefined;
  });

  // 文字 span class（对齐 Semi）：iconPosition=left → content-right；=right → content-left。
  const textCls = $derived(
    iconPosition === 'right' ? 'cd-button-content-left' : 'cd-button-content-right',
  );
</script>

{#snippet iconElem()}
  {#if showLoadingIcon}
    {#if colorfulLoading}
      <!-- colorful 渐变文字组合：用 stroke=url(#渐变) 的 AILoading，不被 content transparent 吃掉。 -->
      <IconAILoading class="cd-button-loading-spin" />
    {:else}
      <svg class="cd-button-loading-spin" viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true">
        <path d="M12 3a9 9 0 1 0 9 9" />
      </svg>
    {/if}
  {:else if icon}
    {@render icon()}
  {/if}
{/snippet}

{#snippet assembledContent()}
  {#if iconPosition === 'right'}
    {#if children}<span class={textCls}>{@render children()}</span>{/if}
    {#if hasIconElem}{@render iconElem()}{/if}
  {:else}
    {#if hasIconElem}{@render iconElem()}{/if}
    {#if children}<span class={textCls}>{@render children()}</span>{/if}
  {/if}
{/snippet}

<BaseButton
  {...rest}
  {type}
  {theme}
  {size}
  {block}
  {disabled}
  {colorful}
  {circle}
  {htmlType}
  {extraClass}
  class={className}
  {style}
  {contentClassName}
  aria-label={ariaLabel}
  aria-busy={loading || undefined}
  {onclick}
  {onmousedown}
  {onmouseenter}
  {onmouseleave}
>
  {#if isIconButton}
    {@render assembledContent()}
  {:else}
    {@render children?.()}
  {/if}
</BaseButton>

<style>
  /* ===== IconButton 组装态样式（对齐 Semi iconButton.scss）===== */
  /* with-icon：content 居中排布。 */
  :global(.cd-button-with-icon) {
    display: inline-flex;
    align-items: center;
  }
  :global(.cd-button-with-icon) :global(.cd-button-content) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* 图标↔文字间距（对齐 Semi -content-left / -content-right margin）。 */
  :global(.cd-button-content-left) {
    margin-right: var(--cd-spacing-button-icononly-content-marginright);
    display: flex;
    align-items: center;
  }
  :global(.cd-button-content-right) {
    margin-left: var(--cd-spacing-button-icononly-content-marginleft);
    display: flex;
    align-items: center;
  }

  /* loading：禁用交互 + 图标旋转（对齐 Semi -loading）。 */
  :global(.cd-button-loading) {
    pointer-events: none;
    cursor: not-allowed;
  }
  /* svg 用 :global——loading spinner 可能来自外部图标组件（colorful 用 IconAILoading），
     其 svg 不带 Button 的 scope class，不加 :global 则选择器丢失、旋转动画失效。 */
  :global(.cd-button-loading) :global(.cd-button-content) > :global(svg) {
    width: 16px;
    height: 16px;
    animation: cd-button-icon-rotate var(--cd-animation-duration-button-icon-loading) linear infinite;
    animation-fill-mode: forwards;
  }
  @keyframes cd-button-icon-rotate {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* with-icon-only（纯图标）：方形尺寸 + iconOnly 内边距（对齐 Semi -with-icon-only）。 */
  :global(.cd-button-with-icon-only) {
    padding-left: var(--cd-spacing-button-icononly-default-paddingleft);
    padding-right: var(--cd-spacing-button-icononly-default-paddingright);
    padding-top: var(--cd-spacing-button-icononly-default-paddingtop);
    padding-bottom: var(--cd-spacing-button-icononly-default-paddingbottom);
    height: var(--cd-height-button-icononly-default);
    width: var(--cd-width-button-icononly-default);
    justify-content: center;
    align-items: center;
  }
  :global(.cd-button-with-icon-only.cd-button-size-small) {
    padding-left: var(--cd-spacing-button-icononly-small-paddingleft);
    padding-right: var(--cd-spacing-button-icononly-small-paddingright);
    padding-top: var(--cd-spacing-button-icononly-small-paddingtop);
    padding-bottom: var(--cd-spacing-button-icononly-small-paddingbottom);
    height: var(--cd-height-button-icononly-small);
    width: var(--cd-width-button-icononly-small);
  }
  :global(.cd-button-with-icon-only.cd-button-size-large) {
    padding-left: var(--cd-spacing-button-icononly-large-paddingleft);
    padding-right: var(--cd-spacing-button-icononly-large-paddingright);
    padding-top: var(--cd-spacing-button-icononly-large-paddingtop);
    padding-bottom: var(--cd-spacing-button-icononly-large-paddingbottom);
    height: var(--cd-height-button-icononly-large);
    width: var(--cd-width-button-icononly-large);
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.cd-button-loading) :global(.cd-button-content) > :global(svg) {
      animation: none;
    }
  }
</style>
