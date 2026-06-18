---
name: theming
description: chenzy-design 主题与 Design Token 操作手册。当为组件定义/消费 token、实现暗色模式、品牌色定制、局部主题或处理 UnoCSS preset 时使用。
---

# SKILL · 主题与 Token

> 配套 SPEC：`specs/00-foundation/tokens.spec.md`、`theming.spec.md`。

## 三层心智模型（必记）
Global（原子值 `--cd-blue-5`）→ Alias（语义 `--cd-color-primary`）→ Component（`--cd-button-*`）。
**组件只许消费 Alias / Component，绝不引用 Global，绝不写死值。**

## 给组件加 Token
1. 在 `packages/tokens/src/components/<component>.ts` 定义 `--cd-<component>-*`，默认 `var(--cd-<alias>)`。
2. 组件 CSS 用这些 Component Token；变体/状态切换通过覆盖 Component Token 或加修饰类。

```css
.cd-button { height: var(--cd-button-height-default); background: var(--cd-button-color-bg); }
.cd-button--primary { --cd-button-color-bg: var(--cd-color-primary); }
```

## 暗色模式
只在 Alias 层重映射（`alias/dark.ts` → `[data-theme="dark"]{...}`）。组件不感知。

## 品牌色 / 编译期主题
用 `@chenzy-design/theme-cli`：改 Alias（如 `color-primary`）→ `chenzy-theme build` 产出覆盖 CSS。组件零改动。

## 局部主题
`<ConfigProvider theme={{ 'color-primary': '#f00' }}>` 在子树注入 scoped CSS 变量，不污染全局。

## UnoCSS
token 经 `@chenzy-design/unocss-preset` 暴露为 uno theme + 注入 `tokens.css`，工具类与组件共享同一套变量。

## 检查清单
- [ ] 无写死颜色/间距/圆角/字号 — 全走 token。
- [ ] 新组件 token 已注册并默认引用 Alias。
- [ ] 暗色切换仅靠 Alias 重映射即生效。
- [ ] 动效受 `--cd-motion-*` 控制并尊重 reduced-motion。
