<script>
  import { base } from '$app/paths';
  import Notice from '$lib/components/Notice.svelte';
  import SkillsWriter from '$lib/components/SkillsWriter.svelte';
</script>

# MCP / Skills

chenzy-design 提供两种 AI 集成方式，让 AI 编程助手（Claude Code、Cursor、Trae 等）准确理解和使用本组件库：

- **MCP Server**（`@chenzy-design/mcp`）：基于 [Model Context Protocol](https://modelcontextprotocol.io/) 的服务，AI 可实时查询组件文档、API 表与源码实现。
- **Agent Skills**：一组指导 AI 使用本库的技能文档（工作流 + 最佳实践），配合 MCP 使用效果最佳。

## 什么是 MCP？

Model Context Protocol（MCP）是一种标准化协议，用于连接 AI 助手与外部数据源和工具。通过 MCP，AI 助手可以动态发现和调用各种能力，而无需为每个工具单独集成。

chenzy-design MCP 为 AI 助手提供以下能力：

- **查询组件文档**：直接获取任意组件的完整文档，无需人工查找
- **精准查 API**：不读整篇文档也能拿到 props/events/slots/methods/tokens 结构化表
- **查看源码结构**：浏览组件在 svelte 渲染层与 core headless 层的源码文件
- **获取函数实现**：查看特定函数的完整代码，深入理解组件逻辑
- **版本切换**：支持查询不同版本的组件信息，适配各种项目环境

## 什么是 Skills？

Skills（技能）是一种模块化的能力扩展方式，允许 AI 助手通过添加预定义的指令和工具来增强其功能。chenzy-design Skills 帮助 AI 助手：

- **遵循最佳实践**：了解组件的正确引入方式、受控组件不用 `bind:` 等本库关键约定
- **掌握工作流程**：知道如何用 MCP 工具完成常见任务（查组件、看用法、读实现）

## MCP Server

<Notice type="warning" title="版本建议">

建议 Node.js 版本 ≥ 20。若运行时遇到依赖解析报错，参见下方[故障排除](#故障排除)。

</Notice>

### 提供的工具

| 工具 | 功能 |
| --- | --- |
| `get_chenzy_document` | 组件完整文档（含内联 demo 源码）/ 组件列表 / changelog 分页 |
| `get_chenzy_code_block` | 按索引获取大文档中被隐藏的代码块 |
| `get_component_api` | 单组件 API 精准表（props/events/slots/methods/tokens/a11y），查 API 首选，省 token |
| `get_component_file_list` | 组件在 svelte 渲染层与 core headless 层的源码文件列表 |
| `get_file_code` | 文件源码（长文件自动折叠函数体只留结构） |
| `get_function_code` | 按函数名抽取完整实现 |

数据来自 npm 已发布的 `@chenzy-design/svelte` / `@chenzy-design/core` 包（unpkg 与 npmmirror 双源），支持 `version` 参数锁定版本。

### 安装

**Claude Code**：

```bash
claude mcp add chenzy-mcp -- npx -y @chenzy-design/mcp
```

**Claude Desktop / Cursor / Trae / Windsurf / VS Code** 等支持 MCP 的客户端，在其 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "chenzy-mcp": {
      "command": "npx",
      "args": ["-y", "@chenzy-design/mcp"]
    }
  }
}
```

### HTTP 模式（可选）

需要以 HTTP（Streamable）方式部署时，包内除默认的 stdio 入口（`mcp`）外还提供了独立的 `chenzy-mcp-http` 可执行文件。`npx -y @chenzy-design/mcp` 只会解析到默认入口，运行 `chenzy-mcp-http` 必须用 `--package=` 显式指定包名：

```bash
npx --package=@chenzy-design/mcp -- chenzy-mcp-http --port 3000
```

可选参数：

| 参数 | 说明 |
| --- | --- |
| `--port`, `-p` | 监听端口，默认 `3000` |
| `--host`, `-h` | 监听地址，逗号分隔可传多个（如 `127.0.0.1,::1`），默认 `::`（IPv6 任意地址，自动兼容 IPv4） |

端点：`POST /mcp`（消息）、`GET /health`（健康检查）。

### 缓存

查询结果缓存在 `~/.chenzy-mcp/cache`（按解析后的实际版本号为 key，latest 每天重新解析一次）。需要强制刷新时删除该目录即可。

### 故障排除

<Notice type="warning" title="oxc-parser 相关错误">

如果运行 MCP 时遇到 `oxc-parser` 或类似的依赖解析错误，这是 npm 的已知 bug。请先升级 npm 到最新版本（`npm install -g npm@latest`），然后在终端中手动全局安装一次（`npm i -g @chenzy-design/mcp`），再重新尝试配置 MCP。

</Notice>

## Agent Skills

Skills 是三个 markdown 文件（SKILL.md / WORKFLOWS.md / BEST_PRACTICES.md），告诉 AI 如何用 MCP 工具查询本库、以及本库的关键使用约定（Svelte 5 runes、受控组件不用 `bind:` 等）。

下面的安装面板可以帮助你一键安装 Skills 到你的项目中。选中你使用的编程工具，点击「添加到我的项目」，选择目标目录，即可完成安装。

<SkillsWriter />

如果你的编程工具不在列表中，或浏览器不支持一键安装，可以手动下载 <a href="{base}/chenzy-design-skills.zip" download>chenzy-design-skills.zip</a>，参考下表将压缩包解压到对应目录：

| 客户端 | 目录 |
| --- | --- |
| Claude Code | `.claude/skills/` |
| Cursor | `.cursor/skills/` |
| Trae | `.trae/skills/` |
| 通用标准 | `.skills/` |

解压后目录结构：

```text
.claude/skills/
└── chenzy-design-guide/
    ├── SKILL.md
    ├── WORKFLOWS.md
    └── BEST_PRACTICES.md
```

Skills 也随 `@chenzy-design/mcp` npm 包发布（包内 `skills/` 目录），可从 `node_modules/@chenzy-design/mcp/skills/` 直接复制。

## 相关资源

- [Model Context Protocol 文档](https://modelcontextprotocol.io)
- [Claude Agent Skills 文档](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
