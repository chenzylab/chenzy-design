// 站内搜索索引（客户端、构建期生成）。
// 复刻 Semi/VitePress 思路：构建期用 import.meta.glob 扫组件文档，序列化成静态数据，
// 客户端直接查询——dev 与 prod 均可用，无需后端、无需构建后索引产物。
// 粒度：页级（title/name/brief/category）+ 标题锚点（h2/h3，含与 TOC 一致的锚点 id）。

// 与 svelte.config.js 的 makeAnchorId 逐字节一致，保证搜索命中标题后跳转的锚点与页内 TOC 相同。
function makeAnchorId(id: string): string {
  return id
    .toLowerCase()
    .replace(/\//g, '')
    .replace(/\s/g, '-')
    .replace(/(\(|\))/g, 'aaa')
    .replace(/\./g, '-')
    .replace(/&/g, '-')
    .replace(/(^[^一-龥^a-z%])/, 'n$1');
}

export interface SearchHeading {
  /** 标题文本 */
  text: string;
  /** 页内锚点（不含 #），与 TOC 一致 */
  anchor: string;
  /** h2 | h3 */
  level: 2 | 3;
}

export interface SearchDoc {
  /** 组件路由名（如 button），对应 /components/{name} */
  name: string;
  /** 页标题（如 Button 按钮） */
  title: string;
  /** 简介 */
  brief: string;
  /** 分类（basic/show/...） */
  category: string;
  /** 标题锚点列表 */
  headings: SearchHeading[];
}

// frontmatter 元信息：mdsvex 已在构建期解析好，随 glob 同步就绪。
const metaModules = import.meta.glob<{ metadata?: Record<string, unknown> }>(
  '../content/components/*.md',
  { eager: true },
);
// 原文：用于提取 ## / ### 标题（英文 md 与非组件页跳过）。
const rawModules = import.meta.glob('../content/components/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

function extractHeadings(raw: string): SearchHeading[] {
  const out: SearchHeading[] = [];
  let inFence = false;
  for (const line of raw.split('\n')) {
    // 跳过代码块内的 # 注释行，避免把示例代码里的 # 当标题
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;
    const m = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const level = m[1].length as 2 | 3;
    // 去掉标题里的行内 code 反引号与 markdown 链接语法，取纯文本
    const text = m[2]
      .replace(/`([^`]*)`/g, '$1')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .trim();
    if (!text) continue;
    out.push({ text, anchor: makeAnchorId(text), level });
  }
  return out;
}

function buildIndex(): SearchDoc[] {
  const docs: SearchDoc[] = [];
  for (const [path, mod] of Object.entries(metaModules)) {
    const meta = mod.metadata ?? {};
    const name = meta.name as string | undefined;
    const title = meta.title as string | undefined;
    // 英文分身 {name}.en.md 无独立 name/title 或与主页重复，跳过（frontmatter 无 name 即非主组件页）
    if (!name || !title || /\.en\.md$/.test(path)) continue;
    const raw = rawModules[path] ?? '';
    docs.push({
      name,
      title,
      brief: (meta.brief as string) ?? '',
      category: (meta.category as string) ?? '',
      headings: extractHeadings(raw),
    });
  }
  return docs.sort((a, b) => a.name.localeCompare(b.name));
}

export const searchDocs: SearchDoc[] = buildIndex();

export interface SearchResult {
  name: string;
  title: string;
  brief: string;
  /** 命中的页内标题（页级命中时为空） */
  heading?: SearchHeading;
  /** 排序分（越大越靠前） */
  score: number;
}

// 极简客户端全文匹配：小写子串 + 前缀/词首加权。71 页规模线性扫无感，中英文通吃。
export function searchSite(rawQuery: string, limit = 8): SearchResult[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) return [];
  const results: SearchResult[] = [];

  for (const doc of searchDocs) {
    const name = doc.name.toLowerCase();
    const title = doc.title.toLowerCase();
    const brief = doc.brief.toLowerCase();

    // 页级打分
    let pageScore = 0;
    if (name === q || title === q) pageScore = 100;
    else if (name.startsWith(q) || title.startsWith(q)) pageScore = 80;
    else if (name.includes(q) || title.includes(q)) pageScore = 60;
    else if (brief.includes(q)) pageScore = 30;
    if (pageScore > 0) {
      results.push({ name: doc.name, title: doc.title, brief: doc.brief, score: pageScore });
    }

    // 标题级打分（页内小节）：分低于页级同名命中，避免淹没组件本身
    for (const h of doc.headings) {
      const ht = h.text.toLowerCase();
      let hScore = 0;
      if (ht === q) hScore = 55;
      else if (ht.startsWith(q)) hScore = 45;
      else if (ht.includes(q)) hScore = 35;
      if (hScore > 0) {
        results.push({
          name: doc.name,
          title: doc.title,
          brief: doc.brief,
          heading: h,
          score: hScore,
        });
      }
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
