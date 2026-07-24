---
title: Steps 步骤条
name: steps
category: navigation
brief: 将复杂任务或存在先后关系的任务分解，使用步骤组件引导用户按规定流程操作，并让其知道其当前的进度。
docMode: inline
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';

  import Fill from '../../demos/steps/01-fill.svelte';
  import fillSrc from '../../demos/steps/01-fill.svelte?raw';
  import Basic from '../../demos/steps/02-basic.svelte';
  import basicSrc from '../../demos/steps/02-basic.svelte?raw';
  import Nav from '../../demos/steps/03-nav.svelte';
  import navSrc from '../../demos/steps/03-nav.svelte?raw';
  import Small from '../../demos/steps/04-small.svelte';
  import smallSrc from '../../demos/steps/04-small.svelte?raw';
  import Process from '../../demos/steps/05-process.svelte';
  import processSrc from '../../demos/steps/05-process.svelte?raw';
  import Vertical from '../../demos/steps/06-vertical.svelte';
  import verticalSrc from '../../demos/steps/06-vertical.svelte?raw';
  import Status from '../../demos/steps/07-status.svelte';
  import statusSrc from '../../demos/steps/07-status.svelte?raw';
  import CustomIcon from '../../demos/steps/08-custom-icon.svelte';
  import customIconSrc from '../../demos/steps/08-custom-icon.svelte?raw';
  import OnChange from '../../demos/steps/09-onchange.svelte';
  import onChangeSrc from '../../demos/steps/09-onchange.svelte?raw';
</script>

## 代码演示

### 如何引入

```jsx
import { Steps } from '@chenzy-design/svelte';
```

### 默认步骤条（旧版）

建议使用简易版 steps（新版），旧版后续会逐渐 deprecate。

<DemoBox code={fillSrc}><Fill /></DemoBox>

### 简单步骤条（新版）

通过设置 `type="basic"` 显示为简洁风格步骤条。

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 导航步骤条

通过设置 `type="nav"` 显示为导航风格步骤条。导航风格的步骤条有以下特点：

1. 步骤条不支持交互。
2. 适用于步骤间互相关联较小、内容互不影响，且需要突出页面视觉元素时使用。
3. 步骤条的宽度按照内容物撑开。
4. Steps.Step 仅支持 title、class、style 属性。

<DemoBox code={navSrc}><Nav /></DemoBox>

### 迷你尺寸步骤条

通过设置 `size="small"` 显示迷你尺寸步骤条。

<DemoBox code={smallSrc}><Small /></DemoBox>

### 处理进度

配合内容及按钮使用，表示一个流程的处理进度。

<DemoBox code={processSrc}><Process /></DemoBox>

### 竖直方向的步骤条

通过设置 `direction`，使用竖直方向的步骤条。

<DemoBox code={verticalSrc}><Vertical /></DemoBox>

### 指定步骤状态

步骤运行错误，使用 Steps 的 `status` 属性来指定当前步骤的状态。

<DemoBox code={statusSrc}><Status /></DemoBox>

### 自定义图标/状态

通过设置 Steps.Step 的 `icon` 属性，可以启用自定义图标；通过设置 Steps.Step 的 `status` 属性，可以自定义每个 step 的状态。

<DemoBox code={customIconSrc}><CustomIcon /></DemoBox>

### onChange 回调

`onChange` 接收一个 number 类型的参数，该参数等于 `initial + current`，可以使用它来实现处理进度。

<DemoBox code={onChangeSrc}><OnChange /></DemoBox>

## API 参考

### Steps

整体步骤条。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| class | 类名 | string | - |
| current | 指定当前步骤，从 0 开始记数。在子 Step 元素中，可以通过 `status` 属性覆盖状态 | number | 0 |
| direction | 指定步骤条方向，支持水平（`horizontal`）和竖直（`vertical`） | string | horizontal |
| hasLine | 步骤条类型为 basic 时，可控制是否显示连接线 | boolean | true |
| initial | 起始序号，从 0 开始记数 | number | 0 |
| status | 指定当前步骤的状态，可选 `wait`、`process`、`finish`、`error`、`warning` | string | process |
| size | 对于简单步骤条和导航步骤条，可选尺寸，值为 `small`、`default` | string | `default` |
| style | 样式 | string | - |
| type | 步骤条类型，可选 `fill`、`basic`、`nav` | string | fill |
| onChange | 改变步骤条的回调 | `(index: number) => void` | - |

### Steps.Step

步骤条内的每一个步骤。

| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| ariaLabel | 容器 aria-label | string | - |
| class | 类名 | string | - |
| description | 步骤的详情描述，可选 | string \| Snippet | - |
| icon | 步骤图标的类型，可选 | string \| Snippet | - |
| role | 容器 role | string | - |
| status | 指定状态。不配置时会使用 Steps 的 `current` 自动指定状态。可选：`wait`、`process`、`finish`、`error`、`warning` | string | wait |
| style | 样式 | string | - |
| title | 标题 | string \| Snippet | - |
| onClick | 点击回调 | function | - |
| onKeyDown | 回车事件回调 | function | - |

## 无障碍

### ARIA

- Steps、Step 组件支持传入 `aria-label` 属性，来表示 Steps 和 Step 的描述。
- Step 组件具有 `aria-current="step"` 属性，表示这是步骤条内的一步。

## 文案规范

- 步骤标题
  - 标题应保持简洁，避免截断和换行。
  - 使用句子大小写书写。
  - 不要包含标点符号。
- 描述
  - 为标题补充上下文信息。
  - 不要以标点符号结尾。
