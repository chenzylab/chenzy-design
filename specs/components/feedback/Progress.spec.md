# SPEC · Progress
> 分类：feedback · 阶段：M5
> 对标 Semi：Progress

## 1. 概述

Progress 是进度指示组件，用于向用户反馈一项操作的当前进度，缓解等待焦虑并表达任务完成度。支持两种形态：

- **线形（line）**：水平条带，适合表单提交、文件上传、页面顶部加载等横向布局场景。
- **环形（circle）/ 仪表盘（dashboard）**：圆环或半开口仪表盘，适合卡片、统计面板等需要紧凑展示百分比的场景。

核心能力：
- 受控进度值 `percent`（0–100），自动钳制越界值。
- 四种语义状态 `status`：`normal | success | error | warning`，驱动颜色与（环形）成功图标。
- 可选文本展示 `showInfo`，支持 `format` 自定义格式化（如显示步数、字节、自定义图标）。
- 不确定进度 `indeterminate`（无明确百分比时的循环动画，仅 line 含 buffer 概念可扩展）。
- 尺寸 `size`：`small | default | large`，环形额外支持 `width` 像素覆写。
- 平滑过渡动画 + reduced-motion 降级。

非目标：不内置文件上传逻辑、不内置分步骤导航（Steps 为独立组件）。Progress 仅消费外部传入的 `percent`。

## 2. 设计语义

- **进度即面积/弧长**：line 用已填充宽度比例映射 percent，circle 用 stroke-dashoffset 映射弧长，视觉量与数值线性对应，禁止非线性缩放误导用户。
- **状态色彩语义**：normal → `--cd-color-primary`（进行中），success → `--cd-color-success`（完成），error → `--cd-color-danger`（失败/中断），warning → `--cd-color-warning`（部分异常）。轨道恒为 `--cd-progress-track-color`（低饱和中性）。
- **完成态强化**：环形 success 时圆心区域将百分比替换为成功对勾图标，提供超越颜色的冗余信号（色盲友好）。
- **静止 vs 运动**：确定进度是「快照」，indeterminate 是「持续运动」，二者动画语言区分明确（前者过渡，后者循环平移/旋转）。
- **尺寸与笔触**：line 的高度（small 4px / default 8px / large 12px）与 circle 的 strokeWidth（按 width 比例 6%）保证细节在小尺寸下不糊。
- **圆角**：line 端点圆角 = 条高一半（pill 形），circle 端点 `stroke-linecap: round`，呈现柔和现代观感。

## 3. 分层实现

Progress 以**展示为主**，但 `indeterminate` 的可访问性公告与值钳制/格式化属轻量逻辑，仍抽出极薄的 core 以保证跨框架一致。

**@chenzy-design/core — `createProgress(options)`**
- 纯函数 + 派生：`clampPercent(percent) → 0..100`、`resolveStatus(percent, status)`（percent≥100 且未显式指定 error/warning 时可推导 success，受 `successWhenFull` 控制）。
- 几何计算：`getCirclePathProps({ width, strokeWidth, gapDegree, type })` 返回 `radius / circumference / dashArray / dashOffset / rotation`，line 与 circle 共享 percent→offset 映射。
- a11y 属性生成：`getRootAriaProps({ percent, indeterminate, label, valueText })` 输出 `role="progressbar"` + `aria-valuenow/min/max/valuetext`。
- 复用原语：`useId`（关联 label/描述）、`useLiveAnnouncer`（可选：里程碑 25/50/75/100% 节流播报，默认关闭以免噪声）。
- 不引入 `useFocusTrap/useRovingTabindex/useDismiss/useScrollLock` —— Progress 非交互、不可聚焦。

