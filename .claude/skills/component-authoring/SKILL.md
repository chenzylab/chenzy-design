---
name: component-authoring
description: chenzy-design 组件作者手册。当需要新建/实现任意组件时使用：定义 headless 与渲染分层、文件落点、命名、组件元数据与 DoD 自检流程。
---

# SKILL · 组件作者手册

> 实现任何组件前先读 `AGENTS.md` 和对应 `specs/components/<cat>/<Component>.spec.md`，再按本手册落地。

## 步骤

1. **判断是否需要 headless**
   - 有交互状态/键盘/a11y 逻辑（Select、Modal、Tabs…）→ 在 `packages/core/src/<component>/create<Component>.ts` 写框架无关逻辑（见 mvvm-adapter）。
   - 纯展示（Tag、Divider）→ 跳过 core。

2. **写渲染层** `packages/svelte/src/<component>/<Component>.svelte`
   - Svelte 5 runes；用 core 的 prop-getters/状态。
   - 类名前缀 `cd-`，BEM-like；样式只用 token 与原子类，**禁止写死颜色/尺寸**。

3. **注册 Component Token** 到 `packages/tokens/src/components/<component>.ts`，默认引用 Alias 层。

4. **接入横切能力**（逐项命中对应 SKILL）：
   a11y → `../a11y` ｜ i18n → `../i18n` ｜ 主题 → `../theming` ｜ 性能 → `../performance` ｜ 文案 → `../content-guidelines`

5. **导出与按需** 在 `packages/svelte/src/index.ts` 单独 entry 导出，标注 `sideEffects`，确保 tree-shaking。

6. **组件元数据** `component.meta.ts`（见 ai-friendly.spec.md）：props/events/slots/a11y/tokens/examples。

7. **测试**：单测（逻辑分支）+ e2e（关键交互）+ a11y（axe + 键盘）。

8. **文档页**：API 表由 meta 生成；补示例、a11y 说明、设计语义。

## 一致性约定（务必遵守，降低 AI/用户出错）
- 受控值：`value` + `on:change`（输入类）。
- 显隐：`open` + `on:openChange`（浮层类）。
- 尺寸三档：`small | default | large`。
- 校验态：`status: default | warning | error`。
- 事件命名 camelCase、语义化。

## 完成前自检（对照 AGENTS.md §5）
逐条勾 DoD；任一未过不得标记完成。
