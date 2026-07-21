---
'@chenzy-design/svelte': patch
---

fix(grid): Row 响应式 gutter 触发 effect_update_depth_exceeded 无限循环

当 `Row` 的 `gutter` 为响应式对象（如 `{ xs: 16, md: 24 }`）或数组时，`registerMediaQuery` 的 `callInInit` 会在断点订阅 `$effect` 同步执行期内立即回调 `match`/`unmatch`。原实现用 `screens = { ...screens, [bp]: … }` 整体重建 —— spread 读取了整个 `screens`，使该 effect 读写同一状态，触发 Svelte `effect_update_depth_exceeded` 无限循环（页面加载与窗口缩放时均复现，控制台刷屏报错）。

改为逐键 mutate（`screens[bp] = …`）：单键写不读取整体 `screens`，切断 effect 的自依赖，循环消除。响应式断点降级与运行时窗口缩放的 gutter 自适应均保持正确（真机缩放至 xs 断点复测无报错，grid 单测 27 项全绿）。
