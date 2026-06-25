# SPEC · Tag
> 分类：show · 阶段：M4
> 对标 Semi：Tag / TagGroup

## 1. 概述

Tag（标签）用于对事物进行标记、分类或属性归纳，是高密度信息场景下的轻量展示原子。典型用途包括：状态标记（成功/警告/失败）、分类标记（文章标签、商品属性）、可关闭的筛选条件回显、可选中的多选项（filter chip）。

Tag 默认是**纯展示**组件，但提供两种可交互形态：
- **可关闭（closable）**：右侧出现关闭图标，点击触发 `close`，可受控移除。
- **可选中（checkable）**：整体作为切换控件，点击在选中/未选中态间切换，受控用 `checked + on:change`。

配套 **TagGroup** 用于成组展示，支持 `maxTagCount` 折叠 + `+N` 溢出提示。本 SPEC 同时覆盖 Tag 与 TagGroup。

设计边界：
- 与 Button 区分：Tag 不承担主操作，权重低；交互限于关闭/选中。
- 与 Badge 区分：Badge 是依附于其他元素的小红点/计数，Tag 是独立信息单元。
- 与 Checkbox 区分：checkable Tag 是视觉化的紧凑多选，语义上仍是 checkbox。

## 2. 设计语义

- **形状 type**：`light`（浅色填充，默认）/ `solid`（实色填充）/ `ghost`（描边透明底）。
- **颜色 color**：语义色集合 `grey`（默认）`primary` `success` `warning` `danger` + 调色板色 `blue/cyan/green/orange/purple/red/...`。颜色统一由 `--cd-tag-*` 组件 token 经语义 alias 推导，禁止写死。
- **尺寸 size**：`small`（20px 高）/ `default`（24px）/ `large`（32px），内边距与字号、关闭图标尺寸联动。
- **形态 shape**：`square`（小圆角，默认）/ `circle`（全圆角 pill）。
- **状态语义**：
  - 静态展示：无 hover/focus 态。
  - closable：关闭图标 hover 加深；整体不可聚焦，关闭图标可聚焦。
  - checkable：未选中为 `light/grey`，选中为 `solid/primary`；hover 有底色反馈；可聚焦，焦点环用 `--cd-color-focus`。
- **可视密度**：默认行高紧凑，文本超长由 `cd-tag__content` 单行省略（配合 TagGroup 的 `width`）。
- **动效**：选中/关闭仅用透明度与背景色过渡（120ms），`prefers-reduced-motion` 下禁用过渡。

## 3. 分层实现

| 层 | 内容 |
|----|------|
| `@chenzy-design/core` | `createTag`：仅 checkable/closable 形态需要——提供 `getRootProps`（checkable 时输出 `role/aria-checked/tabindex` 与键盘处理）、`getCloseProps`（关闭按钮 a11y 与事件）、受控/非受控 `checked` 状态机、`close` 派发与可取消语义。`createTagGroup`：折叠计算（`maxTagCount` → 可见项 + 溢出数）、剩余项 popover 触发逻辑。复用 `useId`（关联 label/描述）。 |
| `@chenzy-design/svelte` | 渲染 `cd-tag` DOM、图标插槽、关闭图标、过渡；调用 core 输出的 props spread；纯展示形态（无 closable/checkable）可不引入 core，直接渲染。 |

复用 core 原语：
- `useId`：checkable Tag 与其可见 label 关联、closable 关闭按钮的 `aria-label` 派生。
- TagGroup 溢出 popover 复用 Popover 组件（其内部用 `useDismiss/useFocusTrap`），Tag 本体不直接持有这些原语。
- checkable Tag 的键盘处理（Space/Enter 切换）在 `createTag` 内统一，避免各框架重复实现。

