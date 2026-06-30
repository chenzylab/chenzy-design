---
"@chenzy-design/svelte": patch
---

修复水平导航（顶部 Nav）选中下划线错位：下划线原贴在 item 底部（`inset-block-end:0`），而菜单底部还有 1px 边框，导致蓝色下划线浮在灰边框上方 1px、看着断开错位。改为 `inset-block-end:-1px` 压在底边框上对齐成一条线，并左右内缩到 item 内边距、加圆角端点，使下划线对齐文字内容区，更精致干净。
