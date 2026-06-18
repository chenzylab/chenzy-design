# SPEC · Avatar
> 分类：show · 阶段：M4
> 对标 Semi：Avatar / AvatarGroup

## 1. 概述

Avatar 用于展示用户、实体或资源的视觉标识。支持三种内容源：图片（`src`）、文字（首字母/缩写）、图标（`icon` slot），并按优先级降级（图片加载失败 → 文字 → 图标 → 占位符）。提供圆形（`circle`）与方形（`square`）两种形状，五档尺寸，以及可选的状态点（`dot` / online indicator）与悬浮交互态。

`AvatarGroup` 用于聚合多个 Avatar：横向层叠排列、统一尺寸/形状下发、超出 `maxCount` 折叠为 `+N` 计数头像，并可对溢出项绑定 Popover/Tooltip 展开完整列表。

典型场景：用户资料卡、评论列表、协作者堆叠、表格单元格身份列、聊天会话头像。

非目标：不内置上传/裁剪能力（由 Upload 组件负责）；不内置在线状态业务逻辑，仅提供 `dot` 视觉槽位。

## 2. 设计语义

- **形状**：`circle`（默认，社交语境）与 `square`（圆角矩形，企业/资源语境），圆角取 `--cd-avatar-radius-square`（= `--cd-radius-medium`）。
- **尺寸**：`extra-small | small | default | large | extra-large`，分别约 20 / 24 / 32 / 40 / 64 px，对应字号按比例缩放，保证文字头像在最小尺寸下仍可读（≥ 12px）。
- **内容优先级**：`src` 成功加载 > `alt`/`children` 文字 > `icon` slot > 默认 user 占位图标。文字头像背景色可由 `color` 在预设语义色板中选取，或基于内容字符串哈希自动分配（`color="auto"`）。
- **文字适配**：单个汉字/单字母居中显示；2 字符自动缩放（`transform: scale`）以适配圆形内切区域，避免溢出裁切。
- **层叠（Group）**：后者压前者还是前者压后者由 `overlapFrom` 控制；层叠间距 `--cd-avatar-group-overlap`（负 margin）；每个成员描边 `--cd-avatar-group-border` 保证彼此分隔。
- **状态语义**：`status: default|warning|error` 影响描边/dot 颜色（error→`--cd-color-danger`），用于头像级校验/异常提示（如失效协作者）。
- **动效**：图片加载完成淡入；hover 时可选 `hoverMask` 上浮遮罩；遵循 `prefers-reduced-motion` 时取消淡入与遮罩过渡。

## 3. 分层实现

Avatar 主体为**纯展示组件**，可省 core；但图片加载状态机与 Group 的折叠/Popover 交互含逻辑，需复用 core 原语。

- `@chenzy-design/core` → `createAvatarImage(opts)`：管理图片加载状态机（`idle | loading | loaded | error`），监听 `load`/`error`，`src` 变更时重置；输出 `state` 与降级判定 `shouldFallback`。供文字/图标降级渲染消费。
- `@chenzy-design/core` → `createAvatarGroup(opts)`：计算可见成员与溢出集合（`visible` / `overflow` / `restNumber`），下发统一 `size`/`shape`/`overlapFrom` context；溢出头像触发的浮层复用 `useDismiss`（点击外部/Esc 关闭）+ `useId`（关联 trigger 与浮层）。
- `useLiveAnnouncer`：Group 折叠数 `+N` 在屏幕阅读器下播报“还有 N 位成员”。
- `@chenzy-design/svelte` → `<Avatar>` / `<AvatarGroup>`：渲染层，处理 slot、淡入 class、context 注入；`<AvatarGroup>` 通过 Svelte context (`setContext('cd-avatar-group')`) 向子 Avatar 下发统一属性，子组件 props 显式传入时优先。
- 文字缩放在渲染层用 `bind:this` 测量内容宽度对比容器内切直径计算 `scale`，仅 2 字符及以上时启用。

## 4. API

