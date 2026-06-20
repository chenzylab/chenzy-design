/**
 * Machine-readable component metadata for AI/docs consumption.
 * See specs/00-foundation/ai-friendly.spec.md.
 */
export const meta = {
  name: 'Transfer',
  category: 'input',
  description: '穿梭框，双栏列表间移动条目，支持多选、移动按钮、本地搜索过滤、分组（groupList）、树状源面板（treeList）与单向迁移（oneWay）。',
  props: [
    { name: 'value', type: '(string|number)[]', default: 'undefined', desc: '受控已选 key 数组；提供则为受控' },
    { name: 'defaultValue', type: '(string|number)[]', default: '[]', desc: '非受控初始已选 key' },
    { name: 'dataSource', type: 'TransferItem[] | TransferGroup[] | TransferTreeNode[]', default: '[]', desc: '平铺条目（key/label/disabled/group）、分组结构 {title, items}[]，或树结构 {key,label,children}[]（treeList）；树模式下源面板按树渲染，仅叶子可迁移到平铺目标面板，已迁移叶子在源树置灰' },
    { name: 'filter', type: 'boolean', default: 'true', desc: '是否显示本地搜索框' },
    { name: 'searchPlaceholder', type: 'string', default: "'搜索'" },
    { name: 'size', type: "'small'|'default'|'large'", default: 'default' },
    { name: 'status', type: "'default'|'warning'|'error'", default: 'default' },
    { name: 'disabled', type: 'boolean', default: 'false' },
    { name: 'showPanelTitle', type: 'boolean', default: 'true', desc: '是否显示面板标题与计数' },
    { name: 'titles', type: '[string, string]', default: "['源', '已选']" },
    { name: 'oneWay', type: 'boolean', default: 'false', desc: '单向迁移：仅左→右；目标项各带「移除」按钮移回左侧，不显示右→左批量按钮' },
    { name: 'onChange', type: '(targetKeys: (string|number)[]) => void', default: 'undefined' },
  ],
  a11y: {
    role: 'group',
    notes: ['容器 role=group', '列表项复用 Checkbox（已带 a11y）', '移动按钮有 aria-label'],
  },
  tokens: ['--cd-transfer-*', '--cd-focus-ring', '--cd-color-*', '--cd-spacing-*'],
} as const;
