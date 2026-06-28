---
"@chenzy-design/svelte": minor
---

新增 ButtonGroup / SplitButtonGroup 组件，并为 Button 增加 `colorful` prop（AI 多彩按钮）。ButtonGroup 横向拼接多个 Button 并经 context 透传组级 type/theme/size/disabled 默认（不破坏 Button 现有 API，单按钮显式 prop 仍优先）；SplitButtonGroup 左侧主操作 + 右侧箭头按钮触发下拉（复用 Dropdown 的 items API）；colorful 在 solid/light 主题下用品牌渐变背景营造 AI 风格。
