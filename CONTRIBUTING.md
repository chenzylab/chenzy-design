# Contributing / 贡献指南

**English** · [简体中文](#简体中文)

Thanks for your interest in contributing to chenzy-design!

## Workflow

All changes land through **pull requests** — the `main` branch is protected and does **not** accept direct pushes. Every PR requires a passing CI run and a maintainer review approval before it can be merged.

1. **Fork & branch** — fork the repo (or create a feature branch off `main` if you have write access). Name it like `feat/...`, `fix/...`, `docs/...`.
2. **Set up**
   ```bash
   pnpm install
   git config core.hooksPath .githooks
   pnpm build:tokens
   ```
3. **Make your change** — follow [`AGENTS.md`](./AGENTS.md) and the specs in [`specs/`](./specs).
4. **Verify locally**
   ```bash
   pnpm verify   # lint + typecheck + test + build
   ```
   For visual changes, also run `pnpm test:visual`.
5. **Add a changeset** if your change affects a published package: `pnpm changeset`.
6. **Commit** using Conventional Commits. Messages **must not contain any AI/assistant references** — enforced by `.githooks/commit-msg`.
7. **Open a PR against `main`.** CI must pass and a maintainer must approve before merge.

## Releases

Versioning is automated via Changesets. The six published packages (`core` / `icons` / `locale` / `tokens` / `svelte` / `unocss-preset`) are a **fixed lockstep group** — always the same version. Maintainers merge the auto-generated "Version Packages" PR to publish.

---

## 简体中文

感谢你有兴趣为 chenzy-design 贡献！

### 流程

所有改动都通过 **Pull Request** 合入——`main` 分支受保护，**不接受**直接推送。每个 PR 必须 CI 通过 + 维护者 review 批准后才能合并。

1. **Fork 与建分支**——fork 仓库（有写权限则从 `main` 建特性分支），命名如 `feat/...`、`fix/...`、`docs/...`。
2. **初始化**
   ```bash
   pnpm install
   git config core.hooksPath .githooks
   pnpm build:tokens
   ```
3. **修改**——遵循 [`AGENTS.md`](./AGENTS.md) 与 [`specs/`](./specs) 的组件规格。
4. **本地校验**
   ```bash
   pnpm verify   # lint + typecheck + test + build
   ```
   涉及外观改动的另跑 `pnpm test:visual`。
5. **加 changeset**（若改动影响已发布的包）：`pnpm changeset`。
6. **提交**用 Conventional Commits。信息**不得含任何 AI/助手字样**——由 `.githooks/commit-msg` 强制。
7. **对 `main` 开 PR**。CI 通过 + 维护者批准后合并。

### 发版

版本由 Changesets 自动管理。六个发布包（`core` / `icons` / `locale` / `tokens` / `svelte` / `unocss-preset`）是 **fixed 锁步组**——始终同一版本号。维护者合并自动生成的 "Version Packages" PR 即发布。
