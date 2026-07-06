---
"@chenzy-design/svelte": patch
---

refactor(table): 列宽拖拽几何收敛到 core 通用原语 `createResizeDrag`

Table 列头列宽拖拽此前用私有命令式 document 监听 + 几何（startWidth/startX/onMove/onUp
手写），与 core 新增的 `createResizeDrag` 原语重复。现改为直接复用 `createResizeDrag`
（axis:'x'、min:MIN_COL_WIDTH、onStart/onMove/onEnd），卸载兜底改为 `drag.destroy()`。

纯重构，零行为变化、无 API 变化：起始宽度来源（覆盖 > col.width 数值 > 实测列头宽）、
MIN_COL_WIDTH 下限、Math.round、resizing 高亮时机、把手 aria-label 全部保持不变。
