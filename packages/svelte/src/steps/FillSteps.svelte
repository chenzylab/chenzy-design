<!--
  FillSteps — 严格对齐 Semi fillSteps.tsx（type="fill"，默认）。容器
  <div class="cd-steps cd-steps-{direction}"><Row type="flex" justify="start">...</Row></div>。
  Semi 每个 child 各自被 <Col> 包裹（Children.map 逐个包裹）；Svelte 的 children snippet
  是整体渲染单元，无法在此层逐个截取子节点分别包 Col，故 Col 包裹下沉到 FillStep.svelte
  自身内部渲染（每个 FillStep 自己就是一个 Col），效果等价（Row 的直接子节点仍是逐个 Col）。
  无 size 字段（Semi FillStepsProps 无 size，fill 型图标恒定 extra-large）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { Row } from '../grid/index.js';
  import { setStepsContext, type StepsDirection } from './context.js';
  import type { StepStatus } from './types.js';

  interface Props {
    current?: number | undefined;
    initial?: number | undefined;
    status?: StepStatus | undefined;
    direction?: StepsDirection | undefined;
    onChange?: ((current: number) => void) | undefined;
    class?: string | undefined;
    style?: string | undefined;
    'aria-label'?: string | undefined;
    children?: Snippet | undefined;
  }

  let {
    current = 0,
    status = 'process',
    direction = 'horizontal',
    class: className = '',
    initial = 0,
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
    getType: () => 'fill',
    getSize: () => 'default',
    getDirection: () => direction,
    getCurrent: () => current,
    getInitial: () => initial,
    getStatus: () => status,
    getPrefixCls: () => PREFIX,
    getOnChange: () => (onChange === undefined ? undefined : (next: number) => onChange(next)),
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

  const wrapperCls = $derived([className, PREFIX, `${PREFIX}-${direction}`].filter(Boolean).join(' '));
</script>

<div class={wrapperCls} {style} aria-label={ariaLabel}>
  <Row type="flex" justify="start">
    {@render children?.()}
  </Row>
</div>

<style>
  /* 严格对齐 Semi fillSteps.scss。根 <div> 保留组件作用域哈希；后代 .cd-steps-item-*
     由 <FillStep> 渲染（跨组件边界，且中间隔着 Row/Col），用 :global 包裹覆盖。 */
  .cd-steps {
    display: flex;
    margin: 0;
    padding: 0;
  }
  .cd-steps-horizontal {
    flex-flow: row nowrap;
  }
  .cd-steps-vertical {
    flex-flow: column nowrap;
  }
  .cd-steps :global(.cd-steps-item) {
    box-sizing: border-box;
    display: flex;
    height: var(--cd-height-steps-item);
    position: relative;
    overflow: hidden;
    margin-right: var(--cd-spacing-steps-item-marginright);
    border: var(--cd-width-steps-item-border) solid var(--cd-color-steps-border-default);
    border-radius: var(--cd-radius-steps-item);
    padding: var(--cd-spacing-steps-item-paddingy) var(--cd-spacing-steps-item-paddingx);
    transform: scale(var(--cd-transform-scale-step-item));
    transition: background-color var(--cd-transition-duration-steps-item-backgroundcolor) var(--cd-transition-function-steps-item-backgroundcolor) var(--cd-transition-delay-steps-item-backgroundcolor);
    flex: 1;
  }
  .cd-steps :global(.cd-steps-item:last-child) {
    margin-right: 0;
  }
  .cd-steps :global(.cd-steps-item .cd-steps-item-title) {
    position: relative;
    font-weight: var(--cd-font-steps-item-title-fontweight);
    width: var(--cd-width-steps-item-title);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--cd-color-steps-main-text-default);
    transition: color var(--cd-transition-duration-steps-item-title-text) var(--cd-transition-function-steps-item-title-text) var(--cd-transition-delay-steps-item-title-text);
  }
  .cd-steps :global(.cd-steps-item .cd-steps-item-description) {
    color: var(--cd-color-steps-minor-text-default);
    width: var(--cd-width-steps-item-description);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  /* process 态 item 背景 + 图标/标题着 primary */
  .cd-steps :global(.cd-steps-item-process) {
    background-color: var(--cd-color-steps-process-bg-default);
  }
  .cd-steps :global(.cd-steps-item-process .cd-steps-item-left:not(.cd-steps-item-icon)) {
    background: var(--cd-color-steps-primary-bg-default);
  }
  .cd-steps :global(.cd-steps-item-process .cd-steps-item-title),
  .cd-steps :global(.cd-steps-item-process .cd-steps-item-icon) {
    color: var(--cd-color-steps-primary-icon-default);
  }
  /* wait 态 */
  .cd-steps :global(.cd-steps-item-wait .cd-steps-item-left:not(.cd-steps-item-icon)) {
    background: var(--cd-color-steps-bg-default);
  }
  .cd-steps :global(.cd-steps-item-wait .cd-steps-item-icon) {
    color: var(--cd-color-steps-icon-default);
  }
  /* finish/error/warning：图标（内置 IconTickCircle 等，走 .cd-icon 通用类而非 item-icon
     包裹层——Semi 源码这里选择器是 .#{$prefix}-icon 即全局 Icon 组件类，非本地 item-icon）
     + 标题同状态色，hover/active 变色。 */
  .cd-steps :global(.cd-steps-item-finish .cd-icon),
  .cd-steps :global(.cd-steps-item-finish .cd-steps-item-title) {
    color: var(--cd-color-steps-success-text-default);
  }
  .cd-steps :global(.cd-steps-item-finish-hover:hover) {
    background-color: var(--cd-color-steps-bg-hover);
  }
  .cd-steps :global(.cd-steps-item-finish-hover:hover .cd-icon),
  .cd-steps :global(.cd-steps-item-finish-hover:hover .cd-steps-item-title) {
    color: var(--cd-color-steps-success-text-hover);
  }
  .cd-steps :global(.cd-steps-item-finish-hover:active) {
    background-color: var(--cd-color-steps-bg-active);
  }
  .cd-steps :global(.cd-steps-item-finish-hover:active .cd-icon),
  .cd-steps :global(.cd-steps-item-finish-hover:active .cd-steps-item-title) {
    color: var(--cd-color-steps-success-text-active);
  }
  .cd-steps :global(.cd-steps-item-error .cd-icon),
  .cd-steps :global(.cd-steps-item-error .cd-steps-item-title) {
    color: var(--cd-color-steps-danger-text-default);
  }
  .cd-steps :global(.cd-steps-item-error-hover:hover) {
    background: var(--cd-color-steps-bg-hover);
  }
  .cd-steps :global(.cd-steps-item-error-hover:hover .cd-icon),
  .cd-steps :global(.cd-steps-item-error-hover:hover .cd-steps-item-title) {
    color: var(--cd-color-steps-danger-text-hover);
  }
  .cd-steps :global(.cd-steps-item-error-hover:active) {
    background-color: var(--cd-color-steps-bg-active);
  }
  .cd-steps :global(.cd-steps-item-error-hover:active .cd-icon),
  .cd-steps :global(.cd-steps-item-error-hover:active .cd-steps-item-title) {
    color: var(--cd-color-steps-danger-text-active);
  }
  .cd-steps :global(.cd-steps-item-warning .cd-steps-item-title),
  .cd-steps :global(.cd-steps-item-warning .cd-icon) {
    color: var(--cd-color-steps-warning-text-default);
  }
  .cd-steps :global(.cd-steps-item-warning-hover:hover) {
    background: var(--cd-color-steps-bg-hover);
  }
  .cd-steps :global(.cd-steps-item-warning-hover:hover .cd-steps-item-title),
  .cd-steps :global(.cd-steps-item-warning-hover:hover .cd-icon) {
    color: var(--cd-color-steps-warning-text-hover);
  }
  .cd-steps :global(.cd-steps-item-warning-hover:active) {
    background-color: var(--cd-color-steps-bg-active);
  }
  .cd-steps :global(.cd-steps-item-warning-hover:active .cd-steps-item-title),
  .cd-steps :global(.cd-steps-item-warning-hover:active .cd-icon) {
    color: var(--cd-color-steps-warning-text-active);
  }
  .cd-steps :global(.cd-steps-item-clickable) {
    cursor: pointer;
  }
  /* 左侧节点：24×24 圆，序号字重/行高 */
  .cd-steps :global(.cd-steps-item-left) {
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
  .cd-steps :global(.cd-steps-item-left.cd-steps-item-plain) {
    color: var(--cd-color-steps-text-default);
  }
  .cd-steps :global(.cd-steps-item-left-process) {
    background: var(--cd-color-steps-process-bg-default);
  }
  .cd-steps :global(.cd-steps-item-left svg),
  .cd-steps :global(.cd-steps-item-icon svg) {
    display: block;
  }
  .cd-steps :global(.cd-steps-item-content) {
    margin-left: var(--cd-spacing-steps-item-content-marginleft);
    flex: 1;
    overflow: hidden;
  }

  /* —— RTL（对齐 Semi steps/rtl.scss 默认部分）—— */
  :global(.cd-rtl) .cd-steps {
    direction: rtl;
  }
  :global(.cd-rtl) .cd-steps :global(.cd-steps-item) {
    margin-right: auto;
    margin-left: var(--cd-spacing-steps-item-marginright);
  }
  :global(.cd-rtl) .cd-steps :global(.cd-steps-item:last-child) {
    margin-left: 0;
  }
  :global(.cd-rtl) .cd-steps :global(.cd-steps-item-content) {
    margin-left: auto;
    margin-right: var(--cd-spacing-steps-item-content-marginleft);
  }
</style>
