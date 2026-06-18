# SPEC · 主题化方案

> 需求 2。参考：https://semi.design/blogs/zh-CN/article/Theme
> 依赖：`tokens.spec.md`。配套 SKILL：`.claude/skills/theming/`

## 设计原则
延续 Semi 的思路：**Design Token 驱动 + 多层覆盖**。三种定制粒度并存：
1. **运行时换肤**：切换 `[data-theme]` 与 CSS 变量值，无需重新构建（适合用户偏好、暗色模式）。
2. **编译期定制（主题包）**：通过 `@chenzy-design/theme-cli` 生成一套覆盖 Alias token 的主题包，产物为一份 CSS（覆盖 `:root` 变量）+ 可选 UnoCSS preset 配置。
3. **局部作用域主题**：`<ConfigProvider theme={...}>` 在子树注入一组 CSS 变量，实现页面局部换肤。

## 能力清单
- [ ] **暗色模式**：`data-theme="dark"` 重映射 Alias 层；提供 `system` 跟随系统。
- [ ] **品牌色一键替换**：改 `--cd-color-primary` 系列即可，组件不感知。
- [ ] **主题包机制**：theme-cli 接收覆盖配置 → 输出可分发主题。
- [ ] **局部主题**：ConfigProvider 注入 scoped 变量（不污染全局）。
- [ ] **动效开关**：尊重 `prefers-reduced-motion`，由 `--cd-motion-*` 控制（见 a11y）。

## theme-cli 接口（草案）
```
chenzy-theme init                 # 生成 theme.config.ts
chenzy-theme build                # 产出 dist/theme.css (+ uno preset)
# theme.config.ts
export default defineTheme({
  alias: { 'color-primary': '#0066ff', 'radius-2': '6px' },
  dark:  { 'color-bg-0': '#16161a' },
})
```

## 与 UnoCSS 的关系
`@chenzy-design/unocss-preset` 把 token 暴露为 UnoCSS theme（颜色、间距、圆角等），使工具类与组件共享同一套变量；preset 还注入 `tokens.css`。

## 验收标准
- [ ] 切换暗色无闪烁（FOUC 防护：SSR/首屏内联 theme 脚本）。
- [ ] 替换品牌色不需要改任何组件源码。
- [ ] 局部 ConfigProvider 主题不影响兄弟子树。
- [ ] theme-cli 产物可被任意宿主项目直接引入生效。
