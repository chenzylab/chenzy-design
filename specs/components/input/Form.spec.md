# SPEC · Form
> 分类：input · 阶段：M2
> 对标 Semi：Form

## 1. 概述

Form 是表单容器组件，负责承载并编排一组输入控件（Input/Select/Checkbox/Radio/DatePicker 等），提供字段注册、值收集、校验、错误展示与布局四大核心能力。它向下通过 Context 暴露表单实例，向上通过受控 `value`/`on:change` 或非受控 `initValues` 管理整棵表单状态树。

适用场景：登录/注册、设置面板、数据录入、筛选条件区、向导步骤表单。区别于单个 Input 的局部受控，Form 关注**跨字段聚合状态**（dirty/touched/validating/errors）与**提交生命周期**。

核心子组件：
- `Form`：容器，持有 `createForm` 实例，提供 Context。
- `Form.Field`（或 `cd-form-field`）：单字段包裹器，完成注册、Label、必填星标、错误/提示文案、校验态联动。
- `Form.Section` / `Form.Slot`：分组与自由插入。
- `Form.ErrorMessage` / `Form.Label`：可独立组合的原子。

为获得"开箱即用"体验，Form 同时提供已绑定的字段封装（如 `Form.Input`、`Form.Select`），等价于 `Form.Field` + 对应控件，自动接管 `value`/`on:change`/`status`。

非目标：不内置网络提交（仅暴露 `on:submit` 携带校验结果）；不内置复杂联动 DSL（通过 `dependencies` + 函数式 rules 表达）。

## 2. 设计语义

- **Label 位置**：`labelPosition: top | left | inset`。`top` 为移动优先默认；`left` 为桌面密集表单，配合 `labelWidth` 对齐；`inset` 为浮动标签。
- **必填指示**：必填字段在 Label 前/后显示 `--cd-color-danger` 星标（`requiredMark: true | false | 'optional'`，`optional` 反转为给非必填打"选填"标记）。
- **校验态语义**：字段 `status` 三态映射颜色——`default` 用 `--cd-color-border`，`warning` 用 warning 色，`error` 用 `--cd-color-danger`；错误文案颜色与控件描边同源，保证关联性。
- **错误展示时机**：`validateTrigger: change | blur | submit | mount`，默认 `blur` 首次校验、`change` 后续实时（"懒首次、急修正"），减少输入中途红字打扰。
- **额外文案层级**：`extraText`（中性辅助说明，常驻）与 `errorMessage`（校验失败，替换或叠加 extraText，由 `showValidateIcon` 决定是否带图标）。
- **间距节奏**：字段纵向间距由 `--cd-form-item-gap` 控制，密度随 `size` 联动（small 紧凑表单）。
- **反馈即时性**：提交时滚动并聚焦到首个错误字段（`scrollToError`），符合"错误可达"原则。
- **布局**：基于 Grid/Flex 的 `Form.Section` + 字段 `span`，支持响应式列数；不与外部布局组件耦合。

## 3. 分层实现

属于"重交互/重状态"组件，逻辑下沉 core，渲染留 svelte。

**@chenzy-design/core · `createForm(options)`** —— 框架无关的表单状态机：
- 状态树：`values / initialValues / errors / warnings / touched / dirty / validating / submitting / submitCount`。
- 字段注册表：`registerField(name, { rules, initialValue, dependencies, transform })` → 返回 `{ unregister, getProps }`；支持嵌套路径 `a.b[0].c`（get/set 用 lodash-free 的内部 path util）。
- 校验引擎：内置 rule 类型（`required/type/len/min/max/pattern/enum/validator(async)`），支持 `Promise`、防抖、竞态丢弃（用 `useId` 的递增 token 防过期结果覆盖）。
- 方法：`setFieldValue / setFieldsValue / getFieldValue / validate(names?) / validateField / resetFields / setFields / submit / scrollToField`。
- 订阅：细粒度 selector 订阅（`subscribe(selector, cb)`），避免单字段变更触发全表重渲染。
- 复用原语：`useId`（字段 id/aria 关联、校验 token）；`useLiveAnnouncer`（提交后汇总错误数播报）。`useScrollLock`/`useFocusTrap`/`useDismiss` 不需要（非浮层）。`scrollToError` 自实现 `scrollIntoView` + `focus()`。

**@chenzy-design/svelte** —— 提供 `Form`、`Form.Field`、绑定字段、`Form.Section`：
- 通过 Svelte Context (`setContext`) 下发 form 实例与配置（labelPosition 等）。
- `Form.Field` 用 store 适配 core 的细粒度订阅（`readable` 包裹 `subscribe`），仅订阅自身字段切片。
- 暴露 `bind:this` 上的 form API 与 `let:` 形式的 form 实例（headless 自定义渲染）。

## 4. API

