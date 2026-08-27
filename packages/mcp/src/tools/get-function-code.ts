/**
 * get_function_code — 获取文件中指定函数的完整实现。对齐 semi-mcp（oxc AST）。
 * .svelte 文件抽 <script> 块后同样按函数名抽取（Svelte 5 组件的事件处理/派生
 * 逻辑都是 script 内普通函数，AST 形态与 ts 无异）。
 */
import type { Tool, CallToolResult } from '@modelcontextprotocol/server';
import { fetchFileContent } from '../utils/fetch.js';
import {
  extractFunction,
  getFunctionNames,
} from '../utils/remove-function-body.js';
import { extractScriptBlocks } from '../utils/svelte-script.js';
import { SVELTE_PACKAGE, CORE_PACKAGE } from '../utils/components-json.js';
import { parseFilePath } from './get-file-code.js';

export const getFunctionCodeTool: Tool = {
  name: 'get_function_code',
  description: `获取 chenzy-design 组件文件中指定函数的完整实现。

支持的函数类型：
- 普通函数声明: function foo() {}
- 箭头函数: const foo = () => {}
- 类方法与 getter/setter

.svelte 文件会在其 <script> 块中查找函数。

路径格式示例：
- ${CORE_PACKAGE}/src/table.ts
- ${SVELTE_PACKAGE}/dist/table/Table.svelte`,
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: `文件完整路径，如 ${CORE_PACKAGE}/src/table.ts`,
      },
      functionName: { type: 'string', description: '函数名称' },
      version: { type: 'string', description: '版本号，默认 latest' },
    },
    required: ['filePath', 'functionName'],
  },
};

export async function handleGetFunctionCode(
  args: Record<string, unknown>,
): Promise<CallToolResult> {
  const filePath = args?.filePath as string | undefined;
  const functionName = args?.functionName as string | undefined;
  const version = (args?.version as string | undefined) || 'latest';

  if (!filePath) {
    return {
      content: [{ type: 'text', text: '错误：请提供文件路径 (filePath)' }],
      isError: true,
    };
  }
  if (!functionName) {
    return {
      content: [{ type: 'text', text: '错误：请提供函数名称 (functionName)' }],
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

    // .svelte 文件在 script 块里找；.ts/.js 直接找
    const sources = filePath.endsWith('.svelte')
      ? extractScriptBlocks(content).map((b) => b.content)
      : [content];

    let functionCode: string | null = null;
    for (const src of sources) {
      functionCode = extractFunction(src, functionName);
      if (functionCode) break;
    }

    if (!functionCode) {
      const allFunctions = sources.flatMap((src) => {
        try {
          return getFunctionNames(src);
        } catch {
          return [];
        }
      });
      const hint = filePath.endsWith('.svelte')
        ? '\n\n提示：该函数可能在模板中内联，或位于 @chenzy-design/core 的对应文件，请对 core 包重试。'
        : '';
      return {
        content: [
          {
            type: 'text',
            text:
              [
                `未找到函数 "${functionName}"`,
                '',
                `文件: ${filePath}`,
                `版本: ${version}`,
                '',
                `文件中可用的函数/方法 (共 ${allFunctions.length} 个):`,
                ...allFunctions.map((name) => `  - ${name}`),
              ].join('\n') + hint,
          },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: [
            `文件: ${filePath}`,
            `函数: ${functionName}`,
            `版本: ${version}`,
            '',
            '='.repeat(60),
            '',
            functionCode,
          ].join('\n'),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `获取函数代码失败: ${error instanceof Error ? error.message : String(error)}\n\n文件路径: ${filePath}\n函数名: ${functionName}\n版本: ${version}`,
        },
      ],
      isError: true,
    };
  }
}
