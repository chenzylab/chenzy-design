# SPEC · Tabs
> 分类：navigation · 阶段：M3
> 对标 Semi：Tabs

## 1. 概述

Tabs（标签页）用于在同一区域内组织并切换多组对等内容，让用户在有限空间中按主题分区浏览。适用于设置面板、详情页多视图、表单分步浏览等场景。

核心能力：
- 三种视觉风格：`line`（下划线，默认）/ `card`（卡片）/ `button`（分段按钮）。
- 四个标签栏位置：`top`（默认）/ `left` / `right` / `bottom`，`left`/`right` 时标签竖向排列、内容横向并排。
- 可关闭（`closable`，每个面板出现关闭叉）与可新增（`addable`，标签栏尾部出现新增按钮），覆盖"动态标签"场景（如浏览器多 Tab）。
- 受控（`value` + `on:change`）与非受控（`defaultValue`）双模式。
- 标签溢出处理：横向溢出可滚动（`overflow="scroll"`）或折叠进"更多"下拉（`overflow="dropdown"`）。
- 完整键盘导航：遵循 WAI-ARIA APG Tabs 模式，roving tabindex，支持自动/手动激活（`keyboardActivation`）。
- 惰性渲染与缓存：`lazy` 首次激活才挂载、`destroyInactiveTabPane` 切走即销毁。

边界与非目标：不负责路由联动（由使用方监听 `on:change` 自行同步 URL）；不内置可拖拽排序（作为后续 `Tabs.draggable` 增强项，本 SPEC 不含）。

## 2. 设计语义

- **激活态唯一性**：任意时刻 TabList 内有且仅有一个选中标签（`aria-selected="true"`），与之对应的 TabPanel 可见，其余隐藏。
- **line 风格**：选中标签底部出现 2px 主色 ink-bar（指示条），通过 `transform: translateX` + `width` 过渡平滑移动；hover 文本变为 `--cd-color-text-0`。
- **card 风格**：选中卡片背景提升为 `--cd-color-bg-0` 并与内容区无缝衔接（去除相邻边），未选中为 `--cd-color-bg-1`。
- **button 风格**：分段控件，选中段填充主色或浅主色底，整体外包一层 `--cd-color-fill-0` 背景。
- **尺寸**：`small` / `default` / `large` 影响标签内边距、字号、ink-bar 与新增按钮的命中区域。
- **位置语义**：`left/right` 下 ink-bar 变为竖向（右/左边缘条），内容区位于标签栏侧旁；`bottom` 时 ink-bar 在标签顶部。
- **状态层级**：默认 `--cd-color-text-1` → hover `--cd-color-text-0` → 选中 `--cd-color-primary`；禁用标签降低不透明度且不可聚焦/点击。
- **密度**：`type="line"` 默认带 `--cd-tabs-gap` 间距；`card`/`button` 标签相邻紧贴。

## 3. 分层实现

属于有交互/键盘/a11y 逻辑的复合控件，采用 headless + 渲染分层。

**@chenzy-design/core · `createTabs`**
- 维护 `activeKey`（受控/非受控）、标签注册表（顺序、disabled、key）。
- 复用原语：
  - `useRovingTabindex`：TabList 内焦点单一 tab-stop，方向键移动，`keyboardActivation` 决定移动即激活（auto）还是需 Enter/Space 激活（manual）。
  - `useId`：为每个 tab / panel 生成稳定 id，建立 `aria-controls` ↔ `aria-labelledby` 关联。
  - `useLiveAnnouncer`：可选，关闭/新增标签时播报（如"已关闭 X 标签"）。
- 输出：`getRootProps / getListProps / getTabProps(key) / getPanelProps(key)`、`activeKey`、`setActiveKey`、`focusTab(dir)`、`close(key)`、`add()`。溢出测量（scroll/dropdown 判定）暴露 `getOverflowState()`，由渲染层提供尺寸观测。
- 不依赖 DOM，可被任意框架适配；overflow 的 `ResizeObserver` 接线在渲染层注入回调。

