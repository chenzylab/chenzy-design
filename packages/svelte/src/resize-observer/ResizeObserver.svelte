<!--
  ResizeObserver — see specs/components/other/ResizeObserver.spec.md
  Renderless 工具组件：渲染一个无样式包裹元素作为观测容器，
  通过 @chenzy-design/core 的 createResizeObserver 监听其尺寸，
  slot 暴露归一化的 width/height/entry。

  子集：content-box / border-box，单目标 + 多目标（multiple）+ throttle/debounce 节流去抖。
  TODO(延后):
    - device-pixel-content-box
    - tag 自定义包裹元素标签（本子集固定 div）
    - 单例 observer 池：core 已导出 getGlobalResizeObserver()，
      但本组件每实例自管一个原生 observer（多目标时复用同一实例观测多元素，
      已满足"不为每个元素新建 observer"）；跨组件级全局池由大列表场景按需接入。

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
    /**
     * 节流间隔(ms)，leading+trailing，默认 0 即原生即时回调。
     * 与 debounce 互斥（同时 >0 时 debounce 优先）。
     */
    throttle?: number;
    /** 防抖等待(ms)，trailing-only，默认 0 关闭。与 throttle 互斥（优先）。 */
    debounce?: number;
    /**
     * 多目标：true 时观测包裹元素内所有直接子元素（而非包裹元素本身），
     * onResize 逐个抛出，用 entry.target 区分。默认 false（观测包裹元素）。
     * 注意：多目标模式下 slot 的 width/height 反映最后一次变化的目标。
     */
    multiple?: boolean;
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
    throttle = 0,
    debounce = 0,
    multiple = false,
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
  // 依赖 el + box + throttle + debounce + multiple：变更时重建 observer。
  // disabled 不进依赖（避免暂停/恢复时丢失监听重建）——在回调内读最新 prop 值。
  $effect(() => {
    if (!el) return;

    const node = el;
    const ro = createResizeObserver({
      box,
      throttle,
      debounce,
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

    if (multiple) {
      // 多目标：观测包裹元素的所有直接子元素（同一 observer 实例复用）。
      const targets = Array.from(node.children);
      for (const child of targets) ro.observe(child);
    } else {
      ro.observe(node);
    }

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
