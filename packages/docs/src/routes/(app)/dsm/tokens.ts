import manifest from '@chenzy-design/tokens/token-manifest.json';

export interface ManifestToken {
  name: string;
  value: string;
  resolvedLight: string;
  resolvedDark?: string;
  category: string;
  component: string | null;
  label: string;
  usage: string;
  references?: string[];
  referencedBy?: string[];
  editable: boolean;
  scope: string;
}

const all = manifest.tokens as ManifestToken[];

/** alias 层（全局语义色 + 少量 focus ring）——全局 tab 的编辑对象。 */
export const aliasTokens: ManifestToken[] = all.filter((t) => t.scope === 'alias' && t.editable);

// ── 全局层分组规则 ────────────────────────────────────────────────
// 目标：把 alias token 收敛进语义子组，尽量清空「其它」。
// 每条规则用一个谓词匹配无前缀 token 名（如 color-primary-hover）。

export interface AliasGroup {
  key: string;
  title: string;
  items: ManifestToken[];
}

interface GroupRule {
  key: string;
  title: string;
  match: (bare: string) => boolean;
}

const STATUS = ['success', 'warning', 'danger', 'info'];
const BRAND = ['primary', 'secondary', 'tertiary'];

const ALIAS_GROUPS: GroupRule[] = [
  {
    key: 'brand',
    title: '品牌主色',
    // primary/secondary/tertiary 及其 hover/active/disabled/light-* 变体
    match: (b) => BRAND.some((c) => b === `color-${c}` || b.startsWith(`color-${c}-`)),
  },
  {
    key: 'status',
    title: '状态色',
    // success/warning/danger/info 及其 hover/active/disabled/light-* 变体
    match: (b) => STATUS.some((c) => b === `color-${c}` || b.startsWith(`color-${c}-`)),
  },
  {
    key: 'text',
    title: '文本',
    match: (b) => /^color-text(-|$)/.test(b),
  },
  {
    key: 'bg',
    title: '背景',
    match: (b) => /^color-(bg|nav-bg|overlay-bg)(-|$)/.test(b),
  },
  {
    key: 'fill',
    title: '填充',
    match: (b) => /^color-fill(-|$)/.test(b),
  },
  {
    key: 'border-focus',
    title: '边框 / 聚焦',
    match: (b) =>
      /^color-(border|focus|focus-border)(-|$)/.test(b) || b === 'focus-ring',
  },
  {
    key: 'disabled',
    title: '禁用态',
    match: (b) => /^color-disabled(-|$)/.test(b),
  },
  {
    key: 'link',
    title: '链接',
    match: (b) => /^color-link(-|$)/.test(b),
  },
  {
    key: 'highlight',
    title: '高亮',
    match: (b) => /^color-highlight(-|$)/.test(b),
  },
  {
    key: 'misc',
    title: '其它',
    match: () => true, // 兜底
  },
];

function bareName(name: string): string {
  return name.replace(/^--cd-/, '');
}

/** 全局层：alias token 按语义子组分组，空组剔除。 */
export function groupAlias(): AliasGroup[] {
  const buckets = new Map<string, ManifestToken[]>();
  for (const g of ALIAS_GROUPS) buckets.set(g.key, []);

  for (const t of aliasTokens) {
    const bare = bareName(t.name);
    const rule = ALIAS_GROUPS.find((g) => g.match(bare))!;
    buckets.get(rule.key)!.push(t);
  }

  return ALIAS_GROUPS.map((g) => ({
    key: g.key,
    title: g.title,
    items: buckets.get(g.key)!,
  })).filter((g) => g.items.length > 0);
}

// ── 组件层 ────────────────────────────────────────────────────────

