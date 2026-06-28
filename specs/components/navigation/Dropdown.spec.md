# SPEC · Dropdown
> 分类：navigation · 阶段：M3
> 对标 Semi：Dropdown

## 1. 概述

Dropdown 是一个轻量级浮层菜单容器，通过触发元素（按钮、文字、图标）唤起一组可操作的命令项。它与 `Select` 的本质区别是：`Select` 用于"从选项集合中选值"（受控 `value`），而 `Dropdown` 用于"触发命令/导航动作"，自身不持有选中值，点击项即执行回调。

典型场景：
- 表格行的"更多操作"（编辑/删除/复制）。
- 顶部导航的用户菜单（个人中心/设置/退出登录）。
- 工具栏溢出菜单、批量操作菜单。
- 多级嵌套菜单（子菜单 hover/点击展开）。

核心能力：
- 三种触发方式 `trigger`: `hover` | `click` | `contextMenu`（右键）。
- 12 种弹出位置 `position`（top/bottom/left/right × Start/Center/End）。
- 任意层级嵌套（`Dropdown.Menu` > `Dropdown.Item` / `Dropdown.SubMenu`）。
- 菜单项支持：图标、快捷键提示、危险态、禁用、分组、分割线、单/多选勾选项。
- 受控/非受控显隐，支持 `destroyOnClose` 与惰性挂载。

它不是 `Select`（无 `value`/搜索/多选 tag），不是 `Cascader`（无路径数据驱动），不是 `Tooltip`（承载可交互项而非纯展示）。

## 2. 设计语义

| 维度 | 语义 |
| --- | --- |
| 角色定位 | 命令触发型浮层菜单，非数据选择器 |
| 视觉层级 | 浮层位于 `--cd-z-index-dropdown`(1050)，带阴影 `--cd-shadow-elevated` 与圆角 `--cd-radius-medium` |
| 间距节奏 | 菜单项高度随 `size` 变化（small 28 / default 32 / large 40），左右内边距 `--cd-spacing-base`(8px) 基准 |
| 状态语义 | 默认 / hover(`--cd-color-fill-0`) / active / 选中(`--cd-dropdown-item-selected-bg`) / 禁用(`--cd-color-disabled-text`) / 危险(`--cd-color-danger`) |
| 危险项 | 文字与 hover 背景使用 danger 色阶，与普通项形成明确视觉区隔 |
| 嵌套指示 | SubMenu 右侧固定 `chevron-right` 图标，展开方向自适应（空间不足镜像至左侧） |
| 动效 | 出现/消失走 `--cd-motion-duration-fast`(150ms) + `--cd-motion-ease-out`，缩放+淡入，源点对齐触发元素 |
| 尺寸 | `small` `default` `large` 仅影响项高度、字号、图标尺寸，不影响浮层圆角/阴影 |

## 3. 分层实现

本组件含交互/键盘/焦点/嵌套逻辑，采用 headless + 渲染分层。

**`@chenzy-design/core` — `createDropdown(config)`**
- 管理 `open` 状态机（含 hover 的 open/close 延迟 `mouseEnterDelay`/`mouseLeaveDelay` 防抖）。
- 维护嵌套菜单树：每个 SubMenu 是一个子 `createDropdownMenu` 实例，父子共享一个"激活路径"，hover/键盘进入子菜单时挂起父级关闭计时器。
- 触发模式适配器：`click`（toggle）、`hover`（延迟开关）、`contextMenu`（监听 `contextmenu`，阻止默认菜单，按指针坐标定位）。
- 复用 core 原语：
  - `useDismiss`：点击浮层外部、按 `Escape`、滚动/失焦时关闭（嵌套时仅关闭当前层及子层，逐级回退）。
  - `useFocusTrap`：`click`/`contextMenu` 触发时启用，将焦点圈定在菜单内；`hover` 触发不抢焦点（指针操作）。
  - `useRovingTabindex`：菜单项 Up/Down 漫游，`tabindex` 仅激活项为 0。
  - `useId`：生成 `aria-controls` / `aria-activedescendant` / menu id。
  - `useScrollLock`：仅 `contextMenu` 全屏定位场景可选启用，默认不锁。
- 输出：`triggerProps`、`menuProps`、`getItemProps(item)`、`getSubMenuTriggerProps`、`open`、`setOpen`、`activeIndex`、位置计算（依赖浮层定位原语 `usePosition`，含翻转/移位/碰撞检测）。

**`@chenzy-design/svelte` — 渲染层**
- `Dropdown`（容器/触发挂载）、`Dropdown.Menu`、`Dropdown.Item`、`Dropdown.SubMenu`、`Dropdown.ItemGroup`、`Dropdown.Divider`、`Dropdown.Title`。
- 通过 Svelte `setContext`/`getContext` 在嵌套层间传递 core 实例与激活路径，避免 prop 透传。
- 浮层用 portal 挂载至 `body`（可配 `getPopupContainer`），`transition:scale` 受 `reduced-motion` 降级。

