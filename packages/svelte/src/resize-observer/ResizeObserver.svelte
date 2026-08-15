<!--
  ResizeObserver — see specs/components/other/ResizeObserver.spec.md
  Renderless 工具组件：渲染一个无样式包裹元素作为观测容器，
  通过 @chenzy-design/core 的 createResizeObserver 监听其尺寸，
  slot 暴露归一化的 width/height/entry。

  盒模型：content-box / border-box / device-pixel-content-box，
  单目标 + 多目标（multiple）+ throttle/debounce 节流去抖，包裹元素标签可经 tag 自定义。
  fallbackToWindow 降级（原生不可用或显式开启时监听 window.resize 近似重测），
  onResizeStart/onResizeEnd 边界事件（连续变化首帧 / 静默结束，core 纯状态机驱动）。

  observeParent（严格对齐 Semi `ReactResizeObserver.observeElement`）：并非"改为只观测父节点"，
  而是在观测自身（或 observeChild 时的子元素）之外，**额外同时观测其 parentElement**——
  两个目标共用同一个 observer 实例，回调按 entry.target 区分触发两次，与 Semi 完全一致。

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
    type ResizeObserverProperty,
  } from '@chenzy-design/core';

  interface Props {
    /** 观测盒模型，默认 'content-box'（另支持 border-box / device-pixel-content-box） */
    box?: ResizeBox;
    /**
     * 仅当指定维度变化时才回调（对齐 Semi observerProperty）。默认 'all'。
     * 设为 'width' / 'height' 时逐目标记忆上次上报值，另一维度单独变化不触发。
     */
    observerProperty?: ResizeObserverProperty;
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
    /** 包裹元素标签，默认 'div'。须为可生成盒子的元素（勿用 display:contents 类标签）。 */
    tag?: string;
    /**
     * 额外同时观测包裹元素（或 observeChild 时的子元素）的父节点（parentElement），默认 false
     * （严格对齐 Semi observeParent：`element` 与 `element.parentNode` **同时**观测，非互斥替代）。
     * 用于「既要监听自身，又要监听所处容器」的场景。回调据 `entry.target` 区分是自身还是父节点那次。
     * 与 multiple 互斥（multiple 观测子元素，忽略 observeParent）；可与 observeChild 叠加。
     * 父节点缺失（无 parentElement）时该次静默不观测，自身观测仍生效。
     */
    observeParent?: boolean;
    /**
     * 观测「children 的首个元素」而非包裹元素本身（**对齐 Semi 语义**）。
     * Semi 用 `React.cloneElement` 把 ref 注入唯一子元素，自身不产生 DOM、直接观测子元素；
     * Svelte 无法向 snippet 注入 ref，但可复用本库 Dropdown 的 cloneElement 等价手法——
     * 包裹元素仍在 DOM 里（`display: contents` 不生成盒子，故改用不影响布局的
     * `display: block; width/height: 100%` 透传），但**观测目标取 firstElementChild**，
     * 即用户真实元素，尺寸语义与 Semi 一致。
     * 与 multiple 互斥（multiple 优先）；可与 observeParent 叠加（同时观测子元素与其父节点）。
     * 子元素缺失时回退观测包裹元素。
     */
    observeChild?: boolean;
    /**
     * 原生 ResizeObserver 不可用（SSR/老环境）或显式开启时，降级监听 window.resize，
     * 用 getBoundingClientRect 近似重测（精度较低）。默认 false：不支持环境静默降级。
     */
    fallbackToWindow?: boolean;
    /** 尺寸变化回调（归一化 entry） */
    onResize?: (entry: CDResizeEntry) => void;
    /** 首次测量回调 */
    onFirstMeasure?: (entry: CDResizeEntry) => void;
    /** 一段连续尺寸变化的首帧触发（"调整中"态） */
    onResizeStart?: (entry: CDResizeEntry) => void;
    /** 连续变化结束后（静默一段时间）触发，payload 为最后一帧（"调整完成"） */
    onResizeEnd?: (entry: CDResizeEntry) => void;
    /** slot 作用域参数：{ width, height, entry } */
    children?: Snippet<
      [{ width: number; height: number; entry: CDResizeEntry | null }]
    >;
    class?: string;
  }

  let {
    box = 'content-box',
    observerProperty = 'all',
    disabled = false,
    throttle = 0,
    debounce = 0,
    multiple = false,
    observeOnMount = true,
    tag = 'div',
    observeParent = false,
    observeChild = false,
    fallbackToWindow = false,
    onResize,
    onFirstMeasure,
    onResizeStart,
    onResizeEnd,
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
  // 依赖 el + box + observerProperty + throttle + debounce + multiple：变更时重建 observer。
  // disabled 不进依赖（避免暂停/恢复时丢失监听重建）——在回调内读最新 prop 值。
  $effect(() => {
    if (!el) return;

    const node = el;
    const ro = createResizeObserver({
      box,
      observerProperty,
      throttle,
      debounce,
      fallbackToWindow,
      // 仅在使用方监听时挂 start/end，避免无谓的静默计时器（向后兼容）。
      onResizeStart: onResizeStart
        ? (e) => {
            if (disabled) return;
            onResizeStart?.(e);
          }
        : undefined,
      onResizeEnd: onResizeEnd
        ? (e) => {
            if (disabled) return;
            onResizeEnd?.(e);
          }
        : undefined,
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

    // SSR / 无原生 RO 且未开启 window 降级：静默不监听。
    // 降级模式 supported 仍为 false，但内部已挂 window.resize，故需放行。
    if (!ro.supported && !fallbackToWindow) return;

    if (multiple) {
      // 多目标：观测包裹元素的所有直接子元素（同一 observer 实例复用）。
      const targets = Array.from(node.children);
      for (const child of targets) ro.observe(child);
    } else if (observeChild) {
      // 观测 children 首个元素（对齐 Semi cloneElement 注入 ref 的语义）。
      // 缺子元素时回退观测包裹元素，保证仍有尺寸输出。
      const child = node.firstElementChild;
      ro.observe(child ?? node);
      // observeParent 与 observeChild 同时开启时，对齐 Semi 语义在子元素基础上再叠加观测其父节点。
      if (observeParent) {
        const parent = (child ?? node).parentElement;
        if (parent) ro.observe(parent);
      }
    } else {
      // 始终观测包裹元素自身（对齐 Semi 观测 element 本身）；
      // observeParent 时额外同时观测其父节点（对齐 Semi「element + element.parentNode 都观测」，
      // 非互斥替代——回调会收到两条 entry，用 entry.target 区分）。
      ro.observe(node);
      if (observeParent) {
        const parent = node.parentElement;
        if (parent) ro.observe(parent);
      }
    }

    return () => ro.disconnect();
  });

  const cls = $derived(
    ['cd-resize-observer', className].filter(Boolean).join(' '),
  );
</script>

<svelte:element this={tag} class={cls} bind:this={el}>
  {#if children}{@render children({ width, height, entry })}{/if}
</svelte:element>

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
