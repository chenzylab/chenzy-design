---
title: UserGuide 用户引导
name: userguide
category: show
brief: 用于页面对新用户进行功能引导
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/user-guide/01-basic.svelte';
  import basicSrc from '../../demos/user-guide/01-basic.svelte?raw';
  import Theme from '../../demos/user-guide/02-theme.svelte';
  import themeSrc from '../../demos/user-guide/02-theme.svelte?raw';
  import Position from '../../demos/user-guide/03-position.svelte';
  import positionSrc from '../../demos/user-guide/03-position.svelte?raw';
  import Padding from '../../demos/user-guide/04-padding.svelte';
  import paddingSrc from '../../demos/user-guide/04-padding.svelte?raw';
  import CustomButton from '../../demos/user-guide/05-custom-button.svelte';
  import customButtonSrc from '../../demos/user-guide/05-custom-button.svelte?raw';
  import Controlled from '../../demos/user-guide/06-controlled.svelte';
  import controlledSrc from '../../demos/user-guide/06-controlled.svelte?raw';
  import ModalDemo from '../../demos/user-guide/07-modal.svelte';
  import modalSrc from '../../demos/user-guide/07-modal.svelte?raw';
  import NoMask from '../../demos/user-guide/08-no-mask.svelte';
  import noMaskSrc from '../../demos/user-guide/08-no-mask.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { UserGuide } from '@chenzy-design/svelte';
```

### 基本用法

步骤的 `target` 是目标元素，高亮区域会聚焦到这个元素上。React 中直接传 `document.querySelector(...)`；本库用 `bind:this` 拿到元素引用后以函数形式传入（`target: () => el`），保证挂载后取值。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 主题

`popup` 气泡卡片模式下提供两种主题 `default` 和 `primary`，通过 `theme` 属性设置。

<DemoBox code={themeSrc}><Theme /></DemoBox>

### 气泡卡片弹出位置

`popup` 气泡卡片模式下提供 12 种弹出位置，可选值有 `top`, `topLeft`, `topRight`, `left`, `leftTop`, `leftBottom`, `right`, `rightTop`, `rightBottom`, `bottom`, `bottomLeft`, `bottomRight`，还可以通过 `showArrow` 属性设置是否显示箭头。

<DemoBox code={positionSrc}><Position /></DemoBox>

### 设置高亮区域大小

通过 `spotlightPadding` 属性设置。

<DemoBox code={paddingSrc}><Padding /></DemoBox>

### 定制按钮

通过 `nextButtonProps` 和 `prevButtonProps` 属性设置按钮的样式。

<DemoBox code={customButtonSrc}><CustomButton /></DemoBox>

### 受控

通过 `current` 属性设置当前引导步骤。

<DemoBox code={controlledSrc}><Controlled /></DemoBox>

### 弹窗式引导

通过 `mode` 属性设置为 `modal` 开启弹窗式引导。

<DemoBox code={modalSrc}><ModalDemo /></DemoBox>

### 无遮罩

通过 `mask` 属性设置为 `false` 开启无遮罩引导。

<DemoBox code={noMaskSrc}><NoMask /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 自定义类名（对齐 Semi className） | string | - |
| current | 当前步骤的索引；提供即受控（内部不改，需配合 onChange 回写） | number | 0 |
| finishText | 最后一步完成按钮的文本 | string | '完成' |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中；提供时不锁 body 滚动 | `() => HTMLElement` | - |
| mask | 是否显示蒙层 | boolean | true |
| mode | 引导模式，可选值：`popup`（气泡卡片）或 `modal`（弹窗式） | string | popup |
| nextButtonProps | 下一步按钮的属性 | ButtonProps | `{}` |
| onChange | 步骤改变时的回调 | `(current: number) => void` | - |
| onFinish | 完成所有步骤时的回调（不自动关闭，使用方置 `visible={false}`） | `() => void` | - |
| onNext | 点击下一步按钮时的回调 | `(current: number) => void` | - |
| onPrev | 点击上一步按钮时的回调 | `(current: number) => void` | - |
| onSkip | 点击跳过按钮时的回调（不自动关闭，使用方置 `visible={false}`） | `() => void` | - |
| position | 弹出层相对于目标元素的位置，可选值：`top`, `topLeft`, `topRight`, `left`, `leftTop`, `leftBottom`, `right`, `rightTop`, `rightBottom`, `bottom`, `bottomLeft`, `bottomRight` | string | bottom |
| prevButtonProps | 上一步按钮的属性 | ButtonProps | `{}` |
| showPrevButton | 是否显示上一步按钮（首步自动隐藏） | boolean | true |
| showSkipButton | 是否显示跳过按钮（末步自动隐藏） | boolean | true |
| spotlightPadding | 高亮区域的内边距，单位为像素 | number | 5 |
| steps | 引导步骤配置，必填 | StepItem[] | `[]` |
| style | 自定义样式（气泡 popover 内联样式） | string | - |
| theme | 主题样式，可选值：`default` 或 `primary` | string | default |
| visible | 是否显示引导；false→true 时重置到第 0 步 | boolean | false |
| zIndex | 弹层层级 | number | 1030 |

### Steps.Step

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| className | 步骤的自定义类名 | string | - |
| cover | 步骤的封面图（Snippet；modal 有 cover 才渲染圆点指示器） | `Snippet` \| string | - |
| target | 目标元素，高亮区域会聚焦到这个元素上（popup 必需，无则该步不渲染；modal 忽略） | `(() => Element)` \| Element | - |
| title | 步骤标题 | string \| `Snippet` | - |
| description | 步骤描述 | string \| `Snippet` | - |
| mask | 是否显示此步骤的蒙层，会覆盖全局配置 | boolean | - |
| showArrow | 是否显示箭头（仅在 mode=`popup` 时有效） | boolean | true |
| spotlightPadding | 此步骤高亮区域区域的内边距，会覆盖全局配置 | number | - |
| theme | 此步骤的主题，会覆盖全局配置 | `default` \| `primary` | - |
| position | 此步骤弹出层的位置，会覆盖全局配置 | Position | - |

## Accessibility

严格对齐 Semi 的引导实现：

- **气泡对话框语义**：popup 复用 Popover（`trigger="custom"`），浮层以对话框语义暴露，定位锚点承载视觉隐藏的可访问名（step.title）。
- **聚光挖孔可交互**：spotlight 高亮区通过四块透明矩形让出指针事件，用户仍可点击被高亮的目标元素（「点这里」场景）。
- **步进控制**：上一步 / 下一步 / 跳过 / 完成均为标准 Button，可键盘聚焦与激活。
- **reduced-motion**：`prefers-reduced-motion` 下移除 spotlight 移动过渡。

## FAQ

- **点完成 / 跳过后引导没有关闭？** 对齐 Semi：`onFinish` / `onSkip` 不会自动关闭引导，需要在回调里把 `visible` 置为 `false`。
- **popup 某一步没有渲染？** popup 模式下步骤必须提供 `target`（元素或返回元素的函数），无 target 的步骤不渲染气泡与 spotlight。