**@chenzy-design/svelte · `Tabs` / `Tabs.TabPane`**
- 消费 core，渲染 `line/card/button` 三态、ink-bar 动画、四方向布局、关闭/新增按钮、溢出滚动条与"更多"下拉（复用 Dropdown 组件）。
- 接入 `ResizeObserver` 测溢出；`reduced-motion` 时禁用 ink-bar 过渡。
- 通过 Svelte context 让 `TabPane` 向 `createTabs` 注册自身（key/tab 内容/disabled），支持声明式与 `tabList` 数据驱动两种用法。

## 4. API

### Props

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `string \| number` | — | 受控选中标签 key（配合 `on:change`） |
| `defaultValue` | `string \| number` | 首个标签 | 非受控初始选中 key |
| `type` | `'line' \| 'card' \| 'button'` | `'line'` | 视觉风格 |
| `tabPosition` | `'top' \| 'left' \| 'right' \| 'bottom'` | `'top'` | 标签栏位置 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| `tabList` | `Array<{ tab, itemKey, disabled?, closable?, icon? }>` | — | 数据驱动定义标签（替代 TabPane 子组件） |
| `closable` | `boolean` | `false` | 全局可关闭（可被单标签 `closable` 覆盖） |
| `addable` | `boolean` | `false` | 标签栏尾部显示新增按钮 |
| `keyboardActivation` | `'auto' \| 'manual'` | `'auto'` | 方向键聚焦即激活 / 需确认激活 |
| `overflow` | `'scroll' \| 'dropdown'` | `'scroll'` | 横向溢出处理方式 |
| `lazy` | `boolean` | `false` | 面板首次激活才渲染 |
| `destroyInactiveTabPane` | `boolean` | `false` | 切走即卸载非激活面板 |
| `collapsible` | `boolean` | `false` | `line` 风格溢出时启用折叠箭头/下拉 |
| `renderTabBar` | `(props, DefaultBar) => Snippet` | — | 完全自定义标签栏渲染 |
| `class` / `style` | `string` | — | 根节点透传 |

**Tabs.TabPane Props**

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `itemKey` | `string \| number` | 必填 | 唯一 key，对应 `value` |
| `tab` | `string \| Snippet` | — | 标签标题（文本或自定义内容） |
| `icon` | `Snippet` | — | 标签前置图标 |
| `disabled` | `boolean` | `false` | 禁用该标签 |
| `closable` | `boolean` | 继承 | 覆盖全局可关闭 |

### Events

| Event | Payload | 说明 |
|---|---|---|
| `on:change` | `(key: string \| number)` | 选中标签变化（点击/键盘激活） |
| `on:tabClick` | `(key, event)` | 标签被点击（含已选中标签，未必触发 change） |
| `on:close` | `(key)` | 用户点击关闭叉，使用方据此从数据中移除 |
| `on:add` | `()` | 用户点击新增按钮 |

> 受控模式下 `on:close`/`on:add` 仅发出意图，标签的实际增删由使用方更新 `tabList`/子组件完成。

### Slots / Snippets

| Slot/Snippet | 作用域参数 | 说明 |
|---|---|---|
| `default` | — | 放置 `Tabs.TabPane` 子组件 |
| `tab`（TabPane） | — | 自定义单个标签标题 |
| `tabBarExtraContent` | — | 标签栏额外内容（如右侧操作按钮区） |
| `more` | `{ hiddenTabs }` | dropdown 溢出模式下"更多"项的自定义渲染 |

## 5. 主题 / Token

组件仅消费 Alias 与 Component 级 Token，禁止写死值。

| Component Token | 引用 Alias / 说明 |
|---|---|
| `--cd-tabs-color-text` | `--cd-color-text-1`（未选中标签文本） |
| `--cd-tabs-color-text-hover` | `--cd-color-text-0` |
| `--cd-tabs-color-text-active` | `--cd-color-primary` |
| `--cd-tabs-color-text-disabled` | `--cd-color-text-2` |
| `--cd-tabs-ink-bar-color` | `--cd-color-primary`（line 指示条） |
| `--cd-tabs-ink-bar-size` | `2px`（来自 Global 间距原子） |
| `--cd-tabs-card-bg` | `--cd-color-bg-1`（未选中卡片底） |
| `--cd-tabs-card-bg-active` | `--cd-color-bg-0`（选中卡片底） |
| `--cd-tabs-card-border` | `--cd-color-border` |
| `--cd-tabs-button-bg` | `--cd-color-fill-0`（button 外包底） |
| `--cd-tabs-button-bg-active` | `--cd-color-primary` |
| `--cd-tabs-gap` | line 标签间距（按 size 派生） |
| `--cd-tabs-padding-x` / `--cd-tabs-padding-y` | 标签内边距（随 size 变化） |
| `--cd-tabs-font-size` | 标签字号（随 size） |
| `--cd-tabs-close-color` | `--cd-color-text-2` → hover `--cd-color-danger` |
| `--cd-tabs-focus-ring` | `--cd-color-primary`（键盘焦点环） |

