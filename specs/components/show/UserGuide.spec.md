# SPEC · UserGuide

> 分类：show · 阶段：M4（增补，对标 Semi 后补齐）
> 对标 Semi：[UserGuide 用户引导](https://semi.design/zh-CN/show/userguide)（Semi 近期新增）
> 对新用户进行功能分步导览。本 SPEC 对标 Semi 2.101.0 API，并在 a11y 上做**大幅增强**（Semi 无 focus trap / 无 Esc / 无 inert / 无键盘导航 / 无 role=dialog）。

## 1. 概述

UserGuide 用于**新用户功能引导 / 分步导览**：popup 模式用 spotlight 遮罩逐个高亮目标元素并贴气泡讲解；modal 模式居中弹窗图文引导（含封面 + 圆点指示器）。典型场景：首次进入产品的功能导览、新功能 what's-new、复杂流程分步讲解、欢迎页。

## 2. 设计语义

**何时用**：需要引导用户按顺序认识若干界面元素或功能。
**何时不用**：
- 单点提示 → 用 `Tooltip`/`Popover`。
- 表单校验/错误反馈 → 用 Form 校验态。
- 常规对话框 → 用 `Modal`。

**popup vs modal**：popup 锚定真实 DOM 元素（有 spotlight 挖洞高亮）；modal 与界面无关，纯图文轮播式引导。

## 3. 分层实现

- **headless（core/）**：需要。`packages/core/src/user-guide/createUserGuide.ts`：
  - 步进状态机：`current`、受控（传 current）/非受控、`handleNext`/`handlePrev`/`handleSkip`/`handleFinish` 及各回调去重（current 未变不 notify）。
  - `visible` false→true 时重置 current=0。
  - popup 无 target 的步骤跳过。
  - spotlight 矩形计算：`target.getBoundingClientRect()` + padding 三层覆盖（step > props > 默认 5）。
  - 按钮渲染规则（跳过：非末步；上一步：非首步；下一步/完成）。
- **渲染（svelte/）**：`UserGuide.svelte`：
  - popup：`<svg>` mask 挖洞遮罩 + 复用本库 **Popover**（`floating` 定位）贴气泡 + 目标滚动进视口。
  - modal：复用本库 **Modal**（centered、无 header/footer、圆点指示器）。
  - **a11y 原语组合**（超越 Semi）：`focus-trap`（焦点困在气泡/弹窗）+ `inert-background`（背景 inert）+ `scroll-lock`（锁滚动）+ Esc/箭头键盘。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `steps` | `StepItem[]` | `[]` | **必填**。引导步骤数组，结构见下。 |
| `visible` | `boolean` | `false` | 是否显示引导。false→true 时重置到第 0 步。 |
| `current` | `number` | `0` | 当前步索引。**提供即受控**（内部不改，需配合 onChange 回写）。 |
| `mode` | `'popup' \| 'modal'` | `'popup'` | popup=气泡贴目标 + spotlight；modal=居中弹窗。 |
| `mask` | `boolean` | `true` | 是否显示遮罩（popup 的 spotlight / modal 的蒙层）。 |
| `theme` | `'default' \| 'primary'` | `'default'` | 气泡主题（popup）。 |
| `position` | `Position` | `'bottom'` | 气泡相对目标位置（全局，可被 step 覆盖）。 |
| `spotlightPadding` | `number` | `5` | 高亮区内边距 px（可被 step 覆盖）。 |
| `showPrevButton` | `boolean` | `true` | 显示上一步（首步自动隐藏）。 |
| `showSkipButton` | `boolean` | `true` | 显示跳过（末步自动隐藏）。 |
| `finishText` | `string` | i18n `finish` | 末步完成按钮文本。 |
| `nextButtonProps` | `ButtonProps` | `{}` | 下一步按钮属性透传。 |
| `prevButtonProps` | `ButtonProps` | `{}` | 上一步按钮属性透传。 |
| `getPopupContainer` | `() => HTMLElement` | — | 挂载父级；提供时不锁 body 滚动。 |
| `zIndex` | `number` | `1030` | 弹层/spotlight 层级。 |
| `class` / `style` | `string` | — | 气泡/根节点样式。 |
| `onChange` | `(current: number) => void` | — | 步骤改变（去重）。 |
| `onNext` | `(current: number) => void` | — | 点下一步（非末步），参数为新 current。 |
| `onPrev` | `(current: number) => void` | — | 点上一步，参数为 current-1。 |
| `onFinish` | `() => void` | — | 末步点完成（不自动关闭，使用方置 visible=false）。 |
| `onSkip` | `() => void` | — | 点跳过（不自动关闭）。 |

### StepItem 结构

| 字段 | 类型 | 默认 | 说明 |
| --- | --- | --- | --- |
| `target` | `(() => Element) \| Element` | — | 锚定/高亮目标（popup 必需，无则该步跳过；modal 忽略）。 |
| `title` | `string \| Snippet` | — | 步骤标题。 |
| `description` | `string \| Snippet` | — | 步骤描述。 |
| `cover` | `Snippet` | — | 封面（modal 有 cover 才渲染圆点指示器）。 |
| `position` | `Position` | 继承 props | 本步气泡位置。 |
| `theme` | `'default' \| 'primary'` | 继承 props | 本步主题。 |
| `showArrow` | `boolean` | `true` | 气泡箭头（popup）。 |
| `spotlightPadding` | `number` | 继承 props | 本步高亮内边距。 |
| `className` | `string` | — | 步骤自定义类名。 |

### Events / Slots

Events 见 Props 中 `onChange`/`onNext`/`onPrev`/`onFinish`/`onSkip`。Slots：`title`/`description`/`cover` 可用 Snippet 传（等价 step 字段）。

## 5. 主题 / Token 表

| Token | 含义 | 默认引用 |
| --- | --- | --- |
| `--cd-userguide-mask-bg` | 遮罩色 | `--cd-color-overlay-bg`（半透明暗色） |
| `--cd-userguide-spotlight-radius` | 高亮挖洞圆角 | `--cd-border-radius-small` |
| `--cd-userguide-popup-bg` | 气泡背景 | `--cd-color-bg-2` |
| `--cd-userguide-popup-bg-primary` | primary 主题气泡背景 | `--cd-color-primary` |
| `--cd-userguide-popup-color` | 气泡文字 | `--cd-color-text-0` |
| `--cd-userguide-popup-radius` | 气泡圆角 | `--cd-border-radius-medium` |
| `--cd-userguide-popup-shadow` | 气泡阴影 | `--cd-shadow-elevated` |
| `--cd-userguide-indicator-color` | 圆点指示器默认 | `--cd-color-fill-1` |
| `--cd-userguide-indicator-active` | 圆点激活 | `--cd-color-primary` |
| `--cd-userguide-spotlight-transition` | 高亮移动过渡 | `--cd-motion-duration-mid` + ease |

## 6. 无障碍

对标 Semi 的**大幅增强**（Semi 无 focus trap/Esc/inert/键盘/role）：

- **role/aria**：气泡/弹窗 `role="dialog"` + `aria-modal="true"`，`aria-labelledby`→title、`aria-describedby`→description。进度指示器 `aria-label`「第 N 步，共 M 步」。
- **焦点管理**：打开时移焦到当前气泡/弹窗（复用 `focus-trap`），焦点困在其中；步进时焦点跟到新气泡；关闭/完成/跳过归还焦点到触发元素。
- **背景 inert**：复用 `inert-background`，遮罩下背景 DOM 设 `inert`（键盘/读屏不可达）；高亮目标本身按需可保持可交互（引导「点这里」场景）。
- **键盘**：`Esc`=跳过；`←`/`→` 或 Enter=上一步/下一步（可配）；Tab 在气泡内循环。
- **滚动锁定**：复用 `scroll-lock`（getPopupContainer 时跳过）。
- **spotlight**：目标不在视口时 `scrollIntoView({block:'center'})`。
- **播报**：步进经 `live-announcer` polite 播报「第 N 步：{title}」。
- **对比度**：气泡文字、圆点激活态达标；遮罩对比保证高亮区可辨。
- **reduced-motion**：spotlight 移动过渡与气泡入场在 reduced-motion 下移除。
- **RTL**：气泡位置、箭头、上一步/下一步方向随 RTL 镜像。

## 7. 国际化

- i18n key（locale `UserGuide`）：
  - `skip`（跳过 / Skip）、`next`（下一步 / Next）、`prev`（上一步 / Prev）、`finish`（完成 / Finish）。
  - `stepIndicator`：进度模板含 `{current}`/`{total}`（zh「第 {current} 步，共 {total} 步」/ en「Step {current} of {total}」）——**补齐 Semi 未国际化的进度文案**。
- 按钮文案可被 `nextButtonProps.children`/`prevButtonProps.children`/`finishText` 覆盖。

## 8. 文案

- 引导标题/描述由使用方通过 steps 提供。
- 内置按钮文案（跳过/上一步/下一步/完成）走 i18n，遵循 content-guidelines：动作明确、简短。

## 9. 性能（Perf Budget）

| 维度 | 预算 | 说明 |
| --- | --- | --- |
| svelte gzip | ≤ 6 KB | 复用 Popover/Modal，含 spotlight svg |
| core `createUserGuide` gzip | ≤ 2 KB | 步进状态机 + 矩形计算 |
| spotlight 重算 | 仅 current/visible 变化时 rAF 内计算一次 | 无持续轮询 |

- 惰性：`!visible || !steps.length` 不渲染。
- spotlight 用 svg mask 单次渲染；resize/scroll 时按需重算（rAF 去抖）。

## 10. AI 元数据

`component.meta.ts`：
- `name: 'UserGuide'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: 'UserGuide'`。
- props/steps schema；标注 current 受控开关、popup 无 target 跳过、onFinish/onSkip 不自动关闭。
- `a11yPattern: 'dialog + spotlight'`；`keyboardMap`（Esc 跳过 / ←→ 步进）。
- `examples`：popup 分步高亮、modal 图文引导、受控 current、无遮罩轻提示、primary 主题、自定义按钮文案。
- `doNot`：不要忘记 onFinish/onSkip 里关 visible、popup 步骤别漏 target、不要绕过 focus trap/inert。

## 11. 测试

- **单元（core）**：步进 next/prev/skip/finish 及回调去重；受控不改内部；visible 重置；popup 无 target 跳过；padding/theme/position 三层覆盖；按钮显隐规则（首/末步）。
- **组件**：popup spotlight 矩形随 target；modal 圆点指示器；气泡定位；Esc 跳过；←→ 步进；焦点 trap 与归还；背景 inert；滚动锁定与 getPopupContainer 跳过。
- **a11y**：axe 无违规；role=dialog + aria-modal + labelledby/describedby；键盘全流程；焦点管理正确；inert 背景不可达；进度 aria-label。
- **视觉回归**：popup × modal × primary 主题 × 暗色 × RTL。
- **i18n**：按钮 + 进度文案随 locale；RTL 镜像。

## 12. 验收标准（对照 AGENTS.md §5 DoD）

- [ ] 分层正确（core 步进 + svelte 复用 Popover/Modal + a11y 原语） · [ ] 类型+JSDoc · [ ] Token 注册 · [ ] a11y 通过（dialog/focus-trap/inert/Esc/键盘/播报）
- [ ] i18n 无硬编码（含进度） · [ ] core/组件/a11y 测试达标 · [ ] Perf 达标 · [ ] meta 提供 · [ ] 文档页 + demo 完成
