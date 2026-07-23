---
title: Modal 模态对话框
name: modal
category: feedback
brief: 模态对话框用于等待用户响应、告知用户重要信息或在不丢失上下文的情况下展示更多信息
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';
  import Basic from '../../demos/modal/01-basic.svelte';
  import basicRaw from '../../demos/modal/01-basic.svelte?raw';
  import FooterFill from '../../demos/modal/02-footer-fill.svelte';
  import footerFillRaw from '../../demos/modal/02-footer-fill.svelte?raw';
  import MaskClosable from '../../demos/modal/03-mask-closable.svelte';
  import maskClosableRaw from '../../demos/modal/03-mask-closable.svelte?raw';
  import CustomText from '../../demos/modal/04-custom-text.svelte';
  import customTextRaw from '../../demos/modal/04-custom-text.svelte?raw';
  import ButtonProps from '../../demos/modal/05-button-props.svelte';
  import buttonPropsRaw from '../../demos/modal/05-button-props.svelte?raw';
  import CustomHeaderFooter from '../../demos/modal/06-custom-header-footer.svelte';
  import customHeaderFooterRaw from '../../demos/modal/06-custom-header-footer.svelte?raw';
  import CustomStyle from '../../demos/modal/07-custom-style.svelte';
  import customStyleRaw from '../../demos/modal/07-custom-style.svelte?raw';
  import FullyCustom from '../../demos/modal/08-fully-custom.svelte';
  import fullyCustomRaw from '../../demos/modal/08-fully-custom.svelte?raw';
  import Fullscreen from '../../demos/modal/09-fullscreen.svelte';
  import fullscreenRaw from '../../demos/modal/09-fullscreen.svelte?raw';
  import Imperative from '../../demos/modal/10-imperative.svelte';
  import imperativeRaw from '../../demos/modal/10-imperative.svelte?raw';
  import Hooks from '../../demos/modal/11-hooks.svelte';
  import hooksRaw from '../../demos/modal/11-hooks.svelte?raw';
  import Draggable from '../../demos/modal/12-draggable.svelte';
  import draggableRaw from '../../demos/modal/12-draggable.svelte?raw';
</script>

## 代码演示

### 如何引入

```ts
import { Modal } from '@chenzy-design/svelte';
```

### 基本

<DemoBox code={basicRaw}><Basic /></DemoBox>

### 底部撑满

设置 footerFill 为 true 可使 Modal footer 底部按钮撑满排列

<DemoBox code={footerFillRaw}><FooterFill /></DemoBox>

### 点击遮罩层不可关闭

修改 `maskClosable` 为 `false` 则不可通过点击遮罩层来关闭对话框。

<DemoBox code={maskClosableRaw}><MaskClosable /></DemoBox>

### 自定义按钮文字

通过设置 `okText` 与 `cancelText` 属性可自定义按钮显示的文字。

注意：命令式调用的 Modal 需要通过这两个属性来设置 i18n 的文本，因为全局命令式调用挂载在 body 上、脱离组件树，无法消费到 LocaleProvider 相关的 context（需要继承 context 时用 Modal.useModal，见下方「Hooks 用法」）

<DemoBox code={customTextRaw}><CustomText /></DemoBox>

### 自定义按钮属性

通过设置 `okButtonProps` 与 `cancelButtonProps` 属性可自定义按钮的属性。

<DemoBox code={buttonPropsRaw}><ButtonProps /></DemoBox>

### 自定义对话框头部和页脚

如果需要实现更丰富的个性化需求，可以通过 `header` 自定义头部，`footer` 自定义页脚的按钮。把 `header` 设为 `null` 时则不展示头部区域；不需要显示任何按钮时，同样可以把 `footer` 设为 `null`。

<DemoBox code={customHeaderFooterRaw}><CustomHeaderFooter /></DemoBox>

### 自定义对话框的样式

通过设置 `style` 可以自定义样式及位置如 `style.top`，也可以通过 `centered` 使对话框居中显示。也可以通过设置 `maskStyle` 自定义遮罩样式，及 `bodyStyle` 自定义对话框内容样式。

<DemoBox code={customStyleRaw}><CustomStyle /></DemoBox>

### 自定义的对话框

通过灵活使用使用 `header`，`footer` 等属性可以实现一个完全自定义的对话框。

<DemoBox code={fullyCustomRaw}><FullyCustom /></DemoBox>

### 全屏 Modal

使用 `fullScreen={true}` 可以开启全屏对话框

<DemoBox code={fullscreenRaw}><Fullscreen /></DemoBox>

### 命令式调用

使用 `confirm()` 可以设置一个确认框。支持各种类型的信息提示。命令式调用也可以自定义 icon，支持 svg 字符串类型。其他 Modal 支持的 props 都可以传入。

<DemoBox code={imperativeRaw}><Imperative /></DemoBox>

### Hooks 用法

通过 Modal.useModal 创建支持读取 context 的 contextHolder。

<DemoBox code={hooksRaw}><Hooks /></DemoBox>

