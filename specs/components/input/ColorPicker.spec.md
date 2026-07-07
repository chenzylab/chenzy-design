# SPEC · ColorPicker
> 分类：input · 阶段：M2
> 对标 Semi：ColorPicker

## 1. 概述

ColorPicker 是一个颜色选择控件，用于让用户通过可视化的色相/饱和度面板、滑块及输入框选取颜色，并在 HSV / RGB / HEX 多种格式间切换。它支持透明度（Alpha）调节、预设色板（presets / recent）、以及作为触发器的色块（Trigger）弹出浮层。

典型使用场景：
- 主题/样式编辑器中选取品牌色、背景色、文字色。
- 表单中作为颜色输入字段（受控 `value` + `on:change`）。
- 图形/标注工具中的快速取色（配合预设与最近使用）。

核心能力边界：
- 内置色彩空间转换（HSV ↔ RGB ↔ HEX，含 8 位带 Alpha 的 HEXA）。
- 浮层模式（默认，`open` + `on:openChange` 控制）与内联面板模式（`inline`，无 Trigger）。
- 受控/非受控双模式，`value` 支持对象（`{ h,s,v,a }` / `{ r,g,b,a }`）或字符串（`#RRGGBBAA`）。
- 不负责：渐变（gradient）编辑、吸管取色（EyeDropper 为可选增强，依赖浏览器 API，降级隐藏）、颜色管理 ICC profile。

## 2. 设计语义

- **形态**：由 `cd-colorpicker`（根/Trigger 容器）与 `cd-colorpicker__panel`（浮层面板）两部分组成。面板自上而下为：饱和度-明度方块（`__board`）→ 色相滑块（`__hue`）→ 透明度滑块（`__alpha`，可选）→ 数值区（`__inputs`，含格式切换 `__format`）→ 预设区（`__presets`）。
- **Trigger 默认形态**：一个圆角色块（`__swatch`）显示当前色值；透明色用棋盘格底纹（`__swatch--transparent` 叠加 conic/linear 棋盘）表达 Alpha。
- **尺寸 size**：`small | default | large`，影响 Trigger 色块尺寸、滑块手柄直径与输入框高度。Token 化（见第 5 节），不写死像素。
- **校验态 status**：`default | warning | error`，仅作用于内联输入框/Trigger 边框，复用 `--cd-color-warning` / `--cd-color-danger`。
- **状态语义**：hover（Trigger 边框增强）、focus（手柄/输入框 focus ring）、disabled（降饱和 + 禁交互）、dragging（手柄拖拽中放大反馈）。
- **方向性**：色相/透明度滑块在 RTL 下数值方向需翻转（右为低值），饱和度方块 X 轴翻转。
- **运动**：浮层进出 120ms 缩放+淡入（`--cd-motion-duration-fast`），手柄拖拽无过渡（实时跟手）；`prefers-reduced-motion` 下浮层退化为纯淡入或无动画。

## 3. 分层实现

ColorPicker 含拖拽、键盘、浮层、焦点管理等交互逻辑，采用 headless 分层。

**@chenzy-design/core · `createColorPicker(config)`**
- 职责：维护内部颜色 model（统一以 HSVA 为单一真值源），提供格式转换、受控/非受控状态协调、滑块/方块的指针与键盘交互归一化。
- 复用原语：
  - `useId`：为 board/hue/alpha/inputs 关联 `aria-labelledby` / `for` 生成稳定 id。
  - `useDismiss`：浮层模式下处理点击外部 / Esc 关闭。
  - `useFocusTrap`：浮层打开时（非 inline）将焦点限制在 panel 内，关闭后返还 Trigger。
  - `useLiveAnnouncer`：拖拽/键盘改值时通过 polite 区播报当前色值（如 “HEX #1A73E8, 不透明度 100%”）。
  - `useScrollLock`：仅在移动端全屏面板形态启用（默认关闭）。
  - 自实现 `createSlider2D`（board）与 `createSlider1D`（hue/alpha）原语，封装指针捕获、边界 clamp、键盘步进。
