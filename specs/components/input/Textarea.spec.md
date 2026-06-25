# SPEC · Textarea
> 分类：input · 阶段：M2
> 对标 Semi：Textarea

## 1. 概述

Textarea 是多行文本输入控件，用于采集较长的、可换行的用户输入（评论、备注、描述、富文本草稿源等）。相对单行 Input，它的核心增量能力是：

- **自适应高度（autosize）**：内容增减时高度自动伸缩，可约束最小/最大行数（`minRows`/`maxRows`），超过 `maxRows` 后内部滚动。
- **字符计数（counter）**：可显示 `已输入/上限` 的计数，配合 `maxCount` 在接近/超限时给出视觉反馈与无障碍提示。
- **校验态**：`status` 支持 default/warning/error，与计数超限态联动。

它是一个受控/非受控均支持的表单控件，遵循库统一的 `value + on:change` 约定，可被 Form/FormField 包裹，参与统一的标签、校验与错误展示。

适用：内容长度不定、需要换行；不适用：单行短文本（用 Input）、富文本（用未来的 RichTextEditor）、代码编辑（用 CodeEditor）。

## 2. 设计语义

- **形态**：圆角矩形容器 `cd-textarea`，内部为原生 `<textarea>` 元素 + 可选计数器 + 可选清除按钮区。容器承载边框/背景/聚焦环，textarea 自身透明无边框，保证多元素（计数器、清除）布局一致。
- **状态语义**：
  - 默认 → hover（边框加深 `--cd-color-border-hover`）→ focus（主色描边 `--cd-color-primary` + 聚焦环）。
  - warning/error 用 `--cd-color-warning`/`--cd-color-danger` 覆盖边框与聚焦环；error 优先级高于 warning。
  - disabled 降低不透明度并阻断交互；readonly 保留可读对比度但禁编辑。
- **尺寸**：`small|default|large` 仅影响字号、行高与内边距（不改变 autosize 行数语义）。
- **计数器语义**：常态用 `--cd-color-text-2`（次要文本），超限用 `--cd-color-danger`，作为「即将/已越界」的预警通道，与 status 视觉上区分（计数是字数维度，status 是校验维度）。
- **自适应**：autosize 通过隐藏镜像测量，避免逐帧 reflow 抖动；高度变化使用 `--cd-textarea-transition`，并在 reduced-motion 下关闭。

## 3. 分层实现

本组件交互较轻但存在「测量/计数/受控同步」逻辑，采用 core + svelte 分层：

- **@chenzy-design/core · `createTextarea(config)`（headless）**
  - 维护受控/非受控 value、composition（输入法）状态、字符计数（按 `countGraphemes` 可选用 `Intl.Segmenter` 计算视觉字符而非 UTF-16 length）。
  - autosize 测量算法：维护一个隐藏镜像节点的样式同步与高度计算，输出 `style.height` 与 `overflow`（达到 maxRows 切换为 `auto`）。
  - 复用原语：`useId`（关联 label/counter/aria-describedby）、`useLiveAnnouncer`（计数超限/状态变化的 polite 播报）。无需 useFocusTrap/useDismiss/useScrollLock（非浮层）。
  - 暴露：`getRootProps`/`getTextareaProps`/`getCounterProps`、`state`（value/count/overLimit/focused/composing）、`setValue`/`focus`/`blur`/`clear`/`measure`。
  - composition 期间不触发 `change`/不裁剪超限（避免 IME 中断）。
- **@chenzy-design/svelte · `Textarea.svelte`（渲染）**
  - 绑定 props，使用 `ResizeObserver` 监听容器宽度变化重测；`afterUpdate` 中按需 `measure()`。
  - 不在 SSR 阶段测量（无 DOM），首帧用 `minRows` 估算高度避免布局跳变。
  - 计数器、清除按钮为可选 slot/内建实现，受 `showClear`/`showCount` 控制。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `string` | `''` | 受控值，配合 `on:change` |
