# SPEC · LocaleProvider
> 分类：other · 阶段：M6
> 对标 Semi：LocaleProvider

## 1. 概述

LocaleProvider 是一个**纯上下文注入组件**，用于在组件树的某个子范围内覆盖当前语言环境（locale）与区域格式化策略（日期/数字/货币）。它不渲染任何可见 DOM，仅通过 Svelte Context 向下传递 locale 包（locale bundle）与 `Intl` 格式化器，供 DatePicker、Pagination、Table（空态/筛选）、Modal（确认/取消按钮）、Upload、Form 校验等组件消费可见文案。

**与 ConfigProvider 的关系（核心定位）**：
- `ConfigProvider` 是全局/大范围配置容器，承载 locale、theme、组件默认 props（size、getPopupContainer 等）等**多维配置**，通常包裹整个应用一次。
- `LocaleProvider` 是 `ConfigProvider` 的**locale 维度子集**，专用于**局部覆盖**：例如整站为中文，但某个对账区块需强制 `en-US`。它只写入 locale context，不触碰 theme/size 等其它 context，因此嵌套覆盖语义清晰、开销极小。
- 实现上二者共享同一套 locale context key 与 `@chenzy-design/core` 的 locale 解析逻辑；`ConfigProvider` 内部即调用与 `LocaleProvider` 相同的 `createLocale` 原语。**当用户只需切换语言而无需其它配置时，使用 LocaleProvider；需要整体配置时用 ConfigProvider 并传 `locale`。**

适用场景：多语言混排页面、嵌入式 widget 强制独立语种、Storybook/测试中隔离 locale、SSR 时按请求注入 locale。

## 2. 设计语义

- **零视觉**：组件本身无样式、无 token、无可见输出，仅 `<slot/>`。设计语义体现在「契约」而非「外观」。
- **就近覆盖（nearest-wins）**：子组件消费 locale 时取离自己最近的 LocaleProvider/ConfigProvider，符合 React/Svelte context 的层叠直觉。
- **回退链（fallback chain）**：`zh-HK` 缺失 key → 回退 `zh-CN` → 回退内置 `defaultLocale`（默认 `en-US`），保证永不出现裸 key。
- **格式化一致性**：locale 不仅是文案表，还携带 `dateFnsLocale`/时区与一组缓存的 `Intl.DateTimeFormat`/`Intl.NumberFormat` 实例，确保区块内日期、数字、货币格式与文案语种一致。
- **不可见即不可主题**：因无 DOM，不引入任何 `--cd-localeprovider-*` token；reduced-motion/RTL 等不直接作用于本组件，但本组件负责把 `rtl` 方向信息写入 context 供子组件读取。

## 3. 分层实现

本组件**逻辑大于渲染**，主体放 core，Svelte 层仅做薄封装。

**@chenzy-design/core · `createLocale(options)`**
- 输入：`locale`（语言包对象或语言码字符串）、`fallbackLocale`、`timeZone`、`currency`。
- 职责：
  - 解析/合并语言包，构建回退链 `resolveMessage(key, params)`。
  - 惰性创建并缓存 `Intl.DateTimeFormat` / `Intl.NumberFormat`（按 `locale+options` 作为 cache key），避免每次 render 新建 Intl 实例（昂贵）。
  - 推导 `direction`（ltr/rtl，依据语言码 he/ar/fa）。
  - 暴露 `t(key, params)`、`formatDate(date, opts)`、`formatNumber(n, opts)`、`subscribe`（store 接口）。
- 复用原语：`useId`（生成 provider 实例 id，便于 devtools/嵌套调试）。不需要 useFocusTrap/useRovingTabindex/useDismiss/useScrollLock（无交互、无浮层）；`useLiveAnnouncer` 不在此层，由消费组件按需使用。

**@chenzy-design/svelte · `<LocaleProvider>`**
- 调用 `createLocale`，将返回的可订阅 locale 上下文通过 `setContext(LOCALE_CONTEXT_KEY, store)` 注入。
- props 变化时更新 store（响应式 `$:`），子组件自动收到新 locale。
- 仅渲染 `<slot/>`，不产生包裹元素（无 `<div>`，避免破坏布局/flex/grid）。
- 导出辅助 `getLocaleContext()` 供组件库内部及用户自定义组件读取。

约定：`ConfigProvider` 复用同一 `LOCALE_CONTEXT_KEY` 与 `createLocale`，因此 `LocaleProvider` 嵌套在 `ConfigProvider` 内可正确覆盖。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `locale` | `Locale \| string` | 继承上层，无上层则 `en-US` | 语言包对象或语言码（如 `'zh-CN'`）。传字符串时从内置/已注册语言包解析。 |
| `fallbackLocale` | `Locale \| string` | `'en-US'` | 缺失 key 时的回退语言，构成回退链末端。 |
| `timeZone` | `string` | 继承 / 浏览器本地 | IANA 时区（如 `'Asia/Shanghai'`），供 `Intl.DateTimeFormat` 使用。 |
| `currency` | `string` | 继承 / 由 locale 推断 | ISO 4217 货币码（如 `'CNY'`），作为 `formatNumber({style:'currency'})` 默认。 |
| `direction` | `'ltr' \| 'rtl' \| 'auto'` | `'auto'` | 文档方向；`auto` 时按语言码推断，写入 context 供子组件应用。 |
| `inherit` | `boolean` | `true` | 是否合并上层 locale 的缺失 key（深合并）；`false` 则完全以本组件 `locale` 为准。 |

