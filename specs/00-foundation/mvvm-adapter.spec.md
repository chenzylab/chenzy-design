# SPEC · 多 MVVM 框架适配能力

> 需求 3。配套 SKILL：`.claude/skills/component-authoring/`（headless 分层规则）

## 核心策略：逻辑与渲染解耦（Headless Core）
组件 = **headless 逻辑（框架无关） + 渲染层（框架特定）**。Svelte 为首发渲染层，但逻辑沉淀在 `@chenzy-design/core`，可被 Vue/React/SolidJS 等其他 MVVM 框架复用。

```
@chenzy-design/core         # 纯 TS，无框架依赖：状态机、a11y 原语、交互逻辑
  createSelect(config) -> { state, getTriggerProps, getOptionProps, ... }
@chenzy-design/svelte       # 用 core + runes 渲染
（未来）@chenzy-design/vue / react  # 复用同一 core
```

## core 的设计契约
- **不 import 任何框架**；不直接操作 DOM（除可选 utils 通过传入引用）。
- 暴露**纯函数 + 状态对象 + props getter**模式（prop-getters），由各渲染层绑定。
- 用框架无关的 observable/store 抽象（轻量 signal），渲染层各自桥接到本框架响应式。
- 所有 a11y 行为（roving tabindex、focus trap、aria 计算）都在 core，保证跨框架一致。

## 渲染层适配层（每框架一份薄封装）
- Svelte：runes 桥接 core 的 signal；prop-getters → `{...}` spread + actions。
- 提供 `bindCore(core)` 帮手统一订阅/清理。

## 样式可移植性
样式基于 token + 原子类，不绑定框架 → 任意渲染层共享同一套 CSS/UnoCSS preset。

## 验收标准
- [ ] `@chenzy-design/core` 0 框架依赖（依赖图校验）。
- [ ] 至少一个复杂组件（如 Select）逻辑完全在 core，Svelte 仅渲染。
- [ ] 提供「如何为新框架接入 core」的适配指南（写入 SKILL）。
- [ ] core 单测不依赖任何 DOM/框架运行时即可通过。
