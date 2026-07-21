---
title: Button 按钮
name: button
category: basic
brief: 用户使用按钮来触发一个操作或者进行跳转。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Type from '../../demos/button/01-type.svelte';
  import typeSrc from '../../demos/button/01-type.svelte?raw';
  import TypeColors from '../../demos/button/01b-type-colors.svelte';
  import typeColorsSrc from '../../demos/button/01b-type-colors.svelte?raw';
  import ThemeLight from '../../demos/button/02a-theme-light.svelte';
  import themeLightSrc from '../../demos/button/02a-theme-light.svelte?raw';
  import ThemeSolid from '../../demos/button/02b-theme-solid.svelte';
  import themeSolidSrc from '../../demos/button/02b-theme-solid.svelte?raw';
  import ThemeBorderless from '../../demos/button/02c-theme-borderless.svelte';
  import themeBorderlessSrc from '../../demos/button/02c-theme-borderless.svelte?raw';
  import ThemeOutline from '../../demos/button/02d-theme-outline.svelte';
  import themeOutlineSrc from '../../demos/button/02d-theme-outline.svelte?raw';
  import Size from '../../demos/button/03-size.svelte';
  import sizeSrc from '../../demos/button/03-size.svelte?raw';
  import Block from '../../demos/button/04-block.svelte';
  import blockSrc from '../../demos/button/04-block.svelte?raw';
  import Icon from '../../demos/button/05-icon.svelte';
  import iconSrc from '../../demos/button/05-icon.svelte?raw';
  import Link from '../../demos/button/06-link.svelte';
  import linkSrc from '../../demos/button/06-link.svelte?raw';
  import Disabled from '../../demos/button/07-disabled.svelte';
  import disabledSrc from '../../demos/button/07-disabled.svelte?raw';
  import Loading from '../../demos/button/08-loading.svelte';
  import loadingSrc from '../../demos/button/08-loading.svelte?raw';
  import Colorful from '../../demos/button/09-colorful.svelte';
  import colorfulSrc from '../../demos/button/09-colorful.svelte?raw';
  import Group from '../../demos/button/10-group.svelte';
  import groupSrc from '../../demos/button/10-group.svelte?raw';
  import GroupDisabled from '../../demos/button/10b-group-disabled.svelte';
  import groupDisabledSrc from '../../demos/button/10b-group-disabled.svelte?raw';
  import GroupType from '../../demos/button/10c-group-type.svelte';
  import groupTypeSrc from '../../demos/button/10c-group-type.svelte?raw';
  import Split from '../../demos/button/11-split.svelte';
  import splitSrc from '../../demos/button/11-split.svelte?raw';
</script>

用户使用按钮来触发一个操作或者进行跳转。

## 代码演示

### 如何引入

```jsx
import { Button, ButtonGroup, SplitButtonGroup } from '@chenzy-design/svelte';
```

### 按钮类型

按钮支持以下类型：

- 主按钮（`primary`，默认）
- 次要按钮（`secondary`）
- 第三按钮（`tertiary`）
- 警告按钮（`warning`）
- 危险按钮（`danger`）

<DemoBox code={typeSrc}><Type /></DemoBox>

#### 关于类型字体色值

按钮的字体色值使用的都是 [CSS Variables](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)，分别为：

- `var(--cd-color-primary)`：主要
- `var(--cd-color-secondary)`：次要
- `var(--cd-color-tertiary)`：第三
- `var(--cd-color-warning)`：警告
- `var(--cd-color-danger)`：危险

你可以直接使用这些主题色定义你的元素。

<DemoBox code={typeColorsSrc}><TypeColors /></DemoBox>

### 按钮主题

目前可用的主题（theme）为：

- `light`：浅色背景
- `solid`：深色背景
- `borderless`：无背景
- `outline`：边框模式

默认的主题为 `light`。

#### 浅色背景

<DemoBox code={themeLightSrc}><ThemeLight /></DemoBox>

