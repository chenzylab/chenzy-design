<!--
  ButtonGroup — 横向拼接多个 Button（对齐 Semi buttonGroup.tsx + button.scss `-group`）。
  组级默认（size/type/theme/disabled/colorful）经 setContext 透传给组内 Button，
  仅作为「未显式设置」的回退（Button 显式 prop 始终优先）。

  分隔线（严格对齐 Semi getInnerWithLine 的两层结构，非简化近似）：
    Semi 为每个非末尾且 theme!=='outline' 的子 Button 后插入
    <span class="...group-line-{theme}-{type}"> ，外层 span 自带 per-type 背景色，
    内层 ::before 同宽高、恒为 group-border-default 色并覆盖外层（故视觉上只看得见内层色，
    但 DOM/class/选择器结构与 Semi 逐层对应）。
    Svelte 无法像 React 那样读 children 的 props，改用 action 在挂载后扫描组内已渲染的
    <button>（读其 cd-button-{type}/cd-button-{theme} class 自报语义），插入等价的分隔线
    元素；MutationObserver 保持组内 Button 动态增删/切换 theme 时分隔线同步更新。
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
    'aria-label'?: string;
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
    'aria-label': ariaLabel,
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

  const TYPES = ['primary', 'secondary', 'tertiary', 'warning', 'danger'] as const;
  const THEMES = ['solid', 'borderless', 'light', 'outline'] as const;

  function readType(btn: Element): string {
    return TYPES.find((t) => btn.classList.contains(`cd-button-${t}`)) ?? 'primary';
  }
  function readTheme(btn: Element): string {
    return THEMES.find((t) => btn.classList.contains(`cd-button-${t}`)) ?? 'light';
  }

  // 对齐 Semi getInnerWithLine：直接子 <button>（组内每个 Button 渲染唯一根 <button>），
  // 除最后一个外，theme!=='outline' 的才插入分隔线（画在该按钮之后 = 下一个按钮之前）。
  function groupLines(node: HTMLElement) {
    const LINE_CLASS = 'cd-button-group-line';
    const apply = () => {
      node.querySelectorAll(`:scope > .${LINE_CLASS}`).forEach((el) => el.remove());
      const buttons = Array.from(node.querySelectorAll(':scope > button'));
      if (buttons.length <= 1) return;
      buttons.slice(0, -1).forEach((btn) => {
        const btnTheme = readTheme(btn);
        if (btnTheme === 'outline') return;
        const btnType = readType(btn);
        const isDisabled = btn.hasAttribute('disabled');
        const line = document.createElement('span');
        line.className = [
          LINE_CLASS,
          `${LINE_CLASS}-${btnType}`,
          `${LINE_CLASS}-${btnTheme}`,
          isDisabled && `${LINE_CLASS}-disabled`,
        ]
          .filter(Boolean)
          .join(' ');
        line.setAttribute('aria-hidden', 'true');
        btn.after(line);
      });
    };
    apply();
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          (m.type === 'attributes' && m.attributeName === 'class') ||
          (m.type === 'childList' &&
            Array.from(m.addedNodes).some((n) => (n as Element).nodeName === 'BUTTON'))
        ) {
          apply();
          break;
        }
      }
    });
    observer.observe(node, { attributes: true, childList: true, subtree: true });
    return {
      destroy() {
        observer.disconnect();
      },
    };
  }

  // outline 主题走 border 叠边（对齐 Semi -outline:not(:last-child) 方案，按当前按钮自身 theme 判定）。
</script>

