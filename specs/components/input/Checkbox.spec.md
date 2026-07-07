# SPEC · Checkbox
> 分类：input · 阶段：M2
> 对标 Semi：Checkbox / CheckboxGroup

## 1. 概述

Checkbox 是用于在一组选项中进行多选，或对单一选项进行开/关二元切换的输入控件。与 Radio 的互斥单选不同，Checkbox 的每一项相互独立。本组件提供三种使用形态：

- **单个 Checkbox**：独立的勾选项，受控值为 `checked: boolean`。常用于"同意协议""记住我"等单一开关。
- **CheckboxGroup**：一组 Checkbox 的容器，统一管理选中集合，受控值为 `value: (string|number)[]`，子项通过 Context 注入，自动处理 name、disabled 透传与选中态联动。
- **半选态（indeterminate）**：第三视觉状态，表达"部分子项选中"。常用于树形/分组的全选控制头。indeterminate 是纯视觉态，不影响 `checked` 的真值，由使用方根据子项状态计算并设置。

能力范围对标 Semi：支持禁用、卡片型（card/pureCard）展示、扩展点击热区（extra/附加描述）、受控与非受控、Group 的横纵排布。

边界：本组件不负责"全选/反选"的业务计算逻辑（由使用方在 onChange 中实现），仅提供 indeterminate 视觉态与 Group 聚合能力。

## 2. 设计语义

- **视觉锚点**：方形勾选框（区别于 Radio 圆形），尺寸随 size 变化（small 14px / default 16px / large 18px）。三态分别为：未选（空心描边框）、选中（实心 primary 填充 + ✓ 图标）、半选（实心 primary 填充 + 横线 indicator）。
- **状态层次**：rest / hover（边框 primary-hover）/ active / focus-visible（2px focus ring）/ checked / disabled（降透明度 + not-allowed）/ error（边框 danger）。
- **命中区域**：label 整体可点击，框与文字之间留 8px。卡片型（card）将整张卡片作为命中区，hover 抬升背景，选中时描边 primary。
- **对齐**：框与文字首行基线对齐；多行文字时框顶部对齐文字首行。
- **动效**：勾选 ✓ 采用 stroke-dashoffset 描边动画（120ms ease-out）；背景填充 100ms。reduced-motion 下取消描边动画，直接显隐。
- **危险语义**：Checkbox 本身不承载危险色，error status 仅表达校验失败（如"必须勾选"），用 danger 边框 + 外部错误文案表达。

## 3. 分层实现

属于复合 + 有键盘/分组/a11y 逻辑的控件，采用 core + svelte 分层。

**@chenzy-design/core · createCheckbox / createCheckboxGroup**
- `createCheckbox(config)`：管理单项受控/非受控状态机，派生 `checked / indeterminate / disabled`，输出 a11y 属性（`role`、`aria-checked`），处理 toggle 逻辑与 change 派发。订阅可选的 Group context。
- `createCheckboxGroup(config)`：维护选中集合 Set，提供 `register/unregister` 子项、`isChecked(value)`、`toggle(value)`，透传 `name/disabled/size/status`，派发 group 级 change。
- 复用原语：
  - `useId`：生成 input id 与 label `for` 关联、`aria-describedby`（extra/错误文案）。
  - `useRovingTabindex`：CheckboxGroup 内可选的方向键导航（type="group" 语义下）。默认每个 checkbox 独立 Tab 可达（多选语义，非 roving）；当作为工具栏/紧凑分组时启用 roving。
  - `useLiveAnnouncer`：在程序化批量改变（全选/清空）时播报选中数量变化（可选）。
- 不需要：useFocusTrap / useScrollLock / useDismiss（无浮层）。

**@chenzy-design/svelte · Checkbox.svelte / CheckboxGroup.svelte**
- 用原生 `<input type="checkbox">` 承载语义与可达性（visually-hidden），自定义视觉层为 `<span class="cd-checkbox__inner">`。`indeterminate` 通过 `bind:this` + `el.indeterminate = ...` 设置（HTML 属性无法声明）。
- CheckboxGroup 通过 Svelte `setContext` 注入聚合状态，Checkbox `getContext` 消费；无 Group 时退回独立模式。
- SSR 安全：初始 checked 直出，indeterminate 在 onMount 后同步 DOM 属性。

