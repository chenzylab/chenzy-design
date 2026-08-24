---
'@chenzy-design/svelte': patch
'@chenzy-design/tokens': patch
---

fix(json-viewer): 第三轮严格对齐 Semi，删除三处自造超集样式并补齐内容行/行号完整字体规则

用 ego-browser 真机逐 demo 对 Semi 官网 `semi.design/zh-CN/plus/jsonviewer` 做 computed style 精确测量，发现并修复以下自造超出 Semi 的能力：

- **编辑器容器不该有边框/圆角**：Semi `jsonViewer.scss` 里 `.semi-json-viewer` 本体只有 `padding`+`background`，无 `border`/`border-radius`；本库此前自造加了 1px 边框和圆角，已删除，`overflow` 同步由 `auto` 改回内核自身裁剪（不重复裁剪）
- **外层容器不该统一等宽字体**：Semi 最外层 div 继承 body 常规字体，等宽字体只作用于内容行（`-view-line`）与行号（`-line-number`），本库此前把等宽字体设在了外层容器上；已删除外层字体设置，并给 `-view-line`/`-line-number` 补齐 Semi 完整字体栈（`ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Monaco, 'Fira Code', Consolas, ...`）+ 12px + `!important` 覆盖内核内联 `white-space:pre`（否则 autoWrap 换行失效）
- **`delimiter-colon` 不该单独上色**：内核确实产出该 class，但 Semi scss 未定义其颜色规则（冒号继承默认文字色），本库此前误当作标点统一上蓝色，已改为仅 `delimiter-comma` 保留着色
- **自动补全下拉误用了工具条的圆角/背景 token**：Semi `complete-suggestions-container` 用 `border-radius-medium` + `bg-3`，与搜索/替换工具条的 `border-radius-small` + `bg-0` 不同，此前误共用同一 token，现拆分为独立的 `radius-json-viewer-complete`/`color-json-viewer-complete-bg`
- **`CustomRenderRule.match` 类型定义缺参数**：本库内核环境声明 `.d.ts` 里 `match` 签名少了 `tokenType` 参数、`value` 类型固定为 `string`，与内核真实契约（`(value: string|number|boolean|null, path, tokenType) => boolean`）、组件文档、demo 实际用法均不一致，已修正
- **文档补齐 2.96.0 行为变更说明**：`customRenderRule` 计算 `path` 时同一键值对的 key/value token 现在共享同一 `path`，需用 `tokenType` 区分——此前文档遗漏这段官方说明

删除 3 个死 token（`radius-json-viewer`/`color-json-viewer-border`/旧 `font-json-viewer-fontfamily`/`fontsize`），新增 4 个（`font-json-viewer-mono-fontfamily`/`fontsize`、`radius-json-viewer-complete`、`color-json-viewer-complete-bg`），meta.ts 同步。