<div
  class={['cd-button-group', className].filter(Boolean).join(' ')}
  {style}
  role="group"
  aria-label={ariaLabel}
  use:groupLines
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

  /* ===== 分隔线（对齐 Semi button.scss `-group-line`，两层结构）===== */
  /* 外层：per-type 背景色（真实存在，但恒被下方 ::before 完全覆盖，与 Semi 视觉行为一致）。 */
  .cd-button-group-line {
    display: inline-flex;
    align-items: center;
    background-color: var(--cd-color-button-group-border-default);
  }
  .cd-button-group-line-primary {
    background-color: var(--cd-color-button-primary-bg-default);
  }
  .cd-button-group-line-secondary {
    background-color: var(--cd-color-button-secondary-bg-default);
  }
  .cd-button-group-line-tertiary {
    background-color: var(--cd-color-button-tertiary-bg-default);
  }
  .cd-button-group-line-warning {
    background-color: var(--cd-color-button-warning-bg-default);
  }
  .cd-button-group-line-danger {
    background-color: var(--cd-color-button-danger-bg-default);
  }
  .cd-button-group-line-disabled {
    background-color: var(--cd-color-button-disabled-bg-default);
  }
  .cd-button-group-line-light {
    background-color: var(--cd-color-button-light-bg-default);
  }
  .cd-button-group-line-borderless {
    background-color: transparent;
  }
  /* 内层：固定 group-border 色，同宽高覆盖外层（Semi ::before，视觉上唯一可见的部分）。 */
  .cd-button-group-line::before {
    display: block;
    content: '';
    width: var(--cd-width-button-group-border);
    height: var(--cd-height-button-group-line-default);
    background-color: var(--cd-color-button-group-border-default);
  }

  /* outline 主题按钮：自身 theme=outline 时，与下一个按钮透明右边框 + 负外边距叠边
     （对齐 Semi -outline:not(:last-child)，按当前按钮自身 theme 判定，非组级）。 */
  .cd-button-group :global(.cd-button-outline:not(:last-child)) {
    border-right-color: transparent;
    margin-right: calc(-1 * var(--cd-width-button-outline-border));
  }

  /* —— RTL（严格对齐 Semi button/rtl.scss `-group` 段，逐条镜像）—— */
  :global(.cd-rtl) .cd-button-group {
    direction: rtl;
  }
  /* 组内 button 的 content padding（对齐 Semi：padding 清零挪到 content 后同样要互换）。 */
  :global(.cd-rtl) .cd-button-group :global(.cd-button) :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-default-paddingright);
    padding-right: var(--cd-spacing-button-default-paddingleft);
  }
  :global(.cd-rtl) .cd-button-group :global(.cd-button-size-large) :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-large-paddingright);
    padding-right: var(--cd-spacing-button-large-paddingleft);
  }
  :global(.cd-rtl) .cd-button-group :global(.cd-button-size-small) :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-small-paddingright);
    padding-right: var(--cd-spacing-button-small-paddingleft);
  }
  :global(.cd-rtl) .cd-button-group :global(.cd-button-with-icon-only) :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-icononly-default-paddingright);
    padding-right: var(--cd-spacing-button-icononly-default-paddingleft);
  }
  :global(.cd-rtl)
    .cd-button-group
    :global(.cd-button-with-icon-only.cd-button-size-small)
    :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-icononly-small-paddingright);
    padding-right: var(--cd-spacing-button-icononly-small-paddingleft);
  }
  :global(.cd-rtl)
    .cd-button-group
    :global(.cd-button-with-icon-only.cd-button-size-large)
    :global(.cd-button-content) {
    padding-left: var(--cd-spacing-button-icononly-large-paddingright);
    padding-right: var(--cd-spacing-button-icononly-large-paddingleft);
  }
  /* 首末圆角互换（对齐 Semi：first-child 变右侧圆角，last-child 变左侧圆角）。 */
  :global(.cd-rtl) .cd-button-group :global(.cd-button:first-child) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    border-top-right-radius: var(--cd-radius-button-group);
    border-bottom-right-radius: var(--cd-radius-button-group);
  }
  :global(.cd-rtl) .cd-button-group :global(.cd-button:last-child) {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: var(--cd-radius-button-group);
    border-bottom-left-radius: var(--cd-radius-button-group);
  }
  /* outline 主题叠边（透明边框与负外边距都在右侧，RTL 下挪到左侧）。 */
  :global(.cd-rtl) .cd-button-group :global(.cd-button-outline:not(:last-child)) {
    border-right-color: initial;
    margin-right: 0;
    border-left-color: transparent;
    margin-left: calc(-1 * var(--cd-width-button-outline-border));
  }
</style>
