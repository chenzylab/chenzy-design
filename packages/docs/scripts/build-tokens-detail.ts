/**
 * 从 @chenzy-design/tokens 的 dist/tokens.css 解析所有 --cd-* 设计变量，
 * 生成 src/lib/data/tokens-detail.json，供组件详情页「设计变量」表格消费。
 *
 * 每个变量产出 { name, value, category, component, usage }：
 *   - name      变量名（含 --cd- 前缀）
 *   - value     默认值（tokens.css 中 :root 下的原始声明值）
 *   - category  归类（animation/color/font/height/radius/spacing/width/other），对齐 Semi 设计变量分 tab
 *   - component 组件归属（如 dropdown / button；全局/语义层归 null），供按组件过滤
 *   - usage     中文用法说明，由变量名分词推断
 *
 * 运行：pnpm --filter @chenzy-design/docs build:tokens
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// 定位 tokens.css（解析包入口再取同目录 tokens.css，避免硬编码相对路径）
const tokensCssPath = require.resolve('@chenzy-design/tokens/tokens.css');
const css = readFileSync(tokensCssPath, 'utf8');

export type TokenCategory =
  | 'animation'
  | 'color'
  | 'font'
  | 'height'
  | 'radius'
  | 'spacing'
  | 'width'
  | 'other';

export interface TokenDetail {
  name: string;
  value: string;
  category: TokenCategory;
  component: string | null;
  usage: string;
}

/** 已知组件 token 前缀（取自 tokens.css 中的 --cd-<seg> 第一段，排除全局/语义段）。 */
const GLOBAL_SEGMENTS = new Set([
  'color',
  'spacing',
  'radius',
  'font',
  'shadow',
  'motion',
  'z',
  'breakpoint',
  'line',
  'focus',
  'border',
  'text',
  'fill',
  'bg',
  'primary',
  'success',
  'warning',
  'danger',
  'link',
  // foundation 尺寸（PR1 新增全局 token）
  'control',
  'width',
  'nav',
  'overlay',
  'disabled',
  'secondary',
  'tertiary',
  'info',
]);

/** 仅在 :root { ... } 块内解析（排除 [data-theme='dark'] 等覆盖块，避免重复）。 */
function extractRootBlock(source: string): string {
  const start = source.indexOf(':root');
  if (start === -1) return source;
  const braceStart = source.indexOf('{', start);
  let depth = 0;
  for (let i = braceStart; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}') {
      depth--;
      if (depth === 0) return source.slice(braceStart + 1, i);
    }
  }
  return source.slice(braceStart + 1);
}

/** 由变量名各段推断分类。优先级：动画 > 圆角 > 字体 > 高度 > 宽度 > 间距 > 颜色 > 其它。 */
function categorize(name: string, value: string): TokenCategory {
  const n = name.toLowerCase();
  if (/transition|motion|duration|ease|delay|animation/.test(n)) return 'animation';
  if (/radius|rounded/.test(n)) return 'radius';
  if (/font|line-height|letter-spacing|text-size|weight/.test(n)) return 'font';
  if (/height|\bsize\b|-size|min-h|max-h|\bh\b/.test(n)) {
    // size 多为方形尺寸，归 height
    return 'height';
  }
  if (/width|min-w|max-w|\bw\b|thickness|stroke/.test(n)) return 'width';
  if (/spacing|padding|margin|gap|inset|offset/.test(n)) return 'spacing';
  if (/color|bg|fill|border|text|shadow|accent|ring|fg|stroke/.test(n) || /#|rgb|hsl/.test(value))
    return 'color';
  if (/\bz\b|z-index|-z$/.test(n)) return 'other';
  return 'other';
}

/** 取组件归属：--cd-<seg>-... 的 <seg> 若不在全局段集合内，则视为组件名。 */
function componentOf(name: string): string | null {
  const m = name.match(/^--cd-([a-z0-9]+)-/);
  if (!m) return null;
  const seg = m[1];
  if (GLOBAL_SEGMENTS.has(seg)) return null;
  return seg;
}

/** 变量名分词 → 中文用法说明（启发式词典翻译）。 */
const DICT: Record<string, string> = {
  bg: '背景色',
  fg: '前景色',
  color: '颜色',
  text: '文本',
  border: '边框',
  fill: '填充',
  shadow: '阴影',
  radius: '圆角',
  padding: '内边距',
  margin: '外边距',
  gap: '间距',
  size: '尺寸',
  height: '高度',
  width: '宽度',
  min: '最小',
  max: '最大',
  hover: '悬浮态',
  active: '激活态',
  focus: '聚焦态',
  disabled: '禁用态',
  selected: '选中态',
  ring: '焦点环',
  accent: '强调',
  icon: '图标',
  title: '标题',
  desc: '描述',
  header: '头部',
  footer: '底部',
  item: '项',
  default: '默认',
  small: '小尺寸',
  large: '大尺寸',
  primary: '主色',
  success: '成功',
  warning: '警告',
  danger: '危险',
  info: '信息',
  transition: '过渡',
  duration: '时长',
  ease: '缓动',
  delay: '延迟',
  z: '层级',
  dot: '圆点',
  close: '关闭',
  cell: '单元格',
  range: '范围',
  edge: '边缘',
  secondary: '次要',
  x: '水平',
  y: '垂直',
};

function describe(name: string, component: string | null): string {
  let segs = name.replace(/^--cd-/, '').split('-');
  // 用法描述里去掉与组件名重复的首段，避免「dropdown · dropdown背景色」
  if (component && segs[0] === component) segs = segs.slice(1);
  const words = segs.map((s) => DICT[s] ?? s);
  const compLabel = component ? component : '全局';
  return `${compLabel} · ${words.join('') || '基础值'}`;
}

const root = extractRootBlock(css);
const declRe = /(--cd-[a-z0-9-]+)\s*:\s*([^;]+);/g;
const details: TokenDetail[] = [];
const seen = new Set<string>();
let m: RegExpExecArray | null;
while ((m = declRe.exec(root))) {
  const name = m[1].trim();
  const value = m[2].trim();
  if (seen.has(name)) continue;
  seen.add(name);
  const component = componentOf(name);
  details.push({
    name,
    value,
    category: categorize(name, value),
    component,
    usage: describe(name, component),
  });
}

details.sort((a, b) => a.name.localeCompare(b.name));

const outDir = resolve(here, '../src/lib/data');
mkdirSync(outDir, { recursive: true });
const outPath = resolve(outDir, 'tokens-detail.json');
writeFileSync(
  outPath,
  JSON.stringify(
    {
      generated: '由 scripts/build-tokens-detail.ts 生成，请勿手改',
      count: details.length,
      tokens: details,
    },
    null,
    2,
  ),
);
console.log(`[docs] built tokens-detail.json — ${details.length} tokens`);
