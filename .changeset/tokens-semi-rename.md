---
"@chenzy-design/tokens": major
"@chenzy-design/svelte": patch
"@chenzy-design/unocss-preset": patch
---

对齐 Semi tokens（第 2 步·语义重命名，**破坏性**）：全局 scale token 改用 Semi 语义名（值不变）。

迁移映射：
- **spacing**：`spacing-1/2/3/4/5/6/8/10` → `spacing-extra-tight/tight/base-tight/base/base-loose/loose/extra-loose/super-loose`（`spacing-12` 保留，Semi 无 48px 档）。
- **font-size**：`font-size-1/2/3/4/5/6` → `font-size-small/regular/header-6/header-4/header-3/header-1`。
- **radius**：`radius-1/2/3/full` → `border-radius-small/medium/large/full`。
- **font-weight**：`font-weight-semibold` → `font-weight-bold`（值同 600）。

全库 717 处 `var(--cd-...)` 引用经 codemod 同步替换；uno-theme.ts、docs token 分类器与 tokens-detail.json 一并更新。值零变化，6 个视觉回归基线零像素偏移。消费方若直接引用旧 `--cd-spacing-1` 等需按映射改名。
