// 把 dist/tokens.css 里所有 --cd-* 解析成最终字面量（light :root 作用域）。
// 用法: node scripts/resolve-final.mjs [组件名子串]
import fs from 'fs';
import path from 'path';
const cssPath = path.resolve(import.meta.dirname, '../dist/tokens.css');
const css = fs.readFileSync(cssPath, 'utf8');
const map = {};
for (const m of css.matchAll(/(--cd-[a-z0-9-]+)\s*:\s*([^;]+);/g)) {
  if (!(m[1] in map)) map[m[1]] = m[2].trim();
}
function resolve(v, d = 0) {
  if (d > 30) return v + ' [!cycle]';
  const m = v.match(/^var\((--cd-[a-z0-9-]+)(?:\s*,\s*([^)]+))?\)$/);
  if (m) {
    if (map[m[1]] !== undefined) return resolve(map[m[1]], d + 1);
    if (m[2]) return resolve(m[2].trim(), d + 1);
    return `<<${m[1]} UNDEFINED>>`;
  }
  return v;
}
const filter = process.argv[2] || '';
for (const k of Object.keys(map).sort()) {
  if (filter && !k.includes(filter)) continue;
  console.log(k + '\t' + map[k] + '\t=> ' + resolve(map[k]));
}
