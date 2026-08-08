<!--
  IconButton — 图标装配唯一逻辑源（严格对齐 Semi iconButton/index.tsx）。
  Semi：button/index.tsx 派发器在 icon || (loading && !disabled) 时委托本组件渲染，
  本组件再渲染 button/Button.tsx（纯容器）。Svelte 镜像同一委托方向：
  Button.svelte 是薄派发器，命中条件时渲染 IconButton，否则渲染 BaseButton；
  本组件是图标组装唯一逻辑源（icon 元素 + 文字 span 组装、noHorizontalPadding、
  loading spinner、colorful fill 注入），不再由 Button.svelte 重复实现。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { IconAILoading, Icon, type IconSize } from '@chenzy-design/icons';
  import BaseButton from '../button/BaseButton.svelte';
  import type { ButtonType, ButtonTheme, ButtonSize } from '../button/context.js';
  import LoadingSpinIcon from './LoadingSpinIcon.svelte';

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
    'aria-label'?: string | undefined;
    /** 图标内容（Snippet）；colorful 命中 multipleColor/twoColor 时收到 fill 数组（对齐 Semi cloneElement 注入）。 */
    icon?: Snippet<[{ fill?: string | string[] | undefined }]> | undefined;
    /** 图标相对文字位置。 */
    iconPosition?: 'left' | 'right';
    /** 图标尺寸（作用在图标元素上，对齐 Semi iconSize，仅 IconButton 独有）。 */
    iconSize?: IconSize | undefined;
    /** 图标内联样式（作用在图标元素上，对齐 Semi iconStyle，仅 IconButton 独有）。 */
    iconStyle?: string | undefined;
    /**
     * 水平方向去内边距，仅在设置了 icon 时有效（对齐 Semi IconButton）。
     * true 等效 ['left','right']；'left'/'right' 去单侧；数组组合去两侧。inline padding 实现。
     */
    noHorizontalPadding?: boolean | 'left' | 'right' | Array<'left' | 'right'>;
    /** 根元素自定义类名（透传，叠加在内置 class 之后）。 */
    class?: string | undefined;
    /** 根元素自定义内联样式（透传）。 */
    style?: string | undefined;
    /** 内容区（.cd-button-content）自定义类名（对齐 Semi contentClassName）。 */
    contentClassName?: string | undefined;
    /**
     * 是否走图标装配路径（内部 Button.svelte 派发器专用，透传其已算好的
     * icon||(loading&&!disabled) 判定；用户直接用 IconButton 组件时不传，
     * 始终为图标装配语义，等价于 undefined→true）。
     */
    iconButtonMode?: boolean | undefined;
    children?: Snippet | undefined;
    onclick?: ((e: MouseEvent) => void) | undefined;
    onmousedown?: ((e: MouseEvent) => void) | undefined;
    onmouseenter?: ((e: MouseEvent) => void) | undefined;
    onmouseleave?: ((e: MouseEvent) => void) | undefined;
    /** 其余原生属性透传到根 button（data-* 名 name value form title tabindex aria-controls aria-expanded 等）。 */
    [key: string]: unknown;
  }

  let {
    type = 'primary',
    theme = 'light',
    size = 'default',
    block = false,
    disabled = false,
    loading = false,
    colorful = false,
    htmlType = 'button',
    circle = false,
    'aria-label': ariaLabel,
    icon,
    iconPosition = 'left',
    iconSize,
    iconStyle,
    noHorizontalPadding = false,
    class: className,
    style: styleProp,
    contentClassName,
    iconButtonMode,
    children,
    onclick,
    onmousedown,
    onmouseenter,
    onmouseleave,
    ...rest
  }: Props = $props();

  // 图标装配路径开关（对齐 Semi button/index.tsx 派发条件 icon||(loading&&!disabled)）。
  // IconButton 组件本身（用户直接用）总是走图标装配路径（「带图标的 Button」本就是它的语义）；
  // Button.svelte 派发器改为始终渲染本组件、显式传入其已算好的判定结果，使根 DOM（<button>，
  // 由内部唯一的 <BaseButton> 承载）在 loading/icon 变化时不被销毁重建（对齐 Semi index.tsx
  // 内部单一 render 出口）——曾因 Button.svelte 用 {#if}在 IconButton/BaseButton 两个不同
  // 组件间切换，导致持有旧 DOM 引用的消费方在状态切换后读到销毁前的节点（Feedback loading
  // class 断言即是一例）。
  const isIconButtonMode = $derived(iconButtonMode ?? true);

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
  const iconOnly = $derived(!children);

  // colorful 具名图标 fill 注入（对齐 Semi iconButton multipleColor/twoColor 判定）：
  //   multipleColor（4 色）：solid+tertiary，或 primary+(light|borderless)
  //   twoColor（2 色）：tertiary+(light|borderless|outline)
  // disabled 时 fill 整组落到禁用灰；两者都不命中则不传 fill（图标用自身默认色）。
  const iconFill = $derived.by<string | string[] | undefined>(() => {
    if (!colorful || !icon) return undefined;
    const multipleColor =
      (theme === 'solid' && type === 'tertiary') ||
      (type === 'primary' && (theme === 'light' || theme === 'borderless'));
    const twoColor =
      type === 'tertiary' && (theme === 'light' || theme === 'borderless' || theme === 'outline');
    if (multipleColor) {
      return disabled
        ? new Array(4).fill('var(--cd-color-button-disabled-text-default)')
        : [
            'var(--cd-color-button-colorful-multiple-fill-0)',
            'var(--cd-color-button-colorful-multiple-fill-1)',
            'var(--cd-color-button-colorful-multiple-fill-2)',
            'var(--cd-color-button-colorful-multiple-fill-3)',
          ];
    }
    if (twoColor) {
      return disabled
        ? new Array(2).fill('var(--cd-color-button-disabled-text-default)')
        : [
            'var(--cd-color-button-colorful-fill-primary)',
            'var(--cd-color-button-colorful-fill-secondary)',
          ];
    }
    return undefined;
  });

  // 组装到根 button 的额外 class（对齐 Semi iconBtnCls）。未命中图标装配路径时
  // （Button.svelte 派发器传 iconButtonMode=false）不加 -with-icon 系列，
  // 等价于 Semi BaseButton 分支的纯净 class（对齐 Semi 未 hasIcon 时的 className）。
  const extraClass = $derived(
    isIconButtonMode
      ? [
          'cd-button-with-icon',
          iconOnly && 'cd-button-with-icon-only',
          loading && 'cd-button-loading',
          className,
        ]
          .filter(Boolean)
          .join(' ')
      : className,
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

  // iconSize/iconStyle 提供时用 <Icon> 包裹用户 icon（对齐 Semi 作用在图标元素上，仅 IconButton 独有）。
  const wrapIcon = $derived(iconSize !== undefined || iconStyle !== undefined);
</script>

{#snippet iconElem()}
  {#if showLoadingIcon}
    {#if colorfulLoading}
      <!-- colorful 渐变文字组合：用 stroke=url(#渐变) 的 AILoading，不被 content transparent 吃掉。 -->
      <IconAILoading class="cd-button-loading-spin" />
    {:else}
      <LoadingSpinIcon class="cd-button-loading-spin" />
    {/if}
  {:else if icon}
    {#if wrapIcon}
      <!-- 尺寸容器为装饰性（语义由按钮 ariaLabel/children 文字承载，对齐 Semi）：aria-hidden 避免
           role=img 无 alt 的 axe 违规，内部真图标仍随之隐藏。 -->
      <Icon size={iconSize ?? 'default'} style={iconStyle ?? ''} aria-hidden="true">
        {@render icon({ fill: iconFill })}
      </Icon>
    {:else}
      {@render icon({ fill: iconFill })}
    {/if}
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
  {style}
  {contentClassName}
  aria-label={ariaLabel}
  aria-busy={loading || undefined}
  {onclick}
  {onmousedown}
  {onmouseenter}
  {onmouseleave}
>
  {#if isIconButtonMode}
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
     其 svg 不带 IconButton 的 scope class，不加 :global 则选择器丢失、旋转动画失效。
     用后代选择器（非直接子代 `>`）：IconAILoading 内部是 <Icon><svg/></Icon>，Icon 基座会
     多包一层 <span class="cd-icon">，svg 不是 .cd-button-content 的直接子元素——`>` 匹配不到，
     曾导致 colorful loading 的 spinner 完全不转（LoadingSpinIcon 因无中间层侥幸命中）。 */
  :global(.cd-button-loading) :global(.cd-button-content) :global(svg) {
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

  /* with-icon-only（纯图标）：方形尺寸 + iconOnly 内边距（对齐 Semi -with-icon-only）。
     选择器带上 `.cd-button` 补一级特异性：基础 padding 规则是 `.cd-button.svelte-xxx`(0,2,0)，
     单靠 `.cd-button-with-icon-only`(0,1,0) 会被它压过，导致纯图标按钮拿到 default padding
     （实测 6px，Semi 是 iconOnly 的 8px）。 */
  :global(.cd-button.cd-button-with-icon-only) {
    padding-left: var(--cd-spacing-button-icononly-default-paddingleft);
    padding-right: var(--cd-spacing-button-icononly-default-paddingright);
    padding-top: var(--cd-spacing-button-icononly-default-paddingtop);
    padding-bottom: var(--cd-spacing-button-icononly-default-paddingbottom);
    height: var(--cd-height-button-icononly-default);
    width: var(--cd-width-button-icononly-default);
    justify-content: center;
    align-items: center;
  }
  :global(.cd-button.cd-button-with-icon-only.cd-button-size-small) {
    padding-left: var(--cd-spacing-button-icononly-small-paddingleft);
    padding-right: var(--cd-spacing-button-icononly-small-paddingright);
    padding-top: var(--cd-spacing-button-icononly-small-paddingtop);
    padding-bottom: var(--cd-spacing-button-icononly-small-paddingbottom);
    height: var(--cd-height-button-icononly-small);
    width: var(--cd-width-button-icononly-small);
  }
  :global(.cd-button.cd-button-with-icon-only.cd-button-size-large) {
    padding-left: var(--cd-spacing-button-icononly-large-paddingleft);
    padding-right: var(--cd-spacing-button-icononly-large-paddingright);
    padding-top: var(--cd-spacing-button-icononly-large-paddingtop);
    padding-bottom: var(--cd-spacing-button-icononly-large-paddingbottom);
    height: var(--cd-height-button-icononly-large);
    width: var(--cd-width-button-icononly-large);
  }

  @media (prefers-reduced-motion: reduce) {
    :global(.cd-button-loading) :global(.cd-button-content) :global(svg) {
      animation: none;
    }
  }

  /* ===== RTL（对齐 Semi button/rtl.scss 的 iconButton 段）=====
     三档尺寸的 icon-only padding 左右互换；content-left/right margin 互换。 */
  :global(.cd-rtl) :global(.cd-button.cd-button-with-icon-only) {
    padding-left: var(--cd-spacing-button-icononly-default-paddingright);
    padding-right: var(--cd-spacing-button-icononly-default-paddingleft);
  }
  :global(.cd-rtl) :global(.cd-button.cd-button-with-icon-only.cd-button-size-small) {
    padding-left: var(--cd-spacing-button-icononly-small-paddingright);
    padding-right: var(--cd-spacing-button-icononly-small-paddingleft);
  }
  :global(.cd-rtl) :global(.cd-button.cd-button-with-icon-only.cd-button-size-large) {
    padding-left: var(--cd-spacing-button-icononly-large-paddingright);
    padding-right: var(--cd-spacing-button-icononly-large-paddingleft);
  }
  :global(.cd-rtl) :global(.cd-button-content-left) {
    margin-left: var(--cd-spacing-button-icononly-content-marginright);
    margin-right: 0;
  }
  :global(.cd-rtl) :global(.cd-button-content-right) {
    margin-right: var(--cd-spacing-button-icononly-content-marginleft);
    margin-left: 0;
  }
</style>
