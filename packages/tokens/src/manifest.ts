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

/**
 * 变量名分词 → 中文用法说明的兜底词典。
 * 仅在 token 未显式提供 usage/label 时使用（TokenDef 元数据优先）。
 * 相比 docs 旧 build-tokens-detail.ts 的词典大幅扩充，消除大面积英文词根拼接。
 */
const DICT: Record<string, string> = {
  // 属性
  bg: '背景色', fg: '前景色', color: '颜色', text: '文字', border: '边框',
  fill: '填充', shadow: '阴影', radius: '圆角', outline: '轮廓',
  padding: '内边距', margin: '外边距', gap: '间距', spacing: '间距',
  size: '尺寸', height: '高度', width: '宽度', thickness: '粗细',
  font: '字体', weight: '字重', line: '行', lineheight: '行高',
  paddingleft: '左内边距', paddingright: '右内边距',
  paddingtop: '上内边距', paddingbottom: '下内边距',
  marginleft: '左外边距', marginright: '右外边距',
  // 状态
  hover: '悬浮态', active: '按下态', focus: '聚焦态', disabled: '禁用态',
  selected: '选中态', checked: '勾选态', default: '默认', visited: '已访问',
  // 尺寸档
  small: '小尺寸', large: '大尺寸', mini: '迷你', regular: '常规',
  min: '最小', max: '最大', base: '基础', tight: '紧凑', loose: '宽松',
  extra: '特', super: '超', mid: '中', fast: '快', slow: '慢',
  // 语义色
  primary: '主要', secondary: '次要', tertiary: '第三', success: '成功',
  warning: '警告', danger: '危险', info: '信息', link: '链接',
  inverse: '反相', header: '标题', overlay: '遮罩', mask: '蒙层',
  // 部件
  icon: '图标', title: '标题', desc: '描述', footer: '底部', item: '项',
  dot: '圆点', close: '关闭', cell: '单元格', range: '范围', edge: '边缘',
  divider: '分割线', handle: '手柄', track: '轨道', thumb: '滑块',
  bar: '条', arrow: '箭头', panel: '面板', popup: '浮层', trigger: '触发器',
  placeholder: '占位符', count: '计数', group: '组', wrap: '容器',
  content: '内容', label: '标签', input: '输入', control: '控件',
  indicator: '指示器', separator: '分隔符', scrollbar: '滚动条',
  // 主题/模式
  solid: '实心', light: '浅色', borderless: '无边框', colorful: '多彩',
  iconOnly: '纯图标', icononly: '纯图标', split: '分裂',
  // 动效
  transition: '过渡', duration: '时长', ease: '缓动', delay: '延迟',
  motion: '动效', animation: '动画', loading: '加载', spin: '旋转',
  transform: '变换', scale: '缩放',
  // 色板/断点
  blue: '蓝', green: '绿', grey: '灰', red: '红', orange: '橙', yellow: '黄',
  breakpoint: '断点', sm: '小屏', md: '中屏', lg: '大屏', xl: '特大屏', xxl: '超大屏',
  // 其它
  z: '层级', x: '水平', y: '垂直', elevated: '悬浮', standard: '标准',
  first: '首个', last: '末尾', topleft: '左上', topright: '右上',
  bottomleft: '左下', bottomright: '右下', customicon: '自定义图标',
  splitbuttongroup: '分裂按钮组',
};

/** 无显式 usage 时按名分词推断中文说明。 */
function describe(name: string, component: string | null): string {
  let segs = name.replace(/^--cd-/, '').split('-');
  // 去掉与组件名重复的段，避免「button · button背景色」
  if (component) segs = segs.filter((s) => s !== component);
  const words = segs.map((s) => DICT[s] ?? s).join('');
  return `${component ?? '全局'} · ${words || '基础值'}`;
}

const GLOBAL_SEGMENTS = new Set([
  'color', 'spacing', 'radius', 'font', 'shadow', 'motion', 'z', 'breakpoint',
  'line', 'focus', 'border', 'text', 'fill', 'bg', 'primary', 'success', 'warning',
  'danger', 'link', 'control', 'width', 'nav', 'overlay', 'disabled', 'secondary',
  'tertiary', 'info',
  // 色板（--cd-color-<hue>-N 剥掉 color 后的第二段）
  'blue', 'green', 'grey', 'red', 'orange', 'yellow',
  'amber', 'cyan', 'indigo', 'lime', 'pink', 'purple', 'teal', 'violet',
  // 复合色系（--cd-color-light-blue-N / --cd-color-light-green-N 剥 color 后首段是 light）
  'light',
  // 全局间距刻度（--cd-space-loose / --cd-space-medium 等）
  'space',
  // z-index 阶名（--cd-z-sticky / --cd-z-affix / --cd-z-drag，均非组件；
  // 组件名的 z 阶如 --cd-z-modal 归各自组件，故此处只列无同名组件的阶）
  'sticky', 'affix', 'drag',
  // scale 修饰词（--cd-spacing-base-tight / --cd-font-size-* / --cd-shadow-elevated 等的第二段）
  'base', 'tight', 'loose', 'extra', 'super', 'none', 'elevated', 'thickness',
  'size', 'height', 'weight', 'duration', 'ease', 'delay',
  // motion 档位/缓动名（--cd-motion-duration-fast / --cd-motion-ease-standard /
  // --cd-motion-ease-in 循环剥后的段）
  'fast', 'slow', 'mid', 'standard', 'spring', 'linear', 'in', 'out', 'rotate',
  // 尺寸/形状档位（--cd-border-radius-small / --cd-line-height-header-N 循环剥后的段）
  'small', 'large', 'medium', 'regular', 'circle', 'full', 'header',
  // 断点名（--cd-breakpoint-* 剥掉 breakpoint 后）
  'sm', 'md', 'lg', 'xl', 'xxl',
]);