#### 深色背景

<DemoBox code={themeSolidSrc}><ThemeSolid /></DemoBox>

#### 无背景

<DemoBox code={themeBorderlessSrc}><ThemeBorderless /></DemoBox>

#### 边框模式

<DemoBox code={themeOutlineSrc}><ThemeOutline /></DemoBox>

### 尺寸

默认定义了三种尺寸：

- 大：`large`
- 默认：`default`
- 小：`small`

<DemoBox code={sizeSrc}><Size /></DemoBox>

### 块级按钮

块级按钮具有预先定义好的宽度，它的宽度与按钮里面内容的宽度无关。

<DemoBox code={blockSrc}><Block /></DemoBox>

### 图标按钮

可定义按钮的图标。图标通过 `icon` snippet 传入，`iconPosition` 控制图标相对文字的位置。纯图标按钮（无文字）自动收成方形，需提供 `ariaLabel`。

<DemoBox code={iconSrc}><Icon /></DemoBox>

### 链接按钮

我们推荐使用 Typography 的 `link` 属性来实现链接型的文字按钮，具体用法详见 [Typography](/components/typography)。

<DemoBox code={linkSrc}><Link /></DemoBox>

### 禁用状态

<DemoBox code={disabledSrc}><Disabled /></DemoBox>

### 加载状态

按钮支持加载状态，通过设置 `loading` 参数值为 `true` 即可，注意：`disabled` 状态优先级高于 `loading` 状态。

<DemoBox code={loadingSrc}><Loading /></DemoBox>

### AI 风格 - 多彩按钮

设置 `colorful` 即可获得多彩按钮，多彩按钮支持所有的 `theme`，`type` 仅支持 `primary` 及 `tertiary`。

<DemoBox code={colorfulSrc}><Colorful /></DemoBox>

### 按钮组合

可以将多个按钮放入 `ButtonGroup` 的容器中，通过设置 `size`、`disabled`、`type` 可统一设置按钮组合中的按钮尺寸、是否禁用和类型。

#### 组合尺寸

<DemoBox code={groupSrc}><Group /></DemoBox>

#### 组合禁用

<DemoBox code={groupDisabledSrc}><GroupDisabled /></DemoBox>

#### 组合类型

<DemoBox code={groupTypeSrc}><GroupType /></DemoBox>

### 分裂按钮组合

在 `Button` 和 `Dropdown` 结合的场景下，可以使用分裂按钮，分裂按钮添加了按钮之间的间隔，并改变了按钮的边框圆角。

#### 基础使用

<DemoBox code={splitSrc}><Split /></DemoBox>

## API 参考

### Button

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| ariaLabel | 按钮的无障碍标签（对齐 Semi `aria-label`）；纯图标按钮必填 | string | - |
| block | 将按钮设置为块级按钮 | boolean | false |
| circle | 圆形按钮（`border-radius: 50%`），配合 icon-only 呈正圆 | boolean | false |
| class | 根元素自定义类名 | string | - |
| colorful | 多彩按钮，`type` 仅 `primary` / `tertiary` 生效 | boolean | false |
| contentClassName | 内容区域（`.cd-button-content`）自定义类名 | string | - |
| disabled | 禁用状态 | boolean | false |
| htmlType | 设置 `button` 原生的 `type` 值，可选值：`button`、`reset`、`submit` | string | 'button' |
| icon | 图标 | Snippet | - |
| iconPosition | 图标位置，可选值：`left` \| `right` | string | 'left' |
| loading | 加载状态 | boolean | false |
| noHorizontalPadding | 设置水平方向是否去掉内边距，只对设置了 icon 的 Button 有效。可选值：`true`（等效于 `['left', 'right']`）、`'left'`、`'right'`、`['left', 'right']` | boolean \| string \| Array | false |
| size | 按钮大小，可选值：`large`、`default`、`small` | string | 'default' |
| style | 自定义样式 | string | - |
| theme | 按钮主题，可选值：`solid`（有背景色）、`borderless`（无背景色）、`light`（浅背景色）、`outline`（边框模式） | string | 'light' |
| type | 类型，可选值：`primary`、`secondary`、`tertiary`、`warning`、`danger` | string | 'primary' |
| onclick | 单击事件 | `(e: MouseEvent) => void` | - |
| onmousedown | 鼠标按下事件 | `(e: MouseEvent) => void` | - |
| onmouseenter | 鼠标移入事件 | `(e: MouseEvent) => void` | - |
| onmouseleave | 鼠标移出事件 | `(e: MouseEvent) => void` | - |

