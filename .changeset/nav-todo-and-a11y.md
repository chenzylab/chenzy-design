---
"@chenzy-design/svelte": minor
---

补齐 Nav 的 MVP TODO + a11y 测试：

- **Menu** 新增 `limitIndent`（默认 true，仅一级缩进；false 逐级缩进）与 `toggleIconPosition`（'left'|'right'，inline 子菜单箭头位置）。
- **Nav** 透传 Menu 已有能力：`inlineIndent` / `limitIndent` / `toggleIconPosition` / `subNavOpenDelay` / `subNavCloseDelay` / `getPopupContainer` / `renderWrapper`。
- **Nav.Item / Nav.Sub** 声明式写法：JSX 式 `<Nav.Item>` / `<Nav.Sub>` 子组件声明导航树（与 items 二选一）。子项经 context 注册进普通数组、挂载后异步 bump 单个 $state revision 触发一次重建——规避 Svelte 5 声明式收集的 effect 自循环。
- 新增 `Nav.a11y.test.ts`（axe 0 violations：vertical/horizontal/折叠/带链接/header）+ 声明式收集渲染测试。
- 同步 meta / spec。仅 `subNavMotion` 仍留 TODO（Menu 无 motion 开关，动画走 CSS + prefers-reduced-motion）。
