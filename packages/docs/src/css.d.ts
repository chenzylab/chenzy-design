// Ambient declaration for local .svelte component imports.
declare module '*.svelte' {
  import type { Component } from 'svelte';
  const component: Component<Record<string, unknown>>;
  export default component;
}
// Ambient declarations for side-effect CSS imports (required since TypeScript 6).
declare module '*.css';
declare module 'uno.css';
declare module '@chenzy-design/tokens/tokens.css';
// Prism 语言组件是老式全局副作用脚本（@types/prismjs 未覆盖 components/ 子路径），
// demo 里按需 import "prismjs/components/prism-<lang>.js" 时无类型声明——通配声明为无导出副作用模块。
declare module 'prismjs/components/*';
