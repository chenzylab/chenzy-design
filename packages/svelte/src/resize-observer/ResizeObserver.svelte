<!--
  ResizeObserver — see specs/components/other/ResizeObserver.spec.md
  Renderless 工具组件：渲染一个无样式包裹元素作为观测容器，
  通过 @chenzy-design/core 的 createResizeObserver 监听其尺寸，
  slot 暴露归一化的 width/height/entry。

  基础子集：content-box / border-box + 单目标。
  TODO(延后):
    - throttle / debounce 节流去抖
    - 多目标 / device-pixel-content-box
    - 单例 observer 池
    - tag 自定义包裹元素标签（本子集固定 div）

  ⚠️ 死循环红线：
    - 红线 #1：无受控回写，尺寸只向 slot / 回调单向分发。
    - 红线 #3：observer 在 $effect 内命令式创建 + observe，
      cleanup 时 disconnect；不使用响应式 attachment 读 DOM 几何。
    - 包裹元素必须有真实盒子（默认 display:block），
      绝不用 display:contents —— 该元素不生成盒子，ResizeObserver 无法观测其尺寸。
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import {
    createResizeObserver,
    type CDResizeEntry,
    type ResizeBox,
  } from '@chenzy-design/core';

  interface Props {
    /** 观测盒模型，默认 'content-box' */
    box?: ResizeBox;
    /** 暂停尺寸分发，默认 false（observer 仍在监听，仅不向外通知） */
    disabled?: boolean;
    /** 挂载后立即测量一次，默认 true（ResizeObserver 原生在 observe 时触发首次回调，天然满足） */
    observeOnMount?: boolean;
    /** 包裹元素标签，默认 'div'（本子集固定 div，tag 自定义延后） */
    tag?: string;
    /** 尺寸变化回调（归一化 entry） */
    onResize?: (entry: CDResizeEntry) => void;
    /** 首次测量回调 */
    onFirstMeasure?: (entry: CDResizeEntry) => void;
    /** slot 作用域参数：{ width, height, entry } */
    children?: Snippet<
      [{ width: number; height: number; entry: CDResizeEntry | null }]
    >;
    class?: string;
  }

  let {
    box = 'content-box',
    disabled = false,
    observeOnMount = true,
    onResize,
    onFirstMeasure,
    children,
    class: className,
  }: Props = $props();

  // 包裹元素普通引用（bind:this），即被观测对象。
  let el = $state<HTMLElement | null>(null);

  // 本地响应式状态：仅由 observer 回调（非 render 期）写入，render 期只读以驱动 slot。
  let width = $state(0);
  let height = $state(0);
  let entry = $state<CDResizeEntry | null>(null);

  // 普通（非响应式）变量：标记是否已触发首次测量。
  let firstFired = false;

  // observer 命令式创建 + observe + cleanup disconnect（红线 #3）。
  // 依赖 el + box：el 就绪或 box 变更时重建 observer。
  // disabled 不进依赖（避免暂停/恢复时丢失监听重建）——在回调内读最新 prop 值。
  $effect(() => {
    if (!el) return;

    const node = el;
    const ro = createResizeObserver({
      box,
      onResize: (e) => {
        // disabled 在回调内读 prop 最新值（Svelte 5 解构 prop 在闭包内访问是响应式最新值）。
        if (disabled) return;
        width = e.width;
        height = e.height;
        entry = e;
        if (!firstFired) {
          firstFired = true;
          onFirstMeasure?.(e);
        }
        onResize?.(e);
      },
    });

    // SSR / 老浏览器静默降级。
    if (!ro.supported) return;

    ro.observe(node);
    return () => ro.disconnect();
  });

  const cls = $derived(
    ['cd-resize-observer', className].filter(Boolean).join(' '),
  );
</script>

<div class={cls} bind:this={el}>
  {#if children}{@render children({ width, height, entry })}{/if}
</div>

<style>
  /*
    必须有真实盒子供 ResizeObserver 观测 —— 不可用 display:contents。
    无任何视觉样式（无 padding/border/background），仅作透明观测容器；
    使用方可通过 class/style 控制其尺寸。
  */
  .cd-resize-observer {
    display: block;
  }
</style>
