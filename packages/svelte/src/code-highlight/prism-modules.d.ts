/**
 * Prism 语言组件与插件是老式全局副作用脚本（`@types/prismjs` 未覆盖各 components/plugins
 * 子路径），动态 import 时无类型声明。这里声明为无导出的副作用模块——它们只是把语法/插件
 * 注册到全局 Prism 上，不导出任何成员。
 */
declare module 'prismjs/components/prism-markup.js';
declare module 'prismjs/components/prism-clike.js';
declare module 'prismjs/components/prism-javascript.js';
declare module 'prismjs/components/prism-css.js';
declare module 'prismjs/components/prism-typescript.js';
declare module 'prismjs/components/prism-markup-templating.js';
declare module 'prismjs/components/prism-bash.js';
declare module 'prismjs/components/prism-json.js';
declare module 'prismjs/plugins/line-numbers/prism-line-numbers.js';
declare module 'prism-svelte';
