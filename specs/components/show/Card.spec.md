# SPEC · Card
> 分类：show · 阶段：M4
> 对标 Semi：Card

## 1. 概述

Card（卡片）是用于聚合一组相关信息与操作的容器型展示组件。它把标题、封面图、正文内容、元信息与操作区组织在一个具有边框/阴影的矩形区域内，是列表页、仪表盘、详情页中最基础的内容承载单元。

典型使用场景：

- 内容卡片：封面 + 标题 + 描述 + 底部操作（点赞/收藏/分享），如商品卡、文章卡。
- 信息卡片：纯标题 + 内容区，承载表单分组、统计指标、设置块。
- 网格卡片：配合 Grid/Space 在列表页批量平铺，常与分页/无限滚动结合。
- 异步卡片：数据加载中展示骨架占位（loading），加载完成后渲染真实内容。

Card 本身是**纯展示组件**，不持有交互状态，因此无独立 headless 逻辑（不提供 createCard）。其内部可点击元素（hoverable 点击、操作按钮）的交互能力由各自子组件（Button/Link）承担。Card 仅负责结构语义、视觉容器与加载占位。

边界（非目标）：不负责数据请求、不内建拖拽排序、不做卡片间布局（交给 Grid/Space）、不是可展开折叠面板（用 Collapse）。

## 2. 设计语义

- **容器层级**：Card 通过 `--cd-color-bg-0` 背景 + `--cd-color-border` 1px 边框（`bordered`）或阴影（`shadow`）从页面背景中抬升，形成内容分组的视觉边界。边框与阴影二选一为主，避免同时强调。
- **结构分区**：固定四区——封面区（cover，通栏出血，无内边距）、头部区（header：title/extra 左右分布）、内容区（body，标准内边距）、操作区（actions，底部分隔线，等分排列）。各区按需出现，不出现则不占空间、不渲染分隔线。
- **尺寸语义**：`small | default | large` 仅影响 body/header 的内边距与标题字号，不改变圆角与边框宽度，保证同页多尺寸卡片视觉一致。
- **交互反馈**：`hoverable` 时鼠标悬停抬升阴影 + 轻微位移，暗示整卡可点击；非 hoverable 卡片为静态容器。
- **圆角**：使用 `--cd-card-radius`（继承 Alias 中号圆角），封面区顶部圆角需裁剪溢出（overflow hidden）以贴合容器。
- **加载态**：`loading` 时 body 区以骨架占位替代真实内容，保持高度稳定避免布局抖动（CLS）。
- **空间一致性**：所有内边距、间距源自 spacing token，禁止魔法数；danger/warning 等语义色仅出现在内容本身，Card 容器不携带状态色。

## 3. 分层实现

Card 为纯展示组件，**无键盘/焦点/浮层逻辑，故省略 @chenzy-design/core 的 createCard**。全部实现位于 `@chenzy-design/svelte`。

- **@chenzy-design/svelte**：`Card.svelte` 负责结构与样式；`CardMeta.svelte`（封面/头像 + 标题 + 描述的元信息布局）、`CardGroup.svelte`（可选，卡片网格容器）为配套子组件。
- **复用 core 原语**：仅在需要时引入 `useId`（当传入 `title` 但无显式 id 时，为 `aria-labelledby` 生成稳定 id 关联 `region`）。不使用 useFocusTrap/useRovingTabindex/useDismiss/useScrollLock/useLiveAnnouncer。
- **loading 渲染**：内部复用 `Skeleton` 组件（`@chenzy-design/svelte`）渲染骨架，避免 Card 自行实现占位动画，统一动画 token。
- **hoverable 点击**：Card 不自行绑定 click 语义角色；若业务需要整卡可点击，由使用方在外层包裹 `<a>`/Button 或监听 `on:click`，Card 仅透传事件与 hover 视觉。这样避免把非交互容器错误标记为 button。
- **样式隔离**：所有类名以 `cd-card` 为根，BEM-like 派生，token 仅消费 Alias/Component 层。

## 4. API

### Props

