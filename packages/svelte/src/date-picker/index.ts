// 主导出 = 从零重写并严格对齐 Semi 的实现（原 DatePickerNext）。
export { default as DatePicker } from './DatePickerNext.svelte';
export { meta as datePickerMeta } from './meta.js';
// 过渡别名（保留一段时间避免消费方骤断，指向同一实现）。
export { default as DatePickerNext } from './DatePickerNext.svelte';
