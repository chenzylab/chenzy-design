---
title: HotKeys 快捷键
name: hotkeys
category: other
brief: 用于方便用户自定义快捷键及相关操作。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/hot-keys/01-basic.svelte';
  import basicSrc from '../../demos/hot-keys/01-basic.svelte?raw';
  import Content from '../../demos/hot-keys/02-content.svelte';
  import contentSrc from '../../demos/hot-keys/02-content.svelte?raw';
  import Render from '../../demos/hot-keys/03-render.svelte';
  import renderSrc from '../../demos/hot-keys/03-render.svelte?raw';
  import PreventDefault from '../../demos/hot-keys/04-prevent-default.svelte';
  import preventDefaultSrc from '../../demos/hot-keys/04-prevent-default.svelte?raw';
  import ListenerTarget from '../../demos/hot-keys/05-listener-target.svelte';
  import listenerTargetSrc from '../../demos/hot-keys/05-listener-target.svelte?raw';
</script>

## 使用场景

需要向用户表达快捷键组合的使用方式时，使用 HotKeys 组件可快速渲染出对应的 UI 元素且自动获得事件绑定

## 代码演示

### 如何引入

```jsx
import { HotKeys } from '@chenzy-design/svelte';
```

### 说明

快捷键仅支持修饰键组合 `Shift`、`Control`、`Meta`、`Alt` 与其他键的组合。

> [Meta](https://developer.mozilla.org/zh-CN/docs/Web/API/KeyboardEvent/metaKey) 在 MacOS 中为 `Command`，在 Windows 中为 `Win`

当设定快捷键与常用快捷键如 `Ctrl/Meta + C` 相同时，可以通过设置 `preventDefault` 控制默认事件是否触发。

> 本库差异：修饰键的**显示文本**走 i18n（`HotKeys.ctrl` / `meta` / `alt` / `shift`），在 Apple 平台自动显示为 `⌘⌥⌃⇧` 符号；Semi 直接把 `hotKeys` 数组原样渲染。二者都可用 `content` 覆盖显示文本，且显示文本不影响监听匹配。

### 基本用法

基本使用，通过 `hotKeys` 传入快捷键组合，通过 `onHotKey` 绑定快捷键处理函数，作出响应动作。

按下 Ctrl + Shift + A，唤起 modal。默认在 body.document 监听，全局生效。

[hotKeys 取值参考](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values)，也可以使用 `HotKeys.Keys` 进行设置

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 自定义内容

通过 `content` 传入渲染的字符

<DemoBox code={contentSrc}><Content /></DemoBox>

通过 `render` 传入代替渲染的元素

<DemoBox code={renderSrc}><Render /></DemoBox>

### 阻止默认事件

通过设置 `preventDefault` 控制默认事件是否触发。

<DemoBox code={preventDefaultSrc}><PreventDefault /></DemoBox>

### 修改监听挂载 DOM

快捷键默认在 body 监听，通过 `getListenerTarget` 修改快捷键监听挂载的 DOM

<DemoBox code={listenerTargetSrc}><ListenerTarget /></DemoBox>

## API 参考

### HotKeys

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| content | 设置显示内容 | (string \| Snippet)[] | - |
| disabled | 是否禁用监听（不绑定、不触发） | boolean | false |
| getListenerTarget | 用于设置监听器挂载的 DOM | () => HTMLElement \| null | document.body |
| hotKeys | 设置快捷键组合，[取值参考](https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_key_values) | KeyboardEvent.key[] | - |
| mergeMetaCtrl | 跨平台把 Cmd(Meta) 与 Ctrl 视为同一修饰键 | boolean | false |
| onClick | 点击回调函数 | () => void | - |
| onHotKey | 快捷键回调函数 | (e: KeyboardEvent) => void | - |
| preventDefault | 是否阻止快捷键默认行为 | boolean | false |
| render | 覆盖组件渲染；传 `null` 则不渲染提示，仅保留监听 | Snippet \| null | - |
| style | 样式 | string | - |

### 静态属性

| 名称 | 说明 | 类型 |
| --- | --- | --- |
| HotKeys.Keys | 键名常量枚举（`Keys.Control` / `Keys.Meta` / `Keys.A` 等），覆盖字母、数字、修饰键、符号、方向键、F1-F12、编辑键与小键盘 | `Record<string, string>` |

## 无障碍

- 键位提示的 DOM 结构与 Semi 一致（`div.cd-hotKeys > span > span.cd-hotKeys-content`，分隔符 `span.cd-hotKeys-split`），是纯展示元素，不引入焦点陷阱
- 快捷键匹配用 `event.code`（物理键位）而非 `event.key`，天然规避输入法、大小写与 Shift 干扰
- 键位块文字与背景对比度 ≥ 4.5:1
- 与常用浏览器快捷键冲突时，用 `preventDefault` 明确接管，避免用户预期落空
