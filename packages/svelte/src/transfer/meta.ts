/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Transfer',
  category: 'input',
  description: '穿梭框，双栏列表间移动条目，支持多选、移动按钮、本地搜索过滤与分组（groupList）源/目标面板。',
  props: [
    { name: 'value', type: '(string|number)[]', default: 'undefined', desc: '受控已选 key 数组；提供则为受控' },
    { name: 'defaultValue', type: '(string|number)[]', default: '[]', desc: '非受控初始已选 key' },
    { name: 'dataSource', type: 'TransferItem[] | TransferGroup[]', default: '[]', desc: '平铺条目（key/label/disabled/group）或分组结构 {title, items}[]；分组时面板按组渲染组标题+组内项' },
    { name: 'filter', type: 'boolean', default: 'true', desc: '是否显示本地搜索框' },
    { name: 'searchPlaceholder', type: 'string', default: "'搜索'" },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'showPanelTitle', type: 'boolean', default: 'true', desc: '是否显示面板标题与计数' },
    { name: 'titles', type: '[string, string]', default: "['源', '已选']" },
    { name: 'onChange', type: '(targetKeys: (string|number)[]) => void', default: 'undefined' },
  ],
  a11y: {
    role: 'group',
    notes: ['容器 role=group', '列表项复用 Checkbox（已带 a11y）', '移动按钮有 aria-label'],
  },
  tokens: ['--cd-transfer-*', '--cd-focus-ring', '--cd-color-*', '--cd-spacing-*'],
} as const;
