---
"@chenzy-design/svelte": minor
"@chenzy-design/tokens": minor
---

新增 CardGroup + InputGroup 两个子组件（对标 Semi 2.101.0，导出符号级核对时补齐的漏判子组件）。

- **CardGroup**（`Card.Group` / 独立 `CardGroup`）：把多个 Card 以 CSS grid 网格成组排布，`spacing` 统一间距（number=水平/垂直一致；[x,y]=分别指定）。纯渲染无 core，`role=group` + 可选 `aria-label`。tokens：`--cd-cardgroup-spacing` / `--cd-cardgroup-min-column`。
- **InputGroup**（`InputGroup`）：把多个输入类控件（Input/Select/DatePicker 等）无缝拼接为一组——相邻边框合并、首尾圆角、`size`/`disabled` 经 context 回退透传（子控件显式 prop 始终优先，不破坏各控件 API），可选整组 `label`（`aria-labelledby` 关联）+ `labelPosition` + 组级 `onFocus`/`onBlur`（focusin/focusout 冒泡）。控件区 `role=group`。tokens：`--cd-inputgroup-border` / `--cd-inputgroup-radius` / `--cd-inputgroup-label-gap`。
- Input 支持读取 InputGroup 组级默认（`getInputGroupContext`）：`size`/`disabled` 未显式设置时回退组级值。