暗色模式由 Alias 层自动切换，组件无需感知。`reduced-motion` 下 `--cd-tabs-transition` 置为 `none`。

## 6. 无障碍（WCAG 2.1 AA / WAI-ARIA APG Tabs）

**角色与关系**
- TabList 容器 `role="tablist"`，`left/right` 时附加 `aria-orientation="vertical"`。
- 每个标签 `role="tab"`，`aria-selected="true|false"`，`aria-controls="<panelId>"`；禁用标签 `aria-disabled="true"`。
- 每个面板 `role="tabpanel"`，`aria-labelledby="<tabId>"`，`tabindex="0"`（面板本身可聚焦以便键盘用户进入内容）。

**键盘交互**
- `Tab`：从 tablist 焦点（仅选中标签为 tab-stop，roving tabindex）跳到当前面板。
- `←/→`（horizontal）或 `↑/↓`（vertical）：在标签间移动焦点；`auto` 模式移动即激活，`manual` 模式仅移动焦点，需 `Enter`/`Space` 激活。
- `Home` / `End`：聚焦首 / 末个可用标签。
- 关闭叉：`Delete` 在聚焦标签上触发 `on:close`（可选增强）；关闭后焦点移至相邻标签。
- 方向键跳过 `disabled` 标签。

**焦点管理**
- 标签删除后焦点回退至前一个（或后一个）可用标签，避免焦点丢失到 body。
- 关闭/新增使用 `useLiveAnnouncer` 以 `aria-live="polite"` 播报变更。

**其他**
- 对比度：文本与背景 ≥ 4.5:1，ink-bar / 边框 ≥ 3:1（非文本）；焦点环 ≥ 3:1。
- `reduced-motion`：禁用 ink-bar 滑动与面板淡入。
- RTL：方向键左右语义镜像，ink-bar 与新增按钮位置随 `dir` 翻转。

## 7. 国际化

用户可见文案零硬编码，均走 i18n key；动态数字用 `Intl.NumberFormat`。

| i18n key | 默认（zh-CN） | 用途 |
|---|---|---|
| `Tabs.close` | 关闭 | 关闭按钮 `aria-label` |
| `Tabs.closeTab` | 关闭标签 {tab} | 带标签名的关闭播报 |
| `Tabs.add` | 新增标签 | 新增按钮 `aria-label` |
| `Tabs.more` | 更多 | dropdown 溢出触发器 `aria-label` |
| `Tabs.tabClosed` | 已关闭标签 {tab} | LiveAnnouncer 播报 |
| `Tabs.tabAdded` | 已新增标签 | LiveAnnouncer 播报 |

RTL 语言（如 ar/he）通过 `dir="rtl"` 触发布局镜像，文案由 i18n 资源提供对应翻译。

## 8. 文案

- 标签标题：简短名词或名词短语，建议 1–4 字 / 1–2 词，避免句子；同组保持词性一致。
- 新增/更多等辅助文案遵循 content-guidelines，使用动词或简洁名词。
- 不在标签内放长说明文字；需要描述时放入面板内容区。

**危险操作（单列）**
- 关闭标签为潜在数据丢失操作。若面板含未保存内容，使用方应在 `on:close` 中拦截并弹出确认（对接 Modal/Popconfirm），确认文案如"关闭后未保存的更改将丢失，确定关闭？"，主操作按钮用 `danger` 语义；关闭叉的 `aria-label` 始终明确为"关闭 {tab}"。

## 9. 性能（Perf Budget）

