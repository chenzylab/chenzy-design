/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Tabs',
  category: 'navigation',
  description:
    '标签页，在同一区域内组织并切换多组对等内容。支持 line/card 类型、数据驱动 tabList、声明式 TabPane、roving tabindex 键盘导航与可关闭标签。',
  props: [
    { name: 'value', type: 'string|number', default: 'undefined', desc: '受控选中标签 key' },
    { name: 'defaultValue', type: 'string|number', default: '首个标签', desc: '非受控初始 key' },
    { name: 'type', type: "'line'|'card'", default: 'line', desc: '视觉风格' },
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
      name: 'keyboardActivation',
      type: "'auto'|'manual'",
      default: 'auto',
      desc: '方向键聚焦即激活 / 需 Enter/Space 激活',
    },
    { name: 'onChange', type: '(key: string|number) => void', default: 'undefined' },
    { name: 'onTabClose', type: '(key: string|number) => void', default: 'undefined' },
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
    ],
  },
  tokens: ['--cd-tabs-*', '--cd-focus-ring', '--cd-radius-1', '--cd-spacing-*'],
} as const;
