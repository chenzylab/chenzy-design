# SPEC · Rating
> 分类：input · 阶段：M2
> 对标 Semi：Rating

## 1. 概述

Rating 是一个用于评分与展示评价等级的输入组件。用户通过点击或键盘选择 1~N 个图标（默认星形）表达评分；也可作为只读模式展示既定分值。核心能力：

- **半星（allowHalf）**：单个图标可表达 0.5 粒度，支持点击图标左半 / 右半区域分别设值。
- **自定义字符（character）**：默认星形，可替换为任意图标、文本字符（如「★」「♥」「A」）或按 index 返回不同节点的函数（如等级图标渐变）。
- **键盘可达**：方向键增减分值、Home/End 跳至边界、数字键直接定位，符合 slider 语义。
- **半受控**：value + on:change 受控；defaultValue 非受控。
- **悬停反馈**：hover 时高亮预览分值并触发 on:hoverChange，移出复位至当前 value。
- **附加能力**：count（图标数量）、size、disabled、status 校验态、tooltips（逐项提示文案）、clearable（再次点击当前值清零）。

典型使用场景：商品评价、满意度调研、内容打分、只读评分展示。

## 2. 设计语义

- **粒度（granularity）**：`allowHalf=false` 时步进为 1；`allowHalf=true` 时步进为 0.5。`value` 始终是步进的整数倍。
- **状态机**：每个图标存在三态——empty（< floor(value)）、half（half 落在该位）、full（≤ value）。hover 时以 hoverValue 临时覆盖渲染态，但不改变 value。
- **校验态语义**：`status` 复用全局 Alias，error → `--cd-color-danger`，warning → `--cd-color-warning`，用于「必填未选」等表单场景的色彩反馈，仅改变激活态描边/填充色提示，不改变交互。
- **尺寸**：small=16px / default=20px / large=28px 图标边长，间距随尺寸缩放（`--cd-rating-gap`）。
- **只读 vs 禁用**：`readonly` 表达「展示态，不可交互但视觉正常」；`disabled` 表达「不可用」，整体降透明度且移除焦点。
- **clearable**：点击已选中的当前值清空为 0，鼠标与键盘（Delete/Backspace）一致。
- **动效**：选中/悬停采用 scale + color 过渡（120ms），`prefers-reduced-motion` 下移除缩放与过渡。

## 3. 分层实现

本组件含交互、键盘、a11y 逻辑，采用 core + svelte 分层。

**@chenzy-design/core · `createRating`**
- 维护内部状态：`value`、`hoverValue`、`focusIndex`、`cleanedValue`（half 计算）。
- 暴露 getter：`getItemState(index) → 'empty'|'half'|'full'`、`getActiveValue()`（hover 优先）。
- 行为方法：`setValue`、`hover(index, isHalf)`、`clearHover`、`focusTo(index)`、`onKeydown(event)`。
- 复用原语：
  - `useRovingTabindex`：图标组单一 Tab 停靠点 + 方向键移动焦点/改值（容器 `tabindex=0` 承载 slider 语义，内部用 roving 管理视觉焦点高亮）。
  - `useId`：生成 `aria-labelledby` 关联与 tooltip id。
  - `useLiveAnnouncer`：分值变更时播报「已选 N 星」。
- 不依赖 `useFocusTrap`/`useScrollLock`（无浮层）；tooltips 若启用则由 svelte 层接入 Tooltip 组件。

**@chenzy-design/svelte · `Rating.svelte`**
- 渲染图标列表、半星双层裁剪（full 层 + half 层 `clip-path: inset(0 50% 0 0)`，RTL 镜像）。
- 绑定 mouse/touch/keyboard 事件至 core 方法；管理 `<input type="hidden">` 以支持原生表单提交（name 透传）。
- 通过 slot/character prop 注入自定义字符；tooltips 启用时包裹 Tooltip。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| value | `number` | — | 当前分值（受控），与 on:change 配合 |
| defaultValue | `number` | `0` | 非受控初始分值 |
| count | `number` | `5` | 图标总数 |
| allowHalf | `boolean` | `false` | 是否允许半星（步进 0.5） |
| allowClear | `boolean` | `true` | 点击当前值是否可清零 |
| character | `string \| Snippet \| ((index:number, state) => Snippet)` | 星形图标 | 自定义字符/图标 |
| size | `'small' \| 'default' \| 'large' \| number` | `'default'` | 尺寸，number 为像素边长 |
| disabled | `boolean` | `false` | 禁用 |
| readonly | `boolean` | `false` | 只读展示态 |
| status | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态 |
| tooltips | `string[]` | — | 逐项提示文案，长度应等于 count |
| autoFocus | `boolean` | `false` | 挂载时聚焦 |
| name | `string` | — | 表单字段名（透传隐藏 input） |
| id | `string` | 自动生成 | 根元素 id，关联 aria |
| ariaLabel | `string` | i18n 默认 | 无可视标签时的辅助名 |

