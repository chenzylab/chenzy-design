---
"@chenzy-design/svelte": patch
---

修复 Menu/Nav 折叠（inlineCollapsed）态样式：折叠项被 Tooltip 包裹，其触发器默认 inline-block 会收缩到图标宽度（16px），导致选中背景与点击区只剩一小块、图标左偏不居中；且折叠 Menu 固定 48px 宽未撑满更宽的 Sider/Nav 折叠轨。修复后折叠项撑满整条图标轨、图标居中、选中背景填满，点击热区也覆盖整轨。
