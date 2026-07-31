---
title: ConfigProvider 全局配置
name: configprovider
category: other
brief: 为组件提供统一的全局化配置。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import TimeZone from '../../demos/config-provider/01-timezone.svelte';
  import timeZoneSrc from '../../demos/config-provider/01-timezone.svelte?raw';
  import Consumer from '../../demos/config-provider/02-consumer.svelte';
  import consumerSrc from '../../demos/config-provider/02-consumer.svelte?raw';
  import Responsive from '../../demos/config-provider/03-responsive.svelte';
  import responsiveSrc from '../../demos/config-provider/03-responsive.svelte?raw';
  import Direction from '../../demos/config-provider/04-direction.svelte';
  import directionSrc from '../../demos/config-provider/04-direction.svelte?raw';
  import PopupContainer from '../../demos/config-provider/05-popup-container.svelte';
  import popupContainerSrc from '../../demos/config-provider/05-popup-container.svelte?raw';
  import GlobalConfig from '../../demos/config-provider/06-global-config.svelte';
  import globalConfigSrc from '../../demos/config-provider/06-global-config.svelte?raw';
</script>

## 使用场景

覆盖配置分为两种场景

- 需要覆盖多个组件公有 Props 配置（例如 `timeZone`、`direction`），使用 `ConfigProvider`
- 当 `ConfigProvider` 暴露参数未能满足，希望修改全局修改某个组件的某类 Props（例如期望将所有 `Button` 的 `theme` 都配置为 `solid` 或所有 `Select` 的 `zIndex`），使用 `cdGlobal`

## ConfigProvider

ConfigProvider 借助 Svelte Context 机制实现，因此它能影响组件树中的子组件。

## 代码演示

### 如何引入

```jsx
import { ConfigProvider } from '@chenzy-design/svelte';
```

### 基本用法

通过传入 timeZone 参数，用户可以为时间类组件配置时区：

<DemoBox code={timeZoneSrc}><TimeZone /></DemoBox>

### 手动获取值

通常情况下，组件内部会自动获取 ConfigProvider 的值自动消费，无需关心。但是一些特殊场景，你可能需要手动获取值来进行其他操作。

使用 `getConfigContext()` 获取 ConfigProvider 的值（等价 Semi 的 `ConfigConsumer`：React 用 render-props 拿 context，Svelte 用初始化期调用的 helper）。

<DemoBox code={consumerSrc}><Consumer /></DemoBox>

### 响应式断点监听

ConfigProvider 支持配置响应式断点，并在断点变化时进行订阅回调。

<Notice type="primary" title="注意事项">

- 由于性能考虑，`responsiveObserve` 默认值为 `false`，不开启时不会注册任何 `matchMedia` 监听。
- `onBreakpoint` / `screens` 不属于 ConfigProvider 的 props，需要通过 `getConfigResponsive()` 获取。
- 订阅时回调会**立即执行一次**，传入的就是当前各断点的命中情况，因此你不需要在初始挂载时再单独调用一次 `window.matchMedia`。
- `responsiveMap` 是引用比较：如果直接 inline 写对象（每次渲染引用都不同），会被识别为发生变化并重新注册全部监听。建议把它定义在组件外。

</Notice>

#### 开启监听与自定义断点

- 通过 `responsiveObserve` 开启断点监听（建议只在确实需要订阅的场景开启）
- 通过 `responsiveMap` 自定义断点（未传入时使用默认断点）

<DemoBox code={responsiveSrc}><Responsive /></DemoBox>

#### 订阅 API

`onBreakpoint` 支持两种签名，均会返回取消订阅函数：

- `onBreakpoint((screens) => void)`：回调拿到完整的 screens 映射
- `onBreakpoint(['md', 'lg'], (screen, match) => void)`：只监听指定断点，回调拿到单个断点变化

### RTL/LTR

全局配置 `direction` 可以改变组件的文本方向。

`rtl` 表示从右到左（类似希伯来语或阿拉伯语），`ltr` 表示从左到右（类似中文、英语等大部分语言）。

