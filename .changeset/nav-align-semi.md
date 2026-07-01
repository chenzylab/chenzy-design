---
"@chenzy-design/tokens": patch
"@chenzy-design/svelte": patch
---

逐组件样式对齐 Semi（导航类）：

- **Breadcrumb**：分割符 text-3→text-2、当前项字重 token 化(bold)。
- **Pagination**：选中态由「蓝实底白字」改为「浅蓝底(primary-light-default)蓝字」、页码去边框，对齐 Semi。
- **Steps**：未到达图标背景 fill-1→text-2（配白字）、未完成连接线 border→fill-2。
- **Anchor**：选中链接文字 primary→text-0（滑轨 ink 仍 primary），对齐 Semi。
- **Timeline**：连线颜色 border→text-3。

均为回退 Alias/全局 token 的值/引用对齐，无写死。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过，Pagination 选中态浏览器实测（bg #eaf5ff 蓝字 #0064fa）。
