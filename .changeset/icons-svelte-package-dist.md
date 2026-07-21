---
"@chenzy-design/icons": patch
"@chenzy-design/icons-lab": patch
---

fix(icons,icons-lab): 用 svelte-package 编译产出 dist，对齐 svelte 主包发布结构

原 build 仅 svelte-check（不产 dist），exports 却指向 `./dist/index.d.ts` 且 svelte/default 发 `./src`，导致 types 字段死链（消费方拿不到类型声明）。改为 `svelte-package -i src -o dist` 真正编译产出 dist（含 index.js + index.d.ts），svelte/default/types 全部指向 dist，与 svelte 主包一致；typecheck 保留独立脚本。
