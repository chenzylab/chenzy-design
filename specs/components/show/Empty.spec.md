# SPEC · Empty
> 分类：show · 阶段：M4
> 对标 Semi：Empty

## 1. 概述

`Empty` 用于在「无数据 / 无搜索结果 / 无权限 / 网络错误」等场景下，向用户展示一个友好的占位状态。它由「插画 + 标题 + 描述 + 动作区」四段式组成，是页面、列表、表格、卡片、抽屉等容器的统一空状态出口。

核心定位：

- 这是一个**重文案规范**的纯展示组件——它的价值不在交互，而在于把「为什么空」和「下一步做什么」说清楚。因此本 SPEC 的 §8 文案是落地重点。
- 提供内置语义化插画预设（`noData` / `noResult` / `noAccess` / `error` / `success` / `construction`），覆盖 80% 高频场景，业务无需自带图。
- 同时承担「容器空态」与「整页空态」两种排布：`layout="vertical"`（默认，居中堆叠）与 `layout="horizontal"`（插画在左、文案在右，适合宽容器/引导卡）。
- 通常被其他组件（Table / List / Select / Tree / Transfer）作为 `empty` slot 默认填充，也可独立使用。

非目标：不负责数据加载（Loading/Skeleton 另有组件）；不负责错误边界捕获（属于上层 ErrorBoundary）。

## 2. 设计语义

- **结构层级**：插画体量最大但视觉权重最轻（降饱和/低对比），标题为主信息（`--cd-color-text-0`），描述为次信息（`--cd-color-text-2`），动作为唯一可点击焦点。视觉权重排序：动作 > 标题 > 描述 > 插画。
- **留白与密度**：垂直布局各段间距随 `size` 缩放（small/default/large 对应 8/12/16 的基准步进），保证在小卡片里不显拥挤、在整页里不显空旷。
- **插画态度**：默认插画使用「平静中性」风格，避免在 `error` 态使用强烈警示红——空态不等于报错；仅 `error` 预设引入 `--cd-color-danger` 作点缀，主体仍保持低饱和。
- **响应式**：容器宽度 < `--cd-empty-compact-width`（默认 320px）时自动收缩插画尺寸并切回 vertical，防止 horizontal 布局在窄屏溢出。
- **暗色模式**：插画通过 `currentColor` + token 驱动描边/填充，自动适配 light/dark，不靠两套位图。
- **动效**：插画首次进入有 200ms 淡入 + 4px 上移；遵守 `prefers-reduced-motion` 时仅淡入、无位移。

## 3. 分层实现

`Empty` 是**纯展示组件，省略 core**——它无键盘导航、无浮层、无焦点陷阱，不需要 headless 状态机。逻辑极薄，全部在 `@chenzy-design/svelte` 实现。

- `@chenzy-design/svelte`
  - `Empty.svelte`：根渲染、布局编排、size/layout 派生类名、响应式收缩（ResizeObserver 监听容器宽度）。
  - `illustrations/`：内置 SVG 预设（按 `image` 枚举懒引用，未用到的预设不进 bundle，靠 tree-shaking + 动态映射）。
- 复用 core 原语：仅 `useId`（为 `aria-labelledby`/`aria-describedby` 生成标题与描述的关联 id）。`useFocusTrap`/`useRovingTabindex`/`useDismiss`/`useScrollLock`/`useLiveAnnouncer` 均不适用。
- 动作区：组件本身不内置按钮逻辑，通过 `action` slot 让业务塞入 `Button`，保证空态不与按钮职责耦合。

## 4. API

### 4.1 Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `image` | `'noData' \| 'noResult' \| 'noAccess' \| 'error' \| 'success' \| 'construction' \| string` | `'noData'` | 内置插画预设名；传 URL 字符串则作为图片 `src` 渲染（外部图）。需自定义节点时用 `image` slot。 |
| `title` | `string` | 由 `image` 决定的 i18n 默认值 | 主标题文案；不传则使用对应预设的内置 i18n 默认。 |
| `description` | `string` | `undefined` | 次级描述文案；省略则不渲染该行。 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 整体尺寸；影响插画尺寸与各段间距。 |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | 排布方向；horizontal 在窄容器自动降级为 vertical。 |
| `imageWidth` | `number` | 随 `size` 派生 | 覆盖插画宽度（px），用于精细控制。 |
| `responsive` | `boolean` | `true` | 是否启用容器宽度自适应收缩。 |
| `class` | `string` | `''` | 根节点附加类名。 |
| `style` | `string` | `''` | 根节点内联样式。 |

