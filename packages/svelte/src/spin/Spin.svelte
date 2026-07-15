<!--
  Spin — see specs/components/feedback/Spin.spec.md
  严格对齐 Semi Design（semi-ui/spin/index.tsx）：统一 DOM 结构，无 inline/wrapper/fullscreen
  形态分叉。根 .cd-spin 始终渲染 .cd-spin-children（children，opacity 由 -hidden 决定），
  loading 时叠加绝对定位居中的 .cd-spin-wrapper（指示器 + tip）。
  delay 去抖由 @chenzy-design/core createSpinController 提供（Semi 无 minShowTime）。
  红线：spinning 是受控输入，effective 是内部派生显示态，绝不回写 spinning。
  role=status (aria-live=polite) 公布加载；装饰 SVG aria-hidden；reduced-motion 退化为呼吸。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { untrack } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { createSpinController, type SpinController } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  type Size = 'small' | 'middle' | 'large';

  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
    size?: Size;
    spinning?: boolean;
    delay?: number;
    tip?: string;
    wrapperClassName?: string;
    style?: string;
    childStyle?: string;
    indicator?: Snippet;
    children?: Snippet;
  }

  let {
    size = 'middle',
    spinning = true,
    delay = 0,
    tip = '',
    wrapperClassName = '',
    style,
    childStyle,
    indicator,
    children,
    ...rest
  }: Props = $props();

  const loc = useLocale();

  // effective：内部派生显示态，render 读它决定显隐（受控不回写）。
  // 初值取 spinning 的初始快照（SSR/首帧正确显示），之后由 controller 驱动——
  // 故意不追踪 spinning 变化（那由下方 effect 推入 controller）。
  let effective = $state(untrack(() => spinning));
  let ctrl: SpinController | null = $state(null);

  // controller 在 client $effect 命令式创建（SSR 安全），不在 render 路径触碰定时器。
  // 依赖 delay（变化才重建），不依赖 spinning：避免 spinning 变化重建 controller 丢失去抖态。
  $effect(() => {
    const controller = createSpinController({ delay, spinning });
    ctrl = controller;
    effective = controller.getEffective();
    const unsub = controller.subscribe((v) => {
      effective = v;
    });
    return () => {
      unsub();
      controller.destroy();
      ctrl = null;
    };
  });

  // 仅依赖 spinning + ctrl：把受控请求推给 controller（只推入，不回写）。
  $effect(() => {
    ctrl?.setSpinning(spinning);
  });

  const hasChildren = $derived(children !== undefined);
  const hasTip = $derived(tip.length > 0);
  const statusLabel = $derived(hasTip ? undefined : loc().t('Spin.loading'));

  const rootClass = $derived(
    ['cd-spin', `cd-spin-${size}`, hasChildren && 'cd-spin-block', !effective && 'cd-spin-hidden']
      .filter(Boolean)
      .join(' '),
  );
</script>

