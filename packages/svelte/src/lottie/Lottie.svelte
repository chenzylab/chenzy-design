<!--
  Lottie — 严格对齐 Semi Design Lottie。在网页中展示 Lottie 动画，内部基于 lottie-web 渲染。
  相较直接用 lottie-web：无需关心动画容器的创建与销毁、无需关心动画生命周期。

  逻辑拆分对齐 Semi 三文件结构（semi-foundation/lottie/{foundation.ts,constants.ts} +
  semi-ui/lottie/index.tsx）：本文件（渲染层）↔ index.tsx；core createLottie ↔
  LottieFoundation；core LOTTIE_PREFIX ↔ constants.ts cssClasses.PREFIX。
  - mount：lottie.loadAnimation(loadParams)，回调 getAnimationInstance(animation) + getLottie(lottie)
  - params 变（深比较）：destroy 旧实例 → 重新 loadAnimation → 回调 getAnimationInstance
  - unmount：destroy
  - loadParams 默认 renderer:'svg' / loop:true / autoplay:true，被 params 覆盖
  - params.container 存在 → 渲染 null（用户自管容器）；否则渲染 <div class="cd-lottie">
  Semi foundation 同步调用（假设 lottie-web 已静态 import）；本库需 SSR 安全，改为动态
  import + onMount 加载 lottie-web 后再调用 core foundation.init（服务端只渲染空容器 div）。
  零 scss / 零 token —— 严格对齐 Semi（Semi 仅一个无样式的 .semi-lottie class）。
-->
<script lang="ts" module>
  import type { AnimationItem, LottiePlayer } from 'lottie-web';

  /**
   * lottie.loadAnimation 的入参类型（path 或 animationData 二选一 + 通用配置）。
   * 用 Partial 对齐 Semi foundation（`Partial<ArgsType<typeof lottie.loadAnimation>[0]>`）：
   * container 可缺省（缺省时由组件自管 div 提供），故整体设为可选。
   */
  export type LottieParams = Partial<Parameters<LottiePlayer['loadAnimation']>[0]>;

  /**
   * getLottie —— 获取全局 lottie 包。静态方法版本，与 Semi `Lottie.getLottie` 对齐。
   * 动态 import lottie-web 并返回其 default 导出（浏览器端）。SSR 下无 window 会抛错。
   */
  export async function getLottie(): Promise<LottiePlayer> {
    const mod = await import('lottie-web');
    return mod.default;
  }
</script>

<script lang="ts">
  import { onMount } from 'svelte';
  import { createLottie, LOTTIE_PREFIX, type LottiePlayerLike } from '@chenzy-design/core';

  interface Props {
    /** 用于配置动画相关参数，透传 lottie.loadAnimation（path / animationData / renderer / loop / autoplay / container 等）。**必填**。 */
    params: LottieParams;
    /** 容器宽度（作用于根 div 的 width，如 "300px"）。params.container 存在时不生效。 */
    width?: string;
    /** 容器高度（作用于根 div 的 height，如 "300px"）。params.container 存在时不生效。 */
    height?: string;
    /** 获取当前动画 AnimationItem 实例（含 play/pause/setSpeed 等方法）。mount 及 params 变更后回调。 */
    getAnimationInstance?: (animation: AnimationItem | null) => void;
    /** 获取全局 lottie 包（含 setQuality 等全局方法）。mount 时回调。 */
    getLottie?: (lottie: LottiePlayer) => void;
    /** 根节点类名。 */
    class?: string;
    /** 根节点内联样式。 */
    style?: string;
    [key: string]: unknown;
  }

  let {
    params,
    width,
    height,
    getAnimationInstance,
    getLottie: getLottieProp,
    class: className,
    style,
    ...rest
  }: Props = $props();

  let containerEl = $state<HTMLDivElement | null>(null);
  let lottiePlayer: LottiePlayerLike | null = null;

  // —— loadParams：默认 svg/loop/autoplay 被用户 params 覆盖；container 缺省用组件自管的 div，
  //    用户 params.container 优先（故 container 放 spread 之后，用 ?? 兜底缺省值）。
  const foundation = createLottie({
    adapter: {
      getLottie: () => lottiePlayer as LottiePlayerLike,
      getLoadParams: () => ({
        renderer: 'svg',
        loop: true,
        autoplay: true,
        ...params,
        container: params.container ?? (containerEl as Element),
      }),
      notifyAnimationInstance: (instance) =>
        getAnimationInstance?.(instance as unknown as AnimationItem | null),
      notifyLottie: (lottie) => getLottieProp?.(lottie as unknown as LottiePlayer),
    },
  });

  onMount(() => {
    let disposed = false;
    void (async () => {
      lottiePlayer = ((await import('lottie-web')).default as unknown) as LottiePlayerLike;
      if (disposed) return;
      foundation.init();
    })();
    return () => {
      disposed = true;
      foundation.destroy();
    };
  });

  // —— params 变更（深比较）：destroy 旧实例 → 重建 → 回调（对齐 Semi handleParamsUpdate）——
  // 首帧由 onMount 负责 load，故 prevParamsJSON 初值为「首帧序列化值」以跳过首次触发。
  let prevParamsJSON: string | undefined = undefined;
  $effect(() => {
    const json = safeStringify(params);
    if (prevParamsJSON === undefined) {
      prevParamsJSON = json;
      return;
    }
    if (json !== prevParamsJSON) {
      prevParamsJSON = json;
      if (lottiePlayer) foundation.handleParamsUpdate();
    }
  });

  // animationData 可能含大对象，JSON.stringify 失败时返回 undefined；与已存值比较恒不等→触发重建（安全兜底）。
  function safeStringify(v: unknown): string | undefined {
    try {
      return JSON.stringify(v);
    } catch {
      return undefined;
    }
  }

  const cls = $derived([LOTTIE_PREFIX, className].filter(Boolean).join(' '));
  const wrapperStyle = $derived(
    [width && `width:${width}`, height && `height:${height}`, style].filter(Boolean).join(';'),
  );
</script>

<!-- params.container 存在 → 用户自管容器，组件不渲染 DOM（对齐 Semi 返回 null）。 -->
{#if !params.container}
  <div bind:this={containerEl} class={cls} style={wrapperStyle} {...rest}></div>
{/if}