> 说明：本组件无受控数据输入与浮层，故不涉及 `value/on:change`、`open/on:openChange`、`status` 约定。

### 4.2 Events

| Event | payload | 说明 |
| --- | --- | --- |
| `on:imageError` | `{ src: string }` | 当 `image` 为外部 URL 且加载失败时触发；业务可据此降级为内置 `noData` 插画。 |

> Empty 本身无交互事件；动作的点击事件由 `action` slot 内的业务组件（如 `Button`）自行派发。

### 4.3 Slots

| Slot | 作用域参数 | 说明 |
| --- | --- | --- |
| `image` | — | 完全自定义插画/图片节点，覆盖 `image` prop 的内置渲染。 |
| `title` | — | 自定义标题节点，覆盖 `title` prop。 |
| `description` | — | 自定义描述节点，覆盖 `description` prop。 |
| `action` | — | 动作区，放置主/次按钮或链接（如「刷新」「创建」「返回」）。 |
| `default` | — | 动作区之后的补充内容（如帮助链接、说明小字）。 |

## 5. 主题 / Token 表

组件仅消费 Alias / Component 级 token，禁止写死值。

| Component Token | 回退（Alias） | 用途 |
| --- | --- | --- |
| `--cd-empty-title-color` | `--cd-color-text-0` | 标题文字色 |
| `--cd-empty-description-color` | `--cd-color-text-2` | 描述文字色 |
| `--cd-empty-bg` | `--cd-color-bg-0` | 根背景（默认透明继承容器，可覆盖） |
| `--cd-empty-illustration-primary` | `--cd-color-text-3` | 插画主描边/主填充（低对比中性） |
| `--cd-empty-illustration-secondary` | `--cd-color-fill-0` | 插画次填充/底色块 |
| `--cd-empty-illustration-accent` | `--cd-color-primary` | 插画点缀色（success 预设用 `--cd-color-success`，error 预设用 `--cd-color-danger`） |
| `--cd-empty-gap` | `--cd-spacing-base` (12px) | 各段垂直间距基准（按 size 缩放） |
| `--cd-empty-image-size-small` | `64px` | small 插画尺寸 |
| `--cd-empty-image-size-default` | `120px` | default 插画尺寸 |
| `--cd-empty-image-size-large` | `200px` | large 插画尺寸 |
| `--cd-empty-compact-width` | `320px` | horizontal 降级断点 |
| `--cd-empty-title-font` | `--cd-font-size-2` | 标题字号 |
| `--cd-empty-description-font` | `--cd-font-size-1` | 描述字号 |

类名约定：`cd-empty`、`cd-empty__image`、`cd-empty__title`、`cd-empty__description`、`cd-empty__action`、`cd-empty__footer`；修饰符 `cd-empty--small/--large`、`cd-empty--horizontal`、`cd-empty--compact`（响应式收缩态）。

## 6. 无障碍

遵循 WCAG 2.1 AA。`Empty` 不是 WAI-ARIA APG 的复合控件，重点在语义关联而非键盘交互。

- **role**：根节点 `role="status"` + `aria-live="polite"`，使空态在动态切换（如搜索后变空）时被屏幕阅读器播报；纯静态整页空态可由业务设 `aria-live="off"` 避免冗余播报。
- **关联**：根节点 `aria-labelledby` 指向标题 id、`aria-describedby` 指向描述 id（均由 `useId` 生成）；标题/描述缺省时对应属性不输出。
- **插画**：装饰性 SVG 加 `aria-hidden="true"` 与 `role="presentation"`，不进无障碍树（信息已由标题/描述承载）；若插画承载了文案未覆盖的关键信息，则改用 `role="img"` + `aria-label`。
- **外部图片**：`<img>` 的 `alt` 取 `title`，无 title 时 `alt=""`（装饰）。
- **焦点管理**：组件自身不抢焦点；`action` slot 内按钮必须可 Tab 聚焦、有可见焦点环（≥3:1 对比），不得用 `outline:none` 去除。
- **对比度**：标题文字对背景 ≥4.5:1，描述 ≥4.5:1（即便是次要文字也按正文标准）；插画为装饰不强制对比度。
- **reduced-motion**：`prefers-reduced-motion: reduce` 时禁用位移动效，仅保留无害淡入或直接显示。
- **RTL**：horizontal 布局在 `dir="rtl"` 下镜像（插画移至右侧），间距使用逻辑属性 `margin-inline`；插画本身若有方向性指向需提供 RTL 镜像变体。