- 导出：`state`（HSVA + 当前格式 + open）、`api`（`setHue/setSaturationValue/setAlpha/setFormat/setHex/setRgb/commit`）、各部件 `getXxxProps()`（role/aria/事件）。
- 纯逻辑、零 DOM 依赖、可被任意框架复用。color 转换工具（`hsvToRgb` 等）放 `@chenzy-design/core/color`，便于 tree-shake 单独引用。

**@chenzy-design/svelte · `ColorPicker.svelte`**
- 消费 `createColorPicker`，负责 DOM 渲染、棋盘格底纹绘制、滑块手柄定位（CSS `inset`/`translate`）、`Popover` 浮层定位（复用内部 `Popover` 组件 / floating 策略）。
- 子组件：`ColorBoard`、`HueSlider`、`AlphaSlider`、`ColorInputs`、`ColorPresets`、`ColorTrigger`，均为薄渲染层。
- 浮层支持 `destroyOnClose` 惰性渲染 panel。

纯展示场景（仅展示一个色块、不可交互）不应使用本组件，应直接用 `<span class="cd-colorpicker__swatch">`。

## 4. API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string \| { h:number; s:number; v:number; a?:number } \| { r:number; g:number; b:number; a?:number }` | — | 受控值。字符串接受 `#RGB/#RRGGBB/#RRGGBBAA/rgb()/rgba()`。配合 `on:change`。 |
| `defaultValue` | 同 `value` | `'#000000'` | 非受控初始值。 |
| `format` | `'hex' \| 'rgb' \| 'hsv'` | `'hex'` | 当前展示/输出格式。受控时配合 `on:formatChange`。 |
| `defaultFormat` | `'hex' \| 'rgb' \| 'hsv'` | `'hex'` | 非受控初始格式。 |
| `alpha` | `boolean` | `true` | 是否显示透明度滑块与 Alpha 输入。 |
| `open` | `boolean` | — | 浮层显隐（受控），配合 `on:openChange`。`inline` 时忽略。 |
| `defaultOpen` | `boolean` | `false` | 非受控初始显隐。 |
| `inline` | `boolean` | `false` | 内联面板模式，不渲染 Trigger 与浮层。 |
| `presets` | `Array<string \| { color:string; label?:string }>` | `[]` | 预设色板。`label` 用于 a11y/tooltip。 |
| `recentColors` | `string[]` | — | 最近使用色（受控展示，配合 `on:recentChange`）。 |
| `maxRecent` | `number` | `8` | 最近使用最大记录数。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸。 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态。 |
| `disabled` | `boolean` | `false` | 禁用。 |
| `eyeDropper` | `boolean` | `false` | 启用屏幕吸管（依赖 `window.EyeDropper`，不支持时自动隐藏按钮）。 |
| `outputUppercase` | `boolean` | `true` | HEX 输出/展示是否大写。 |
| `placement` | `'top' \| 'bottom' \| 'top-start' \| ...` | `'bottom-start'` | 浮层方位。 |
| `getPopupContainer` | `() => HTMLElement` | `() => document.body` | 浮层挂载容器。 |
| `destroyOnClose` | `boolean` | `false` | 关闭时销毁面板 DOM。 |
| `zIndex` | `number` | `--cd-z-popover` | 浮层层级。 |
| `closeOnSelect` | `boolean` | `false` | 选中预设/确认后是否关闭浮层。 |
| `triggerType` | `'click' \| 'hover'` | `'click'` | 浮层触发方式。 |
| `id` | `string` | 自动生成 | 根 id，用于 label 关联。 |
| `aria-label` | `string` | — | 无可见 label 时的可访问名。 |

### Events

| 事件 | 回调签名 | 触发时机 |
| --- | --- | --- |
| `on:change` | `(detail: { value: string; hsva: {h,s,v,a}; rgba: {r,g,b,a}; hex: string }) => void` | 颜色变化（拖拽/键盘/输入/预设）。提交时（非每帧 throttle）触发。 |
| `on:input` | 同 `change` | 拖拽过程中的实时高频变化（用于联动预览）。 |
| `on:formatChange` | `(detail: { format: 'hex'\|'rgb'\|'hsv' }) => void` | 用户切换格式。 |
| `on:openChange` | `(detail: { open: boolean }) => void` | 浮层显隐变化。 |
| `on:recentChange` | `(detail: { recentColors: string[] }) => void` | 最近使用列表更新（提交新色后）。 |
| `on:presetClick` | `(detail: { color: string; index: number }) => void` | 点击预设色。 |
| `on:focus` / `on:blur` | `(e: FocusEvent) => void` | Trigger / 面板焦点进出。 |

