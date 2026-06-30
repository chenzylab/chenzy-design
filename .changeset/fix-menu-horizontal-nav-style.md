---
"@chenzy-design/svelte": patch
"@chenzy-design/tokens": patch
---

Menu/Nav 配色方案对齐 Semi Navigation：

- **Nav 容器默认透明**（`--cd-nav-bg: transparent`、`--cd-nav-color: inherit`），跟随 Layout.Header/Sider 容器背景，消除「Nav 自带背景块与 Header 撞色不协调」。
- **水平导航选中态对齐 Semi**：选中项无背景块、仅底部 2px 下划线指示；默认项文字 `text-2`、hover 文字 `text-1`（背景透明）、选中文字 `text-0`。去掉原先沿用垂直菜单的「左竖条 + 背景块」导致的方格感。
- **垂直导航选中态对齐 Semi**：选中背景改为浅蓝 `primary-light-default`（原为灰 `fill-0`）+ 蓝色指示条 + 蓝图标。
- **补全缺失的 alias token `--cd-color-primary-light-default`**（light `#eaf5ff`、dark `rgba(84,169,255,0.2)`）。此前 Menu/Table/Tree/Calendar/Banner 均引用该 token 但它从未定义，导致选中浅蓝背景失效（解析为 transparent）；现一并修复。
