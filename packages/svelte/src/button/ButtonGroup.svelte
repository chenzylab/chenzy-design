<!--
  ButtonGroup — 横向拼接多个 Button（对齐 Semi buttonGroup.tsx + button.scss `-group`）。
  组级默认（size/type/theme/disabled/colorful）经 setContext 透传给组内 Button，
  仅作为「未显式设置」的回退（Button 显式 prop 始终优先）。

  分隔线取舍（对齐 Semi 视觉，见交付说明）：
    Semi getInnerWithLine 读每个子 Button 的 type/theme 生成 <span class="...group-line-{type}"> 分隔条。
    但该 span 的可见部分只是内部 ::before（1px × 20px，恒为 group-border-default 色，per-type 底色被 1px 遮住不可见）。
    Svelte 无法读 children 的 props，故用相邻 button 的 ::before 伪元素复刻该 1px 分隔条，
    视觉与 Semi 一致；outline 主题下不画分隔条、改用 Semi 的 border 叠边方案（组级 theme 控制）。
-->
<script lang="ts">
  import { setContext, type Snippet } from 'svelte';
  import {
    BUTTON_GROUP_CTX,
    type ButtonGroupContext,
    type ButtonType,
    type ButtonTheme,
    type ButtonSize,
  } from './context.js';

  interface Props {
    size?: ButtonSize;
    type?: ButtonType;
    theme?: ButtonTheme;
    disabled?: boolean;
    /** 组级多彩开关，透传给组内 Button（对齐 Semi）。 */
    colorful?: boolean;
    /** 按钮组语义标签（aria-label）。 */
    ariaLabel?: string;
    /** 根元素自定义类名（透传）。 */
    class?: string;
    /** 根元素自定义内联样式（透传）。 */
    style?: string;
    children?: Snippet;
  }

  let {
    size,
    type,
    theme,
    disabled,
    colorful,
    ariaLabel,
    class: className,
    style,
    children,
  }: Props = $props();

  // 透传组级默认给组内 Button（getButtonGroupContext 读取），getter 暴露 live 值。
  const ctx: ButtonGroupContext = {
    get size() {
      return size;
    },
    get type() {
      return type;
    },
    get theme() {
      return theme;
    },
    get disabled() {
      return disabled;
    },
    get colorful() {
      return colorful;
    },
  };
  setContext(BUTTON_GROUP_CTX, ctx);

  // outline 主题走 border 叠边（对齐 Semi -outline:not(:last-child) 方案），非 outline 画分隔条。
  const isOutline = $derived(theme === 'outline');
</script>

<div
  class={['cd-button-group', isOutline && 'cd-button-group-outline', className].filter(Boolean).join(' ')}
  {style}
  role="group"
  aria-label={ariaLabel}
>
  {@render children?.()}
</div>

<style>
  /* 对齐 Semi .semi-button-group：flex 排布，组内 button 去内外边距/圆角，首末补圆角。 */
  .cd-button-group {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
  }
  .cd-button-group :global(.cd-button) {
    margin: 0;
    padding-left: 0;
    padding-right: 0;
    border-radius: 0;
    position: relative;
  }
  /* content 补回被清掉的水平内边距（对齐 Semi -group > .button .button-content padding）。 */
  .cd-button-group :global(.cd-button) :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-default-paddingleft);
    padding-right: var(--cd-spacing-button-default-paddingright);
  }
  .cd-button-group :global(.cd-button-size-large) :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-large-paddingleft);
    padding-right: var(--cd-spacing-button-large-paddingright);
  }
  .cd-button-group :global(.cd-button-size-small) :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-small-paddingleft);
    padding-right: var(--cd-spacing-button-small-paddingright);
  }
  /* icon-only：content 用 iconOnly 内边距（对齐 Semi -group -with-icon-only .content padding）。 */
  .cd-button-group :global(.cd-button-with-icon-only) :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-icononly-default-paddingleft);
    padding-right: var(--cd-spacing-button-icononly-default-paddingright);
  }
  .cd-button-group :global(.cd-button-with-icon-only.cd-button-size-small) :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-icononly-small-paddingleft);
    padding-right: var(--cd-spacing-button-icononly-small-paddingright);
  }
  .cd-button-group :global(.cd-button-with-icon-only.cd-button-size-large) :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-icononly-large-paddingleft);
    padding-right: var(--cd-spacing-button-icononly-large-paddingright);
  }
  .cd-button-group :global(.cd-button:first-child) {
    border-top-left-radius: var(--cd-radius-button-group);
    border-bottom-left-radius: var(--cd-radius-button-group);
  }
  .cd-button-group :global(.cd-button:last-child) {
    border-top-right-radius: var(--cd-radius-button-group);
    border-bottom-right-radius: var(--cd-radius-button-group);
  }
  /* hover/focus 浮到相邻之上，保证边框/聚焦环完整可见。 */
  .cd-button-group :global(.cd-button:hover),
  .cd-button-group :global(.cd-button:focus-visible) {
    z-index: 1;
  }
  /* 分隔条（对齐 Semi group-line ::before：1px × 20px，group-border 色）。非 outline 主题插入。 */
  .cd-button-group:not(.cd-button-group-outline) :global(.cd-button:not(:first-child))::before {
    content: '';
    position: absolute;
    top: 50%;
    inset-inline-start: 0;
    transform: translateY(-50%);
    width: var(--cd-width-button-group-border);
    height: var(--cd-height-button-group-line-default);
    background-color: var(--cd-color-button-group-border-default);
    pointer-events: none;
  }
  /* outline 主题：相邻 button 透明右边框 + 负外边距叠边（对齐 Semi -outline:not(:last-child)）。 */
  .cd-button-group-outline :global(.cd-button:not(:last-child)) {
    border-right-color: transparent;
    margin-right: calc(-1 * var(--cd-width-button-outline-border));
  }
</style>
