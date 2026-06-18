# SPEC · ConfigProvider
> 分类：other · 阶段：M6
> 对标 Semi：ConfigProvider

## 1. 概述

`ConfigProvider` 是 chenzy-design 的**全局配置总入口**，以"无 DOM 包裹层"的方式向其子树注入跨组件共享的配置：语言（locale）、主题（theme / 暗色模式）、书写方向（dir：ltr/rtl）、默认尺寸（size）、以及一组运行时全局策略（浮层挂载点 getPopupContainer、过渡是否禁用、滚动锁定策略等）。它不渲染任何业务 UI，仅通过 Svelte Context + 一个轻量配置 store 下发，使下游组件无需逐个透传 props 即可获得一致行为。

典型职责：
- 作为应用根，统一设置 `locale`（驱动所有组件的 i18n key 解析与 `Intl` 区域）；
- 统一 `theme`（`light | dark | auto`）并在挂载节点写入 `data-cd-theme` 与 token 变量作用域；
- 统一 `dir`（`ltr | rtl`），驱动逻辑属性与组件镜像；
- 统一默认 `size`（`small | default | large`），被未显式指定 size 的组件继承；
- 统一浮层行为（`getPopupContainer`、`zIndexBase`）、动画策略（`transition` / 跟随系统 reduced-motion）。

支持**嵌套**：内层 `ConfigProvider` 与外层做浅合并（只覆盖显式传入的字段），实现局部区域换肤/换语言/换方向。

适用：所有应用的最外层；以及需要局部不同配置（如某弹窗内强制暗色、某区块强制 rtl）的子树。
不适用：单组件一次性覆盖（直接用组件自身 props 即可，无需 Provider）。

## 2. 设计语义

- **零视觉表现**：ConfigProvider 本身不绘制边框/背景/间距，是纯逻辑容器。默认通过 Context 注入，不产生额外 DOM 节点（`wrap=false`）；当需要为子树建立独立的主题/方向作用域时，可设 `wrap=true` 渲染一个 `<div class="cd-config-provider">` 承载 `data-cd-theme` / `dir` / size class，使 token 作用域生效。
- **主题作用域**：`theme="dark"` 时在作用域根写入 `data-cd-theme="dark"`，对应 token 覆盖块（`[data-cd-theme="dark"]{ --cd-color-bg-0: …; --cd-color-text-0: …; }`）由主题包提供；`auto` 跟随 `prefers-color-scheme`。
- **方向语义**：`dir` 写入根节点 `dir` 属性；所有组件样式使用 CSS 逻辑属性（`margin-inline-start` 等），ConfigProvider 不直接镜像，而是为下游提供方向上下文。
- **尺寸继承**：`size` 仅作为默认值，组件级 `size` 优先级更高（组件 prop > 最近 Provider > 全局默认 `default`）。
- **合并语义**：嵌套时按字段浅合并；未传字段沿用父级；`locale`/`theme`/`dir` 等为可空字段，`undefined` 表示继承。

## 3. 分层实现

属于"有运行时逻辑、无复杂交互/键盘"的配置型组件，逻辑下沉到 core，渲染极薄。

- **@chenzy-design/core · `createConfigProvider(initial)`**（headless）：
  - 维护 `config` store（合并后的最终配置），暴露 `subscribe / set(partial) / get()`；
  - 提供 `mergeConfig(parent, local)` 浅合并纯函数；
  - 处理 `theme="auto"`：通过 `matchMedia('(prefers-color-scheme: dark)')` 订阅系统主题，派生出实际 `resolvedTheme`，SSR 下回退到 `light` 或显式 `theme`；
  - 处理 reduced-motion：订阅 `matchMedia('(prefers-reduced-motion: reduce)')`，派生 `motionEnabled`，并与显式 `transition` 取交集；
  - 复用 `useId` 为浮层/announcer 生成稳定前缀；提供单例 `useLiveAnnouncer` 的全局挂载点（root announcer），供下游组件 toast/通知复用；
  - 不直接消费 useFocusTrap/useRovingTabindex/useDismiss/useScrollLock（这些属于具体交互组件），但**导出 `scrollLock` 默认策略**供 useScrollLock 读取（如 `gapCompensation`）。
