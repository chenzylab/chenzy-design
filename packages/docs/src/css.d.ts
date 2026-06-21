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