> 事件 prop 使用原生小写命名（`onclick` 而非 `onClick`）；无障碍名用 `ariaLabel`（camelCase）而非 `aria-label` 属性。其余原生属性（`data-*`、`name`、`value`、`form`、`title`、`tabindex` 等）透传到根 `button`。

### ButtonGroup

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| ariaLabel | 按钮组的无障碍标签 | string | - |
| class | 自定义类名 | string | - |
| colorful | 多彩按钮，透传给组内 Button | boolean | false |
| disabled | 禁用状态 | boolean | false |
| size | 按钮大小，可选值：`large`、`default`、`small` | string | 'default' |
| style | 自定义样式 | string | - |
| theme | 按钮主题，可选值：`solid`、`borderless`、`light`、`outline` | string | 'light' |
| type | 类型，可选值：`primary`、`secondary`、`tertiary`、`warning`、`danger` | string | 'primary' |

> 组级 `size` / `type` / `theme` / `disabled` / `colorful` 经 context 透传为组内 Button 的默认值；组内单个 Button 显式设置对应 prop 时始终优先。

### SplitButtonGroup

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| ariaLabel | 分裂按钮组的无障碍标签 | string | - |
| class | 自定义类名 | string | - |
| style | 自定义样式 | string | - |

## 无障碍

### ARIA

- `ariaLabel` 用于表示按钮的作用，对于图标按钮，我们推荐使用此属性。
- `aria-disabled` 与 `disabled` 属性同步，表示按钮禁用。
- 加载状态下 `aria-busy="true"`。

### 键盘和焦点

- Button 的焦点管理与原生 `button` 一致，键盘用户可以使用 Tab 及 Shift + Tab 切换焦点。
- Button 的触发与原生 `button` 一致，当按钮聚焦时，可以通过 Enter 或 Space 键激活。
- ButtonGroup 中的按钮与单个按钮的焦点管理方式一致，可以通过 Tab 以及 Shift + Tab 进行切换。

## 文案规范

- 按钮需要清晰可预测，用户应该能够预测他们点击按钮时会发生什么。
- 按钮应该总是以鼓励行动的强动词开头。
- 为了给用户提供足够的上下文，在按钮上使用 `{动词}+{名词}` 内容公式；除了常见的动作，如「完成」「关闭」「取消」或「确定」。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 申请权限 | 申请 |

- 当按钮和其他组件一起时候，如果其他组件（比如 Modal 和 SideSheet）已经提供了足够信息的上下文的话，按钮可以只展示 `{动词}`，如「添加」「新建」。
- 始终按句子大小写（Sentence case）原则书写。

| ✅ 推荐用法 | ❌ 不推荐用法 |
| --- | --- |
| 新建项目 | 新建<br/>新建一个项目 |
| 编辑资料 | 编辑 |

## FAQ

- **为什么 Button 中的 icon 属性不起作用？**
  请检查你的 Button import 路径，正确的引入应为 `import { Button } from '@chenzy-design/svelte';`。同时注意 `icon` 接收的是 snippet（`{#snippet ...}` 或 `icon={someSnippet}`），而非普通字符串或元素。

- **loading 和 disabled 同时设置时以哪个为准？**
  `disabled` 优先级更高：同时为 `true` 时按钮不可点击且不展示加载态。提交类操作建议只在请求期间设 `loading`。
