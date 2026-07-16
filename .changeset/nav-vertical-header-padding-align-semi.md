---
'@chenzy-design/tokens': patch
'@chenzy-design/svelte': patch
---

fix(nav): 侧边导航 header 左内边距对齐 Semi（logo 与折叠态图标居中对齐）

**问题**：`NavHeader` 无论 vertical/horizontal 都复用顶部导航的 `padding-left: 24px`（`navigation-horizontal-paddingleft`），导致侧边态 logo 左缘比菜单图标右偏 12px。

**修复（对齐 Semi）**：Semi 侧边 header 有专属 `paddingLeft`，按公式派生使 logo 在折叠态容器内居中。

- 新增 token（镜像 Semi 变量，保留 `calc()` 公式派生而非落魔数）：
  - `height-navigation-header-logo-collapsed`（36px）
  - `spacing-navigation-vertical-header-paddingleft` = `calc((折叠容器宽 − 折叠水平内边距×2 − 描边 − Logo 折叠尺寸) / 2)`
  - `spacing-navigation-vertical-header-paddingright`（tight/8px）、`...-collapsed-paddingleft`（同公式）、`...-collapsed-paddingright`（0）
- `NavHeader` 新增 `mode` prop，CSS 按 `--vertical/--horizontal/--collapsed` 分派内边距；顶部导航仍 24px，侧边用专属值。
- `Nav` 向 `NavHeader` 透传 `mode`。

逐像素对齐 Semi 官网：header padding-left = 3.5px，logo 左缘比菜单图标左 8px（Semi 原生设计，以折叠态图标居中为基准），展开/折叠两态一致。