- **@chenzy-design/svelte · `ConfigProvider.svelte`**（渲染）：
  - 接收 props，调用 `createConfigProvider`，用 `setContext(CONFIG_KEY, configStore)` 下发；
  - 下游用 `getConfigContext()`（导出的便捷 hook）读取，缺省返回内置默认 config（不强制要求必须有 Provider）；
  - `wrap=true` 时渲染单一 `div`，绑定 `data-cd-theme={resolvedTheme}`、`dir={dir}`、`class="cd-config-provider cd-size--{size}"`；`wrap=false` 时用 `<slot />` 透传，无包裹；
  - SSR 友好：服务端渲染时不访问 `window`，`resolvedTheme` 取显式值或 `light`，客户端 hydration 后再订阅 matchMedia。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| locale | `Locale \| undefined` | `undefined`（继承/内置 en） | 语言包对象（含 `lang` 标识与各组件 i18n 字典），驱动 i18n 与 Intl 区域 |
| theme | `'light' \| 'dark' \| 'auto' \| undefined` | `undefined`（继承，根级默认 `light`） | 主题模式；`auto` 跟随系统 `prefers-color-scheme` |
| dir | `'ltr' \| 'rtl' \| undefined` | `undefined`（继承，根级默认 `ltr`） | 书写方向 |
| size | `'small' \| 'default' \| 'large' \| undefined` | `undefined`（继承，根级默认 `default`） | 下游组件默认尺寸 |
| getPopupContainer | `(triggerNode?: HTMLElement) => HTMLElement` | `() => document.body` | 全局浮层默认挂载点 |
| zIndexBase | `number` | `1000` | 浮层基准 z-index，下游按层级递增 |
| transition | `boolean` | `true` | 是否启用过渡动画；与系统 reduced-motion 取与 |
| scrollLock | `{ gapCompensation?: boolean }` | `{ gapCompensation: true }` | useScrollLock 全局默认策略 |
| wrap | `boolean` | `false` | 是否渲染包裹 `div` 以建立独立 token/方向作用域 |
| as | `string` | `'div'` | `wrap=true` 时包裹元素标签名 |
| getValidateMessages | `(locale: Locale) => Record<string,string>` | 内置 | 表单校验提示模板（供 Form 复用） |

### Events

| 名称 | 载荷类型 | 触发时机 |
|---|---|---|
| on:themeChange | `{ theme: 'light'\|'dark'\|'auto'; resolvedTheme: 'light'\|'dark' }` | `theme` prop 变更，或 `auto` 模式下系统主题切换、reduced-motion 切换导致 resolvedTheme 变化 |
| on:localeChange | `{ lang: string }` | `locale` prop 变更 |
| on:dirChange | `{ dir: 'ltr'\|'rtl' }` | `dir` prop 变更 |
| on:configChange | `{ config: ResolvedConfig }` | 合并后最终配置任一字段变化（聚合事件，便于外部持久化） |

> 注：ConfigProvider 为配置注入组件，无 `value/on:change`、`open/on:openChange` 适用场景；事件仅作通知，不构成受控/非受控双轨。

### Slots

| 名称 | 作用域属性 | 说明 |
|---|---|---|
| default | — | 被配置覆盖的子树内容（唯一插槽） |

## 5. 主题 / Token

ConfigProvider 自身几乎不消费视觉 token（无边框/背景）。其核心作用是**建立 token 作用域**：`wrap=true` 或根节点写入 `data-cd-theme`，使主题包提供的 Alias token 覆盖在该子树内生效。

| Component Token | 关联 Alias | 默认（light） | 说明 |
|---|---|---|---|
| `--cd-config-provider-z-index-base` | — | `1000` | 由 `zIndexBase` prop 写入，下游浮层读取 |

作用域示例（由主题包定义，ConfigProvider 仅负责打上 `data-cd-theme`）：

```css
.cd-config-provider { display: contents; } /* wrap=true 时不影响布局 */
[data-cd-theme="dark"] {
  --cd-color-bg-0: /* dark alias */;
  --cd-color-text-0: /* dark alias */;
  --cd-color-border: /* dark alias */;
}
```

约束：ConfigProvider 禁止写死任何颜色/尺寸值；`display: contents` 保证 `wrap` 不破坏布局（如需边界，再行调整）。Component 级 token 一律消费 Alias（`--cd-color-*`），不引用 Global 原子值。

## 6. 无障碍

ConfigProvider 无交互元素，本身无可聚焦内容，但它是若干 a11y 横切能力的**全局策源地**：

