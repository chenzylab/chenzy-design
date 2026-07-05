# SPEC · PinCode

> 分类：input · 阶段：M2（增补，对标 Semi Plus 后补齐）
> 对标 Semi：[PinCode 验证码输入框](https://semi.design/zh-CN/input/pincode)（Semi 2.62.0+）
> 多格独立输入的验证码 / OTP 组件。本 SPEC 对标 Semi 2.101.0 的 API，并在 a11y 上做增强（Semi 现状每格无 aria、无分组语义）。

## 1. 概述

PinCode 用于**分格输入定长验证码 / 一次性密码（OTP）/ 短信码 / 分格密码**。将一个定长字符串拆到 `count` 个独立输入框，逐格填入、自动跳格、支持整串粘贴自动分发到各格。典型场景：登录二次验证、短信验证码、支付密码。

## 2. 设计语义

**何时用**：需要输入固定位数、逐位可见的短码（4~8 位为主），希望比单个 Input 更强的「填格」引导感与自动跳格体验。

**何时不用**：
- 变长 / 长文本 → 用 `Input`。
- 需要遮蔽显示的长密码 → 用 `Input type="password"`（PinCode 定位为可见分格短码；如需遮蔽由使用方在 `format` 外自行处理，本组件不内置 mask）。
- 需要粘贴大段内容 → 非本组件场景。

与 `Input` 的区别：PinCode 是「N 个受控单字符 Input 的编排器」，核心价值在跨格的键盘/粘贴/跳格逻辑，而非单格渲染本身（单格复用 Input 的视觉与尺寸）。

## 3. 分层实现

- **headless（core/）**：需要。`packages/core/src/pincode/createPinCode.ts` 承载框架无关逻辑：
  - 状态：`valueList: string[]`、`activeIndex: number`。
  - `validateChar(char, format)`：按 `format`（number/mixed/RegExp/函数）逐字符校验。
  - `completeSingleInput(index, char)`：写入 → 推进 activeIndex → 判断是否触发 onComplete。
  - `handleKeyDown`：←→ 切格、Backspace（清空+回退）、Delete（清空+前进）边界裁剪。
  - `distributePaste(startIndex, text)`：从某格起逐字符校验分发，遇非法字符停止。
  - 受控/非受控：传 `value` 时不改内部 valueList，依赖外部回写。
  - 输入法组合态（`isComposing`）过滤。
- **渲染（svelte/）**：`PinCode.svelte`。渲染 `count` 个复用本库 `Input` 的单格；根容器 `role="group"`；收集各格 DOM 引用供 focus/blur/粘贴分发。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | `string` | — | 受控值。整串验证码字符串（如 `"123456"`），内部 `split("")` 拆到各格；配合 `onChange`。 |
| `defaultValue` | `string` | `''` | 非受控初始值，仅初始化时拆分。 |
| `count` | `number` | `6` | 验证码位数（格数）。 |
| `format` | `'number' \| 'mixed' \| RegExp \| ((char: string) => boolean)` | `'number'` | 单字符可输入范围。`number`=纯数字（`inputMode="numeric"`）；`mixed`=数字+大小写字母；`RegExp`=逐字符 `test`；函数=逐字符返回 `true` 才允许。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 每格尺寸（透传内部 Input）。 |
| `disabled` | `boolean` | `false` | 禁用全部格。 |
| `autoFocus` | `boolean` | `false` | 挂载时聚焦第一格。**注意默认值偏离 Semi**（Semi 为 `true`）：本库遵循全库「不擅自抢焦点」的 a11y 约定，默认 `false`，登记见 §6。 |
| `name` | `string` | — | 表单字段名，透传隐藏聚合 input，提交整串值。 |
| `id` | `string` | 自动生成 | 根容器 id，关联 aria-labelledby。 |
| `ariaLabel` | `string` | i18n 默认 | 无可视标签时，分组的辅助名（如「验证码」）。 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 校验态，透传各格 Input 边框语义。 |
| `className` | `string` | — | 根容器类名。 |
| `style` | `string` | — | 根容器内联样式。 |

> 命名说明：受控值遵循全局约定 `value` + `onChange`；无浮层，不涉及 open/openChange。`onXxx` callback props 为全库统一记法。

### Events

| 名称 | 载荷 | 说明 |
| --- | --- | --- |
| `onChange` | `(value: string)` | 任一格值变化即触发，回传各格拼接整串（含清空场景）。 |
| `onComplete` | `(value: string)` | 最后一格填入完成时触发一次，回传完整验证码；同时 blur 末格。 |

### Slots

| 名称 | 说明 |
| --- | --- |
| （无） | PinCode 无插槽；单格外观通过 `size`/`status`/token 定制，不开放单格自定义渲染（与 Semi 一致）。 |

### 实例方法（通过 bind 或 action 暴露）

| 方法 | 签名 | 说明 |
| --- | --- | --- |
| `focus` | `(index?: number) => void` | 聚焦第 index 格（默认 0），并将光标置于字符后。 |
| `blur` | `(index?: number) => void` | 移出第 index 格焦点。 |

## 5. 主题 / Token 表

组件级 Token，全部派生自 Alias，禁止写死值。PinCode 单格复用 Input 的填充式 token，仅补分组布局相关。

| Token | 含义 | 默认引用 |
| --- | --- | --- |
| `--cd-pincode-gap` | 相邻格间距 | `--cd-spacing-tight` |
| `--cd-pincode-cell-width-small` | small 单格宽 | 派生自 Input small 高度 |
| `--cd-pincode-cell-width-default` | default 单格宽 | 派生自 Input default 高度 |
| `--cd-pincode-cell-width-large` | large 单格宽 | 派生自 Input large 高度 |
| `--cd-pincode-cell-font-size` | 单格字号 | `--cd-font-size-header-6`（略大于正文，居中显示单字符） |
| `--cd-pincode-cell-text-align` | 单格文字对齐 | `center` |

单格边框 / 背景 / 聚焦 / 校验态复用 `--cd-color-input-*` 与 `--cd-border-thickness-control-focus`（对齐 Input 家族，见记忆 dsm-p2）。暗色模式随 Input token 自动切换。

## 6. 无障碍

Semi 现状是短板（每格裸 input、无分组、无位次播报）。本库对标时**增强**：

- **role/aria**：
  - 根容器 `role="group"`，`aria-label`（i18n 默认）或 `aria-labelledby`（关联外部 label）。
  - 每格 `<input>`：`inputMode` 随 format 切换（number→`numeric`）；`autoComplete="one-time-code"`（OTP 场景系统级填充，超越 Semi）；`aria-label` 提供位次「第 N 位，共 M 位」（i18n）。
  - `status="error"` → 各格 `aria-invalid="true"`；`disabled` → `aria-disabled` + 原生 disabled。
  - `maxlength="1"` 限制单格。
- **键盘交互**：
  - `←` / `→`：切上一格 / 下一格（首末不越界）。
  - `Backspace`：清空当前格并回退到上一格。
  - `Delete`：清空当前格并前进到下一格。
  - 合法单字符输入：写入后自动前进到下一格；填满末格自动 blur 并 onComplete。
  - RTL：←→ 语义镜像（视觉顺序仍从逻辑起始格开始）。
- **粘贴**：任一格 paste，从当前格起逐字符按 count 上限分发，遇非法字符停止（`preventDefault` 防双写）。
- **焦点管理**：各格均可 Tab 到达（与 Semi 一致，不做单一 roving 停靠点——OTP 场景用户期望能直接点任意格修正）。autoFocus 默认关闭（见 §4，登记偏离理由：不擅自抢焦点）。
- **输入法**：组合态（isComposing）不写入，避免中文候选误入。
- **对比度 / reduced-motion / RTL**：单格边框对比复用 Input 的达标值；跳格无动画，无 reduced-motion 特殊处理；RTL 由逻辑属性布局。

## 7. 国际化

- i18n key：
  - `PinCode.ariaLabel`：分组默认辅助名（zh「验证码」/ en「Verification code」）。
  - `PinCode.cellAriaLabel`：单格位次模板，含 `{index}`/`{count}`（zh「第 {index} 位，共 {count} 位」/ en「Digit {index} of {count}」）。
- 无日期/数字格式化需求（值为原始字符串）。
- RTL：布局用逻辑属性；方向键镜像。

## 8. 文案

- 组件无用户可见的可视文案（无占位符/标签/错误文字，均由使用方在外部提供）。
- 仅辅助技术文案（aria-label / 位次）走 i18n，遵循 content-guidelines：简洁、名词短语、不含标点冗余。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| svelte 组件 gzip | ≤ 3.5 KB | 复用 Input，仅编排逻辑 |
| core `createPinCode` gzip | ≤ 1.2 KB | 校验/跳格/粘贴分发纯函数 |
| 首次渲染 | count≤8 直渲，无虚拟化 | 位数天然有限 |
| 输入/跳格帧成本 | 仅更新单格 value + 焦点切换，无整组重建 | |

- 不需要虚拟化。无浮层，无 destroyOnClose。
- 运行时：校验/分发为 O(count) 纯函数；跳格只切焦点不触发布局抖动。

## 10. AI 元数据

提供 `component.meta.ts`：
- `name: 'PinCode'`、`category: 'input'`、`stage: 'M2'`、`semiEquivalent: 'PinCode'`。
- `props`/`events` schema（类型、默认值、枚举、受控标记；标注 autoFocus 默认偏离 Semi）。
- `a11yPattern: 'group-of-inputs'`、`keyboardMap`（←→/Backspace/Delete/自动跳格）。
- `tokens`：§5 列表与 Alias 派生。
- `i18nKeys`：§7 列表。
- `examples`：基础 6 位数字码、4 位、mixed 字母数字、受控（value+onChange）、error 态、onComplete 提交。
- `doNot`：不要写死格宽/颜色、不要默认 autoFocus 抢焦点、不要漏单格 aria 位次。

## 11. 测试

- **单元（core）**：`validateChar` 四种 format 边界（number/mixed/RegExp/函数，含空串与非法字符）；`completeSingleInput` 推进与 onComplete 触发时机；`handleKeyDown` ←→/Backspace/Delete 首末边界；`distributePaste` 遇非法字符停止 + count 截断；受控不改内部 valueList；isComposing 过滤。
- **组件（svelte）**：受控/非受控行为；onChange/onComplete 触发与载荷；自动跳格与填满 blur；粘贴分发；disabled 不可输入；error 态 aria-invalid；隐藏聚合 input 表单提交值。
- **a11y**：axe 无违规；`role="group"` + 每格位次 aria-label 正确；键盘全流程无鼠标可操作；autoComplete=one-time-code 存在；RTL 方向键镜像。
- **视觉回归**：三尺寸 × 校验态 × 暗色 × RTL 截图基线。
- **i18n**：切换 locale 后分组 aria-label 与位次模板正确。

## 12. 验收标准（对照 AGENTS.md §5 DoD）

- [ ] 分层正确（core createPinCode + svelte 渲染） · [ ] 类型+JSDoc 全覆盖 · [ ] Token 注册并支持覆盖 · [ ] a11y 通过（axe 0 + 键盘 + 分组/位次 aria）
- [ ] i18n 无硬编码（含单格位次） · [ ] core/组件/a11y 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页 + demo 完成