纯展示 Tag 渲染为 `<span>`；checkable 渲染为带 `role="checkbox"` 的可聚焦元素；closable 的关闭区渲染为内嵌 `<button>`。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `type` | `'light' \| 'solid' \| 'ghost'` | `'light'` | 填充形态 |
| `color` | `'grey' \| 'primary' \| 'success' \| 'warning' \| 'danger' \| string` | `'grey'` | 语义色或调色板色名 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| `shape` | `'square' \| 'circle'` | `'square'` | 圆角形态 |
| `closable` | `boolean` | `false` | 是否可关闭 |
| `visible` | `boolean` | `true` | 受控显隐（关闭后由外部置 false 移除） |
| `checkable` | `boolean` | `false` | 是否为可选中 chip |
| `checked` | `boolean` | `false` | 选中态（受控，配合 `on:change`） |
| `disabled` | `boolean` | `false` | 禁用，阻断关闭/选中交互 |
| `prefixIcon` | `Snippet \| Component` | — | 前置图标 |
| `suffixIcon` | `Snippet \| Component` | — | 后置图标（与 closable 互不冲突，关闭图标始终最右） |
| `avatarSrc` | `string` | — | 头像型 Tag 的图片地址 |
| `avatarShape` | `'square' \| 'circle'` | `'square'` | 头像形状 |
| `closeIcon` | `Snippet \| Component` | 内置 X | 自定义关闭图标 |
| `tagKey` | `string \| number` | — | 在 TagGroup 中的稳定标识 |
| `class` | `string` | — | 透传根类名 |
| `style` | `string` | — | 透传根内联样式 |

**TagGroup 专属 Props**

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `tagList` | `TagProps[]` | — | 数据驱动渲染（与默认插槽二选一） |
| `maxTagCount` | `number` | — | 最多展示数量，超出折叠为 `+N` |
| `showPopover` | `boolean` | `false` | `+N` 是否 hover 展开剩余项 |
| `popoverProps` | `PopoverProps` | — | 透传溢出浮层配置 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 统一下发各子 Tag 尺寸 |
| `spacing` | `number` | `8` | 标签间距(px) |

### Events

| 事件 | payload | 说明 |
|------|---------|------|
| `on:close` | `{ tagKey?, originalEvent: MouseEvent \| KeyboardEvent, preventDefault() }` | 点击关闭图标触发；调用 `preventDefault()` 可阻止默认移除/`visibleChange` |
| `on:visibleChange` | `boolean` | `visible` 受控变更（关闭动画结束后） |
| `on:change` | `boolean` | checkable Tag 选中态变更（受控约定，等价 Semi `onChange`） |
| `on:click` | `MouseEvent` | 整体点击（非 closable 区域） |
| TagGroup `on:plusClick` | `MouseEvent` | 点击 `+N` 溢出标记触发 |

> 命名遵循全局约定：选中用 `checked + on:change`；显隐用 `visible + on:visibleChange`（Tag 无浮层，故不用 open/openChange，复用 visible 语义更贴切，TagGroup 溢出浮层走 Popover 的 `open/openChange`）。

### Slots

| 插槽 | 作用域参数 | 说明 |
|------|-----------|------|
| `default` | — | 标签文本内容；TagGroup 中放置子 `<Tag>` |
| `prefixIcon` | — | 前置图标区 |
| `suffixIcon` | — | 后置图标区 |
| `closeIcon` | — | 自定义关闭图标 |
| TagGroup `overflow` | `{ count, restTags: TagProps[] }` | 自定义 `+N` 渲染 |

## 5. 主题 / Token

组件 token 只消费 Alias，禁止写死值。

| Component Token | 取值（引用 Alias / Global） | 说明 |
|-----------------|------------------------------|------|
| `--cd-tag-height-small` | `20px` | small 高度 |
| `--cd-tag-height-default` | `24px` | default 高度 |
| `--cd-tag-height-large` | `32px` | large 高度 |
| `--cd-tag-padding-x` | `var(--cd-spacing-2, 8px)` | 水平内边距 |
| `--cd-tag-gap` | `var(--cd-spacing-1, 4px)` | 文本与图标间距 |
| `--cd-tag-font-size` | `var(--cd-font-size-0)` | 字号 |
| `--cd-tag-radius-square` | `var(--cd-radius-sm)` | 方角圆角 |
| `--cd-tag-radius-circle` | `999px` | pill 圆角 |
| `--cd-tag-color-text` | `var(--cd-color-text-0)` | 文本色（light/ghost） |
| `--cd-tag-color-text-solid` | `var(--cd-color-text-inverse)` | solid 文本色 |
| `--cd-tag-bg-light` | `var(--cd-color-fill-0)` | light 底色（grey） |
| `--cd-tag-bg-solid` | `var(--cd-color-primary)` | solid 底色（按 color 切换语义 alias） |
| `--cd-tag-border` | `var(--cd-color-border)` | ghost 描边色 |
| `--cd-tag-close-color` | `var(--cd-color-text-2)` | 关闭图标默认色 |
| `--cd-tag-close-color-hover` | `var(--cd-color-text-0)` | 关闭图标 hover 色 |
| `--cd-tag-checked-bg` | `var(--cd-color-primary)` | checkable 选中底色 |
| `--cd-tag-checked-text` | `var(--cd-color-text-inverse)` | checkable 选中文本色 |
| `--cd-tag-focus-ring` | `var(--cd-color-focus)` | 焦点环 |
| `--cd-tag-disabled-opacity` | `var(--cd-opacity-disabled, 0.4)` | 禁用透明度 |