| `defaultValue` | `string` | `''` | 非受控初始值 |
| `placeholder` | `string` | `''` | 占位提示，i18n 由调用方提供 |
| `rows` | `number` | `3` | 初始可见行数（autosize 关闭时为固定行数） |
| `autosize` | `boolean \| { minRows?: number; maxRows?: number }` | `false` | 自适应高度；对象形式约束最小/最大行数 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态 |
| `disabled` | `boolean` | `false` | 禁用 |
| `readonly` | `boolean` | `false` | 只读 |
| `showCount` | `boolean` | `false` | 显示字符计数 |
| `maxCount` | `number` | `undefined` | 计数上限（用于计数展示与超限提示） |
| `maxLength` | `number` | `undefined` | 原生硬性长度限制（截断输入） |
| `countGraphemes` | `boolean` | `false` | 按视觉字符（Intl.Segmenter）计数而非 UTF-16 length |
| `showClear` | `boolean` | `false` | 显示清除按钮（非空且聚焦/hover 时） |
| `autoFocus` | `boolean` | `false` | 挂载后自动聚焦 |
| `name` | `string` | `undefined` | 表单字段名 |
| `id` | `string` | 自动生成 | 关联 label/aria |
| `resize` | `'none' \| 'vertical' \| 'both'` | `'none'` | 原生手动调整把手（autosize 时建议 none） |
| `validateStatus` | 同 `status` | — | Form 注入别名（兼容） |
| `class` | `string` | `''` | 透传根类名 |

### Events

| 事件 | payload | 说明 |
|---|---|---|
| `change` | `{ value: string }` | 值变更（composition 结束后触发） |
| `input` | `{ value: string; event: InputEvent }` | 每次输入（含 IME 中间态） |
| `focus` | `FocusEvent` | 获得焦点 |
| `blur` | `FocusEvent` | 失去焦点 |
| `clear` | `void` | 点击清除按钮，值被清空 |
| `enterPress` | `{ value: string; event: KeyboardEvent }` | 按下 Enter（含修饰键信息，供「Ctrl+Enter 提交」场景） |
| `resize` | `{ height: number }` | autosize 高度变化（节流） |
| `compositionStart` | `CompositionEvent` | IME 开始 |
| `compositionEnd` | `CompositionEvent` | IME 结束 |

### Slots

| Slot | 作用域参数 | 说明 |
|---|---|---|
| `prefix` | — | 计数行左侧附加内容（如提示文案） |
| `count` | `{ count: number; maxCount?: number; overLimit: boolean }` | 自定义计数器渲染（覆盖内建） |
| `clearIcon` | — | 自定义清除图标 |

## 5. 主题 / Token 表

组件仅消费 Alias / Component 级 Token，禁止写死值。

| Component Token | 回退 Alias | 用途 |
|---|---|---|
| `--cd-textarea-color-text` | `--cd-color-text-0` | 输入文本色 |
| `--cd-textarea-color-placeholder` | `--cd-color-text-2` | 占位符色 |
| `--cd-textarea-color-bg` | `--cd-color-bg-0` | 背景 |
| `--cd-textarea-color-bg-disabled` | `--cd-color-bg-1` | 禁用背景 |
| `--cd-textarea-color-border` | `--cd-color-border` | 默认边框 |
| `--cd-textarea-color-border-hover` | `--cd-color-border-hover` | hover 边框 |
| `--cd-textarea-color-border-focus` | `--cd-color-primary` | focus 边框 |
| `--cd-textarea-color-border-warning` | `--cd-color-warning` | warning 边框 |
| `--cd-textarea-color-border-error` | `--cd-color-danger` | error 边框 |
| `--cd-textarea-ring-focus` | `--cd-color-primary` | 聚焦环颜色 |
| `--cd-textarea-counter-color` | `--cd-color-text-2` | 计数器常态色 |
| `--cd-textarea-counter-color-over` | `--cd-color-danger` | 计数超限色 |
| `--cd-textarea-radius` | `--cd-radius-md` | 圆角 |
| `--cd-textarea-padding-y` | `--cd-spacing-2` | 垂直内边距 |
| `--cd-textarea-padding-x` | `--cd-spacing-3` | 水平内边距 |
| `--cd-textarea-font-size` | `--cd-font-size-body` | 字号（随 size 切换） |
| `--cd-textarea-line-height` | `--cd-line-height-body` | 行高（autosize 行数计算依据） |
| `--cd-textarea-transition` | `--cd-motion-duration-fast` | 高度过渡时长 |

