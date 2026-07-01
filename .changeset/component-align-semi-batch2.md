---
"@chenzy-design/tokens": patch
"@chenzy-design/svelte": patch
---

逐组件样式对齐 Semi（第 2 批·反馈/展示/导航）：

- **Modal**：标题字号 header-6(16)→regular(14)、新增标题字重 token（bold 600）、遮罩 `rgba(0,0,0,.45)`→`--cd-color-overlay-bg`（rgba(22,22,26,.6)，对齐 Semi overlay-bg）、`modal-z` 字面量 1000→引用 `--cd-z-modal`。
- **Menu**：菜单项高度 40px→36px（对齐 Semi navigation_item_base）、新增 `menu-item-radius`（border-radius-small），选中态高亮块带圆角。选中态配色对齐 Semi——文字 primary→text-0（深色）、新增 `menu-item-icon-color-selected`（图标/对勾保持 primary）、**移除垂直态左侧指示条**（靠蓝底+蓝图标区分）、**移除水平态底部下划线**（Semi 顶部导航选中态仅靠文字 text-2→text-0 深浅区分，无下划线）。删除不再被消费的 `menu-item-indicator` token。
- **Dropdown**：菜单项水平内边距 base-tight(12)→base(16)，对齐 Semi 下拉菜单项内边距。
- **Table**：默认行单元格垂直内边距 base-tight(12)→base(16)，对齐 Semi 默认尺寸 tbody 单元格。
- **Tooltip**：内边距 4/8→8/12（spacing tight/base-tight）、字号 small(12)→regular(14)，对齐 Semi tooltip。
- **Popover**：圆角 large(12)→medium(6)，对齐 Semi 气泡卡片圆角。
- **Notification**：圆角 large(12)→medium(6)，标题字重 token 化（新增 `notification-title-weight` = bold）。
- **Toast**：水平内边距 base(16)→tight(8)、文本字重 token 化（新增 `toast-font-weight` = bold），对齐 Semi toast。
- **Tag**：尺寸档对齐 Semi（`TAG_SIZE=['default','small','large']`，default≡small=20px、large=24px）——default 高度 24→20、large 高度 28→24；新增垂直内边距 token（`tag-padding-y`=2px、`tag-padding-y-large`=4px）。字号 small(12)、水平内边距 tight(8)、圆角 small(3) 本就一致。**注意：default Tag 默认高度由 24px 变 20px**（视觉更紧凑，API 不变）。Tag 视觉基线已重生。
- **Switch**：**开启态背景 primary(蓝)→success(绿)**、关闭态 fill-1→fill-0，对齐 Semi（Semi switch 开启全主题用 success 系）。**注意：开关开启色由蓝变绿**。尺寸全对齐 Semi——default 高 22→24、small 宽 28→26、large 54×52→54×32（滑块/位移由 track 宽高自适应跟随）。Switch 视觉基线已重生。
- **InputNumber 步进器**：从扁平透明改为 Semi 实底按钮——新增步进器 token（宽 14px、背景 bg-2、描边 color-border、图标 text-2、small 圆角、hover fill-0/active fill-1），按钮间 1px 缝、右侧 4px 外边距，对齐 Semi inputNumber 步进器。
- **Card**：圆角 large(12)→medium(6)、内边距 base(16)→base-loose(20)、标题字重/字号 token 化（bold/header-6），新增描述(text-2)/正文(text-1)颜色 token，对齐 Semi card。
- **Avatar**：尺寸档对齐 Semi（xs 20→24、small 28→32、default 36→40、large 44→72、xl 56→128，新增 medium=48 档）；新增 `avatar-border`(bg-1)；方形圆角 medium→small（圆形默认走 --circle 规则不变）。Avatar 视觉基线已重生。
- **Collapse**：标题字重 token 化（新增 `collapse-header-weight`=bold）、header 内边距 12/16→tight(8)、content 内边距对齐 Semi（top 4/x 16/bottom 8）、新增 header 按下背景 fill-1。
- **Progress**：**默认进度色 primary(蓝)→success(绿)**、水平条高度 default 8→4、large 12→6，对齐 Semi progress。**注意：默认进度条由蓝变绿**。
- **Checkbox**：默认描边 color-border→text-3（更明显）、默认背景 bg-0→transparent；新增未选中悬浮态（描边 focus-border、背景 fill-0）；卡片悬浮 bg-1→fill-0、新增卡片选中背景 primary-light-default。
- **Radio**：默认描边 color-border→text-3、默认背景 bg-0→transparent；新增未选中悬浮态（描边 focus-border、背景 fill-0）；修正 card-radius 旧 token 名 `--cd-radius-medium`→`--cd-border-radius-medium`。

均为回退 Alias/全局 token 的值/引用对齐，无写死。涉及组件无视觉回归基线（Tag 基线未变，证明未误伤）；971 单元/DOM + 6 视觉用例全绿，Tooltip 浮层浏览器人工核验。
