export { default as Tag } from './Tag.svelte';
export { default as TagGroup } from './TagGroup.svelte';
export { default as SplitTagGroup } from './SplitTagGroup.svelte';
// 类型定义拆到独立 interface.ts（对齐 Semi tag/interface.ts + index.tsx 的 `export * from './interface'`）。
export type * from './interface.js';
// TagGroup / SplitTagGroup 的 API 已并入 tagMeta.subComponents（对齐 Semi 同页三组件，
// 类比 Button/ButtonGroup），不再导出独立 meta。
export { meta as tagMeta } from './meta.js';
