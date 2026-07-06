---
title: HotKeys 快捷键
name: hotkeys
category: other
brief: 声明一组键盘快捷键组合、绑定键盘监听、并渲染出对应的可见键位提示。命中组合时触发回调，可拦截浏览器默认行为、跨平台合并 Cmd/Ctrl、局部或全局监听。
---

## 使用场景

HotKeys（快捷键）用于**声明一组快捷键组合、绑定键盘监听、并渲染出对应的可见键位提示 UI**。命中组合时触发回调。典型场景：全局命令（Ctrl+K 唤起搜索）、编辑器快捷键、阻止浏览器默认行为（拦截 Ctrl+S）、局部元素级快捷键。

核心能力：

- **组合声明**：`hotKeys` 传入恰含 1 个普通键 + 0~多修饰键的数组，取值用原生 `KeyboardEvent.key` 或 `HotKeys.Keys.*` 常量；非法组合抛错。
- **精确匹配**：修饰键（Meta/Shift/Alt/Ctrl）全等匹配（多按/少按都不命中），普通键用 `event.code`（物理键位，规避输入法 / 大小写 / Shift 干扰）。
- **拦截默认行为**：`preventDefault` 命中时 `event.preventDefault()`，用于拦截 Ctrl+S 等浏览器默认行为。
- **跨平台合并 Cmd/Ctrl**：`mergeMetaCtrl` 把 Cmd(Meta) 与 Ctrl 视为同一修饰键（**本库真正实现，Semi 该 prop 未生效**）。
- **局部 / 全局监听**：默认监听 `document.body`，`getListenerTarget` 返回具体元素实现局部作用域。
- **可见提示**：默认用语义化 `<kbd>` 渲染键位；`content` 自定义键名文本，`render` 完全自定义，`render={null}` 只监听不显示。

## 何时使用

- 需要把「键盘组合 → 动作」声明式地绑定，并（可选）向用户展示键位提示时。
- 需要拦截浏览器默认快捷键（如 Ctrl+S / Ctrl+P）时。
- 需要跨平台一致的主修饰键（macOS ⌘ 与 Windows Ctrl）时，用 `mergeMetaCtrl`。

## 何时不用

- 单个元素的原生键盘交互（Enter/Space 触发按钮）→ 组件自身处理，不需 HotKeys。
- 复杂的多层快捷键作用域管理 → 本组件是单组合绑定，多作用域由使用方组合多个实例 + `getListenerTarget` 隔离。

## 无障碍

对标 Semi 的**增强**（Semi 用 span、无 kbd 语义、无 aria）：

- **`<kbd>` 语义**：每个键位用原生 `<kbd>` 承载，屏幕阅读器可识别为键盘输入。
- **`+` 分隔符 `aria-hidden`**：视觉分隔符不进无障碍树。
- **`aria-keyshortcuts`**：提示容器声明快捷键（W3C 语法，如 `Control+K`），关联动作。
- **匹配用 `event.code`**：物理键位匹配，天然规避输入法 / 大小写 / Shift 干扰。
- **键位文本可选中**：不强制 `user-select: none`（Semi 设了），允许用户复制键位文本。
- **对比度**：键位块文字与背景 ≥ 4.5:1。
- **RTL**：键位从逻辑起始排列，`+` 分隔符方向随 RTL。
- 提示 UI 是纯展示（无交互焦点）；监听为全局 / 局部键盘，不引入焦点陷阱。
