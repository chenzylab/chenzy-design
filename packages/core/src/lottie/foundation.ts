/**
 * createLottie — framework-agnostic state machine for the Lottie component.
 * Ported 逐行 from Semi semi-foundation/lottie/foundation.ts (LottieFoundation)。
 * See specs/components/other/Lottie.spec.md §3.
 *
 * 纯状态机：加载/重建/销毁 lottie-web 的 AnimationItem。所有 DOM I/O（容器节点、
 * lottie-web 包本体的获取）经 adapter 注入；本模块只算不碰 DOM。
 * Semi foundation 是同步的（假设 lottie-web 已静态 import）；本库 lottie-web 依赖
 * window，须 SSR 安全，故 adapter 用 getLottie() 返回「已加载的模块实例」（渲染层
 * 在 onMount 里动态 import 后才调用 init，见 Lottie.svelte），逻辑顺序与 Semi 一致，
 * 只是把「何时能拿到 lottie 包」这件事交给渲染层决定。
 */

export interface LottieAnimationItem {
  destroy: () => void;
  [key: string]: unknown;
}

export interface LottiePlayerLike {
  loadAnimation: (params: Record<string, unknown>) => LottieAnimationItem;
}

/** adapter：渲染层注入的 DOM I/O + lottie-web 包本体 + 变更通知。core 只调、不持有引用。 */
export interface LottieAdapter {
  /** 已加载的 lottie-web 模块实例（渲染层动态 import 后注入）。 */
  getLottie: () => LottiePlayerLike;
  /** 组装 lottie.loadAnimation 入参（对齐 Semi getLoadParams：默认 renderer/loop/autoplay 被 params 覆盖，container 缺省用组件自管 div）。 */
  getLoadParams: () => Record<string, unknown>;
  notifyAnimationInstance: (instance: LottieAnimationItem | null) => void;
  notifyLottie: (lottie: LottiePlayerLike) => void;
}

export function createLottie(options: { adapter: LottieAdapter }) {
  const { adapter } = options;

  let animation: LottieAnimationItem | null = null;

  /** 对齐 Semi LottieFoundation.init：加载动画 + 回调 getAnimationInstance/getLottie。 */
  const init = () => {
    animation = adapter.getLottie().loadAnimation(adapter.getLoadParams());
    adapter.notifyAnimationInstance(animation);
    adapter.notifyLottie(adapter.getLottie());
  };

  /** 对齐 Semi LottieFoundation.handleParamsUpdate：destroy 旧实例 → 重新 loadAnimation → 回调。 */
  const handleParamsUpdate = () => {
    animation?.destroy();
    animation = adapter.getLottie().loadAnimation(adapter.getLoadParams());
    adapter.notifyAnimationInstance(animation);
  };

  /** 对齐 Semi LottieFoundation.destroy。 */
  const destroy = () => {
    animation?.destroy();
    animation = null;
  };

  const getAnimation = () => animation;

  return { init, handleParamsUpdate, destroy, getAnimation };
}

export type LottieFoundation = ReturnType<typeof createLottie>;
