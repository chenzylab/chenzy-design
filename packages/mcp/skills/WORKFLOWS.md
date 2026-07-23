# chenzy-design MCP 工具工作流

## 工具概览

| 工具 | 功能 | 何时用 |
|------|------|--------|
| `get_chenzy_document` | 组件完整文档（含内联 demo 源码）/ 组件列表 / changelog 分页 | 不知道有哪些组件、想看完整用法与场景示例 |
| `get_chenzy_code_block` | 按索引取大文档中被隐藏的代码块 | 文档返回了「代码块 #N 已隐藏」占位符时 |
| `get_component_api` | 单组件 API 精准表：props/events/slots/methods/tokens/a11y/examples | **查 API 首选**——比整篇文档省大量 token |
| `get_component_file_list` | 组件在两个包中的源码文件列表 | 需要理解/扩展组件实现前先看有哪些文件 |
| `get_file_code` | 文件源码（长文件自动折叠函数体只留结构） | 看某个文件的整体结构 |
| `get_function_code` | 按函数名抽取完整实现 | 深入某个具体函数 |

## 推荐流程

### 1. 不知道用什么组件

`get_chenzy_document`（不传参数）→ 返回全部组件列表（名称/分类/一句话简介），从中选定组件。

### 2. 查组件 API（最高频）

**优先用 `get_component_api`**，它直接从组件元数据返回结构化 API 表，token 消耗远小于整篇文档：

- `get_component_api({ componentName: "Table" })` — 全部 API
- `get_component_api({ componentName: "Table", section: "props" })` — 只看 props
- 子组件也能直接查：`get_component_api({ componentName: "ButtonGroup" })`

组件名大小写/连字符不敏感：`Button`、`button`、`date-picker`、`DatePicker` 都可以。

### 3. 看用法与 demo

`get_chenzy_document({ componentName: "Table" })` → 完整 markdown 文档，demo 以 ```` ```svelte ```` 代码块内联。

大文档（如 Table）的代码块会被占位符隐藏，按占位符提示用 `get_chenzy_code_block({ componentName, codeBlockIndex })` 逐个取需要的。

### 4. 理解实现（扩展组件 / 排查行为）

chenzy-design 是双层架构，源码查询按层走：

- **svelte 渲染层**（`@chenzy-design/svelte`）：`.svelte` 组件源码、context、meta——DOM 结构、事件绑定、样式类在这里。
- **core headless 逻辑层**（`@chenzy-design/core`）：纯 TS 状态与算法（排序、分页、树形展开、浮层定位等）——行为逻辑在这里，框架无关。

流程：

1. `get_component_file_list({ componentName: "Table" })` → 两层文件清单
2. `get_file_code({ filePath: "@chenzy-design/core/src/table.ts" })` → 文件结构（≥500 行自动折叠函数体）
3. `get_function_code({ filePath: "...", functionName: "toggleSort" })` → 具体函数完整实现

`.svelte` 文件同样支持：函数体折叠只作用于 `<script>` 块，模板保留；`get_function_code` 会在 script 块中查找函数。

### 5. 版本与缓存

- 所有工具支持 `version` 参数锁定 `@chenzy-design/svelte` 版本，默认 latest（按天解析实际版本号）。
- 数据从 unpkg/npmmirror 双源获取，缓存在 `~/.chenzy-mcp/cache`，可整目录删除以强制刷新。

### 6. 查更新记录

`get_chenzy_document({ componentName: "changelog-1" })` → 第 1 页（最新），changelog-2 下一页，每页 300 行。