## 4. API

### Props

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `trigger` | `'hover' \| 'click' \| 'contextMenu'` | `'hover'` | 触发方式 |
| `open` | `boolean` | — | 受控显隐（配合 `on:openChange`） |
| `defaultOpen` | `boolean` | `false` | 非受控初始显隐 |
| `position` | `'top' \| 'topStart' \| 'topEnd' \| 'bottom' \| 'bottomStart' \| 'bottomEnd' \| 'left' \| 'leftStart' \| 'leftEnd' \| 'right' \| 'rightStart' \| 'rightEnd'` | `'bottomStart'` | 浮层位置 |
| `size` | `'small' \| 'default' \| 'large'` | `'default'` | 菜单项尺寸 |
| `disabled` | `boolean` | `false` | 禁用整个触发 |
| `mouseEnterDelay` | `number` | `150` | hover 触发的进入延迟(ms) |
| `mouseLeaveDelay` | `number` | `150` | hover 触发的离开延迟(ms) |
| `spacing` | `number \| { x: number; y: number }` | `4` | 浮层与触发元素间距(px) |
| `closeOnEsc` | `boolean` | `true` | Esc 是否关闭 |
| `closeOnSelect` | `boolean` | `true` | 点击 Item 后是否自动关闭（多选项可设 false） |
| `clickToHide` | `boolean` | `true` | hover 模式下点击项是否关闭 |
| `destroyOnClose` | `boolean` | `false` | 关闭时是否销毁浮层 DOM |
| `lazyRender` | `boolean` | `true` | 首次打开前不渲染浮层内容 |
| `getPopupContainer` | `() => HTMLElement` | `() => document.body` | 浮层挂载容器 |
| `zIndex` | `number` | `1050` | 浮层层级 |
| `autoAdjustOverflow` | `boolean` | `true` | 空间不足时自动翻转/移位 |
| `keepDOM` | `boolean` | `false` | 关闭后保留 DOM（与 destroyOnClose 互斥） |

`Dropdown.Item` 专属 Props：

| Prop | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `type` | `'default' \| 'danger'` | `'default'` | 危险操作项 |
| `disabled` | `boolean` | `false` | 禁用该项 |
| `active` | `boolean` | `false` | 强制激活高亮 |
| `selected` | `boolean` | `false` | 勾选态（显示 check 图标） |
| `icon` | `Snippet` | — | 前置图标 |
| `hotkey` | `string` | — | 右侧快捷键提示文本 |

### Events

| Event | Payload | 说明 |
| --- | --- | --- |
| `on:openChange` | `{ open: boolean }` | 显隐变化（受控同步用） |
| `on:visibleChange` | `boolean` | `openChange` 的简写别名（兼容迁移） |
| `on:select` | `{ value: string \| number; item: ItemMeta; domEvent: Event }` | 任一菜单项被选中 |
| `on:itemClick`（Item 上） | `{ domEvent: MouseEvent \| KeyboardEvent }` | 单个 Item 点击/回车 |
| `on:contextMenu` | `{ x: number; y: number; domEvent: MouseEvent }` | contextMenu 触发时坐标 |

### Slots

| Slot | 说明 |
| --- | --- |
| `default` | 触发元素（trigger child） |
| `menu` | 自定义整段菜单内容（替代 `Dropdown.Menu` 子项写法） |
| `item`（Item 内 default） | 菜单项主体内容 |
| `title`（SubMenu 内） | 子菜单触发标题 |
| `empty` | 菜单无内容时的占位 |

## 5. 主题 / Token 表

| Component Token | 引用 Alias | 用途 |
| --- | --- | --- |
| `--cd-dropdown-bg` | `--cd-color-bg-0` | 浮层背景 |
| `--cd-dropdown-shadow` | `--cd-shadow-elevated` | 浮层阴影 |
| `--cd-dropdown-radius` | `--cd-radius-medium` | 浮层圆角 |
| `--cd-dropdown-border` | `--cd-color-border` | 浮层描边（暗色模式补强） |
| `--cd-dropdown-padding` | `--cd-spacing-tight`(4px) | 浮层内边距 |
| `--cd-dropdown-item-color` | `--cd-color-text-0` | 菜单项文字 |
| `--cd-dropdown-item-hover-bg` | `--cd-color-fill-0` | 菜单项 hover 背景 |
| `--cd-dropdown-item-selected-bg` | `--cd-color-primary-light-default` | 选中态背景 |
| `--cd-dropdown-item-selected-color` | `--cd-color-primary` | 选中态文字 |
| `--cd-dropdown-item-disabled-color` | `--cd-color-disabled-text` | 禁用文字 |
| `--cd-dropdown-item-danger-color` | `--cd-color-danger` | 危险项文字 |
| `--cd-dropdown-item-danger-hover-bg` | `--cd-color-danger-light-default` | 危险项 hover 背景 |
| `--cd-dropdown-item-height` | — (随 size 计算 28/32/40px) | 项高度 |
| `--cd-dropdown-icon-color` | `--cd-color-text-2` | 图标/chevron 颜色 |
| `--cd-dropdown-hotkey-color` | `--cd-color-text-2` | 快捷键提示文字 |
| `--cd-dropdown-divider-color` | `--cd-color-border` | 分割线颜色 |
| `--cd-dropdown-group-title-color` | `--cd-color-text-2` | 分组标题颜色 |
| `--cd-dropdown-z-index` | `--cd-z-index-dropdown` | 浮层层级 |