## 4. API

### Props · Checkbox

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `checked` | `boolean` | `false` | 受控选中态，配合 `on:change`。 |
| `defaultChecked` | `boolean` | `false` | 非受控初始选中态。 |
| `indeterminate` | `boolean` | `false` | 半选视觉态，独立于 `checked`，不参与真值。 |
| `value` | `string \| number` | `—` | 在 CheckboxGroup 中作为该项标识，聚合到 group value。 |
| `disabled` | `boolean` | `false` | 禁用；Group 的 disabled 优先级更高。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸；在 Group 中由 Group 透传覆盖。 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态，影响边框色。 |
| `type` | `'default' \| 'card' \| 'pureCard'` | `'default'` | 展示形态；card 带边框+背景，pureCard 无边框。 |
| `name` | `string` | `—` | 原生 name，表单提交用；Group 透传。 |
| `extra` | `string` | `—` | 主文案下方的辅助描述（关联 aria-describedby）。 |
| `id` | `string` | 自动生成 | input id，未传则 useId 生成。 |
| `preventScroll` | `boolean` | `—` | 命令式 `focus()` 时是否阻止浏览器滚动文档以显示聚焦元素（对齐 Semi）。 |

### Props · CheckboxGroup

| Prop | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `value` | `(string \| number)[]` | `—` | 受控选中集合，配合 `on:change`。 |
| `defaultValue` | `(string \| number)[]` | `[]` | 非受控初始集合。 |
| `options` | `Array<string \| number \| {label, value, disabled, extra}>` | `—` | 声明式渲染子项；省略则用默认插槽手写 Checkbox。 |
| `direction` | `'horizontal' \| 'vertical'` | `'vertical'` | 子项排布方向。 |
| `disabled` | `boolean` | `false` | 批量禁用全部子项。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 统一尺寸，透传子项。 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 统一校验态，透传子项。 |
| `name` | `string` | `—` | 统一 name 透传，便于表单分组。 |
| `type` | `'default' \| 'card' \| 'pureCard'` | `'default'` | 统一展示形态透传。 |

### Events

| Event | 载荷 (`event.detail`) | 触发组件 | 说明 |
|---|---|---|---|
| `change` | `{ checked: boolean; value?: string \| number; nativeEvent: Event }` | Checkbox | 单项切换时触发（用户交互）。 |
| `change` | `{ value: (string \| number)[]; changed: string \| number; checked: boolean }` | CheckboxGroup | 组内任意项切换后，派发新的选中集合。 |

> 命名遵循一致性约定：受控输入用 `value`/`checked` + `on:change`。半选态不单独派发事件（视觉态，由外部计算）。

### Slots

| Slot | 作用域参数 | 触发组件 | 说明 |
|---|---|---|---|
| `default` | `—` | Checkbox | 标签内容（文本或富内容）。 |
| `extra` | `—` | Checkbox | 辅助描述区，覆盖 `extra` prop。 |
| `default` | `{ value, isChecked }` | CheckboxGroup | 手写子项；未用 `options` 时使用。暴露聚合状态供条件渲染。 |

### Methods · Checkbox

通过组件实例（`bind:this`）调用的命令式方法（对齐 Semi）：

| 方法 | 说明 |
|---|---|
| `focus()` | 聚焦复选框原生 input（尊重 `preventScroll`）。 |
| `blur()` | 移除复选框焦点。 |

## 5. 主题 / Token 表

仅消费 Alias / Component 级 Token，禁止写死值。

