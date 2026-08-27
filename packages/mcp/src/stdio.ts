#!/usr/bin/env node
/**
 * chenzy-design MCP Server — stdio 入口。
 * 注意：连接后不要输出任何内容到 stdout/stderr，会干扰 JSON-RPC 通信。
 * serveStdio 按连接选择协议年代（同一工厂同时服务 2025-era 与 2026-07-28 客户端）。
 */
import { serveStdio } from '@modelcontextprotocol/server/stdio';
import { createMCPServer } from './server.js';

try {
  const handle = serveStdio(() => createMCPServer());

  const shutdown = () => {
    void handle.close().then(() => process.exit(0));
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
} catch (error) {
  process.stderr.write(
    `chenzy-design MCP Server (stdio) 启动失败: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
}