### Slots

| Slot | 作用域参数 | 说明 |
| --- | --- | --- |
| `children` | — | 自定义触发器内容，替换默认色块（仅浮层模式；对齐 Semi children）。 |
| `topSlot` | — | 面板顶部自定义区（如标题）。 |
| `bottomSlot` | — | 面板底部自定义区（如确认/取消按钮）。 |

## 5. 主题 / Token

组件仅消费 Alias 与 Component 级 Token，禁止写死值。

| Component Token | 默认引用（Alias/Global） | 用途 |
| --- | --- | --- |
| `--cd-colorpicker-trigger-size-sm` | `--cd-size-sm`（如 20px） | small 色块边长 |
| `--cd-colorpicker-trigger-size` | `--cd-size-md`（如 24px） | default 色块边长 |
| `--cd-colorpicker-trigger-size-lg` | `--cd-size-lg`（如 32px） | large 色块边长 |
| `--cd-colorpicker-trigger-radius` | `--cd-radius-sm` | 色块圆角 |
| `--cd-colorpicker-trigger-border` | `--cd-color-border` | 色块/输入边框 |
| `--cd-colorpicker-trigger-border-hover` | `--cd-color-border-hover` | hover 边框 |
| `--cd-colorpicker-panel-bg` | `--cd-color-bg-0` | 面板背景 |
| `--cd-colorpicker-panel-radius` | `--cd-radius-md` | 面板圆角 |
| `--cd-colorpicker-panel-shadow` | `--cd-shadow-popover` | 面板阴影 |
| `--cd-colorpicker-panel-width` | `240px`（→ Global 间距标度） | 面板宽度 |
| `--cd-colorpicker-board-height` | `160px` | 饱和度方块高度 |
| `--cd-colorpicker-handle-size` | `--cd-size-handle`（如 14px） | 滑块/方块手柄直径 |
| `--cd-colorpicker-handle-border` | `--cd-color-bg-0` | 手柄白色描边 |
| `--cd-colorpicker-handle-shadow` | `--cd-shadow-sm` | 手柄投影 |
| `--cd-colorpicker-slider-height` | `--cd-size-xs`（如 10px） | hue/alpha 轨道高度 |
| `--cd-colorpicker-slider-radius` | `--cd-radius-pill` | 轨道圆角 |
| `--cd-colorpicker-checker-color` | `--cd-color-fill-1` | 透明棋盘格深块颜色 |
| `--cd-colorpicker-focus-ring` | `--cd-color-primary` | focus 高亮 |
| `--cd-colorpicker-preset-gap` | `--cd-spacing-2` | 预设格间距 |
| `--cd-colorpicker-text` | `--cd-color-text-0` | 输入文字 |

暗色模式由 Alias 层（`--cd-color-bg-0` 等）自动切换；棋盘格深块用 `--cd-color-fill-1` 保证两套主题下都有对比。状态色：warning → `--cd-color-warning`，error → `--cd-color-danger`。

## 6. 无障碍（WCAG 2.1 AA）

遵循 WAI-ARIA APG 的 Slider 与 Dialog（浮层）模式。

**角色与属性**
- Trigger：`role="button"`，`aria-haspopup="dialog"`，`aria-expanded`，`aria-label`（默认 i18n `ColorPicker.triggerLabel`，含当前色值如 “选择颜色，当前 #1A73E8”）。
- 浮层：`role="dialog"`，`aria-label`=`ColorPicker.panelLabel`，inline 模式用 `role="group"`。
- 饱和度方块：`role="slider"` 二维语义有限，采用 `role="application"` 包裹 + 自定义键盘说明（`aria-roledescription`=本地化 “饱和度明度选择区”），并提供 `aria-valuetext`（如 “饱和度 60%，明度 80%”）。
- 色相滑块：`role="slider"`，`aria-label`=`ColorPicker.hue`，`aria-valuemin=0` `aria-valuemax=360` `aria-valuenow` `aria-valuetext`（“色相 210 度”）。
- 透明度滑块：`role="slider"`，`aria-valuemin=0` `aria-valuemax=100`，`aria-valuetext`=“不透明度 80%”。
- 输入框：原生 `<input>` 关联 `<label for>`（HEX / R / G / B / A 各自 i18n label）。

