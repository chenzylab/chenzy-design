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
- **单向覆盖（无深合并）**：本组件严格对齐 Semi——每层 `LocaleProvider` 把自己的 `locale` 原样注入子树，不与父级语言包深合并（Semi `localeProvider.tsx` 同样只是 `<LocaleContext.Provider value={locale}>`，不存在"继承父级未覆盖字段"的语义）。需要携带自定义键的完整语言包时，由使用方自行用 `mergeLocale` 拼好整份对象再传入。
- **回退链（fallback chain）**：单条文案缺失 key → 回退内置 `en_US`，保证永不出现裸 key（回退逻辑在 `createLocale`/`t()` 内部，与本组件的 props 层无关）。
- **格式化一致性**：locale 不仅是文案表，还携带 `dateFnsLocale`，配合缓存的 `Intl.DateTimeFormat`/`Intl.NumberFormat` 实例，确保区块内日期、数字格式与文案语种一致。
- **不可见即不可主题**：因无 DOM，不引入任何 `--cd-localeprovider-*` token；`rtl`/`timeZone` 等归属 `ConfigProvider`（Semi 同样将 `direction`/`timeZone` 放在 `configProvider` 而非 `locale` 目录），本组件不感知方向、不下发 timeZone。

## 3. 分层实现

本组件**逻辑大于渲染**，主体放 core，Svelte 层仅做薄封装。

**@chenzy-design/locale · `createLocale(options)`**
- 输入：`locale`（语言包对象或语言码字符串）；`fallback`/`direction`/`timeZone`/`currency` 均为可选，供 `ConfigProvider`/`useLocale()` 内部构造格式化能力用，`LocaleProvider` 组件本身不透传这些 option。
- 职责：
  - 构建回退链 `t(key, params)`（缺失 key 回退 en_US）。
  - 惰性创建并缓存 `Intl.DateTimeFormat` / `Intl.NumberFormat`（按 `locale+options` 作为 cache key），避免每次调用新建 Intl 实例（昂贵）。
  - 暴露 `t(key, params)`、`component(name)`、`formatDate(date, opts)`、`formatNumber(n, opts)`。
- 这套格式化 API（`t`/`component`/`formatDate`/`formatNumber`）是本库补充：Semi 把等价逻辑分散在各消费组件内部自行实现（如 `LocaleConsumer` 里手写 `get(locale, 'dateFnsLocale', ...)`），本库收敛到一处供全部消费组件复用，避免重复实现。

**@chenzy-design/svelte · `<LocaleProvider>`**
- 严格对齐 Semi `localeProvider.tsx`：唯一 prop 是 `locale`，调用 `createLocale({ locale: resolved })` 构造 `LocaleApi`，通过 `setContext(LOCALE_CONTEXT_KEY, { get current() })` 注入，不做深合并/方向推断/时区货币继承/变更回调。
- `locale` 变化时 `$derived` 自动重建 `LocaleApi`，子组件自动收到新值。
- 仅渲染子树，不产生包裹元素（无 `<div>`，避免破坏布局/flex/grid）。
- 导出辅助 `getLocaleContext()` / `useLocale()` 供组件库内部及用户自定义组件读取（对应 Semi 的 `LocaleConsumer`：React 用 render-props 组件，Svelte 用初始化期调用的 hook）。

约定：`ConfigProvider` 复用同一 `LOCALE_CONTEXT_KEY` 与 `createLocale`，注入相同形状的 `{ current }`，因此 `LocaleProvider` 嵌套在 `ConfigProvider` 内可正确覆盖（就近 wins）。

## 4. API

### Props