### Props（Form 容器）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `Record<string, any>` | — | 受控整表单值，配合 `on:change`。 |
| `initValues` | `Record<string, any>` | `{}` | 非受控初始值，用于 reset 基准。 |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | 整体排布方向。 |
| `labelPosition` | `'top' \| 'left' \| 'inset'` | `'top'` | Label 相对控件位置。 |
| `labelWidth` | `number \| string` | — | `left` 模式下 Label 固定宽度。 |
| `labelAlign` | `'left' \| 'right'` | `'left'` | Label 文本对齐。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 统一字段尺寸，向子控件下发。 |
| `disabled` | `boolean` | `false` | 禁用整张表单。 |
| `requiredMark` | `boolean \| 'optional'` | `true` | 必填星标策略。 |
| `colon` | `boolean` | `false` | Label 后是否加冒号（受 i18n 影响）。 |
| `validateTrigger` | `'change' \| 'blur' \| 'submit' \| 'mount' \| string[]` | `['blur','change']` | 全局默认校验时机，字段可覆盖。 |
| `showValidateIcon` | `boolean` | `true` | 错误/警告文案是否带状态图标。 |
| `scrollToError` | `boolean \| ScrollIntoViewOptions` | `true` | 提交失败时滚动到首个错误字段。 |
| `stopValidateWithError` | `boolean` | `false` | 字段命中首条错误即停止该字段后续 rule。 |
| `preventDefault` | `boolean` | `true` | 是否拦截原生 submit 默认行为。 |
| `allowEmpty` | `boolean` | `false` | 收集值时是否保留空值字段键。 |
| `getFormApi` | `(formApi: FormApi) => void` | — | Form 挂载后一次性回传内部 FormApi 句柄，供父组件在外部命令式 `setFieldsValue`/`validate`/`validateField`/`resetFields`（Semi getFormApi）。 |
| `onReset` | `() => void` | — | 表单重置时回调（原生 `<button type="reset">` reset 或 `formApi.resetFields()`）。 |
| `onErrorChange` | `(errors: FieldErrors) => void` | — | 任意字段错误集合变化时回调，入参为最新 `formState.errors`（Semi onErrorChange）。 |

### Props（Form.Field / 绑定字段）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `field` | `string` | **必填** | 字段路径（支持 `a.b[0]`）。 |
| `label` | `string` | — | 字段标签。 |
| `rules` | `Rule[]` | `[]` | 校验规则数组。 |
| `initValue` | `any` | — | 字段级初始值（覆盖容器）。 |
| `required` | `boolean` | `false` | 语义必填（等价 `{required:true}` rule，控制星标）。 |
| `validateStatus` | `'default' \| 'warning' \| 'error'` | — | 外部强制校验态（受控展示）。 |
| `extraText` | `string \| Snippet` | — | 中性辅助说明。 |
| `dependencies` | `string[]` | `[]` | 依赖字段变化时重新校验。 |
| `trigger` | `string \| string[]` | 继承容器 | 字段级校验时机覆盖。 |
| `noStyle` | `boolean` | `false` | 仅注册不渲染布局（纯收集）。 |
| `span` | `number` | — | `Form.Section` 栅格内占列。 |
| `valuePropName` | `string` | `'value'` | 绑定到子控件的值属性名（如 Checkbox 用 `checked`）。 |
| `transform` | `(v) => any` | — | 提交前值转换。 |

### Events

| Event | payload | 说明 |
|-------|---------|------|
| `change` | `{ values, field?, value? }` | 任一字段值变化（受控同步）。 |
| `submit` | `{ values, errors }` | 提交触发，`errors` 为空对象表示校验通过。 |
| `submitFail` | `{ errors, values }` | 校验未通过的提交。 |
| `reset` | `{ values }` | 调用 reset 后。 |
| `valuesChange` | `{ changed, all }` | 增量值变化（含 setFieldsValue）。 |
| `fieldValidate` | `{ field, status, errors }` | 单字段校验完成。 |

### Slots

| Slot | props (`let:`) | 说明 |
|------|----------------|------|
| `default` | `let:form`（form 实例 API） | 表单主体，放置字段。 |
| `header` | — | 表单标题区。 |
| `footer` | `let:form` | 操作区（提交/重置按钮），可读 `submitting`。 |
| (Field) `default` | `let:value let:onChange let:status let:onBlur` | 自定义控件渲染（headless 字段）。 |
| (Field) `extra` | — | 替换 `extraText` 的富内容。 |
| (Field) `error` | `let:errors` | 自定义错误渲染。 |

## 5. 主题 / Token 表

仅消费 Alias / Component 级，禁止硬编码。

