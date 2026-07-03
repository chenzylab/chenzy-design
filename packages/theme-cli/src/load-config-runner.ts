/**
 * 由 load-config.ts 通过 tsx spawn 执行。
 * argv[2] = 用户 theme.config 的绝对路径；import 它、把默认导出 JSON 打到 stdout。
 * 独立成脚本：作为 tsx 的入口，用户 config 里对 defineTheme 等的裸包名 import
 * 走常规 ESM 解析，避开 in-process 嵌套 tsImport 的 ?namespace 解析问题。
 */
import { pathToFileURL } from 'node:url';

async function run(): Promise<void> {
  const configPath = process.argv[2];
  if (!configPath) {
    process.stderr.write('缺少 config 路径参数\n');
    process.exit(1);
  }
  const mod = (await import(pathToFileURL(configPath).href)) as {
    default?: unknown;
  };
  const config = mod.default ?? mod;
  process.stdout.write(JSON.stringify(config));
}

run().catch((e: unknown) => {
  process.stderr.write((e instanceof Error ? e.stack ?? e.message : String(e)) + '\n');
  process.exit(1);
});
