import type { Tool, CallToolResult } from '@modelcontextprotocol/server';
import {
  getChenzyDocumentTool,
  handleGetChenzyDocument,
} from './get-chenzy-document.js';
import {
  getChenzyCodeBlockTool,
  handleGetChenzyCodeBlock,
} from './get-chenzy-code-block.js';
import {
  getComponentApiTool,
  handleGetComponentApi,
} from './get-component-api.js';
import {
  getComponentFileListTool,
  handleGetComponentFileList,
} from './get-component-file-list.js';
import { getFileCodeTool, handleGetFileCode } from './get-file-code.js';
import {
  getFunctionCodeTool,
  handleGetFunctionCode,
} from './get-function-code.js';

/** 所有工具的定义 */
export const tools: Tool[] = [
  getChenzyDocumentTool,
  getChenzyCodeBlockTool,
  getComponentApiTool,
  getComponentFileListTool,
  getFileCodeTool,
  getFunctionCodeTool,
];

/** 工具名称到处理器的映射 */
export const toolHandlers: Record<
  string,
  (args: Record<string, unknown>) => Promise<CallToolResult>
> = {
  [getChenzyDocumentTool.name]: handleGetChenzyDocument,
  [getChenzyCodeBlockTool.name]: handleGetChenzyCodeBlock,
  [getComponentApiTool.name]: handleGetComponentApi,
  [getComponentFileListTool.name]: handleGetComponentFileList,
  [getFileCodeTool.name]: handleGetFileCode,
  [getFunctionCodeTool.name]: handleGetFunctionCode,
};