| 项 | 预算 / 策略 |
|---|---|
| svelte 组件 gzip | ≤ 6.95 KB（不含 Dropdown，dropdown 溢出按需引入） |
| core `createTabs` gzip | ≤ 2 KB |
| 首次渲染（10 标签） | ≤ 8ms（无虚拟化） |
| 标签切换 | 仅切换可见面板，O(1)；ink-bar 用 transform 合成层动画，不触发 layout |
| 溢出测量 | `ResizeObserver` + rAF 节流，避免布局抖动 |
| 大量面板 | `lazy` 惰性挂载；`destroyInactiveTabPane` 释放重内容（如图表/表格）DOM |
| 极多标签（>50） | 推荐 `overflow="dropdown"`；标签栏本身轻量，暂不做标签虚拟化（标记为后续增强） |

策略说明：不默认虚拟化（标签数通常有限）；重内容面板建议开 `destroyInactiveTabPane`；ink-bar 动画走 `transform`/`opacity` 保持 60fps。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'Tabs'`、`category: 'navigation'`、`stage: 'M3'`、对标 `semi: 'Tabs'`。
- `props` / `events` / `slots` schema（类型、默认值、枚举、是否受控）。
- `a11yPattern: 'apg-tabs'`、`primitives: ['useRovingTabindex','useId','useLiveAnnouncer']`。
- `relatedComponents: ['TabPane','Dropdown']`、`compositions`（动态标签、左侧竖向标签、卡片式）。
- `dosAndDonts`：用于标签切换内容、不要塞过长标题、危险关闭需确认。
- `i18nKeys` 清单与 `tokens` 清单，供 AI 生成主题/翻译时引用。

## 11. 测试

- **单元（core）**：`createTabs` 的受控/非受控切换、注册顺序、`disabled` 跳过、`close`/`add` 事件、roving tabindex 焦点序列、`keyboardActivation` auto/manual 分支。
- **组件**：三种 `type` 渲染快照、四 `tabPosition` 布局、`lazy`/`destroyInactiveTabPane` 挂载/卸载断言、溢出 scroll/dropdown 切换。
- **a11y**：axe 零违规；断言 `role`/`aria-selected`/`aria-controls`/`aria-labelledby` 关联；键盘 ←/→/Home/End/Enter/Space 路径；删除标签后焦点落点。
- **交互（Playwright）**：点击切换、键盘导航、关闭叉触发 `on:close`、新增触发 `on:add`、ink-bar 随选中移动、溢出滚动到可见。
- **视觉回归**：line/card/button × top/left/right/bottom × small/default/large 关键组合；暗色模式；RTL；reduced-motion。
- **i18n**：切换 locale 后 `aria-label`/播报文案正确；RTL 布局镜像。

## 12. 验收标准 Checklist

- [ ] 受控（`value`+`on:change`）与非受控（`defaultValue`）均工作，任意时刻仅一个标签 `aria-selected="true"`。
- [ ] `type` 三态（line/card/button）与 `tabPosition` 四向均正确渲染，ink-bar 方向/位置随之适配。
- [ ] `size` 三档影响内边距/字号/命中区域。
- [ ] `closable`（全局+单标签覆盖）触发 `on:close`；`addable` 触发 `on:add`；受控下增删由使用方完成。
- [ ] 键盘：roving tabindex、←/→（或 ↑/↓）、Home/End、跳过 disabled；`keyboardActivation` auto/manual 行为正确。
- [ ] 删除标签后焦点回退到相邻可用标签，不丢失到 body。
- [ ] ARIA 关联完整（tablist/tab/tabpanel + aria-controls/labelledby/selected/orientation/disabled），axe 零违规。
- [ ] `lazy` 首次激活才挂载；`destroyInactiveTabPane` 切走即卸载。
- [ ] 溢出 `scroll` 可滚动至选中、`dropdown` 折叠到"更多"，选中项始终可达。
- [ ] 所有可见文案走 i18n key，无硬编码；RTL 与 reduced-motion 正确。
- [ ] 仅消费 `--cd-` Alias/Component Token，无写死颜色/尺寸；暗色模式自动适配。
- [ ] gzip 体积达标（svelte ≤ 6.95KB / core ≤ 2KB），ink-bar 动画 60fps 无 layout 抖动。
- [ ] 提供 `component.meta.ts` 且字段完整，与 SPEC 一致。
