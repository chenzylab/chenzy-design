/**
 * Machine-readable component metadata for AI/docs consumption.
 * SideBar — see specs/components/show/SideBar.spec.md
 *
 * 分阶段交付：本 meta 覆盖已落地的 P0（SideBarContainer 可伸缩浮层壳）+ P1（SideBar 主壳
 * mode 路由 + Options 图标 tab 组）。P2 Annotation / P3 MCPConfigure / P4 CodeContent /
 * P5 FileContent 后续阶段接续，届时补齐对应 subComponents。
 */
export const meta = {
  name: 'SideBar',
  category: 'show',
  stage: 'M4',
  semiEquivalent: 'Sidebar',
  aiScene: true,
  description:
    'AI 侧边信息栏套件（重量级组合，分阶段交付）：P0 SideBarContainer 为可伸缩浮层壳——贴视口右侧（RTL 贴左），role=dialog + aria-labelledby(title)，打开移焦 + focus-trap 焦点捕获/归还 + Esc 关闭，堆叠 z-index 与 Modal/SideSheet 统一层栈（后开者在上），resizable 时左边缘（RTL 右边缘）把手拖拽调宽——复用 core createResizeDrag（axis:x 单轴 + clamp minWidth/maxWidth）与 Resizable 同套把手 a11y（role=separator + aria-orientation=vertical + aria-valuenow + 键盘 ←→/Home/End），motion 展开/收起为 CSS transition（reduced-motion / motion=false 退化即时显隐）。P1 SideBar 主壳按 mode 路由：main 渲染顶部 Options 图标 tab 组（role=tablist + roving tabindex + 键盘，name 作无障碍名）+ renderMainContent(activeKey)；detail（code/file/自定义）渲染 renderDetailHeader + 返回按钮（onBackWard 可异步，await 期间禁用防重触发）+ renderDetailContent(mode)。受控 visible / activeKey（不回写，仅回调通知）。P2~P5（Annotation/MCPConfigure/CodeContent/FileContent）后续阶段接续。',
  exports: ['SideBar', 'SideBarContainer'],
  a11yPattern: 'dialog + tablist',
  apgRef: 'dialog (modal) + tabs',
  relatedComponents: ['SideSheet', 'Resizable', 'Nav', 'Tabs'],
  stages: [
    { phase: 'P0', name: 'Container', done: true, desc: '可伸缩浮层壳（resizable 复用 Resizable + 动画 + header/close + Esc + a11y）' },
    { phase: 'P1', name: '主壳 + Options', done: true, desc: 'SideBar 主组件 mode 路由（main/detail）+ 顶部 Options 图标 tab 组' },
    { phase: 'P2', name: 'Annotation', done: false, desc: '参考来源/引用溯源折叠列表' },
    { phase: 'P3', name: 'MCPConfigure', done: false, desc: 'MCP 工具配置面板' },
    { phase: 'P4', name: 'CodeContent', done: false, desc: '代码/JSON 预览列表' },
    { phase: 'P5', name: 'FileContent', done: false, desc: '富文本查看/编辑列表（tiptap）' },
  ],
  usageHints:
    '用于 AI 产品右侧信息/配置面板（工具配置、引用溯源、内容预览）。仅需可伸缩浮层用 SideBarContainer；通用抽屉用 SideSheet；侧边导航用 Nav。Container 与主壳分层解耦——SideBarContainer 提供浮层壳，SideBar 提供 mode 路由内容，通常内嵌 <SideBarContainer><SideBar/></SideBarContainer>。',
  subComponents: [
    {
      name: 'SideBar',
      props: [
        { name: 'mode', type: "'main' | 'code' | 'file' | string", default: "'main'", desc: '展示模式，main 主视图，其余详情视图' },
        { name: 'activeKey', type: 'string', default: 'undefined', desc: '主视图激活 option（受控，不回写）' },
        { name: 'options', type: 'SideBarOption[]', default: '[]', desc: '顶部图标 tab 组（{ icon, name, key }）' },
        { name: 'onActiveOptionChange', type: '(e: Event, key: string) => void', default: 'undefined', desc: 'option 切换回调' },
        { name: 'renderMainContent', type: 'Snippet<[string | undefined]>', default: 'undefined', desc: '主视图内容（按 activeKey 渲染）' },
        { name: 'renderDetailContent', type: 'Snippet<[mode]>', default: 'undefined', desc: '详情内容（按 mode 渲染）' },
        { name: 'renderDetailHeader', type: 'Snippet<[mode]>', default: 'undefined', desc: '详情头部（返回按钮之后）' },
        { name: 'onBackWard', type: '(e: Event, mode) => void | Promise<void>', default: 'undefined', desc: '详情返回主视图（可异步，await 期间禁用防重触发）' },
        { name: 'class', type: 'string', default: 'undefined', desc: '根自定义类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '根自定义内联样式' },
      ],
    },
    {
      name: 'SideBarContainer',
      props: [
        { name: 'visible', type: 'boolean', default: 'false', desc: '是否可见（受控，不回写；仅经 onCancel 通知）' },
        { name: 'title', type: 'string | Snippet', default: 'undefined', desc: '标题' },
        { name: 'onCancel', type: '(e: Event) => void', default: 'undefined', desc: '关闭回调（Esc / 关闭按钮）' },
        { name: 'afterVisibleChange', type: '(v: boolean) => void', default: 'undefined', desc: '动画结束后（入场或出场）触发' },
        { name: 'motion', type: 'boolean', default: 'true', desc: '展开/收起动画；false 等价即时显隐' },
        { name: 'resizable', type: 'boolean', default: 'true', desc: '宽度可拖拽（复用 Resizable 把手 + 键盘 a11y）' },
        { name: 'minWidth', type: 'string | number', default: '150', desc: '最小宽度' },
        { name: 'maxWidth', type: 'string | number', default: 'undefined', desc: '最大宽度' },
        { name: 'defaultSize', type: '{ width?; height? }', default: 'undefined', desc: '默认尺寸（当前消费 width）' },
        { name: 'showClose', type: 'boolean', default: 'true', desc: '显示关闭按钮' },
        { name: 'renderHeader', type: 'Snippet', default: 'undefined', desc: '自定义头部（覆盖 title + 关闭按钮）' },
        { name: 'class', type: 'string', default: 'undefined', desc: '面板自定义类名' },
        { name: 'style', type: 'string', default: 'undefined', desc: '面板自定义内联样式' },
      ],
    },
  ],
  tokens: [
    '--cd-sidebar-bg',
    '--cd-sidebar-color',
    '--cd-sidebar-border',
    '--cd-sidebar-shadow',
    '--cd-sidebar-radius',
    '--cd-sidebar-width',
    '--cd-sidebar-z',
    '--cd-sidebar-motion-duration',
    '--cd-sidebar-header-padding',
    '--cd-sidebar-title-color',
    '--cd-sidebar-title-size',
    '--cd-sidebar-title-weight',
    '--cd-sidebar-close-color',
    '--cd-sidebar-close-hover-bg',
    '--cd-sidebar-close-radius',
    '--cd-sidebar-body-padding',
    '--cd-sidebar-options-gap',
    '--cd-sidebar-options-padding',
    '--cd-sidebar-option-size',
    '--cd-sidebar-option-radius',
    '--cd-sidebar-option-color',
    '--cd-sidebar-option-color-hover',
    '--cd-sidebar-option-bg-hover',
    '--cd-sidebar-option-color-active',
    '--cd-sidebar-option-bg-active',
    '--cd-sidebar-back-color',
    '--cd-sidebar-back-hover-bg',
  ],
} as const;