### 可拖拽 Modal

通过 `modalRender` 自定义渲染 Modal 内容，可拖拽 Modal 通过 DragMove 组件实现。

<DemoBox code={draggableRaw}><Draggable /></DemoBox>

## API 参考

### Modal

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| afterClose | 对话框完全关闭后的回调函数 | `() => void` | 无 |
| ariaLabel | 无 title 时对话框的无障碍名称（本库补充） | string | 无 |
| bodyStyle | 对话框内容的样式 | string | 无 |
| cancelButtonProps | 取消按钮的 props | [ButtonProps](/components/button#API-参考) | 无 |
| cancelText | 取消按钮的文字 | string | 无 |
| centered | 是否居中显示 | boolean | false |
| children | 对话框内容（对齐 Semi content） | Snippet | 无 |
| class | 可用于设置样式类名 | string | 无 |
| closable | 是否显示右上角的关闭按钮 | boolean | true |
| closeIcon | 关闭按钮的 icon | Snippet | `<IconClose />` |
| closeOnEsc | 允许通过键盘事件 Esc 触发关闭 | boolean | true |
| confirmLoading | 确认按钮 loading | boolean | false |
| footer | 对话框底部（Snippet，接收 `{ ok, cancel }` 两个关闭函数；设为 null 不展示） | `Snippet<[{ ok; cancel }]>`\|`null` | 无 |
| fullScreen | 对话是否是全屏（会覆盖 width height） | boolean | false |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义需要设置 `position: relative` 这会改变浮层 DOM 树位置，但不会改变视图渲染位置。 | `() => HTMLElement` | `() => document.body` |
| hasCancel | 是否显示取消按钮 | boolean | true |
| header | 对话框头部（Snippet；设为 null 不展示） | `Snippet`\|`null` | 无 |
| height | 高度 | number\|string | 无 |
| icon | 自定义 icon | Snippet | - |
| keepDOM | 关闭对话框时是否保留内部组件不销毁 | boolean | false |
| lazyRender | 配合 keepDOM 使用，为 true 时挂载时不会渲染对话框组件 | boolean | true |
| mask | 是否显示遮罩 | boolean | true |
| maskClosable | 是否允许通过点击遮罩来关闭对话框 | boolean | true |
| maskFixed | 遮罩是否 position:fixed；false 时 absolute，配合 getPopupContainer 局部弹层（本库补充） | boolean | true |
| maskStyle | 遮罩的样式 | string | 无 |
| modalContentClass | 可用于设置对话框内容的样式类名 | string | 无 |
| modalRender | 自定义渲染 Modal（Snippet，接收默认 content Snippet） | `Snippet<[Snippet]>` | - |
| motion | 动画效果开关 | boolean | true |
| okButtonProps | 确认按钮的 props | [ButtonProps](/components/button#API-参考) | 无 |
| okText | 确认按钮的文字 | string | 无 |
| okType | 确认按钮的类型, 可选: 'primary'、'secondary'、'tertiary'、'warning'、'danger' | string | primary |
| onCancel | 取消对话框时的回调函数，返回 Promise 时，取消按钮会出现 loading 态 | `() => void`\|`Promise` | 无 |
| onOk | 点击确认按钮时的回调函数，返回 Promise 时，确认按钮会出现 loading 态 | `() => void`\|`Promise` | 无 |
| onVisibleChange | 显隐变化通知，便于非受控回写（本库补充） | `(visible: boolean) => void` | 无 |
| preventScroll | 指示浏览器是否应滚动文档以显示新聚焦的元素，作用于组件内的 focus 方法，不包含用户传入的组件 | boolean | false |
| size | 对话框宽度尺寸，支持 `small`(448px)，`medium`(684px)，`large`(920px)，`full-width`(100vw - 64px) | string | 'small' |
| style | 可用于设置样式 | string | 无 |
| title | 对话框的标题 | string\|Snippet | 无 |
| visible | 对话框是否可见（受控；受控时不回写） | boolean | false |
| width | 宽度 | number\|string | 448 |
| zIndex | 遮罩的 z-index 值（缺省由堆叠计数器分配） | number | 1000 |

### Modal.method()

- `Modal.info`
- `Modal.success`
- `Modal.error`
- `Modal.warning`
- `Modal.confirm`

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| bodyStyle | 对话框内容的样式 | string | 无 |
| cancelButtonProps | 取消按钮的 props | [ButtonProps](/components/button#API-参考) | 无 |
| cancelText | 取消按钮的文字 | string | 无 |
| centered | 是否居中显示 | boolean | false |
| class | 可用于设置样式类名 | string | 无 |
| closable | 是否显示右上角的关闭按钮 | boolean | true |
| confirmLoading | 确认按钮 loading | boolean | 无 |
| content | 对话框内容 | string | 无 |
| footerFill | 底部按钮是否撑满 | boolean | false |
| hasCancel | 是否显示取消按钮（confirm 默认 true，其余默认 false） | boolean | - |
| height | 高度 | number\|string | 无 |
| icon | 自定义 icon（svg 字符串） | string | - |
| mask | 是否显示遮罩 | boolean | true |
| maskClosable | 是否允许通过点击遮罩来关闭对话框 | boolean | true |
| maskStyle | 遮罩的样式 | string | 无 |
| modalContentClass | 可用于设置对话框内容的样式类名 | string | 无 |
| okButtonProps | 确认按钮的 props | [ButtonProps](/components/button#API-参考) | 无 |
| okText | 确认按钮的文字 | string | 无 |
| okType | 确认按钮的类型 | string | primary |
| style | 可用于设置样式 | string | 无 |
| title | 对话框的标题 | string | 无 |
| width | 宽度 | number\|string | 448 |
| zIndex | 遮罩的 z-index 值 | number | 1000 |
| onCancel | 取消回调，返回 promise 时取消按钮 loading，resolve 后自动关闭、reject 保持打开 | `() => void`\|`Promise` | 无 |
| onOk | 点击确定回调，返回 promise 时确认按钮 loading，resolve 后自动关闭、reject 保持打开 | `() => void`\|`Promise` | 无 |

与 Semi 的差异：`footer` / `header` / `modalRender` 为 Snippet，无法在 `.ts` 命令式配置中传入（Svelte snippet 只能在组件模板内定义）；需要完全自定义头部/底部时请使用声明式 `<Modal>` 组件。

以上函数调用后，会返回一个引用，可以通过该引用更新和关闭弹窗。

```ts
const modal = Modal.info({ title: '标题', content: '内容' });

modal.update({
  title: '更新的标题',
  content: '更新的内容',
});

modal.destroy();
```

- `Modal.destroyAll`

使用 Modal.destroyAll() 可以销毁命令式即以上 `.info()` 等创建的弹窗。

- `Modal.useModal`

当你需要使用 Context 时，可以通过 Modal.useModal 创建 `[modal, holder]`，把 `<ModalContextHolder items={holder.items} />` 插入相应的节点中。此时通过 hooks 创建的 Modal 将会得到 contextHolder 所在位置的所有上下文（如 LocaleProvider / ConfigProvider 的配置）。创建的 modal 对象拥有与 [Modal.method](#modalmethod) 相同的创建方法。

## Accessibility

### ARIA

WAI-ARIA: https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/

- role 设置为 `dialog`
- aria-modal 设置为 true
- aria-labelledby 对应 Modal header
- aria-describedby 对应 Modal body

### 键盘和焦点

- Modal 在弹出时自动获得焦点，关闭时焦点自动回归到打开前元素。
- 键盘用户可以使用 `Tab` 键和 `Shift + Tab`，将焦点在 Modal 内移动，包括 Modal 自带的关闭按钮和确定取消按钮，此时 Modal 背后元素不可被 tab 聚焦。
- 可通过在 okButtonProps 或 cancelButtonProps 传入 autofocus 来控制 Modal 打开时聚焦到对应按钮。
- 可通过在 Modal 内容中需要聚焦的表单元素上添加 autofocus 来让 Modal 打开时自动聚焦到该元素。
- closeOnEsc 默认值为 true，允许用户通过键盘直接关闭 Modal 带来更好的体验

## 文案规范

- 命令式 Modal 与 默认 Modal 两种模态对话框的标题使用 动词 + 名词 的格式，无论是陈述句还是问句

| ✅ 推荐用法 | ❌ 不推荐用法 |
| ------------- | ------------------------------------- |
| Edit ticket | Edit |
| Delete form？ | Are you sure you want to delete form? |

- 两种模态对话框的操作按钮在保证标题描述清楚的前提下，只需要使用标题内的动词即可

| ✅ 推荐用法 | ❌ 不推荐用法 |
| ----------- | ------------- |
| Edit | Edit ticket |

- 命令式 Modal 的正文规范
  - 对标题进行具体的解释说明，不要重复标题的信息
  - 确保用户知道在必要时如何采取行动

## FAQ

- #### 为什么使用 LocaleProvider 后，Modal.confirm 确认、取消按钮的文本没有国际化？

  全局命令式调用（`Modal.confirm` 等）把弹层节点直接挂载到 body 上，脱离组件树，无法消费到 LocaleProvider 基于 context 传递的配置，因此内置文本无法自动适配国际化。
  你可以通过 `okText` 和 `cancelText` 这两个属性来根据 Locale 重新设置 i18n 的文本。
  你也可以通过 Modal.useModal 方法来返回 modal 实体以及 holder。将 `<ModalContextHolder items={holder.items} />` 插入到你需要获取 context 的位置，即可使 Modal 获取到对应的 Context，如 ConfigProvider 或者 LocaleProvider 的配置。

- #### 为什么 title 和 content 的间距在命令式调用和非命令式调用下不同?

  命令式调用场景下，标题和内容的相关性更强，所以用更近的距离表达这种强相关性，符合预期。用户如果不想要这种效果，可以自己做样式覆盖。