特殊组件：

- Modal，Notification，Toast 的命令式调用需要通过 prop 传 `direction`。
- 如果你想对有方向性的 Icon 做 RTL 国际化，需要自己单独进行处理。我们认为对 Icon 进行 RTL 会让它变得难以理解和维护。其他组件内的 icon 已经做了 RTL 适配。
- Table 的树形数据暂不支持 RTL。

<Notice type="warning" title="本库 RTL 覆盖面尚不完整">

`direction='rtl'` 会正确注入 `<div class="cd-rtl">` 方向作用域（与 Semi 的 `.semi-rtl` 同构），
但**镜像样式目前只有 Layout / Space / Grid.Col 三个布局组件实现**（Semi 侧有 61 个组件各带
`rtl.scss`）。因此下方 demo 里大部分组件在 rtl 下**不会真正镜像**——这是本库尚未补齐的能力，
不是配置未生效。逐组件补 RTL 覆盖是独立待办。

</Notice>

<DemoBox code={directionSrc}><Direction /></DemoBox>

### 全局浮层容器

`getPopupContainer` 经 context 提供全局默认浮层容器，浮层组件（Dropdown / Select / Tooltip 等）未传自身 `getPopupContainer` 时统一 portal 到此宿主。

<Notice type="primary" title="本库补充">
Semi 文档未单列此 demo，但 `getPopupContainer` 是其 API 表中的正式 prop，故本库补一个可交互示例。
</Notice>

