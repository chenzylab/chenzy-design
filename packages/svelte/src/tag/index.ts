export { default as Tag } from './Tag.svelte';
export { default as TagGroup } from './TagGroup.svelte';
export { default as SplitTagGroup } from './SplitTagGroup.svelte';
// TagGroup / SplitTagGroup 的 API 已并入 tagMeta.subComponents（对齐 Semi 同页三组件，
// 类比 Button/ButtonGroup），不再导出独立 meta。
export { meta as tagMeta } from './meta.js';
