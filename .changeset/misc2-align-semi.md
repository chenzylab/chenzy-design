---
"@chenzy-design/tokens": patch
"@chenzy-design/svelte": patch
---

逐组件样式对齐 Semi（展示/排版）：

- **Typography**：mark 高亮背景 warning(橙)→primary-light-default(浅蓝，对齐 Semi mark-bg）；新增 quaternary 文字色(text-3)、code 文字色(text-2) token。
- **Space**：medium 间距 base-tight(12)→base(16)、loose base(16)→loose(24)，对齐 Semi space-medium/loose。
- **Descriptions**：新增双行显示 value 字重 bold token（对齐 Semi descriptions value fontWeight）。
- **ScrollList / Divider / OverflowList**：核对已对齐（或纯布局无样式 token），无需改。

均按 Semi 源码逐条对齐值。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过。