约束：组件内禁止写死色值/尺寸，所有取值经 Component Token → Alias 链路；暗色模式仅需覆盖 Alias 层。

## 6. 无障碍

遵循 WAI-ARIA APG「Menu / Menu Button」模式。

**role / aria**
- 触发元素：`role` 保持原生（推荐 `<button>`），`aria-haspopup="menu"`，`aria-expanded={open}`，`aria-controls={menuId}`。
- 浮层容器：`role="menu"`，`aria-labelledby` 指向触发元素。
- 普通项：`role="menuitem"`；多选勾选项：`role="menuitemcheckbox"` + `aria-checked`；单选组项：`role="menuitemradio"`。
- SubMenu 触发项：`role="menuitem"` + `aria-haspopup="menu"` + `aria-expanded`，其子层 `role="menu"`。
- 分组：`role="group"` + `aria-labelledby` 指向 group title；分割线：`role="separator"`。
- 焦点策略采用 `aria-activedescendant`（菜单容器持有焦点，`aria-activedescendant` 指向当前项），避免逐项 DOM 焦点跳动。

**键盘交互**

| 按键 | 行为 |
| --- | --- |
| `Enter` / `Space` (触发器) | click 模式打开并聚焦首项 |
| `ArrowDown` / `ArrowUp` | 在同级项间漫游（roving），跳过 disabled |
| `ArrowRight` | SubMenu 触发项上展开子菜单并聚焦首项 |
| `ArrowLeft` | 在子菜单内回退到父级并收起当前子菜单 |
| `Enter` / `Space` (项) | 触发该项 action，按 `closeOnSelect` 关闭 |
| `Escape` | 关闭当前层，焦点回退父级触发项 |
| `Home` / `End` | 跳至首/末项 |
| 字母键 | typeahead 首字母匹配项 |
| `Tab` | 关闭菜单并将焦点移出（菜单不参与 Tab 序列内部漫游） |

**焦点管理**：click/contextMenu 打开后焦点进入菜单（FocusTrap），关闭后归还触发元素；hover 触发不抢焦点。

**其他**：对比度满足 AA（文字/图标 ≥4.5:1，危险项 hover 态校验）；`prefers-reduced-motion` 时禁用缩放过渡仅保留即时显隐；RTL 下 SubMenu 默认向左展开、chevron 镜像、`position` 起止端镜像。

## 7. 国际化

用户可见文案零硬编码，经 i18n provider 注入。

| i18n key | 默认值(zh) | 用途 |
| --- | --- | --- |
| `Dropdown.empty` | 暂无选项 | 空菜单占位 |
| `Dropdown.subMenuExpand` | 展开子菜单 | SubMenu 触发的 aria-label 补充 |
| `Dropdown.loading` | 加载中 | 异步菜单加载态 |
| `Dropdown.more` | 更多 | 默认"更多操作"触发器无障碍名 |

- 快捷键提示（`hotkey`）按平台展示：macOS 用 `⌘⌥⇧`，其他用 `Ctrl/Alt/Shift`，由组件运行时检测。
- 菜单项业务文案由使用方传入，组件不内置；危险项确认文案见第 8 节。
- 数字/日期类菜单项（如时间筛选）建议使用 `Intl.DateTimeFormat` / `Intl.NumberFormat` 由调用方格式化。

## 8. 文案

遵循 content-guidelines：菜单项使用动词短语、简洁、首字母大写规范按语言；避免句末标点。

- 推荐："编辑" "复制链接" "导出为 CSV"；避免："点击这里来编辑"。
- 分组标题用名词短语，保持简短："视图" "操作"。
- SubMenu 标题应表明其下为子集："导出格式 >"。

**危险操作文案（单列）**
- 危险项（`type="danger"`）文案需明确后果且不可仅靠颜色传达："删除" "永久删除" "移出团队"。
- 不可逆操作应在点击后引导二次确认（配合 `Popconfirm`/`Modal`），Dropdown 自身不弹确认。
- 危险项无障碍名建议补充影响范围，如 `aria-label="删除该文件"`，避免歧义。

