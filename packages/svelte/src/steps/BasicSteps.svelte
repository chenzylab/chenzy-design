<!--
  BasicSteps — 严格对齐 Semi basicSteps.tsx（type="basic"）。容器 <div class="cd-steps-basic ...">。
  子项状态推断（stepNumber/status/active/done/onChange）对应 Semi useMemo 遍历 children 逻辑：
  显式 status 优先，否则由 current 推断 finish/wait/顶层 status；status='error' 且
  index===current-1 时该步 class 整体替换为 `${prefixCls}-next-error`。
  Svelte 无 cloneElement，改用声明式登记（子项 mount 时向本容器注册取得顺序索引）驱动。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setStepsContext, type StepsSize, type StepsDirection } from './context.js';
  import type { StepStatus } from './types.js';

  interface Props {
    current?: number | undefined;
    initial?: number | undefined;
    status?: StepStatus | undefined;
    size?: StepsSize | undefined;
    direction?: StepsDirection | undefined;
    hasLine?: boolean | undefined;
    onChange?: ((current: number) => void) | undefined;
    class?: string | undefined;
    style?: string | undefined;
    'aria-label'?: string | undefined;
    children?: Snippet | undefined;
  }

  let {
    current = 0,
    status = 'process',
    size = 'default',
    direction = 'horizontal',
    class: className = '',
    initial = 0,
    hasLine = true,
    style,
    onChange,
    'aria-label': ariaLabel,
    children,
  }: Props = $props();

  const PREFIX = 'cd-steps';

  let seq = 0;
  const order: number[] = [];
  let version = $state(0);

  setStepsContext({
    getType: () => 'basic',
    getSize: () => size,
    getDirection: () => direction,
    getCurrent: () => current,
    getInitial: () => initial,
    getStatus: () => status,
    getPrefixCls: () => PREFIX,
    getOnChange: () =>
      onChange === undefined
        ? undefined
        : (next: number) => {
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
  });

  const wrapperCls = $derived(
    [
      className,
      `${PREFIX}-basic`,
      `${PREFIX}-${direction}`,
      size !== 'default' && `${PREFIX}-${size}`,
      hasLine && `${PREFIX}-hasline`,
    ]
      .filter(Boolean)
      .join(' '),
  );
</script>

<div class={wrapperCls} {style} aria-label={ariaLabel}>
  {@render children?.()}
</div>

<style>
  /* 严格对齐 Semi bacisSteps.scss。根 <div> 保留组件作用域哈希；后代 .cd-steps-item-*
     由 <BasicStep> 渲染的 <div>（跨组件边界），用 :global 包裹覆盖。 */
  .cd-steps-basic {
    display: flex;
    margin: 0;
    padding: 0;
  }
  .cd-steps-basic :global(.cd-steps-item) {
    transform: scale(var(--cd-transform-scale-step-item));
    transition:
      color var(--cd-transition-duration-steps-item-title-text) var(--cd-transition-function-steps-item-title-text) var(--cd-transition-delay-steps-item-title-text),
      background-color var(--cd-transition-duration-steps-item-backgroundcolor) var(--cd-transition-function-steps-item-backgroundcolor) var(--cd-transition-delay-steps-item-backgroundcolor);
  }
  .cd-steps-basic :global(.cd-steps-item-title) {
    transition: color var(--cd-transition-duration-steps-item-title-text) var(--cd-transition-function-steps-item-title-text) var(--cd-transition-delay-steps-item-title-text);
  }
  .cd-steps-basic :global(.cd-steps-item-number-icon) {
    transition: color var(--cd-transition-duration-steps-item-title-icon) var(--cd-transition-function-steps-item-title-icon) var(--cd-transition-delay-steps-item-title-icon);
  }
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

  /* —— RTL（对齐 Semi steps/rtl.scss basic 部分）—— */
  :global(.cd-rtl) .cd-steps-basic {
    direction: rtl;
  }
  :global(.cd-rtl) .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item) {
    padding-left: 0;
    padding-right: var(--cd-spacing-steps-basic-item-paddingleft);
  }
  :global(.cd-rtl) .cd-steps-basic.cd-steps-horizontal :global(.cd-steps-item:first-child) {
    padding-right: 0;
  }
  :global(.cd-rtl) .cd-steps-basic :global(.cd-steps-item-title) {
    padding-right: 0;
    padding-left: var(--cd-spacing-steps-basic-item-title-paddingright);
  }
  :global(.cd-rtl)
    .cd-steps-basic.cd-steps-horizontal.cd-steps-hasline
    :global(.cd-steps-item-title::after) {
    left: auto;
    right: 100%;
  }
  :global(.cd-rtl)
    .cd-steps-basic.cd-steps-horizontal
    :global(.cd-steps-item:last-child .cd-steps-item-title) {
    padding-left: 0;
  }
  :global(.cd-rtl) .cd-steps-basic :global(.cd-steps-item-left) {
    margin-right: 0;
    margin-left: var(--cd-spacing-steps-basic-item-left-marginright);
  }
  :global(.cd-rtl) .cd-steps-basic.cd-steps-vertical :global(.cd-steps-item) {
    margin: 0;
  }
</style>
