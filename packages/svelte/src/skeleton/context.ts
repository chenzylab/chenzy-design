/**
 * Skeleton context — 容器向原子子组件传递响应式 active 状态。
 * setContext 一个带 getter 的对象，Svelte 5 中读取 .active 即建立响应式依赖。
 */
export interface SkeletonContext {
  readonly active: boolean;
}

export const SKELETON_KEY = Symbol('cd-skeleton');

export type SkeletonSize = 'small' | 'default' | 'large';
