# SPEC · Image
> 分类：show · 阶段：M4
> 对标 Semi：Image / ImagePreview

## 1. 概述

`Image` 是增强型图片展示组件，用于替代原生 `<img>`，在浏览器原生 `loading="lazy"` 的基础上叠加可控的占位、加载失败降级、点击预览（灯箱）等能力。典型场景：商品列表缩略图、图文混排正文、头像/封面、需要点击放大查看大图的图集。

核心能力：
- **懒加载**：默认 `loading="lazy"`；可选 IntersectionObserver 模式以支持占位过渡与提前预取（rootMargin）。
- **占位（placeholder）**：加载未完成时显示骨架/纯色块/低质量缩略图（LQIP），加载完成后淡入真图。
- **降级（fallback）**：`src` 加载出错时切换到 `fallback` 图，或展示「加载失败」错误态插槽。
- **预览（preview）**：单图点击放大；通过 `PreviewGroup` 包裹多张 `Image` 形成可左右翻页、缩放、旋转、拖拽的图集灯箱。

与 `Avatar`（固定形状的头像，M3）区分：`Image` 关注通用图片的加载生命周期与预览；`Avatar` 关注圆形/方形人物缩略与首字母降级。

## 2. 设计语义

- **加载三态**：`loading`（占位）→ `loaded`（淡入显示）→ `error`（降级）。状态通过内部 `data-status` 暴露给样式，过渡用 `--cd-image-fade-duration`，遵循 reduced-motion 时关闭淡入。
- **填充模式**：复用 CSS `object-fit`（`fill|contain|cover|none|scale-down`），由 `fit` prop 直接映射，配合 `width/height` 锁定布局，避免 CLS（累积布局偏移）。
- **圆角与边框**：仅消费 `--cd-image-radius`，默认继承全局 `--cd-radius`；预览遮罩 hover 时显示放大图标，语义来自 `--cd-color-text-light`（反白文字）。
- **预览灯箱**：浮层语义为 `dialog`（模态），遮罩使用 `--cd-image-preview-mask-bg`（半透明黑），工具栏与图片层级独立，缩放以图片中心或鼠标位置为锚点。
- **RTL**：预览的「上一张/下一张」按钮位置随 `dir` 镜像；图片本身不翻转。

## 3. 分层实现

属于「有交互/键盘/a11y 逻辑」的组件，采用分层：

**@chenzy-design/core · `createImage` / `createImagePreview`**
- `createImage`：管理加载状态机（idle→loading→loaded→error）、`src`/`fallback` 切换、IntersectionObserver 懒加载订阅（`useId` 生成内部 id）。
- `createImagePreview`（灯箱 headless）：
  - `useDismiss`：Esc / 点击遮罩关闭。
  - `useFocusTrap`：焦点锁定在灯箱工具栏与关闭按钮内。
  - `useScrollLock`：打开时锁定 body 滚动。
  - `useLiveAnnouncer`：翻页时播报「第 m / n 张」。
  - 内部维护 `activeIndex`、`scale`、`rotate`、`translate`，暴露 `zoomIn/zoomOut/rotateLeft/rotateRight/reset/next/prev` 动作；处理滚轮缩放、指针拖拽（pointer events）。
- `useRovingTabindex`：预览缩略图条（thumbnail strip）的左右方向键导航。

**@chenzy-design/svelte · `Image.svelte` / `ImagePreview.svelte` / `PreviewGroup.svelte`**
- 渲染 `<img>`、占位层、错误层、预览触发遮罩；将 core 状态映射到 `data-status` 与 class。
- `PreviewGroup` 通过 Svelte context（`setContext('cd-image-preview-group')`）收集子 `Image` 的 src 列表与点击索引，统一弹出一个共享灯箱（避免每张图各建一个浮层）。
- 灯箱浮层通过 portal 渲染到 body，`destroyOnClose` 控制是否在关闭后卸载。

纯展示降级路径（不传 `preview`）几乎零运行时，仅 `<img>` + 占位/错误样式。

## 4. API

### Props