类名：`cd-textarea`、`cd-textarea__inner`（textarea 元素）、`cd-textarea__footer`、`cd-textarea__counter`、`cd-textarea__clear`；修饰符 `cd-textarea--small/--large`、`cd-textarea--disabled`、`cd-textarea--readonly`、`cd-textarea--warning`、`cd-textarea--error`、`cd-textarea--autosize`、`cd-textarea--over-limit`。

## 6. 无障碍（WCAG 2.1 AA）

- **角色/语义**：使用原生 `<textarea>`，天然具备 `role=textbox` `aria-multiline=true`，无需重写。
- **关联**：根容器/footer 提供 `id`；textarea `aria-describedby` 指向计数器与（Form 注入的）帮助/错误文案；有 label 时由 Form/FormField 用 `for`/`aria-labelledby` 关联。
- **状态暴露**：
  - `status=error` 时 textarea `aria-invalid=true`；warning 不设 `aria-invalid`（非阻断）。
  - `disabled` 用原生 `disabled`；`readonly` 用原生 `readonly`（保留可聚焦与朗读）。
- **计数器**：计数器节点 `aria-hidden=false` 且仅文本；超限/接近上限通过 `useLiveAnnouncer` 以 `aria-live=polite` 播报「已输入 X / 上限 Y，超出 Z 字」，避免每字符刷屏（去抖播报）。计数器本身不抢焦点。
- **键盘交互**：Enter 换行（默认）；`enterPress` 暴露修饰键以便外部实现 Ctrl/⌘+Enter 提交；Tab 正常移焦（textarea 内不捕获 Tab）；清除按钮可 Tab 到达并 Enter/Space 触发，`aria-label` 来自 i18n `Textarea.clear`。
- **对比度**：文本/占位/计数/边框颜色均经 Token 保证 ≥ 4.5:1（占位与计数作为辅助文本仍满足 AA）；聚焦环对比度 ≥ 3:1。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时关闭高度过渡（`--cd-textarea-transition: 0ms`），autosize 直接跳变。
- **RTL**：`dir=rtl` 时占位/文本起始对齐翻转，清除按钮与计数器位置镜像（footer 使用逻辑属性 `padding-inline`），resize 把手保持原生行为。

## 7. 国际化

- 用户可见文案零硬编码，全部经 i18n provider 注入；日期/数字（计数显示）用 `Intl.NumberFormat` 本地化（千分位等）。
- 计数显示格式由 `Textarea.countFormat` 模板控制（如 `{count} / {maxCount}`），便于 RTL/语序适配。

| i18n key | 默认（en） | 说明 |
|---|---|---|
| `Textarea.clear` | `Clear` | 清除按钮 aria-label |
| `Textarea.countFormat` | `{count} / {maxCount}` | 计数显示模板 |
| `Textarea.countOnly` | `{count}` | 无上限时计数模板 |
| `Textarea.overLimitAnnounce` | `Exceeded by {over} characters` | 超限播报 |
| `Textarea.nearLimitAnnounce` | `{remaining} characters remaining` | 接近上限播报 |

## 8. 文案

- 遵循 content-guidelines：占位符用简短引导短语而非完整句（如「描述你的问题」），不以标点结尾；计数器用纯数字 + 模板，不加多余说明。
- placeholder 不承载必填/校验信息（这些由 label/帮助文案表达）。
- **危险操作文案（单列）**：清除按钮会丢弃当前全部输入，属破坏性操作。其 aria-label 用明确动词 `Textarea.clear`（"Clear"/"清空")；若内容较长（如 > 200 字符），建议宿主在清除前用 Popconfirm 二次确认，确认文案示例：「清空全部内容？此操作无法撤销。」（确认按钮 "清空"，取消 "保留"）。组件本身只发 `clear` 事件，不内建确认。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 目标 | 说明 |
|---|---|---|
| gzip 体积（svelte 渲染层） | ≤ 3.75 KB | 单组件，不含 core |
| gzip 体积（core `createTextarea`） | ≤ 2.0 KB | 含 autosize 测量 + 计数（Segmenter 懒用） |
| autosize 单次测量 | ≤ 1ms | 隐藏镜像 + 单次读写，避免 layout thrash（批量读后写） |
| 连续输入帧 | 无掉帧（60fps） | input 处理 O(1)；测量在 `requestAnimationFrame` 合批 |
| 计数（countGraphemes） | 仅在开启时构建 `Intl.Segmenter` 并缓存实例 | 默认按 length，零额外成本 |
| ResizeObserver | 单实例/组件，宽度变化才重测 | 卸载时断开 |

