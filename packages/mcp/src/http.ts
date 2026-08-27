#!/usr/bin/env node

/**
 * chenzy-design MCP Server - HTTP (Streamable) 入口
 *
 * 使用 Streamable HTTP 作为传输层的 MCP 服务器。
 * createMcpHandler 原生无状态：每个请求由同一 factory 构建全新 server 实例处理，
 * 同时服务 2026-07-28（per-request）与 2025-era（stateless 兼容）两代客户端，
 * 无需再手写 session 管理。
 *
 * 启动方式: node dist/http.js [--port PORT] [--host HOST]
 * 默认端口: 3000
 * 默认主机: :: (监听所有网络接口)
 */

import { createServer, IncomingMessage, ServerResponse } from 'http';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { createMcpHandler } from '@modelcontextprotocol/server';
import { createMCPServer, getPackageVersion } from './server.js';

// 解析命令行参数
function parseArgs(): { port: number; hosts: string[] } {
  const args = process.argv.slice(2);
  let port = 3000;
  let hosts: string[] = []; // 默认监听 IPv4 和 IPv6

  for (let i = 0; i < args.length; i++) {
    const next = args[i + 1];
    if ((args[i] === '--port' || args[i] === '-p') && next) {
      port = parseInt(next, 10);
      i++;
    } else if ((args[i] === '--host' || args[i] === '-h') && next) {
      hosts = next.split(',').map((h) => h.trim());
      i++;
    } else if (args[i] === '--help') {
      console.log(`
chenzy-design MCP Server (Streamable HTTP)

Usage: chenzy-mcp-http [options]

Options:
  --port, -p PORT       指定监听端口 (默认: 3000)
  --host, -h HOSTS      指定监听地址，多个地址用逗号分隔 (默认: ::)
                        :: 表示 IPv6 任意地址（自动支持 IPv4）
                        0.0.0.0 表示 IPv4 任意地址
                        ::1 表示 IPv6 本地回环
                        127.0.0.1 表示 IPv4 本地回环
                        注意: 如果同时指定 0.0.0.0 和 ::，只使用 ::
  --help                显示帮助信息

Endpoints:
  POST /mcp         MCP 消息端点 (Streamable HTTP)
  GET  /health      健康检查端点
`);
      process.exit(0);
    }
  }

  return { port, hosts };
}

async function main() {
  const { port, hosts } = parseArgs();
  const version = getPackageVersion();

  // 智能处理 hosts
  let processedHosts = hosts;
  const hasIPv4All = hosts.includes('0.0.0.0');
  const hasIPv6All = hosts.includes('::');

  if (hasIPv4All && hasIPv6All) {
    processedHosts = hosts.filter((h) => h !== '0.0.0.0');
  }

  if (processedHosts.length === 0) {
    processedHosts = ['::'];
  }

  console.log(`[${new Date().toISOString()}] MCP 服务器已启动`);

  const mcpHandler = createMcpHandler(() => createMCPServer(), {
    onerror: (error) => {
      console.error(
        `[${new Date().toISOString()}] MCP 请求处理失败:`,
        error.message,
      );
    },
  });
  const handleMcpRequest = toNodeHandler(mcpHandler);

  // 创建 HTTP 服务器
  const httpServer = createServer(
    async (req: IncomingMessage, res: ServerResponse) => {
      const url = new URL(req.url || '/', `http://${req.headers.host}`);

      // 设置 CORS 头
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      // 处理 OPTIONS 预检请求
      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }

      // 健康检查端点
      if (url.pathname === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            status: 'ok',
            name: 'chenzy-mcp',
            version,
            transport: 'streamable-http',
          }),
        );
        return;
      }

      // MCP 端点
      if (url.pathname === '/mcp') {
        await handleMcpRequest(
          req as IncomingMessage & { method: string; url: string },
          res,
        );
        return;
      }

      // 根路径
      if (url.pathname === '/' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify(
            {
              name: 'chenzy-mcp',
              version,
              description: 'chenzy-design MCP Server (Streamable HTTP)',
              transport: 'streamable-http',
              endpoints: {
                mcp: { POST: '/mcp' },
                health: '/health',
              },
            },
            null,
            2,
          ),
        );
        return;
      }

      // 404
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Unknown endpoint' }));
    },
  );

  const servers: ReturnType<typeof createServer>[] = [];
  let startedCount = 0;

  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║        chenzy-design MCP Server (Streamable HTTP) v${version.padEnd(10)}        ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                              ║`);

  const formatHost = (h: string): string => {
    if (h === '::') return ':: (所有 IPv6)';
    if (h === '0.0.0.0') return '0.0.0.0 (所有 IPv4)';
    if (h === '::1') return '::1 (IPv6 本地)';
    if (h === '127.0.0.1') return '127.0.0.1 (IPv4 本地)';
    return h;
  };

  processedHosts.forEach((host, index) => {
    httpServer.on('error', (err) => {
      const displayHost = formatHost(host);
      console.log(`║  ✗ 端点 ${index + 1}: http://${displayHost}:${port}`);
      console.error(
        `[${new Date().toISOString()}] 启动失败 [${host}]:`,
        err.message,
      );
    });

    httpServer.listen(port, host, () => {
      startedCount++;
      const displayHost = formatHost(host);
      console.log(`║  ✓ 端点 ${index + 1}: http://${displayHost}:${port}`);

      if (startedCount === processedHosts.length) {
        console.log(`║                                                              ║
║  可用端点:                                                   ║
║    POST   /mcp      发送 MCP 请求                            ║
║    GET    /health   健康检查                                 ║
╚══════════════════════════════════════════════════════════════════════╝
`);
        console.log(
          `[${new Date().toISOString()}] 所有服务器已启动，监听 ${processedHosts.length} 个地址`,
        );
        console.log(
          `[${new Date().toISOString()}] 总计监听: ${processedHosts.join(', ')}`,
        );
      }
    });

    servers.push(httpServer);
  });

  const shutdown = async () => {
    console.log('\n正在关闭服务器...');

    try {
      await mcpHandler.close();
    } catch {
      // 忽略关闭错误
    }

    let closedCount = 0;
    servers.forEach((server) => {
      server.close(() => {
        closedCount++;
        if (closedCount === servers.length) {
          console.log('所有服务器已关闭');
          process.exit(0);
        }
      });
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error) => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error(
    `chenzy-design MCP Server (Streamable HTTP) 启动失败: ${errorMessage}`,
  );
  process.exit(1);
});