| 属性 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| `title` | `string \| Snippet` | — | 卡片标题，渲染于 header 左侧；为字符串时参与 `aria-labelledby` |
| `extra` | `string \| Snippet` | — | header 右侧附加区，常放操作链接/下拉 |
| `cover` | `Snippet` | — | 封面区内容（图片/视频），通栏出血、无内边距 |
| `actions` | `Snippet[] \| Snippet` | — | 底部操作区，多项时等分并以分隔线分割 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 尺寸，影响内边距与标题字号 |
| `bordered` | `boolean` | `true` | 是否显示边框 |
| `shadow` | `'never' \| 'hover' \| 'always'` | `'never'` | 阴影策略；`hover` 等价悬停抬升 |
| `hoverable` | `boolean` | `false` | 悬停态视觉反馈（抬升），暗示可点击 |
| `loading` | `boolean` | `false` | 加载态，body 区渲染骨架占位 |
| `loadingRows` | `number` | `3` | 骨架占位的段落行数 |
| `bodyStyle` | `string` | — | body 区内联样式透传 |
| `headerStyle` | `string` | — | header 区内联样式透传 |
| `headerLine` | `boolean` | `true` | header 与 body 间是否显示分隔线 |
| `footerLine` | `boolean` | `true` | actions 区上方是否显示分隔线 |
| `clickable` | `boolean` | `false` | 整卡可点击：合并 hoverable 视觉并启用 `on:click`/键盘激活与 `role` |
| `disabled` | `boolean` | `false` | 仅在 `clickable` 时生效，禁用点击与 hover 反馈 |
| `class` | `string` | — | 根节点自定义类名 |

### Events

| 事件 | 载荷 (detail) | 触发时机 |
|---|---|---|
| `on:click` | `{ originalEvent: MouseEvent \| KeyboardEvent }` | `clickable` 时整卡被点击或键盘激活（Enter/Space）；`disabled` 时不触发 |
| `on:mouseenter` | `{ originalEvent: MouseEvent }` | 指针进入卡片（用于业务联动 hover） |
| `on:mouseleave` | `{ originalEvent: MouseEvent }` | 指针离开卡片 |

> 非 `clickable` 模式下 Card 不拦截原生事件，使用方可直接监听冒泡的原生 DOM 事件。

### Slots

| Slot | 作用域参数 | 说明 |
|---|---|---|
| `default` | — | 内容区（body）主体 |
| `title` | — | 自定义标题区（优先级高于 `title` prop） |
| `extra` | — | 自定义 header 右侧区（优先级高于 `extra` prop） |
| `cover` | — | 自定义封面区 |
| `actions` | — | 自定义操作区（优先级高于 `actions` prop） |
| `loading` | `{ rows: number }` | 自定义加载占位（覆盖默认 Skeleton） |

> CardMeta 子组件提供 `avatar` / `title` / `description` 三个 slot，用于规范化封面下方的元信息排版。

## 5. 主题 / Token 表

Card 仅消费 Alias 与 Component 层，所有 Component token 回退至 Alias，禁止写死值。

| Component Token | 默认引用（Alias/Global） | 用途 |
|---|---|---|
| `--cd-card-bg` | `--cd-color-bg-0` | 卡片背景 |
| `--cd-card-color-text` | `--cd-color-text-0` | 正文文字色 |
| `--cd-card-title-color` | `--cd-color-text-0` | 标题文字色 |
| `--cd-card-border-color` | `--cd-color-border` | 边框 / 分隔线颜色 |
| `--cd-card-border-width` | `1px` (Global border-width-sm) | 边框宽度 |
| `--cd-card-radius` | `--cd-radius-md` | 圆角 |
| `--cd-card-shadow` | `--cd-shadow-elevated` | always/hover 阴影 |
| `--cd-card-shadow-hover` | `--cd-shadow-elevated-strong` | hoverable 悬停阴影 |
| `--cd-card-padding` | `--cd-spacing-5` | default 尺寸 body 内边距 |
| `--cd-card-padding-sm` | `--cd-spacing-3` | small 尺寸内边距 |
| `--cd-card-padding-lg` | `--cd-spacing-6` | large 尺寸内边距 |
| `--cd-card-header-padding` | `--cd-spacing-4` | header 内边距 |
| `--cd-card-title-font-size` | `--cd-font-size-3` | 标题字号（default） |
| `--cd-card-actions-gap` | `--cd-spacing-2` | 操作项间距 |
| `--cd-card-hover-translate` | `-2px` | 悬停位移量 |
| `--cd-card-transition` | `--cd-motion-duration-fast` | hover/阴影过渡时长 |
| `--cd-card-disabled-opacity` | `--cd-opacity-disabled` | clickable+disabled 透明度 |

