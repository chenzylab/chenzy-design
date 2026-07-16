---
title: Rating 评分
name: rating
category: input
brief: Rating 是一个用于评分与展示评价等级的输入组件，用户通过点击或键盘选择 1~N 个图标表达评分，也可作为只读模式展示既定分值。
---

## 使用场景

Rating 是一个用于评分与展示评价等级的输入组件。用户通过点击或键盘选择 1~N 个图标（默认星形）表达评分；也可通过 `disabled` 作为只读模式展示既定分值。核心能力：

- **半星（allowHalf）**：单个图标可表达 0.5 粒度，支持点击图标左半 / 右半区域分别设值。`allowHalf` 也支持展示除 0.5 外的小数。
- **自定义字符（character）**：默认星形，可替换为任意图标、文本字符，或按 index 返回不同节点的 Snippet。
- **键盘可达**：方向键增减分值，符合 radio 组语义。
- **悬停反馈**：hover 时高亮预览分值并触发 onHoverChange，移出时回调 undefined。
- **附加能力**：count（图标数量）、size（default/small/number）、disabled、tooltips（逐项提示文案）、allowClear（再次点击当前值清零）。

典型使用场景：商品评价、满意度调研、内容打分、只读评分展示。

## 何时使用

- 需要用户以图标（星形等）的数量表达评价等级时使用。
- 只读展示已有评分数据时使用（设置 `disabled` 属性）。
- 精确数值输入场景不适合使用 Rating，应使用 InputNumber 或 Slider。

## 无障碍

- 每颗星渲染两个 `role="radio"`（`first` 半星层 / `second` 整星层），配合 roving tabindex：仅当前选中项 `tabindex=0`，其余为 `-1`。额外渲染一个空评分项承载「0 分」焦点。
- 每个 radio 具有 `aria-checked`（是否选中）、`aria-posinset`（在列表中的位置）、`aria-setsize`（列表长度）；`disabled` 时 `aria-disabled="true"`。
- 语义化：`aria-label` 优先；若未传且 `character` 为字符串，则以该字符串作为 aria 前缀；否则回退 `star`。
- 键盘：`→`/`↑` 加一步，`←`/`↓` 减一步（`allowHalf` 时步进 0.5），越界环绕（超过上限归 0，低于 0 归上限）；焦点随分值搬移。RTL 下左右方向键语义镜像。
- 值变更经 polite live region 播报 `aria-valuetext`。