> 无 `value`/`open` 类受控 API：本组件非输入、非浮层，故不套用 `value+on:change` / `open+on:openChange` 约定（横切约定按组件实际不适用）。

### Events

| 名称 | payload | 说明 |
|---|---|---|
| `on:localeChange` | `{ locale: string; direction: 'ltr' \| 'rtl' }` | 解析后的生效 locale 发生变化时触发（含因 `locale` prop 变更或上层继承变化）。便于宿主同步 `document.documentElement.lang/dir`。 |

### Slots

| 名称 | 作用域参数（let:） | 说明 |
|---|---|---|
| `default` | `let:locale`（生效语言码）、`let:t`（翻译函数）、`let:formatDate`、`let:formatNumber`、`let:direction` | 被覆盖语言环境的子树。作用域参数为方便就地格式化的便捷出口，可不使用。 |

## 5. 主题 / Token 表

本组件**不渲染任何 DOM**，因此**不定义任何组件级 `--cd-localeprovider-*` token，也不消费 Alias token**。

| 层级 | Token | 用途 |
|---|---|---|
| Global | — | 无 |
| Alias | — | 无 |
| Component | — | 无（无视觉输出） |

说明：本组件通过 context 向下传递 `direction`，子组件据此选择 `--cd-*` 逻辑属性方向（如 padding-inline），但方向 token 的定义归属各消费组件，不在此。

## 6. 无障碍 (WCAG 2.1 AA)

- **role/aria**：本组件无 DOM，不持有 role/aria 属性。
- **`lang` / `dir` 同步（关键）**：本组件不强制写 DOM，但推荐宿主监听 `on:localeChange` 将 `lang`、`dir` 同步到对应子树根元素或 `<html>`，以满足 **WCAG 3.1.2 Language of Parts**。可选提供 `setHtmlLang` 用法示例由宿主决定。屏幕阅读器据 `lang` 切换发音引擎。
- **RTL**：`direction` 推断并下传，消费组件使用逻辑属性（`margin-inline-start` 等）实现镜像；本组件保证语种与方向一致。
- **对比度**：不适用（无视觉）。
- **reduced-motion**：不适用（无动效）；但 locale 切换不应触发布局抖动，宿主切换语言时建议保留容器尺寸。
- **焦点管理**：locale 切换为纯文本替换，不移动/丢失焦点；实现保证 `<slot/>` 内元素引用稳定（不重建子树），避免焦点丢失（WCAG 3.2 一致性）。
- **APG**：本组件非复合控件，无适用 APG 模式；其价值在于为遵循 APG 的子控件（如 Combobox、Dialog）提供正确语种文案。

## 7. 国际化

- 本组件是 i18n **基础设施**本身，自身无可见文案，故无自有 i18n key。
- 提供给子组件消费的 locale 包结构按 `<Name>.field` 命名空间组织，例如：
  - `DatePicker.today`、`DatePicker.now`、`DatePicker.confirm`
  - `Pagination.prev`、`Pagination.next`、`Pagination.total`（带 `{count}` 占位）
  - `Modal.okText`、`Modal.cancelText`
  - `Table.emptyText`、`Table.filterConfirm`
  - `Upload.uploading`、`Upload.fail`
  - `Form.required`（带 `{label}` 占位）
- **日期/数字**：强制通过 `Intl.DateTimeFormat`/`Intl.NumberFormat`，禁止手写格式串；`timeZone`、`currency` 作为格式化默认参数。
- 内置语言包至少：`en-US`、`zh-CN`，其余按需懒加载注册（`registerLocale(code, bundle)`）。
- 占位符插值统一 `{name}` 语法，由 `t(key, params)` 处理，复数走 `Intl.PluralRules`。

## 8. 文案

- 本组件无自有用户可见文案，文案治理责任在各消费组件 + locale 包维护。
- locale 包文案需遵循 content-guidelines：句式简洁、术语统一、按钮用动词（「确定」「取消」而非「OK?」）。
- **危险操作文案（单列）**：本组件不直接产出危险文案，但其提供的 locale 包中涉及破坏性操作的 key（如 `Modal.confirmDelete`、`Upload.removeConfirm`）必须在各语种中保持「明确后果 + 动词」风格，例如 `zh-CN: '确认删除该文件？删除后不可恢复'`、`en-US: 'Delete this file? This cannot be undone.'`。语种翻译不得弱化后果描述。

## 9. 性能 (Perf Budget)

