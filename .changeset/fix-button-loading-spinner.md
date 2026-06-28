---
"@chenzy-design/svelte": patch
---

修复 Button `loading` 态：此前只禁用点击并设 `aria-busy`，**未渲染任何加载指示器**（按钮看起来和普通态一样）。现在 loading 时在文字前显示一个旋转的加载图标（优先于用户传入的 icon），`prefers-reduced-motion` 下不旋转。