## 9. 性能

| 指标 | 预算 / 策略 |
| --- | --- |
| core (`createDropdown`) gzip | ≤ 4.5 KB |
| svelte 渲染层 gzip | ≤ 7.85 KB（不含图标；含 Item/Menu/SubMenu/Title/Divider 子组件全挂载后按实测+15% 校准） |
| 首次打开 (TTI) | < 16ms（单帧内完成定位+绘制，≤ 50 项） |
| 大菜单虚拟化 | 项数 > 100 时启用 `Dropdown.Menu` 虚拟滚动（可选 prop `virtualized`），窗口化渲染 |
| 惰性渲染 | `lazyRender` 默认开，浮层内容首次打开前不进入 DOM |
| destroyOnClose | 默认关；高频列表行内菜单建议开，避免 N 行 × M 项常驻 DOM |
| 嵌套子菜单 | 子菜单惰性挂载，仅在父项激活路径上时实例化 core 子状态机 |
| 定位计算 | 使用 `usePosition` 单次测量 + `ResizeObserver`，避免 scroll 高频 reflow（rAF 节流） |
| 事件监听 | 全局 dismiss 监听仅在 `open=true` 时挂载，关闭即卸载 |

## 10. AI 元数据

提供 `component.meta.ts`，内容包含：
- `name: 'Dropdown'`、`category: 'navigation'`、`stage: 'M3'`、`semiEquivalent: 'Dropdown'`。
- `subComponents`: `['Dropdown.Menu','Dropdown.Item','Dropdown.SubMenu','Dropdown.ItemGroup','Dropdown.Divider','Dropdown.Title']`。
- `props` schema（类型、默认值、枚举、是否受控）供 AI 生成代码补全。
- `whenToUse` / `whenNotToUse`：用 vs `Select`/`Cascader`/`Menu`/`Tooltip` 的判定。
- `a11yPattern: 'menu-button'`、`keyboardMap` 摘要。
- `examples`: 含 click 触发、hover 嵌套、右键菜单、危险项、多选勾选 5 个最小可运行片段。
- `tokens`: 暴露第 5 节 Component Token 清单供主题工具消费。

## 11. 测试

- **单元（core）**：状态机开关、hover 延迟防抖、嵌套激活路径维护、contextMenu 坐标定位、roving/typeahead 选择逻辑、closeOnSelect/closeOnEsc 分支。
- **组件（svelte）**：三种 trigger 行为、受控/非受控显隐一致性、destroyOnClose/lazyRender DOM 断言、子菜单展开收起、危险项渲染。
- **a11y 自动化**：`axe` 扫描（role/aria-expanded/aria-haspopup/aria-checked）、对比度断言、reduced-motion 媒体查询降级。
- **键盘交互测试**：Up/Down/Left/Right/Home/End/Esc/Enter/字母 typeahead 全路径，焦点归还断言。
- **定位测试**：12 种 position、autoAdjustOverflow 翻转、RTL 镜像、`getPopupContainer` 自定义容器。
- **视觉回归**：各 size、hover/selected/disabled/danger 态、暗色模式快照。
- **性能**：100+ 项虚拟化渲染帧预算、open/close 监听挂卸泄漏检测。

## 12. 验收标准 checklist

- [ ] 三种 `trigger`（hover/click/contextMenu）行为正确，hover 延迟防抖生效。
- [ ] `open`/`defaultOpen` + `on:openChange` 受控与非受控均工作。
- [ ] 12 种 `position` 与 `autoAdjustOverflow` 翻转/移位正确，RTL 镜像。
- [ ] 任意层级嵌套 SubMenu 可展开/收起，激活路径与父级关闭挂起正确。
- [ ] 键盘全交互（漫游/Left-Right 进出子菜单/Home-End/Esc/Enter/typeahead）通过。
- [ ] 焦点管理：click/contextMenu 进入 trap，关闭归还触发元素；hover 不抢焦点。
- [ ] role/aria 符合 APG menu-button，axe 0 violation，对比度 AA。
- [ ] `type="danger"` 危险项视觉与无障碍名独立于颜色传达。
- [ ] `destroyOnClose`/`lazyRender`/`keepDOM` DOM 行为符合预期。
- [ ] 全部用户可见文案走 i18n key，无硬编码；hotkey 按平台渲染。
- [ ] 仅消费 Alias/Component Token，无写死色值/尺寸；暗色模式正确。
- [ ] `component.meta.ts` 完整（props/examples/tokens/a11yPattern）。
- [ ] gzip 体积：core ≤ 4.5KB、svelte ≤ 7.85KB；100+ 项虚拟化达帧预算。
- [ ] `prefers-reduced-motion` 降级，全局 dismiss 监听随 open 挂卸无泄漏。
