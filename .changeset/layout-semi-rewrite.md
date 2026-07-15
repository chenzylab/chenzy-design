---
"@chenzy-design/svelte": major
"@chenzy-design/core": major
"@chenzy-design/tokens": major
"@chenzy-design/locale": major
---

Layout：破坏性重写严格对齐 Semi（纯布局容器，无背景/尺寸样式，无组件 token，无折叠功能）。

- **组件**：Layout / Header / Footer / Content 仅保留 `class` / `style` / `aria-label` / `role`（Layout 另有 `hasSider`）；DOM 与 class 对齐 Semi（`cd-layout` / `cd-layout-has-sider` / `cd-layout-header` / `-footer` / `-content` / `-sider` / `-sider-children`），补齐 box-sizing 与 has-sider 行内 `overflow-x:hidden`、RTL `direction`。
- **Sider**：破坏性移除 `collapsed` / `defaultCollapsed` / `collapsible` / `width` / `collapsedWidth` / `reverseArrow` / `placement` / `onCollapse` / `trigger` / `zeroWidthTriggerStyle` 及折叠动画、零宽触发块。只保留 Semi 的 `breakpoint`（数组）/ `onBreakpoint(screen, matched)` / `class` / `style` / `aria-label` / `role`；内联对齐 Semi 的 responsiveMap（xs 为 max-width，其余 min-width）+ matchMedia 监听。DOM 为 `<aside><div class="cd-layout-sider-children">`。
- **tokens**：删除全部 `--cd-layout-*` 组件 token（Semi 无 variables.scss，Layout 不附带任何样式），移除 tokens 注册。
- **core**：删除 `createSider` 状态机（`packages/core/src/sider.ts` 及导出）——Semi 无此逻辑。
- **locale**：删除 Semi 没有的 `Sider` 文案键；新增对齐 Semi 的 `Navigation.collapseText` / `Navigation.expandText`，`Nav.Footer` 折叠按钮文案改用之。
- **demos**：重写为 Semi 的 8 例（三行 / 左侧栏 / 右侧栏 / 侧边栏 / 响应式 / 顶部导航 / 顶部导航-侧边 / 侧边导航），移除依赖已删功能的 8 个自造 demo。
- meta / content 全量对齐新 API。
