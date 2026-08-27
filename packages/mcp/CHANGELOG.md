# @chenzy-design/mcp

## 1.0.1

### Patch Changes

- ef85544: fix: 修复 npx 默认调用无法解析可执行入口的问题

  `bin` 字段两个入口（`chenzy-mcp`/`chenzy-mcp-http`）均与包名不一致，导致
  `npx -y @chenzy-design/mcp`（不带参数，文档配置示例的标准用法）报错
  `could not determine executable to run`——npm/npx 规则：多 bin 包只有当
  某个 bin 名与包名去 scope 后完全一致时，才能被 `npx` 自动选中为默认入口
  （对照 `@douyinfe/semi-mcp` 验证）。stdio 默认入口改名为 `mcp`（对齐包名
  `@chenzy-design/mcp` 去 scope 后的 `mcp`），HTTP 入口保留
  `chenzy-mcp-http`，需用 `npx --package=@chenzy-design/mcp -- chenzy-mcp-http`
  显式调用。

## 1.0.0

### Major Changes

- feat: @chenzy-design/mcp 首个正式版本发布
