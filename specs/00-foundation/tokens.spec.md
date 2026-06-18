# SPEC · Design Token（@chenzy-design/tokens）

> 需求：主题化基础。Token 是主题、暗色模式、组件样式的**唯一真相源**。
> 配套 SKILL：`.claude/skills/theming/`

## 目标
- 以代码定义全部设计变量，编译产出 CSS 自定义属性、TS 常量、UnoCSS theme 对象。
- 三层架构，组件**只能**消费 Alias / Component Token，禁止引用 Global 原子值或写死。

## 三层 Token 架构

1. **Global Token（基础原子）**：无语义的原始值。
   `--cd-blue-5`, `--cd-spacing-4`(=16px), `--cd-radius-2`, `--cd-font-size-3`。
2. **Alias / Semantic Token（语义别名）**：表达意图，绑定到 Global。
   `--cd-color-primary` → `--cd-blue-5`；`--cd-color-text-0`（主文本）/`-1`/`-2`/`-3`（层级降低）；
   `--cd-color-bg-0..3`、`--cd-color-border`、`--cd-color-success/warning/danger`。
   暗色模式**只重映射这一层**。
3. **Component Token（组件级）**：每个组件定义自己的变量，默认引用 Alias。
   `--cd-button-height-default`, `--cd-button-color-bg-primary` → `var(--cd-color-primary)`。

## 交付物（packages/tokens）
```
src/
  global/    color.ts spacing.ts radius.ts typography.ts shadow.ts motion.ts zIndex.ts
  alias/     light.ts dark.ts            # 语义层，两套主题映射
  components/ button.ts input.ts ...     # 组件级（随组件开发增量补充）
  build.ts                               # 生成 dist/{css,ts,uno}
dist/
  tokens.css        # :root{...}  [data-theme="dark"]{...}
  index.ts          # 类型化常量导出
  uno-theme.ts      # 供 unocss-preset 消费
```

## 命名规则
- 标度类 token 用数字阶梯：`spacing-1..12`、`font-size-1..6`、`radius-1..3`。
- 颜色阶梯 `0..9`（亮→暗或语义强弱），文本/背景层级用 `-0` 起。
- 全部以 `--cd-` 开头（见 AGENTS.md §4）。

## 验收标准
- [ ] 修改一个 Global token 后，所有引用它的 Alias/Component 自动级联变化。
- [ ] 切换 `[data-theme="dark"]` 仅重写 Alias 层即可整体变暗。
- [ ] `dist/index.ts` 提供完整 TS 类型（token key 联合类型）。
- [ ] 无任何组件直接引用 Global token（lint 规则校验）。
- [ ] 支持 RTL 相关逻辑属性（见 a11y/i18n SPEC 的方向性 token）。
