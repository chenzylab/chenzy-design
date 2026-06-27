---
"@chenzy-design/svelte": patch
---

修复 Badge 组件 dev 模式下 mount 时的 TDZ 运行时错误（`prevDisplayCount` 在 `displayCount` 声明前用 `$state(displayCount)` 预读，触发 `Cannot access 'displayCount' before initialization`）。改为 `undefined` 起始，由首个 effect seed。视觉回归测试发现。