| 名称 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | — | 图片地址（必填） |
| `alt` | `string` | `''` | 替代文本，a11y 与 SEO 必填语义 |
| `width` | `number \| string` | — | 宽度，建议显式设置以避免 CLS |
| `height` | `number \| string` | — | 高度，同上 |
| `fit` | `'fill' \| 'contain' \| 'cover' \| 'none' \| 'scale-down'` | `'fill'` | 映射 `object-fit` |
| `position` | `string` | `'center'` | 映射 `object-position` |
| `lazy` | `boolean` | `true` | 懒加载开关 |
| `lazyMode` | `'native' \| 'observer'` | `'native'` | 原生 `loading=lazy` 或 IntersectionObserver |
| `rootMargin` | `string` | `'200px'` | observer 模式下的提前加载距离 |
| `placeholder` | `string \| Snippet \| boolean` | `true` | 占位：true 用骨架，string 作为 LQIP src，Snippet 自定义 |
| `fallback` | `string \| boolean` | `true` | 失败降级图地址；false 关闭，改用 error 插槽 |
| `crossorigin` | `'anonymous' \| 'use-credentials'` | — | 透传原生属性 |
| `referrerpolicy` | `string` | — | 透传原生属性 |
| `srcset` | `string` | — | 响应式图源 |
| `sizes` | `string` | — | 响应式尺寸提示 |
| `radius` | `number \| string` | — | 覆盖 `--cd-image-radius` |
| `preview` | `boolean \| ImagePreviewConfig` | `false` | 是否开启点击预览，或传配置对象 |
| `previewSrc` | `string` | `src` | 预览大图地址（默认用 `src`） |
| `class` | `string` | — | 透传根类名 |

`ImagePreviewConfig`：`{ closable?: boolean; movable?: boolean; zoom?: [number, number]; zoomStep?: number; maskClosable?: boolean; getPopupContainer?: () => HTMLElement; }`

`PreviewGroup` Props：`open?: boolean`、`activeIndex?: number`、`infinite?: boolean`（循环翻页）、`maskClosable?: boolean`、`getPopupContainer?: () => HTMLElement`。

### Events

| 事件 | payload | 说明 |
|------|---------|------|
| `on:load` | `Event` | 真图加载完成（status → loaded） |
| `on:error` | `Event` | 加载失败（status → error，触发 fallback） |
| `on:preview` | `{ src: string; index: number }` | 进入预览 |
| `on:openChange` | `boolean` | 预览灯箱显隐变化（受控 `open`） |
| `on:change` | `{ index: number }` | 预览组翻页，当前索引变化（受控 `activeIndex`） |
| `on:zoom` | `{ scale: number }` | 缩放比例变化 |
| `on:rotate` | `{ rotate: number }` | 旋转角度变化 |

### Slots

| 名称（Snippet） | 入参 | 说明 |
|------|------|------|
| `placeholder` | — | 自定义占位内容（覆盖 `placeholder` prop） |
| `error` | — | 自定义加载失败内容（覆盖 `fallback`） |
| `previewMask` | `{ src }` | 自定义 hover 遮罩内容（默认放大镜图标 + 文案） |
| `previewToolbar` | `{ scale, rotate, index, total, actions }` | 自定义灯箱工具栏，`actions` 含 zoomIn/zoomOut/rotateLeft/rotateRight/reset/prev/next/close |

## 5. 主题 / Token

组件仅消费 Alias 与 Component 级 Token，禁止写死值。

| Component Token | 回退（Alias/Global） | 用途 |
|------|------|------|
| `--cd-image-radius` | `--cd-radius` | 图片圆角 |
| `--cd-image-bg` | `--cd-color-bg-1` | 占位/空白背景 |
| `--cd-image-placeholder-bg` | `--cd-color-bg-2` | 骨架占位底色 |
| `--cd-image-placeholder-shimmer` | `--cd-color-bg-3` | 骨架微光高亮 |
| `--cd-image-error-bg` | `--cd-color-bg-2` | 失败态背景 |
| `--cd-image-error-color` | `--cd-color-text-2` | 失败态文字/图标 |
| `--cd-image-fade-duration` | `--cd-motion-duration-mid`（200ms） | 真图淡入时长 |
| `--cd-image-mask-bg` | `rgba` via `--cd-color-overlay` | hover 预览遮罩 |
| `--cd-image-mask-color` | `--cd-color-text-light` | 遮罩内反白文案 |
| `--cd-image-preview-mask-bg` | `--cd-color-overlay-strong` | 灯箱遮罩（约 80% 黑） |
| `--cd-image-preview-toolbar-bg` | `--cd-color-bg-overlay` | 工具栏背景 |
| `--cd-image-preview-icon-color` | `--cd-color-text-light` | 工具栏图标 |
| `--cd-image-preview-icon-color-disabled` | `--cd-color-text-light-disabled` | 禁用态图标（如非循环到边界） |

