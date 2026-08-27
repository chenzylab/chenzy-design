// 从 dist 移除测试产物（tsc include src 会把 *.test.ts 一并编译；发布物不该带测试）。
import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
const dist = new URL('../dist', import.meta.url).pathname;
let n = 0;
for (const f of readdirSync(dist)) {
  if (/\.test\.(js|d\.ts)(\.map)?$/.test(f)) {
    rmSync(join(dist, f));
    n++;
  }
}
console.log(`[clean-dist] removed ${n} test artifacts from dist`);
