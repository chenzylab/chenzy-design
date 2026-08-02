---
title: LocaleProvider 多语言
name: localeprovider
category: other
brief: 国际化组件，为组件提供多语言支持。
---

<script>
  import DemoBox from '$lib/components/DemoBox.svelte';
  import Notice from '$lib/components/Notice.svelte';

  import Basic from '../../demos/locale-provider/01-basic.svelte';
  import basicSrc from '../../demos/locale-provider/01-basic.svelte?raw';
  import CustomComponent from '../../demos/locale-provider/02-string-code.svelte';
  import customComponentSrc from '../../demos/locale-provider/02-string-code.svelte?raw';
  import AllComponents from '../../demos/locale-provider/03-nested-override.svelte';
  import allComponentsSrc from '../../demos/locale-provider/03-nested-override.svelte?raw';
  import RegisterCustom from '../../demos/locale-provider/04-register-custom.svelte';
  import registerCustomSrc from '../../demos/locale-provider/04-register-custom.svelte?raw';
</script>

## 目前支持语言

| 语言 | 语言包 |
| --- | --- |
| 简体中文 | `zh_CN`（亦可写 `zh-CN`） |
| 英语（美） | `en_US`（亦可写 `en-US`） |

<Notice type="primary" title="与 Semi 的差异">

Semi 内置 57 个语言包，本库目前只内置 **zh_CN / en_US** 两个。

需要其它语种时，用 `registerLocale(code, bundle)` 注册自己的语言包即可（见下方「注册自定义语言包」）——
这是本库补充的能力，Semi 的 `locale` 只接受语言包对象、没有注册表。

</Notice>

## 已支持组件

目前有以下组件存在内置默认文本，均已实现国际化多语言适配：

AIChatDialogue、AIChatInput、Anchor、AudioPlayer、AutoComplete、Avatar、BackTop、Banner、Breadcrumb、Calendar、Carousel、Cascader、Chat、CodeHighlight、ColorPicker、Cropper、DatePicker、Feedback、Form、HotKeys、Image、Input、InputNumber、JsonViewer、List、Modal、Nav、Notification、Pagination、PinCode、Popconfirm、Popover、Rating、Select、SideSheet、SideBar、Slider、Spin、Steps、Table、Tabs、Tag、TagInput、TimePicker、Toast、Transfer、Tree、TreeSelect、Typography、Upload、UserGuide、VideoPlayer

## 使用

LocaleProvider 使用了 Svelte 的 context 上下文特性，你只需要在应用外围包裹一次即可全局生效。
当需要切换语言时，直接切换 props 传入的 locale 即可。

```jsx
import { LocaleProvider, en_US } from '@chenzy-design/svelte';

// 在 locale 中传入相应的语言包即可
<LocaleProvider locale={en_US}>
  <App />
</LocaleProvider>;
```

## 代码示例

### 国际化

<DemoBox code={basicSrc}><Basic /></DemoBox>

### 自定义国际化组件

当你的自定义组件，也希望消费 LocaleProvider Context 中的 localeCode 或者读取具体某个组件的 i18n 文本 localeData 时，
可以使用 `useLocale()` 获取（等价 Semi 的 `LocaleConsumer`：React 用 render-props，Svelte 用初始化期调用的 helper）。

- `loc().component('TimePicker')` 取整片语言包（对应 Semi 的 `localeData`），可读嵌套/数组值；
- `loc().t('X.y')` 按点号路径取单条，**支持语言包里自行注入的自定义键**（不必先在 `Locale` 类型中声明）；
- `loc().code` 即当前生效的语言码（对应 Semi 的 `localeCode`）。

<DemoBox code={customComponentSrc}><CustomComponent /></DemoBox>

### 支持多语言的组件

示例给出了目前所有支持多语言的组件。

当你的网站有 RTL 适配需求时，推荐直接使用 ConfigProvider，除了可配置 locale 外，还可以同时配置 `direction='rtl'`；
若无 RTL 适配需求，直接使用 LocaleProvider 即可。

<DemoBox code={allComponentsSrc}><AllComponents /></DemoBox>

### 注册自定义语言包

<Notice type="primary" title="本库补充">
Semi 的 `locale` 只接受语言包对象；本库额外提供 `registerLocale(code, bundle)` 注册表，
注册后 `locale` 可直接传字符串码（内置的 `zh_CN` / `en_US` 也支持字符串写法）。
</Notice>

<DemoBox code={registerCustomSrc}><RegisterCustom /></DemoBox>

## API 参考

| 属性 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| currency | 默认 ISO 4217 货币（如 `'CNY'`）用于 currency 风格 formatNumber；未设时继承父级 | string | - |
| direction | 文本方向；`'auto'` 按语言包的 `rtl` 字段推断 | `'ltr'` \| `'rtl'` \| `'auto'` | `'auto'` |
| fallback | 缺失 key 的回退语言包 | `Locale` | `en_US` |
| inherit | 嵌套时是否深合并父级 LocaleProvider 的语言包（子覆盖父、未覆盖继承父）；`false` 则整体替换 | boolean | `true` |
| locale | 语言包对象，或内置/已注册的字符串码（如 `'zh_CN'` / `'en-US'`）；未知码回退 `en_US` | `Locale` \| string | - |
| onLocaleChange | locale / direction 变化时的通知回调（受控，不回写） | `(info: { locale: string; direction: Direction }) => void` | - |
| timeZone | 默认 IANA 时区（如 `'Asia/Shanghai'`）注入 formatDate；未设时继承父级 | string | - |

`children` 作为带参 snippet 时可直接拿到 locale 能力（本库补充，Semi 无对应用法）：

| 参数 | 说明 | 类型 |
| --- | --- | --- |
| direction | 当前生效的文本方向 | `Direction` |
| formatDate | 按当前 locale / timeZone 格式化日期 | `LocaleApi['formatDate']` |
| formatNumber | 按当前 locale / currency 格式化数字 | `LocaleApi['formatNumber']` |
| locale | 当前生效的语言码 | string |
| t | 按点号路径取文案 | `LocaleApi['t']` |

### 相关工具

| 名称 | 说明 |
| --- | --- |
| `mergeLocale(parent, child)` | 深合并两个语言包（子覆盖父）。`child` 可携带自定义组件的键 |
| `registerLocale(code, bundle)` | 把自定义语言包注册到字符串码（本库补充） |
| `resolveLocale(input)` | 把字符串码解析成语言包；对象原样返回 |
| `unregisterLocale(code)` | 注销已注册的语言包（主要供测试 teardown） |
| `useLocale()` | 在组件初始化期取得稳定 getter，渲染期读 `loc()` 拿最新 LocaleApi |

## Accessibility

- 本组件无 DOM 输出，不持有 role / aria 属性，不打断辅助技术的可访问性树。
- **lang / dir 同步**：推荐宿主监听 `onLocaleChange` 把 `lang`、`dir` 同步到对应子树根元素或 `<html>`，
  满足 WCAG 3.1.2 Language of Parts，屏幕阅读器据 `lang` 切换发音引擎。
- locale 切换为纯文本替换，不移动 / 丢失焦点。
