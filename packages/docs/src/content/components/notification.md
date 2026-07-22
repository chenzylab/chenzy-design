---
title: Notification 通知
name: notification
category: feedback
brief: 通知用于主动向用户发出消息通知。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Basic from '../../demos/notification/01-basic.svelte';
  import basicSrc from '../../demos/notification/01-basic.svelte?raw';
  import Placement from '../../demos/notification/02-placement.svelte';
  import placementSrc from '../../demos/notification/02-placement.svelte?raw';
  import Icon from '../../demos/notification/03-icon.svelte';
  import iconSrc from '../../demos/notification/03-icon.svelte?raw';
  import Theme from '../../demos/notification/04-theme.svelte';
  import themeSrc from '../../demos/notification/04-theme.svelte?raw';
  import Link from '../../demos/notification/05-link.svelte';
  import linkSrc from '../../demos/notification/05-link.svelte?raw';
  import Duration from '../../demos/notification/06-duration.svelte';
  import durationSrc from '../../demos/notification/06-duration.svelte?raw';
  import ManualClose from '../../demos/notification/07-manual-close.svelte';
  import manualCloseSrc from '../../demos/notification/07-manual-close.svelte?raw';
  import Update from '../../demos/notification/08-update.svelte';
  import updateSrc from '../../demos/notification/08-update.svelte?raw';
  import Hook from '../../demos/notification/09-hook.svelte';
  import hookSrc from '../../demos/notification/09-hook.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { notification } from '@chenzy-design/svelte';
```

### 普通通知

最基本的用法，3s 后自动关闭。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 不同位置弹出

可以从多个不同位置弹出：默认右上角 `topRight`。可选值：`top`、`bottom`、`topLeft`、`topRight`、`bottomLeft`、`bottomRight`。

<DemoBox code={placementSrc}><Placement /></DemoBox>

### 带有图标的通知

包括成功、失败、警告、提示。

<DemoBox code={iconSrc}><Icon /></DemoBox>

### 多色样式

可以使用 `theme` 设置浅色填充样式提高与界面的对比，默认为 'normal' 的白色模式。

<DemoBox code={themeSrc}><Theme /></DemoBox>

### 链接文本

配合 Typography 可以自定义操作区链接文本，用来配合更复杂的场景的使用。

<DemoBox code={linkSrc}><Link /></DemoBox>

### 修改延时

自定义时长 10s，默认时长为 3s。

<DemoBox code={durationSrc}><Duration /></DemoBox>

### 手动关闭

设置 duration 为 0 时，通知将不会自动关闭，此时只能手动关闭。

<DemoBox code={manualCloseSrc}><ManualClose /></DemoBox>

### 更新内容

可以通过唯一的 `id` 来更新内容。

<DemoBox code={updateSrc}><Update /></DemoBox>

### 消费 Context

通过 `useNotification()` 创建支持读取 context 的 contextHolder。此时的通知会渲染在 contextHolder 所在的节点处，继承该处上下文（如 LocaleProvider）。

<DemoBox code={hookSrc}><Hook /></DemoBox>

## API 参考

组件提供的静态方法，使用方式如下：

展示：可以直接传入 options 对象，返回值为 `id`：`const id = notification.open({ /*...options*/ })`

- `notification.open({ title: 'title', content: 'message', duration: 3 })`
- `notification.info({ content: 'message', duration: 3 })`
- `notification.error({ content: 'message', duration: 3 })`
- `notification.warning({ content: 'message', duration: 3 })`
- `notification.success({ content: 'message', duration: 3 })`

手动关闭（id 为展示方法的返回值）

- `notification.close(id)`

全局销毁：

- `notification.destroyAll()`

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| content | 通知内容 | string \| Snippet | `''` |
| direction | 书写方向，可选 `ltr`、`rtl` | string | `ltr` |
| duration | 自动关闭的延时，单位 s，设为 0 时不自动关闭 | number | 3 |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义需要设置 `position: relative`。仅首条通知（容器挂载前）生效 | () => HTMLElement | () => document.body |
| icon | 左上角 icon | Snippet | - |
| id | 自定义通知 id，传入已存在的 id 时原地更新该通知 | string | - |
| position | 弹出位置，可选 `top`、`bottom`、`topLeft`、`topRight`、`bottomLeft`、`bottomRight` | string | `topRight` |
| showClose | 是否展示关闭按钮 | boolean | true |
| theme | 填充样式，支持 `light`、`normal` | string | `normal` |
| title | 通知标题 | string \| Snippet | `''` |
| zIndex | 弹层 z-index 值，首次设置一次生效 | number | 1010 |
| onClick | 点击通知的回调函数 | (e: MouseEvent) => void | - |
| onClose | 通知关闭的回调函数（主动关闭、延时到达关闭都会触发） | () => void | - |
| onCloseClick | 主动点击关闭按钮时的回调函数 | (id: string) => void | - |

全局配置在调用前提前配置，全局一次生效：

- `notification.config(config)`

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bottom | 弹出位置 bottom | number \| string | - |
| direction | 默认书写方向，可选 `ltr`、`rtl`（Svelte 命令式入口特有，per-item direction 优先） | string | `ltr` |
| duration | 自动关闭的延时，单位 s，设为 0 时不自动关闭 | number | 3 |
| getPopupContainer | 容器宿主挂载目标（须在首条通知前配置） | () => HTMLElement | () => document.body |
| left | 弹出位置 left | number \| string | - |
| position | 弹出位置，可选 `top`、`bottom`、`topLeft`、`topRight`、`bottomLeft`、`bottomRight` | string | `topRight` |
| right | 弹出位置 right | number \| string | - |
| top | 弹出位置 top | number \| string | - |
| zIndex | 弹层 z-index 值 | number | 1010 |

Hook 用法：

- `useNotification()`
  当你需要使用 Context 时，可以通过 `useNotification()` 创建一个 contextHolder 插入相应的节点中。此时通过 hooks 创建的通知将会得到 contextHolder 所在位置的所有上下文。返回值为 `[api, holderStore]`：`holderStore` 传给 `<NotificationHolder store={holderStore} />`；`api` 拥有以下方法：`info`、`success`、`warning`、`error`、`open`、`close`。

## Accessibility

### ARIA

- 组件的 `role` 为 'alert'
- 通知的 `aria-labelledby` 标记为对应通知标题

### 键盘和焦点

- 关闭按钮为 `<button aria-label>`，Tab 可达，Enter/Space 触发；通知非模态，不抢占焦点，不创建焦点陷阱。
- 鼠标悬停时暂停计时、离开时重新计时，满足 WCAG 2.2.1 时限可调。

## 文案规范

- 标题
  - 使用简洁明了的语言进行说明
  - 避免使用逗号，句号等标点符号
- 正文
  - 在信息传递完整的前提下，尽可能地将正文压缩至 1-2 句话
  - 对标题进行详尽地描述或者解释，而不是对标题的重复说明
  - 使用正确的标点符号，句子内使用逗号，句子间使用句号
- 操作
  - 文案需要展示操作的具体含义

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 标题「Task completed」，正文「400 tasks succeed and 600 failed.」，操作「Check failed tasks」 | 标题「Status editing tasks completed」，正文重复标题，操作「Check」 |
