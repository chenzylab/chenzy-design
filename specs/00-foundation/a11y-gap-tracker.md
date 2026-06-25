# a11y 缺口追踪（收口维度）

> spec §4 Props/Events 已全部补齐后，对各组件 spec a11y 章节做的系统核查清单。
> 约 122 处缺口，按「跨组件根因」+「逐组件」组织。已修的划掉。
>
> **状态（2026-06-25）：清单全部消解。** 4 个根因 + 全部逐组件高/中缺口已实现（PR #235–238 + Table Grid Pattern）。
> 仅「待人工/运行时复核」章节（对比度/焦点环/reduced-motion/RTL token 层）需在 Playwright+axe 套件落地后核验。

## 跨组件根因（修一处消解多组件）

- [x] **根因#1 useLiveAnnouncer 原语**（core 缺失）— #224 已建 core/live-announcer.ts + 接入 Table/Pagination/Rating/Switch/Typography；后续补齐 Toast 极性、Notification 类型前缀、Upload 进度、Slider/InputNumber 越界、Calendar、List、Carousel、Image 播报。**全部接入完成。**
- [x] **根因#2 roving.ts 接入**（已有原语，组件未用）— #226 已接 Anchor/Pagination；#231 接 Collapse/List/Steps。**剩余**：Menu(vertical/inline)、TimePicker、TagInput。
- [x] **根因#3 DatePicker/Calendar 网格键盘**（#230）— DatePicker/RangePicker role=grid/row + aria-activedescendant + Home/End/PageUp/Shift+PageUp + Esc 归还焦点；Calendar 切年、事件块 role=button。
- [x] **根因#4 i18n 可访问名硬编码中文**（#228）— OverflowList `+N`、Tag close、AvatarGroup `+N`、Avatar `+N`、Carousel、ColorPicker、Tabs 走 locale。

## 已修的高缺口
- [x] Tooltip 所有触发模式 Esc 可关闭（#225）
- [x] Popover hover/focus role=tooltip + aria-describedby（#225）
- [x] Tabs tab/panel id 双向关联（#225）
- [x] Form 必填 aria-required（#225）

## 剩余逐组件高缺口（键盘体系/role 缺失，高严重度）
- [x] Transfer — 双列 listbox/option role + 全键盘（↑↓/Home/End/Space/Shift 范围/Enter 移动）+ 移动后焦点保留
- [x] Table — Grid Pattern：role=grid/row/gridcell/columnheader + 二维方向键漫游 + roving + 虚拟化焦点回收 + F2/Enter 交互模式（产品已确认实现；纯展示表自动降级 role=table）
- [x] Cascader — 列内方向键 roving + Home/End + aria-activedescendant（#229）
- [x] TreeSelect — 浮层方向键/Home/End roving + aria-activedescendant（#229）
- [x] Select — Home/End 跳首末
- [x] Tree — `*` 展开同级 + typeahead
- [x] ColorPicker — 打开聚焦/关闭归还 + focus trap + 滑块 Home/End + 预设 listbox 方向键
- [x] TimePicker — 列内 ↑↓/Home/End + roving + 打开聚焦当前列
- [x] Radio — Home/End + button/card 型 role=radio + RTL 镜像
- [x] Menu — vertical/inline roving + 方向键/Home/End/typeahead/Esc
- [x] Steps — 视觉隐藏状态文本（WCAG 1.4.1）+ clickable/nav roving（#231）
- [x] Carousel — 键盘 ←→/Home/End/Enter + 非 active slide inert + play/pause 按钮（WCAG 2.2.2）
- [x] Breadcrumb — 折叠触发器 disclosure ARIA + 浮层 menu 角色
- [x] Collapse — Header role=heading + aria-level（#231 已实现）
- [x] Image — 预览灯箱 focus trap + 关闭归还焦点
- [x] Avatar — 可交互头像 a/button role + 键盘
- [x] List — selectable 方向键 + roving（#231）
- [x] OverflowList — scroll 模式滚动锚点键盘可达

## 剩余中严重度（单个 aria，逐组）
- [x] Modal/Drawer/SideSheet 背景兄弟 inert/aria-hidden（新建 core inert-background.ts 原语）
- [x] Dropdown 菜单 aria-labelledby
- [x] Switch/Slider/Radio/CheckboxGroup group 容器 aria-labelledby（非仅 label）
- [x] Slider 双滑块 valuemin/max 钳为对方值 + 键盘 RTL/vertical 翻转
- [x] Radio/Rating 方向键 RTL 镜像；Rating 数字键定位
- [x] InputNumber aria-valuetext
- [x] Badge status role=status；Tag close aria-label 含文本；Card loading aria-busy
- [x] Image 装饰图 role=presentation + loading aria-busy；Tabs 纵向 aria-orientation
- [x] Anchor aria-current="location"；Collapse disabled aria-disabled
- [x] Popconfirm loading 播报

## 待人工/运行时复核（未计入）
- 对比度 ≥4.5:1 / 焦点环 ≥3:1 / prefers-reduced-motion / RTL 镜像（token/CSS 层）
- Drawer/SideSheet 嵌套仅顶层响应 Esc
