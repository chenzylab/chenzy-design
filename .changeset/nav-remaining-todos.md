---
"@chenzy-design/svelte": minor
---

补齐 Nav 剩余 TODO，对齐 Semi Navigation 交互能力：

- **Menu** 新增：项级 `onClick`/`onMouseEnter`/`onMouseLeave`（MenuItemNode）、`expandIcon`（自定义展开箭头 Snippet）、`motion`（子菜单展开动画开关，默认 true）。
- **Nav** 新增并透传：`onClick`（点任意项，载荷 NavKey）、`expandIcon`、`subNavMotion`；NavItemDef 加 `onClick`/`onMouseEnter`/`onMouseLeave` 映射到 Menu 项级回调。
- **Nav.Item** 声明式新增 `onClick`/`onMouseEnter`/`onMouseLeave`。
- 同步 meta/spec，补测试（onClick/项级 onClick/subNavMotion 类）。

刻意舍弃（最边角、Menu 不支持 per-Sub 浮层配置）：Nav.Sub 的 `dropdownProps`/`dropdownStyle`/`maxHeight`、Nav.Item 的 `indent`/`level`——用 Nav 级 `getPopupContainer`/`subNavOpen|CloseDelay` 与 `limitIndent`/`inlineIndent` 替代。