### Props（Avatar）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | `string` | — | 图片地址；加载失败自动降级 |
| `srcset` | `string` | — | 响应式图片源集，透传给 `<img>` |
| `alt` | `string` | — | 图片替代文本，也用于无 children 时的文字降级（取首字符） |
| `shape` | `'circle' \| 'square'` | `'circle'` | 形状 |
| `size` | `'extra-small' \| 'small' \| 'default' \| 'large' \| 'extra-large' \| number` | `'default'` | 尺寸，数字为自定义像素 |
| `color` | `'auto' \| string` | `'grey'` | 文字头像背景色，`auto` 按内容哈希取色 |
| `status` | `'default' \| 'warning' \| 'error'` | `'default'` | 校验/异常态，影响描边与 dot |
| `dot` | `boolean` | `false` | 是否显示右下角状态点 |
| `dotColor` | `string` | — | 状态点颜色（覆盖 status 推导值） |
| `gap` | `number` | `3` | 文字内容与边缘最小间距(px)，用于缩放计算 |
| `border` | `boolean \| { color?: string; width?: number }` | `false` | 描边（Group 内默认开启） |
| `loading` | `'eager' \| 'lazy'` | `'lazy'` | `<img>` 原生懒加载策略 |
| `href` | `string` | — | 提供时整个头像渲染为可点击链接 `<a>` |
| `class` | `string` | — | 透传根类名 |

### Props（AvatarGroup）

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `size` | 同 Avatar `size` | `'default'` | 统一下发给成员 |
| `shape` | `'circle' \| 'square'` | `'circle'` | 统一下发 |
| `maxCount` | `number` | — | 最多展示数，超出折叠为 `+N` |
| `overlapFrom` | `'start' \| 'end'` | `'start'` | 层叠压盖方向（start=前压后） |
| `renderMore` | `(restNumber: number) => any` | — | 自定义溢出头像渲染（Snippet/函数） |
| `overflowTrigger` | `'click' \| 'hover' \| 'none'` | `'none'` | 溢出头像触发浮层列出剩余成员的方式 |

### Events

| Event | Payload | 说明 |
|-------|---------|------|
| `on:click` | `MouseEvent` | 头像点击（无 `href` 时） |
| `on:error` | `Event` | 图片加载失败（降级触发后派发） |
| `on:load` | `Event` | 图片加载成功 |
| `on:mouseenter` / `on:mouseleave` | `MouseEvent` | 悬浮，供外部驱动 Tooltip |
| `on:openChange` *(Group)* | `boolean` | 溢出浮层显隐变化（一致性 open + on:openChange 约定） |

### Slots

| Slot | 作用域参数 | 说明 |
|------|-----------|------|
| `default` | — | 文字内容（覆盖 `alt` 推导） |
| `icon` | — | 图标降级内容（无 src/文字时显示） |
| `dot` | — | 自定义状态点内容（如数字徽标） |
| `cover` *(Avatar)* | `{ status: LoadStatus }` | hover 遮罩层内容（如“更换头像”文案） |
| `more` *(Group)* | `{ restNumber }` | 自定义 `+N` 折叠头像（等价 `renderMore`） |

## 5. 主题 / Token

组件仅消费 Alias / Component token，禁止写死值。

| Component Token | 取值（引用 Alias/Global） | 用途 |
|-----------------|--------------------------|------|
| `--cd-avatar-bg` | `--cd-color-fill-1` | 文字/图标头像默认背景 |
| `--cd-avatar-color` | `--cd-color-text-0` | 文字/图标前景色 |
| `--cd-avatar-radius-circle` | `50%` (Global) | 圆形 |
| `--cd-avatar-radius-square` | `--cd-radius-medium` | 方形圆角 |
| `--cd-avatar-size-xs` ~ `-xl` | `20/24/32/40/64px` (Global) | 五档尺寸 |
| `--cd-avatar-font-xs` ~ `-xl` | 按尺寸比例 (Global) | 文字字号 |
| `--cd-avatar-border-color` | `--cd-color-bg-0` | 描边/Group 分隔色（贴合背景） |
| `--cd-avatar-border-width` | `2px` (Global) | 描边宽度 |
| `--cd-avatar-dot-bg` | `--cd-color-primary` | 状态点默认色 |
| `--cd-avatar-dot-size` | 按尺寸推导 | 状态点直径 |
| `--cd-avatar-status-warning` | `--cd-color-warning` | warning 态描边 |
| `--cd-avatar-status-error` | `--cd-color-danger` | error 态描边/dot |
| `--cd-avatar-group-overlap` | `-8px` (按 size 缩放) | Group 层叠负间距 |
| `--cd-avatar-mask-bg` | `rgba` of `--cd-color-text-0` | hover 遮罩底色 |
| `--cd-avatar-transition` | `--cd-motion-duration-fast` | 淡入/遮罩过渡 |

