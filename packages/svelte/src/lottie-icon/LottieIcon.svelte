<!--
  LottieIcon — see specs/components/other/LottieIcon.spec.md
  依赖注入 player：组件不绑定 lottie-web，用户传入 player 工厂（库零外部重依赖）。
  红线 #1：trigger/autoplay 等是受控输入，组件不回写。
  红线 #3：adapter（player 注入）在 $effect 命令式创建 + cleanup destroy；matchMedia 订阅同样 cleanup 解绑。
  prefers-reduced-motion：animated=false 时定位首帧并暂停（goToFrame），系统变化经 matchMedia 实时生效。
  a11y：decorative=true → aria-hidden；decorative=false → role=img + aria-label；不可聚焦。
-->
<script lang="ts">
  import {
    resolveSize,
    resolveAnimated,
    shouldAutoplay,
    type LottieTrigger,
    type LottieSize,
    type LottiePlayerAdapter,
    type LottiePlayerFactory,
  } from '@chenzy-design/core';

  interface Props {
    /** Lottie JSON 数据（必填，本子集只支持 data 内联，src fetch 延后） */
    data: unknown;
    /** 必填：用户注入的 player 工厂（包装 lottie-web 等），库不内置 */
    player: LottiePlayerFactory;
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
  }

  let {
    data,
    player,
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
  }: Props = $props();

  // bind:this 挂载点；lottie-web 等会往容器内注入 svg/canvas。
  let container = $state<HTMLElement | null>(null);
  // 系统 reduced-motion；matchMedia 命令式监听（cleanup 解绑）。
  let systemReduced = $state(false);
  // adapter 由 player 工厂创建，$effect 命令式生命周期。
  let adapter: LottiePlayerAdapter | null = null;

  const animated = $derived(resolveAnimated(reducedMotion, systemReduced));
  const px = $derived(resolveSize(size));

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

  // player 生命周期：container + data + animated 就绪时创建 adapter，cleanup 销毁。
  // 依赖 container/data/animated/player + 配置项；trigger/autoplay/loop/speed 变化重建 adapter（可接受）。
  $effect(() => {
    if (!container || data == null) return;
    const willAutoplay = shouldAutoplay(trigger, autoplay, animated);
    const a = player({ container, data, loop, autoplay: willAutoplay, speed });
    adapter = a;
    // reduced-motion：定位首帧并暂停（静止渲染首帧）。
    if (!animated && a.goToFrame) {
      a.goToFrame(0);
      a.pause();
    }
    return () => {
      a.destroy();
      adapter = null;
    };
  });

  // 命令式方法，供 bind:this 调用。
  export function play() {
    if (animated) {
      adapter?.play();
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
      adapter?.play();
      onPlay?.();
    }
  }
  function handleLeave() {
    adapter?.pause();
    onPause?.();
  }
</script>

<i
  class={['cd-lottie-icon', className].filter(Boolean).join(' ')}
  bind:this={container}
  style="--cd-lottieicon-current-size:{px}px; {color
    ? `--cd-lottieicon-color:${color};`
    : ''} {style ?? ''}"
  aria-hidden={decorative ? 'true' : undefined}
  role={decorative ? undefined : 'img'}
  aria-label={decorative ? undefined : (label ?? undefined)}
  onmouseenter={trigger === 'hover' ? handleEnter : undefined}
  onmouseleave={trigger === 'hover' ? handleLeave : undefined}
></i>

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

  /* player 注入的内容撑满容器 */
  .cd-lottie-icon :global(svg),
  .cd-lottie-icon :global(canvas) {
    inline-size: 100%;
    block-size: 100%;
    display: block;
  }
</style>
