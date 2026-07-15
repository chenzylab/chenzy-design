---
title: Button 按钮
name: button
category: basic
brief: 触发即时操作的按钮，是最基础的交互原子。
---

## 使用场景

按钮承载页面中**最明确的「行动召唤」**：用户点击后立即触发一个动作（提交表单、打开弹窗、确认操作）或一次跳转。它是交互的最小原子，几乎出现在所有界面里，因此一致、可预测的按钮语义直接决定了整体体验的清晰度。

通过 `type` 表达操作的**语义层级**（主/次/第三/警告/危险），通过 `theme` 表达**视觉权重**（实心 solid / 浅色 light / 无背景 borderless / 边框 outline），二者组合即可覆盖从「页面唯一主操作」到「工具栏轻量动作」的全部场景。

## 何时使用

- **触发即时动作**时使用按钮：提交、保存、删除、打开浮层等「点击即生效」的操作。
- 一组操作中**只应有一个主按钮**（`type="primary"` + `theme="solid"`），其余降级为次要/第三，避免视觉焦点竞争。
- **危险且不可逆**的操作（删除、清空）用 `type="danger"`，并配合二次确认（Popconfirm / Modal）。
- 加载耗时操作设 `loading`，防止重复提交；`disabled` 优先级高于 `loading`。

什么时候**不该用** Button，以及该换用谁：

| 场景 | 用什么 | 说明 |
| --- | --- | --- |
| 页面内/外跳转的文字链接 | [Typography 链接](/components/typography) | 链接语义用真 `<a>`，不要用按钮模拟 |
| 纯图标的轻量操作 | [IconButton](/components/iconbutton) | 无文字时用图标按钮，自带 `aria-label` 约束 |
| 一组互斥的单选切换 | [Radio](/components/radio) Button 模式 | 状态选择不是「触发动作」 |
| 命令菜单 / 更多操作收纳 | [Dropdown](/components/dropdown) | 多个低频动作折叠进下拉，避免按钮堆叠 |

## 文案规范

- 按钮文案要**清晰可预测**——用户应能在点击前预判会发生什么。
- 以**强动词开头**，推荐 `{动词}` 或 `{动词}+{名词}` 公式：如「保存」「新建项目」「删除」。
- 当上下文已足够（如 Modal / SideSheet 标题已说明意图）时，按钮可只保留 `{动词}`。
- 统一按**句子格式**书写（首字母/首词大写，其余小写），不堆叠多余修饰词。

| ✅ 推荐 | ❌ 不推荐 |
| --- | --- |
| 新建项目 | 新建一个项目 |
| 删除 | 你确定要删除吗 |
| 保存 | 点击此处保存 |
| Create project | Create A Project |

## 无障碍

- 渲染原生 `<button>`（或 `href` 时使用真链接语义）。
- 键盘：Enter/Space 触发；`href` 形态用浏览器原生链接行为。
- `disabled` → 原生 disabled + `aria-disabled`；loading → `aria-busy="true"`。
- 仅图标按钮必须有 `aria-label`（缺失则 dev 警告）。

## FAQ

- **主按钮该怎么选 type 和 theme？**
  页面唯一主操作用 `type="primary"` + `theme="solid"`（实心强调）；次级操作用 `theme="light"` 或 `secondary`；工具栏等轻量场景用 `theme="borderless"`。

- **loading 和 disabled 同时设置时以哪个为准？**
  `disabled` 优先级更高：同时为 true 时按钮不可点击且不展示加载态。提交类操作建议只在请求期间设 `loading`。

- **想要文字链接的跳转效果，该用 Button 吗？**
  不建议。跳转用 [Typography 链接](/components/typography)（真 `<a>` 语义，对 SEO、新标签页打开、可访问性更友好）；Button 仅用于触发动作。
