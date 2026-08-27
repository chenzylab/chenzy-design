/**
 * Distill the docs-site component markdown into self-contained plain markdown
 * (Semi `content/` style) and emit it to `dist/content/components/<name>.md`,
 * so the published npm package carries AI-consumable docs that
 * `@chenzy-design/mcp` fetches at runtime from unpkg/npmmirror.
 *
 * Sources (read-only, monorepo-relative):
 *   - packages/docs/src/content/components/<name>.md   (authored pages, all
 *     inline form — <script> imports demo components + ?raw source)
 *   - packages/docs/src/demos/<dir>/                   (demo .svelte files)
 *   - dist/components.json                             (fallback for
 *     components without an authored md — build:meta must run first)
 *
 * Transformation: strip the <script> import block, inline each
 * `<DemoBox code={xSrc}><X /></DemoBox>` as a ```svelte fence with the demo
 * file's source, convert <Notice> to a blockquote.
 *
 * Strictness: any docs authoring pattern this script does not recognize is a
 * hard error, not a silent skip — "docs md stays statically parseable" is a
 * repo convention enforced here (and by unit tests).
 *
 * IMPORTANT build-chain ordering: `svelte-package -i src -o dist` rebuilds
 * dist from scratch, so this script MUST run last in the package `build`
 * script (after clean-dist and build:meta), or its output gets wiped.
 */
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
} from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(__dirname, '..');
const docsRoot = resolve(pkgRoot, '../docs');
const contentSrcDir = resolve(docsRoot, 'src/content/components');
const componentsJsonPath = resolve(pkgRoot, 'dist/components.json');
const outDir = resolve(pkgRoot, 'dist/content/components');

// ---------------------------------------------------------------------------
// Frontmatter（title/name/category/brief 四个标量字段，正则即可）
// ---------------------------------------------------------------------------

export interface Frontmatter {
  title?: string;
  name?: string;
  category?: string;
  brief?: string;
}

export function parseFrontmatter(md: string): {
  fm: Frontmatter;
  body: string;
  raw: string;
} {
  const m = md.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { fm: {}, body: md, raw: '' };
  const fm: Frontmatter = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.*)$/);
    if (kv) (fm as Record<string, string>)[kv[1]] = kv[2].trim();
  }
  return { fm, body: md.slice(m[0].length), raw: m[0] };
}

// ---------------------------------------------------------------------------
// inline 模式：script import 解析 + DemoBox/Notice 替换
// ---------------------------------------------------------------------------

interface ScriptImports {
  /** 组件局部名 → demo 文件绝对路径 */
  components: Map<string, string>;
  /** ?raw 源码变量名 → demo 文件绝对路径 */
  sources: Map<string, string>;
  /** String.fromCharCode 拼接的字面量常量：变量名 → 计算出的字符串值 */
  literals: Map<string, string>;
}

