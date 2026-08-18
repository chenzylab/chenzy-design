<!--
  NavSteps — 严格对齐 Semi navSteps.tsx（type="nav"）。容器 <div class="cd-steps-nav ...">。
  无 direction/status 字段（Semi NavStepsProps 无这两项，nav 型固定横向、无状态色）。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setStepsContext, type StepsSize } from './context.js';

  interface Props {
    current?: number | undefined;
    initial?: number | undefined;
    size?: StepsSize | undefined;
    onChange?: ((current: number) => void) | undefined;
    class?: string | undefined;
    style?: string | undefined;
    'aria-label'?: string | undefined;
    children?: Snippet | undefined;
  }

  let {
    current = 0,
    size = 'default',
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
    getType: () => 'nav',
    getSize: () => size,
    getDirection: () => 'horizontal',
    getCurrent: () => current,
    getInitial: () => initial,
    getStatus: () => 'process',
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

  const wrapperCls = $derived(
    [className, `${PREFIX}-nav`, size !== 'default' && `${PREFIX}-${size}`].filter(Boolean).join(' '),
  );
</script>

<div class={wrapperCls} {style} aria-label={ariaLabel}>
  {@render children?.()}
</div>

<style>
  /* 严格对齐 Semi navSteps.scss。根 <div> 保留组件作用域哈希；后代 .cd-steps-item-*
     由 <NavStep> 渲染的 <div>（跨组件边界），用 :global 包裹覆盖。 */
  .cd-steps-nav {
    display: inline-flex;
    flex-flow: row nowrap;
    margin: 0;
    padding: 0;
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

  /* —— RTL（对齐 Semi steps/rtl.scss nav 部分）—— */
  :global(.cd-rtl) .cd-steps-nav {
    direction: rtl;
  }
</style>
