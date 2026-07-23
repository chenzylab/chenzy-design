<script>
  import { base } from '$app/paths';
</script>

# MCP / Skills

chenzy-design 提供两种 AI 集成方式，让 AI 编程助手（Claude Code、Cursor、Trae 等）准确理解和使用本组件库：

- **MCP Server**（`@chenzy-design/mcp`）：基于 [Model Context Protocol](https://modelcontextprotocol.io/) 的服务，AI 可实时查询组件文档、API 表与源码实现。
- **Agent Skills**：一组指导 AI 使用本库的技能文档（工作流 + 最佳实践），配合 MCP 使用效果最佳。

## MCP Server

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

### 配置

**Claude Code**：

```bash
claude mcp add chenzy-mcp -- npx -y @chenzy-design/mcp
```

**Cursor / Trae / Windsurf / VS Code** 等支持 MCP 的客户端，在其 MCP 配置文件中添加：

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

需要以 HTTP（Streamable）方式部署时：

```bash
npx -y @chenzy-design/mcp chenzy-mcp-http --port 3000
```

端点：`POST /mcp`（消息）、`GET /mcp`（SSE 推送）、`GET /health`（健康检查）。

### 缓存

查询结果缓存在 `~/.chenzy-mcp/cache`（按解析后的实际版本号为 key，latest 每天重新解析一次）。需要强制刷新时删除该目录即可。

## Agent Skills

Skills 是三个 markdown 文件（SKILL.md / WORKFLOWS.md / BEST_PRACTICES.md），告诉 AI 如何用 MCP 工具查询本库、以及本库的关键使用约定（Svelte 5 runes、受控组件不用 `bind:` 等）。

<a href="{base}/chenzy-design-skills.zip" download>下载 chenzy-design-skills.zip</a>

解压到对应目录即可生效：

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
