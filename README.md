# chenzy-design

**English** · [简体中文](./README.zh-CN.md)

[![CI](https://github.com/chenzylab/chenzy-design/actions/workflows/ci.yml/badge.svg)](https://github.com/chenzylab/chenzy-design/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@chenzy-design/svelte.svg)](https://www.npmjs.com/package/@chenzy-design/svelte)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

A high-quality Svelte component library benchmarked against Semi Design. Accessible · Themeable · i18n · Multi-framework-ready · Performance-benched · AI-friendly.

> Architecture & conventions: [`AGENTS.md`](./AGENTS.md). Requirement specs: [`specs/`](./specs). Runbooks: [`.claude/skills/`](./.claude/skills).

📖 Live docs: <https://chenzylab.github.io/chenzy-design/>

## Installation

```bash
pnpm add @chenzy-design/svelte @chenzy-design/tokens
```

```svelte
<!-- App entry (e.g. +layout.svelte): import the design-token CSS — required, or components render unstyled -->
<script>
  import '@chenzy-design/tokens/tokens.css';
  let { children } = $props();
</script>
{@render children()}
```

```svelte
<!-- Use components on any page -->
<script lang="ts">
  import { Button, Input } from '@chenzy-design/svelte';
  let text = $state('');
</script>

<Button type="primary">Primary</Button>
<Input bind:value={text} placeholder="Type here" />
```

Requires Svelte 5 (runes). Dark mode: set `data-theme="dark"` on `<html>`. Full integration guide: [`packages/svelte/README.md`](./packages/svelte/README.md).

## Using with AI agents (MCP)

`@chenzy-design/mcp` exposes component docs, source and prop tables to any MCP-compatible client (Claude Code, Cursor, etc.), so agents can look up real API/DOM/token details instead of guessing.

```bash
claude mcp add chenzy-mcp -- npx -y @chenzy-design/mcp
```

HTTP (Streamable) mode is also available: `npx --package=@chenzy-design/mcp -- chenzy-mcp-http --port 3000`. See the [MCP/Skills guide](./packages/docs/src/routes/(app)/guide/mcp-skills/+page.md) for the full tool list and a one-click Skills install.

## Theming

Tokens are runtime CSS variables (3 layers: global → alias → component), so theming needs no SCSS compile or npm-pack step. Three paths:

- **Scoped** — `<ConfigProvider tokens={{ 'color-primary': '#0af' }}>` injects overrides into a subtree only.
- **Visual editor** — the docs site `/dsm` page: tweak tokens with live preview across components, export a `:root{}` CSS snippet.
- **Brand pack** — `@chenzy-design/theme-cli`: `chenzy-theme init` + `chenzy-theme build` turn a `theme.config.ts` into a distributable `theme.css` (with dark-mode section). See the [Theming guide](./packages/docs/src/routes/(app)/guide/theming/+page.md).

## Tech stack

Svelte 5 · Vite · UnoCSS · pnpm monorepo · TypeScript (strict)

## Monorepo

```
packages/
  tokens/         @chenzy-design/tokens          Design tokens (source of truth, 3 layers)
  unocss-preset/  @chenzy-design/unocss-preset   token -> UnoCSS theme
  theme-cli/      @chenzy-design/theme-cli       CLI: theme config -> theme.css (brand packs)
  core/           @chenzy-design/core            Headless primitives (framework-agnostic)
  locale/         @chenzy-design/locale          i18n language packs & formatting
  icons/          @chenzy-design/icons           Icons
  svelte/         @chenzy-design/svelte          Svelte component implementation (main package)
  mcp/            @chenzy-design/mcp             MCP server: components/docs/source for AI agents
  docs/           Docs / demo site (private)
  playground/     Local scratch app (private)
```

Dependency direction: `tokens -> unocss-preset -> core -> svelte`; `icons` / `locale` are consumed by `svelte`; `mcp` reads `svelte`'s built metadata/docs.

## Development

```bash
pnpm install
git config core.hooksPath .githooks   # enable commit hooks
pnpm build:tokens     # generate tokens.css / types first
pnpm dev              # start the docs site (component demos + theme toggle)
pnpm verify           # lint + typecheck + test + build
```

### Visual regression tests

Based on vitest 4's `toMatchScreenshot` (real chromium via the playwright provider); baselines live in each component's `__screenshots__/`.

```bash
pnpm test:visual          # compare current render against baselines
pnpm test:visual:update   # update baselines after intentional visual changes
```

> Baselines carry a platform suffix (e.g. `-chromium-darwin.png`). Font antialiasing differs between macOS / Linux, so baselines are not cross-platform — they're currently generated on macOS and **not wired into the CI gate** (would need Linux/Docker-generated baselines). Used locally as a visual-regression tool.

## Contributing

Contributions go through **pull requests only** — `main` is protected and requires review + passing CI before merge. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the workflow.

- Commit messages follow Conventional Commits and must not contain any AI/assistant references (enforced by `.githooks/commit-msg`, see AGENTS.md §7.1).
- Changes that need a release must include a changeset: `pnpm changeset`. Maintainers run `pnpm version-packages` -> `pnpm release`.
- Dependency updates are opened weekly by **Dependabot**; PRs are auto-labeled by path via the **labeler**.

## Status

- [x] M0 foundation: monorepo, 3-layer token system (dark + reduced-motion), unocss-preset, core primitives, locale (zh_CN / en_US), CI / quality gates
- [x] **84 components** implemented (basic / input / navigation / display / feedback / others), with meta, tokens, a11y
- [x] Docs site (SvelteKit SSG): auto-generated API tables, debug panel, usage scenarios, dark mode, Pagefind search -> [visit online](https://chenzylab.github.io/chenzy-design/)
- [x] MCP server (`@chenzy-design/mcp`, SDK v2, serves both 2026-07-28 and legacy 2025-era clients): exposes component docs/source/code blocks to AI agents over stdio or HTTP
- [x] npm published: 7 `@chenzy-design/*` packages in a fixed changeset group, plus `@chenzy-design/mcp` versioned independently