**键盘交互**
- Trigger：`Enter`/`Space` 打开；`Esc` 关闭并返还焦点。
- 滑块：`←/→`（hue/alpha）或 `↑/↓` 步进 1，`Shift+方向` 步进 10，`Home/End` 跳极值；二维方块 `↑↓←→` 调明度/饱和度，`Shift` 大步进。
- 预设：`role="listbox"` + `option`，方向键移动、`Enter` 选择、`Home/End` 首尾。
- `Tab` 顺序：board → hue → alpha → format → inputs → presets → footer，浮层内 `useFocusTrap` 循环。

**焦点管理**：打开浮层后焦点移至 board（或 footer 首个交互元素），关闭后返还 Trigger。

**对比度**：手柄白描边 + 投影确保在任意背景色上 ≥3:1 边界可见；输入文字/边框走 Alias 满足 4.5:1。

**reduced-motion**：浮层与手柄过渡在 `prefers-reduced-motion` 下移除。

**RTL**：hue/alpha 轨道与 board X 轴方向翻转，方向键语义随之翻转（视觉左仍为低值）。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key；色值/角度/百分比用 `Intl.NumberFormat`（百分比与度数本地化）。

| i18n key | 默认（zh-CN） |
| --- | --- |
| `ColorPicker.triggerLabel` | 选择颜色 |
| `ColorPicker.triggerLabelWithValue` | 选择颜色，当前 {value} |
| `ColorPicker.panelLabel` | 颜色选择器 |
| `ColorPicker.board` | 饱和度与明度选择区 |
| `ColorPicker.hue` | 色相 |
| `ColorPicker.alpha` | 不透明度 |
| `ColorPicker.hex` | 十六进制 |
| `ColorPicker.red` / `.green` / `.blue` | 红 / 绿 / 蓝 |
| `ColorPicker.formatLabel` | 颜色格式 |
| `ColorPicker.presets` | 预设颜色 |
| `ColorPicker.recent` | 最近使用 |
| `ColorPicker.eyeDropper` | 屏幕取色 |
| `ColorPicker.clear` | 清除 |
| `ColorPicker.confirm` / `.cancel` | 确定 / 取消 |
| `ColorPicker.valueText.hue` | 色相 {deg} 度 |
| `ColorPicker.valueText.sv` | 饱和度 {s}，明度 {v} |
| `ColorPicker.valueText.alpha` | 不透明度 {percent} |
| `ColorPicker.invalidHex` | 无效的颜色值 |

百分比经 `Intl.NumberFormat(locale, { style: 'percent' })`，度数与 RGB 整数经 `Intl.NumberFormat(locale)`。

## 8. 文案

遵循 content-guidelines：
- label 用名词短语，简洁（“色相”而非“请选择色相”）。
- 格式切换用大写缩写 `HEX / RGB / HSV`（约定俗成，不翻译，但读屏走 `aria-label` 本地化全称）。
- 校验提示具体：`ColorPicker.invalidHex` = “无效的颜色值”，配合示例占位 `#1A73E8`。
- aria-valuetext 用完整句式，避免只读数字。

**危险操作文案（单列）**：
- “清除颜色” `ColorPicker.clear`：将当前选择重置为空/透明，属可逆操作，不需二次确认；按钮文案 “清除”，`aria-label` = “清除颜色选择”。
- 无破坏性数据删除操作；最近使用列表清空（若提供）走宿主自定义，不在组件内置危险确认。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| svelte 组件 gzip | ≤ 7.5 KB | `ColorPicker.svelte` + 子组件渲染层 |
| core `createColorPicker` gzip | ≤ 4 KB | 含状态机/交互归一化 |
| core/color 转换 gzip | ≤ 1.2 KB | 可单独 tree-shake 引用 |
| 拖拽帧成本 | < 2ms/frame，60fps | board/slider 用 `transform`/`inset` 定位，避免重排 |
| 浮层首开 | < 16ms | `destroyOnClose` 时惰性挂载 |
| 高频 change | `on:input` 节流到 rAF；`on:change` 仅 commit 触发 | 避免父组件高频重渲染 |

