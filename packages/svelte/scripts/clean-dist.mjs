// 清理 svelte-package 产物：svelte-package 会把 src 下所有文件（含测试、fixture、
// bench）一并编译进 dist。发布包不应包含这些——它们既臃肿又泄露内部夹具。
// 本脚本在 svelte-package 之后运行，删除 dist 里所有测试/夹具相关文件
// （含其 .js / .svelte / .d.ts / .d.ts.map）。
import { readdirSync, statSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const distDir = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'dist');

// 命中即删（对文件名做正则匹配，覆盖各种衍生后缀）。
const PATTERNS = [
  /\.test\./, // *.test.ts / *.a11y.test.* / *.kbd.test.* / *.visual.test.*
  /\.spec\./, // *.spec.*
  /\.bench\./, // *.bench.*
  /Fixture\.svelte/, // *KbdFixture.svelte / *VisualFixture.svelte 及其 .d.ts
  /^test-utils$/, // 整个 test-utils 目录（仅测试基建）
];

let removed = 0;

function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const isDir = statSync(full).isDirectory();

    // test-utils 整目录删除
    if (isDir && entry === 'test-utils') {
      rmSync(full, { recursive: true, force: true });
      removed += 1;
      continue;
    }
    // __screenshots__ 基线目录（视觉测试基线，不该进发布包）
    if (isDir && entry === '__screenshots__') {
      rmSync(full, { recursive: true, force: true });
      removed += 1;
      continue;
    }

    if (isDir) {
      walk(full);
      continue;
    }

    if (PATTERNS.some((re) => re.test(entry))) {
      rmSync(full, { force: true });
      removed += 1;
    }
  }
}

walk(distDir);
console.log(`[clean-dist] removed ${removed} test/fixture artifacts from dist`);
