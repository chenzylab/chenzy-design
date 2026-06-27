# chenzy-design

对标 Semi Design 的高质量 Svelte 组件库。无障碍 · 主题化 · i18n · 多框架适配 · 性能基准 · AI 友好。

> 架构与约定见 [`AGENTS.md`](./AGENTS.md)。需求规格见 [`specs/`](./specs)。执行手册见 [`.claude/skills/`](./.claude/skills)。

📖 在线文档：<https://chenzylab.github.io/chenzy-design/>

## 安装使用

```bash
pnpm add @chenzy-design/svelte @chenzy-design/tokens
```

```svelte
<!-- 应用入口（如 +layout.svelte）引入设计令牌 CSS —— 必须，否则组件无样式 -->
<script>
  import '@chenzy-design/tokens/tokens.css';
  let { children } = $props();
</script>
{@render children()}
```

```svelte
<!-- 任意页面使用组件 -->
<script lang="ts">
  import { Button, Input } from '@chenzy-design/svelte';
  let text = $state('');
</script>

<Button type="primary">主要按钮</Button>
<Input bind:value={text} placeholder="请输入" />
```

要求 Svelte 5（runes）。暗色模式：给 `<html>` 设 `data-theme="dark"`。完整接入见 [`packages/svelte/README.md`](./packages/svelte/README.md)。

## 技术栈
Svelte 5 · Vite · UnoCSS · pnpm monorepo · TypeScript(strict)

## Monorepo
```
packages/
  tokens/         @chenzy-design/tokens          设计令牌（源真相，三层）
  unocss-preset/  @chenzy-design/unocss-preset   token → UnoCSS theme
  core/           @chenzy-design/core            headless 原语（框架无关）
  locale/         @chenzy-design/locale          i18n 语言包与格式化
  icons/          @chenzy-design/icons           图标
  svelte/         @chenzy-design/svelte          Svelte 组件实现（主包）
  docs/           文档/演示站（私有）
```
依赖方向：`tokens → unocss-preset → core → svelte`；`icons`/`locale` 被 `svelte` 依赖。

## 开发
```bash
pnpm install
git config core.hooksPath .githooks   # 启用提交钩子（拦截违规 commit message）
pnpm build:tokens     # 先生成 tokens.css / 类型
pnpm dev              # 启动文档站（演示组件 + 主题切换）
pnpm verify           # lint + typecheck + test + build
```

## 提交与发版
- 提交信息遵循 Conventional Commits，且**不得包含任何 AI/助手字样**（由 `.githooks/commit-msg` 强制，规则见 AGENTS.md §7.1）。
- 需发版的改动附 changeset：`pnpm changeset`；维护者 `pnpm version-packages` → `pnpm release`。
- 依赖更新由 **Dependabot** 每周自动开 PR；PR 由 **labeler** 按改动路径自动打标签。

## 当前进度
- [x] M0 基建：monorepo、tokens 三层体系（暗色 + reduced-motion）、unocss-preset、core 原语、locale（zh_CN / en_US）、CI/质量门禁
- [x] **69 个组件**实现（基础 / 输入 / 导航 / 展示 / 反馈 / 其他），含 meta、token、a11y
- [x] 文档站（SvelteKit SSG）：API 表自动生成、调试面板、使用场景、暗色模式、Pagefind 搜索 → [在线访问](https://chenzylab.github.io/chenzy-design/)
- [x] npm 发布：6 个包 `@chenzy-design/*`，Changesets 自动化版本管理
