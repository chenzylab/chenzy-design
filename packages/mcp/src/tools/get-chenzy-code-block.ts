/**
 * get_chenzy_code_block — 按索引获取组件文档中被占位符隐藏的代码块。
 * 对齐 semi-mcp get_semi_code_block。
 */
import type { Tool, CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { extractCodeBlocks, getComponentDocument } from './get-chenzy-document.js';

export const getChenzyCodeBlockTool: Tool = {
  name: 'get_chenzy_code_block',
  description:
    '获取 chenzy-design 组件文档中指定索引的代码块。当 get_chenzy_document 返回的大文档中代码块被占位符隐藏时，用此工具传入 componentName 和 codeBlockIndex（从 1 开始）获取具体代码。',
  inputSchema: {
    type: 'object',
    properties: {
      componentName: { type: 'string', description: '组件名称，如 Button' },
      codeBlockIndex: { type: 'number', description: '代码块索引，从 1 开始' },
      version: { type: 'string', description: '版本号，默认 latest' },
    },
    required: ['componentName', 'codeBlockIndex'],
  },
};

export async function handleGetChenzyCodeBlock(args: Record<string, unknown>): Promise<CallToolResult> {
  const componentName = args?.componentName as string | undefined;
  const codeBlockIndex = args?.codeBlockIndex as number | undefined;
  const version = (args?.version as string | undefined) || 'latest';

  if (!componentName) {
    return { content: [{ type: 'text', text: '错误: 必须提供 componentName 参数' }], isError: true };
  }
  if (typeof codeBlockIndex !== 'number' || codeBlockIndex < 1 || !Number.isInteger(codeBlockIndex)) {
    return { content: [{ type: 'text', text: '错误: codeBlockIndex 必须是大于等于 1 的整数' }], isError: true };
  }

  try {
    const doc = await getComponentDocument(componentName, version);
    if (!doc) {
      return {
        content: [{ type: 'text', text: `错误: 未找到组件 "${componentName}" 的文档 (版本 ${version})` }],
        isError: true,
      };
    }

    const blocks = extractCodeBlocks(doc.content);
    if (codeBlockIndex > blocks.length) {
      return {
        content: [
          { type: 'text', text: `错误: 代码块索引 ${codeBlockIndex} 超出范围，文档共有 ${blocks.length} 个代码块` },
        ],
        isError: true,
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: `组件: ${doc.metaName}\n代码块: #${codeBlockIndex} / ${blocks.length}\n\n${blocks[codeBlockIndex - 1]}`,
        },
      ],
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `获取代码块失败: ${error instanceof Error ? error.message : String(error)}` }],
      isError: true,
    };
  }
}
