---
title: Toast 提示
name: toast
category: feedback
brief: Toast 提示是对用户的操作做出及时反馈，由用户的操作触发，反馈信息可以是操作的结果状态，如成功、失败、出错、警告等。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/toast/01-basic.svelte';
  import basicSrc from '../../demos/toast/01-basic.svelte?raw';
  import Types from '../../demos/toast/02-types.svelte';
  import typesSrc from '../../demos/toast/02-types.svelte?raw';
  import Theme from '../../demos/toast/03-theme.svelte';
  import themeSrc from '../../demos/toast/03-theme.svelte?raw';
  import Link from '../../demos/toast/04-link.svelte';
  import linkSrc from '../../demos/toast/04-link.svelte?raw';
  import Duration from '../../demos/toast/05-duration.svelte';
  import durationSrc from '../../demos/toast/05-duration.svelte?raw';
  import ManualClose from '../../demos/toast/06-manual-close.svelte';
  import manualCloseSrc from '../../demos/toast/06-manual-close.svelte?raw';
  import Update from '../../demos/toast/07-update.svelte';
  import updateSrc from '../../demos/toast/07-update.svelte?raw';
  import DestroyAll from '../../demos/toast/08-destroy-all.svelte';
  import destroyAllSrc from '../../demos/toast/08-destroy-all.svelte?raw';
  import UseToast from '../../demos/toast/09-use-toast.svelte';
  import useToastSrc from '../../demos/toast/09-use-toast.svelte?raw';
  import Factory from '../../demos/toast/10-factory.svelte';
  import factorySrc from '../../demos/toast/10-factory.svelte?raw';
  import Options from '../../demos/toast/11-options.svelte';
  import optionsSrc from '../../demos/toast/11-options.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Toast } from '@chenzy-design/svelte';
```

### 普通提示

通过调用 Toast 的相关 method 可以实现弹出提示。
推荐设置 stack 属性应用堆叠样式到同屏多个 Toast，Hover 展开，可有效防止一次性弹出多个并列 Toast 对用户造成干扰。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 其他提示类型

包括成功、失败、警告。

<DemoBox code={typesSrc}><Types /></DemoBox>

### 多色样式

可以使用 `theme` 设置浅色填充样式提高与界面的对比，默认为 'normal' 的白色模式。

<DemoBox code={themeSrc}><Theme /></DemoBox>

### 链接文本

配合 Typography 可以自定义链接文本，用来配合更复杂的场景的使用。

<DemoBox code={linkSrc}><Link /></DemoBox>

### 修改延时

自定义时长 10s，默认时长为 3s。

<DemoBox code={durationSrc}><Duration /></DemoBox>

### 手动关闭

当 `duration` 设置为 0 时，toast 不会自动关闭，此时必须通过手动关闭。

<DemoBox code={manualCloseSrc}><ManualClose /></DemoBox>

### 更新消息内容

可以通过唯一的 `id` 来更新内容。

<DemoBox code={updateSrc}><Update /></DemoBox>

### 销毁所有

全局销毁：

- `Toast.destroyAll()`

<DemoBox code={destroyAllSrc}><DestroyAll /></DemoBox>

### 消费 Context

通过 Toast.useToast 创建支持读取 context 的 contextHolder。此时的 toast 会渲染在 contextHolder 所在的节点处。

<DemoBox code={useToastSrc}><UseToast /></DemoBox>

### 创建不同配置 Toast

<Notice>常用于覆盖全局配置</Notice>

- `ToastFactory.create(config) => Toast`
  如果您的应用中需要使用不同 config 的 Toast，可以使用 ToastFactory.create(config) 创建新的 Toast：

<DemoBox code={factorySrc}><Factory /></DemoBox>

### 更多选项

`textMaxWidth` 限制内容区最大宽度、`showClose` 隐藏关闭按钮、`icon` 自定义图标。

<DemoBox code={optionsSrc}><Options /></DemoBox>

## API 参考

组件提供的静态方法，使用方式和参数如下：展示时可以直接传入 `options` 对象或 `string`。

**全局配置，在调用前提前配置，全局一次生效**

- `Toast.config(config)`

**直接展示 Toast**

- `Toast.info(options || string)`
- `Toast.error(options || string)`
- `Toast.warning(options || string)`
- `Toast.success(options || string)`
- `Toast.open(options || string)`

**`info` `error` `warning` `success` `open` 返回值为 `toastId`，可用于手动关闭**

`const toastId = Toast.info({ /*...options*/ })`

- `Toast.close(toastId)` 手动关闭

**全局销毁**

- `Toast.destroyAll()`

**消费 Context**

- `Toast.useToast()`
  当你需要使用 Context 时，可以通过 Toast.useToast 创建一个 contextHolder 插入相应的节点中。此时通过 hooks 创建的 Toast 将会得到 contextHolder 所在位置的所有上下文。创建的 toast 对象拥有以下方法：`info`、`success`、`warning`、`error`、`open`、`close`。

## Options

**Toast Options 支持以下 API 及 Config 中的 API**

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| content | 提示内容 | string \| Snippet | `''` | |
| icon | 自定义图标 | Snippet | - | - |
| showClose | 是否展示关闭按钮 | boolean | true | - |
| textMaxWidth | 内容的最大宽度 | number \| string | 450 | - |
| onClose | toast 关闭的回调函数 | () => void | - | |
| stack | 是否堆叠 Toast | boolean | false | |
| id | 自定义 ToastId | string | - | |

## Config

**以下 API 支持全局配置，用于更改当前 Toast 的默认配置**

| 属性 | 说明 | 类型 | 默认值 | 版本 |
| --- | --- | --- | --- | --- |
| bottom | 弹出位置 bottom | number \| string | - | - |
| left | 弹出位置 left | number \| string | - | - |
| right | 弹出位置 right | number \| string | - | - |
| top | 弹出位置 top | number \| string | - | - |
| zIndex | 弹层 z-index 值 | number | 1010 | |
| theme | 填充样式，支持 `light`、`normal` | string | `normal` | |
| duration | 自动关闭的延时，单位 s，设为 0 时不自动关闭 | number | 3 | |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义需要设置 container 和内部的 `.cd-toast-wrapper` `position: relative`，这会改变浮层 DOM 树位置，但不会改变视图渲染位置。 | () => HTMLElement \| null | () => document.body | - |

## Accessibility

### ARIA

- Toast 的 role 为 alert。

## 文案规范

- 保持简洁
- 句尾不使用句号
- 使用 名词 + 动词 的格式进行说明

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| Language added | New language has been added successfully |
| Ticket transfer failed | Can't transfer ticket |

- 提供动作的提示消息
  - 只提供一个动作
  - 不使用类似于「已读」类的动作，例如 OK, Got it, Dismiss, Cancel