语义色映射：`color` 对应 `--cd-color-{success\|warning\|danger\|primary}` 系列 alias，调色板色对应 `--cd-color-{name}-{light/normal}`。所有色值经 alias 解析以保证暗色主题与对比度一致。

## 6. 无障碍（WCAG 2.1 AA）

遵循 WAI-ARIA APG。按形态分级：

**纯展示 Tag**
- 渲染 `<span>`，无 role；不可聚焦；纯文本天然可被读屏顺序读取。
- 若 Tag 仅以颜色表达状态（如红=失败），必须辅以文本/图标，满足「不以颜色为唯一信息载体」。

**closable Tag**
- 关闭区为独立 `<button type="button">`，`aria-label` 来自 i18n `Tag.closeAriaLabel`（插值标签文本，如 "移除 已完成"）。
- 键盘：关闭按钮 `Tab` 可达，`Enter`/`Space` 触发 `close`；Tag 本体不抢焦点。

**checkable Tag**
- 根元素 `role="checkbox"`，`aria-checked` 反映 `checked`，`tabindex=0`（disabled 时 `aria-disabled="true"` 且移出 Tab 序）。
- 键盘：`Space`/`Enter` 切换选中；焦点可见环用 `--cd-tag-focus-ring`，对比度 ≥ 3:1。

**TagGroup**
- `+N` 为 `<button>`，`aria-label` 用 i18n `TagGroup.restCount`（插值数量）；展开 popover 后剩余项可读。

**通用**
- 对比度：solid 态文字/底 ≥ 4.5:1（小字号），light 态文字/底 ≥ 4.5:1，焦点/边框 ≥ 3:1。调色板色需在亮/暗主题双向校验。
- reduced-motion：禁用选中/关闭过渡，立即切换。
- RTL：图标与关闭按钮镜像（关闭图标移到行首/逻辑末尾），内边距使用 `padding-inline`，图标用逻辑属性定位。

## 7. 国际化

用户可见文案零硬编码，全部经 i18n。

| i18n key | 默认值（zh / en） | 用途 |
|----------|-------------------|------|
| `Tag.closeAriaLabel` | `移除 {label}` / `Remove {label}` | closable 关闭按钮无障碍名 |
| `Tag.checkedAriaLabel` | `{label}，已选中` / `{label}, selected` | checkable 读屏补充（可选） |
| `TagGroup.restCount` | `还有 {count} 项` / `{count} more` | `+N` 无障碍名与 tooltip |
| `TagGroup.restPopoverTitle` | `更多标签` / `More tags` | 溢出浮层标题 |

- Tag 文本内容由调用方提供，不强制翻译；组件仅负责自身控制类文案。
- 若 Tag 内展示数字/日期（业务自定义内容），建议调用方用 `Intl.NumberFormat` / `Intl.DateTimeFormat`，组件不内置格式化。

## 8. 文案

遵循 content-guidelines：

- 标签文本应简短（建议 ≤ 4 字 / 1-2 词），名词或形容词，避免句子与句末标点。
- 大小写：英文用 Sentence case 或既定术语，不全大写（除非品牌缩写）。
- 状态语义保持一致：成功类用「已完成/Active」，失败类用「失败/Failed」，避免同义混用。

**危险操作文案（单列）**
- closable Tag 的关闭属轻量可逆操作，关闭按钮无需二次确认；但当移除会触发不可逆业务（如删除已保存筛选）时，调用方应在 `on:close` 中拦截并弹确认（用 Popconfirm/Modal），确认文案遵循危险操作规范：动词明确（"移除"而非"确定"），说明后果，主按钮用 danger 态。
- 不可逆移除的 `aria-label` 应明确为「删除」而非「移除」，避免误导。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
|------|------|------|
| Tag gzip（纯展示） | ≤ 1.2 KB | 无 core 依赖，纯 CSS + span |
| Tag gzip（含 closable/checkable + core） | ≤ 3 KB | 含 `createTag` 状态机 |
| TagGroup gzip | ≤ 2.0 KB（不含 Popover） | 折叠计算逻辑 |
| 首次渲染（单个） | < 0.2ms | 极轻 DOM |
| TagGroup 100 项渲染 | < 16ms | 一帧内完成 |
| 选中/关闭切换 | < 4ms，仅 class 切换 | 不触发重排（过渡走 opacity/bg） |