- **暗色模式**：通过 Alias（`--cd-color-bg-0`/`--cd-color-border`/`--cd-shadow-*`）自动适配，组件层无需分支。
- **对比度**：`--cd-card-title-color` / `--cd-card-color-text` 与 `--cd-card-bg` 对比度需 ≥ 4.5:1（正文）/ 3:1（大字标题）。

## 6. 无障碍（WCAG 2.1 AA）

- **角色与命名**：当存在 `title` 时，根节点 `role="region"` 并 `aria-labelledby` 指向标题节点 id（无显式 id 时用 `useId` 生成）；无标题时不设 region 角色，作为普通容器，避免产生无名地标。
- **clickable 模式**：根节点 `role="button"`、`tabindex="0"`，支持 Enter 与 Space 激活；`disabled` 时 `aria-disabled="true"` 且移出 Tab 序（`tabindex="-1"`），不触发 click。注意：若卡片内部已含交互元素（按钮/链接），避免使用 `clickable` 形成嵌套交互（点击穿透/读屏歧义），改为在卡片内提供显式主操作。
- **键盘交互**：

  | 按键 | 行为 |
  |---|---|
  | `Tab` | 在 clickable 卡片与卡内交互元素间移动焦点 |
  | `Enter` | clickable 时激活卡片 click |
  | `Space` | clickable 时激活卡片 click（按下时阻止页面滚动） |

- **焦点可见**：clickable 卡片必须有清晰 `:focus-visible` 轮廓（使用 `--cd-color-primary` 描边），不可仅靠阴影。
- **loading 态**：骨架占位容器加 `aria-busy="true"`，并对加载区使用 `aria-hidden` 包裹纯装饰骨架，配合可见隐藏文案 `Card.loadingLabel` 供读屏提示「加载中」。
- **封面图**：cover 内 `<img>` 必须由使用方提供 `alt`；纯装饰封面应 `alt=""`。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用 hover 位移与阴影过渡，仅保留即时状态切换。
- **RTL**：header 的 title/extra 左右分布、actions 排列方向随 `dir="rtl"` 镜像；内边距使用逻辑属性（padding-inline/block）。

## 7. 国际化

Card 自身可见文案极少，均走 i18n，禁止硬编码：

| i18n key | 用途 | 默认（zh-CN / en-US） |
|---|---|---|
| `Card.loadingLabel` | 加载态读屏与可选可见提示 | 加载中… / Loading… |
| `Card.moreLabel` | extra 区默认「更多」操作（如启用） | 更多 / More |

- 标题、描述、操作按钮文案由使用方传入，Card 不内建业务文案。
- 卡内若展示日期/数字/货币，应由使用方用 `Intl.DateTimeFormat` / `Intl.NumberFormat` 按当前 locale 格式化；Card 不做格式化但文档需引导。
- 文案方向、字体回退随全局 locale provider；RTL 见第 6 节。

## 8. 文案

- 标题应为名词短语，简洁（建议 ≤ 1 行），避免句末标点。
- 加载提示统一「加载中…」，不使用「请稍候」「Loading data please wait」等冗长表达。
- extra 操作链接用动词或动宾短语（「查看全部」「编辑」），与正文区分层级。
- **危险操作文案**（单列）：当 actions 区包含删除/清空等破坏性操作时，按钮文案须明确对象与后果，如「删除此卡片」而非「删除」；该操作应使用 `--cd-color-danger` 语义色并优先触发二次确认（Popconfirm/Modal），Card 容器本身不渲染危险色。

## 9. 性能（Perf Budget）

| 指标 | 预算 | 说明 |
|---|---|---|
| gzip 体积（Card + CardMeta） | ≤ 3.0 KB | 不含按需引入的 Skeleton |
| gzip 体积（含 Skeleton 复用） | ≤ 5.5 KB | loading 启用时 |
| 首次渲染（单卡，cover+body+actions） | ≤ 1 ms | 纯静态结构 |
| loading 切换为真实内容（无布局抖动） | CLS ≈ 0 | 骨架与内容高度对齐 |
| 100 卡网格平铺渲染 | ≤ 60 ms | 建议外层虚拟化 |