暗色模式：占位/失败背景与遮罩透明度通过 Alias 自动切换，组件层无需条件分支。

## 6. 无障碍（WCAG 2.1 AA）

**Image 本体**
- `<img>` 始终输出 `alt`；装饰性图片应传 `alt=""`（并配 `role="presentation"`）。
- 加载中：占位层 `aria-busy="true"`；失败层提供 `role="img"` + `aria-label`（i18n `Image.loadError`）。
- 可预览图片在 `<img>` 外包一层 `role="button"` `tabindex="0"` `aria-label`（`Image.previewTrigger`，如「查看大图」），支持 Enter/Space 打开。

**预览灯箱（遵循 WAI-ARIA APG · Dialog (Modal)）**
- 容器 `role="dialog"` `aria-modal="true"` `aria-label`（`Image.previewTitle`）。
- 焦点管理：打开时焦点移入灯箱（关闭按钮），`useFocusTrap` 锁定，关闭后返回触发元素。
- 键盘交互：
  - `Esc` 关闭。
  - `←/→` 上一张 / 下一张（组模式）。
  - `+ / -` 放大 / 缩小，`0` 重置。
  - `Tab` 在工具栏按钮间循环。
- 工具栏每个按钮均有 `aria-label`（i18n）；当前缩放比例对屏幕阅读器以 `useLiveAnnouncer` 播报。
- 翻页通过 LiveAnnouncer 播报「第 m / n 张」（`Image.previewCount`）。

**对比度 / 动效 / RTL**
- 工具栏图标对反白背景对比度 ≥ 4.5:1；禁用态图标允许 3:1（非文本）。
- `prefers-reduced-motion: reduce` 时关闭淡入、缩放/旋转过渡动画，瞬时切换。
- RTL：灯箱左右翻页按钮与 `←/→` 键语义随 `dir` 镜像（next 始终对应「下一张」逻辑而非物理右）。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n key（`Image.<field>`）：

| key | 默认（zh-CN / en-US） |
|------|------|
| `Image.previewTrigger` | 查看大图 / View image |
| `Image.previewTitle` | 图片预览 / Image preview |
| `Image.loadError` | 图片加载失败 / Failed to load image |
| `Image.loading` | 加载中 / Loading |
| `Image.zoomIn` | 放大 / Zoom in |
| `Image.zoomOut` | 缩小 / Zoom out |
| `Image.rotateLeft` | 向左旋转 / Rotate left |
| `Image.rotateRight` | 向右旋转 / Rotate right |
| `Image.reset` | 重置 / Reset |
| `Image.prev` | 上一张 / Previous |
| `Image.next` | 下一张 / Next |
| `Image.close` | 关闭 / Close |
| `Image.previewCount` | 第 {current} / {total} 张 / {current} of {total} |

- `previewCount` 中的数字用 `Intl.NumberFormat` 本地化（如阿拉伯语数字）。
- 缩放比例显示用 `Intl.NumberFormat(locale, { style: 'percent' })`（如 `150%`）。

## 8. 文案

- 遵循 content-guidelines：动作型 label 用动词（放大、缩小、旋转），简短无标点。
- 失败态文案中性、不指责用户：「图片加载失败」而非「你的网络有问题」。
- 占位「加载中」可省略文字，仅以骨架表达，减少视觉噪音。

