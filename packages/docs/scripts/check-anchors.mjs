/**
 * 全量校验组件文档 md 里的锚点链接是否指向真实存在的标题 id。
 *
 * 为什么需要独立脚本：
 * kit.prerender.handleMissingId 设为 'warn'（demo 内的示例锚点如 Menu 的 #nav-home
 * 并非真实页面锚点，设成 error 会误杀），于是真断链只是一条被淹没的警告；
 * 而**跨页**断链（如 modal.md 指向 button 页的锚点）连警告都不会出——
 * 爬虫只在链接被访问到时校验。收尾清理时靠本脚本一次性查出 8 处断链。
 *
 * id 规则必须与 svelte.config.js 的 makeAnchorId 保持一致（后者逐字节对齐 Semi）。
 * 注意 `(` `)` 各转成 `aaa` 不是笔误，Semi 原样如此。
 *
 * 用法：node packages/docs/scripts/check-anchors.mjs
 * 断链时以非零码退出，可直接进 CI。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../src/content/components',
);

// 与 svelte.config.js 的 makeAnchorId 同源，改一处必须同步另一处。
function makeAnchorId(id) {
  if (!id) return null;
  return id
    .toLowerCase()
    .replace(/\//g, '')
    .replace(/\s/g, '-')
    .replace(/(\(|\))/g, 'aaa')
    .replace(/\./g, '-')
    .replace(/&/g, '-')
    .replace(/(^[^一-龥^a-z%])/, 'n$1');
}

const files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md'));

// 页面名 -> 该页所有标题 id
const idsByPage = new Map();
for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  const ids = new Set();
  for (const m of src.matchAll(/^#{1,6}\s+(.+?)\s*$/gm)) {
    // 标题里可能有 `code` / **bold** / [text](url)，取纯文本后再算 id
    const plain = m[1]
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/[`*_]/g, '')
      .trim();
    const id = makeAnchorId(plain);
    if (id) ids.add(id);
  }
  idsByPage.set(f.replace(/\.md$/, ''), ids);
}

const problems = [];
for (const f of files) {
  const page = f.replace(/\.md$/, '');
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  // 匹配 [文字](#锚点) 与 [文字](/components/xxx#锚点)
  for (const m of src.matchAll(/\[([^\]]*)\]\((\/components\/[a-z0-9-]+)?#([^)\s]+)\)/g)) {
    const [full, , targetPath, rawAnchor] = m;
    const anchor = decodeURIComponent(rawAnchor);
    const targetPage = targetPath ? targetPath.split('/').pop() : page;
    const ids = idsByPage.get(targetPage);
    if (!ids) {
      problems.push(`${f}: ${full}\n    → 目标页不存在: ${targetPage}`);
    } else if (!ids.has(anchor)) {
      problems.push(`${f}: ${full}\n    → ${targetPage} 页无此锚点`);
    }
  }
}

if (!problems.length) {
  console.log(`✅ ${files.length} 份 md，锚点链接全部有效`);
} else {
  console.error(`❌ ${problems.length} 处锚点断链：\n`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