- 不需要虚拟化（单输入框）。`Intl.Segmenter` 惰性创建并按 locale 缓存。autosize 镜像节点复用、组件销毁时移除。无浮层，故无 `destroyOnClose`。SSR 不测量，hydration 后首帧 `measure()` 一次。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：

- `name: 'Textarea'`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'Textarea'`。
- `capabilities: ['multiline', 'autosize', 'char-count', 'clearable', 'validation-status']`。
- `props`/`events`/`slots` 的结构化描述（类型、默认值、枚举、是否受控）供 AI 生成与校验。
- `a11y`: role/aria 映射、键盘表。
- `tokens`: 第 5 节 Component Token 列表与回退链。
- `i18nKeys`: 第 7 节 key 列表。
- `examples`: 受控、autosize(minRows/maxRows)、showCount+maxCount、错误态、清除等代码片段。
- `antipatterns`: 「用于单行输入」「用 maxLength 替代业务校验」「autosize 同时开启 res:both」。

## 11. 测试

- **单元（core）**：受控/非受控 value 同步；count 计算（length vs grapheme，含 emoji/组合字符）；maxLength 截断；composition 期间不触发 change、不裁剪；autosize 高度在 minRows/maxRows 边界与超 maxRows 切 overflow 的计算。
- **组件（svelte）**：渲染 size/status/disabled/readonly 类名；showCount/showClear 显隐逻辑；clear 触发事件并清空且回聚焦；enterPress 修饰键 payload；ResizeObserver 触发重测。
- **a11y**：axe 无违规；`aria-invalid` 随 error 切换；`aria-describedby` 正确指向计数器；清除按钮键盘可达与 aria-label；reduced-motion 下无过渡。
- **视觉回归**：三尺寸 × 三状态 × (空/有值/超限) × LTR/RTL 快照；autosize 增减行截图。
- **SSR**：服务端渲染不报错、无测量调用，hydration 后高度正确。

## 12. 验收标准 Checklist

- [ ] `value + on:change` 受控、`defaultValue` 非受控均工作，composition 行为正确。
- [ ] autosize 支持 boolean 与 `{minRows,maxRows}`，超 maxRows 内部滚动，无逐帧抖动，reduced-motion 下无过渡。
- [ ] showCount 显示本地化数字，maxCount 超限切 `--cd-color-danger` 并 polite 播报（去抖）。
- [ ] maxLength 硬截断与 countGraphemes（Intl.Segmenter）计数正确（emoji/组合字符）。
- [ ] size(small/default/large)、status(default/warning/error) 视觉与类名正确，error 优先于 warning。
- [ ] disabled/readonly 语义与对比度正确；showClear 显隐与 `clear` 事件、回聚焦正确。
- [ ] 所有可见文案经 i18n（含 clear aria-label、计数模板、播报），无硬编码；RTL 镜像正确。
- [ ] 仅消费 `--cd-` Alias/Component Token，无写死颜色/尺寸；提供完整 Component Token 与回退。
- [ ] a11y：原生 textbox 语义、`aria-invalid`/`aria-describedby` 正确，axe 通过 WCAG 2.1 AA，焦点环对比 ≥ 3:1。
- [ ] 提供 `component.meta.ts`，含 props/events/slots/tokens/i18n/examples/antipatterns。
- [ ] Perf Budget 达标（渲染 ≤ 3.75KB、core ≤ 2KB gzip，测量 ≤ 1ms 合批），SSR 不测量、hydration 正确。
- [ ] 单元/组件/a11y/视觉回归/SSR 测试齐全且通过。