### Events

| 名称 | 载荷 (detail) | 说明 |
| --- | --- | --- |
| change | `number` | 分值确定变更（点击/键盘提交） |
| hoverChange | `number` | 悬停预览值变化（移出时为当前 value） |
| focus | `FocusEvent` | 组件获得焦点 |
| blur | `FocusEvent` | 组件失焦 |

> 命名说明：受控值遵循全局约定 `value` + `on:change`；本组件无浮层，故不涉及 open/openChange。

### Slots

| 名称 | 作用域参数 | 说明 |
| --- | --- | --- |
| character | `{ index: number, state: 'empty'\|'half'\|'full', value: number }` | 自定义单个图标渲染，优先级高于 character prop |
| half | `{ index: number }` | 自定义半星左半部分（不提供则复用 character 裁剪） |

## 5. 主题 / Token 表

组件级 Token，全部派生自 Alias，禁止写死值。

| Token | 含义 | 默认引用 |
| --- | --- | --- |
| `--cd-rating-color-active` | 选中/悬停图标色 | `--cd-color-warning`（金色系语义） |
| `--cd-rating-color-empty` | 未选中图标色 | `--cd-color-fill-1` |
| `--cd-rating-color-active-error` | error 态激活色 | `--cd-color-danger` |
| `--cd-rating-color-active-warning` | warning 态激活色 | `--cd-color-warning` |
| `--cd-rating-size-small` | small 边长 | `16px` 经 `--cd-spacing` 派生 |
| `--cd-rating-size-default` | default 边长 | `20px` |
| `--cd-rating-size-large` | large 边长 | `28px` |
| `--cd-rating-gap` | 图标间距 | `--cd-spacing-2` |
| `--cd-rating-disabled-opacity` | 禁用透明度 | `--cd-opacity-disabled` |
| `--cd-rating-focus-ring` | 焦点环 | `--cd-color-focus-ring` |
| `--cd-rating-transition` | 过渡时长曲线 | `--cd-motion-duration-fast` + `--cd-motion-ease-standard` |

暗色模式：`--cd-rating-color-empty` 自动随 `--cd-color-fill-1` 切换，无需组件额外覆盖。

## 6. 无障碍

遵循 WAI-ARIA APG **Slider** 模式（评分本质是离散值滑块）。

- **role/aria**：根容器 `role="slider"`，`tabindex="0"`，`aria-valuemin="0"`、`aria-valuemax={count}`、`aria-valuenow={value}`、`aria-valuetext`（i18n：`"3 颗星，共 5 颗"`，半星为 `"3.5 颗星"`）。`aria-label` 或 `aria-labelledby` 提供名称。`disabled` → `aria-disabled="true"`；`readonly` → `aria-readonly="true"`；error → `aria-invalid="true"`。
- **键盘交互**：
  - `→` / `↑`：+1 步（allowHalf 时 +0.5）
  - `←` / `↓`：-1 步
  - `Home`：设为最小步进值（allowHalf 时 0.5，否则 1）；`End`：设为 count
  - `Delete` / `Backspace`：清零（allowClear 时）
  - `1`~`9` 数字键：直接定位对应整数分值
  - RTL 下左右方向键语义镜像
- **焦点管理**：整个评分为单一 Tab 停靠点（slider）。autoFocus 挂载聚焦。焦点环用 `--cd-rating-focus-ring`，`:focus-visible` 才显示。
- **对比度**：激活态金色与背景需 ≥ 3:1（非文本图形对比，WCAG 1.4.11）；empty 态描边保证可辨识。
- **reduced-motion**：移除 scale 与 color transition。
- **播报**：值变更经 `useLiveAnnouncer` 以 polite 播报 aria-valuetext。
- **触控**：每个可点击半区命中目标 ≥ 24×24px（small 尺寸下整图标作为一个目标，半星靠左右半区分；命中区扩展至满足 2.5.8）。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key。

| key | 默认（zh-CN） | 用途 |
| --- | --- | --- |
| `Rating.ariaLabel` | `评分` | 默认辅助名 |
| `Rating.valueText` | `{value} 颗星，共 {count} 颗` | aria-valuetext / 播报 |
| `Rating.valueTextHalf` | `{value} 颗星，共 {count} 颗` | 半星播报（value 含 .5） |
| `Rating.cleared` | `已清除评分` | 清零播报 |
| `Rating.unrated` | `未评分` | value=0 的 valuetext |

