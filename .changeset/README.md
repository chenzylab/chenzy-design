# Changesets

本目录由 [changesets](https://github.com/changesets/changesets) 管理 monorepo 各包的版本与 CHANGELOG。

## 用法

改动需要发版时，运行：

```bash
pnpm changeset
```

按提示选择受影响的包与升级类型，写一句变更说明，会在此目录生成一个 markdown 文件，随 PR 一起提交。

## 版本约定（1.0.0 之前）：**禁用 major**

当前所有 public 包处于 `0.x` 阶段。SemVer 规定 major 为 0 时一切皆可变，业界惯例是把版本号整体右移一位——**breaking 走 minor，feature/fix 走 patch，永不写 major**，版本号自然维持 `<1.0.0`：

| 变更性质 | 1.0 后 | **本仓库 0.x 阶段** |
| --- | --- | --- |
| 破坏性变更（breaking / `!`） | major | **minor**（第二位 +1，如 0.4.0 → 0.5.0） |
| 新功能（feat） | minor | **patch**（第三位 +1，如 0.4.0 → 0.4.1） |
| 修复（fix） | patch | **patch** |

所以运行 `pnpm changeset` 时**只选 `minor` 或 `patch`，绝不选 `major`**——选了 major 会把 0.x 直接跳到 1.0.0，破坏 <1.0.0 约定。7 个 public 包为 `fixed` 组（统一版本），组内任一包的 bump 级别决定整组版本。等到 API 稳定、决定正式发 1.0.0 时，才由维护者显式放开 major。

合并后由维护者运行 `pnpm version-packages` 消费这些 changeset、更新版本号与 CHANGELOG，再 `pnpm release` 发布。

`@chenzy-design/docs` 为私有文档站，已在 `config.json` 的 `ignore` 中排除。