/** `String.fromCharCode(N) + '...' + String.fromCharCode(M) + ...` 形式的常量表达式求值。 */
function evalCharCodeLiteral(expr: string): string | null {
  const parts = expr.split('+').map((p) => p.trim());
  let out = '';
  for (const part of parts) {
    const codeMatch = part.match(/^String\.fromCharCode\((\d+)\)$/);
    if (codeMatch) {
      out += String.fromCharCode(Number(codeMatch[1]));
      continue;
    }
    const strMatch = part.match(/^(['"`])([\s\S]*)\1$/);
    if (strMatch) {
      out += strMatch[2];
      continue;
    }
    return null;
  }
  return out;
}

/**
 * 解析 inline md 的 <script> 块。只允许四类语句：
 *   1. demo 组件 import：  import X from '../../demos/<dir>/<file>.svelte'
 *   2. ?raw import：       import xSrc from '../../demos/<dir>/<file>.svelte?raw'
 *   3. docs 站壳组件：      import DemoBox/Notice from '$lib/...'
 *   4. 字面量常量：         const x = String.fromCharCode(...) + '...' + ...
 *      （正文用于展示会被 Svelte 编译器解析的字面语法，如 `{#snippet}`，
 *      文档站侧靠此变通避开预处理；净化产物按第 4 类求值后回填正文插值处）
 * 其他任何语句都是 authoring 约定漂移 → 报错。
 */
export function parseInlineScript(
  script: string,
  mdFile: string,
): ScriptImports {
  const components = new Map<string, string>();
  const sources = new Map<string, string>();
  const literals = new Map<string, string>();

  for (const rawLine of script.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('//')) continue;

    const libImport = line.match(/^import\s+\w+\s+from\s+'\$lib\/[^']+';?$/);
    if (libImport) continue;

    const demoImport = line.match(
      /^import\s+(\w+)\s+from\s+'(\.\.\/\.\.\/demos\/[^']+\.svelte)(\?raw)?';?$/,
    );
    if (demoImport) {
      const [, name, relPath, isRaw] = demoImport;
      // md 位于 src/content/components/，../../demos/... 即 src/demos/...
      const abs = resolve(contentSrcDir, relPath);
      (isRaw ? sources : components).set(name, abs);
      continue;
    }

    const literalConst = line.match(/^const\s+(\w+)\s*=\s*(.+?);?$/);
    if (literalConst) {
      const value = evalCharCodeLiteral(literalConst[2]);
      if (value !== null) {
        literals.set(literalConst[1], value);
        continue;
      }
    }

    throw new Error(
      `[build-content] ${mdFile} <script> 含无法识别的语句（authoring 约定漂移）：\n  ${line}`,
    );
  }
  return { components, sources, literals };
}

/** <Notice type=... title="T">body</Notice> → blockquote */
export function convertNotices(body: string): string {
  return body.replace(
    /<Notice\b([^>]*)>([\s\S]*?)<\/Notice>/g,
    (_, attrs: string, inner: string) => {
      // title 从完整属性串里单独提取——懒惰前缀 + 可选组的组合会让可选组永远选空
      const title = attrs.match(/title=["']([^"']*)["']/)?.[1];
      const lines = inner.trim().split('\n');
      const quoted = lines.map((l) => `> ${l.trim()}`.trimEnd());
      return title
        ? [`> **${title}**`, '>', ...quoted].join('\n')
        : quoted.join('\n');
    },
  );
}

export function transformInlineMd(md: string, mdFile: string): string {
  const { body, raw } = parseFrontmatter(md);

  const scriptMatch = body.match(/<script>\n?([\s\S]*?)<\/script>\n?/);
  if (!scriptMatch)
    throw new Error(
      `[build-content] ${mdFile} 没有 <script> 块（约定：所有组件文档均为 inline 形态）`,
    );
  const imports = parseInlineScript(scriptMatch[1], mdFile);
  let out = body.replace(scriptMatch[0], '');

  // <DemoBox code={xSrc}><X /></DemoBox> → ```svelte 内联源码
  out = out.replace(
    /<DemoBox\s+code=\{(\w+)\}\s*>\s*<(\w+)\s*\/>\s*<\/DemoBox>/g,
    (_, srcVar: string, compName: string) => {
      const srcPath = imports.sources.get(srcVar);
      const compPath = imports.components.get(compName);
      if (!srcPath || !compPath) {
        throw new Error(
          `[build-content] ${mdFile} DemoBox 引用了未导入的 ${srcVar}/${compName}`,
        );
      }
      if (srcPath !== compPath) {
        throw new Error(
          `[build-content] ${mdFile} DemoBox 的 code(${srcVar}) 与组件(${compName}) 指向不同 demo 文件`,
        );
      }
      const code = readFileSync(srcPath, 'utf-8').trim();
      return '```svelte\n' + code + '\n```';
    },
  );

  // 残留的 <DemoBox（形态不符上面正则）也是约定漂移
  if (out.includes('<DemoBox')) {
    throw new Error(
      `[build-content] ${mdFile} 存在无法识别形态的 <DemoBox>（应为 <DemoBox code={xSrc}><X /></DemoBox>）`,
    );
  }

  // 正文里对字面量常量的插值引用（如 {snippetLiteral}）回填为其求值结果
  for (const [name, value] of imports.literals) {
    out = out.replaceAll(`{${name}}`, value);
  }

  out = convertNotices(out);
  // frontmatter 原样保留（Semi content 也带 frontmatter）
  return raw + out.replace(/\n{3,}/g, '\n\n').trim() + '\n';
}