> 本表由 `packages/svelte/src/locale-provider/meta.ts` 真源生成（2026-08-23 重校，严格对齐 Semi `locale/localeProvider.tsx`）。
> Semi `LocaleProvider` 唯一 prop 是 `locale`，无 `fallback`/`direction`/`inherit`/`timeZone`/`currency`/`onLocaleChange`——
> 这些字段此前是本库自造的超集，已删除。`direction`/`timeZone` 的对应能力归属 `ConfigProvider`（Semi 同样将其放在 `configProvider` 而非 `locale` 目录）。

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| locale | `Locale \| string` | `undefined` | 语言包对象或字符串码（如 'zh_CN'/'en-US'）；字符串经 registerLocale 注册表 + 内置查表解析，未知码回退 en_US（registerLocale 为本库补充能力，Semi locale 只接受语言包对象） |

> 无 `value`/`open` 类受控 API：本组件非输入、非浮层，故不套用 `value+on:change` / `open+on:openChange` 约定（横切约定按组件实际不适用）。

### Events

无。Semi `LocaleProvider` 不提供变更通知；需要在语言切换时联动 `lang`/`dir` 等宿主状态，由使用方自行在切换 `locale` prop 的同一处处理。

### Slots

| 名称 | 说明 |
|---|---|
| `default` | 被覆盖语言环境的子树，无作用域参数（对齐 Semi `children` 为普通 `ReactNode`）。 |

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
- **`lang` / `dir` 同步**：本组件不提供变更回调（对齐 Semi，Semi `LocaleProvider` 同样无此能力）；需要将 `lang`/`dir` 同步到 `<html>` 满足 **WCAG 3.1.2 Language of Parts** 时，由使用方在切换 `locale` prop 的同一处自行处理。
- **RTL**：本组件不感知/不下发方向；RTL 由 `ConfigProvider` 的 `direction` prop 负责（消费组件使用逻辑属性如 `margin-inline-start` 实现镜像）。
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
- **日期/数字**：强制通过 `Intl.DateTimeFormat`/`Intl.NumberFormat`，禁止手写格式串；`timeZone` 归属 `ConfigProvider`（经其 context 下发给 DatePicker/TimePicker 等时间类组件），不经 `LocaleProvider`。
- 内置语言包：`en_US`、`zh_CN`（Semi 内置 57 个，本库暂两个），其余按需懒加载注册（`registerLocale(code, bundle)`，本库补充能力，Semi `locale` 只接受语言包对象）。
- 占位符插值统一 `{name}` 语法，由 `t(key, params)` 处理，复数走 `Intl.PluralRules`。

## 8. 文案

- 本组件无自有用户可见文案，文案治理责任在各消费组件 + locale 包维护。
- locale 包文案需遵循 content-guidelines：句式简洁、术语统一、按钮用动词（「确定」「取消」而非「OK?」）。
- **危险操作文案（单列）**：本组件不直接产出危险文案，但其提供的 locale 包中涉及破坏性操作的 key（如 `Modal.confirmDelete`、`Upload.removeConfirm`）必须在各语种中保持「明确后果 + 动词」风格，例如 `zh-CN: '确认删除该文件？删除后不可恢复'`、`en-US: 'Delete this file? This cannot be undone.'`。语种翻译不得弱化后果描述。

## 9. 性能 (Perf Budget)

| 指标 | 预算 | 说明 |
|---|---|---|
| gzip 体积（svelte 层） | ≤ 0.5 KB | 仅 context 注入 + 子树渲染，无样式，单一 prop。 |
| gzip 体积（core `createLocale`） | ≤ 2.5 KB | 不含语言包；语言包独立 chunk 懒加载。 |
| 单语言包 gzip | ~1–3 KB / 语种 | 通过 `registerLocale` 按需加载，默认仅打包 `zh_CN`/`en_US`。 |
| 首次 mount 运行时 | < 0.2 ms | 解析语言包 + 惰性 Intl 占位，不预建全部 formatter。 |
| locale 切换 | < 1 ms（不含子树重渲染） | `$derived` 重建 LocaleApi + Intl 缓存命中；缓存未命中时新建 Intl ~0.1–0.3 ms。 |
| 内存 | 每实例 < 5 KB | Intl 实例按 `locale+options` 缓存复用，避免重复创建。 |

