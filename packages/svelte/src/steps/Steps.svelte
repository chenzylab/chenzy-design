<!--
  Steps — 组合式 API，严格对齐 Semi Design（semi-ui/steps + semi-foundation/steps）。
  用法：<Steps type=.. current=.. onChange=..><Steps.Step title=.. /> …</Steps>（对齐 Semi）。
  三型：
    fill  — 旧版默认，整块带边框/圆角/内边距的块状步骤，process 态 item 背景高亮。
    basic — 新版简洁型，number-icon 圆序号 + 标题/描述 + 连接线（hasLine 控制）。
    nav   — 导航型，序号 chevron + 标题，内容撑开宽度，不可交互。
  DOM class 层级镜像 Semi（cd-steps / cd-steps-item / cd-steps-item-container/-left/-content/-title/-title-text/-description/-icon/-number-icon）。
  子项经 context 拿父 type/size/direction/current/initial/status/onChange 与自身顺序索引，自算状态。
  a11y：<ol>（nav 型外包 <nav aria-label>）；可点击步为原生 button，roving tabindex 单 Tab 停靠点。
-->
<script lang="ts">
  import { tick, type Snippet } from 'svelte';
  import { useLocale } from '../locale-provider/index.js';
  import { setStepsContext, type StepsType, type StepsSize, type StepsDirection } from './context.js';
  import type { StepStatus } from './types.js';

  interface Props {
    current?: number;
    defaultCurrent?: number;
    direction?: StepsDirection;
    type?: StepsType;
    status?: StepStatus;
    size?: StepsSize;
    initial?: number;
    /** basic 型是否显示连接线（对齐 Semi hasLine，默认 true）。 */
    hasLine?: boolean;
    onChange?: (current: number) => void;
    class?: string;
    /** 容器内联样式（对齐 Semi Steps 的 style，字符串形式）。 */
    style?: string;
    /** 容器 aria-label（对齐 Semi Steps 的 aria-label）。 */
    ariaLabel?: string;
    /** 内嵌 <Steps.Step> 列表。 */
    children?: Snippet;
  }

  let {
    current,
    defaultCurrent = 0,
    direction = 'horizontal',
    type = 'fill',
    status = 'process',
    size = 'default',
    initial = 0,
    hasLine = true,
    onChange,
    class: className = '',
    style,
    ariaLabel,
    children,
  }: Props = $props();

  // 受控 / 非受控（红线 #1）：绝不写回 prop。
  const isControlled = $derived(current !== undefined);
  let inner = $state(getInitialCurrent());
  function getInitialCurrent(): number {
    return defaultCurrent;
  }
  const activeIndex = $derived(isControlled ? (current as number) : inner);

  const isClickable = $derived(type !== 'nav' && onChange !== undefined);

  const loc = useLocale();

  // 视觉隐藏状态文本（WCAG 1.4.1）。
  function statusText(st: StepStatus): string {
    switch (st) {
      case 'finish':
        return loc().t('Steps.statusFinish');
      case 'process':
        return loc().t('Steps.statusProcess');
      case 'error':
        return loc().t('Steps.statusError');
      case 'warning':
        return loc().t('Steps.statusWarning');
      default:
        return loc().t('Steps.statusWait');
    }
  }
  function srLabel(index: number, total: number, st: StepStatus): string {
    const sep = loc().t('Steps.statusSeparator');
    return (
      loc().t('Steps.stepLabel', { index: index + 1 + initial }) +
      loc().t('Steps.ofTotal', { total }) +
      sep +
      statusText(st)
    );
  }

  // --- 声明式子项登记（对齐本库 Timeline 范式）：副作用写簿记 + bump version；渲染只读 version。 ---
  let seq = 0;
  const order: number[] = [];
  let version = $state(0);

  // roving tabindex：当前焦点步索引（-1 = 回退 activeIndex/首步）。
  let rootEl = $state<HTMLElement | null>(null);
  let focusedIndex = $state(-1);

  function focusStep(index: number): void {
    focusedIndex = index;
    tick().then(() => {
      rootEl?.querySelector<HTMLElement>(`[data-step-index="${index}"]`)?.focus();
    });
  }

  setStepsContext({
    getType: () => type,
    getSize: () => size,
    getDirection: () => direction,
    getCurrent: () => activeIndex,
    getInitial: () => initial,
    getStatus: () => status,
    getClickable: () => isClickable,
    getOnChange: () =>
      onChange === undefined
        ? undefined
        : (next: number) => {
            if (!isControlled) inner = next - initial;
            onChange(next);
          },
    registerStep: () => {
      const id = seq;
      seq += 1;
      order.push(id);
      version += 1;
      return {
        getIndex: () => {
          void version;
          return order.indexOf(id);
        },
        getTotal: () => {
          void version;
          return order.length;
        },
        unregister: () => {
          const i = order.indexOf(id);
          if (i >= 0) order.splice(i, 1);
          version += 1;
        },
      };
    },
    getFocusedIndex: () => focusedIndex,
    setFocusedIndex: (index: number) => {
      focusedIndex = index;
    },
    focusStep,
    srLabel,
  });

  // 容器 class（对齐 Semi wrapperCls：cd-steps-{type}? + cd-steps-{direction} + cd-steps-{size}? + cd-steps-hasline?）。
  // fill 型 wrapper 为 cd-steps（无 -fill 后缀，对齐 Semi fillSteps prefixCls）；basic/nav 带类型后缀。
  const cls = $derived(
    [
      'cd-steps',
      type === 'basic' && 'cd-steps-basic',
      type === 'nav' && 'cd-steps-nav',
      `cd-steps-${direction}`,
      size !== 'default' && `cd-steps-${size}`,
      type === 'basic' && hasLine && 'cd-steps-hasline',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

{#snippet stepsList()}
  <ol class={cls} {style} aria-label={ariaLabel} bind:this={rootEl}>
    {@render children?.()}
  </ol>
{/snippet}

{#if type === 'nav'}
  <nav aria-label={loc().t('Steps.navAriaLabel')}>
    {@render stepsList()}
  </nav>
{:else}
  {@render stepsList()}
{/if}

<style>
  /* ============================================================================
     严格对齐 Semi steps scss（bacisSteps/fillSteps/navSteps），前缀 cd-steps，
     token 值引 var(--cd-*-steps-*)。根 <ol> 保留组件作用域哈希；后代 .cd-steps-item-*
     由 <Steps.Step> 子组件渲染的 <li>（跨组件边界），用 :global 包裹覆盖（对齐本库 Timeline）。
     class 层级 = Semi DOM 层级：item > container? > left/content > title/title-text/description/icon/number-icon。
     ============================================================================ */

  .cd-steps {
    display: flex;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .cd-steps :global(.cd-steps-item-head) {
    display: flex;
    flex: 1;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    text-align: start;
    width: 100%;
  }
  .cd-steps :global(.cd-steps-item-clickable .cd-steps-item-head),
  .cd-steps :global(button.cd-steps-item-head) {
    cursor: pointer;
  }
  .cd-steps :global(button.cd-steps-item-head:focus-visible) {
    outline: none;
    box-shadow: var(--cd-focus-ring);
    border-radius: var(--cd-border-radius-small);
  }

  /* ============ basic 型 ============ */
  .cd-steps-basic.cd-steps-horizontal {
    flex-flow: row nowrap;
  }
  /* 连接线：basic 水平 + hasline → .item-title::after 横向连线 */
  .cd-steps-basic.cd-steps-horizontal.cd-steps-hasline :global(.cd-steps-item-title::after) {
    content: '';
    position: absolute;
    top: 50%;
    left: 100%;
    display: block;
    width: var(--cd-width-steps-title-after);
    height: var(--cd-height-steps-title-after);
    background: var(--cd-color-steps-title-after-bg);
  }
  .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item) {
    padding-left: var(--cd-spacing-steps-basic-item-paddingleft);
  }
  .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item:first-child) {
    padding-left: 0;
  }
  .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item:last-child) {
    flex: none;
  }
  .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item:last-child .cd-steps-item-title) {
    max-width: 100%;
    padding-right: 0;
  }
  .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item:last-child .cd-steps-item-title::after) {
    display: none;
  }
  /* done 段连接线高亮 primary */
  .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item-done .cd-steps-item-container .cd-steps-item-title::after) {
    background: var(--cd-color-steps-item-done-after-bg);
  }
  .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item .cd-steps-item-content) {
    flex: 1;
  }
  .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item .cd-steps-item-description) {
    font-size: var(--cd-font-size-small);
    color: var(--cd-color-steps-minor-text-default);
    width: var(--cd-width-steps-basic-item-description);
    max-width: var(--cd-width-steps-basic-item-description-maxwidth);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item .cd-steps-item-title) {
    max-width: var(--cd-width-steps-basic-item-title-maxwidth);
    min-height: var(--cd-height-steps-basic-item-left-icon);
    display: inline-flex;
    align-items: center;
  }
  .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item .cd-steps-item-title .cd-steps-item-title-text) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item-title-text-empty) {
    width: 0;
  }

  /* basic 垂直型 */
  .cd-steps-basic.cd-steps-vertical {
    flex-flow: column nowrap;
  }
  .cd-steps-basic.cd-steps-vertical :global(.cd-steps-item-icon) {
    box-sizing: content-box;
  }
  .cd-steps-basic.cd-steps-vertical.cd-steps-small :global(.cd-steps-item .cd-steps-item-content) {
    min-height: var(--cd-height-steps-basic-vertical-small-item-content-minheight);
  }
  /* 垂直连接线：hasline → .item-icon::after 纵向连线 */
  .cd-steps-basic.cd-steps-vertical.cd-steps-hasline :global(.cd-steps-item-icon::after) {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    display: block;
    width: var(--cd-width-steps-vertical-icon-after);
    height: var(--cd-height-steps-vertical-icon-after);
    background: var(--cd-color-steps-icon-after-bg);
  }
  .cd-steps-basic.cd-steps-vertical :global(.cd-steps-item) {
    padding-top: var(--cd-spacing-steps-basic-vertical-item-paddingtop);
  }
  .cd-steps-basic.cd-steps-vertical :global(.cd-steps-item:first-child) {
    padding-top: 0;
  }
  .cd-steps-basic.cd-steps-vertical :global(.cd-steps-item:last-child .cd-steps-item-icon::after) {
    display: none;
  }
  .cd-steps-basic.cd-steps-vertical :global(.cd-steps-item-done .cd-steps-item-icon::after) {
    background: var(--cd-color-steps-item-done-icon-after-bg);
  }
  .cd-steps-basic.cd-steps-vertical :global(.cd-steps-item .cd-steps-item-content) {
    min-height: var(--cd-height-steps-basic-vertical-icon-content-minheight);
    padding-bottom: var(--cd-spacing-steps-basic-vertical-item-content-paddingbottom);
  }
  .cd-steps-basic.cd-steps-vertical :global(.cd-steps-item .cd-steps-item-icon) {
    display: inline-flex;
    position: relative;
    padding-bottom: var(--cd-spacing-steps-basic-vertical-item-icon-paddingbottom);
  }
  .cd-steps-basic.cd-steps-vertical :global(.cd-steps-item .cd-steps-item-description) {
    font-size: var(--cd-font-size-small);
    color: var(--cd-color-steps-minor-text-default);
    width: var(--cd-width-steps-basic-vertical-item-description);
  }
  .cd-steps-basic.cd-steps-vertical :global(.cd-steps-item .cd-steps-item-title) {
    max-width: var(--cd-width-steps-basic-vertical-item-title-maxwidth);
  }
  .cd-steps-basic.cd-steps-vertical :global(.cd-steps-item .cd-steps-item-title .cd-steps-item-title-text) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* basic 型公共 item 样式 */
  .cd-steps-basic :global(.cd-steps-item) {
    box-sizing: border-box;
    position: relative;
    display: inline-block;
    vertical-align: top;
    overflow: hidden;
    flex: 1;
  }
  .cd-steps-basic :global(.cd-steps-item-clickable) {
    cursor: pointer;
  }
  .cd-steps-basic :global(.cd-steps-item-hover:hover .cd-steps-item-title) {
    color: var(--cd-color-steps-item-title-text-hover);
  }
  .cd-steps-basic :global(.cd-steps-item-hover:hover .cd-steps-item-description) {
    color: var(--cd-color-steps-item-description-text-hover);
  }
  .cd-steps-basic :global(.cd-steps-item-container) {
    display: flex;
    align-items: flex-start;
  }
  .cd-steps-basic :global(.cd-steps-item-left) {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-right: var(--cd-spacing-steps-basic-item-left-marginright);
  }
  .cd-steps-basic :global(.cd-steps-item-left .cd-steps-item-icon) {
    display: flex;
    height: var(--cd-height-steps-basic-item-left-icon);
    align-items: center;
    font-size: var(--cd-width-steps-basic-item-left-number-icon);
    line-height: 1;
  }
  .cd-steps-basic :global(.cd-steps-item-left .cd-steps-item-number-icon) {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--cd-width-steps-basic-item-left-number-icon);
    height: var(--cd-height-steps-basic-item-left-number-icon);
    font-size: var(--cd-font-size-small);
    font-weight: var(--cd-font-steps-basic-item-left-number-icon-fontweight);
    background: var(--cd-color-steps-item-left-number-icon-bg);
    border-radius: var(--cd-radius-steps-basic-item-left-number-icon);
    color: var(--cd-color-steps-item-left-number-icon-icon);
  }
  .cd-steps-basic :global(.cd-steps-item-icon svg) {
    display: block;
  }
  .cd-steps-basic :global(.cd-steps-item-title) {
    position: relative;
    display: inline-block;
    line-height: var(--cd-font-steps-basic-item-title-lineheight);
    font-weight: var(--cd-font-steps-basic-item-title-fontweight);
    color: var(--cd-color-steps-main-text-default);
    vertical-align: top;
    padding-right: var(--cd-spacing-steps-basic-item-title-paddingright);
    margin-bottom: var(--cd-spacing-steps-basic-item-title-paddingbottom);
  }

  /* basic 各状态图标配色 */
  .cd-steps-basic :global(.cd-steps-item-finish .cd-steps-item-left .cd-steps-item-icon) {
    color: var(--cd-color-steps-item-finish-icon);
  }
  .cd-steps-basic :global(.cd-steps-item-finish .cd-steps-item-left .cd-steps-item-icon .cd-steps-item-number-icon) {
    color: var(--cd-color-steps-item-finish-number-icon);
  }
  .cd-steps-basic :global(.cd-steps-item-wait .cd-steps-item-title) {
    color: var(--cd-color-steps-item-wait-title-text);
  }
  .cd-steps-basic :global(.cd-steps-item-wait .cd-steps-item-left .cd-steps-item-icon) {
    color: var(--cd-color-steps-item-wait-left-icon-icon);
  }
  .cd-steps-basic :global(.cd-steps-item-wait .cd-steps-item-left .cd-steps-item-icon .cd-steps-item-number-icon) {
    background: var(--cd-color-steps-item-wait-left-number-icon-bg);
    color: var(--cd-color-steps-item-wait-left-number-icon-icon);
  }
  .cd-steps-basic :global(.cd-steps-item-wait-hover:hover .cd-steps-item-left .cd-steps-item-icon .cd-steps-item-number-icon) {
    background: var(--cd-color-steps-item-wait-left-number-icon-bg-hover);
    color: var(--cd-color-steps-item-wait-left-number-icon-icon-hover);
  }
  .cd-steps-basic :global(.cd-steps-item-process .cd-steps-item-left .cd-steps-item-icon) {
    color: var(--cd-color-steps-item-process-left-icon);
  }
  .cd-steps-basic :global(.cd-steps-item-process .cd-steps-item-left .cd-steps-item-icon .cd-steps-item-number-icon) {
    color: var(--cd-color-steps-item-process-left-number-icon);
  }
  .cd-steps-basic :global(.cd-steps-item-error .cd-steps-item-left .cd-steps-item-icon) {
    color: var(--cd-color-steps-item-error-left-icon);
  }
  .cd-steps-basic :global(.cd-steps-item-error .cd-steps-item-left .cd-steps-item-icon .cd-steps-item-number-icon) {
    color: var(--cd-color-steps-item-error-left-number-icon);
  }
  .cd-steps-basic :global(.cd-steps-item-warning .cd-steps-item-left .cd-steps-item-icon) {
    color: var(--cd-color-steps-item-warning-left-icon);
  }
  .cd-steps-basic :global(.cd-steps-item-warning .cd-steps-item-left .cd-steps-item-icon .cd-steps-item-number-icon) {
    color: var(--cd-color-steps-item-warning-left-number-icon);
  }

  /* basic small 尺寸 */
  .cd-steps-basic.cd-steps-small :global(.cd-steps-item .cd-steps-item-title) {
    font-size: var(--cd-font-size-regular);
  }
  .cd-steps-basic.cd-steps-small :global(.cd-steps-item .cd-steps-item-left .cd-steps-item-icon) {
    height: var(--cd-height-steps-basic-small-item-left-icon);
  }
  .cd-steps-basic.cd-steps-small :global(.cd-steps-item .cd-steps-item-left .cd-steps-item-icon .cd-steps-item-number-icon) {
    font-size: var(--cd-font-size-small);
    width: var(--cd-width-steps-basic-small-item-left-number-icon);
    height: var(--cd-width-steps-basic-small-item-left-number-icon);
  }

  /* ============ fill 型（wrapper = cd-steps 无类型后缀，对齐 Semi fillSteps prefixCls）============ */
  .cd-steps-horizontal:not(.cd-steps-basic):not(.cd-steps-nav) {
    flex-flow: row nowrap;
  }
  .cd-steps-vertical:not(.cd-steps-basic):not(.cd-steps-nav) {
    flex-flow: column nowrap;
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item) {
    box-sizing: border-box;
    display: flex;
    height: var(--cd-height-steps-item);
    position: relative;
    overflow: hidden;
    margin-right: var(--cd-spacing-steps-item-marginright);
    border: var(--cd-width-steps-item-border) solid var(--cd-color-steps-border-default);
    border-radius: var(--cd-radius-steps-item);
    padding: var(--cd-spacing-steps-item-paddingy) var(--cd-spacing-steps-item-paddingx);
    flex: 1;
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item:last-child) {
    margin-right: 0;
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item .cd-steps-item-title) {
    position: relative;
    font-weight: var(--cd-font-steps-item-title-fontweight);
    width: var(--cd-width-steps-item-title);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--cd-color-steps-main-text-default);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item .cd-steps-item-description) {
    color: var(--cd-color-steps-minor-text-default);
    width: var(--cd-width-steps-item-description);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* fill process 态 item 背景 + 图标/标题着 primary */
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-process) {
    background-color: var(--cd-color-steps-process-bg-default);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-process .cd-steps-item-left:not(.cd-steps-item-icon)) {
    background: var(--cd-color-steps-primary-bg-default);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-process .cd-steps-item-title),
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-process .cd-steps-item-icon) {
    color: var(--cd-color-steps-primary-icon-default);
  }
  /* fill wait 态 */
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-wait .cd-steps-item-left:not(.cd-steps-item-icon)) {
    background: var(--cd-color-steps-bg-default);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-wait .cd-steps-item-icon) {
    color: var(--cd-color-steps-icon-default);
  }
  /* fill finish/error/warning：图标 + 标题同状态色，hover/active 变色 */
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-finish .cd-steps-item-icon),
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-finish .cd-steps-item-title) {
    color: var(--cd-color-steps-success-text-default);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-finish-hover:hover) {
    background-color: var(--cd-color-steps-bg-hover);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-finish-hover:hover .cd-steps-item-icon),
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-finish-hover:hover .cd-steps-item-title) {
    color: var(--cd-color-steps-success-text-hover);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-finish-hover:active) {
    background-color: var(--cd-color-steps-bg-active);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-finish-hover:active .cd-steps-item-icon),
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-finish-hover:active .cd-steps-item-title) {
    color: var(--cd-color-steps-success-text-active);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-error .cd-steps-item-icon),
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-error .cd-steps-item-title) {
    color: var(--cd-color-steps-danger-text-default);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-error-hover:hover) {
    background: var(--cd-color-steps-bg-hover);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-error-hover:hover .cd-steps-item-icon),
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-error-hover:hover .cd-steps-item-title) {
    color: var(--cd-color-steps-danger-text-hover);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-error-hover:active) {
    background-color: var(--cd-color-steps-bg-active);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-error-hover:active .cd-steps-item-icon),
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-error-hover:active .cd-steps-item-title) {
    color: var(--cd-color-steps-danger-text-active);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-warning .cd-steps-item-title),
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-warning .cd-steps-item-icon) {
    color: var(--cd-color-steps-warning-text-default);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-warning-hover:hover) {
    background: var(--cd-color-steps-bg-hover);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-warning-hover:hover .cd-steps-item-title),
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-warning-hover:hover .cd-steps-item-icon) {
    color: var(--cd-color-steps-warning-text-hover);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-warning-hover:active) {
    background-color: var(--cd-color-steps-bg-active);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-warning-hover:active .cd-steps-item-title),
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-warning-hover:active .cd-steps-item-icon) {
    color: var(--cd-color-steps-warning-text-active);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-clickable) {
    cursor: pointer;
  }
  /* fill 左侧节点：24×24 圆，序号字重/行高 */
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-left) {
    width: var(--cd-width-steps-item-left);
    height: var(--cd-height-steps-item-left);
    line-height: var(--cd-font-steps-item-left-lineheight);
    text-align: center;
    border-radius: var(--cd-radius-steps-item-left);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--cd-font-steps-item-left-fontweight);
    flex-grow: 0;
    flex-shrink: 0;
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-left.cd-steps-item-plain) {
    color: var(--cd-color-steps-text-default);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-left-process) {
    background: var(--cd-color-steps-process-bg-default);
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-left svg),
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-icon svg) {
    display: block;
  }
  .cd-steps:not(.cd-steps-basic):not(.cd-steps-nav) :global(.cd-steps-item-content) {
    margin-left: var(--cd-spacing-steps-item-content-marginleft);
    flex: 1;
    overflow: hidden;
  }

  /* ============ nav 型 ============ */
  .cd-steps-nav {
    display: inline-flex;
    flex-flow: row nowrap;
  }
  .cd-steps-nav :global(.cd-steps-item) {
    box-sizing: border-box;
    flex: 1;
  }
  .cd-steps-nav :global(.cd-steps-item:last-child) {
    flex: none;
  }
  .cd-steps-nav :global(.cd-steps-item:last-child .cd-steps-item-content) {
    width: auto;
  }
  .cd-steps-nav :global(.cd-steps-item .cd-steps-item-container) {
    display: flex;
    align-items: center;
    color: var(--cd-color-steps-nav-item-container-text);
  }
  .cd-steps-nav :global(.cd-steps-item .cd-steps-item-container .cd-steps-item-icon) {
    display: inline-flex;
    flex: 1;
    justify-content: center;
    color: var(--cd-color-steps-nav-item-icon);
    min-width: var(--cd-width-steps-nav-item-icon-minwidth);
  }
  .cd-steps-nav :global(.cd-steps-item .cd-steps-item-content) {
    flex: 1;
    display: inline-block;
  }
  .cd-steps-nav :global(.cd-steps-item .cd-steps-item-title) {
    max-width: var(--cd-width-steps-nav-item-title-maxwidth);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: var(--cd-font-steps-nav-item-title-fontweight);
  }
  .cd-steps-nav :global(.cd-steps-item-active .cd-steps-item-title) {
    color: var(--cd-color-steps-nav-item-title-text-active);
    font-weight: var(--cd-font-steps-nav-item-title-active-fontweight);
  }
  .cd-steps-nav.cd-steps-small :global(.cd-steps-item .cd-steps-item-title) {
    font-size: var(--cd-font-size-small);
  }
</style>