- 数字格式（value/count）经 `Intl.NumberFormat(locale)` 输出，避免半角/全角与小数点分隔符问题（如 `3.5` → 阿拉伯语 `٣٫٥`）。
- RTL：根据 `dir` 镜像图标排列与方向键语义，由 svelte 层读取文档/容器方向。
- tooltips 文案由调用方提供，不内置默认值。

## 8. 文案

遵循 content-guidelines：

- aria-valuetext 使用「N 颗星，共 M 颗」完整表述，避免仅播报数字。
- 占位/默认 ariaLabel 用名词「评分」，不用动词短语。
- 数字与单位之间按语言规则留白（中文不留空格、英文留空格），由 i18n 模板控制。

**危险操作文案（单列）**：清零评分属可逆轻量操作，不弹确认；仅以 `Rating.cleared` 做无障碍播报，不展示破坏性视觉提示。无不可逆危险操作。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| svelte 组件 gzip | ≤ 3.65 KB | 不含图标资源 |
| core `createRating` gzip | ≤ 1.3 KB | 含 roving/id/announcer 接线 |
| 默认图标内联 SVG | ≤ 0.4 KB | 星形单 path |
| 首次渲染 | count≤10 直渲，无虚拟化 | 评分图标数量天然有限 |
| hover 帧成本 | 仅切换 CSS class，无 DOM 重建 | hover 通过 data-state + CSS 渲染 |
| 大 count（如 count>20） | 建议 readonly 展示或 character 简化 | 非典型场景，不做特殊优化 |

- **不需要虚拟化**：图标数量恒定且小。
- **无浮层**，故无 destroyOnClose；tooltips 启用时 Tooltip 自身惰性渲染。
- **运行时**：half 计算与 state 派生为 O(count) 纯函数，hover/keydown 不触发布局抖动（裁剪用 clip-path）。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：

- `name: 'Rating'`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'Rating'`。
- `props` schema（类型、默认值、枚举、是否受控）与 `events`/`slots` 描述，供 AI 生成与校验。
- `a11yPattern: 'slider'`、`keyboardMap`（方向键/Home/End/数字键/清零）。
- `tokens`：第 5 节组件级 Token 列表与 Alias 派生关系。
- `i18nKeys`：第 7 节 key 列表。
- `examples`：基础评分、半星、自定义字符（爱心）、只读展示、表单受控（value + on:change）。
- `doNot`：不要写死颜色值、不要用多个 Tab 停靠点、不要在 reduced-motion 下保留缩放。

## 11. 测试

- **单元（core）**：`getItemState` 三态边界（value=2.5 时各 index 状态）、setValue 步进吸附、allowClear 清零、allowHalf 步进、数字键定位、Home/End/方向键边界裁剪、RTL 方向键镜像。
- **组件（svelte）**：受控/非受控行为、on:change 与 on:hoverChange 触发时机与载荷、hover 移出复位、disabled/readonly 不可交互、隐藏 input 表单提交值、自定义 character（prop / slot / 函数三种形式）。
- **a11y**：axe 无违规；role=slider 与 aria-value* 正确；键盘全流程可操作无鼠标；`prefers-reduced-motion` 下无 transition；焦点环仅 focus-visible 显示；命中目标尺寸 ≥ 24px。
- **视觉回归**：三尺寸 × 三状态（empty/half/full）× 校验态 × 暗色 × RTL 截图基线。
- **i18n**：切换 locale 后 aria-valuetext 与数字格式（含阿拉伯语小数）正确。

## 12. 验收标准 checklist

- [ ] 受控 `value` + `on:change`、非受控 `defaultValue` 均工作
- [ ] `allowHalf` 半星点击（左右半区）与键盘 0.5 步进正确
- [ ] `allowClear` 点击/Delete 清零，并播报 `Rating.cleared`
- [ ] `character` 支持字符串 / Snippet / 函数三种形式；slot 优先级正确
- [ ] 全键盘可操作：方向键 / Home / End / 数字键 / 清零，RTL 镜像
- [ ] role=slider 且 aria-valuemin/max/now/valuetext 正确，axe 无违规
- [ ] `disabled` / `readonly` 视觉与交互语义区分正确
- [ ] `status` 三态色彩复用 Alias（含 error → danger），无写死值
- [ ] 全部组件级 Token 派生自 Alias，暗色模式自动适配
- [ ] 所有可见文案走 i18n key，数字经 Intl 格式化
- [ ] `prefers-reduced-motion` 下移除缩放与过渡
- [ ] 命中目标 ≥ 24×24px，对比度 ≥ 3:1
- [ ] gzip 体积：svelte ≤ 3.65KB、core ≤ 1.3KB
- [ ] 提供 `component.meta.ts`，字段完整且与本 SPEC 一致
- [ ] core/svelte 分层正确，复用 useRovingTabindex/useId/useLiveAnnouncer