| Component Token | 默认引用 (Alias) | 用途 |
|---|---|---|
| `--cd-checkbox-size` | `16px`（small 14 / large 18） | 勾选框边长 |
| `--cd-checkbox-radius` | `var(--cd-radius-sm)` | 框圆角 |
| `--cd-checkbox-border-color` | `var(--cd-color-border)` | 未选边框 |
| `--cd-checkbox-border-color-hover` | `var(--cd-color-primary-hover)` | hover 边框 |
| `--cd-checkbox-bg` | `var(--cd-color-bg-0)` | 未选填充 |
| `--cd-checkbox-bg-checked` | `var(--cd-color-primary)` | 选中/半选填充 |
| `--cd-checkbox-icon-color` | `var(--cd-color-white)` | ✓ / 半选指示器颜色 |
| `--cd-checkbox-label-color` | `var(--cd-color-text-0)` | 标签文字 |
| `--cd-checkbox-extra-color` | `var(--cd-color-text-2)` | 辅助描述文字 |
| `--cd-checkbox-gap` | `var(--cd-spacing-2)` | 框与文字间距 |
| `--cd-checkbox-focus-ring` | `var(--cd-color-primary)` | focus-visible 外环 |
| `--cd-checkbox-border-color-error` | `var(--cd-color-danger)` | error 态边框 |
| `--cd-checkbox-disabled-opacity` | `0.4` | 禁用透明度 |
| `--cd-checkbox-card-bg-hover` | `var(--cd-color-bg-1)` | card 型 hover 背景 |
| `--cd-checkbox-card-border-checked` | `var(--cd-color-primary)` | card 型选中描边 |

对比度：选中态 primary 填充上的白色 ✓ 需 ≥ 3:1（图形对比）；标签文字（text-0 / bg-0）≥ 4.5:1。暗色主题由 Alias 层切换，组件层无需改动。

## 6. 无障碍

遵循 WAI-ARIA APG：单 Checkbox 使用原生 `input[type=checkbox]`；CheckboxGroup 遵循 Checkbox Group 模式。

- **角色与语义**
  - 单项：原生 `<input type="checkbox">`，无需手写 role。半选态设置 `el.indeterminate = true` → AT 自动播报 `aria-checked="mixed"`。
  - Group：容器 `role="group"` + `aria-labelledby`（指向组标题）或 `aria-label`。
  - `extra` / 错误文案通过 `aria-describedby` 关联到 input。
  - error status：input 加 `aria-invalid="true"`。
- **键盘交互**
  - `Tab`：聚焦到 checkbox（默认每项独立可达，符合多选语义）。
  - `Space`：切换选中态。
  - roving 模式（紧凑工具栏）下：方向键移动焦点，`Space` 切换 —— 仅在显式启用时。
- **焦点管理**：使用 `:focus-visible` 渲染 2px focus ring（键盘可见、鼠标点击不显示）；视觉框为自定义元素，但焦点始终在原生 input 上（visually-hidden 不用 `display:none`，保持可聚焦）。
- **对比度**：见第 5 节。focus ring 与背景对比 ≥ 3:1。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时关闭勾选描边/填充动画。
- **RTL**：`[dir=rtl]` 下框与文字左右镜像（框在右），间距逻辑用 `margin-inline-start`。

## 7. 国际化

组件本身无内建可见文案（标签由使用方传入）。仅在以下场景产生需 i18n 的内容：

| i18n key | 用途 | 默认（en / zh） |
|---|---|---|
| `Checkbox.indeterminateLabel` | 半选态对 AT 的补充描述（可选 aria-label 片段） | "partially selected" / "部分选中" |
| `Checkbox.selectedCount` | LiveAnnouncer 播报选中数（程序化批量变更时） | "{count} selected" / "已选 {count} 项" |
| `CheckboxGroup.requiredHint` | 校验提示（外部错误文案常用） | "Please select at least one option" / "请至少选择一项" |

- `selectedCount` 中的 `{count}` 用 `Intl.NumberFormat` 格式化（千分位/本地化数字）。
- 文案插值通过 i18n provider 注入，组件不硬编码。

## 8. 文案

遵循 content-guidelines：

- **标签简洁**：复选项标签为名词或动名词短语，句首大写（en），不加句末标点；避免否定式（用"启用通知"而非"不禁用通知"）。
- **协议类**：勾选后才可继续的场景，标签陈述用户行为："I agree to the Terms"，链接内联。
- **extra 辅助文案**：补充说明，完整句可加句号，颜色弱化（text-2）。
- **校验文案**：错误提示放组件外（如 Form.Item），用 `CheckboxGroup.requiredHint`。

**危险操作文案（单列）**：
当 Checkbox 控制破坏性后果（如"删除时一并清空回收站""下次不再提示此警告"）：
- 文案需明示后果，不依赖颜色：如"Also permanently delete attachments"。
- "不再提示"类降低安全感的项默认 **不勾选**，由用户主动选择。
- 此类项不应放在 card 型大命中区诱导误触；保持默认 type，命中区为标签本身。

## 9. 性能