// ---------------------------------------------------------------------------
// 降级：无人工 md 的组件从 components.json 生成
// ---------------------------------------------------------------------------

interface MetaProp {
  name: string;
  type?: string;
  default?: string;
  desc?: string;
}
interface MetaComponent {
  name: string;
  category?: string;
  description?: string;
  props?: MetaProp[];
  events?: MetaProp[];
  slots?: MetaProp[];
  methods?: { name: string; signature?: string; desc?: string }[];
  tokens?: { name?: string; desc?: string }[] | string[];
  /** 形态杂（keyboard 可为 string/array、还有 note/notes/hasRole 等键）——宽容渲染 */
  a11y?: Record<string, unknown> | string;
  examples?: { title?: string; code?: string }[];
}

function mdTable(
  rows: MetaProp[],
  headers: [string, string, string, string],
): string {
  const esc = (s = '-') => s.replace(/\|/g, '\\|').replace(/\n/g, ' ') || '-';
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(
      (r) =>
        `| ${esc(r.name)} | ${esc(r.desc)} | ${esc(r.type)} | ${esc(r.default)} |`,
    ),
  ];
  return lines.join('\n');
}

export function generateFallbackMd(
  kebabName: string,
  meta: MetaComponent,
): string {
  const parts: string[] = [
    '---',
    `title: ${meta.name}`,
    `name: ${kebabName}`,
    `category: ${meta.category ?? 'other'}`,
    'generated: true',
    '---',
    '',
    '> 此文档由组件元数据（components.json）自动生成，尚无人工撰写的完整文档。',
    '',
  ];
  if (meta.description) parts.push('## 简介', '', meta.description, '');
  if (meta.examples?.length) {
    parts.push('## 代码示例', '');
    for (const ex of meta.examples) {
      if (ex.title) parts.push(`### ${ex.title}`, '');
      if (ex.code) parts.push('```svelte', ex.code.trim(), '```', '');
    }
  }
  if (meta.props?.length)
    parts.push(
      '## Props',
      '',
      mdTable(meta.props, ['属性', '说明', '类型', '默认值']),
      '',
    );
  if (meta.events?.length)
    parts.push(
      '## Events',
      '',
      mdTable(meta.events, ['事件', '说明', '类型', '默认值']),
      '',
    );
  if (meta.slots?.length)
    parts.push(
      '## Slots',
      '',
      mdTable(meta.slots, ['插槽', '说明', '类型', '默认值']),
      '',
    );
  if (meta.methods?.length) {
    parts.push(
      '## Methods',
      '',
      ...meta.methods.map(
        (m) =>
          `- \`${m.name}${m.signature ? `: ${m.signature}` : ''}\`${m.desc ? ` — ${m.desc}` : ''}`,
      ),
      '',
    );
  }
  if (meta.tokens?.length) {
    const tokenLines = (
      meta.tokens as ({ name?: string; desc?: string } | string)[]
    ).map((t) =>
      typeof t === 'string'
        ? `- \`${t}\``
        : `- \`${t.name}\`${t.desc ? ` — ${t.desc}` : ''}`,
    );
    parts.push('## Design Tokens', '', ...tokenLines, '');
  }
  if (meta.a11y) {
    const lines: string[] = [];
    if (typeof meta.a11y === 'string') {
      lines.push(meta.a11y);
    } else {
      // 键值宽容渲染：值可能是 string / string[] / boolean
      for (const [key, value] of Object.entries(meta.a11y)) {
        if (value == null || value === false) continue;
        if (Array.isArray(value))
          lines.push(`- ${key}: ${value.map(String).join('；')}`);
        else if (value === true) lines.push(`- ${key}`);
        else lines.push(`- ${key}: ${String(value)}`);
      }
    }
    if (lines.length) parts.push('## 无障碍', '', ...lines, '');
  }
  return parts.join('\n').replace(/\n{3,}/g, '\n\n');
}

