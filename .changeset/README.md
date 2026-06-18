# Changesets

本目录由 [changesets](https://github.com/changesets/changesets) 管理 monorepo 各包的版本与 CHANGELOG。

## 用法

改动需要发版时，运行：

```bash
pnpm changeset
```

按提示选择受影响的包与升级类型（major / minor / patch），写一句变更说明，会在此目录生成一个 markdown 文件，随 PR 一起提交。

合并后由维护者运行 `pnpm version-packages` 消费这些 changeset、更新版本号与 CHANGELOG，再 `pnpm release` 发布。

`@chenzy-design/docs` 为私有文档站，已在 `config.json` 的 `ignore` 中排除。