{#snippet spinIcon()}
  <!-- Semi 默认指示器：linearGradient 渐变弧 path，currentColor 继承自 .cd-spin-wrapper -->
  <svg
    class="cd-spin-icon"
    width="48"
    height="48"
    viewBox="0 0 36 36"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    data-icon="spin"
  >
    <defs>
      <linearGradient x1="0%" y1="100%" x2="100%" y2="100%" id="cd-spin-gradient">
        <stop stop-color="currentColor" stop-opacity="0" offset="0%" />
        <stop stop-color="currentColor" stop-opacity="0.5" offset="39.9430698%" />
        <stop stop-color="currentColor" offset="100%" />
      </linearGradient>
    </defs>
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <rect fill-opacity="0.01" fill="none" x="0" y="0" width="36" height="36" />
      <path
        d="M34,18 C34,9.163444 26.836556,2 18,2 C11.6597233,2 6.18078805,5.68784135 3.59122325,11.0354951"
        stroke="url(#cd-spin-gradient)"
        stroke-width="4"
        stroke-linecap="round"
      />
    </g>
  </svg>
{/snippet}

<div class={rootClass} {style} {...rest}>
  {#if effective}
    <div class="cd-spin-wrapper" role="status" aria-live="polite" aria-label={statusLabel}>
      {#if indicator}
        <div class="cd-spin-animate">{@render indicator()}</div>
      {:else}
        {@render spinIcon()}
      {/if}
      {#if hasTip}
        <div>{tip}</div>
      {/if}
    </div>
  {/if}
  <div class="cd-spin-children" style={childStyle}>
    {@render children?.()}
  </div>
</div>

<style>
  .cd-spin {
    position: relative;
    display: inline-block;
    /* 根节点尺寸由 .cd-spin-<size>:not(.cd-spin-block) 提供（见下），
       block 包裹态不设根尺寸 → auto 撑满内容。size=middle 恒存在，独立态尺寸不缺失。 */
  }

  .cd-spin-wrapper {
    text-align: center;
    position: absolute;
    inline-size: 100%;
    transform: translateY(-50%);
    inset-block-start: 50%;
    color: var(--cd-color-spin-bg);
  }

  .cd-spin-wrapper > :global(svg) {
    display: inline;
    animation: cd-spin-rotate var(--cd-animation-duration-spin-wrapper-spin) linear infinite;
    animation-fill-mode: forwards;
    vertical-align: top;
    inline-size: var(--cd-width-spin-middle);
    block-size: var(--cd-width-spin-middle);
  }

  .cd-spin-animate {
    display: inline-flex;
    animation: cd-spin-rotate var(--cd-animation-duration-spin-custom-children-spin) linear infinite;
    animation-fill-mode: forwards;
  }

  .cd-spin-children {
    opacity: var(--cd-opacity-spin-children);
    user-select: none;
  }

  /* 尺寸：根节点尺寸仅在独立态（无 children）时约束，避免约束到 block 包裹容器。
     Svelte 会把 .cd-spin-block.cd-spin 优化成 .cd-spin-block（特异性与 .cd-spin-<size>
     相同、且靠后失效），故此处用 :not(.cd-spin-block) 显式排除，稳过 HMR / 编译优化。
     wrapper 内 SVG 尺寸始终随 size。 */
  .cd-spin-small:not(.cd-spin-block) {
    inline-size: var(--cd-width-spin-small);
    block-size: var(--cd-width-spin-small);
  }
  .cd-spin-small > .cd-spin-wrapper :global(svg) {
    inline-size: var(--cd-width-spin-small);
    block-size: var(--cd-width-spin-small);
  }
  .cd-spin-middle:not(.cd-spin-block) {
    inline-size: var(--cd-width-spin-middle);
    block-size: var(--cd-width-spin-middle);
  }
  .cd-spin-middle > .cd-spin-wrapper :global(svg) {
    inline-size: var(--cd-width-spin-middle);
    block-size: var(--cd-width-spin-middle);
  }
  .cd-spin-large:not(.cd-spin-block) {
    inline-size: var(--cd-width-spin-large);
    block-size: var(--cd-width-spin-large);
  }
  .cd-spin-large > .cd-spin-wrapper :global(svg) {
    inline-size: var(--cd-width-spin-large);
    block-size: var(--cd-width-spin-large);
  }

  /* 有 children：块级布局 + 遮罩解决嵌套 Spin 穿透 */
  .cd-spin-block {
    display: block;
    inline-size: auto;
    block-size: auto;
  }
  .cd-spin-block::after {
    content: '';
    position: absolute;
    inset-block-start: 0;
    inset-inline-start: 0;
    inline-size: 100%;
    block-size: 100%;
    z-index: 1;
  }
  .cd-spin-block .cd-spin-wrapper {
    display: block;
  }

  /* !loading：移除遮罩，children 恢复不透明可交互 */
  .cd-spin-hidden::after {
    content: none;
  }
  .cd-spin-hidden > .cd-spin-children {
    opacity: 1;
    user-select: auto;
  }

  @keyframes cd-spin-rotate {
    from {
      transform: rotate(0);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-spin-wrapper > :global(svg),
    .cd-spin-animate {
      animation: cd-spin-pulse var(--cd-animation-duration-spin-custom-children-spin) ease-in-out infinite;
    }
  }
  @keyframes cd-spin-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }
</style>