## 7. 国际化

用户可见文案零硬编码，全部走 i18n；内置插画预设各自带默认 key。

| i18n key | 默认值（zh-CN） | 用途 |
| --- | --- | --- |
| `Empty.noData.title` | 暂无数据 | noData 预设默认标题 |
| `Empty.noData.description` | 当前没有可显示的内容 | noData 预设默认描述 |
| `Empty.noResult.title` | 没有找到相关结果 | noResult 预设默认标题 |
| `Empty.noResult.description` | 试试更换关键词或调整筛选条件 | noResult 预设默认描述 |
| `Empty.noAccess.title` | 暂无访问权限 | noAccess 预设默认标题 |
| `Empty.noAccess.description` | 如需访问，请联系管理员开通 | noAccess 预设默认描述 |
| `Empty.error.title` | 加载失败 | error 预设默认标题 |
| `Empty.error.description` | 内容加载出现问题，请稍后重试 | error 预设默认描述 |
| `Empty.success.title` | 全部完成 | success 预设默认标题 |
| `Empty.construction.title` | 功能建设中 | construction 预设默认标题 |
| `Empty.imageAlt` | 空状态插画 | 插画无障碍替代文本兜底 |

- 文案换行/排版不假设固定字符数；德/法等长文本语言下标题/描述自动换行，间距不受影响。
- 若描述含动态数量（如「找到 0 条」），由业务用 `Intl.NumberFormat` 格式化后传入 `description`，组件不内置数字格式化。
- key 命名遵循 `<Name>.field` 约定（此处为 `Empty.<preset>.<part>`）。

## 8. 文案（重点）

遵循 content-guidelines。空态文案的目标：**解释现状 + 引导下一步**，杜绝技术黑话与自责式表达。

通用原则：

- 标题简短（≤12 字），陈述事实，不带情绪；描述补充原因或动作建议（≤24 字/行）。
- 不使用「Oops / 哎呀 / 出错啦」等卖萌或推责口吻；不暴露 error code、stack、字段名给终端用户。
- 「无数据」与「无搜索结果」必须区分：前者是「还没有」，后者是「没匹配到」，引导动作不同。
- 动作文案用动宾短语、首词为动词：「创建项目」「清空筛选」「刷新重试」，而非「点击这里」。
- 区分「用户能解决」（无结果→改条件）与「用户不能解决」（无权限→联系管理员），不要给用户无法执行的建议。

场景文案对照：

| 场景 | 标题 | 描述 | 动作 |
| --- | --- | --- | --- |
| 列表/表格无数据 | 暂无数据 | 创建第一条记录后将在此显示 | 创建 |
| 搜索/筛选无结果 | 没有找到相关结果 | 试试更换关键词或清空筛选条件 | 清空筛选 |
| 无权限 | 暂无访问权限 | 如需访问，请联系管理员开通 | 联系管理员 |
| 加载失败 | 加载失败 | 内容加载出现问题，请稍后重试 | 刷新重试 |
| 建设中 | 功能建设中 | 该功能即将上线，敬请期待 | —（可选返回） |

### 危险操作文案（单列）

`Empty` 自身不触发破坏性操作；但其 `action` slot 常承载危险动作（如「清空全部」「删除所有」）。约定：

- 危险动作按钮用 `Button type="danger"`，文案明确对象与不可逆性，如「清空全部记录」而非「清空」。
- 危险动作必须经二次确认（`Popconfirm`/`Modal`），不在空态里一键执行。
- 确认弹层文案需点明后果：「清空后所有记录将无法恢复，确定继续？」；确认按钮文案与动作一致（「清空全部记录」），取消为「取消」。
- 不把危险动作设为空态里视觉最强的主按钮，避免误触；危险动作宜为次级按钮。

## 9. 性能

### Perf Budget

| 指标 | 预算 | 说明 |
| --- | --- | --- |
| JS gzip（组件本体） | ≤ 1.5 KB | 渲染逻辑极薄，无 core 依赖 |
| 单个内置插画 SVG gzip | ≤ 1.2 KB / 个 | 优化路径、共享 token 描边 |
| 插画总入口 | 按需加载 | 仅引用到的预设进 bundle，未用预设 tree-shaken |
| 首次渲染 | < 1ms | 无状态计算，纯模板 |
| ResizeObserver 开销 | 仅 `responsive=true` 且 layout=horizontal 时挂载；回调 16ms 节流 | 避免无意义观察 |