// ---------------------------------------------------------------------------
// 产物自校验（约定门禁）
// ---------------------------------------------------------------------------

export function validateOutput(name: string, content: string): void {
  // 残留检查须先剥掉代码围栏与行内代码——内联的 demo 源码里合法地含 <script>/import 等，
  // 散文里也会用反引号提及 `<script>` 这样的字面词（如「不必先在 `<script>` 里…」）
  const prose = content
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`\n]*`/g, '');
  const residues = ['<DemoBox', '<Notice', '<script', '?raw'];
  for (const r of residues) {
    if (prose.includes(r))
      throw new Error(`[build-content] 产物 ${name}.md 残留 ${r}`);
  }
  if (/\{\w+Src\}/.test(prose))
    throw new Error(`[build-content] 产物 ${name}.md 残留悬空 {xxxSrc} 引用`);
  const fm = parseFrontmatter(content).fm;
  if (fm.name !== name)
    throw new Error(
      `[build-content] 产物 ${name}.md frontmatter name(${fm.name}) 与文件名不符`,
    );
  for (const block of content.matchAll(/```svelte\n([\s\S]*?)```/g)) {
    if (!block[1].trim())
      throw new Error(`[build-content] 产物 ${name}.md 存在空的 svelte 代码块`);
  }
}

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

async function main() {
  if (!existsSync(componentsJsonPath)) {
    throw new Error(
      '[build-content] dist/components.json 不存在，请先跑 build:meta',
    );
  }
  const manifest = JSON.parse(readFileSync(componentsJsonPath, 'utf-8')) as {
    components: Record<string, MetaComponent> | MetaComponent[];
  };
  const metaList: MetaComponent[] = Array.isArray(manifest.components)
    ? manifest.components
    : Object.values(manifest.components);

  const mdFiles = existsSync(contentSrcDir)
    ? readdirSync(contentSrcDir).filter(
        (f) => f.endsWith('.md') && !f.endsWith('.en.md'),
      )
    : [];

  mkdirSync(outDir, { recursive: true });
  let inlineCount = 0;
  let generatedCount = 0;
  const written = new Set<string>();

  for (const file of mdFiles) {
    const name = file.replace(/\.md$/, '');
    const md = readFileSync(resolve(contentSrcDir, file), 'utf-8');
    const out = transformInlineMd(md, file);
    inlineCount++;
    validateOutput(name, out);
    writeFileSync(resolve(outDir, `${name}.md`), out);
    written.add(name);
  }

  // 无人工 md 的组件降级生成。命名对账：docs md 文件名是「全小写压平」（backtop.md、
  // datepicker.md），而 meta name 是 Pascal（BackTop）——匹配键统一为去连字符全小写，
  // 降级产物文件名也沿用 docs 压平惯例，保证 MCP 侧单一归一化规则。
  const flat = (s: string) => s.replace(/-/g, '').toLowerCase();
  const writtenFlat = new Set([...written].map(flat));
  for (const meta of metaList) {
    const name = flat(meta.name);
    if (writtenFlat.has(name)) continue;
    // 子组件 meta（如 ButtonGroup、AvatarGroup）与主组件共享文档：主组件文档已覆盖时跳过
    const isSubComponent = metaList.some(
      (m) =>
        m !== meta &&
        writtenFlat.has(flat(m.name)) &&
        name.startsWith(flat(m.name)),
    );
    if (isSubComponent) continue;
    const out = generateFallbackMd(name, meta);
    validateOutput(name, out);
    writeFileSync(resolve(outDir, `${name}.md`), out);
    written.add(name);
    writtenFlat.add(name);
    generatedCount++;
  }

  console.log(
    `[build-content] 生成 ${written.size} 个文档（inline ${inlineCount} / generated ${generatedCount}）→ dist/content/components/`,
  );
}

const isDirectRun =
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  main().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
