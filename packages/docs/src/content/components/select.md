---
title: Select 选择器
name: select
category: input
brief: Select 是从一组预定义选项中进行选择的下拉表单控件，收起态显示当前选中值，展开后呈现 ARIA listbox 浮层供用户选择。
---

## 使用场景

Select 是从一组预定义选项中进行选择的下拉表单控件，是 chenzy-design 表单体系中复杂度最高的 input 类组件之一。它在收起态显示当前选中值（或占位符），展开后呈现一个 ARIA listbox 浮层供用户选择。

核心能力：
- **单选 / 多选**：`multiple` 切换；多选以 Tag 形式回显，支持 `maxTagCount` 折叠为 `+N`。
- **可搜索（filter）**：内置过滤或受控 `onSearch` 远程检索；支持 `remote` 模式（输入触发请求、loading 态、防抖）。
- **虚拟化**：选项超阈值（默认 `> 100`）自动启用虚拟滚动，仅渲染可视区，保证万级选项流畅。
- **创建项（allowCreate / tags 模式）**：搜索无匹配时允许把输入文本作为新选项创建。
- **分组（OptGroup）/ 禁用项 / 自定义渲染 / 前后缀 / 清除 / 校验态**。

适用场景：表单字段选择、筛选器、标签编辑、远程联想搜索。

不适用场景：选项极少且需常驻可见时用 Radio/Checkbox；树形层级数据用 TreeSelect；纯命令面板用 Cascader/AutoComplete。

## 何时使用

- 从有限枚举选项中单选或多选时使用（选项应来自预定义集合而非自由输入）。
- 选项较多（超过 5 项）需要折叠收起时使用（少量常驻可见时应使用 Radio/Checkbox）。
- 需要远程搜索或虚拟化长列表时使用。
- 树形层级数据应使用 TreeSelect；逐级路径选择应使用 Cascader。

## 无障碍

- 触发器使用 `role="combobox"`，配合 `aria-haspopup="listbox"`、`aria-expanded`、`aria-controls`、`aria-activedescendant`（焦点常驻触发器，活动项靠 activedescendant 指示）。
- 浮层使用 `role="listbox"`，多选时 `aria-multiselectable="true"`；选项使用 `role="option"` + `aria-selected`；分组使用 `role="group"` + `aria-label`。
- 键盘交互：`Enter`/`Space`/`Alt+ArrowDown` 打开浮层；`↓/↑` 移动活动项（跳过禁用）；`Home/End` 首/末项；`Enter` 选中；`Esc` 关闭；`Backspace`（多选搜索框为空时）删除最后 Tag；`Tab` 关闭并移交焦点。

## 文案规范

- **占位符用动词短语**「请选择」，避免「选择一个选项…」冗余。
- **空态区分语境**：用「无匹配选项」而非「没有数据」，区分「未搜索到」与「列表为空」。
- **创建项保留引号高亮**用户输入，如 `创建 "xxx"`。
- **计数文案简洁**：用「已选 3 项」，不写「您已经选择了 3 个选项」。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 请选择 | 选择一个选项… |
| 无匹配选项 | 没有数据 |
| 已选 3 项 | 您已经选择了 3 个选项 |

- 清除全部不可撤销地移除所有选中值，若需二次确认应在外层包裹弹窗，组件本身保持轻量不弹确认。
