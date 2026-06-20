/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Tabs',
  category: 'navigation',
  description:
    '标签页，在同一区域内组织并切换多组对等内容。支持 line/card/button 类型、数据驱动 tabList、声明式 TabPane、roving tabindex 键盘导航、可关闭标签与溢出滚动/下拉收纳（overflow）。',
  props: [
    { name: 'value', type: 'string|number', default: 'undefined', desc: '受控选中标签 key' },
    { name: 'defaultValue', type: 'string|number', default: '首个标签', desc: '非受控初始 key' },
    { name: 'type', type: "'line'|'card'|'button'", default: 'line', desc: '视觉风格（button=分段按钮组）' },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    {
      name: 'tabPosition',
      type: "'top'|'bottom'|'left'|'right'",
      default: 'top',
      desc: '标签栏位置',
    },
    { name: 'lazy', type: 'boolean', default: 'false', desc: '首次激活后才挂载面板' },
    { name: 'keepDOM', type: 'boolean', default: 'false', desc: '激活过的面板保留 DOM' },
    { name: 'tabList', type: 'TabItem[]', default: '[]', desc: '数据驱动标签定义' },
    { name: 'closable', type: 'boolean', default: 'false', desc: '全局可关闭（单项可覆盖）' },
    {
      name: 'addable',
      type: 'boolean',
      default: 'false',
      desc: '标签栏末尾显示「+」按钮，点击触发 onAdd（受控，由父组件追加）',
    },
    {
      name: 'keyboardActivation',
      type: "'auto'|'manual'",
      default: 'auto',
      desc: '方向键聚焦即激活 / 需 Enter/Space 激活',
    },
    {
      name: 'overflow',
      type: "'scroll'|'dropdown'",
      default: 'scroll',
      desc: '横向溢出处理：scroll 前/后滚动箭头；dropdown 收纳进末尾「更多」下拉（仅 top/bottom 生效，纵向始终滚动）',
    },
    { name: 'onChange', type: '(key: string|number) => void', default: 'undefined' },
    { name: 'onTabClose', type: '(key: string|number) => void', default: 'undefined' },
    {
      name: 'onAdd',
      type: '() => void',
      default: 'undefined',
      desc: 'addable=true 时点击「+」按钮回调（受控数据，组件内不改 tabList）',
    },
    { name: 'children', type: 'Snippet', default: 'undefined', desc: '声明式 TabPane 内容' },
  ],
  a11y: {
    role: 'tablist',
    keyboard: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', 'Space'],
    notes: [
      'tablist 内每个标签为 role=tab，aria-selected 标记激活，aria-controls 关联面板',
      'roving tabindex：仅激活标签 tabindex=0，其余 -1',
      'keyboardActivation=auto 聚焦即激活，manual 需 Enter/Space 确认',
      '面板 role=tabpanel；关闭叉为带 aria-label 的原生 button',
      '标签溢出时出现前/后滚动箭头（带 aria-label，tabindex=-1 不入 Tab 序），激活标签自动滚到可视区',
      'overflow=dropdown 时溢出标签收进末尾「更多」下拉（aria-haspopup=menu，带 aria-label），激活标签始终保持可见',
      'addable 的「+」为带 aria-label 的原生 button',
    ],
  },
  tokens: ['--cd-tabs-*', '--cd-focus-ring', '--cd-radius-1', '--cd-spacing-*'],
} as const;
