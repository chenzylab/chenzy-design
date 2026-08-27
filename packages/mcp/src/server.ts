/**
 * chenzy-design MCP Server 共享配置。
 * 导出 MCP 服务器的配置和处理器注册逻辑，被 stdio 和 HTTP 两种入口共用。
 * createMCPServer 是工厂函数：每次调用返回全新实例，供 serveStdio / createMcpHandler 按连接或请求各自创建实例。
 */
import { Server } from '@modelcontextprotocol/server';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tools, toolHandlers } from './tools/index.js';
import {
  getComponentsManifest,
  renderComponentList,
} from './utils/components-json.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getPackageVersion(): string {
  for (const rel of ['../package.json', '../../package.json']) {
    try {
      const pkg = JSON.parse(readFileSync(join(__dirname, rel), 'utf-8')) as {
        version?: string;
      };
      if (pkg.version) return pkg.version;
    } catch {
      // 尝试下一个路径
    }
  }
  return '0.0.0';
}

export function createMCPServer(): Server {
  const server = new Server(
    { name: 'chenzy-mcp', version: getPackageVersion() },
    { capabilities: { tools: {}, resources: {} } },
  );

  server.setRequestHandler('tools/list', async () => ({ tools }));

  server.setRequestHandler('tools/call', async (request) => {
    const { name, arguments: args } = request.params;
    const handler = toolHandlers[name];
    if (!handler) throw new Error(`未知的工具: ${name}`);
    return handler(args || {});
  });

  server.setRequestHandler('resources/list', async () => ({
    resources: [
      {
        uri: 'chenzy://components',
        name: 'chenzy-design Components',
        description: 'chenzy-design 组件列表',
        mimeType: 'text/plain',
      },
    ],
  }));

  server.setRequestHandler('resources/read', async (request) => {
    const { uri } = request.params;
    if (uri.startsWith('chenzy://components')) {
      try {
        const manifest = await getComponentsManifest('latest');
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: renderComponentList(manifest),
            },
          ],
        };
      } catch (error) {
        return {
          contents: [
            {
              uri,
              mimeType: 'text/plain',
              text: `获取组件列表失败: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    }
    throw new Error(`未知的资源 URI: ${uri}`);
  });

  return server;
}