- **role/aria**：自身不设 `role`；`wrap=true` 的 `div` 为透明容器（`display:contents`），不打断辅助技术的可访问性树。
- **语言**：将 `locale.lang` 暴露给下游，并建议应用在 `<html lang>` 上同步（ConfigProvider 不直接改 `<html>`，提供 `on:localeChange` 供应用同步）；屏幕阅读器据此选择发音规则。
- **方向（RTL）**：`dir` 写入作用域根，辅助技术与浏览器据此正确处理双向文本与焦点顺序。
- **reduced-motion**：订阅 `prefers-reduced-motion`，派生 `motionEnabled` 下发，下游组件据此禁用过渡，满足 WCAG 2.3.3。
- **对比度**：暗色主题 token 须保证文本/背景对比度 ≥ 4.5:1（正文）/3:1（大字与图形界面）；ConfigProvider 不持有颜色，但其 SPEC 要求所注入的主题包通过 AA。
- **LiveAnnouncer**：通过 core `useLiveAnnouncer` 在根挂载单一 `aria-live` 区域（`polite`/`assertive`），供全局 toast/通知复用，避免重复 live region。

不依赖 WAI-ARIA APG 的具体复合控件模式（非交互组件）。

## 7. 国际化

ConfigProvider 是 i18n 的**分发中心**而非文案消费者，其自身用户可见文案为零。

- 注入的 `locale` 对象结构：`{ lang: string, <ComponentName>: { <field>: string } }`，下游组件以 `getConfigContext().locale[Name][field]` 解析。
- 内置默认语言包：`en`（兜底），官方提供 `zh-CN` 等；缺失 key 回退到 `en` 同名 key。
- 日期/数字：下游统一用 `Intl.DateTimeFormat(locale.lang, …)` / `Intl.NumberFormat`，`lang` 由 ConfigProvider 提供，禁止手写格式化。
- 校验文案模板：`getValidateMessages(locale)` 供 Form 复用，支持插值（如 `{field} is required`）。
- ConfigProvider 暴露的对外 i18n key（用于其触发的开发期警告，非终端用户文案，可不翻译）：

| i18n key | 用途 |
|---|---|
| `ConfigProvider.missingLocaleWarning` | 开发期：检测到组件使用了 locale 中缺失的 key（仅 dev 警告） |

## 8. 文案

ConfigProvider 无终端用户可见文案，故无 content-guidelines 适用的展示文本。

- **开发期提示**（仅 `import.meta.env.DEV`）：当检测到 `theme="dark"` 但未加载暗色主题包，或 `locale` 缺失关键 key 时，输出 `console.warn`，措辞遵循"问题 + 可操作建议"，例如：`[ConfigProvider] dark theme requested but no dark token sheet detected. Did you import '@chenzy-design/svelte/theme/dark.css'?`。
- **危险操作文案**：本组件不涉及删除/不可逆等危险操作，无危险文案。

## 9. 性能

ConfigProvider 是常驻根组件，关键在于"配置变更时的下游重渲染面"与"零包裹开销"。

| 指标 | 预算 / 目标 | 说明 |
|---|---|---|
| gzip 体积（svelte 渲染层） | ≤ 1.2 KB | 仅 props 绑定 + setContext |
| gzip 体积（core headless） | ≤ 1.5 KB | merge/store/matchMedia 订阅 |
| 首次挂载运行时 | < 0.3 ms | 无 DOM（wrap=false）或单 div |
| 配置变更传播 | O(订阅组件数)，仅变更字段触发 | store 拆分 + 派生选择器，避免整树失效 |
| matchMedia 订阅 | 最多 2 个监听（theme auto、reduced-motion），组件卸载即解绑 | 无轮询 |

性能策略：
- **store 细粒度**：将 `config` 派生为按字段的 derived（如单独的 `theme$`/`dir$`/`size$`），下游只订阅所需字段，避免一处变更触发全量重渲染。
- **无虚拟化/惰性渲染需求**：非列表组件，不涉及虚拟化；不涉及 `destroyOnClose`（无浮层）。
- **SSR**：服务端零 `window` 访问，无 hydration 闪烁（暗色首屏由应用在 SSR 阶段预置 `data-cd-theme`，ConfigProvider 与之协同）。
- **嵌套合并**：`mergeConfig` 为浅合并纯函数，O(字段数)，无深拷贝。

## 10. AI 元数据

提供 `component.meta.ts`（`ConfigProvider.meta`），供 AI/低代码消费：

