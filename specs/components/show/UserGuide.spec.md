# SPEC · UserGuide

> 分类：show · 阶段：M4（破坏性重写，严格对齐 Semi）
> 对标 Semi：[UserGuide 用户引导](https://semi.design/zh-CN/show/userguide)
> 对新用户进行功能分步导览。本 SPEC **严格对齐 Semi userGuide**（DOM / token / API / demo 全量对齐，无向后兼容）：复用本库 Popover / Modal，移除自造的、Semi 无的能力（focus-trap / inert / Esc / 箭头键 / role=dialog 契约 / live-announcer / stepIndicator i18n）。

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

- **headless（core/）**：`packages/core/src/user-guide.ts`（对齐 Semi foundation.ts）：
  - 步进状态机：`current`、受控（传 current）/非受控、`handlePrev`/`handleNext`/`handleSkip` 及回调去重（notifyChange 仅在 current 变化时触发）。
  - 末步 `handleNext` 触发 `onFinish` 而非前进。
  - `reset`：非受控 visible false→true 时重置 current=0。
  - **无「无 target 步骤跳过」逻辑**（对齐 Semi：无 target 步仅不渲染，导航仍 +1/-1）。
  - spotlight 矩形：`target.getBoundingClientRect()` + padding（step > props > 默认 5）。
- **渲染（svelte/）**：`UserGuide.svelte`（DOM 逐条对齐 Semi userGuide/index.tsx）：
  - popup：复用本库 **Popover**（`trigger="custom"`）贴 fixed 定位透明 target 气泡 + `<svg>` mask 挖洞遮罩（四块透明 rect 让高亮区可交互）+ 目标 scrollIntoView。指示器纯文本 `n/total`。
  - modal：复用本库 **Modal**（centered、header/footer=null、bodyStyle padding:0、圆点指示器）。
  - body 滚动锁：对齐 Semi `disabledBodyScroll`（body overflow:hidden + 补偿滚动条宽，getPopupContainer 时跳过）。
  - **不含**（Semi 皆无，破坏性移除）：focus-trap / inert / Esc / 箭头键 / role=dialog 契约 / live-announcer。

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

逐条镜像 Semi `userGuide/variables.scss`（名 / 值 / 作用 DOM 对齐），无 Semi 之外的中间变量。摘录关键项：

| Token | 含义 | 值（对齐 Semi） |
| --- | --- | --- |
| `--cd-userguide-popup-text-default` | 气泡文字 - 默认 | `--cd-color-text-0` |
| `--cd-userguide-popup-text-primary` | 气泡文字 - primary | `--cd-color-tertiary-light-default` |
| `--cd-userguide-modal-indicator-bg` | 弹窗指示器背景 | `--cd-color-primary-light-active` |
| `--cd-userguide-modal-indicator-bg-active` | 弹窗指示器激活 | `--cd-color-primary` |
| `--cd-userguide-popover-width` | 气泡卡片宽度 | `400px` |
| `--cd-userguide-popup-body-padding` | 气泡内边距 | `24px` |
| `--cd-userguide-popup-title-font-size` | 气泡标题字号 | `--cd-font-size-header-5` |
| `--cd-userguide-modal-cover-width` / `-height` | 弹窗封面宽 / 高 | `600px` / `300px` |
| `--cd-userguide-spotlight-mask-bg` | spotlight 遮罩背景 | `--cd-color-overlay-bg` |
| `--cd-userguide-spotlight-duration` / `-function` | spotlight 过渡 | `200ms` / `cubic-bezier(0.4,0,0.2,1)` |

完整清单见 `packages/tokens/src/components/user-guide.ts`。

## 6. 无障碍

严格对齐 Semi（Semi 无 focus-trap / Esc / inert / 键盘导航 / role=dialog 契约，故本组件亦不含）：

- **气泡对话框语义**：popup 复用 Popover（`trigger="custom"`），浮层由 Popover 提供对话框语义；定位锚点是空 div，Popover 将其包成 role=button 宿主，故给一个视觉隐藏可访问名（step.title 优先）避免 aria-command-name 违规。
- **聚光挖孔可交互**：spotlight 高亮区通过四块透明 rect 让出指针事件（对齐 Semi），用户可点击被高亮目标。
- **spotlight**：目标不在视口时 `scrollIntoView({block:'center'})`。
- **body 滚动锁**：对齐 Semi `disabledBodyScroll`（getPopupContainer 时跳过）。
- **对比度**：气泡文字、圆点激活态达标；遮罩对比保证高亮区可辨。
- **reduced-motion**：spotlight 移动过渡在 reduced-motion 下移除。

## 7. 国际化

- i18n key（locale `UserGuide`，对齐 Semi）：`skip`（跳过 / Skip）、`next`（下一步 / Next）、`prev`（上一步 / Prev）、`finish`（完成 / Finish）。
- popup 进度指示器为纯文本 `n/total`（对齐 Semi，**无 i18n key**）。
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