- **虚拟化**：Tag 本体不需要。TagGroup 超大量（> 200）时建议业务自行虚拟化或用 `maxTagCount` 折叠，组件默认不内置虚拟列表。
- **惰性渲染 / destroyOnClose**：TagGroup 溢出 popover 走 Popover 的 `lazyRender`，未展开不渲染剩余项 DOM。
- **closable 移除**：过渡结束后再卸载（`visibleChange`），避免 DOM 抖动；批量移除合并到一帧。
- 调色板色通过 CSS 变量切换，不为每种颜色打包独立类，控制体积。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'Tag'`，`category: 'show'`，`stage: 'M4'`，对标 `semi: 'Tag/TagGroup'`。
- `capabilities: ['color', 'closable', 'checkable', 'sizes', 'shapes', 'group-overflow']`。
- `props` 反射（类型、默认值、枚举值），`events`、`slots` 结构化列出。
- `aiHints`：「展示状态/分类用纯展示 Tag；可移除筛选条件用 closable + visible 受控；多选筛选用 checkable + checked/on:change；成组超量用 TagGroup + maxTagCount」。
- `antiPatterns`：「不要用 Tag 替代 Button 做主操作」「不要仅用颜色表达状态」「不可逆移除需在 on:close 拦截确认」。
- `relatedComponents: ['Badge', 'Button', 'Checkbox', 'Select', 'Popover']`。

## 11. 测试

- **单元（core）**：`createTag` 受控/非受控 `checked` 切换；`close` 的 `preventDefault` 可取消移除；disabled 阻断交互；`createTagGroup` 折叠计算（maxTagCount 边界 0/1/=length/>length）。
- **渲染（svelte）**：三种 type × 语义色 class 正确；size/shape 映射 token；prefix/suffix/close 插槽渲染顺序。
- **交互**：closable 键盘 Enter/Space 触发 close；checkable Space/Enter 切换 `aria-checked`；disabled 不响应。
- **a11y**：axe 扫描无违规；checkbox role 与 aria-checked 同步；关闭按钮 aria-label 含标签文本；焦点环对比度断言。
- **i18n**：切换 locale 后关闭/`+N` aria-label 更新；插值正确。
- **视觉回归**：亮/暗主题 × 全色板 × 三尺寸快照；RTL 镜像快照；reduced-motion 下无过渡。
- **性能**：TagGroup 100/200 项渲染基准；切换不触发 layout（断言无 reflow API 调用或用性能标记）。

## 12. 验收标准 Checklist

- [ ] 包名 `@chenzy-design/core`（`createTag`/`createTagGroup`）与 `@chenzy-design/svelte` 分层正确，纯展示形态零 core 依赖。
- [ ] 类名前缀 `cd-`，BEM-like（`cd-tag`、`cd-tag__content`、`cd-tag__close`、`cd-tag--solid`、`cd-tag--checked` 等）。
- [ ] 所有色值/尺寸经 `--cd-tag-*` 组件 token 消费 Alias，无写死值；亮/暗主题通过。
- [ ] API 遵循全局约定：`checked + on:change`、`visible + on:visibleChange`，size/status 一致。
- [ ] closable：关闭按钮可聚焦、键盘可触发、`aria-label` 经 i18n 插值；`on:close` 可 `preventDefault`。
- [ ] checkable：`role="checkbox"` + `aria-checked` + 键盘切换，焦点环对比度 ≥ 3:1。
- [ ] 状态不仅以颜色表达（有文本/图标兜底）；对比度 solid/light 文本 ≥ 4.5:1。
- [ ] reduced-motion 禁用过渡；RTL 镜像与逻辑属性正确。
- [ ] 用户可见文案全部经 i18n（`Tag.*` / `TagGroup.*`），无硬编码。
- [ ] TagGroup `maxTagCount` 折叠 + `+N` 溢出（可选 Popover 惰性渲染）工作正确。
- [ ] 危险操作（不可逆移除）支持 `on:close` 拦截确认，文案遵循规范。
- [ ] 提供 `component.meta.ts`，capabilities/aiHints/antiPatterns 完整。
- [ ] 满足 Perf Budget（纯展示 ≤ 1.2KB，含 core ≤ 2.8KB）；单元/a11y/视觉回归测试通过。