| 指标 | 预算 / 目标 |
|---|---|
| gzip 体积（Checkbox + Group，svelte 层） | ≤ 3.5 KB |
| gzip 体积（core: createCheckbox/Group） | ≤ 2 KB |
| 首次渲染（单项） | < 1ms |
| Group 100 项渲染 | < 16ms（单帧内） |
| toggle 单项 re-render 范围 | 仅该项 + group 聚合订阅，O(1) |
| 内存（500 项 Group） | < 2MB |

- **虚拟化**：组件不内建。超过 ~200 项的 Group 建议使用方包裹 VirtualList（如长筛选面板）；本组件保证子项可在虚拟容器内正确 register/unregister。
- **惰性渲染**：`options` 模式下不做额外缓存层，依赖 Svelte keyed each。
- **destroyOnClose**：不适用（无浮层）。
- **订阅优化**：Group 用细粒度 store（按 value 切片订阅），避免单项切换触发全组重渲染。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：

- `name`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'Checkbox'`。
- `slots` / `props` / `events` 的结构化描述（类型、默认值、枚举值、必填）。
- `whenToUse` / `whenNotToUse`：多选用 Checkbox；互斥单选用 Radio；单一即时开关用 Switch；超过 5 项且需搜索用 Select multiple。
- `a11yNotes`：indeterminate=mixed、role=group、Space 切换。
- `composedWith`：Form.Item、VirtualList、Tree（全选头）。
- `codeExamples`：单项、Group options、半选全选头、card 型。
- `tokens`：第 5 节 Component Token 清单（供主题工具消费）。
- `i18nKeys`：第 7 节 key 列表。

## 11. 测试

- **单元（core）**：受控/非受控状态机；indeterminate 与 checked 解耦；Group register/unregister/toggle；isChecked 集合计算；defaultValue → value 迁移。
- **组件（svelte）**：
  - 点击标签触发 change，载荷正确（checked + value）。
  - Space 键切换；Tab 可达。
  - indeterminate DOM 属性在 onMount 后正确同步，且 `aria-checked` 报告 mixed。
  - Group disabled 优先级覆盖单项。
  - card / pureCard 命中区与选中描边。
- **a11y（axe / 手测）**：role=group + aria-labelledby；aria-describedby 关联 extra；focus-visible ring 仅键盘出现；对比度断言；reduced-motion 媒体查询生效。
- **i18n**：selectedCount 复数/Intl.NumberFormat；RTL 镜像快照。
- **视觉回归**：三态 × 三尺寸 × 三 status × default/card，明暗主题快照。
- **SSR**：初始 checked 直出无 hydration mismatch；indeterminate 不导致告警。

## 12. 验收标准 Checklist

- [ ] 单项受控 (`checked`+`on:change`) 与非受控 (`defaultChecked`) 均工作正确。
- [ ] CheckboxGroup 受控 (`value`+`on:change`) 聚合集合正确，`options` 与默认插槽两种用法均可用。
- [ ] indeterminate 为纯视觉态，与 `checked` 解耦，DOM `indeterminate` 属性正确同步，AT 播报 `mixed`。
- [ ] Group 透传 `disabled/size/status/name/type` 生效，且 Group disabled 优先级高于单项。
- [ ] 仅消费 `--cd-` Alias/Component Token，无写死颜色/尺寸；暗色主题自动适配。
- [ ] 类名遵循 `cd-checkbox` BEM-like 规范。
- [ ] 键盘：Tab 可达、Space 切换；focus-visible ring 仅键盘可见。
- [ ] a11y：role=group + aria-label(ledby)、aria-describedby、aria-invalid（error）齐备，axe 无违规。
- [ ] reduced-motion 关闭动画；RTL 镜像正确。
- [ ] 用户可见文案零硬编码，i18n key 齐全；selectedCount 用 Intl 格式化。
- [ ] 危险操作类 Checkbox 默认不勾选、命中区不诱导误触、文案明示后果。
- [ ] 性能达标：Group 100 项 < 16ms，单项 toggle O(1) 重渲染范围。
- [ ] core 提供 `createCheckbox` / `createCheckboxGroup`；svelte 层仅渲染。
- [ ] 提供 `component.meta.ts`，字段完整。
- [ ] 单元/组件/a11y/i18n/视觉回归/SSR 测试全部通过。