| Component Token | 引用 Alias | 用途 |
|-----------------|-----------|------|
| `--cd-form-item-gap` | `--cd-spacing-loose` | 字段纵向间距 |
| `--cd-form-label-color` | `--cd-color-text-0` | Label 文本色 |
| `--cd-form-label-font-weight` | `--cd-font-weight-regular` | Label 字重 |
| `--cd-form-label-gap` | `--cd-spacing-tight` | Label 与控件间距 |
| `--cd-form-required-color` | `--cd-color-danger` | 必填星标色 |
| `--cd-form-optional-color` | `--cd-color-text-2` | "选填"标记色 |
| `--cd-form-extra-color` | `--cd-color-text-2` | 辅助说明文案色 |
| `--cd-form-error-color` | `--cd-color-danger` | 错误文案/描边 |
| `--cd-form-warning-color` | `--cd-color-warning` | 警告文案/描边 |
| `--cd-form-error-font-size` | `--cd-font-size-small` | 错误文案字号 |
| `--cd-form-label-width` | — (由 `labelWidth` prop 注入) | left 模式 Label 宽 |
| `--cd-form-section-gap` | `--cd-spacing-normal` | Section 列/行间距 |

尺寸联动：`size=small` 时 `--cd-form-item-gap` 降一档（`--cd-spacing-normal`），`large` 升一档。暗色模式由 Alias 层自动切换，组件层无需分支。

## 6. 无障碍

遵循 WAI-ARIA APG，表单字段为原生 form controls，避免自定义 role。

- **关联**：每个 `Form.Field` 用 `useId` 生成 `id`，Label 用 `for={id}`；控件 `aria-describedby` 指向 `extraText` 节点 id；错误时追加 `error` 节点 id。
- **必填**：必填控件 `aria-required="true"`；星标本身 `aria-hidden="true"`（避免读屏念"星号"），必填语义靠 `aria-required`。
- **错误态**：失败控件 `aria-invalid="true"`；错误文案容器 `role="alert"` 或 `aria-live="polite"`（实时校验用 polite，提交汇总用 `useLiveAnnouncer` 播报"N 个字段校验失败"）。
- **键盘**：Enter 在单行输入内触发 submit（可由 `preventDefault` 控制）；提交失败后焦点移至首个错误字段（`scrollToError` + `.focus()`）。表单不劫持 Tab，保持自然 tab 序。
- **焦点管理**：reset 不抢焦点；`scrollToField(name)` 公开 API 供外部跳转。
- **对比度**：错误红字/描边对背景须 ≥ 4.5:1（normal text），由 `--cd-color-danger` Alias 保证；星标对比度同样达标。
- **reduced-motion**：`scrollToError` 在 `prefers-reduced-motion: reduce` 下使用 `behavior:'auto'` 而非 smooth。
- **RTL**：`labelPosition:left` 在 RTL 下 Label 居右起，星标镜像；冒号位置随 `dir` 翻转；用逻辑属性（`margin-inline-start`）而非 left/right。

## 7. 国际化

用户可见文案零硬编码，经 i18n provider 注入；日期/数字校验提示用 `Intl`。

| i18n key | 默认值（zh） | 说明 |
|----------|-------------|------|
| `Form.required` | `{label}为必填项` | 必填校验默认错误 |
| `Form.optional` | `选填` | optional 标记 |
| `Form.typeError` | `{label}格式不正确` | 类型校验失败 |
| `Form.minLength` | `至少输入 {min} 个字符` | 长度下限 |
| `Form.maxLength` | `最多输入 {max} 个字符` | 长度上限 |
| `Form.min` | `不能小于 {min}` | 数值下限 |
| `Form.max` | `不能大于 {max}` | 数值上限 |
| `Form.pattern` | `{label}格式不符合要求` | 正则校验 |
| `Form.submitFailAnnounce` | `{count} 个字段校验未通过` | 屏幕阅读器汇总播报 |
| `Form.colon` | `：` | 冒号符号（部分语言无冒号或用半角） |

- 校验内插值（min/max/len）通过 `Intl.NumberFormat` 本地化数字；日期类规则提示走 `Intl.DateTimeFormat`。
- 规则可返回 i18n key 或函数 `(label, locale) => string`，便于业务覆盖。
- Label 缺省时插值用 `{field}` 兜底。

## 8. 文案

遵循 content-guidelines：

- 错误文案聚焦"如何修正"而非指责：用"请输入有效的邮箱地址"而非"邮箱错了"。
- 必填提示简洁，避免冗余"该字段是必须填写的"，统一"为必填项"。
- `extraText` 用于前置引导（如"密码需 8 位以上"），减少校验失败概率。
- 句末标点：错误短句不加句号，与 Semi 一致。

**危险操作文案（单列）**：Form 自身无破坏性动作，但其 footer 常承载"重置/清空"。当 `reset` 会清除用户已填大量内容时，调用方应二次确认；推荐文案 key `Form.resetConfirm`（默认"确定清空已填写的内容？"），破坏性按钮文案用动词明确"清空"，避免模糊的"确定"。该确认由调用方用 Modal/Popconfirm 实现，Form 不内置。