- **无虚拟化需求**：单实例、节点数恒定（≤6 个元素），无列表。
- **惰性插画**：内置插画用动态映射 + 静态 import 分割，未使用的预设不打入产物；外部 URL 图加 `loading="lazy"`。
- **destroyOnClose 不适用**：本组件无浮层显隐；当作为 Table/List 的空态时，由父容器在「有数据」时整体卸载 Empty，组件自身不维护可见性状态。
- **避免重复观察**：`responsive=false` 或 `layout=vertical` 时完全不创建 ResizeObserver。

## 10. AI 元数据

提供 `component.meta.ts`，供 AI/低代码消费：

- `name: "Empty"`，`category: "show"`，`stage: "M4"`，`semiEquivalent: "Empty"`。
- `props` schema：枚举 `image` 预设值、`size`、`layout`，标注默认值与 i18n 默认来源。
- `slots`：`image / title / description / action / default` 及用途描述。
- `events`：`imageError`。
- `whenToUse`：「容器或整页无可展示内容时」；`whenNotToUse`：「加载中（用 Skeleton/Spin）」「表单校验提示（用 Form 错误态）」「全局异常兜底（用 ErrorBoundary）」。
- `composability`：常作为 `Table.empty` / `List` / `Select` / `Tree` 的空态插槽；`action` 常组合 `Button` + `Popconfirm`。
- `a11yNotes`：role=status、aria-live、装饰插画 aria-hidden。
- `contentSlots`：标记 `title/description/action` 为文案敏感字段，供 AI 生成时套用 §8 规范。

## 11. 测试

- **单元**（组件渲染）：
  - 各 `image` 预设渲染对应 SVG；传 URL 渲染 `<img src>`。
  - 缺省 `title` 时回退到预设 i18n 默认；传 `title` 覆盖。
  - `description` 缺省时不渲染该行节点。
  - `size`/`layout` 派生正确的修饰类名与插画尺寸。
  - 外部图加载失败派发 `imageError`，payload 含 src。
- **a11y**（axe + 断言）：
  - 根 `role="status"`、`aria-live="polite"`；`aria-labelledby`/`aria-describedby` 正确指向且 id 唯一（useId）。
  - 装饰插画 `aria-hidden="true"`；外部图 alt 取 title。
  - axe 无 violations；标题/描述对比度 ≥4.5:1（视觉回归断言 token 值）。
- **响应式**：模拟容器宽度 < `--cd-empty-compact-width`，断言 horizontal 降级为 vertical 并加 `cd-empty--compact`；`responsive=false` 时不降级、不创建 ResizeObserver。
- **i18n**：切换 locale 后所有内置文案随 key 变化；无硬编码字符串残留（快照扫描）。
- **reduced-motion**：模拟 `prefers-reduced-motion: reduce`，断言位移动效被禁用。
- **slot 覆盖**：`image/title/description/action` slot 提供时覆盖对应 prop 渲染。
- **视觉回归**：6 个预设 × {light/dark} × {small/default/large} × {vertical/horizontal} 关键组合截图。

## 12. 验收标准 checklist

- [ ] Props/Events/Slots 与本 SPEC §4 一致，类型与默认值落地。
- [ ] 6 个内置插画预设齐全，支持 light/dark 自适应（token + currentColor 驱动）。
- [ ] 未使用的插画预设可被 tree-shaking 移除，本体 JS gzip ≤ 1.5 KB。
- [ ] 仅消费 `--cd-empty-*` / Alias token，无任何写死颜色/尺寸值。
- [ ] 类名遵循 `cd-empty` BEM-like 约定。
- [ ] 根 `role="status"` + `aria-live`，`aria-labelledby`/`aria-describedby` 正确关联（useId）。
- [ ] 装饰插画 `aria-hidden`，外部图 alt 合理；axe 零 violations。
- [ ] 标题/描述对比度 ≥4.5:1；焦点环可见且 ≥3:1。
- [ ] `prefers-reduced-motion` 下禁用位移动效；`dir="rtl"` 下 horizontal 正确镜像（逻辑属性）。
- [ ] 全部用户可见文案走 i18n，key 遵循 `Empty.<preset>.<part>`，无硬编码。
- [ ] §8 场景文案与危险操作文案规范在默认值与文档中体现；危险动作走二次确认。
- [ ] `responsive` 行为正确：窄容器降级、`responsive=false` 不创建 ResizeObserver。
- [ ] 提供 `component.meta.ts`，含 whenToUse/whenNotToUse、contentSlots 标记。
- [ ] 单元 / a11y / 响应式 / i18n / 视觉回归测试通过。
