export { default as Input } from './Input.svelte';
export { default as InputGroup } from './InputGroup.svelte';
// TextArea 严格对齐 Semi：源码同在 input/ 目录、同为顶层导出（semi-ui/input/textarea.tsx）。
export { default as TextArea } from './TextArea.svelte';
export { meta as inputMeta, inputGroupMeta, textareaMeta } from './meta.js';
export {
  INPUT_GROUP_CTX,
  getInputGroupContext,
  type InputGroupContext,
  type InputSize as InputGroupSize,
} from './context.js';
