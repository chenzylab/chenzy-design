/**
 * get_file_code — 获取文件源码。对齐 semi-mcp：.ts ≥500 行删函数体只留结构；
 * .svelte 文件仅对其 <script> 块做同样处理，模板永远保留。
 */
import type { Tool, CallToolResult } from '@modelcontextprotocol/server';
import { fetchFileContent } from '../utils/fetch.js';
import { removeFunctionBodies } from '../utils/remove-function-body.js';
import { transformSvelteScripts } from '../utils/svelte-script.js';
import { SVELTE_PACKAGE, CORE_PACKAGE } from '../utils/components-json.js';

/** 代码行数阈值，超过才过滤函数体 */
const LINE_THRESHOLD = 500;

export function parseFilePath(
  fullPath: string,
): { packageName: string; filePath: string } | null {
  const match = fullPath.match(/^(@chenzy-design\/(?:svelte|core))\/(.+)$/);
  if (!match?.[1] || !match[2]) return null;
  return { packageName: match[1], filePath: match[2] };
}

export const getFileCodeTool: Tool = {
  name: 'get_file_code',
  description: `获取 chenzy-design 组件文件的源码。

输入文件路径（从 get_component_file_list 获取），返回文件代码。

默认行为：
- .ts 文件且行数 >= ${LINE_THRESHOLD}：函数体被替换为 "{ ... }"，只显示结构
- .svelte 文件且行数 >= ${LINE_THRESHOLD}：仅 <script> 块内函数体被替换，模板保留
- 其余情况：完整代码

可通过 fullCode 参数强制获取完整代码。

路径格式示例：
- ${SVELTE_PACKAGE}/dist/button/Button.svelte
- ${CORE_PACKAGE}/src/table.ts`,
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: `文件完整路径，如 ${SVELTE_PACKAGE}/dist/button/Button.svelte`,
      },
      version: { type: 'string', description: '版本号，默认 latest' },
      fullCode: {
        type: 'boolean',
        description: '是否获取完整代码（包含函数体），默认 false',
      },
    },
    required: ['filePath'],
  },
};

export async function handleGetFileCode(
  args: Record<string, unknown>,
): Promise<CallToolResult> {
  const filePath = args?.filePath as string | undefined;
  const version = (args?.version as string | undefined) || 'latest';
  const fullCode = (args?.fullCode as boolean | undefined) || false;

  if (!filePath) {
    return {
      content: [{ type: 'text', text: '错误：请提供文件路径 (filePath)' }],
      isError: true,
    };
  }
  const parsed = parseFilePath(filePath);
  if (!parsed) {
    return {
      content: [
        {
          type: 'text',
          text: `错误：无效的文件路径格式。路径应为 ${SVELTE_PACKAGE}/xxx 或 ${CORE_PACKAGE}/xxx 格式。\n\n提供的路径: ${filePath}`,
        },
      ],
      isError: true,
    };
  }

  try {
    const content = await fetchFileContent(
      parsed.packageName,
      version,
      parsed.filePath,
    );
    const lineCount = content.split('\n').length;

    let outputContent = content;
    let processInfo = '';

    if (!fullCode && lineCount >= LINE_THRESHOLD) {
      if (/\.tsx?$/.test(filePath) || filePath.endsWith('.js')) {
        outputContent = removeFunctionBodies(content);
        processInfo =
          '（代码较长，函数体已替换为 "{ ... }"，用 get_function_code 读取具体函数实现）';
      } else if (filePath.endsWith('.svelte')) {
        outputContent = transformSvelteScripts(content, (script) =>
          removeFunctionBodies(script),
        );
        processInfo =
          '（代码较长，<script> 块内函数体已替换为 "{ ... }"，模板保留；用 get_function_code 读取具体函数实现）';
      }
    }

    const output = [
      `文件: ${filePath}`,
      `版本: ${version}`,
      `行数: ${lineCount}`,
      processInfo ? `处理: ${processInfo}` : '',
      '',
      '='.repeat(60),
      '',
      outputContent,
    ].filter(Boolean);

    return { content: [{ type: 'text', text: output.join('\n') }] };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `获取文件内容失败: ${error instanceof Error ? error.message : String(error)}\n\n文件路径: ${filePath}\n版本: ${version}`,
        },
      ],
      isError: true,
    };
  }
}
