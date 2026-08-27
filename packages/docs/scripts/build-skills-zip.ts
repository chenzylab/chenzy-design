/**
 * 把 packages/mcp/skills/ 的三个 md 打包成 static/chenzy-design-skills.zip，
 * 供文档站 /guide/mcp-skills 页下载。zip 内目录为 chenzy-design-guide/，
 * 解压到 .claude/skills/ 即得标准 skill 目录结构。
 *
 * 读的是 mcp 包的源文件（md），不依赖 mcp 已构建。挂在 docs 的 predev/prebuild。
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { zipSync } from 'fflate';

const __dirname = dirname(fileURLToPath(import.meta.url));
const skillsDir = resolve(__dirname, '../../mcp/skills');
const outFile = resolve(__dirname, '../static/chenzy-design-skills.zip');

const files: Record<string, Uint8Array> = {};
for (const name of readdirSync(skillsDir).filter((f) => f.endsWith('.md'))) {
  files[`chenzy-design-guide/${name}`] = new Uint8Array(readFileSync(resolve(skillsDir, name)));
}

if (Object.keys(files).length === 0) {
  console.error('[build-skills-zip] packages/mcp/skills/ 下没有 md 文件');
  process.exit(1);
}

mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, zipSync(files, { level: 9 }));
console.log(`[build-skills-zip] 打包 ${Object.keys(files).length} 个文件 → static/chenzy-design-skills.zip`);