<DemoBox code={popupContainerSrc}><PopupContainer /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| direction | 设置文本的方向 | `'ltr'` \| `'rtl'` | `'ltr'` |
| getPopupContainer | 指定父级 DOM，弹层将会渲染至该 DOM 中，自定义需要设置 `position: relative`。这会改变浮层 DOM 树位置，但不会改变视图渲染位置 | `() => HTMLElement` | `() => document.body` |
| locale | 多语言配置，同 `LocaleProvider` 中 `locale` 参数的用法（如果同时在 `ConfigProvider` 和 `LocaleProvider` 中配置 `locale`，前者优先级高于后者） | `Locale` | - |
| responsiveMap | 自定义断点配置，key 为 `xs/sm/md/lg/xl/xxl`，value 为 media query 字符串；未传入时使用默认断点（可通过 `defaultResponsiveMap` 获取） | `ResponsiveMap` | `defaultResponsiveMap` |
| responsiveObserve | 是否开启响应式断点监听。默认关闭以避免全局注册 `matchMedia` 带来的性能开销；开启后在首次订阅时懒注册监听，无订阅时会自动注销 | boolean | `false` |
| timeZone | [时区标识](#时区标识) | string \| number | - |

`onBreakpoint` / `screens` **不是 props**，经 `getConfigResponsive()` 读取：

| 字段 | 说明 | 类型 |
| --- | --- | --- |
| onBreakpoint | 订阅断点变化，返回取消订阅函数（两种签名见上文「订阅 API」） | `OnBreakpoint` |
| responsiveMap | 当前生效的断点配置 | `ResponsiveMap` |
| screens | 各断点当前命中情况 | `BreakpointScreens` |

### 时区标识

- 数字，例如 `1`、`-9.5`，代表距离 UTC 的时间偏移，单位为小时，可以为负数或小数；
- 字符串，例如 `GMT-09:30`、`GMT+08:00` 这样的以 `"GMT"` 开头的表征偏移字符串，也可以为 [IANA](https://time.is/time_zones) 标识，如 `Asia/Shanghai`、`America/Los_Angeles` 等。

当你使用数字或 `GMT-09:00` 类似写法时，内部会将这些时区标识转换为 IANA 标识。

- 如设置 `-9` 或 `GMT-09:00` 时，会转换成 `Pacific/Gambier`。某些数字对应的 IANA 标识可能有多个，首选无夏令时的 IANA 标识；
- 如果该数字没有对应的无夏令时 IANA 标识，如 `-3.5`、`3.5`、`10.5`、`13.75`，这时映射的就是一个有夏令时的 IANA 标识，有夏令时的时区会在偏移量上进行调整，如 `-3.5` 会在进入夏令时后在标准时间上增加 1h。

如果你想准确设置一个地区的时区，推荐使用 IANA 标识而不是前面的用法。

### FAQ

- ConfigProvider 中没有提供全局自定义 prefix classname 的功能，有类似需求如何实现（例如 SDK 中使用了本库，期望打包的 dom 样式不带 `.cd-xx` 前缀，以免被宿主的全局 CSS 影响）？
  - 本库样式写在各组件 `.svelte` 的 `<style>` 里（Svelte scoped + `:global` 打洞），类名前缀由组件源码内联书写，**没有构建期可替换的单一入口**，故暂不支持全局改前缀。这与 Semi 把该开关放在 webpack plugin（而非 ConfigProvider）的取舍同源：prefixCls 需要同时被组件层的 js/css 消费。

## cdGlobal

除了 ConfigProvider 外，你还可以通过 `cdGlobal` 配置覆盖全局组件的默认 Props（对齐 Semi 的 `semiGlobal`）。

在 `cdGlobal.config.overrideDefaultProps` 可配置组件默认 Props，你需要将你的配置放到整个站点的入口处，即优先于所有组件执行。

<Notice type="primary" title="注意事项">
cdGlobal 是单例模式，会影响整个站点。如果你只想覆盖某些地方的某些组件 Props，建议不要使用 cdGlobal，而是将对应需要覆盖的组件封装一层并传入修改后的默认 props。
</Notice>

比如下方配置就是将所有的 Button 默认设置为 solid 主题，Select 的 zIndex 默认设置为 2000 等：

```js
import { cdGlobal } from '@chenzy-design/svelte';

cdGlobal.config.overrideDefaultProps = {
  Select: {
    zIndex: 2000,
  },
  Tooltip: {
    zIndex: 2001,
    trigger: 'click',
  },
};
```

优先级：**组件上显式传的 prop > 组件自身上下文（如 ButtonGroup）> cdGlobal 全局默认 > 组件内置默认值**。显式传 `null` / `false` / `0` / `''` 都算「有传」，不会被全局默认覆盖。

<Notice type="primary" title="生效时机">

`cdGlobal` 是普通单例对象，**修改它不会主动触发已挂载组件重渲染**——组件只在自身重渲染时读到新值。
Semi 的 `semiGlobal` 同样如此（其 `Proxy` 只是在 React 读 `defaultProps` 时查一次全局表）。
因此务必**在站点入口、渲染任何组件之前**完成赋值；不要把它当作运行时可切换的主题开关。

</Notice>

<DemoBox code={globalConfigSrc}><GlobalConfig /></DemoBox>

<Notice type="primary" title="实现差异（非语义差异）">

Semi 用 `Proxy` 包 React 的 `static defaultProps`；Svelte 5 的默认值写在 `let { x = 1 } = $props()` 的解构里，没有可被外部拦截的 defaultProps 对象。故本库改为**显式函数式读取**：组件内部用 `resolveDefault(xProp, 'Comp', 'x', 内置默认值)` 派生生效值。二者语义一致：每次读都查全局单例，外部显式传值恒优先；也同样**不会**主动触发已挂载组件重渲染（见上方「生效时机」）。

当前已接入的组件与可覆盖的 prop，以 Semi 的 `defaultProps` 键集为白名单逐个对齐。

</Notice>

## Accessibility

- ConfigProvider 自身不设 role；`direction !== 'rtl'` 时 renderless，不渲染任何 DOM，不打断辅助技术的可访问性树。
- `direction === 'rtl'` 时渲染一个 `<div class="cd-rtl">` 包裹层承载方向作用域（对齐 Semi `.semi-rtl`），辅助技术与浏览器据此正确处理双向文本与焦点顺序。
- 推荐应用在 `<html lang>` / `<html dir>` 上同步 locale 与 direction，屏幕阅读器据 `lang` 选择发音与阅读方向。