// 组件名规整：把 manifest 里因多词前缀而碎裂的段合并到规范组件目录。
// 例：date/picker/time → date-picker；side/sidesheet → side-sheet；
//     scroll/scrolllist → scroll-list；virtual → virtual-list。
const COMPONENT_ALIAS: Record<string, string> = {
  date: 'date-picker',
  picker: 'date-picker',
  time: 'time-picker',
  side: 'side-sheet',
  sidesheet: 'side-sheet',
  scroll: 'scroll-list',
  scrolllist: 'scroll-list',
  virtual: 'virtual-list',
  horizontal: 'grid',
  overflow: 'overflow-list',
};

function normalizeComponent(c: string): string {
  return COMPONENT_ALIAS[c] ?? c;
}

export interface ComponentEntry {
  dir: string;
  count: number;
}

/** 有可编辑 token 的组件清单（已规整合并碎片），按名排序。 */
export const componentList: ComponentEntry[] = (() => {
  const byDir = new Map<string, number>();
  for (const t of all) {
    if (!t.component || !t.editable) continue;
    const dir = normalizeComponent(t.component);
    byDir.set(dir, (byDir.get(dir) ?? 0) + 1);
  }
  return [...byDir.entries()]
    .map(([dir, count]) => ({ dir, count }))
    .sort((a, b) => a.dir.localeCompare(b.dir));
})();

// ── 预览覆写扩散 ──────────────────────────────────────────────────
// 关键：组件 token（如 --cd-color-button-primary-bg-default: var(--cd-color-primary)）
// 声明在 :root 上，其 var() 在 :root 语境解析。ConfigProvider 用 scoped 内联
// style 注入 alias 覆写时，:root 上已解析的组件 token 不会重算——所以「全局改
// color-primary，组件不联动」。
//
// 解决：预览注入时，对每个被改的 token，把「传递引用它的所有 token」也一并注入
// （用它们各自的原始 var() 值），令其在同一 scope 内重新解析，从而级联生效。
// 导出不做扩散——导出 CSS 落到消费方 :root，:root 语境 var() 天然级联。

const byName = new Map<string, ManifestToken>();
for (const t of all) byName.set(t.name, t);

/**
 * 把用户覆写扩展成预览需注入的完整集合：
 * 用户覆写 + 传递引用被改 token 的所有 token（带其原始 var() 值）。
 * 返回 key 为无前缀名，供 ConfigProvider tokens 直接使用。
 */
export function expandOverridesForPreview(
  overrides: Record<string, string>,
): Record<string, string> {
  const result: Record<string, string> = { ...overrides };

  // 被改 token 的全名集合（加回 --cd- 前缀）。
  const changed = new Set(Object.keys(overrides).map((k) => `--cd-${k}`));

  // BFS 遍历 referencedBy 闭包。
  const queue = [...changed];
  const visited = new Set<string>(changed);
  while (queue.length) {
    const cur = queue.shift()!;
    const tok = byName.get(cur);
    if (!tok?.referencedBy) continue;
    for (const dep of tok.referencedBy) {
      if (visited.has(dep)) continue;
      visited.add(dep);
      queue.push(dep);
      const depTok = byName.get(dep);
      if (!depTok) continue;
      const key = bareName(dep);
      // 已被用户显式覆写的不动；否则用其原始 var() 值重注入。
      if (!(key in result)) result[key] = depTok.value;
    }
  }

  return result;
}

export interface TokenCatGroup {
  cat: string;
  items: ManifestToken[];
}

const CAT_ORDER = [
  'color',
  'font',
  'height',
  'width',
  'spacing',
  'radius',
  'animation',
  'other',
] as const;

/** 某组件的可编辑 token，按 category 分组（空组剔除），分类按固定顺序。 */
export function componentTokens(dir: string): TokenCatGroup[] {
  const items = all.filter(
    (t) => t.editable && t.component && normalizeComponent(t.component) === dir,
  );
  return CAT_ORDER.map((cat) => ({
    cat,
    items: items
      .filter((t) => t.category === cat)
      .sort((a, b) => a.name.localeCompare(b.name)),
  })).filter((g) => g.items.length > 0);
}
