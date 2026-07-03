#!/usr/bin/env node
/**
 * chenzy-theme CLI —— init / build。
 * 见 specs/00-foundation/theming.spec.md「theme-cli 接口（草案）」。
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { generateCss, validateConfig } from './build.js';
import { findConfig, loadConfig } from './load-config.js';

const INIT_TEMPLATE = `import { defineTheme } from '@chenzy-design/theme-cli';

export default defineTheme({
  // Alias 层覆写：改品牌色 / 圆角等语义 token（无 --cd- 前缀）。
  alias: {
    'color-primary': '#0066ff',
  },
  // 暗色覆写：注入到 [data-theme="dark"]。
  dark: {},
});
`;

function log(msg: string): void {
  process.stdout.write(msg + '\n');
}
function err(msg: string): void {
  process.stderr.write(msg + '\n');
}

function cmdInit(cwd: string): number {
  const target = path.join(cwd, 'theme.config.ts');
  if (existsSync(target)) {
    log(`theme.config.ts 已存在，跳过（不覆盖）：${target}`);
    return 0;
  }
  writeFileSync(target, INIT_TEMPLATE, 'utf8');
  log(`已生成 ${target}`);
  return 0;
}

async function cmdBuild(cwd: string): Promise<number> {
  const configPath = findConfig(cwd);
  if (!configPath) {
    err('未找到 theme.config.{ts,mts,mjs,js}。先运行 `chenzy-theme init`。');
    return 1;
  }

  const config = await loadConfig(configPath);
  const { errors, warnings } = validateConfig(config);

  for (const w of warnings) {
    err(
      `warning: [${w.section}] 「${w.key}」是组件层 token，主题包建议只覆写 alias/global 层。仍会写入产物。`,
    );
  }
  if (errors.length > 0) {
    for (const e of errors) {
      err(`error: [${e.section}] 「${e.key}」不是有效 token（--cd-${e.key} 在 manifest 中不存在，请检查拼写）。`);
    }
    err(`构建失败：${errors.length} 个非法 key。`);
    return 1;
  }

  const css = generateCss(config);
  const outDir = path.join(cwd, 'dist');
  const outFile = path.join(outDir, 'theme.css');
  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, css, 'utf8');

  const aliasN = Object.keys(config.alias ?? {}).length;
  const darkN = Object.keys(config.dark ?? {}).length;
  log(`已生成 ${outFile}（:root ${aliasN} 项 · dark ${darkN} 项）`);
  return 0;
}

function usage(): void {
  log(
    [
      'chenzy-theme —— chenzy-design 主题 CLI',
      '',
      '用法：',
      '  chenzy-theme init     在当前目录生成 theme.config.ts',
      '  chenzy-theme build    读 theme.config 产出 dist/theme.css（:root + 暗色）',
    ].join('\n'),
  );
}

async function main(): Promise<number> {
  const cmd = process.argv[2];
  const cwd = process.cwd();
  switch (cmd) {
    case 'init':
      return cmdInit(cwd);
    case 'build':
      return cmdBuild(cwd);
    case undefined:
    case '-h':
    case '--help':
      usage();
      return 0;
    default:
      err(`未知命令：${cmd}`);
      usage();
      return 1;
  }
}

main().then(
  (code) => process.exit(code),
  (e: unknown) => {
    err(`意外错误：${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  },
);