- **无 DOM 渲染**：不需要虚拟化。
- **惰性渲染**：Intl formatter 惰性创建并缓存（按 key），不在 mount 时全量预建。
- **destroyOnClose**：不适用（无浮层）；卸载时清理 Intl 缓存引用。
- **避免重建子树**：locale 变更仅更新 context，不重挂载子树，保护子组件状态与焦点。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'LocaleProvider'`、`category: 'other'`、`stage: 'M6'`、`semiEquivalent: 'LocaleProvider'`。
- `relationships: [{ type: 'subsetOf', target: 'ConfigProvider', note: 'locale-only injection' }]`。
- `renderless: true`（标记无 DOM，AI 生成代码时不应期望可见输出/不应加包裹元素）。
- `props` schema（类型、默认、是否继承）、`events`、`slotProps`。
- `usageHints`：「整站语言用 ConfigProvider，局部覆盖用 LocaleProvider」「不要用 LocaleProvider 设置主题」「需要 RTL/timeZone 用 ConfigProvider，不在 LocaleProvider 上找」。
- `antiPatterns`：「不要为切换主题而使用」「不要在其外层重复包裹同语种」「不要硬编码日期格式，改用 useLocale() 的 formatDate」。
- `i18nKeysProvided`：所列消费组件 key 命名空间清单。

## 11. 测试

- **单元（core `createLocale`）**：
  - 回退链：缺失 key 回退 `en_US`；裸 key 永不出现。
  - Intl 缓存命中：相同 `locale+options` 返回同一 formatter 实例。
  - `t(key, params)` 占位插值。
- **组件（svelte）**：
  - `setContext` 注入正确的 `{ current }`；嵌套 LocaleProvider 就近覆盖（子层完全替换父层，无深合并）。
  - 嵌套在 ConfigProvider 内可覆盖其 locale。
  - 不产生包裹 DOM 元素（断言 `container` 仅有子树内容）。
  - `locale` prop 变更时子组件通过 `useLocale()` 拿到新值。
- **集成**：DatePicker / Pagination 在 LocaleProvider 子树内文案与格式随之切换；切换 locale 不丢失子组件焦点与内部状态。
- **SSR**：服务端按请求注入 locale 渲染，hydration 无 lang 不匹配警告。

## 12. 验收标准 checklist

- [ ] core `createLocale` 实现回退链、Intl 缓存、`t/component/formatDate/formatNumber`。
- [ ] svelte `<LocaleProvider>` 仅注入 context 且**不渲染任何包裹 DOM**，唯一 prop 为 `locale`（严格对齐 Semi，无 fallback/direction/inherit/timeZone/currency/onLocaleChange）。
- [ ] 与 ConfigProvider 共享 `LOCALE_CONTEXT_KEY`，注入同形状 `{ current }`，嵌套覆盖正确（就近 wins，无深合并）。
- [ ] 自身无 `--cd-*` token、无硬编码可见文案。
- [ ] 内置 `zh_CN`/`en_US`，支持 `registerLocale` 懒加载其余语种。
- [ ] 日期/数字一律走 `Intl.*`，无手写格式串。
- [ ] 危险操作类 locale key 各语种保留「后果 + 动词」表述。
- [ ] Perf：svelte ≤ 0.5KB、core ≤ 2.5KB（不含语言包）；Intl 实例缓存复用。
- [ ] locale 切换不重建子树、不丢失焦点与子组件状态。
- [ ] SSR 注入与 hydration 无 lang/dir 不匹配警告。
- [ ] 提供 `component.meta.ts`（含 `renderless: true`、与 ConfigProvider 的 `subsetOf` 关系、usageHints/antiPatterns）。
- [ ] 单元 / 组件 / 集成 / SSR 测试全部通过，覆盖率 ≥ 90%。