## 9. 性能

| 指标 | 预算 | 说明 |
|------|------|------|
| `@chenzy-design/core` createForm (gzip) | ≤ 4.5 KB | 状态机 + 校验引擎 + path util |
| `@chenzy-design/svelte` Form 套件 (gzip) | ≤ 6.15 KB | Form/Field/Section/绑定字段 |
| 单字段输入 → 重渲染范围 | 仅该 Field | 细粒度 selector 订阅，O(1) |
| 100 字段表单首屏渲染 | < 16ms（无虚拟化） | 字段轻量；超 200 字段建议分步/折叠 |
| validate(全表 200 字段，同步规则) | < 8ms | 规则短路 + 批量 |
| 异步校验竞态 | token 丢弃过期结果 | 无内存泄漏 |

- **不内置虚拟化**：表单字段语义需全部可达（tab/校验/提交），虚拟化破坏可访问性；超长表单推荐 `Form.Section` 折叠或多步表单。
- **惰性**：`noStyle` 字段不渲染布局 DOM；条件字段卸载时自动 `unregister`，可选 `preserve` 保留值。
- **防抖**：异步 `validator` 默认 300ms 防抖，`change` 触发时合并。
- 受控模式下 `value` 整体替换有成本，大表单优先非受控 + `getFieldsValue()`。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：

- `name: 'Form'`，`category: 'input'`，`stage: 'M2'`，`semiEquivalent: 'Form'`。
- `subComponents: ['Form.Field','Form.Section','Form.Slot','Form.Input','Form.Select', ...]`。
- `props` schema（类型、默认值、枚举、`controlled` 标记 value/on:change）。
- `events` 与 payload 形状。
- `slots` 及其 `let:` 暴露变量。
- `a11y`：role/aria 摘要、APG 模式引用。
- `tokens`：组件级 token 列表与 Alias 映射。
- `i18nKeys`：全部 key 与插值参数。
- `examples`：登录表单、left 对齐设置表单、异步校验、headless 自定义字段、动态增删字段（list）。
- `aiHints`：常见生成意图（"加一个必填邮箱字段" → `Form.Input field="email" required rules=[type:email]`）。

## 11. 测试

- **core 单测（framework-free）**：注册/注销、嵌套 path get/set、各 rule 类型、异步校验竞态（过期 token 丢弃）、validate 返回结构、resetFields 回到 initialValues、submit 生命周期与 submitCount、dependencies 触发重校验、细粒度 subscribe 仅通知相关切片。
- **svelte 组件测**（@testing-library/svelte）：Label-for 关联、必填星标渲染、错误文案出现/`role=alert`、`aria-invalid` 切换、受控 value/on:change 同步、validateTrigger 各时机、noStyle 字段不渲染布局但参与收集、Section 栅格 span。
- **a11y**：axe 无违规；键盘 Enter 提交、提交失败焦点跳转首错字段、reduced-motion 滚动行为、RTL 快照。
- **i18n**：切 locale 后错误文案与冒号变化、Intl 数字插值快照。
- **视觉回归**：三种 labelPosition × 三 size × 三 status 矩阵；暗色模式。
- **性能基准**：200 字段 validate / 单字段输入重渲染计数断言。

## 12. 验收标准 checklist

- [ ] core `createForm` 框架无关，零 Svelte 依赖，gzip ≤ 4.5 KB。
- [ ] svelte 套件 gzip ≤ 6.15 KB，细粒度订阅生效（单字段输入不触发全表重渲染）。
- [ ] 受控 `value`+`on:change` 与非受控 `initValues` 均工作，reset 回到 initialValues。
- [ ] 支持嵌套路径与动态增删字段，卸载自动 unregister。
- [ ] 全部 rule 类型 + 异步校验，竞态结果正确丢弃。
- [ ] validateTrigger（change/blur/submit/mount）与字段级覆盖正确。
- [ ] Label-for / aria-required / aria-invalid / aria-describedby 关联完整。
- [ ] 错误文案 `role=alert`，提交失败 `useLiveAnnouncer` 汇总播报。
- [ ] 提交失败滚动并聚焦首错字段；reduced-motion 用 auto 滚动。
- [ ] 三 labelPosition、三 size、三 status 视觉正确；RTL 镜像正确。
- [ ] 用户可见文案 100% 走 i18n key，无硬编码；数字/日期用 Intl。
- [ ] 仅消费 `--cd-` Alias/Component token，无硬编码值；暗色自动适配。
- [ ] 危险重置由调用方二次确认，文案 key 已提供。
- [ ] 提供 `component.meta.ts`，schema 覆盖 props/events/slots/tokens/i18n/examples/aiHints。
- [ ] 对比度 ≥ AA（错误红字、星标）；axe 无违规。
