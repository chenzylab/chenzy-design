---
title: Cascader 级联选择器
name: cascader
category: input
brief: Cascader（级联选择器）用于从一组有层级关系的数据集合中进行选择，常见于省/市/区、组织架构、商品分类等场景。
---

## 使用场景

级联选择器（Cascader）用于从一组有层级关系的数据集合中进行选择，常见于省/市/区、组织架构、商品分类等场景。用户在单一浮层中逐级展开子级，最终选定一条完整路径或多条路径。

核心能力：
- 单选 / 多选（multiple）—— 多选时带父子级联勾选与半选态。
- 静态全量数据 / 动态加载（loadData）—— 点击展开时按需请求子节点。
- 路径展示策略：显示完整路径 / 仅显示叶子节点（displayProp / displayRender）。
- 触发方式：点击展开下一级（click）或悬停展开（hover）。
- 可搜索（filterTreeNode）—— 跨层级模糊匹配命中路径。
- 受控/非受控 value，可清空、可禁用、可指定校验态。
- 叶子节点可选 / 任意层级可选（changeOnSelect）。

与同类组件边界：单层无层级用 Select；纯树展示用 Tree；树形勾选浮层用 TreeSelect；本组件专注"逐级浮层 + 路径语义"。

## 何时使用

- 数据具有明确的层级关系，需要逐级选择路径时使用（如省市区、分类目录）。
- 数据层级较深，展开节点需要加载子节点时使用（loadData 动态加载）。
- 不适用：单层无层级数据应使用 Select；纯树形结构展示应使用 Tree；树形勾选浮层应使用 TreeSelect。

## 无障碍

- 触发器使用 `role="combobox"`，配合 `aria-haspopup="tree"`、`aria-expanded`、`aria-controls`、`aria-activedescendant`。
- 浮层列区域使用 `role="tree"`，每列使用 `role="group"`，列项使用 `role="treeitem"` 并配合 `aria-level`、`aria-expanded`、`aria-selected`/`aria-checked`（多选）、`aria-disabled`。
- 键盘交互：`Enter`/`Space`/`Down` 打开浮层；`Up/Down` 同列移动；`Right/Enter` 展开进入下一列；`Left` 回到上一列；`Esc` 关闭浮层；`Home/End` 跳列首/尾；`Tab` 关闭浮层焦点回触发器。
- RTL 下列从右向左排布，箭头方向镜像，Left/Right 键义对调。

## 文案规范

- **占位用动词短语**「请选择」，不写「请选择级联数据」等冗余技术词。
- **空态简洁**「暂无数据」，搜索无结果区分为「无匹配结果」。
- **加载失败提供可操作指引**「加载失败，点击重试」，而非仅「出错了」。
- **计数文案统一**「已选 N 项」，避免「选中了 N 个节点」口语化。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 请选择 | 请选择级联数据 |
| 无匹配结果 | 没数据 |
| 加载失败，点击重试 | 出错了 |
| 已选 3 项 | 选中了 3 个节点 |

- 清除全部已选默认不弹确认，多选已选较多时可由调用方按需开启二次确认。