`color="auto"` 取色从语义色板（grey/red/orange/green/blue/purple 等）映射至各自 `--cd-avatar-bg-<hue>` token，保证文字与背景对比度 ≥ 4.5:1。

## 6. 无障碍（WCAG 2.1 AA）

- **语义角色**：图片头像渲染 `<img>` 并带 `alt`；纯文字/图标头像根元素 `role="img"` + `aria-label`（取 `alt` 或文字内容），避免屏幕阅读器逐字读出缩写。
- **装饰性**：当头像旁已有可见姓名文本时，调用方可传 `alt=""` 使其成为装饰图（`aria-hidden` 由调用方语境决定）。
- **可交互**：有 `href` → `<a>`；有 `on:click` 且无 href → 根元素 `role="button"` + `tabindex="0"`，支持 `Enter`/`Space` 触发；纯展示头像不可聚焦。
- **状态点**：`dot` 默认 `aria-hidden`，语义状态通过 `aria-label` 合并表达（如“张三，离线”）。
- **AvatarGroup**：容器 `role="group"` + `aria-label`（i18n `AvatarGroup.label`）；`+N` 折叠头像 `aria-label="还有 N 位"`，`overflowTrigger` 时为 `role="button"` + `aria-haspopup`/`aria-expanded` 关联浮层（`useId`）。浮层遵循 WAI-ARIA APG，`useDismiss` 处理 Esc/外部点击，焦点返回 trigger。
- **键盘**：Group 内可交互成员按 DOM 顺序 Tab；浮层内列表可上下方向键移动（roving）。
- **对比度**：文字头像前景/背景 ≥ 4.5:1；描边色与底色形成可辨边界。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时关闭淡入与遮罩过渡。
- **RTL**：Group 层叠方向、`dot` 与遮罩定位随 `dir="rtl"` 镜像（右下 → 左下）。

## 7. 国际化

用户可见文案零硬编码，经 i18n provider 注入。数字用 `Intl.NumberFormat`。

| i18n key | 默认文案（zh-CN / en） | 用途 |
|----------|------------------------|------|
| `Avatar.imageFallbackAlt` | 头像 / Avatar | img 无 alt 时的兜底替代文本 |
| `Avatar.changeCover` | 更换头像 / Change | hover cover 默认文案 |
| `AvatarGroup.label` | 成员头像组 / Avatar group | group 容器 aria-label |
| `AvatarGroup.restNumber` | 还有 {count} 位 / {count} more | `+N` 折叠头像 aria-label |
| `AvatarGroup.expandMore` | 展开全部成员 / Show all members | 溢出浮层 trigger 描述 |

- `+N` 中的数字经 `Intl.NumberFormat(locale)` 格式化（大数分隔符按区域）。
- `restNumber` 使用 ICU 占位 `{count}`，支持复数变体（en: `{count, plural, one {# more} other {# more}}`）。

## 8. 文案

- 遵循 content-guidelines：`alt`/`aria-label` 用名词短语，简洁可识别（“张三的头像”而非整句）。
- `+N` 仅显示数字与前缀符号，不附冗余单位。
- cover 行动文案用动词开头（“更换”“上传”）。
- **危险操作文案**（单列）：若 cover slot 用于“移除头像/删除成员”等破坏性操作，文案需明确后果且不可作为默认主操作，建议二次确认（交由调用方 Popconfirm）。本组件不提供内置删除入口，避免误触。

## 9. 性能（Perf Budget）

| 维度 | 预算 / 策略 |
|------|------------|
| gzip 体积（Avatar 单体） | ≤ 2.0 KB（CSS+JS，不含 core） |
| gzip 体积（含 AvatarGroup + core 原语） | ≤ 4.5 KB |
| 图片加载 | 默认 `loading="lazy"` + `decoding="async"`；失败状态机零额外重排 |
| 文字缩放测量 | 仅 2+ 字符时一次性测量，使用 `transform: scale` 避免重排；缓存结果 |
| AvatarGroup 大列表 | 仅渲染 `maxCount + 1`（折叠头像）个 DOM 节点，溢出成员不渲染，天然“虚拟化” |
| 溢出浮层 | `destroyOnClose` 默认 true，关闭即卸载列表 DOM |
| context 下发 | size/shape 通过 Svelte context 一次注入，避免逐成员 prop 透传开销 |
| 运行时 | 单 Avatar 首屏渲染 < 1ms；100 个 Group（maxCount=5）渲染 < 16ms（一帧内） |

