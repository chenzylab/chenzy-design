---
"@chenzy-design/tokens": patch
"@chenzy-design/svelte": patch
---

收尾核查·对齐 Semi 剩余偏差 + 清理旧 token 名：

- **Select**：选项选中态文字 primary→text-0（Semi option_main-text=text-0，靠背景高亮区分选中）；拆出 select-option-check-color(primary) 给对勾图标单独用。
- **Tree**：搜索高亮文本 warning(橙)→primary + 去背景(transparent) + 字重 bold（对齐 Semi tree hightlight-text=primary）。
- **旧 token 名清理**：--cd-radius-small→--cd-border-radius-small（list meta）、--cd-radius-default→--cd-border-radius-small（OverflowList）、--cd-font-size-0→--cd-font-size-small（DatePicker）——早期语义重命名遗漏残留（旧名不存在，靠 fallback）。

均按 Semi 源码逐条对齐值。涉及组件无视觉回归基线；971 单元 + 6 视觉全绿、perf 通过。
