#!/usr/bin/env node
/**
 * chenzy-design MCP Server — stdio 入口。
 * 注意：连接后不要输出任何内容到 stdout/stderr，会干扰 JSON-RPC 通信。
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMCPServer } from './server.js';

async function main() {
  const server = createMCPServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  process.stderr.write(`chenzy-design MCP Server (stdio) 启动失败: ${error instanceof Error ? error.message : String(error)}\n`);
  process.exit(1);
});