无需重型虚拟化（折叠机制已限制 DOM 数）；浮层内超长成员列表（>50）建议调用方接入 List 虚拟滚动。

## 10. AI 元数据

提供 `component.meta.ts`，导出供 AI/低代码消费的结构化描述：

- `name: 'Avatar'`，`category: 'show'`，`stage: 'M4'`，`tags: ['头像','用户','image','identity','group']`
- `props` / `events` / `slots` 的类型、默认值、枚举与一句话语义（与第 4 节同源生成）
- `subComponents: ['AvatarGroup']`，标注 context 依赖关系（Group → Avatar）
- `examples`：图片头像、文字头像、图标头像、状态点、方形、AvatarGroup 折叠、溢出浮层 共 7 个最小可运行片段
- `a11yNotes`：role/aria-label 规则摘要
- `whenToUse` / `whenNotToUse`：身份标识 vs. 不用于普通图片展示（用 Image）/ 不含上传（用 Upload）
- `relatedComponents: ['Image','Badge','Upload','Tooltip','Popover']`

## 11. 测试

- **单元（core）**：`createAvatarImage` 状态机迁移（idle→loading→loaded / →error）、`src` 变更重置；`createAvatarGroup` 的 `visible/overflow/restNumber` 计算（maxCount 边界：0、等于成员数、超出、未设置）。
- **组件渲染**：内容优先级降级链（src 成功 / src 失败→文字 / 无文字→icon / 全无→占位）；五档尺寸与 number 自定义尺寸；circle/square；status 描边；dot 显隐。
- **文字缩放**：2/3 字符不溢出容器（快照 + 计算 scale 断言）。
- **AvatarGroup**：context 下发覆盖与子 prop 优先；overlapFrom 层叠顺序（z-index/margin）；`+N` 计数正确；overflowTrigger=click/hover 打开浮层、Esc/外部点击关闭、焦点返回。
- **a11y**：axe 无违规；img alt 存在；文字头像 role=img + aria-label；可点击头像键盘 Enter/Space；Group aria-expanded 联动；reduced-motion 下无过渡。
- **i18n**：切换 locale 后 `restNumber` 复数与 `Intl` 数字格式正确；RTL 镜像快照。
- **视觉回归**：各形状/尺寸/状态/Group 折叠 Chromatic 快照。

## 12. 验收标准 Checklist

- [ ] 包名 `@chenzy-design/svelte`（Group 同包），core 逻辑位于 `@chenzy-design/core` 的 `createAvatarImage` / `createAvatarGroup`
- [ ] 类名遵循 `cd-avatar` / `cd-avatar__img|text|icon|dot|mask` / `cd-avatar--circle|square|small|...`，Group 用 `cd-avatar-group`
- [ ] 所有样式仅消费 `--cd-avatar-*` / Alias token，无写死颜色或尺寸字面量
- [ ] API 遵循一致性约定：Group 浮层 `open + on:openChange`，size 枚举含 small|default|large（并扩展 xs/xl），status: default|warning|error
- [ ] 内容降级链 src→text→icon→占位 完整且失败无布局抖动
- [ ] 图片 `loading="lazy"` + `decoding="async"`；`src` 变更正确重置状态机
- [ ] AvatarGroup 仅渲染 maxCount+1 节点，溢出浮层 `destroyOnClose`
- [ ] a11y：role/aria-label 正确，可交互头像键盘可达，Group aria-expanded 联动，axe 0 违规
- [ ] reduced-motion 关闭动效；RTL 镜像正确
- [ ] i18n 文案零硬编码，key 齐全，`+N` 用 Intl.NumberFormat 与 ICU 复数
- [ ] 提供 `component.meta.ts`，含 props/events/slots/examples/relatedComponents
- [ ] Perf：Avatar ≤ 2.0KB、含 Group+core ≤ 4.5KB gzip，100 组渲染 ≤ 16ms
- [ ] 单元/组件/a11y/i18n/视觉回归测试全部通过
