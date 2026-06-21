<!--
  LottieIcon — see specs/components/other/LottieIcon.spec.md
  依赖注入 player：组件不绑定 lottie-web，用户传入 player 工厂（库零外部重依赖）。
  红线 #1：trigger/autoplay 等是受控输入，组件不回写。
  红线 #3：adapter（player 注入）在 $effect 命令式创建 + cleanup destroy；matchMedia 订阅同样 cleanup 解绑；
           src fetch 用 AbortController，effect cleanup 中 abort + 丢弃过期响应。
  src：除内联 data 外可传 URL，异步 fetch Lottie JSON；加载中 skeleton、失败态 error（文案经 locale）。
  segments：[start,end] 帧段或命名 marker（resolveSegments 解析）→ 经 adapter.playSegments / factory segment 初始段。
  flipRtl：RTL 场景水平镜像（transform scaleX(-1)）。
  prefers-reduced-motion：animated=false 时定位首帧并暂停（goToFrame），系统变化经 matchMedia 实时生效。
  a11y：decorative=true → aria-hidden；decorative=false → role=img + aria-label；不可聚焦。
-->
<script lang="ts">
  import {
    resolveSize,
    resolveAnimated,
    shouldAutoplay,
    resolveSegments,
    isLottieSrc,
    resolveRenderer,
    type LottieTrigger,
    type LottieSize,
    type LottieSegments,
    type LottieRenderer,
    type LottiePlayerAdapter,
    type LottiePlayerFactory,
  } from '@chenzy-design/core';
  import { useLocale } from '../locale-provider/index.js';

  interface Props {
    /** Lottie JSON 数据（内联）。与 src 二选一；同时存在时 data 优先。 */
    data?: unknown;
    /** Lottie JSON 动画 URL，异步 fetch 加载（除内联 data 外的来源）。 */
    src?: string;
    /** 必填：用户注入的 player 工厂（包装 lottie-web 等），库不内置 */
    player: LottiePlayerFactory;
    /** 播放指定帧段：[start,end] 帧对或命名 marker（按动画 markers 解析）。 */
    segments?: LottieSegments;
    /** RTL 场景水平镜像动画（transform scaleX(-1)）。 */
    flipRtl?: boolean;
    /** 受控显隐（默认 true）：false 时隐藏并暂停动画，true 恢复播放。组件不回写（红线 #1）。 */
    visible?: boolean;
    /** 便捷开关：true 时用 canvas 渲染后端（等价 renderer='canvas'）。 */
    canvas?: boolean;
    /** 渲染后端（'svg'|'canvas'|'html'），经 adapter 透传；优先于 canvas。未设时默认 svg。 */
    renderer?: LottieRenderer;
    size?: LottieSize | number;
    color?: string;
    trigger?: LottieTrigger;
    autoplay?: boolean;
    loop?: boolean | number;
    speed?: number;
    reducedMotion?: boolean;
    decorative?: boolean;
    label?: string;
    class?: string;
    style?: string;
    onPlay?: () => void;
    onPause?: () => void;
    /** src 加载成功回调（透出原始动画数据）。 */
    onLoad?: (data: unknown) => void;
    /** src 加载失败回调。 */
    onError?: (err: unknown) => void;
  }

  let {
    data,
    src,
    player,
    segments,
    flipRtl = false,
    visible = true,
    canvas = false,
    renderer,
    size = 'default',
    color,
    trigger = 'auto',
    autoplay = true,
    loop = true,
    speed = 1,
    reducedMotion,
    decorative = true,
    label,
    class: className,
    style,
    onPlay,
    onPause,
    onLoad,
    onError,
  }: Props = $props();

  const loc = useLocale();

  // bind:this 挂载点；lottie-web 等会往容器内注入 svg/canvas。
  let container = $state<HTMLElement | null>(null);
  // 系统 reduced-motion；matchMedia 命令式监听（cleanup 解绑）。
  let systemReduced = $state(false);
  // adapter 由 player 工厂创建，$effect 命令式生命周期。
  // $state：供下方 visible effect 在 adapter 创建/销毁后重新协调 play/pause。
  let adapter = $state<LottiePlayerAdapter | null>(null);

  // src fetch 结果（不回写 data prop，受控不污染）；状态机驱动 skeleton/error。
  let fetched = $state<unknown>(undefined);
  let status = $state<'idle' | 'loading' | 'error'>('idle');

  const animated = $derived(resolveAnimated(reducedMotion, systemReduced));
  const px = $derived(resolveSize(size));
  // 实际渲染数据：内联 data 优先，其次 src fetch 结果。
  const activeData = $derived(data != null ? data : fetched);
  // 解析后的帧段（纯函数）；null 表示整段播放。
  const segment = $derived(resolveSegments(segments, activeData));
  // 渲染后端（纯函数）：renderer 优先，其次 canvas→'canvas'；undefined 表示沿用 adapter 默认（svg）。
  const renderBackend = $derived(resolveRenderer(canvas, renderer));

  // matchMedia 订阅系统 reduced-motion，cleanup 解绑。
  $effect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    systemReduced = mq.matches;
    const handler = (e: MediaQueryListEvent) => {
      systemReduced = e.matches;
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  // src fetch：内联 data 缺省且 src 为 URL 时异步加载。
  // 红线 #3：AbortController + cleanup abort；effect 重跑/卸载丢弃过期响应。
  $effect(() => {
    // 内联 data 优先，存在时无需 fetch。
    if (data != null || !isLottieSrc(src)) {
      status = 'idle';
      return;
    }
    const url = src;
    const controller = new AbortController();
    let cancelled = false;
    status = 'loading';
    fetched = undefined;
    fetch(url, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (cancelled) return;
        fetched = json;
        status = 'idle';
        onLoad?.(json);
      })
      .catch((err) => {
        if (cancelled || controller.signal.aborted) return;
        status = 'error';
        onError?.(err);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  });

  // player 生命周期：container + data 就绪时创建 adapter，cleanup 销毁。
  // 依赖 container/activeData/animated/player + 配置项 + 解析后 segment + 渲染后端；变化重建 adapter（可接受）。
  // 注意：不依赖 visible——显隐切换由下方独立 effect 命令式 play/pause 控制，避免无谓重建。
  $effect(() => {
    if (!container || activeData == null) return;
    const willAutoplay = shouldAutoplay(trigger, autoplay, animated);
    const a = player({
      container,
      data: activeData,
      loop,
      autoplay: willAutoplay,
      speed,
      ...(segment ? { segment } : {}),
      ...(renderBackend ? { renderer: renderBackend } : {}),
    });
    adapter = a;
    // 有帧段且应当播放：命令式播放指定段（player 未实现 playSegments 时已由 factory segment 兜底）。
    if (segment && willAutoplay && a.playSegments) {
      a.playSegments(segment);
    }
    // reduced-motion：定位首帧并暂停（静止渲染首帧）。
    if (!animated && a.goToFrame) {
      a.goToFrame(segment ? segment[0] : 0);
      a.pause();
    }
    return () => {
      a.destroy();
      adapter = null;
    };
  });

  // 受控 visible：命令式控制 player play/pause（红线 #3）。不回写 visible（红线 #1）。
  // visible=false → 暂停（容器同时 display:none 隐藏）；visible=true 且允许动画 → 按触发方式恢复播放。
  // reduced-motion（animated=false）下保持静止首帧，不强行起播。
  $effect(() => {
    const a = adapter;
    if (!a) return;
    if (!visible) {
      a.pause();
      return;
    }
    // 恢复显隐：仅 auto + autoplay 场景自动续播；hover/manual 维持当前态由用户驱动。
    if (animated && shouldAutoplay(trigger, autoplay, animated)) {
      if (segment && a.playSegments) a.playSegments(segment);
      else a.play();
    }
  });

  // 命令式方法，供 bind:this 调用。
  export function play() {
    if (animated) {
      if (segment && adapter?.playSegments) adapter.playSegments(segment);
      else adapter?.play();
      onPlay?.();
    }
  }
  export function pause() {
    adapter?.pause();
    onPause?.();
  }
  export function stop() {
    adapter?.stop();
  }

  function handleEnter() {
    if (animated) {
      if (segment && adapter?.playSegments) adapter.playSegments(segment);
      else adapter?.play();
      onPlay?.();
    }
  }
  function handleLeave() {
    adapter?.pause();
    onPause?.();
  }
</script>

<i
  class={[
    'cd-lottie-icon',
    flipRtl && 'cd-lottie-icon--flip-rtl',
    !visible && 'cd-lottie-icon--hidden',
    className,
  ]
    .filter(Boolean)
    .join(' ')}
  bind:this={container}
  style="--cd-lottieicon-current-size:{px}px; {color
    ? `--cd-lottieicon-color:${color};`
    : ''} {style ?? ''}"
  aria-hidden={decorative ? 'true' : undefined}
  role={decorative ? undefined : 'img'}
  aria-label={decorative
    ? undefined
    : status === 'loading'
      ? loc().t('LottieIcon.loading')
      : status === 'error'
        ? loc().t('LottieIcon.loadError')
        : (label ?? undefined)}
  data-status={status === 'idle' ? undefined : status}
  onmouseenter={trigger === 'hover' ? handleEnter : undefined}
  onmouseleave={trigger === 'hover' ? handleLeave : undefined}
>
  {#if status === 'loading'}
    <span class="cd-lottie-icon__skeleton" aria-hidden="true"></span>
  {/if}
</i>

<style>
  .cd-lottie-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    inline-size: var(--cd-lottieicon-current-size, var(--cd-lottieicon-size));
    block-size: var(--cd-lottieicon-current-size, var(--cd-lottieicon-size));
    color: var(--cd-lottieicon-color);
    vertical-align: var(--cd-lottieicon-valign);
  }

  /* RTL 镜像：水平翻转动画内容 */
  .cd-lottie-icon--flip-rtl {
    transform: scaleX(-1);
  }

  /* 受控隐藏：display:none（不占位）；adapter 已在 effect cleanup 中销毁/暂停 */
  .cd-lottie-icon--hidden {
    display: none;
  }

  /* player 注入的内容撑满容器 */
  .cd-lottie-icon :global(svg),
  .cd-lottie-icon :global(canvas) {
    inline-size: 100%;
    block-size: 100%;
    display: block;
  }

  /* src 加载中骨架占位 */
  .cd-lottie-icon__skeleton {
    inline-size: 100%;
    block-size: 100%;
    border-radius: var(--cd-lottieicon-radius);
    background: var(--cd-lottieicon-bg-skeleton);
    animation: cd-lottieicon-pulse 1.2s ease-in-out infinite;
  }

  /* src 加载失败：边框提示色 */
  .cd-lottie-icon[data-status='error'] {
    color: var(--cd-lottieicon-error-color);
    border-radius: var(--cd-lottieicon-radius);
    box-shadow: inset 0 0 0 1px currentColor;
  }

  @keyframes cd-lottieicon-pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .cd-lottie-icon__skeleton {
      animation: none;
    }
  }
</style>
