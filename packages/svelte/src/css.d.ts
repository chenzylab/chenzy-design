// Ambient declarations for side-effect CSS imports (required since TypeScript 6).
// browser project 的 RTL/视觉夹具需要真实引入 tokens.css 才能让 var(--cd-*) 生效
// （见 DatePickerRtlFixture.svelte 等），否则 svelte-check 报
// "Cannot find module or type declarations for side-effect import"。
declare module '*.css';
declare module '@chenzy-design/tokens/tokens.css';
