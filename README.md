# chenzy-design

**English** · [简体中文](./README.zh-CN.md)

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
  docs/           Docs / demo site (private)
```

Dependency direction: `tokens -> unocss-preset -> core -> svelte`; `icons` / `locale` are consumed by `svelte`.

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

> Baselines carry a platform suffix (e.g. `-chromium-darwin.png`). Font antialiasing differs between macOS / Linux, so baselines are not cross-platform and are not wired into the CI gate. Used locally as a visual-regression tool.

## Contributing

Contributions go through **pull requests only** — `main` is protected and requires review + passing CI before merge. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the workflow.

- Commit messages follow Conventional Commits and must not contain any AI/assistant references (enforced by `.githooks/commit-msg`, see AGENTS.md §7.1).
- Changes that need a release must include a changeset: `pnpm changeset`. Maintainers run `pnpm version-packages` -> `pnpm release`.
- Dependency updates are opened weekly by **Dependabot**; PRs are auto-labeled by path via the **labeler**.

## Status

- [x] M0 foundation: monorepo, 3-layer token system (dark + reduced-motion), unocss-preset, core primitives, locale (zh_CN / en_US), CI / quality gates
- [x] **69 components** implemented (basic / input / navigation / display / feedback / others), with meta, tokens, a11y
- [x] Docs site (SvelteKit SSG): auto-generated API tables, debug panel, usage scenarios, dark mode, Pagefind search -> [visit online](https://chenzylab.github.io/chenzy-design/)
- [x] npm published: 6 `@chenzy-design/*` packages, automated versioning via Changesets (fixed lockstep versions)