**@chenzy-design/svelte — `<Progress>`**
- 渲染 line（`div` 轨道 + 填充）或 circle（`svg` 双 `circle`/`path`，dashboard 含 gapDegree 开口）。
- 绑定 core 输出的 aria props 到根节点；CSS transition 驱动 percent 变化的平滑过渡。
- `indeterminate` 用 CSS keyframes（line：渐变条往返平移；circle：旋转），`@media (prefers-reduced-motion)` 降级为静态/慢速。
- 暴露 `format` slot / prop 渲染 info 区域。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `percent` | `number` | `0` | 当前进度（0–100），越界自动钳制。受控值。 |
| `type` | `'line' \| 'circle' \| 'dashboard'` | `'line'` | 形态。dashboard 为带底部开口的仪表盘环。 |
| `status` | `'normal' \| 'success' \| 'error' \| 'warning'` | `'normal'` | 语义状态，驱动颜色与完成图标。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸预设。line 控制高度，circle 控制直径与笔触。 |
| `width` | `number` | — | 仅 circle/dashboard：直径像素，覆写 `size` 预设。 |
| `strokeWidth` | `number` | 按尺寸推导 | 笔触/条高像素覆写。 |
| `strokeLinecap` | `'round' \| 'butt' \| 'square'` | `'round'` | 仅 circle：端点样式。 |
| `showInfo` | `boolean` | `true` | 是否显示文本/图标信息区。 |
| `format` | `(percent: number, status: Status) => string \| null` | 显示 `${percent}%` | 自定义信息格式化；返回 `null` 隐藏。 |
| `indeterminate` | `boolean` | `false` | 不确定进度（循环动画），忽略 `percent` 数值显示。 |
| `gapDegree` | `number` | `75`（dashboard）/ `0` | dashboard 开口角度（0–295）。 |
| `gapPosition` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'bottom'` | dashboard 开口位置。 |
| `successWhenFull` | `boolean` | `false` | percent≥100 且 status 未显式指定时是否自动转 success。 |
| `motion` | `boolean` | `true` | 是否启用过渡/循环动画（被 reduced-motion 进一步覆盖）。 |
| `aria-label` / `label` | `string` | — | 无障碍标签，描述进度含义（如「上传进度」）。 |

### Events

| 名称 | payload | 说明 |
| --- | --- | --- |
| `on:complete` | `{ percent: number }` | percent 首次达到 100 时触发一次（用于触发完成态后续逻辑）。 |
| `on:change` | `{ percent: number }` | percent 变更后回调（语义对齐库内一致性约定；Progress 为单向展示，主要用于受控同步/埋点）。 |

> 说明：Progress 无浮层，不涉及 `open`/`on:openChange`。

### Slots

| 名称 | props | 说明 |
| --- | --- | --- |
| `format` | `{ percent, status }` | 替换默认信息区内容（line 尾部 / circle 圆心），可渲染图标、步数、字节等富文本。 |
| `default` | — | 仅 line：在进度条下方放置补充描述（可选）。 |

## 5. 主题 / Token

组件仅消费 Alias 与 Component 级 Token，禁止写死颜色/尺寸。

| Component Token | 默认引用（Alias / Global） | 用途 |
| --- | --- | --- |
| `--cd-progress-track-color` | `--cd-color-fill-0` | 未完成轨道背景色 |
| `--cd-progress-stroke-normal` | `--cd-color-primary` | normal 状态填充色 |
| `--cd-progress-stroke-success` | `--cd-color-success` | success 状态填充色 |
| `--cd-progress-stroke-error` | `--cd-color-danger` | error 状态填充色 |
| `--cd-progress-stroke-warning` | `--cd-color-warning` | warning 状态填充色 |
| `--cd-progress-info-color` | `--cd-color-text-0` | 信息区文本色 |
| `--cd-progress-info-success-color` | `--cd-color-success` | 完成对勾图标色 |
| `--cd-progress-height-small` | `--cd-spacing-1`（4px） | line small 条高 |
| `--cd-progress-height-default` | `--cd-spacing-2`（8px） | line default 条高 |
| `--cd-progress-height-large` | `--cd-spacing-3`（12px） | line large 条高 |
| `--cd-progress-radius` | `calc(var(--cd-progress-height) / 2)` | line 端点圆角（pill） |
| `--cd-progress-circle-size-small` | `--cd-size-circle-sm`（80px） | circle small 直径 |
| `--cd-progress-circle-size-default` | `--cd-size-circle-md`（120px） | circle default 直径 |
| `--cd-progress-info-font` | `--cd-font-size-2` | 信息区字号 |
| `--cd-progress-transition` | `--cd-motion-duration-slow var(--cd-motion-ease-standard)` | percent 过渡时长/曲线 |

对比度：信息区文本对所在背景满足 ≥4.5:1；填充色与轨道色之间无需达文本对比，但状态色需在浅/深主题下均可辨（暗色主题通过 Alias 自动切换）。

## 6. 无障碍（WCAG 2.1 AA）

- **role / aria**：根节点 `role="progressbar"`；确定进度设 `aria-valuenow={percent}`、`aria-valuemin="0"`、`aria-valuemax="100"`，并提供 `aria-valuetext`（如「45%，上传进度」）以朗读语义而非裸数字。
- **indeterminate**：省略 `aria-valuenow`（保留 min/max），AT 据此朗读为「忙碌/不确定」状态；`aria-busy="true"`。
- **标签**：必须有 `aria-label` 或通过 `aria-labelledby` 关联可见标题；信息区文本可作为补充但不替代可访问名称。
- **里程碑播报**：可选开启 `useLiveAnnouncer`（`aria-live="polite"`）在 25/50/75/100% 节流播报，避免每 1% 刷屏。完成时播报「已完成」。
- **非聚焦**：Progress 不可交互、`tabindex` 不设置，不进入 Tab 序列；不抢占焦点。
- **色彩冗余**：状态不仅靠颜色——error 可附 `format` 文案，success（环形）显示对勾图标，满足「不以颜色为唯一信息载体」。
- **对比度**：状态填充与信息文本满足 AA；轨道与填充保持可感知亮度差。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用 percent 过渡与 indeterminate 循环动画（改为静态或极慢非闪烁提示），且不产生 >3 次/秒闪烁（防癫痫）。
- **RTL**：`dir="rtl"` 时 line 填充方向从右向左；circle 起始角与旋转方向做镜像；info 区随文本方向。

## 7. 国际化

用户可见文案零硬编码，全部经 i18n。数字百分比用 `Intl.NumberFormat(locale, { style: 'percent' })` 格式化（避免硬拼 `%`，部分语言百分号位置/间距不同）。

| i18n key | 默认值（en） | 用途 |
| --- | --- | --- |
| `Progress.ariaLabel` | `Progress` | 缺省可访问名称 |
| `Progress.valueText` | `{percent} complete` | aria-valuetext 模板 |
| `Progress.success` | `Completed` | 完成态播报/图标 alt |
| `Progress.error` | `Failed` | 失败态播报/文案 |
| `Progress.warning` | `Warning` | 警告态文案 |
| `Progress.indeterminate` | `Loading` | 不确定进度可访问描述 |
| `Progress.milestone` | `{percent} reached` | 里程碑 live 播报模板 |

- 百分比数值经 `Intl` 本地化（如阿拉伯语数字、千分位无关）。
- RTL 语言由 7 节方向规则配合 i18n 一同处理。

## 8. 文案

遵循 content-guidelines：

- 信息区默认仅显示数值百分比，简洁、不啰嗦；自定义 `format` 时建议保持 ≤ 6 字符（line 尾部空间有限）。
- 状态文案用结果导向词：「已完成」而非「100%了」；「上传失败」而非「错误」。
- 不在 Progress 内放操作指令；引导/重试按钮由父级布局承载。

**危险操作文案（单列）**：Progress 自身不触发危险操作。但当其表达**不可逆/破坏性任务进度**（如「正在删除 N 个文件」「正在清空数据」）时：
- 进行中文案需明确对象与数量：`正在删除 {count} 个文件…`，避免仅显示百分比让用户误以为可安全中断。
- error 态需说明后果与可恢复性：`删除中断，已删除 {done}/{total}，部分文件可能已不可恢复`，措辞冷静、不渲染恐慌。
- 此类播报使用 `aria-live="assertive"` 以确保 AT 用户及时获知。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 目标 | 说明 |
| --- | --- | --- |
| gzip 体积（svelte + core） | ≤ 2.2 KB | line 路径 ~1.2KB；circle 含几何计算 +1KB |
| 首次渲染 | < 1ms | 单节点（line）/ 单 svg（circle），无子树 |
| percent 更新 | 仅改 CSS 变量 / dashoffset，无重排 | 用 `transform`/`stroke-dashoffset` 触发合成层，避免 layout |
| indeterminate 动画 | 纯 CSS keyframes，0 JS/帧 | 不占用主线程；reduced-motion 关闭 |
| 高频更新（如下载 60fps） | 节流到 rAF / 透传 | 建议父级节流；组件本身不内部 setInterval |

- 无虚拟化需求（单实例轻量）。
- 无浮层，故无 `destroyOnClose`；列表中大量 Progress（如文件列表）建议父级惰性渲染视口内项。
- circle 几何在 props 变化时才重算（派生缓存），percent 微调不重算半径/周长。

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：

- `name: 'Progress'`、`category: 'feedback'`、`stage: 'M5'`、`semiEquivalent: 'Progress'`。
- `props` 全量 schema（类型、枚举、默认值、是否受控、a11y 关联）供 AI 生成时约束取值。
- `slots` / `events` 描述与 payload 形状。
- `tokens`：暴露的 Component Token 列表及其 Alias 引用，供主题生成工具。
- `a11y`：`role: 'progressbar'`、关键 aria 属性清单、reduced-motion 行为标记。
- `examples`：典型用法（受控上传、环形带图标、indeterminate、dashboard），含可运行片段。
- `dangerousContent`：标注破坏性任务进度的文案约束（见第 8 节）供 AI 文案审查。
- `antiPatterns`：如「不要用非线性映射」「不要把 Progress 当按钮」。

## 11. 测试

- **单元（core）**：`clampPercent` 越界/NaN/负值；`resolveStatus` + `successWhenFull` 推导；`getCirclePathProps` 周长/offset 数值正确性（含 dashboard gapDegree）；`getRootAriaProps` indeterminate 时省略 valuenow。
- **组件渲染**：line/circle/dashboard 三态快照；status 四态类名/颜色 Token；showInfo=false 隐藏信息区；format 返回 null 隐藏。
- **a11y（axe + jest-axe）**：role/aria-valuenow/valuemin/max/valuetext 存在性；indeterminate 时 aria-busy + 无 valuenow；缺 label 时告警；色彩冗余（error/success 有非颜色信号）。
- **交互/动画**：percent 变更触发 `on:change`；首达 100 触发 `on:complete` 仅一次；reduced-motion 下无动画类。
- **视觉回归**：各 size、RTL 镜像、暗色主题、strokeLinecap 变体。
- **i18n**：locale 切换下 valuetext / 百分比格式正确（含 ar RTL、数字本地化）。

## 12. 验收标准 Checklist

- [ ] 支持 line / circle / dashboard 三种形态，percent 越界自动钳制。
- [ ] status 四态（normal/success/error/warning）颜色全部来自 Component Token，无写死值。
- [ ] success（环形）显示对勾图标，状态不以颜色为唯一信号。
- [ ] `role="progressbar"` + aria-valuenow/min/max/valuetext 正确；indeterminate 时 aria-busy 且省略 valuenow。
- [ ] 可访问名称必备（aria-label / labelledby），缺失时开发告警。
- [ ] reduced-motion 下禁用过渡与循环动画，无 >3 次/秒闪烁。
- [ ] RTL 下 line 与 circle 方向正确镜像。
- [ ] 所有用户可见文案走 i18n key，百分比经 Intl 本地化，无硬编码。
- [ ] 破坏性任务进度文案符合危险操作规范（含对象/数量与中断后果），使用 assertive 播报。
- [ ] core 暴露 `createProgress` 纯逻辑，svelte 仅负责渲染；复用 useId/useLiveAnnouncer。
- [ ] gzip ≤ 2.2KB；percent 更新仅触发合成层、无重排；无内部定时器。
- [ ] percent 首达 100 触发一次 `on:complete`；提供 `component.meta.ts` 全量元数据。
- [ ] 单元 / 组件 / a11y(axe) / 视觉回归 / i18n 测试全部通过，覆盖率达标。