```ts
export const meta = {
  name: 'ConfigProvider',
  category: 'other',
  stage: 'M6',
  semiEquivalent: 'ConfigProvider',
  headless: '@chenzy-design/core#createConfigProvider',
  render: '@chenzy-design/svelte#ConfigProvider',
  singleton: true,            // 通常应用唯一（可嵌套用于局部覆盖）
  rootLevel: true,            // 建议置于应用根
  rendersDom: false,          // 默认 wrap=false 无 DOM
  props: ['locale','theme','dir','size','getPopupContainer','zIndexBase','transition','scrollLock','wrap','as','getValidateMessages'],
  events: ['themeChange','localeChange','dirChange','configChange'],
  slots: ['default'],
  provides: ['locale','theme','dir','size','motionEnabled','getPopupContainer','zIndexBase'], // 注入到 context 的能力
  a11y: { reducedMotion: true, rtl: true, liveAnnouncerRoot: true },
  i18nKeys: ['ConfigProvider.missingLocaleWarning'],
  whenToUse: '应用最外层统一 locale/theme/dir/size；或局部子树覆盖配置',
  whenNotToUse: '仅需单组件一次性覆盖时直接用该组件 props',
} as const;
```

## 11. 测试

- **单元（core）**：
  - `mergeConfig`：嵌套浅合并、`undefined` 继承、字段优先级（组件 > 近 Provider > 默认）。
  - `theme="auto"`：mock `matchMedia`，验证系统切换时 `resolvedTheme` 与 `themeChange` 事件。
  - reduced-motion：mock 媒体查询，验证 `motionEnabled` 与 `transition` 取与逻辑。
  - SSR：无 `window` 环境下 `createConfigProvider` 不抛错，`resolvedTheme` 回退正确。
- **组件（svelte / @testing-library/svelte）**：
  - `wrap=false` 不产生额外 DOM；`wrap=true` 渲染单一带 `data-cd-theme`/`dir`/size class 的元素。
  - context 下发：子组件经 `getConfigContext()` 读到正确 locale/size/dir。
  - 无 Provider 时 `getConfigContext()` 返回内置默认 config。
- **集成**：嵌套两层 Provider，内层仅覆盖 `dir`，验证子树 `locale`/`theme` 仍继承外层。
- **a11y**：axe 扫描 `wrap=true` 容器无新增违规；验证 root live region 唯一性。
- **i18n**：切换 `locale` 后下游 `Intl` 输出区域正确；缺失 key 回退 `en`。
- **视觉回归**：light/dark 两套主题下，包裹子树的代表性组件快照对比。
- **类型**：`tsd` 校验 props 联合类型与 `ResolvedConfig`。

## 12. 验收标准 Checklist

- [ ] `wrap=false`（默认）不向 DOM 注入任何额外节点；`wrap=true` 仅渲染单一容器且 `display:contents` 不破坏布局。
- [ ] 嵌套 Provider 按字段浅合并，`undefined` 字段正确继承父级，组件级 prop 优先级最高。
- [ ] `theme="auto"` 跟随系统 `prefers-color-scheme`，切换时派发 `themeChange` 且 `resolvedTheme` 正确；SSR 无 `window` 访问、无 hydration 报错。
- [ ] `dir` 写入作用域根，下游逻辑属性样式在 RTL 下正确镜像。
- [ ] `size` 作为默认值被未显式指定 size 的下游组件继承，优先级符合约定。
- [ ] `prefers-reduced-motion` 被订阅并派生 `motionEnabled`，与 `transition` 取与下发，满足 WCAG 2.3.3。
- [ ] 暗色主题 token 文本对比度 ≥ AA（4.5:1 / 大字 3:1）。
- [ ] 全局浮层读取 `getPopupContainer` 与 `zIndexBase`；root live region 全局唯一。
- [ ] 组件自身零硬编码用户可见文案；dev 警告措辞含可操作建议。
- [ ] 所有注入值仅经 Context/store 下发，组件不写死颜色/尺寸；Component token 仅消费 Alias。
- [ ] 提供 `ConfigProvider.meta.ts` 且字段与实际 API 一致。
- [ ] headless 逻辑位于 `@chenzy-design/core#createConfigProvider`，渲染层 `@chenzy-design/svelte#ConfigProvider` 保持极薄。
- [ ] gzip 体积满足 Perf Budget（svelte ≤ 1.2 KB，core ≤ 1.5 KB）。
- [ ] 配置变更按字段细粒度传播，无整树重渲染。