// category 段（token 名可能以 <category>-<component>-... 组织，如 color-button-...）。
const CATEGORY_SEGMENTS = new Set([
  'color', 'spacing', 'radius', 'font', 'height', 'width', 'animation',
  'border', 'line', 'shadow', 'motion', 'transform', 'transition', 'z', 'breakpoint',
  // opacity 作 category（--cd-opacity-spin-children 对齐 Semi $opacity-spin_children）
  'opacity',
]);

// category 之后还可能跟的修饰段（--cd-animation-duration-button-* 的 duration、
// --cd-transform-scale-button-* 的 scale）。
const CATEGORY_MODIFIERS = new Set(['duration', 'delay', 'ease', 'function', 'scale']);

// 多段组件名（连字符组件名）。剥掉 category 前缀后，优先在剩余段开头做最长匹配，
// 命中则整体作为组件归属，避免 --cd-color-date-picker-* 被误判成组件 `date`。
// 注意 scroll-list / scrolllist、side-sheet / sidesheet 是同组件的两套并存命名，
// 归一到连字符形态（scroll-list / side-sheet）统一归属。
const MULTI_SEGMENT_COMPONENTS: string[][] = [
  ['date', 'picker'],
  ['time', 'picker'],
  ['color', 'picker'],
  ['scroll', 'list'],
  ['side', 'sheet'],
  ['overflow', 'list'],
  ['virtual', 'list'],
  ['code', 'highlight'],
  ['video', 'player'],
  ['audio', 'player'],
  ['json', 'viewer'],
  // tag-input 与 tag 是两个不同组件；不含此项则 --cd-tag-input-* 首段 tag 会误归给 Tag。
  ['tag', 'input'],
];
// 无连字符别名 → 规范组件名（同组件的另一套命名收归同一归属）。
const COMPONENT_ALIASES: Record<string, string> = {
  scrolllist: 'scroll-list',
  sidesheet: 'side-sheet',
};

/**
 * 取组件归属。token 名可能的组织：
 *   --cd-button-colorful-from                    → 首段即组件
 *   --cd-color-button-primary-bg-hover          → category + 组件
 *   --cd-animation-duration-button-icon-loading → category + 修饰段 + 组件
 * 循环剥掉 category/修饰前缀后取组件段；落在全局语义段或纯数字则视为无组件归属。
 */
function componentOf(name: string): string | null {
  const segs = name.replace(/^--cd-/, '').split('-');
  // 剥 category/修饰前缀。每剥一步前先尝试多段组件名匹配——因为组件名首段
  // 可能与 category 同名（如 color-picker 的 color 也是 category），贪婪剥壳
  // 会把组件名的 color 当 category 剥掉，故须在剥之前就地探测。
  let i = 0;
  const tryMulti = (from: number): string | null => {
    for (const parts of MULTI_SEGMENT_COMPONENTS) {
      if (parts.every((p, k) => segs[from + k] === p)) return parts.join('-');
    }
    return null;
  };
  while (i < segs.length - 1 && (CATEGORY_SEGMENTS.has(segs[i]!) || CATEGORY_MODIFIERS.has(segs[i]!))) {
    // 当前位置起若已是完整多段组件名（如 rest=[color,picker,...]），停止剥壳并归属。
    const hit = tryMulti(i);
    if (hit) return hit;
    i++;
  }
  const hit = tryMulti(i);
  if (hit) return hit;
  const seg = segs[i];
  if (!seg) return null;
  if (/^\d+$/.test(seg)) return null; // 纯数字段（如 z 阶、断点值）非组件
  if (GLOBAL_SEGMENTS.has(seg)) return null;
  return COMPONENT_ALIASES[seg] ?? seg; // 无连字符别名收归规范组件名
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

  const tokens: ManifestToken[] = raw.map((e) => {
    const component = componentOf(e.name);
    return {
      name: e.name,
      value: e.value,
      resolvedLight: resolve(e.name, litLight),
      resolvedDark: resolve(e.name, litDark),
      category: e.category ?? inferCategory(e.name, e.value),
      component,
      label: e.label ?? '',
      // TokenDef 显式 usage 优先；缺省时按名分词推断中文说明（兜底）。
      usage: e.usage ?? describe(e.name, component),
      references: refsOf(e.value),
      referencedBy: referencedBy.get(e.name) ?? [],
      editable: e.editable ?? e.scope !== 'global', // global 原子默认不直接编辑
      scope: e.scope,
    };
  });

  tokens.sort((a, b) => a.name.localeCompare(b.name));
  return { count: tokens.length, tokens };
}
