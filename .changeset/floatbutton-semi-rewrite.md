---
"@chenzy-design/svelte": minor
"@chenzy-design/tokens": minor
"@chenzy-design/locale": minor
---

FloatButton / FloatButtonGroup 破坏性重写，严格对齐 Semi Design（无向后兼容）。

- **DOM 对齐**：改为 Semi 的纯 `div + onClick`（外层 div 带 size+shape class，body 带 shape+size(+colorful?+disabled?) class），Group 为 `div` 容器 + `div.item[data-value]` 事件委托直接读 `e.target.dataset.value` 回传。href 靠 JS 跳转（`_blank` → `window.open`，否则 `location.href`）。
- **移除自造 API**：`ariaLabel`、`children`（文字内容）、自定义 shape 字符串、Group 的 `direction`、item 的独立 `disabled/ariaLabel`；移除 `<button>/<a>` 语义化、focus-ring、reduced-motion、dev warn。
- **Token 值/DOM 对齐 Semi**：尺寸修正 24/32/40、z=1000、square 圆角 8px、位置 24px；配色 bg=fill-0、text=primary、disabled 用 disabled-bg/text；Group item bg-hover/active=fill-1/fill-2、补字号 14/行高 20/字重 400。移除中间变量 `colorful-gradient`/`focus-ring`/`motion-duration`/`disabled-opacity`/`border`。
- **新增 AI 色板 alias**：`--cd-color-ai-general/-hover/-active`（明暗双主题，镜像 Semi `--semi-color-ai-general` general-5/6/7 的 `linear-gradient(278deg, 4 色标)`），colorful 直接消费之。
- **移除 locale key** `FloatButton.groupAriaLabel`（Group 不再有 aria-label）。
- Demo 按 Semi 机制重组为 7 个（基础/尺寸/形状/href/colorful/带徽章/Group），覆盖 Semi 全部场景。
