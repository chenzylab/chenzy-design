---
name: chenzy-design-guide
description: 使用 chenzy-design（Svelte 5 组件库）的完整指南，包括 MCP 工具使用流程、常见模式、最佳实践。当你需要查询 chenzy-design / @chenzy-design 组件、生成 Svelte 组件代码或解决使用问题时，请使用此技能。
---

# chenzy-design 使用指南

此 Skill 帮助你高效使用 chenzy-design 组件库（Svelte 5，对标 Semi Design）完成常见开发任务。

## 文件说明

### WORKFLOWS.md

**内容**：使用 chenzy-design MCP 工具的完整工作流程。

**包含**：
- MCP 工具概览：`get_chenzy_document`、`get_chenzy_code_block`、`get_component_api`、`get_component_file_list`、`get_file_code`、`get_function_code` 六个工具的功能和使用场景
- 基础查询流程：选组件 → 查 API → 看用法 demo → 读源码实现的推荐路径
- 分层查询策略：svelte 渲染层（.svelte）与 core headless 逻辑层（.ts）怎么分别查

**何时使用**：需要查询组件文档、了解组件 API、实现某个具体功能但不确定如何下手时。

### BEST_PRACTICES.md

**内容**：使用 chenzy-design 组件的最佳实践和注意事项。

**包含**：
- 安装与引入方式（tokens.css / unocss-preset / 组件 import）
- Svelte 5 runes 心智与本库 API 惯例
- **受控组件不用 `bind:`**（最容易踩的坑）
- 主题定制、暗色模式、i18n、a11y

**何时使用**：需要确保代码符合本库惯例、解决组件使用中的疑难问题时。

## 快速导航

| 需求 | 查看 |
|------|------|
| 如何使用 MCP 工具查询组件 | [WORKFLOWS.md](WORKFLOWS.md) |
| 组件使用的最佳实践 | [BEST_PRACTICES.md](BEST_PRACTICES.md) |

## 前置条件

使用此技能前，请确保已配置 chenzy-design MCP：

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
