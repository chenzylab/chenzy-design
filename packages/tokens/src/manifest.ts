/**
 * DSM token manifest 生成器：从 TS token 源结构化产出 dist/token-manifest.json，
 * 供 DSM 可视化编辑器消费。见 specs/00-foundation/dsm.spec.md §地基1。
 *
 * 相对 docs/scripts/build-tokens-detail.ts（事后正则解析 CSS）的优势：
 * 直接从类型化 TS 源产出，category/label/引用链准确，且带反向依赖图 + 明暗双值。
 */
import { tokenMeta, type TokenCategory, type TokenGroup } from './components/token-def.js';

export interface ManifestToken {
  name: string; // 含 --cd- 前缀
  value: string; // 原始值（保留 var() 引用链）
  resolvedLight: string; // 解析到字面量（light）
  resolvedDark: string; // 解析到字面量（dark）
  category: TokenCategory;
  component: string | null;
  label: string;
  usage: string;
  references: string[]; // 值里引用的 --cd-*（一跳）
  referencedBy: string[]; // 反向：谁引用了我
  editable: boolean;
  scope: 'global' | 'alias' | 'component';
}

const PREFIX = '--cd-';

/** 从值里提取引用的 --cd-* 变量名（可能多个）。 */
function refsOf(value: string): string[] {
  const out: string[] = [];
  const re = /var\((--cd-[a-z0-9-]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value))) {
    if (m[1]) out.push(m[1]);
  }
  return out;
}

/** 按名/值推断分类（TokenDef 未显式给出时兜底）。 */
function inferCategory(name: string, value: string): TokenCategory {
  const n = name.toLowerCase();
  if (/transition|motion|duration|ease|delay|animation/.test(n)) return 'animation';
  if (/radius|rounded/.test(n)) return 'radius';
  if (/font|line-height|weight/.test(n)) return 'font';
  if (/height/.test(n)) return 'height';
  if (/width|thickness/.test(n)) return 'width';
  if (/spacing|padding|margin|gap/.test(n)) return 'spacing';
  if (/color|bg|fill|border|text|shadow/.test(n) || /#|rgb|hsl/.test(value)) return 'color';
  return 'other';
}

const GLOBAL_SEGMENTS = new Set([
  'color', 'spacing', 'radius', 'font', 'shadow', 'motion', 'z', 'breakpoint',
  'line', 'focus', 'border', 'text', 'fill', 'bg', 'primary', 'success', 'warning',
  'danger', 'link', 'control', 'width', 'nav', 'overlay', 'disabled', 'secondary',
  'tertiary', 'info',
]);

// category 段（token 名可能以 <category>-<component>-... 组织，如 color-button-...）。
const CATEGORY_SEGMENTS = new Set([
  'color', 'spacing', 'radius', 'font', 'height', 'width', 'animation',
  'border', 'line', 'shadow', 'motion', 'transform', 'transition', 'z', 'breakpoint',
]);

/**
 * 取组件归属。token 名有两种组织：
 *   --cd-button-height-default        → 首段即组件
 *   --cd-color-button-primary-bg-hover → 首段是 category，第二段是组件
 * 剥掉可能的 category 前缀后取组件段；仍落在全局语义段则视为无组件归属。
 */
function componentOf(name: string): string | null {
  const segs = name.replace(/^--cd-/, '').split('-');
  let seg = segs[0];
  if (seg && CATEGORY_SEGMENTS.has(seg) && segs[1]) seg = segs[1];
  if (!seg) return null;
  return GLOBAL_SEGMENTS.has(seg) ? null : seg;
}

interface RawEntry {
  name: string;
  value: string;
  scope: 'global' | 'alias' | 'component';
  category?: TokenCategory;
  label?: string;
  usage?: string;
  editable?: boolean;
}

export interface BuildManifestInput {
  /** 已展开为 { '--cd-xxx': value } 的 global 层（纯字面量）。 */
  global: Record<string, string>;
  /** alias light / dark（{ '--cd-xxx': value }）。 */
  aliasLight: Record<string, string>;
  aliasDark: Record<string, string>;
  /** component token（含 TokenDef 元数据），key 不含前缀。 */
  component: TokenGroup;
}

export function buildManifest(input: BuildManifestInput): { count: number; tokens: ManifestToken[] } {
  const raw: RawEntry[] = [];

  for (const [name, value] of Object.entries(input.global)) {
    raw.push({ name, value, scope: 'global' });
  }
  for (const [name, value] of Object.entries(input.aliasLight)) {
    raw.push({ name, value, scope: 'alias' });
  }
  for (const [key, def] of Object.entries(input.component)) {
    const meta = tokenMeta(def);
    const entry: RawEntry = { name: `${PREFIX}${key}`, value: meta.value, scope: 'component' };
    if (meta.category !== undefined) entry.category = meta.category;
    if (meta.label !== undefined) entry.label = meta.label;
    if (meta.usage !== undefined) entry.usage = meta.usage;
    if (meta.editable !== undefined) entry.editable = meta.editable;
    raw.push(entry);
  }

  // light/dark 字面量映射：alias dark 覆盖同名 alias light。
  const litLight = new Map<string, string>();
  const litDark = new Map<string, string>();
  for (const e of raw) {
    litLight.set(e.name, e.value);
    litDark.set(e.name, e.value);
  }
  for (const [name, value] of Object.entries(input.aliasDark)) {
    litDark.set(name, value); // dark 只覆盖 alias 层
  }

  // 递归解析 var() 到字面量（防环，最多 10 跳）。
  function resolve(name: string, table: Map<string, string>, depth = 0): string {
    const v = table.get(name);
    if (v === undefined) return `var(${name})`;
    if (depth > 10) return v;
    const refs = refsOf(v);
    if (refs.length === 0) return v;
    let out = v;
    for (const r of refs) {
      const resolved = resolve(r, table, depth + 1);
      out = out.replace(new RegExp(`var\\(${r}(,[^)]*)?\\)`), resolved);
    }
    return out;
  }

  // 反向依赖图。
  const referencedBy = new Map<string, string[]>();
  for (const e of raw) {
    for (const r of refsOf(e.value)) {
      const arr = referencedBy.get(r) ?? [];
      arr.push(e.name);
      referencedBy.set(r, arr);
    }
  }

  const tokens: ManifestToken[] = raw.map((e) => ({
    name: e.name,
    value: e.value,
    resolvedLight: resolve(e.name, litLight),
    resolvedDark: resolve(e.name, litDark),
    category: e.category ?? inferCategory(e.name, e.value),
    component: componentOf(e.name),
    label: e.label ?? '',
    usage: e.usage ?? '',
    references: refsOf(e.value),
    referencedBy: referencedBy.get(e.name) ?? [],
    editable: e.editable ?? e.scope !== 'global', // global 原子默认不直接编辑
    scope: e.scope,
  }));

  tokens.sort((a, b) => a.name.localeCompare(b.name));
  return { count: tokens.length, tokens };
}
