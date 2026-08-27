/**
 * get_component_file_list — 获取组件源码文件列表。
 * 对齐 semi-mcp：查两层——@chenzy-design/svelte（渲染层，dist 内含 .svelte 源码）
 * 与 @chenzy-design/core（headless 逻辑层，src 内 .ts 源码）。
 *
 * 注意 dist 目录名并非统一 kebab（有 back-top 也有 iconbutton），用
 * 去连字符全小写的归一化在真实目录列表里匹配，不从组件名机械推导。
 */
import type { Tool, CallToolResult } from '@modelcontextprotocol/server';
import { fetchDirectoryList, type DirEntry } from '../utils/fetch.js';
import {
  SVELTE_PACKAGE,
  CORE_PACKAGE,
  flatName,
} from '../utils/components-json.js';

/** 排除的产物/测试文件 */
function shouldExclude(path: string): boolean {
  return /\.test\.|\.spec\.|\.bench\.|Fixture\.svelte|__screenshots__|\.d\.ts(\.map)?$|\.js\.map$/.test(
    path,
  );
}

/** svelte 包：dist/<dir>/ 下匹配组件目录 */
async function getSvelteFiles(
  componentName: string,
  version: string,
): Promise<string[]> {
  const flat = flatName(componentName);
  const entries = await fetchDirectoryList(SVELTE_PACKAGE, version, 'dist');
  // 找 dist 下一级的组件目录：/dist/<dir>/...
  const dirs = new Set<string>();
  for (const e of entries) {
    const m = e.path.match(/^\/?dist\/([^/]+)\//);
    if (m?.[1]) dirs.add(m[1]);
    else if (e.type === 'directory') {
      const d = e.path.replace(/^\/?dist\//, '').replace(/\/$/, '');
      if (d && !d.includes('/')) dirs.add(d);
    }
  }
  const dir = [...dirs].find((d) => flatName(d) === flat);
  if (!dir) return [];
  const prefix = new RegExp(`^/?dist/${dir}/`);
  return entries
    .filter(
      (e) => e.type === 'file' && prefix.test(e.path) && !shouldExclude(e.path),
    )
    .map((e) => `${SVELTE_PACKAGE}/${e.path.replace(/^\//, '')}`)
    .sort();
}

/** core 包：src/<name>.ts 扁平结构（<name> 是 kebab），含 <name>-*.ts 前缀族 */
async function getCoreFiles(
  componentName: string,
  version: string,
): Promise<{ files: string[]; note?: string }> {
  const flat = flatName(componentName);
  let entries: DirEntry[];
  try {
    entries = await fetchDirectoryList(CORE_PACKAGE, version, 'src');
  } catch {
    return {
      files: [],
      note: '（该版本 @chenzy-design/core 未随包发布 src，无法查看 headless 源码）',
    };
  }
  const files = entries
    .filter((e) => {
      if (e.type !== 'file' || shouldExclude(e.path)) return false;
      const base = e.path.replace(/^\/?src\//, '').replace(/\.ts$/, '');
      if (base.includes('/')) return false;
      // 精确匹配（去连字符归一化）：scroll-list 命中 scroll-list.ts，不误吞 scroll-lock.ts
      return flatName(base) === flat;
    })
    .map((e) => `${CORE_PACKAGE}/${e.path.replace(/^\//, '')}`)
    .sort();
  return { files };
}

export const getComponentFileListTool: Tool = {
  name: 'get_component_file_list',
  description: `获取 chenzy-design 组件的源码文件路径列表。

返回组件在两个包中的文件：
- @chenzy-design/svelte（渲染层）：dist/<组件>/ 下的 .svelte 源码、context/meta 等
- @chenzy-design/core（headless 逻辑层）：src/<组件>.ts 纯 TS 状态与算法

使用场景：
1. 先用此工具获取文件列表
2. 再用 get_file_code 获取感兴趣的文件代码
3. 需要看具体函数实现时用 get_function_code`,
  inputSchema: {
    type: 'object',
    properties: {
      componentName: {
        type: 'string',
        description:
          '组件名，如 Table、DatePicker、back-top（大小写/连字符不敏感）',
      },
      version: { type: 'string', description: '版本号，默认 latest' },
    },
    required: ['componentName'],
  },
};

export async function handleGetComponentFileList(
  args: Record<string, unknown>,
): Promise<CallToolResult> {
  const componentName = args?.componentName as string | undefined;
  const version = (args?.version as string | undefined) || 'latest';

  if (!componentName) {
    return {
      content: [{ type: 'text', text: '错误：请提供组件名称 (componentName)' }],
      isError: true,
    };
  }

  try {
    const [svelteFiles, core] = await Promise.all([
      getSvelteFiles(componentName, version),
      getCoreFiles(componentName, version),
    ]);

    if (svelteFiles.length === 0 && core.files.length === 0) {
      return {
        content: [
          {
            type: 'text',
            text: `未找到组件 "${componentName}" 的源码文件。请检查组件名称是否正确。`,
          },
        ],
        isError: true,
      };
    }

    const output = [
      `组件: ${componentName}`,
      `版本: ${version}`,
      `总文件数: ${svelteFiles.length + core.files.length}`,
      '',
      `## ${SVELTE_PACKAGE}（渲染层）`,
      ...(svelteFiles.length ? svelteFiles : ['（无）']),
      '',
      `## ${CORE_PACKAGE}（headless 逻辑层）`,
      ...(core.files.length
        ? core.files
        : [core.note ?? '（无——该组件可能没有 headless 层）']),
      '',
      '提示: 使用 get_file_code 工具传入上述路径获取文件代码',
    ];

    return { content: [{ type: 'text', text: output.join('\n') }] };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `获取组件文件列表失败: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
}