- 棋盘格用纯 CSS（`conic-gradient`/`background`）不用 canvas，省内存。
- board 渐变用 CSS 叠加（白→透明 + 黑→透明 + hue 底色），零 JS 绘制。
- 预设超过 ~64 项时建议宿主分页；组件不内置虚拟化（预设量级小）。
- 浮层支持 `destroyOnClose` 与惰性渲染；inline 模式始终渲染。
- 拖拽期间使用 pointer capture，避免逐帧 hit-test。

## 10. AI 元数据

提供 `component.meta.ts`，导出 `colorPickerMeta`：
- `name`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'ColorPicker'`。
- `props`/`events`/`slots` 的结构化签名（类型、默认值、枚举、是否受控、配对事件：`value↔change`、`open↔openChange`、`format↔formatChange`）。
- `tokens`：第 5 节 Component Token 清单及其 Alias 引用。
- `a11y`：roles（button/dialog/slider/listbox）、APG 模式引用、键盘表。
- `i18nKeys`：第 7 节 key 列表。
- `examples`：受控/非受控、inline、带 Alpha、自定义预设、自定义 trigger slot 等代码片段。
- `aiHints`：常见误用纠正（如“用于纯展示请用 swatch”、“value 受控必须监听 on:change”、“吸管在不支持环境自动降级”）。

## 11. 测试

- **单元（core）**：色彩转换往返一致性（HSV↔RGB↔HEX，含 Alpha 与边界 0/360/100）、HEX 解析容错（3/6/8 位、大小写、带/不带 #）、clamp 边界、受控/非受控状态协调、format 切换不丢精度。
- **交互（component）**：board/hue/alpha 指针拖拽改值、键盘步进（含 Shift/Home/End）、预设点击与选中态、format 切换、输入框非法值回退、`closeOnSelect`、`destroyOnClose`。
- **a11y**：axe 无违规；role/aria-valuetext/aria-expanded 断言；焦点 trap 与返还；键盘全流程可操作（jest-axe + testing-library）。
- **视觉回归**：三种 size、status、暗色、RTL、透明棋盘格、focus ring（Playwright 截图）。
- **i18n**：切换 locale 后 aria-label / valuetext / 百分比格式正确（多 locale 快照）。
- **reduced-motion**：媒体查询下无过渡。

## 12. 验收标准 checklist

- [ ] `value` / `open` / `format` 三对受控属性均有配对事件且非受控默认值可用。
- [ ] HSV/RGB/HEX 三格式互转无损，HEXA（8 位）与 Alpha 正确。
- [ ] HEX 输入容错（3/6/8 位、大小写、缺 #）并对非法值回退 + 提示 `invalidHex`。
- [ ] board/hue/alpha 支持指针拖拽与完整键盘操作（含 Shift/Home/End），RTL 方向正确。
- [ ] 预设、最近使用渲染、选中态、`on:presetClick`/`on:recentChange` 正常。
- [ ] 浮层 `useDismiss`（点击外部 / Esc）、`useFocusTrap`、焦点返还、`placement`/`getPopupContainer`/`zIndex` 生效。
- [ ] `inline` 模式无 Trigger、无浮层逻辑，渲染面板。
- [ ] a11y：role/aria-*、aria-valuetext、对比度、reduced-motion 全部满足，axe 0 违规。
- [ ] 所有可见文案走 i18n，百分比/度数用 Intl 本地化，零硬编码。
- [ ] 仅消费 Alias/Component Token，无写死颜色/尺寸；暗色 + 三 size + status 表现正确。
- [ ] headless 逻辑在 `@chenzy-design/core` 的 `createColorPicker`，渲染在 `@chenzy-design/svelte`；color 工具可单独 tree-shake。
- [ ] gzip 体积满足 Perf Budget；拖拽 60fps；`destroyOnClose` 惰性渲染生效。
- [ ] 提供 `component.meta.ts`（colorPickerMeta），含 props/events/slots/tokens/a11y/i18n/examples/aiHints。
- [ ] `eyeDropper` 在不支持环境自动隐藏，支持环境正常取色。
