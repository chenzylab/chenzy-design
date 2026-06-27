---
"@chenzy-design/svelte": patch
---

发布包不再包含测试与夹具产物：svelte-package 会把 src 下的 `*.test.*` / `*Fixture.svelte` / `test-utils/` / `*.bench.*` 一并编译进 dist（0.2.0 误含 529 个此类文件）。新增 `clean-dist.mjs` 在打包后清理，显著减小包体积。
