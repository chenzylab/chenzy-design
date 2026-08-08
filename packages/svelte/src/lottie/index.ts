import LottieComponent, { getLottie, type LottieParams } from './Lottie.svelte';

/**
 * Lottie 组件 + 静态方法 `Lottie.getLottie`（对齐 Semi `Lottie.getLottie`）。
 * `Object.assign` 复合导出模式（同 HotKeys.Keys / Tabs.Pane / Form.Field）——
 * Svelte 组件本身是函数，可挂静态成员，故 Semi 的静态方法能 1:1 对齐。
 * 同时保留具名导出 `getLottie`，两种调用方式等价。
 */
export const Lottie: typeof LottieComponent & { getLottie: typeof getLottie } = Object.assign(
  LottieComponent,
  { getLottie },
);
export { getLottie, type LottieParams };
export { meta as lottieMeta } from './meta.js';