| 指标 | 预算 | 说明 |
|---|---|---|
| gzip 体积（svelte 层） | ≤ 1.0 KB | 仅 context 注入 + slot，无样式。 |
| gzip 体积（core `createLocale`） | ≤ 2.5 KB | 不含语言包；语言包独立 chunk 懒加载。 |
| 单语言包 gzip | ~1–3 KB / 语种 | 通过 `registerLocale` 按需加载，默认仅打包 `en-US`。 |
| 首次 mount 运行时 | < 0.2 ms | 解析回退链 + 惰性 Intl 占位，不预建全部 formatter。 |
| locale 切换 | < 1 ms（不含子树重渲染） | store 更新 + Intl 缓存命中；缓存未命中时新建 Intl ~0.1–0.3 ms。 |
| 内存 | 每实例 < 5 KB | Intl 实例按 `locale+options` 缓存复用，避免重复创建。 |

- **无 DOM 渲染**：不需要虚拟化。
- **惰性渲染**：Intl formatter 惰性创建并缓存（按 key），不在 mount 时全量预建。
- **destroyOnClose**：不适用（无浮层）；卸载时清理 store 订阅与 Intl 缓存引用。
- **避免重建子树**：locale 变更仅更新 context store，不重挂载 `<slot/>`，保护子组件状态与焦点。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'LocaleProvider'`、`category: 'other'`、`stage: 'M6'`、`semiEquivalent: 'LocaleProvider'`。
- `relationships: [{ type: 'subsetOf', target: 'ConfigProvider', note: 'locale-only injection' }]`。
- `renderless: true`（标记无 DOM，AI 生成代码时不应期望可见输出/不应加包裹元素）。
- `props` schema（类型、默认、是否继承）、`events`、`slotProps`。
- `usageHints`：「整站语言用 ConfigProvider，局部覆盖用 LocaleProvider」「不要用 LocaleProvider 设置主题」。
- `antiPatterns`：「不要为切换主题而使用」「不要在其外层重复包裹同语种」「不要硬编码日期格式，使用 slot 暴露的 formatDate」。
- `i18nKeysProvided`：所列消费组件 key 命名空间清单。

## 11. 测试

- **单元（core `createLocale`）**：
  - 回退链：`zh-HK` 缺失 key 回退 `zh-CN` 再回退 `en-US`；裸 key 永不出现。
  - `inherit: true/false` 的深合并行为。
  - Intl 缓存命中：相同 `locale+options` 返回同一 formatter 实例。
  - `direction` 推断：`ar`/`he` → rtl，其余 → ltr；显式 `direction` 覆盖推断。
  - `t(key, params)` 占位插值与 `Intl.PluralRules` 复数。
- **组件（svelte）**：
  - `setContext` 注入正确 store；嵌套 LocaleProvider 就近覆盖。
  - 嵌套在 ConfigProvider 内可覆盖其 locale。
  - 不产生包裹 DOM 元素（断言 `container` 仅有 slot 内容）。
  - `on:localeChange` 在 prop 变更/继承变更时触发，payload 正确。
  - slot 作用域参数 `t/formatDate/formatNumber/direction` 可用。
- **集成**：DatePicker / Pagination 在 LocaleProvider 子树内文案与格式随之切换；切换 locale 不丢失子组件焦点与内部状态。
- **SSR**：服务端按请求注入 locale 渲染，hydration 无 lang 不匹配警告。

## 12. 验收标准 checklist

- [ ] core `createLocale` 实现回退链、Intl 缓存、direction 推断、`t/formatDate/formatNumber`。
- [ ] svelte `<LocaleProvider>` 仅注入 context 且**不渲染任何包裹 DOM**。
- [ ] 与 ConfigProvider 共享 `LOCALE_CONTEXT_KEY` 与 `createLocale`，嵌套覆盖正确（就近 wins）。
- [ ] Props（locale/fallbackLocale/timeZone/currency/direction/inherit）全部生效，含 `inherit` 深合并。
- [ ] `on:localeChange` 事件 payload 含生效 locale 与 direction。
- [ ] slot 暴露 `locale/t/formatDate/formatNumber/direction` 作用域参数。
- [ ] 自身无 `--cd-*` token、无硬编码可见文案。
- [ ] 内置 `en-US`/`zh-CN`，支持 `registerLocale` 懒加载其余语种。
- [ ] 日期/数字一律走 `Intl.*`，无手写格式串。
- [ ] 危险操作类 locale key 各语种保留「后果 + 动词」表述。
- [ ] Perf：svelte ≤ 1.0KB、core ≤ 2.5KB（不含语言包）；Intl 实例缓存复用。
- [ ] locale 切换不重建子树、不丢失焦点与子组件状态。
- [ ] SSR 注入与 hydration 无 lang/dir 不匹配警告。
- [ ] 提供 `component.meta.ts`（含 `renderless: true`、与 ConfigProvider 的 `subsetOf` 关系、usageHints/antiPatterns）。
- [ ] 单元 / 组件 / 集成 / SSR 测试全部通过，覆盖率 ≥ 90%。