**危险操作文案（单列）**
- `Image` 组件本身无破坏性操作，不涉及删除/清空等危险动作；预览的关闭、重置均为可逆操作，无需二次确认。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 策略 |
|------|------|
| gzip 体积（仅 Image，无预览） | ≤ 2.5 KB（core 状态机 + svelte 渲染） |
| gzip 体积（含 ImagePreview + PreviewGroup） | ≤ 7 KB（含 focus trap / dismiss / scroll lock 复用，不额外打包） |
| 首屏 CLS | `width/height` 显式时 = 0；强约束以 `aspect-ratio` 占位 |
| 懒加载 | 默认原生 `loading=lazy`；observer 模式单例共享 IntersectionObserver（按 root+rootMargin 分组） |
| 预览灯箱 | `destroyOnClose` 默认 true，关闭即卸载工具栏与大图 DOM |
| 大图加载 | 预览大图与缩略图分离（`previewSrc`），点击时才请求 |
| 缩放 / 拖拽 | 用 `transform` (translate/scale/rotate) 合成层，避免重排；拖拽用 pointer events + rAF 节流 |
| 预览组缩略图条 | > 20 张时虚拟化（仅渲染可视窗口缩略图） |
| 多图列表 | 列表场景建议外层虚拟列表配合 observer 懒加载，组件不内置列表虚拟化 |

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'Image'`、`category: 'show'`、`stage: 'M4'`、`semiEquivalent: ['Image', 'ImagePreview']`。
- `subComponents: ['Image', 'Image.PreviewGroup']`。
- `tokens`：第 5 节全部 Component Token 及回退链。
- `a11yRoles: ['img', 'button', 'dialog']`、`apgPattern: 'dialog-modal'`。
- `i18nKeys`：第 7 节全部 key。
- `props/events/slots` 结构化签名（供 AI 生成代码与校验）。
- `usageHints`：「列表缩略图用 fit=cover + 固定宽高」「多图预览用 PreviewGroup 包裹」「装饰图传 alt=''」。
- `antiPatterns`：「不要不传 width/height 导致 CLS」「不要把大图直接当 src 再缩放，应用 previewSrc」。

## 11. 测试

**单元（core）**
- 状态机：src 设置 → loading；onload → loaded；onerror → error 且切换 fallback；fallback 也失败 → 停留 error 不死循环。
- observer 懒加载：进入视口才赋值真实 src；离开/卸载正确 disconnect。
- 预览动作：zoomIn/Out 受 `zoom` 边界 clamp；rotate 取模 360；next/prev 在非 infinite 时边界禁用、infinite 时循环。

**组件（svelte / Testing Library）**
- 占位 → 淡入：loaded 后 `data-status="loaded"` 且占位层移除。
- preview 点击/Enter/Space 打开灯箱；Esc / 遮罩点击关闭；焦点返回触发元素。
- PreviewGroup：多图收集顺序正确，点击第 k 张 activeIndex=k；←/→ 翻页 + LiveAnnouncer 文本更新。
- reduced-motion 下无过渡 class。

**a11y**
- axe 扫描 Image 与打开态灯箱无 violation。
- 键盘全流程可达（打开→缩放→翻页→关闭）。
- 焦点不泄漏到灯箱外（focus trap 断言）。

**视觉回归**
- 三态（占位/加载完成/失败）× 五种 `fit` × 亮暗模式快照。
- 灯箱默认态、缩放态、旋转态、RTL 快照。

## 12. 验收标准 Checklist

- [ ] 类名前缀 `cd-`，BEM-like：`cd-image`、`cd-image__img`、`cd-image__placeholder`、`cd-image__error`、`cd-image__mask`、`cd-image-preview`、`cd-image-preview__toolbar`、`cd-image--{loading|loaded|error}`。
- [ ] 仅消费 `--cd-` Alias/Component Token，无写死颜色/尺寸。
- [ ] API 遵循一致性约定：预览显隐 `open` + `on:openChange`；预览组翻页 `activeIndex` + `on:change`。
- [ ] headless 逻辑在 `@chenzy-design/core` `createImage`/`createImagePreview`，复用 useFocusTrap/useDismiss/useScrollLock/useLiveAnnouncer/useRovingTabindex/useId。
- [ ] 加载三态完整且 fallback 不死循环。
- [ ] 懒加载支持 native 与 observer 双模式，observer 共享单例并正确销毁。
- [ ] 显式 width/height 或 aspect-ratio 下 CLS = 0。
- [ ] 预览灯箱满足 APG Dialog(Modal)：role/aria-modal、focus trap、Esc、焦点返回。
- [ ] 全键盘交互：Enter/Space 打开、Esc 关闭、←/→ 翻页、+/-/0 缩放重置。
- [ ] 所有可见文案走 i18n key，数字/百分比用 Intl 格式化。
- [ ] `prefers-reduced-motion` 下关闭淡入与缩放/旋转动效。
- [ ] RTL 下翻页方向与按钮位置正确镜像。
- [ ] `destroyOnClose` 默认开启，关闭后大图与工具栏 DOM 卸载。
- [ ] gzip 体积满足 Perf Budget（无预览 ≤ 2.5KB / 含预览 ≤ 7KB）。
- [ ] 提供 `component.meta.ts`，字段完整（tokens/i18nKeys/a11yRoles/props/events/slots）。
- [ ] 单元 / 组件 / a11y / 视觉回归测试全部通过。
