/**
 * 加载 cwd 的 theme.config.{ts,mts,mjs,js}。
 *
 * TS 配置用 tsx 加载 —— 项目已把 tsx 作为工具链依赖（tokens.build 用 tsx 跑 .ts），
 * 复用同一方案最可靠。这里通过「spawn tsx 跑一个 loader 脚本、把 config 序列化成
 * JSON 从 stdout 回传」的方式，而非 in-process tsImport：后者在 config 用裸包名
 * import defineTheme 时，tsx 的嵌套解析会给依赖 URL 附加 ?namespace 查询串导致
 * ERR_MODULE_NOT_FOUND（尤其是软链接安装下）。子进程方式让 config 的 import 走
 * 常规 ESM 解析，稳定可靠。
 */
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { ThemeConfig } from './config.js';

const CONFIG_NAMES = [
  'theme.config.ts',
  'theme.config.mts',
  'theme.config.mjs',
  'theme.config.js',
];

/** 在 cwd 找配置文件，返回绝对路径；找不到返回 null。 */
export function findConfig(cwd: string): string | null {
  for (const name of CONFIG_NAMES) {
    const p = path.join(cwd, name);
    if (existsSync(p)) return p;
  }
  return null;
}

const here = fileURLToPath(import.meta.url);
const require = createRequire(import.meta.url);

/** 定位 tsx CLI 入口（从本包解析，兼容 monorepo / 已安装场景）。 */
function resolveTsxCli(): string {
  // tsx 的 package.json bin 指向 ./dist/cli.mjs。
  const pkg = require.resolve('tsx/package.json');
  return path.join(path.dirname(pkg), 'dist', 'cli.mjs');
}

/**
 * spawn tsx 跑 loader 脚本，读取用户 config 并把其默认导出以 JSON 打到 stdout。
 * loader 脚本随包一起编译到 dist（load-config-runner.js），用 tsx 执行以便
 * 它 import 的 .ts config 被即时转译。
 */
export function loadConfig(configPath: string): Promise<ThemeConfig> {
  const isTs = /\.m?ts$/.test(configPath);

  if (!isTs) {
    // .js / .mjs 直接用原生 ESM 加载，无需 tsx。
    return import(pathToFileURL(configPath).href).then((mod: { default?: ThemeConfig }) =>
      normalize(mod.default ?? (mod as ThemeConfig), configPath),
    );
  }

  const runner = path.join(path.dirname(here), 'load-config-runner.js');
  const tsxCli = resolveTsxCli();

  return new Promise<ThemeConfig>((resolve, reject) => {
    const child = spawn(process.execPath, [tsxCli, runner, configPath], {
      stdio: ['ignore', 'pipe', 'inherit'],
      cwd: path.dirname(configPath),
    });
    let out = '';
    child.stdout.on('data', (c: Buffer) => (out += c.toString()));
    child.on('error', reject);
    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`加载配置失败（tsx 退出码 ${code}）：${configPath}`));
        return;
      }
      try {
        resolve(normalize(JSON.parse(out) as ThemeConfig, configPath));
      } catch (e) {
        reject(new Error(`配置序列化失败：${(e as Error).message}`));
      }
    });
  });
}

function normalize(config: ThemeConfig | undefined, configPath: string): ThemeConfig {
  if (!config || typeof config !== 'object') {
    throw new Error(`配置文件未导出对象（应 export default defineTheme({...})）：${configPath}`);
  }
  return config;
}