- **虚拟化**：Card 自身不内建虚拟滚动；长列表（>50 卡）由使用方配合虚拟列表（如 List 虚拟化）渲染，Card 保持轻量无副作用。
- **惰性渲染**：cover/actions slot 在对应 prop/slot 未提供时完全不渲染 DOM（无空节点）。loading 模式下 body 真实内容不渲染，仅渲染骨架。
- **destroyOnClose**：不适用（Card 无显隐切换语义）；但 loading→loaded 切换默认卸载骨架节点。
- **过渡**：hover 过渡仅作用于 transform/box-shadow（合成层友好），不触发重排。

## 10. AI 元数据

提供 `component.meta.ts`，用于 AI 辅助生成与文档检索：

- `name: "Card"`，`category: "show"`，`stage: "M4"`，`semiEquivalent: "Card"`。
- `tags: ["容器", "卡片", "封面", "操作区", "加载态", "container", "card"]`。
- `props` schema（类型、默认值、枚举、是否 Snippet）与上文 4.1 一致，供生成器约束。
- `slots`/`events` 清单同 4.2 / 4.3。
- `composesWith: ["CardMeta", "Skeleton", "Button", "Grid", "Space", "Avatar"]`。
- `a11yRoles: ["region", "button(clickable)"]`，`i18nKeys: ["Card.loadingLabel", "Card.moreLabel"]`。
- `antiPatterns: ["clickable 嵌套交互元素", "容器使用 danger 语义色", "loading 高度与内容不一致导致 CLS"]`。
- `examples`: 基础卡 / 封面卡 / 操作卡 / 加载卡 / clickable 卡 的最小代码片段。

## 11. 测试

- **单元（Vitest + @testing-library/svelte）**
  - props 渲染：title/extra/cover/actions 各区按需出现与隐藏；size 内边距类名正确。
  - bordered/shadow/hoverable 类名与 token 应用。
  - loading：渲染骨架、`aria-busy="true"`、真实内容不渲染；loadingRows 生效。
  - clickable：Enter/Space/Click 触发 `on:click`；disabled 时不触发且 `aria-disabled`。
  - region/aria-labelledby：有/无 title 的角色与命名分支。
- **快照 / 视觉回归（Playwright + 截图）**
  - 三尺寸 × bordered/shadow/hoverable 组合；暗色模式；RTL 镜像。
  - loading 骨架与 loaded 内容高度一致（CLS 验证）。
- **a11y（axe-core）**
  - 无 violations；clickable 焦点轮廓可见；reduced-motion 下无动画。
- **i18n**：切换 locale 后 `Card.loadingLabel` 文案更新；RTL 排列方向正确。
- **交互**：keyboard-only 流程可激活 clickable 卡片并到达卡内操作。

## 12. 验收标准 Checklist

- [ ] 四区（cover/header/body/actions）按需渲染，未提供时无空 DOM、无多余分隔线。
- [ ] `size` small/default/large 仅改变内边距与标题字号，圆角/边框一致。
- [ ] `bordered` / `shadow` / `hoverable` 行为与视觉符合第 2 节语义，且互不冲突。
- [ ] `loading` 渲染骨架、`aria-busy`，loaded 切换 CLS≈0，`loadingRows` 生效。
- [ ] `clickable` 提供 `role=button`/tabindex/Enter/Space 激活；`disabled` 正确禁用并 `aria-disabled`。
- [ ] 有 `title` 时根节点 `role=region` + `aria-labelledby` 关联；无 title 不产生无名地标。
- [ ] 所有样式仅消费 Alias/Component token，无写死颜色/间距；暗色模式自动适配。
- [ ] `:focus-visible` 轮廓清晰；`prefers-reduced-motion` 下禁用位移/过渡动画。
- [ ] RTL 下 header/actions 镜像，使用逻辑内边距属性。
- [ ] 可见文案全部走 i18n（`Card.loadingLabel` / `Card.moreLabel`），无硬编码。
- [ ] 危险操作文案明确对象与后果、使用 danger 语义色并配二次确认。
- [ ] axe-core 无 violations；单元/视觉/键盘测试全部通过。
- [ ] 提供 `component.meta.ts`，字段与本 SPEC 第 4/10 节一致。
- [ ] gzip 体积满足第 9 节 Perf Budget。
